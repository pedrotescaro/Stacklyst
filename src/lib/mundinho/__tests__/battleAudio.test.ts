import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { BattleAudio, type BattleCue } from '../battleAudio';

const encode = (value: string) => new TextEncoder().encode(value).buffer;
let contexts: FakeAudioContext[];
let fetchAudio: Mock<
  (url: string) => Promise<{ ok: boolean; arrayBuffer?: () => Promise<ArrayBuffer> }>
>;
let sources: FakeSource[];

class FakeSource {
  buffer: { name: string } | null = null;
  loop = false;
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn(() => this.onended?.());
}

class FakeAudioContext {
  state = 'running';
  private origin = Date.now();
  get currentTime() {
    return (Date.now() - this.origin) / 1000;
  }
  destination = {};
  constructor() {
    contexts.push(this);
  }
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  close = vi.fn(async () => {
    this.state = 'closed';
  });
  decodeAudioData = vi.fn(async (bytes: ArrayBuffer) => ({
    name: new TextDecoder().decode(bytes).split('/').pop()!,
  }));
  createBufferSource() {
    const source = new FakeSource();
    sources.push(source);
    return source;
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
}

async function settle() {
  for (let i = 0; i < 16; i++) await Promise.resolve();
}

function deferDownload(file: string) {
  let finish!: () => void;
  const wait = new Promise<void>((resolve) => (finish = resolve));
  const original = fetchAudio.getMockImplementation()!;
  fetchAudio.mockImplementation(async (url: string) => {
    if (url.endsWith(`/${file}`)) await wait;
    return original(url);
  });
  return async () => {
    finish();
    await settle();
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  contexts = [];
  sources = [];
  fetchAudio = vi.fn(async (url: string) => ({
    ok: true,
    arrayBuffer: async () => encode(url),
  }));
  vi.stubGlobal('fetch', fetchAudio);
  vi.stubGlobal('AudioContext', FakeAudioContext);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Blue Star audio lifecycle', () => {
  it('waits for a gesture before opening audio or downloading samples', async () => {
    const audio = new BattleAudio();
    audio.setWorld(true);
    audio.setBoss(true);
    audio.play('attack');
    await settle();
    expect(contexts).toHaveLength(0);
    expect(fetchAudio).not.toHaveBeenCalled();
    audio.unlock();
    await settle();
    expect(contexts).toHaveLength(1);
    expect(sources.filter((source) => source.loop).map((source) => source.buffer?.name)).toEqual([
      'boss.mp3',
    ]);
    audio.dispose();
  });

  it('uses the real world/boss songs with one loop and restores the world after the boss', async () => {
    const audio = new BattleAudio();
    audio.unlock();
    audio.setWorld(true);
    await settle();
    const world = sources[0];
    expect(world.buffer?.name).toBe('world.mp3');
    expect(world.loop).toBe(true);
    audio.setBattle(true);
    audio.setWorld(false);
    await settle();
    expect(sources).toHaveLength(1); // Ordinary battles share the original world song.
    audio.setBoss(true);
    await settle();
    expect(world.stop).toHaveBeenCalledOnce();
    const boss = sources[1];
    expect(boss.buffer?.name).toBe('boss.mp3');
    expect(boss.loop).toBe(true);
    audio.setBoss(false);
    await settle();
    expect(boss.stop).toHaveBeenCalledOnce();
    expect(sources[2].buffer?.name).toBe('world.mp3');
    audio.setBattle(false);
    expect(sources[2].stop).toHaveBeenCalledOnce();
    expect(fetchAudio.mock.calls.filter(([url]) => url.endsWith('/world.mp3'))).toHaveLength(1);
    audio.dispose();
  });

  it('plays original effects for every action and deduplicates a focused click', async () => {
    const audio = new BattleAudio();
    audio.unlock();
    await settle();
    audio.play('select');
    audio.play('select');
    expect(sources.map((source) => source.buffer?.name)).toEqual(['select.mp3']);
    const cues: BattleCue[] = [
      'encounter',
      'attack',
      'hit',
      'miss',
      'hurt',
      'heal',
      'victory',
      'flee',
      'volley',
      'talk',
      'spare',
    ];
    for (const cue of cues) audio.play(cue);
    expect(sources.slice(1).map((source) => source.buffer?.name)).toEqual([
      'encounter.mp3',
      'attack.mp3',
      'hit.mp3',
      'select.mp3',
      'hurt.mp3',
      'heal.mp3',
      'victory.mp3',
      'flee.mp3',
      'volley.mp3',
      'talk.mp3',
      'flee.mp3',
    ]);
    expect(sources.every((source) => !source.loop && source.start.mock.calls.length === 1)).toBe(
      true
    );
    audio.dispose();
  });

  it('does not let a delayed world download play over the boss or after a pause', async () => {
    const finishWorld = deferDownload('world.mp3');
    const audio = new BattleAudio();
    audio.unlock();
    audio.setWorld(true);
    await settle();
    audio.setBoss(true);
    await settle();
    expect(sources.map((source) => source.buffer?.name)).toEqual(['boss.mp3']);
    await finishWorld();
    expect(sources).toHaveLength(1);
    audio.setWorld(false);
    audio.setBoss(false);
    expect(sources[0].stop).toHaveBeenCalledOnce();
    audio.dispose();
  });

  it('cancels pending boss playback when the encounter is left before decoding finishes', async () => {
    const finishBoss = deferDownload('boss.mp3');
    const audio = new BattleAudio();
    audio.unlock();
    audio.setBoss(true);
    await settle();
    audio.setBoss(false);
    await finishBoss();
    expect(sources).toHaveLength(0);
    audio.dispose();
  });

  it('mutes every channel, suspends in the background and releases sources/context on disposal', async () => {
    const audio = new BattleAudio();
    audio.unlock();
    audio.setBoss(true);
    await settle();
    audio.play('volley');
    audio.setEnabled(false);
    expect(sources.every((source) => source.stop.mock.calls.length === 1)).toBe(true);
    audio.play('hurt');
    await settle();
    expect(sources).toHaveLength(2);
    audio.setEnabled(true);
    await settle();
    expect(sources[2].buffer?.name).toBe('boss.mp3');
    audio.setForeground(false);
    expect(contexts[0].suspend).toHaveBeenCalledOnce();
    const count = sources.length;
    audio.play('hurt');
    vi.advanceTimersByTime(5000);
    await settle();
    expect(sources).toHaveLength(count);
    audio.setForeground(true);
    await settle();
    expect(sources[count].buffer?.name).toBe('boss.mp3');
    expect(contexts[0].resume).toHaveBeenCalledOnce();
    audio.dispose();
    expect(sources.every((source) => source.stop.mock.calls.length === 1)).toBe(true);
    expect(contexts[0].close).toHaveBeenCalledOnce();
  });

  it('waits for the longer game-over download but stops it when navigating to another scene', async () => {
    const finishDefeat = deferDownload('defeat.mp3');
    const audio = new BattleAudio();
    audio.setScene('battle');
    audio.unlock();
    audio.play('defeat');
    await settle();
    vi.advanceTimersByTime(1500);
    await finishDefeat();
    expect(sources.map((source) => source.buffer?.name)).toEqual(['defeat.mp3']);
    audio.setScene('battle');
    expect(sources[0].stop).not.toHaveBeenCalled();
    audio.setScene('world');
    expect(sources[0].stop).toHaveBeenCalledOnce();
    audio.dispose();
  });

  it('cancels pending result/effect playback on navigation and drops stale combat sounds', async () => {
    const finishDefeat = deferDownload('defeat.mp3');
    const finishAttack = deferDownload('attack.mp3');
    const audio = new BattleAudio();
    audio.setScene('boss');
    audio.unlock();
    audio.play('defeat');
    audio.play('attack');
    await settle();
    audio.setScene('world');
    await finishDefeat();
    vi.advanceTimersByTime(1000);
    await finishAttack();
    expect(sources).toHaveLength(0);
    audio.dispose();

    const finishHit = deferDownload('hit.mp3');
    const other = new BattleAudio();
    other.unlock();
    other.play('hit');
    await settle();
    vi.advanceTimersByTime(1000);
    await finishHit();
    expect(sources).toHaveLength(0);
    other.dispose();
  });

  it('preserves encounter/flee cues across navigation while cancelling game over on a retry', async () => {
    const audio = new BattleAudio();
    audio.setScene('world');
    audio.unlock();
    await settle();
    audio.play('encounter');
    const encounter = sources.at(-1)!;
    audio.setScene('battle');
    expect(encounter.stop).not.toHaveBeenCalled();
    audio.play('flee');
    const flee = sources.at(-1)!;
    audio.setScene('world');
    expect(flee.stop).not.toHaveBeenCalled();

    audio.setScene('boss');
    audio.play('defeat');
    await settle();
    const defeat = sources.at(-1)!;
    expect(defeat.buffer?.name).toBe('defeat.mp3');
    audio.setScene('boss'); // Retry retains the same view.
    expect(defeat.stop).not.toHaveBeenCalled();
    audio.play('encounter');
    expect(defeat.stop).toHaveBeenCalledOnce();

    audio.play('defeat');
    const secondDefeat = sources.at(-1)!;
    audio.setBattle(true); // Ordinary battle retry also replaces the result song.
    expect(secondDefeat.stop).toHaveBeenCalledOnce();
    audio.play('defeat');
    const thirdDefeat = sources.at(-1)!;
    audio.setBoss(true);
    expect(thirdDefeat.stop).toHaveBeenCalledOnce();
    audio.dispose();
  });

  it('retries a failed music download on the next gesture without affecting combat', async () => {
    fetchAudio.mockImplementationOnce(async () => ({ ok: false }));
    const audio = new BattleAudio();
    audio.setBoss(true);
    audio.unlock();
    await settle();
    expect(sources).toHaveLength(0);
    audio.unlock();
    await settle();
    expect(sources[0].buffer?.name).toBe('boss.mp3');
    audio.dispose();
  });

  it('uses native embedded audio without a network connection or a relaxed CSP', async () => {
    const manifest = JSON.parse(readFileSync('public/assets/mundinho/audio/manifest.json', 'utf8'));
    const bundled = Object.fromEntries(
      manifest.assets.map(({ file }: { file: string }) => [
        `audio/${file}`,
        `data:audio/mpeg;base64,${btoa(file)}`,
      ])
    );
    vi.stubGlobal('__MUNDINHO_ASSETS__', bundled);
    const audio = new BattleAudio();
    audio.setBoss(true);
    audio.unlock();
    await settle();
    audio.play('attack');
    expect(sources.map((source) => source.buffer?.name)).toEqual(['boss.mp3', 'attack.mp3']);
    expect(fetchAudio).not.toHaveBeenCalled();
    audio.dispose();
  });

  it('ships the recovered boss/world songs and every sample with matching provenance hashes', () => {
    const manifest = JSON.parse(readFileSync('public/assets/mundinho/audio/manifest.json', 'utf8'));
    expect(manifest.assets).toHaveLength(13);
    expect(manifest.assets.find(({ file }: { file: string }) => file === 'boss.mp3')).toMatchObject(
      {
        name: 'boss_ta_legal',
        soundIndex: 19,
        audioIndex: 1,
      }
    );
    expect(
      manifest.assets.find(({ file }: { file: string }) => file === 'world.mp3')
    ).toMatchObject({
      name: 'musica_muito_balaco_baco',
      soundIndex: 17,
      audioIndex: 14,
    });
    for (const asset of manifest.assets) {
      const bytes = readFileSync(`public/assets/mundinho/audio/${asset.file}`);
      expect(bytes.length).toBe(asset.bytes);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.sha256);
    }
  });
});
