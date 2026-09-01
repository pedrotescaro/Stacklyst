import './dev-ssl';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';
import { JWT_COOKIE_NAME } from '@/lib/config';
import { isTemporaryAuthFailure } from '@/lib/supabase/auth-errors';
import { getErrorSummary } from '@/lib/connection-errors';
import { logger } from '@/lib/logger';
import { getSupabasePublicConfig, isSupabasePublicConfigured } from '@/lib/supabase/env';

const PROTECTED_ROUTE_PREFIXES = [
  '/bookmarks',
  '/duels',
  '/explore',
  '/feed',
  '/guilds',
  '/leaderboard',
  '/messages',
  '/notifications',
  '/post',
  '/profile',
  '/quiz',
  '/ranking',
  '/settings',
  '/trails',
] as const;

function copySessionState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));

  for (const headerName of ['cache-control', 'expires', 'pragma']) {
    const value = source.headers.get(headerName);
    if (value) target.headers.set(headerName, value);
  }

  return target;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Keep public pages available so login/register can show their configuration
  // guidance. Protected routes remain closed when Auth is not configured.
  if (!isSupabasePublicConfigured()) {
    if (!isProtectedRoute) return supabaseResponse;

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  const { url, key } = getSupabasePublicConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([header, value]) =>
          supabaseResponse.headers.set(header, value)
        );
      },
    },
  });

  // This verified-claims call is also what refreshes expired Supabase tokens.
  // It must run even while the secondary JWT is still valid.
  let user: { id: string } | null = null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    const userId = typeof data?.claims?.sub === 'string' ? data.claims.sub : null;

    if (userId) {
      user = { id: userId };
    } else if (error && isTemporaryAuthFailure(error)) {
      // Refresh tokens are single-use. A parallel refresh or short outage may
      // fail while another response is synchronizing a newer browser cookie.
      const jwtToken = request.cookies.get(JWT_COOKIE_NAME)?.value;
      const jwtPayload = jwtToken ? await verifyJwt(jwtToken) : null;
      if (jwtPayload?.sub) user = { id: jwtPayload.sub };

      logger.warn('Temporary Supabase auth failure in proxy', {
        ...getErrorSummary(error),
        usedJwtFallback: Boolean(user),
      });
    } else if (error) {
      logger.debug('Supabase session is not valid in proxy', getErrorSummary(error));
    }
  } catch (error) {
    const jwtToken = request.cookies.get(JWT_COOKIE_NAME)?.value;
    const jwtPayload = isTemporaryAuthFailure(error) && jwtToken ? await verifyJwt(jwtToken) : null;
    if (jwtPayload?.sub) user = { id: jwtPayload.sub };

    logger.warn('Supabase auth check failed in proxy', {
      ...getErrorSummary(error),
      usedJwtFallback: Boolean(user),
    });
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return copySessionState(supabaseResponse, NextResponse.redirect(url));
  }

  // Keep the explicit reason escape hatch for a failed database lookup. It
  // prevents a valid-but-unusable cookie from creating a redirect loop.
  const reasonParam = request.nextUrl.searchParams.get('reason');
  if (
    user &&
    (pathname === '/login' || pathname === '/register') &&
    reasonParam !== 'session_expired'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return copySessionState(supabaseResponse, NextResponse.redirect(url));
  }

  return supabaseResponse;
}
