import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeSpotifyTrackId } from '../profile-music';

const id = '0Lr4JG0K7jzM8FvAJPJn9b';
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('SPOTIFY_CLIENT_ID', '');
  vi.stubEnv('SPOTIFY_CLIENT_SECRET', '');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe('Spotify profile tracks', () => {
  it('accepts official track URL/URI and rejects external origins, credentials and nontracks', () => {
    for (const valid of [
      id,
      `spotify:track:${id}`,
      `https://open.spotify.com/track/${id}?si=abc`,
      `https://open.spotify.com/intl-pt/track/${id}`,
    ])
      expect(normalizeSpotifyTrackId(valid)).toBe(id);
    for (const invalid of [
      `http://open.spotify.com/track/${id}`,
      `https://evil.example/track/${id}`,
      `https://open.spotify.com.evil.example/track/${id}`,
      `https://user@open.spotify.com/track/${id}`,
      `https://open.spotify.com/album/${id}`,
      'javascript:alert(1)',
      'file:///etc/passwd',
    ])
      expect(normalizeSpotifyTrackId(invalid)).toBeNull();
  });
  it('uses only fixed official metadata endpoint and vetted Spotify artwork without API credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          provider_name: 'Spotify',
          title: 'Music - Artist',
          thumbnail_url: 'https://i.scdn.co/image/abc',
        })
      )
    );
    vi.stubGlobal('fetch', fetcher);
    const { resolveSpotifyTrack, spotifySearchConfigured } = await import('../profile-music');
    expect(spotifySearchConfigured()).toBe(false);
    expect(await resolveSpotifyTrack(`https://open.spotify.com/track/${id}`)).toEqual({
      trackId: id,
      title: 'Music',
      artist: 'Artist',
      artworkUrl: 'https://i.scdn.co/image/abc',
    });
    expect(fetcher.mock.calls[0][0]).toBe(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${id}`)}`
    );
    expect(fetcher.mock.calls[0][1].redirect).toBe('error');
  });
  it('rejects fake artwork, unknown tracks and SSRF input; does not invent unavailable metadata', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            provider_name: 'Spotify',
            title: 'Official',
            thumbnail_url: 'https://evil.example/a.png',
          })
        )
      )
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockRejectedValueOnce(new Error('timeout'));
    vi.stubGlobal('fetch', fetcher);
    const { resolveSpotifyTrack } = await import('../profile-music');
    expect((await resolveSpotifyTrack(id)).artworkUrl).toBeNull();
    await expect(resolveSpotifyTrack('1Lr4JG0K7jzM8FvAJPJn9b')).rejects.toMatchObject({
      code: 'SPOTIFY_TRACK_NOT_FOUND',
    });
    expect(await resolveSpotifyTrack('2Lr4JG0K7jzM8FvAJPJn9b')).toMatchObject({
      metadataUnavailable: true,
      artist: '',
      artworkUrl: null,
    });
    await expect(resolveSpotifyTrack('https://127.0.0.1/internal')).rejects.toMatchObject({
      code: 'INVALID_SPOTIFY_TRACK',
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
