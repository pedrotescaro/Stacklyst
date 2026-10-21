import { calculateLevel } from '../../../../src/lib/learning/rewards';

export const SOUND_PREFERENCE_KEY = 'stacklyst-sound';
export type ActivitySound =
  | 'quiz_correct'
  | 'quiz_incorrect'
  | 'lesson_completed'
  | 'levelup'
  | 'xpgain';

export type ConfirmedActivityResult = {
  isCorrect?: boolean;
  passed?: boolean;
  xpEarned?: number;
  firstCompletion?: boolean;
  totalXp?: number;
  lessonCompleted?: boolean;
  xpResult?: { newXp: number; newLevel: number } | null;
};

/** Feedback follows a server response; reviews keep feedback without reward celebrations. */
export function confirmedActivitySounds(
  result: ConfirmedActivityResult,
  action: 'run' | 'submit',
  review = false
): ActivitySound[] {
  if (action !== 'submit') return [];
  const correct = result.passed ?? result.isCorrect;
  if (correct === false) return ['quiz_incorrect'];
  if (correct !== true) return [];
  const sounds: ActivitySound[] = ['quiz_correct'];
  if (review || result.firstCompletion === false) return sounds;
  const xp = result.xpEarned ?? 0;
  if (xp > 0) {
    // The server's authoritative XP totals determine the cue, never local rewards.
    const total = result.xpResult?.newXp ?? result.totalXp;
    const level = result.xpResult?.newLevel;
    if (
      typeof total === 'number' &&
      Number.isFinite(total) &&
      (level ?? calculateLevel(total).level) > calculateLevel(total - xp).level
    )
      sounds.push('levelup');
    else sounds.push('xpgain');
  }
  return sounds;
}

type Subscription = { remove: () => void };
export type SoundPlayer = {
  volume: number;
  play: () => void;
  pause: () => void;
  remove: () => void;
  addListener: (
    event: 'playbackStatusUpdate',
    callback: (status: { didJustFinish: boolean; error?: string | null }) => void
  ) => Subscription;
};
type Runtime = {
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
  };
  prepare: () => Promise<void>;
  createPlayer: (sound: ActivitySound) => SoundPlayer;
};

/** One short foreground-only channel, with explicit ownership of every native player. */
export class SoundEffectsController {
  private snapshot = { enabled: true, ready: false, preferenceError: false };
  private listeners = new Set<() => void>();
  private player?: SoundPlayer;
  private listener?: Subscription;
  private timeout?: ReturnType<typeof setTimeout>;
  private foreground = true;
  private generation = 0;
  private preferenceRevision = 0;
  private writes = Promise.resolve();
  private seen = new Set<string>();

  constructor(private runtime: Runtime) {}

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(value: Partial<typeof this.snapshot>) {
    this.snapshot = { ...this.snapshot, ...value };
    this.listeners.forEach((listener) => listener());
  }

  async restore() {
    const revision = this.preferenceRevision;
    try {
      const value = await this.runtime.storage.getItem(SOUND_PREFERENCE_KEY);
      if (revision === this.preferenceRevision) this.update({ enabled: value !== 'false' });
    } catch {
      // Storage failure leaves the default available without blocking an activity.
    } finally {
      this.update({ ready: true });
    }
  }

  setEnabled = (enabled: boolean) => {
    this.preferenceRevision += 1;
    this.update({ enabled, preferenceError: false });
    if (!enabled) this.stop();
    this.writes = this.writes
      .catch(() => undefined)
      .then(() => this.runtime.storage.setItem(SOUND_PREFERENCE_KEY, String(enabled)))
      .catch(() => {
        this.update({ preferenceError: true });
      });
  };

  setForeground = (foreground: boolean) => {
    this.foreground = foreground;
    if (!foreground) this.stop();
  };

  private release() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
    const listener = this.listener;
    const player = this.player;
    this.listener = undefined;
    this.player = undefined;
    try {
      listener?.remove();
    } catch {
      /* A failed sound must never block practice. */
    }
    try {
      player?.pause();
    } catch {
      /* Player may already have been released by the OS. */
    }
    try {
      player?.remove();
    } catch {
      /* Best-effort native resource cleanup. */
    }
  }

  stop = () => {
    this.generation += 1;
    this.release();
  };

  playSequence = (sounds: readonly ActivitySound[], eventKey: string) => {
    if (
      !sounds.length ||
      !this.snapshot.ready ||
      !this.snapshot.enabled ||
      !this.foreground ||
      this.seen.has(eventKey)
    )
      return;
    this.seen.add(eventKey);
    if (this.seen.size > 256) this.seen.delete(this.seen.values().next().value!);
    this.stop();
    const generation = this.generation;
    const active = () => generation === this.generation && this.snapshot.enabled && this.foreground;
    const next = (index: number) => {
      if (!active() || index >= sounds.length) return;
      try {
        const player = this.runtime.createPlayer(sounds[index]);
        this.player = player;
        player.volume = 0.35;
        let finished = false;
        const finish = () => {
          if (finished || !active()) return;
          finished = true;
          this.release();
          next(index + 1);
        };
        this.listener = player.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish || status.error) finish();
        });
        // Corrupt assets or native loading failures cannot leave an indefinite player.
        this.timeout = setTimeout(finish, 7000);
        player.play();
      } catch {
        this.release();
      }
    };
    void this.runtime
      .prepare()
      .then(() => next(0))
      .catch(() => undefined);
  };

  playSound = (sound: ActivitySound, eventKey: string) => this.playSequence([sound], eventKey);
}
