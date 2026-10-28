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
  it('requires explicit approval mode before exposing a public production search', async () => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'client');
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'secret');
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SPOTIFY_SEARCH_MODE', '');
    const { spotifySearchAvailability } = await import('../profile-music');
    expect(spotifySearchAvailability()).toEqual({ configured: false, reason: 'approval_required' });
    vi.stubEnv('SPOTIFY_SEARCH_MODE', 'extended');
    expect(spotifySearchAvailability()).toEqual({ configured: true, reason: null });
  });
  it('searches official paginated tracks and artists using cached credentials and only real metadata', async () => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'client');
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'secret');
    const track = {
      id,
      name: 'Real track',
      artists: [{ name: 'Real artist' }],
      album: { name: 'Real album', images: [{ url: 'https://i.scdn.co/image/art' }] },
      duration_ms: 211000,
    };
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'first', expires_in: 3600 }))
      .mockResolvedValueOnce(
        Response.json({
          tracks: {
            items: [track],
            total: 25,
            next: 'https://api.spotify.com/v1/search?offset=10',
          },
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          tracks: {
            items: [track],
            total: 25,
            next: 'https://api.spotify.com/v1/search?offset=20',
          },
        })
      );
    vi.stubGlobal('fetch', fetcher);
    const { searchSpotifyTrackPage } = await import('../profile-music');
    const first = await searchSpotifyTrackPage('Lady Gaga');
    expect(first).toMatchObject({
      nextOffset: 10,
      total: 25,
      tracks: [{ album: 'Real album', durationMs: 211000, artist: 'Real artist' }],
    });
    await searchSpotifyTrackPage('Lady Gaga', 10);
    expect(fetcher).toHaveBeenCalledTimes(3);
    const url = new URL(fetcher.mock.calls[1][0]);
    expect(url.origin).toBe('https://api.spotify.com');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'Lady Gaga',
      type: 'track,artist',
      market: 'BR',
      limit: '10',
      offset: '0',
    });
    await searchSpotifyTrackPage('Lady Gaga');
    expect(fetcher).toHaveBeenCalledTimes(3);
    await expect(searchSpotifyTrackPage('query', 1001)).rejects.toMatchObject({
      code: 'INVALID_SPOTIFY_SEARCH',
    });
  });
  it('refreshes a rejected token once and returns sanitized quota/error metadata', async () => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'client');
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'secret');
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'expired', expires_in: 3600 }))
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access_token: 'fresh', expires_in: 3600 }))
      .mockResolvedValueOnce(
        Response.json(
          { error: { reason: 'QUOTA_EXCEEDED', message: 'private upstream detail' } },
          { status: 429, headers: { 'Retry-After': '45' } }
        )
      );
    vi.stubGlobal('fetch', fetcher);
    const { searchSpotifyTrackPage } = await import('../profile-music');
    await expect(searchSpotifyTrackPage('Bad Romance')).rejects.toMatchObject({
      kind: 'quota_exceeded',
      upstreamStatus: 429,
      retryAfter: 45,
    });
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls[3][1].headers.Authorization).toBe('Bearer fresh');
  });
  it.each([401, 403, 429])(
    'classifies Spotify %s without making up a result or retrying indefinitely',
    async (status) => {
      vi.stubEnv('SPOTIFY_CLIENT_ID', 'client');
      vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'secret');
      const fetcher = vi.fn(async (url: string) =>
        url.includes('/api/token')
          ? Response.json({ access_token: 'token', expires_in: 3600 })
          : new Response('', { status })
      );
      vi.stubGlobal('fetch', fetcher);
      const { searchSpotifyTrackPage } = await import('../profile-music');
      await expect(searchSpotifyTrackPage('Some song')).rejects.toMatchObject({
        upstreamStatus: status,
        kind: status === 401 ? 'authorization' : status === 403 ? 'forbidden' : 'rate_limited',
      });
      expect(fetcher.mock.calls.length).toBeLessThanOrEqual(4);
    }
  );
  it('returns connection failure, never synthetic tracks', async () => {
    vi.stubEnv('SPOTIFY_CLIENT_ID', 'client');
    vi.stubEnv('SPOTIFY_CLIENT_SECRET', 'secret');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { searchSpotifyTrackPage } = await import('../profile-music');
    await expect(searchSpotifyTrackPage('Some song')).rejects.toMatchObject({
      kind: 'connection',
      upstreamStatus: 503,
    });
  });
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
      title: 'Music - Artist',
      artist: '',
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
