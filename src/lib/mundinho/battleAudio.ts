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
  | 'flee';
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
};
/** Offline chiptune channel. Context is unlocked inside a pointer/key gesture, before API awaits. */
export class BattleAudio {
  private context: AudioContext | null = null;
  private enabled = true;
  private foreground = true;
  private battling = false;
  private exploring = false;
  private loop: ReturnType<typeof setInterval> | null = null;
  private beat = 0;
  private nodes = new Set<OscillatorNode>();
  unlock() {
    if (!this.enabled || !this.foreground) return;
    try {
      const Runtime =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Runtime) return;
      this.context ??= new Runtime();
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {});
      this.updateLoop();
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
    if (this.battling !== battling) {
      if (this.loop) clearInterval(this.loop);
      this.loop = null;
      this.beat = 0;
    }
    this.battling = battling;
    this.updateLoop();
  }
  setWorld(exploring: boolean) {
    if (this.exploring !== exploring) {
      if (this.loop) clearInterval(this.loop);
      this.loop = null;
      this.beat = 0;
    }
    this.exploring = exploring;
    this.updateLoop();
  }
  play(cue: BattleCue) {
    if (!this.enabled || !this.foreground || this.context?.state !== 'running') return;
    CUES[cue].forEach((frequency, i) =>
      this.tone(
        frequency,
        i * 0.085,
        0.13,
        0.055,
        cue === 'hit' || cue === 'hurt' ? 'sawtooth' : 'triangle'
      )
    );
  }
  private tone(
    frequency: number,
    delay: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'triangle'
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
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      this.nodes.delete(oscillator);
    };
    oscillator.start(time);
    oscillator.stop(time + duration + 0.01);
  }
  private updateLoop() {
    if ((!this.battling && !this.exploring) || !this.enabled || !this.foreground || !this.context) {
      if (this.loop) clearInterval(this.loop);
      this.loop = null;
      return;
    }
    if (this.loop) return;
    const melody = this.battling
      ? [262, 0, 392, 330, 294, 0, 440, 392, 262, 330, 392, 523, 494, 392, 330, 294]
      : [262, 330, 392, 0, 330, 294, 262, 0, 220, 262, 330, 392, 330, 294, 262, 0];
    this.loop = setInterval(
      () => {
        if (this.context?.state !== 'running') return;
        const note = melody[this.beat++ % melody.length];
        if (note)
          this.tone(
            note,
            0,
            this.battling ? 0.15 : 0.48,
            this.battling ? 0.014 : 0.018,
            this.battling ? 'triangle' : 'sine'
          );
        if (this.beat % 4 === 0) this.tone(131, 0, 0.2, 0.02, 'sine');
      },
      this.battling ? 220 : 430
    );
  }
  private stop() {
    if (this.loop) clearInterval(this.loop);
    this.loop = null;
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
