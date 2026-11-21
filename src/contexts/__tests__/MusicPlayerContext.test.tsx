import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi, type Mock } from 'vitest';
import {
  MusicPlayerProvider,
  useMusicPlayer,
  useMusicPlayerControls,
  type ActiveTrack,
} from '../MusicPlayerContext';
import { createSpotifySdkHarness } from '@/test/spotify-sdk-mock';
import { installFakeAudio } from '@/test/audio-mock';
import { loadSpotifyWebPlaybackSdk } from '@/lib/spotify-web-playback';
import { fetchSpotifyConnection, getSpotifyAccessToken } from '@/lib/client/spotify-connection';

const flush = () =>
  act(async () => {
    for (let index = 0; index < 20; index++) await Promise.resolve();
  });
const PREVIEW_URL = 'https://p.scdn.co/mp3-preview/0123456789abcdef';

vi.mock(import('@/lib/spotify-web-playback'), async (importOriginal) => ({
  ...(await importOriginal()),
  loadSpotifyWebPlaybackSdk: vi.fn(),
}));
vi.mock('@/lib/client/spotify-connection', () => ({
  SPOTIFY_CONNECTION_EVENT: 'stacklyst:spotify-connection',
  fetchSpotifyConnection: vi.fn(),
  forgetSpotifyAccessToken: vi.fn(),
  getSpotifyAccessToken: vi.fn(),
}));
const track1: ActiveTrack = { id: '4cOdK2wGLETKBW3PvgPWqT', title: 'Track 1', artist: 'Artist 1' };
const track2: ActiveTrack = { id: '6rqhFgbbKwnb9MLmUQDhG6', title: 'Track 2', artist: 'Artist 2' };
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MusicPlayerProvider>{children}</MusicPlayerProvider>
);
let sdk: ReturnType<typeof createSpotifySdkHarness>;
let fetchMock: Mock<(...args: any[]) => Promise<Response>>;
let previewFetch: Mock<(...args: any[]) => Promise<Response>>;
let media: ReturnType<typeof installFakeAudio>;

async function setup(deviceId: string | null = 'device-1') {
  const view = renderHook(useMusicPlayer, { wrapper });
  await flush();
  if (deviceId) act(() => sdk.emit('ready', { device_id: deviceId }));
  return view;
}

describe('MusicPlayerContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sdk = createSpotifySdkHarness();
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    previewFetch = vi.fn(async () => Response.json({ url: PREVIEW_URL }));
    // Spotify Web API calls go to fetchMock; preview lookups to previewFetch.
    vi.stubGlobal('fetch', (url: string, init?: RequestInit) =>
      String(url).startsWith('/api/spotify/preview/') ? previewFetch(url) : fetchMock(url, init)
    );
    media = installFakeAudio();
    vi.mocked(fetchSpotifyConnection)
      .mockReset()
      .mockResolvedValue({ configured: true, connected: true, premium: true });
    vi.mocked(loadSpotifyWebPlaybackSdk).mockReset().mockResolvedValue(sdk.sdk);
    vi.mocked(getSpotifyAccessToken).mockReset().mockResolvedValue('access-token');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('waits for a ready device and confirms playback only on the matching SDK state', async () => {
    const { result } = await setup(null);
    act(() => result.current.playTrack(track1));
    expect(result.current.isBuffering).toBe(true);
    expect(previewFetch).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sdk.player.activateElement).toHaveBeenCalled();

    act(() => sdk.emit('ready', { device_id: 'device-1' }));
    await flush();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/player/play?device_id=device-1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ uris: [`spotify:track:${track1.id}`] }),
      })
    );
    expect(result.current.isPlaying).toBe(false);
    act(() => sdk.confirmPlaying(track2.id));
    expect(result.current.isPlaying).toBe(false);
    act(() => sdk.confirmPlaying(track1.id, { position: 30000 }));
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isBuffering).toBe(false);
    expect(result.current.playbackSource).toBe('account');
    expect(result.current.progress).toBe(15);
  });

  it('waits for the browser in Spotify Connect and activates it before retrying a 404', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(Response.json({ devices: [{ id: 'other', is_active: true }] }))
      .mockResolvedValueOnce(Response.json({ devices: [{ id: 'device-1', is_active: false }] }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json({ devices: [{ id: 'device-1', is_active: true }] }));
    const { result } = await setup();
    act(() => result.current.playTrack(track1));
    await act(async () => vi.advanceTimersByTimeAsync(800));
    expect(fetchMock.mock.calls.map(([url]) => new URL(url).pathname)).toEqual([
      '/v1/me/player/play',
      '/v1/me/player/devices',
      '/v1/me/player/devices',
      '/v1/me/player',
      '/v1/me/player/devices',
      '/v1/me/player/play',
    ]);
    expect(fetchMock.mock.calls[3][1].body).toBe(
      JSON.stringify({ device_ids: ['device-1'], play: false })
    );
    expect(fetchMock.mock.calls[5][0]).toBe(
      'https://api.spotify.com/v1/me/player/play?device_id=device-1'
    );
    act(() => sdk.confirmPlaying(track1.id));
    expect(result.current.isPlaying).toBe(true);
    expect(previewFetch).not.toHaveBeenCalled();
  });

  it('abandons recovery when the user cancels before the device is registered', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValue(Response.json({ devices: [] }));
    const { result } = await setup();
    act(() => result.current.playTrack(track1));
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    act(() => result.current.pause());
    await act(async () => vi.advanceTimersByTimeAsync(15000));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(previewFetch).not.toHaveBeenCalled();
    expect(result.current.isBuffering).toBe(false);
  });

  it('uses the new device after losing the connection and ignores stale offline notifications', async () => {
    const { result } = await setup();
    await act(async () => result.current.playTrack(track1));
    act(() => sdk.confirmPlaying(track1.id));
    act(() => sdk.emit('not_ready', { device_id: 'device-1' }));
    expect(result.current.isBuffering).toBe(true);

    act(() => sdk.emit('ready', { device_id: 'device-2' }));
    act(() => sdk.emit('not_ready', { device_id: 'device-1' }));
    await flush();
    expect(fetchMock.mock.calls.map(([url]) => new URL(url).searchParams.get('device_id'))).toEqual(
      ['device-1', 'device-2']
    );
    act(() => sdk.confirmPlaying(track1.id));
    expect(result.current.isPlaying).toBe(true);
  });

  it('plays the preview in our player when the registered device never becomes available', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockImplementation(async () => Response.json({ devices: [] }));
    const { result } = await setup();
    act(() => result.current.playTrack(track1));
    await act(async () => vi.advanceTimersByTimeAsync(4000));
    await flush();
    expect(result.current.playbackSource).toBe('preview');
    expect(previewFetch).toHaveBeenCalledWith(`/api/spotify/preview/${track1.id}`);
    expect(media.audio?.src).toBe(PREVIEW_URL);
    expect(media.audio?.play).toHaveBeenCalled();
    expect(result.current.isBuffering).toBe(true);
    act(() => media.audio?.startPlaying());
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isBuffering).toBe(false);
    expect(fetchMock.mock.calls.filter(([url]) => url.includes('/play?'))).toHaveLength(1);
  });

  it('plays the preview after the browser refuses account autoplay', async () => {
    const { result } = await setup();
    await act(async () => result.current.playTrack(track1));
    act(() => sdk.emit('autoplay_failed'));
    await flush();
    expect(result.current.playbackSource).toBe('preview');
    expect(sdk.player.pause).toHaveBeenCalled();
    expect(media.audio?.play).toHaveBeenCalled();
  });

  it('plays the preview for a Free account without requesting an SDK access token', async () => {
    vi.mocked(fetchSpotifyConnection).mockResolvedValue({
      configured: true,
      connected: true,
      premium: false,
    });
    const { result } = await setup(null);
    act(() => result.current.playTrack(track1));
    await flush();
    expect(result.current.playbackSource).toBe('preview');
    expect(media.audio?.play).toHaveBeenCalled();
    expect(getSpotifyAccessToken).not.toHaveBeenCalled();
    expect(loadSpotifyWebPlaybackSdk).not.toHaveBeenCalled();
  });

  it('plays the preview once, stops at the end and replays without fetching again', async () => {
    vi.mocked(fetchSpotifyConnection).mockResolvedValue({ configured: true, connected: false });
    const { result } = await setup(null);
    act(() => result.current.playTrack(track1));
    await flush();
    const audio = media.audio!;
    act(() => audio.startPlaying(30));
    act(() => audio.advanceTo(12));
    expect(result.current.position).toBe(12000);
    expect(result.current.duration).toBe(30000);

    act(() => result.current.seek(50));
    expect(audio.currentTime).toBe(12);
    expect(sdk.player.seek).not.toHaveBeenCalled();

    act(() => result.current.togglePlay());
    expect(audio.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.togglePlay());
    act(() => audio.startPlaying(30));
    act(() => audio.finish());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.position).toBe(0);
    expect(audio.currentTime).toBe(0);

    act(() => result.current.togglePlay());
    await flush();
    expect(audio.played.filter((source) => source === PREVIEW_URL)).toHaveLength(3);
    expect(previewFetch).toHaveBeenCalledOnce();
  });

  it('reports a missing preview instead of falling back to the Spotify embed', async () => {
    vi.mocked(fetchSpotifyConnection).mockResolvedValue({ configured: true, connected: false });
    previewFetch.mockResolvedValue(Response.json({ url: null }));
    const { result } = await setup(null);
    act(() => result.current.playTrack(track1));
    await flush();
    expect(result.current.previewUnavailable).toBe(true);
    expect(result.current.isBuffering).toBe(false);
    expect(result.current.isPlaying).toBe(false);
    expect(media.audio?.played).not.toContain(PREVIEW_URL);

    act(() => result.current.playTrack(track2));
    expect(result.current.previewUnavailable).toBe(false);
  });

  it('stops waiting when the SDK never emits ready and preserves a newer track selection', async () => {
    const { result } = await setup(null);
    act(() => {
      result.current.playTrack(track1);
      result.current.playTrack(track2);
    });
    await act(async () => vi.advanceTimersByTimeAsync(12000));
    await flush();
    expect(result.current.currentTrack).toEqual(track2);
    expect(result.current.playbackSource).toBe('preview');
    expect(previewFetch).toHaveBeenCalledOnce();
    expect(previewFetch).toHaveBeenCalledWith(`/api/spotify/preview/${track2.id}`);
    act(() => sdk.emit('ready', { device_id: 'late-device' }));
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => result.current.closePlayer());
    expect(media.audio?.src).toBe('');
    expect(result.current.currentTrack).toBeNull();
  });

  it('pauses, seeks and resumes account playback without restarting the track', async () => {
    const { result } = await setup();
    await act(async () => result.current.playTrack(track1));
    act(() => sdk.confirmPlaying(track1.id));
    act(() => {
      result.current.seek(200);
      result.current.pause();
    });
    expect(sdk.player.seek).toHaveBeenCalledWith(200000);
    expect(sdk.player.pause).toHaveBeenCalledOnce();
    await act(async () => result.current.resume());
    expect(sdk.player.resume).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('stops at the end instead of following Spotify autoplay or opening the embed', async () => {
    const { result } = await setup();
    await act(async () => result.current.playTrack(track1));
    act(() => sdk.confirmPlaying(track1.id, { position: 199000 }));
    act(() =>
      sdk.confirmPlaying(track2.id, {
        track_window: {
          current_track: { id: track2.id, uri: `spotify:track:${track2.id}` },
          previous_tracks: [{ id: track1.id, uri: `spotify:track:${track1.id}` }],
        },
      })
    );
    expect(sdk.player.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.position).toBe(0);
    expect(result.current.duration).toBe(200000);
    act(() => vi.advanceTimersByTime(15000));
    expect(previewFetch).not.toHaveBeenCalled();

    await act(async () => result.current.resume());
    expect(sdk.player.resume).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rewinds a track that ends without autoplay', async () => {
    const { result } = await setup();
    await act(async () => result.current.playTrack(track1));
    act(() => sdk.confirmPlaying(track1.id, { position: 198500 }));
    act(() => sdk.confirmPlaying(track1.id, { paused: true, position: 0 }));
    expect(result.current.isPlaying).toBe(false);
    expect(previewFetch).not.toHaveBeenCalled();
    act(() => sdk.confirmPlaying(track1.id, { position: 3000 }));
    expect(sdk.player.pause).toHaveBeenCalledTimes(2);
    expect(result.current.isPlaying).toBe(false);
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
    await flush();
    act(() => sdk.emit('ready', { device_id: 'device-1' }));
    await act(async () => controls.playTrack(track1));
    act(() => sdk.confirmPlaying(track1.id));
    const initialRenders = renders;
    for (let position = 1000; position <= 10000; position += 1000) {
      act(() => sdk.confirmPlaying(track1.id, { position }));
    }
    expect(renders).toBe(initialRenders);
  });
});
