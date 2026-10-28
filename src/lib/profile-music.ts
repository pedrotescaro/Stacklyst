import { ValidationError } from '@/lib/errors';

export interface SpotifyProfileTrack {
  trackId: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  album?: string | null;
  durationMs?: number | null;
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
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      /(^|\.)(scdn\.co|spotifycdn\.com)$/.test(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

let token: { value: string; expires: number } | null = null;
let tokenRequest: Promise<string | null> | null = null;
export type SpotifySearchReason = 'not_configured' | 'approval_required' | null;
export function spotifySearchAvailability(): { configured: boolean; reason: SpotifySearchReason } {
  if (!process.env.SPOTIFY_CLIENT_ID?.trim() || !process.env.SPOTIFY_CLIENT_SECRET?.trim())
    return { configured: false, reason: 'not_configured' };
  // A public social product must not silently treat development credentials as unlimited approval.
  if (process.env.NODE_ENV === 'production' && process.env.SPOTIFY_SEARCH_MODE !== 'extended')
    return { configured: false, reason: 'approval_required' };
  return { configured: true, reason: null };
}
export function spotifySearchConfigured() {
  return spotifySearchAvailability().configured;
}
export class SpotifyCatalogError extends Error {
  constructor(
    public readonly kind:
      | 'authorization'
      | 'forbidden'
      | 'rate_limited'
      | 'quota_exceeded'
      | 'connection'
      | 'upstream',
    public readonly upstreamStatus: number,
    public readonly retryAfter: number | null = null
  ) {
    super('A pesquisa do Spotify está temporariamente indisponível. Use o link de uma faixa.');
    this.name = 'SpotifyCatalogError';
  }
}
async function spotifyResponseError(response: Response): Promise<SpotifyCatalogError> {
  const retry = Number(response.headers.get('retry-after'));
  const retryAfter = Number.isFinite(retry) && retry > 0 ? Math.min(Math.ceil(retry), 86400) : null;
  let reason: unknown;
  try {
    reason = (await response.clone().json())?.error?.reason;
  } catch {
    /* No provider response body is disclosed. */
  }
  const kind =
    response.status === 401
      ? 'authorization'
      : response.status === 403
        ? 'forbidden'
        : response.status === 429
          ? reason === 'QUOTA_EXCEEDED'
            ? 'quota_exceeded'
            : 'rate_limited'
          : 'upstream';
  return new SpotifyCatalogError(kind, response.status, retryAfter);
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
    if (!response.ok) throw await spotifyResponseError(response);
    const data = await response.json();
    if (typeof data.access_token !== 'string' || !Number.isFinite(Number(data.expires_in)))
      throw new SpotifyCatalogError('authorization', 401);
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
    album: typeof data.album?.name === 'string' ? data.album.name.slice(0, 200) : null,
    durationMs:
      Number.isInteger(data.duration_ms) && data.duration_ms >= 0 && data.duration_ms <= 86400000
        ? data.duration_ms
        : null,
  };
}

async function authorizedSpotifyRequest(path: string): Promise<Response> {
  let authorization = await spotifyToken();
  if (!authorization) throw new SpotifyCatalogError('authorization', 401);
  const request = () =>
    fetch(`https://api.spotify.com/v1/${path}`, {
      headers: { Authorization: `Bearer ${authorization}` },
      redirect: 'error',
      signal: AbortSignal.timeout(6000),
      cache: 'no-store',
    });
  let response = await request();
  if (response.status === 401) {
    // Refresh once, without allowing a revoked token to cause an infinite retry loop.
    if (token?.value === authorization) token = null;
    authorization = await spotifyToken();
    if (!authorization) throw new SpotifyCatalogError('authorization', 401);
    response = await request();
  }
  if (!response.ok) throw await spotifyResponseError(response);
  return response;
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
    if (spotifySearchConfigured())
      result = apiTrack(await (await authorizedSpotifyRequest(`tracks/${trackId}`)).json());
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
          result = {
            trackId,
            // oEmbed's title is the track title; a hyphen does not prove an artist credit.
            title: data.title.slice(0, 200),
            artist: '',
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

export interface SpotifySearchPage {
  tracks: SpotifyProfileTrack[];
  offset: number;
  nextOffset: number | null;
  total: number;
}
const searchCache = new Map<string, { expires: number; page: SpotifySearchPage }>();
export async function searchSpotifyTrackPage(
  query: string,
  offset = 0
): Promise<SpotifySearchPage> {
  const text = query.trim();
  if (
    text.length < 2 ||
    text.length > 100 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 1000
  )
    throw new ValidationError(
      'INVALID_SPOTIFY_SEARCH',
      'Pesquise entre 2 e 100 caracteres e uma página válida.'
    );
  if (!spotifySearchConfigured()) return { tracks: [], offset, nextOffset: null, total: 0 };
  const key = `${text.toLocaleLowerCase('pt-BR')}:${offset}`;
  const cached = searchCache.get(key);
  if (cached && cached.expires > Date.now()) return structuredClone(cached.page);
  try {
    const params = new URLSearchParams({
      q: text,
      type: 'track,artist',
      market: 'BR',
      limit: '10',
      offset: String(offset),
    });
    const response = await authorizedSpotifyRequest(`search?${params}`);
    const data = await response.json();
    const tracks: SpotifyProfileTrack[] = Array.isArray(data.tracks?.items)
      ? data.tracks.items
          .map(apiTrack)
          .filter((item: SpotifyProfileTrack | null): item is SpotifyProfileTrack => Boolean(item))
      : [];
    const total =
      Number.isInteger(data.tracks?.total) && data.tracks.total >= 0 ? data.tracks.total : 0;
    const nextOffset =
      data.tracks?.next && offset + 10 <= 1000 && offset + 10 < total ? offset + 10 : null;
    const page = { tracks, offset, nextOffset, total };
    if (searchCache.size >= 100) searchCache.delete(searchCache.keys().next().value!);
    searchCache.set(key, { expires: Date.now() + 60000, page });
    return structuredClone(page);
  } catch (error) {
    if (error instanceof SpotifyCatalogError || error instanceof ValidationError) throw error;
    throw new SpotifyCatalogError('connection', 503);
  }
}
/** Backwards-compatible helper for callers that need only the first page. */
export async function searchSpotifyTracks(query: string): Promise<SpotifyProfileTrack[]> {
  return (await searchSpotifyTrackPage(query)).tracks;
}
