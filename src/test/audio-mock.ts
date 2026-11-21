import { vi } from 'vitest';

/** jsdom has no media playback; this stands in for `new Audio()`. */
export class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  preload = '';
  paused = true;
  ended = false;
  currentTime = 0;
  duration = Number.NaN;
  private source = '';
  /** Source of every play() call, so tests can ignore the silent unlock clip. */
  played: string[] = [];
  play = vi.fn(() => {
    this.played.push(this.source);
    this.paused = false;
    this.ended = false;
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    if (this.paused) return;
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  });
  load = vi.fn();

  constructor() {
    super();
    FakeAudio.instances.push(this);
  }

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value ? new URL(value, 'http://localhost').toString() : '';
  }

  removeAttribute(name: string) {
    if (name === 'src') this.source = '';
  }

  /** Simulates the browser starting playback of the loaded preview. */
  startPlaying(duration = 30) {
    this.duration = duration;
    this.paused = false;
    this.dispatchEvent(new Event('durationchange'));
    this.dispatchEvent(new Event('playing'));
  }

  advanceTo(seconds: number) {
    this.currentTime = seconds;
    this.dispatchEvent(new Event('timeupdate'));
  }

  finish() {
    this.currentTime = this.duration;
    this.paused = true;
    this.ended = true;
    this.dispatchEvent(new Event('ended'));
  }
}

export function installFakeAudio() {
  FakeAudio.instances = [];
  vi.stubGlobal('Audio', FakeAudio);
  return {
    get audio() {
      return FakeAudio.instances.at(-1);
    },
  };
}
