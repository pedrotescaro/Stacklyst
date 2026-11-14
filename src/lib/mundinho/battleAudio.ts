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

// Embedded Blue Star RPG samples, recovered through SOND -> AUDO in data.win.
// The source names and hashes are in public/assets/mundinho/audio/manifest.json.
const CUES: Record<BattleCue, { file: string; volume: number }> = {
  encounter: { file: 'encounter.mp3', volume: 0.28 },
  select: { file: 'select.mp3', volume: 0.22 },
  attack: { file: 'attack.mp3', volume: 0.25 },
  hit: { file: 'hit.mp3', volume: 0.3 },
  miss: { file: 'select.mp3', volume: 0.12 },
  hurt: { file: 'hurt.mp3', volume: 0.3 },
  heal: { file: 'heal.mp3', volume: 0.3 },
  victory: { file: 'victory.mp3', volume: 0.35 },
  defeat: { file: 'defeat.mp3', volume: 0.25 },
  flee: { file: 'flee.mp3', volume: 0.22 },
  volley: { file: 'volley.mp3', volume: 0.16 },
  talk: { file: 'talk.mp3', volume: 0.15 },
  spare: { file: 'flee.mp3', volume: 0.3 },
};

/** Original game audio, decoded once and looped on the audio clock after a gesture. */
export class BattleAudio {
  private context: AudioContext | null = null;
  private enabled = true;
  private foreground = true;
  private battling = false;
  private exploring = false;
  private boss = false;
  private scene: string | null = null;
  private epoch = 0;
  private musicEpoch = 0;
  private resultEpoch = 0;
  private lastSelect = -Infinity;
  private nodes = new Set<AudioBufferSourceNode>();
  private musicNode: AudioBufferSourceNode | null = null;
  private resultNode: AudioBufferSourceNode | null = null;
  private musicFile: string | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private pending = new Map<string, Promise<AudioBuffer | null>>();

  unlock() {
    if (!this.enabled || !this.foreground) return;
    try {
      const Runtime =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Runtime) return;
      this.context ??= new Runtime({ latencyHint: 'interactive' });
      // Resume inside the gesture; downloads/decoding may safely finish later.
      if (this.context.state === 'suspended')
        void this.context
          .resume()
          .then(() => this.updateMusic())
          .catch(() => {});
      else this.updateMusic();
      for (const { file } of Object.values(CUES)) {
        // The longer defeat song is only downloaded if it is actually needed.
        if (file !== 'defeat.mp3') void this.load(file);
      }
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
    if (battling) this.stopResult();
    this.battling = battling;
    this.updateMusic();
  }

  setWorld(exploring: boolean) {
    if (this.exploring === exploring) return;
    if (exploring) this.stopResult();
    this.exploring = exploring;
    this.updateMusic();
  }

  setBoss(boss: boolean) {
    if (this.boss === boss) return;
    if (boss) this.stopResult();
    this.boss = boss;
    this.updateMusic();
  }

  setScene(scene: string) {
    if (this.scene === scene) return;
    this.scene = scene;
    this.stopResult();
  }

  play(cue: BattleCue) {
    // Retrying a fight stays in the same view; end the previous game-over song.
    if (cue === 'encounter' || cue === 'defeat') this.stopResult();
    const ctx = this.context;
    if (!this.enabled || !this.foreground || !ctx) return;
    const epoch = this.epoch,
      resultEpoch = this.resultEpoch,
      requested = performance.now(),
      { file, volume } = CUES[cue];
    const emit = (buffer: AudioBuffer | null) => {
      if (
        !buffer ||
        this.context !== ctx ||
        !this.enabled ||
        !this.foreground ||
        ctx.state !== 'running' ||
        epoch !== this.epoch ||
        (cue === 'defeat' && resultEpoch !== this.resultEpoch) ||
        (cue !== 'defeat' && performance.now() - requested > 250)
      )
        return;
      // Focus and click can confirm the same command in the same frame.
      if (cue === 'select') {
        if (ctx.currentTime - this.lastSelect < 0.045) return;
        this.lastSelect = ctx.currentTime;
      }
      // Bound overlapping boss volleys and rapid combat effects.
      if (this.nodes.size >= 12) {
        const oldest = this.nodes.values().next().value;
        if (oldest) {
          this.nodes.delete(oldest);
          oldest.stop();
        }
      }
      const source = this.start(buffer, volume, false);
      if (cue === 'defeat') this.resultNode = source;
    };
    const ready = this.buffers.get(file);
    if (ctx.state === 'running' && ready) emit(ready);
    else {
      const resumed = ctx.state === 'running' ? Promise.resolve() : ctx.resume();
      void resumed
        .then(() => this.load(file))
        .then(emit)
        .catch(() => {});
    }
  }

  private load(file: string): Promise<AudioBuffer | null> {
    const ready = this.buffers.get(file);
    if (ready) return Promise.resolve(ready);
    const waiting = this.pending.get(file);
    if (waiting) return waiting;
    const ctx = this.context;
    if (!ctx) return Promise.resolve(null);
    const bundled = (
      globalThis as typeof globalThis & { __MUNDINHO_ASSETS__?: Record<string, string> }
    ).__MUNDINHO_ASSETS__?.[`audio/${file}`];
    const bytes = bundled
      ? Promise.resolve().then(() => {
          // Decode native's offline data directly, preserving connect-src 'none'.
          const binary = atob(bundled.slice(bundled.indexOf(',') + 1));
          return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
        })
      : Promise.resolve().then(async () => {
          const response = await fetch(`/assets/mundinho/audio/${file}`);
          if (!response.ok) throw new Error('Audio unavailable');
          return response.arrayBuffer();
        });
    const task = bytes
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        if (this.context !== ctx) return null;
        this.buffers.set(file, buffer);
        return buffer;
      })
      .catch(() => null)
      .finally(() => {
        if (this.pending.get(file) === task) this.pending.delete(file);
      });
    this.pending.set(file, task);
    return task;
  }

  private start(buffer: AudioBuffer, volume: number, loop: boolean) {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running') return null;
    const source = ctx.createBufferSource(),
      gain = ctx.createGain();
    source.buffer = buffer;
    source.loop = loop;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    source.connect(gain);
    gain.connect(ctx.destination);
    if (!loop) this.nodes.add(source);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      this.nodes.delete(source);
      if (this.resultNode === source) this.resultNode = null;
    };
    source.start();
    return source;
  }

  private updateMusic() {
    const file = this.boss ? 'boss.mp3' : this.battling || this.exploring ? 'world.mp3' : null;
    if (!file || !this.enabled || !this.foreground || this.context?.state !== 'running') {
      this.stopMusic();
      return;
    }
    if (this.musicFile === file) return;
    this.stopMusic();
    this.musicFile = file;
    const epoch = this.musicEpoch;
    void this.load(file).then((buffer) => {
      // A pending world download must not start over an already-entered boss.
      if (epoch !== this.musicEpoch || this.musicFile !== file) return;
      if (!buffer) {
        // Retry on the next gesture if a download or audio decode failed.
        this.musicFile = null;
        return;
      }
      if (this.musicFile !== file || !this.enabled || !this.foreground) return;
      this.musicNode = this.start(buffer, file === 'boss.mp3' ? 0.24 : 0.2, true);
    });
  }

  private stopMusic() {
    this.musicEpoch++;
    this.musicFile = null;
    if (this.musicNode) {
      this.musicNode.stop();
      this.musicNode = null;
    }
  }

  private stop() {
    this.stopMusic();
    this.stopCues();
  }

  private stopCues() {
    this.epoch++;
    this.resultEpoch++;
    this.resultNode = null;
    this.lastSelect = -Infinity;
    for (const node of this.nodes) node.stop();
    this.nodes.clear();
  }

  private stopResult() {
    this.resultEpoch++;
    if (this.resultNode) {
      this.nodes.delete(this.resultNode);
      this.resultNode.stop();
      this.resultNode = null;
    }
  }

  dispose() {
    this.stop();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
    this.buffers.clear();
    this.pending.clear();
  }
}
