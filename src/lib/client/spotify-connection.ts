/** Browser helpers for the per-user Spotify connection. Tokens stay in memory only. */

export interface SpotifyConnectionStatus {
  configured: boolean;
  connected: boolean;
  displayName?: string | null;
  product?: string | null;
  premium?: boolean;
}

export const SPOTIFY_CONNECTION_EVENT = 'stacklyst:spotify-connection';

let cachedToken: { value: string; expiresAt: number } | null = null;
let tokenRequest: Promise<string> | null = null;

export async function fetchSpotifyConnection(signal?: AbortSignal) {
  const response = await fetch('/api/spotify/session', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Spotify status unavailable');
  return (await response.json()) as SpotifyConnectionStatus;
}

export function getSpotifyAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - 30_000 > Date.now()) {
    return Promise.resolve(cachedToken.value);
  }
  if (tokenRequest) return tokenRequest;
  tokenRequest = (async () => {
    try {
      const response = await fetch('/api/spotify/token', { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.accessToken !== 'string') {
        throw Object.assign(new Error(data.message || 'Spotify token unavailable'), {
          code: data.error as string | undefined,
        });
      }
      cachedToken = { value: data.accessToken, expiresAt: Number(data.expiresAt) || 0 };
      return data.accessToken as string;
    } finally {
      tokenRequest = null;
    }
  })();
  return tokenRequest;
}

export function forgetSpotifyAccessToken() {
  cachedToken = null;
}

export async function disconnectSpotify() {
  forgetSpotifyAccessToken();
  const response = await fetch('/api/spotify/disconnect', { method: 'POST' });
  if (!response.ok) throw new Error('Não foi possível desconectar o Spotify.');
  notifySpotifyConnectionChanged();
}

export function notifySpotifyConnectionChanged() {
  window.dispatchEvent(new Event(SPOTIFY_CONNECTION_EVENT));
}
