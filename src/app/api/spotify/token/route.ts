import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { AppError, ForbiddenError } from '@/lib/errors';
import { rateLimit } from '@/lib/ratelimit';
import {
  SPOTIFY_SESSION_COOKIE,
  SpotifyConnectError,
  cookieOptions,
  freshSession,
  isSameOriginRequest,
  readSession,
  sealSession,
} from '@/lib/spotify-connect';

/**
 * Short-lived access token for the Web Playback SDK running in this browser.
 * The refresh token and client secret stay on the server.
 */
export const GET = apiHandler(async (request) => {
  if (!isSameOriginRequest(request)) throw new ForbiddenError();
  const user = await requireAuth();
  await rateLimit(`spotify-token:${user.id}`, {
    limit: 60,
    window: '1 m',
    endpoint: '/api/spotify/token',
  });
  const store = await cookies();
  const current = await readSession(store.get(SPOTIFY_SESSION_COOKIE)?.value, user.id);
  if (!current) throw new AppError('SPOTIFY_NOT_CONNECTED', 'Conecte sua conta Spotify.', 401);
  try {
    const { session, rotated } = await freshSession(current);
    if (rotated) {
      const sealed = await sealSession(session);
      store.set(SPOTIFY_SESSION_COOKIE, sealed.cookie, cookieOptions(sealed.maxAge));
    }
    return Response.json(
      {
        accessToken: session.accessToken,
        expiresAt: session.accessTokenExpiresAt,
        premium: session.account.product === 'premium',
      },
      { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } }
    );
  } catch (error) {
    if (error instanceof SpotifyConnectError && error.kind === 'revoked') {
      store.set(SPOTIFY_SESSION_COOKIE, '', cookieOptions(0));
      throw new AppError(
        'SPOTIFY_REVOKED',
        'O acesso ao Spotify foi revogado. Conecte de novo.',
        401
      );
    }
    throw new AppError('SPOTIFY_UNAVAILABLE', 'O Spotify não respondeu. Tente novamente.', 503);
  }
});
