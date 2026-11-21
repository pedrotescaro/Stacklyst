/**
 * Spotify's 30-second track previews, for listeners without a connected
 * Premium account. The Web API stopped returning `preview_url` for new apps,
 * but the public track embed still lists the same MP3 its own player uses.
 */

const TRACK_ID = /^[a-zA-Z0-9]{22}$/;
const PREVIEW_IN_EMBED = /"audioPreview"\s*:\s*\{\s*"url"\s*:\s*"([^"\\]+)"/;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_LIMIT = 500;
const FETCH_TIMEOUT_MS = 8000;

const cache = new Map<string, { url: string | null; expiresAt: number }>();

/** Only Spotify's preview CDN is accepted, so the player never loads other hosts. */
export function parseSpotifyPreviewUrl(html: string): string | null {
  const match = PREVIEW_IN_EMBED.exec(html);
  if (!match) return null;
  try {
    const url = new URL(match[1]);
    if (url.protocol !== 'https:' || url.hostname !== 'p.scdn.co') return null;
    if (!url.pathname.startsWith('/mp3-preview/')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export class SpotifyPreviewError extends Error {}

/** Returns the preview MP3 URL, or null when Spotify has no preview for the track. */
export async function getSpotifyPreviewUrl(trackId: string): Promise<string | null> {
  if (!TRACK_ID.test(trackId)) return null;
  const now = Date.now();
  const cached = cache.get(trackId);
  if (cached && cached.expiresAt > now) return cached.url;

  let response: Response;
  try {
    response = await fetch(`https://open.spotify.com/embed/track/${trackId}`, {
      headers: { Accept: 'text/html', 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch {
    throw new SpotifyPreviewError('Spotify embed unavailable');
  }
  if (response.status === 404) return remember(trackId, null, now);
  if (!response.ok) throw new SpotifyPreviewError(`Spotify embed returned ${response.status}`);
  return remember(trackId, parseSpotifyPreviewUrl(await response.text()), now);
}

function remember(trackId: string, url: string | null, now: number) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(trackId, { url, expiresAt: now + CACHE_TTL_MS });
  return url;
}

/** Test hook. */
export function clearSpotifyPreviewCache() {
  cache.clear();
}
