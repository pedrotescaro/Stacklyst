import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BattleAudio } from '../battleAudio';
let created: number, started: number, stopped: number;
class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  constructor() {
    created++;
  }
  resume = async () => {};
  suspend = async () => {};
  close = async () => {};
  createOscillator() {
    return {
      frequency: { setValueAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
      start: () => {
        started++;
      },
      stop: () => {
        stopped++;
      },
      onended: null,
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
      disconnect: () => {},
    };
  }
}
beforeEach(() => {
  vi.useFakeTimers();
  created = started = stopped = 0;
  vi.stubGlobal('AudioContext', FakeAudioContext);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('Battle audio lifecycle', () => {
  it('waits for gesture unlock, then emits music and distinct combat cues', () => {
    const audio = new BattleAudio();
    audio.setEnabled(true);
    audio.setBattle(true);
    audio.play('attack');
    expect(created).toBe(0);
    expect(started).toBe(0);
    audio.unlock();
    audio.play('attack');
    expect(started).toBe(3);
    audio.play('victory');
    expect(started).toBe(9);
    vi.advanceTimersByTime(220);
    expect(started).toBeGreaterThan(9);
    audio.dispose();
  });
  it('stops playback on mute/background and releases the battle loop on exit', () => {
    const audio = new BattleAudio();
    audio.unlock();
    audio.setBattle(true);
    vi.advanceTimersByTime(220);
    expect(started).toBeGreaterThan(0);
    audio.setEnabled(false);
    const count = started;
    vi.advanceTimersByTime(2000);
    audio.play('hit');
    expect(started).toBe(count);
    expect(stopped).toBeGreaterThan(0);
    audio.setEnabled(true);
    audio.setForeground(false);
    const background = started;
    vi.advanceTimersByTime(2000);
    expect(started).toBe(background);
    audio.setForeground(true);
    audio.setBattle(false);
    const exited = started;
    vi.advanceTimersByTime(2000);
    expect(started).toBe(exited);
    audio.dispose();
  });
});
