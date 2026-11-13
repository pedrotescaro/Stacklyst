export type SoundType =
  | 'post'
  | 'like'
  | 'levelup'
  | 'quiz_correct'
  | 'quiz_incorrect'
  | 'lesson_completed'
  | 'task_completed'
  | 'xpgain'
  | 'bookmark'
  | 'send_dm'
  | 'notification';
const FILES: Record<SoundType, string> = {
  post: 'Post_Sound.ogg',
  like: 'Like_sound.mp3',
  levelup: 'LevelUp_Sound.mp3',
  quiz_correct: 'RightAnswer_Sound.mp3',
  quiz_incorrect: 'WrongAnswer_Sound.mp3',
  lesson_completed: 'LessonComplete_Sound.mp3',
  task_completed: 'LessonComplete_Sound.mp3',
  xpgain: 'XpGain_Sound.mp3',
  bookmark: 'bookmark_Sound.mp3',
  send_dm: 'SendDM_Sound.ogg',
  notification: 'Notification_Sound.ogg',
};
/** Skip encoded leading silence, retaining a short attack margin to avoid clicks. */
export function soundOnset(buffer: AudioBuffer) {
  let first = buffer.length;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let i = 0; i < first; i++)
      if (Math.abs(samples[i]) > 0.005) {
        first = i;
        break;
      }
  }
  return first === buffer.length ? 0 : Math.max(0, first / buffer.sampleRate - 0.003);
}

/** Assets decode before interaction. A cold click gets immediate synthesized feedback,
 * never a second, late sound when a download or decoder eventually finishes. */
export class PlatformSounds {
  private context: AudioContext | null = null;
  private buffers = new Map<string, { buffer: AudioBuffer; offset: number }>();
  private pending = new Map<string, Promise<void>>();
  private nodes = new Set<AudioScheduledSourceNode>();
  private revision = 0;
  private resuming: Promise<void> | null = null;
  private getContext() {
    if (typeof window === 'undefined') return null;
    try {
      const Runtime =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Runtime) this.context ??= new Runtime({ latencyHint: 'interactive' });
    } catch {
      /* Unsupported audio must not block the action. */
    }
    return this.context;
  }
  unlock() {
    const ctx = this.getContext();
    if (!ctx || ctx.state === 'running') return Promise.resolve();
    if (!this.resuming)
      this.resuming = ctx
        .resume()
        .catch(() => {})
        .finally(() => {
          this.resuming = null;
        });
    return this.resuming;
  }
  prepare(types: SoundType[] = Object.keys(FILES) as SoundType[]) {
    const ctx = this.getContext();
    if (!ctx) return Promise.resolve();
    return Promise.all(
      types.map((type) => {
        const file = FILES[type];
        if (this.buffers.has(file)) return Promise.resolve();
        const existing = this.pending.get(file);
        if (existing) return existing;
        const work = (async () => {
          try {
            const response = await fetch(`/sounds/${file}`);
            if (!response.ok) return;
            const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
            this.buffers.set(file, { buffer, offset: soundOnset(buffer) });
          } catch {
            /* Use the immediate local cue while unavailable. */
          } finally {
            this.pending.delete(file);
          }
        })();
        this.pending.set(file, work);
        return work;
      })
    ).then(() => {});
  }
  play(type: SoundType, permitted: () => boolean = () => true) {
    if (!permitted() || (typeof document !== 'undefined' && document.hidden)) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const revision = ++this.revision,
      requested = performance.now();
    const start = () => {
      if (
        revision !== this.revision ||
        !permitted() ||
        document.hidden ||
        ctx.state !== 'running' ||
        performance.now() - requested > 120
      )
        return;
      try {
        this.emit(ctx, type);
      } catch {
        /* Keep the user action independent of audio. */
      }
    };
    if (ctx.state === 'running') start();
    else void this.unlock().then(start);
    void this.prepare([type]);
  }
  private track(node: AudioScheduledSourceNode, gain?: GainNode) {
    this.nodes.add(node);
    node.onended = () => {
      node.disconnect();
      gain?.disconnect();
      this.nodes.delete(node);
    };
  }
  private emit(ctx: AudioContext, type: SoundType) {
    const decoded = this.buffers.get(FILES[type]);
    // Keep the short quiz cues; long recorded rewards play only when already decoded.
    if (decoded && type !== 'quiz_correct' && type !== 'quiz_incorrect') {
      const source = ctx.createBufferSource();
      source.buffer = decoded.buffer;
      source.connect(ctx.destination);
      this.track(source);
      source.start(ctx.currentTime, decoded.offset);
      return;
    }
    const frequencies =
      type === 'quiz_incorrect'
        ? [220, 160]
        : type === 'quiz_correct'
          ? [659.25, 880, 1318.51]
          : type === 'bookmark'
            ? [784, 1047]
            : type === 'like'
              ? [660, 880]
              : [523, 784];
    frequencies.forEach((frequency, i) => {
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain(),
        time = ctx.currentTime + i * 0.045;
      oscillator.type = type === 'quiz_incorrect' ? 'sawtooth' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      this.track(oscillator, gain);
      oscillator.start(time);
      oscillator.stop(time + 0.13);
    });
  }
  stop() {
    this.revision++;
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {
        /* Already finished. */
      }
    }
    this.nodes.clear();
  }
}
