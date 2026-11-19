import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';
import { ForbiddenError } from '@/lib/errors';
import { SPOTIFY_SESSION_COOKIE, cookieOptions, isSameOriginRequest } from '@/lib/spotify-connect';

/** Forgets this browser's Spotify tokens. Works even after sign-out. */
export const POST = apiHandler(
  async (request) => {
    if (!isSameOriginRequest(request)) throw new ForbiddenError();
    (await cookies()).set(SPOTIFY_SESSION_COOKIE, '', cookieOptions(0));
    return Response.json({ connected: false }, { headers: { 'Cache-Control': 'no-store' } });
  },
  { resolveSession: false }
);
