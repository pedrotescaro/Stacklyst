import { ValidationError } from '@/lib/errors';

export interface SpotifyProfileTrack {
  trackId: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  metadataUnavailable?: boolean;
}

export function normalizeSpotifyTrackId(input: string): string | null {
  const value = input.trim();
  if (/^[a-zA-Z0-9]{22}$/.test(value)) return value;
  const uri = /^spotify:track:([a-zA-Z0-9]{22})$/.exec(value);
  if (uri) return uri[1];
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'open.spotify.com' ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    return /^\/(?:intl-[a-z]{2}\/)?track\/([a-zA-Z0-9]{22})\/?$/.exec(url.pathname)?.[1] || null;
  } catch {
    return null;
  }
}

function safeArtwork(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /(^|\.)(scdn\.co|spotifycdn\.com)$/.test(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

let token: { value: string; expires: number } | null = null;
let tokenRequest: Promise<string | null> | null = null;
export function spotifySearchConfigured() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}
async function spotifyToken(): Promise<string | null> {
  if (!spotifySearchConfigured()) return null;
  if (token && token.expires > Date.now()) return token.value;
  if (tokenRequest) return tokenRequest;
  tokenRequest = (async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(6000),
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (typeof data.access_token !== 'string') return null;
    token = {
      value: data.access_token,
      expires: Date.now() + Math.max(0, Number(data.expires_in) - 60) * 1000,
    };
    return token.value;
  })().finally(() => {
    tokenRequest = null;
  });
  return tokenRequest;
}

function apiTrack(data: any): SpotifyProfileTrack | null {
  const trackId = typeof data?.id === 'string' ? normalizeSpotifyTrackId(data.id) : null;
  if (!trackId || typeof data.name !== 'string') return null;
  return {
    trackId,
    title: data.name.slice(0, 200),
    artist: (data.artists || [])
      .map((artist: any) => (typeof artist.name === 'string' ? artist.name : ''))
      .filter(Boolean)
      .join(', ')
      .slice(0, 200),
    artworkUrl: safeArtwork(data.album?.images?.[0]?.url),
  };
}

const metadataCache = new Map<string, { expires: number; track: SpotifyProfileTrack }>();
export async function resolveSpotifyTrack(input: string): Promise<SpotifyProfileTrack> {
  const trackId = normalizeSpotifyTrackId(input);
  if (!trackId)
    throw new ValidationError(
      'INVALID_SPOTIFY_TRACK',
      'Informe um link de faixa de open.spotify.com.'
    );
  const cached = metadataCache.get(trackId);
  if (cached && cached.expires > Date.now()) return cached.track;
  let result: SpotifyProfileTrack | null = null;
  try {
    const authorization = await spotifyToken();
    if (authorization) {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${authorization}` },
        redirect: 'error',
        signal: AbortSignal.timeout(6000),
      });
      if (response.ok) result = apiTrack(await response.json());
    }
  } catch {
    /* The official oEmbed endpoint remains a credential-free fallback. */
  }
  if (!result) {
    try {
      const response = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${trackId}`)}`,
        {
          redirect: 'error',
          signal: AbortSignal.timeout(6000),
        }
      );
      if (response.status === 404 || response.status === 400)
        throw new ValidationError(
          'SPOTIFY_TRACK_NOT_FOUND',
          'Essa faixa não está disponível no Spotify.'
        );
      if (response.ok) {
        const data = await response.json();
        if (typeof data.title === 'string' && data.provider_name === 'Spotify') {
          const parts = data.title.split(' - ');
          result = {
            trackId,
            title: (parts.length > 1 ? parts.slice(0, -1).join(' - ') : data.title).slice(0, 200),
            artist: (parts.length > 1 ? parts.at(-1) || '' : '').slice(0, 200),
            artworkUrl: safeArtwork(data.thumbnail_url),
          };
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) throw error;
    }
  }
  if (!result)
    return {
      trackId,
      title: 'Faixa do Spotify',
      artist: '',
      artworkUrl: null,
      metadataUnavailable: true,
    };
  if (metadataCache.size >= 200) metadataCache.delete(metadataCache.keys().next().value!);
  metadataCache.set(trackId, { expires: Date.now() + 60 * 60 * 1000, track: result });
  return result;
}

export async function searchSpotifyTracks(query: string): Promise<SpotifyProfileTrack[]> {
  const authorization = await spotifyToken();
  if (!authorization) return [];
  const response = await fetch(
    `https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(query)}`,
    {
      headers: { Authorization: `Bearer ${authorization}` },
      redirect: 'error',
      signal: AbortSignal.timeout(6000),
    }
  );
  if (!response.ok) throw new Error('Spotify search unavailable');
  const data = await response.json();
  return (data.tracks?.items || []).map(apiTrack).filter(Boolean);
}
