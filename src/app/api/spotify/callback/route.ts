import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  SPOTIFY_SESSION_COOKIE,
  SPOTIFY_STATE_COOKIE,
  SpotifyConnectError,
  cookieOptions,
  exchangeCode,
  readOAuthState,
  sealSession,
} from '@/lib/spotify-connect';

function finish(request: Request, status: string) {
  // The empty fragment stops browsers from carrying an incoming fragment along.
  const response = NextResponse.redirect(
    new URL(`/settings?tab=spotify&spotify=${status}#`, request.url),
    303
  );
  // The state cookie is single use, whatever the outcome.
  response.cookies.set(SPOTIFY_STATE_COOKIE, '', cookieOptions(0));
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

/** Spotify redirects here after the user approves or denies access. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  let user: Awaited<ReturnType<typeof getAuthUser>> = null;
  try {
    user = await getAuthUser();
  } catch {
    return finish(request, 'error');
  }
  if (!user) return finish(request, 'signed_out');

  try {
    const stateCookie = (await cookies()).get(SPOTIFY_STATE_COOKIE)?.value;
    const oauth = await readOAuthState(stateCookie, user.id, params.get('state'));
    if (params.get('error')) return finish(request, 'denied');
    const session = await exchangeCode(params.get('code'), oauth);
    const sealed = await sealSession(session);
    const response = finish(request, 'connected');
    response.cookies.set(SPOTIFY_SESSION_COOKIE, sealed.cookie, cookieOptions(sealed.maxAge));
    return response;
  } catch (error) {
    const kind = error instanceof SpotifyConnectError ? error.kind : 'upstream';
    if (kind === 'upstream') logger.warn('Spotify connection failed', { userId: user.id });
    return finish(request, kind === 'upstream' ? 'error' : kind);
  }
}
