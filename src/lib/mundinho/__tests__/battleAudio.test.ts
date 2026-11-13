import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BattleAudio } from '../battleAudio';
let created: number, started: number, stopped: number;
let starts: number[];
class FakeAudioContext {
  state = 'running';
  private origin = Date.now();
  get currentTime() {
    return (Date.now() - this.origin) / 1000;
  }
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
      start: (time: number) => {
        starts.push(time);
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
  starts = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('Battle audio lifecycle', () => {
  it('plays exploration music and switches scenes without leaving a second loop running', () => {
    const audio = new BattleAudio();
    audio.unlock();
    audio.setWorld(true);
    vi.advanceTimersByTime(430);
    expect(started).toBeGreaterThan(0);
    audio.setWorld(false);
    audio.setBattle(true);
    const before = started;
    vi.advanceTimersByTime(440);
    expect(started - before).toBe(1);
    audio.setBattle(false);
    const exited = started;
    vi.advanceTimersByTime(2000);
    expect(started).toBe(exited);
    audio.dispose();
  });
  it('waits for gesture unlock, then emits music and distinct combat cues', () => {
    const audio = new BattleAudio();
    audio.setEnabled(true);
    audio.setBattle(true);
    audio.play('attack');
    expect(created).toBe(0);
    expect(started).toBe(0);
    audio.unlock();
    const music = started;
    audio.play('attack');
    expect(started).toBe(music + 3);
    audio.play('victory');
    expect(started).toBe(music + 9);
    vi.advanceTimersByTime(440);
    expect(started).toBeGreaterThan(music + 9);
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
  it('schedules the tense boss track on the audio clock, without replaying overdue beats', () => {
    const audio = new BattleAudio();
    audio.unlock();
    audio.setBoss(true);
    expect(started).toBe(3); // Lead, bass and kick start together.
    vi.advanceTimersByTime(325);
    expect(starts.some((time) => Math.abs(time - 0.1) < 0.001)).toBe(true);
    expect(starts.some((time) => Math.abs(time - 0.2) < 0.001)).toBe(true);
    const beforeStall = started;
    vi.setSystemTime(Date.now() + 5000);
    vi.advanceTimersByTime(25);
    expect(started - beforeStall).toBeLessThanOrEqual(3);
    audio.setBoss(false);
    const exited = started;
    vi.advanceTimersByTime(1000);
    expect(started).toBe(exited);
    audio.setBoss(true);
    audio.setEnabled(false);
    const muted = started;
    audio.play('volley');
    vi.advanceTimersByTime(1000);
    expect(started).toBe(muted);
    audio.dispose();
  });
});
