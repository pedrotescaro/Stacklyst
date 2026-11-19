import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import {
  SPOTIFY_STATE_COOKIE,
  cookieOptions,
  createAuthorization,
  isSameOriginRequest,
  spotifyRedirectUri,
} from '@/lib/spotify-connect';

const settingsUrl = (request: Request, status: string) =>
  new URL(`/settings?tab=spotify&spotify=${status}`, request.url);

/** Starts the per-user Spotify OAuth flow from the settings page. */
export async function GET(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.redirect(settingsUrl(request, 'error'), 303);
  }
  let user: Awaited<ReturnType<typeof getAuthUser>> = null;
  try {
    user = await getAuthUser();
  } catch {
    return NextResponse.redirect(settingsUrl(request, 'error'), 303);
  }
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303);
  try {
    await rateLimit(`spotify-connect:${user.id}`, {
      limit: 10,
      window: '10 m',
      endpoint: '/api/spotify/connect',
    });
    // Spotify returns to the registered redirect URI. If this page runs on
    // another host (e.g. localhost vs 127.0.0.1), the session cookies would not
    // follow, so stop early with a clear message.
    if (new URL(spotifyRedirectUri()).host !== new URL(request.url).host) {
      return NextResponse.redirect(settingsUrl(request, 'wrong_host'), 303);
    }
    const authorization = await createAuthorization(user.id);
    const response = NextResponse.redirect(authorization.url, 303);
    response.cookies.set(
      SPOTIFY_STATE_COOKIE,
      authorization.cookie,
      cookieOptions(authorization.maxAge)
    );
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  } catch (error) {
    const kind = (error as { kind?: string; code?: string })?.kind;
    const limited = (error as { code?: string })?.code === 'RATE_LIMITED';
    return NextResponse.redirect(
      settingsUrl(
        request,
        kind === 'not_configured' ? 'not_configured' : limited ? 'rate_limited' : 'error'
      ),
      303
    );
  }
}
