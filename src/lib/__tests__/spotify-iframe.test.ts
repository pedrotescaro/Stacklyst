import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { loadSpotifyIframeApi, type SpotifyIframeApi } from '../spotify-iframe';

type TestWindow = Window & {
  SpotifyIframeApi?: SpotifyIframeApi;
  onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
};
const spotifyWindow = window as TestWindow;
const api: SpotifyIframeApi = { createController: vi.fn() };
const script = () =>
  document.querySelector<HTMLScriptElement>(
    'script[src="https://open.spotify.com/embed/iframe-api/v1"]'
  );

describe('Spotify iframe API loader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete spotifyWindow.SpotifyIframeApi;
    delete spotifyWindow.onSpotifyIframeApiReady;
    script()?.remove();
  });
  afterEach(() => {
    vi.useRealTimers();
    delete spotifyWindow.SpotifyIframeApi;
    delete spotifyWindow.onSpotifyIframeApiReady;
    script()?.remove();
  });

  it('shares one request and script, then reuses the ready API', async () => {
    const first = loadSpotifyIframeApi();
    const second = loadSpotifyIframeApi();
    expect(first).toBe(second);
    expect(document.querySelectorAll('script[src*="iframe-api/v1"]')).toHaveLength(1);
    spotifyWindow.onSpotifyIframeApiReady!(api);
    expect(await first).toBe(api);
    expect(await loadSpotifyIframeApi()).toBe(api);
  });

  it('resets after a network error so the next request can retry', async () => {
    const first = loadSpotifyIframeApi();
    const failure = expect(first).rejects.toThrow('unavailable');
    script()!.dispatchEvent(new Event('error'));
    await failure;
    expect(script()).toBeNull();
    const retry = loadSpotifyIframeApi();
    spotifyWindow.onSpotifyIframeApiReady!(api);
    expect(await retry).toBe(api);
  });

  it('times out a stalled script and retries with a fresh one', async () => {
    const first = loadSpotifyIframeApi();
    const oldScript = script();
    const failure = expect(first).rejects.toThrow('unavailable');
    vi.advanceTimersByTime(10000);
    await failure;
    const retry = loadSpotifyIframeApi();
    expect(script()).not.toBe(oldScript);
    spotifyWindow.onSpotifyIframeApiReady!(api);
    expect(await retry).toBe(api);
  });

  it('shares an existing script and preserves a previous ready callback', async () => {
    const previous = vi.fn(() => {
      throw new Error('unrelated integration');
    });
    spotifyWindow.onSpotifyIframeApiReady = previous;
    const existing = document.createElement('script');
    existing.src = 'https://open.spotify.com/embed/iframe-api/v1';
    document.head.appendChild(existing);
    const pending = loadSpotifyIframeApi();
    expect(script()).toBe(existing);
    spotifyWindow.onSpotifyIframeApiReady!(api);
    expect(await pending).toBe(api);
    expect(previous).toHaveBeenCalledWith(api);
    expect(spotifyWindow.onSpotifyIframeApiReady).toBe(previous);
  });
});
