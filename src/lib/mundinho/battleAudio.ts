export type BattleCue =
  | 'encounter'
  | 'select'
  | 'attack'
  | 'hit'
  | 'miss'
  | 'hurt'
  | 'heal'
  | 'victory'
  | 'defeat'
  | 'flee'
  | 'volley'
  | 'talk'
  | 'spare';
const CUES: Record<BattleCue, number[]> = {
  encounter: [220, 330, 440, 660],
  select: [660, 880],
  attack: [880, 440, 220],
  hit: [110, 75],
  miss: [180, 140],
  hurt: [150, 95],
  heal: [440, 554, 660],
  victory: [523, 659, 784, 1047, 784, 1047],
  defeat: [330, 294, 247, 165],
  flee: [660, 494, 330, 220],
  volley: [1245, 622],
  talk: [330, 392],
  spare: [330, 440, 554, 660],
};
/** Offline chiptune channel. Unlock inside the gesture, then schedule on the audio clock. */
export class BattleAudio {
  private context: AudioContext | null = null;
  private enabled = true;
  private foreground = true;
  private battling = false;
  private exploring = false;
  private boss = false;
  private loop: ReturnType<typeof setInterval> | null = null;
  private beat = 0;
  private nextNote = 0;
  private epoch = 0;
  private lastSelect = -Infinity;
  private nodes = new Set<OscillatorNode>();
  private musicNodes = new Set<OscillatorNode>();
  unlock() {
    if (!this.enabled || !this.foreground) return;
    try {
      const Runtime =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Runtime) return;
      this.context ??= new Runtime({ latencyHint: 'interactive' });
      if (this.context.state === 'suspended')
        void this.context
          .resume()
          .then(() => this.updateLoop())
          .catch(() => {});
      else this.updateLoop();
    } catch {
      /* Missing audio never blocks combat. */
    }
  }
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
    else if (this.context) this.unlock();
  }
  setForeground(foreground: boolean) {
    this.foreground = foreground;
    if (!foreground) {
      this.stop();
      void this.context?.suspend().catch(() => {});
    } else if (this.context) this.unlock();
  }
  setBattle(battling: boolean) {
    if (this.battling === battling) return;
    this.stopMusic();
    this.battling = battling;
    this.updateLoop();
  }
  setWorld(exploring: boolean) {
    if (this.exploring === exploring) return;
    this.stopMusic();
    this.exploring = exploring;
    this.updateLoop();
  }
  setBoss(boss: boolean) {
    if (this.boss === boss) return;
    this.stopMusic();
    this.boss = boss;
    this.updateLoop();
  }
  play(cue: BattleCue) {
    const ctx = this.context;
    if (!this.enabled || !this.foreground || !ctx) return;
    const epoch = this.epoch,
      requested = performance.now();
    const emit = () => {
      if (
        !this.enabled ||
        !this.foreground ||
        ctx.state !== 'running' ||
        epoch !== this.epoch ||
        performance.now() - requested > 120
      )
        return;
      // Focus and click can confirm the same command in the same frame.
      if (cue === 'select') {
        if (ctx.currentTime - this.lastSelect < 0.045) return;
        this.lastSelect = ctx.currentTime;
      }
      const volley = cue === 'volley';
      CUES[cue].forEach((frequency, i) =>
        this.tone(
          frequency,
          i * (volley ? 0.025 : 0.065),
          volley ? 0.045 : 0.12,
          volley ? 0.018 : 0.055,
          cue === 'hit' || cue === 'hurt' ? 'sawtooth' : 'triangle'
        )
      );
    };
    if (ctx.state === 'running') emit();
    else
      void ctx
        .resume()
        .then(emit)
        .catch(() => {});
  }
  private tone(
    frequency: number,
    delay: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'triangle',
    music = false
  ) {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running') return;
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain(),
      time = ctx.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    this.nodes.add(oscillator);
    if (music) this.musicNodes.add(oscillator);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.nodes.delete(oscillator);
      this.musicNodes.delete(oscillator);
    };
    oscillator.start(time);
    oscillator.stop(time + duration + 0.01);
  }
  private updateLoop() {
    if (
      (!this.battling && !this.exploring && !this.boss) ||
      !this.enabled ||
      !this.foreground ||
      this.context?.state !== 'running'
    )
      return;
    if (this.loop) return;
    this.nextNote = this.context.currentTime;
    const schedule = () => {
      const ctx = this.context;
      if (!ctx || ctx.state !== 'running') return;
      // Small lookahead keeps the rhythm stable across rendering/API work, without
      // queuing a burst of overdue notes after a stalled or backgrounded tab.
      if (this.nextNote < ctx.currentTime - 0.05) this.nextNote = ctx.currentTime;
      const step = this.boss ? 0.1 : this.battling ? 0.22 : 0.43;
      while (this.nextNote < ctx.currentTime + 0.08) {
        const delay = Math.max(0, this.nextNote - ctx.currentTime),
          beat = this.beat++;
        if (this.boss) {
          // Original minor/phrygian ostinato at 150 BPM, with bass and percussion.
          const lead = [
            330, 349, 494, 659, 494, 349, 330, 247, 294, 330, 440, 587, 440, 330, 294, 247,
          ];
          const bass = [82.41, 82.41, 73.42, 87.31][Math.floor(beat / 16) % 4];
          this.tone(lead[beat % 16], delay, 0.075, 0.013, 'square', true);
          if (beat % 4 === 0) {
            this.tone(bass, delay, 0.27, 0.032, 'triangle', true);
            this.tone(55, delay, 0.065, 0.025, 'sine', true);
          }
          if (beat % 4 === 2) this.tone(1760, delay, 0.025, 0.007, 'square', true);
        } else {
          const melody = this.battling
            ? [262, 0, 392, 330, 294, 0, 440, 392, 262, 330, 392, 523, 494, 392, 330, 294]
            : [262, 330, 392, 0, 330, 294, 262, 0, 220, 262, 330, 392, 330, 294, 262, 0];
          const note = melody[beat % melody.length];
          if (note)
            this.tone(
              note,
              delay,
              this.battling ? 0.15 : 0.48,
              this.battling ? 0.014 : 0.018,
              this.battling ? 'triangle' : 'sine',
              true
            );
          if ((beat + 1) % 4 === 0) this.tone(131, delay, 0.2, 0.02, 'sine', true);
        }
        this.nextNote += step;
      }
    };
    schedule();
    this.loop = setInterval(schedule, 25);
  }
  private stopMusic() {
    if (this.loop) clearInterval(this.loop);
    this.loop = null;
    this.beat = 0;
    for (const node of this.musicNodes) {
      try {
        node.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.musicNodes.clear();
  }
  private stop() {
    this.epoch++;
    this.stopMusic();
    this.lastSelect = -Infinity;
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.nodes.clear();
  }
  dispose() {
    this.stop();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
  }
}
