import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSounds, soundOnset } from '../platform-sounds';
const signal = new Float32Array(1000);
signal[60] = 0.5;
const buffer = {
  length: 1000,
  numberOfChannels: 1,
  sampleRate: 1000,
  getChannelData: () => signal,
} as unknown as AudioBuffer;
let contexts: FakeContext[],
  oscillators: ReturnType<typeof node>[],
  sources: ReturnType<typeof node>[];
function node() {
  return {
    buffer: null,
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  };
}
class FakeContext {
  state = 'running';
  currentTime = 1;
  destination = {};
  constructor() {
    contexts.push(this);
  }
  resume = vi.fn(async () => {
    this.state = 'running';
  });
  decodeAudioData = vi.fn(async () => buffer);
  createBufferSource() {
    const source = node();
    sources.push(source);
    return source;
  }
  createOscillator() {
    const oscillator = node();
    oscillators.push(oscillator);
    return oscillator;
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
}
beforeEach(() => {
  contexts = [];
  oscillators = [];
  sources = [];
  vi.stubGlobal('AudioContext', FakeContext);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) }))
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe('Platform sound timing', () => {
  it('preloads and deduplicates decodes before interaction, then starts at the audible attack', async () => {
    const sounds = new PlatformSounds();
    await Promise.all([sounds.prepare(['like', 'bookmark']), sounds.prepare(['like'])]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(sources).toHaveLength(0);
    expect(oscillators).toHaveLength(0);
    sounds.play('like');
    expect(sources).toHaveLength(1);
    expect(sources[0].start.mock.calls[0][0]).toBe(1);
    expect(sources[0].start.mock.calls[0][1]).toBeCloseTo(0.057);
  });
  it('gives immediate feedback on a cold click and never replays when the download finishes', async () => {
    let complete!: (response: unknown) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          complete = (response) => resolve(response as Response);
        })
    );
    const sounds = new PlatformSounds();
    sounds.play('bookmark');
    expect(oscillators).toHaveLength(2);
    expect(oscillators[0].start).toHaveBeenCalledWith(1);
    complete({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });
    await sounds.prepare(['bookmark']);
    expect(oscillators).toHaveLength(2);
    expect(sources).toHaveLength(0);
    sounds.play('bookmark');
    expect(sources).toHaveLength(1);
  });
  it('drops an old click when the audio device takes too long to resume', async () => {
    vi.useFakeTimers();
    const sounds = new PlatformSounds();
    await sounds.prepare(['like']);
    const ctx = contexts[0];
    ctx.state = 'suspended';
    let resumed!: () => void;
    ctx.resume.mockImplementation(
      () =>
        new Promise((resolve) => {
          resumed = () => {
            ctx.state = 'running';
            resolve();
          };
        })
    );
    sounds.play('like');
    await vi.advanceTimersByTimeAsync(150);
    resumed();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(sources).toHaveLength(0);
    expect(oscillators).toHaveLength(0);
  });
  it('honors a changed preference while resuming and stops active sources on background', async () => {
    const sounds = new PlatformSounds();
    await sounds.prepare(['like']);
    let allowed = true;
    const ctx = contexts[0];
    ctx.state = 'suspended';
    let resumed!: () => void;
    ctx.resume.mockImplementation(
      () =>
        new Promise((resolve) => {
          resumed = () => {
            ctx.state = 'running';
            resolve();
          };
        })
    );
    sounds.play('like', () => allowed);
    allowed = false;
    resumed();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(sources).toHaveLength(0);
    sounds.play('like');
    sounds.stop();
    expect(sources[0].stop).toHaveBeenCalledOnce();
  });
  it('uses the earliest audible channel while preserving the start of clips without silence', () => {
    expect(soundOnset(buffer)).toBeCloseTo(0.057);
    const atStart = new Float32Array([0.1, 0]);
    expect(soundOnset({ ...buffer, length: 2, getChannelData: () => atStart })).toBe(0);
    expect(
      soundOnset({
        ...buffer,
        numberOfChannels: 2,
        getChannelData: (i: number) => (i ? atStart : signal),
      })
    ).toBe(0);
  });
});
