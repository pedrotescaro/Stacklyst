import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  MusicPlayerProvider,
  useMusicPlayer,
  useMusicPlayerControls,
  type ActiveTrack,
} from '../MusicPlayerContext';
import { loadSpotifyIframeApi } from '@/lib/spotify-iframe';
import { createSpotifyHarness } from '@/test/spotify-iframe-mock';

vi.mock('@/lib/spotify-iframe', () => ({ loadSpotifyIframeApi: vi.fn() }));
const track1: ActiveTrack = { id: '4cOdK2wGLETKBW3PvgPWqT', title: 'Track 1', artist: 'Artist 1' };
const track2: ActiveTrack = { id: '6rqhFgbbKwnb9MLmUQDhG6', title: 'Track 2', artist: 'Artist 2' };
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MusicPlayerProvider>{children}</MusicPlayerProvider>
);
let spotify: ReturnType<typeof createSpotifyHarness>;

async function start(result: { current: ReturnType<typeof useMusicPlayer> }) {
  await act(async () => {
    result.current.playTrack(track1);
  });
  act(() => {
    spotify.finishCreation();
    spotify.emit('ready');
  });
}

describe('MusicPlayerContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    spotify = createSpotifyHarness();
    vi.mocked(loadSpotifyIframeApi).mockReset().mockResolvedValue(spotify.api);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('preloads the API without creating an embed or starting playback', () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    expect(result.current.currentTrack).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(loadSpotifyIframeApi).toHaveBeenCalledOnce();
    expect(spotify.api.createController).not.toHaveBeenCalled();
  });

  it('waits for ready and actual playback rather than showing fake playback', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await act(async () => {
      result.current.playTrack(track1);
    });
    expect(result.current.isBuffering).toBe(true);
    expect(result.current.isPlaying).toBe(false);
    act(() => spotify.finishCreation());
    expect(spotify.controller.resume).not.toHaveBeenCalled();
    act(() => {
      spotify.emit('ready');
      spotify.emit('ready');
    });
    expect(spotify.controller.resume).toHaveBeenCalledOnce();
    expect(result.current.isPlaying).toBe(false);
    act(() => spotify.confirmPlaying());
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isBuffering).toBe(false);
  });

  it('creates one controller during rapid track switches and starts only the latest track', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await act(async () => {
      result.current.playTrack(track1);
    });
    await act(async () => {
      result.current.playTrack(track2);
    });
    expect(spotify.api.createController).toHaveBeenCalledOnce();
    act(() => {
      spotify.finishCreation();
      spotify.emit('ready');
    });
    expect(spotify.controller.loadEntity).toHaveBeenCalledExactlyOnceWith(
      `spotify:track:${track2.id}`
    );
    expect(spotify.controller.play).toHaveBeenCalledOnce();
    expect(result.current.currentTrack).toEqual(track2);
  });

  it('uses the latest selection even before the API has loaded', async () => {
    let resolveApi!: (api: typeof spotify.api) => void;
    const pending = new Promise<typeof spotify.api>((resolve) => {
      resolveApi = resolve;
    });
    vi.mocked(loadSpotifyIframeApi).mockReturnValue(pending);
    const { result } = renderHook(useMusicPlayer, { wrapper });
    act(() => {
      result.current.playTrack(track1);
      result.current.playTrack(track2);
    });
    await act(async () => {
      resolveApi(spotify.api);
    });
    expect(spotify.api.createController).toHaveBeenCalledOnce();
    expect(vi.mocked(spotify.api.createController).mock.calls[0][1].uri).toBe(
      `spotify:track:${track2.id}`
    );
  });

  it('cancels playback during loading, including two clicks within one React batch', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await act(async () => {
      result.current.playTrack(track1);
      result.current.playTrack(track1);
    });
    act(() => {
      spotify.finishCreation();
      spotify.emit('ready');
    });
    expect(spotify.controller.play).not.toHaveBeenCalled();
    expect(spotify.controller.resume).not.toHaveBeenCalled();
    expect(spotify.controller.pause).toHaveBeenCalledOnce();
    expect(result.current.isBuffering).toBe(false);
    act(() => vi.advanceTimersByTime(20000));
    expect(result.current.error).toBeNull();
  });

  it('reuses the embed and resumes the paused position without reloading the track', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await start(result);
    act(() => spotify.confirmPlaying());
    act(() => result.current.togglePlay());
    expect(spotify.controller.pause).toHaveBeenCalledOnce();
    act(() => result.current.playTrack(track1));
    expect(spotify.controller.resume).toHaveBeenCalledTimes(2);
    expect(spotify.controller.loadEntity).not.toHaveBeenCalled();
    expect(spotify.api.createController).toHaveBeenCalledOnce();
  });

  it('ignores playback events from an old track and restores buffering after a stall', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await start(result);
    act(() => spotify.confirmPlaying());
    act(() => result.current.playTrack(track2));
    act(() =>
      spotify.emit('playback_update', {
        playingURI: `spotify:track:${track1.id}`,
        isPaused: false,
        position: 90000,
      })
    );
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.position).toBe(0);
    act(() => spotify.confirmPlaying());
    expect(result.current.isPlaying).toBe(true);
    act(() =>
      spotify.emit('playback_update', {
        playingURI: `spotify:track:${track2.id}`,
        isPaused: false,
        isBuffering: true,
      })
    );
    expect(result.current.isBuffering).toBe(true);
    expect(result.current.isPlaying).toBe(false);
    act(() => spotify.confirmPlaying());
    act(() => vi.advanceTimersByTime(20000));
    expect(result.current.error).toBeNull();
  });

  it('destroys a late controller when closed during creation and never starts it', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await act(async () => {
      result.current.playTrack(track1);
    });
    act(() => result.current.closePlayer());
    act(() => {
      spotify.finishCreation();
      spotify.emit('ready');
    });
    expect(spotify.controller.destroy).toHaveBeenCalledOnce();
    expect(spotify.controller.resume).not.toHaveBeenCalled();
    expect(result.current.currentTrack).toBeNull();
  });

  it('cancels creation when closed before the API response', async () => {
    let resolveApi!: (api: typeof spotify.api) => void;
    vi.mocked(loadSpotifyIframeApi).mockReturnValue(
      new Promise((resolve) => {
        resolveApi = resolve;
      })
    );
    const { result } = renderHook(useMusicPlayer, { wrapper });
    act(() => {
      result.current.playTrack(track1);
      result.current.closePlayer();
    });
    await act(async () => {
      resolveApi(spotify.api);
    });
    expect(spotify.api.createController).not.toHaveBeenCalled();
  });

  it('cleans up on unmount and ignores subsequent Spotify messages', async () => {
    const { result, unmount } = renderHook(useMusicPlayer, { wrapper });
    await start(result);
    unmount();
    expect(spotify.controller.destroy).toHaveBeenCalledOnce();
    act(() => {
      spotify.emit('ready');
      spotify.confirmPlaying();
      vi.advanceTimersByTime(20000);
    });
    expect(spotify.controller.resume).toHaveBeenCalledOnce();
  });

  it('shows a recoverable error when the API fails and allows retry', async () => {
    vi.mocked(loadSpotifyIframeApi)
      .mockRejectedValueOnce(new Error('offline'))
      .mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await act(async () => {
      result.current.playTrack(track1);
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.isBuffering).toBe(false);
    await act(async () => {
      result.current.playTrack(track1);
    });
    act(() => {
      spotify.finishCreation();
      spotify.emit('ready');
      spotify.confirmPlaying();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isPlaying).toBe(true);
  });

  it('times out instead of spinning forever and invalidates late ready events', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await act(async () => {
      result.current.playTrack(track1);
    });
    act(() => spotify.finishCreation());
    act(() => result.current.minimize());
    act(() => vi.advanceTimersByTime(15000));
    expect(result.current.error).toContain('demorou');
    expect(result.current.isBuffering).toBe(false);
    expect(result.current.isMinimized).toBe(false);
    act(() => spotify.emit('ready'));
    expect(spotify.controller.resume).not.toHaveBeenCalled();
    expect(spotify.controller.destroy).toHaveBeenCalledOnce();
  });

  it('recovers from controller command failures', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    await start(result);
    spotify.controller.pause.mockImplementationOnce(() => {
      throw new Error('detached');
    });
    act(() => result.current.pause());
    expect(result.current.error).toBeTruthy();
    expect(spotify.controller.destroy).toHaveBeenCalledOnce();
  });

  it('seeks only with a known duration, clamps input and sends one command in StrictMode', async () => {
    const strictWrapper = ({ children }: { children: React.ReactNode }) => (
      <React.StrictMode>{wrapper({ children })}</React.StrictMode>
    );
    const { result } = renderHook(useMusicPlayer, { wrapper: strictWrapper });
    await start(result);
    act(() => result.current.seek(50));
    expect(spotify.controller.seek).not.toHaveBeenCalled();
    act(() => spotify.confirmPlaying());
    act(() => {
      result.current.seek(Number.NaN);
      result.current.seek(200);
    });
    expect(spotify.controller.seek).toHaveBeenCalledExactlyOnceWith(180);
  });

  it('rejects malformed track IDs and keeps minimize controls operational', async () => {
    const { result } = renderHook(useMusicPlayer, { wrapper });
    act(() => result.current.playTrack({ ...track1, id: 'invalid' }));
    expect(result.current.currentTrack).toBeNull();
    await start(result);
    act(() => result.current.minimize());
    expect(result.current.isMinimized).toBe(true);
    act(() => result.current.expand());
    expect(result.current.isMinimized).toBe(false);
    act(() => result.current.toggleMinimize());
    expect(result.current.isMinimized).toBe(true);
  });

  it('does not rerender feed controls for each progress update', async () => {
    let renders = 0;
    let controls!: ReturnType<typeof useMusicPlayerControls>;
    function Consumer() {
      controls = useMusicPlayerControls();
      renders++;
      return null;
    }
    render(
      <MusicPlayerProvider>
        <Consumer />
      </MusicPlayerProvider>
    );
    await act(async () => {
      controls.playTrack(track1);
    });
    act(() => {
      spotify.finishCreation();
      spotify.emit('ready');
      spotify.confirmPlaying();
    });
    const initialRenders = renders;
    for (let position = 1000; position <= 10000; position += 1000) {
      act(() =>
        spotify.emit('playback_update', {
          playingURI: `spotify:track:${track1.id}`,
          isPaused: false,
          isBuffering: false,
          duration: 180000,
          position,
        })
      );
    }
    expect(renders).toBe(initialRenders);
  });
});
