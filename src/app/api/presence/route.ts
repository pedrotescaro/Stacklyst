import { apiHandler } from '@/lib/api-handler';
import { getAuthUserId } from '@/lib/auth-session';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { getPlatformPresence, recordPlatformPresence } from '@/lib/platform-presence';
import { rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(
  async () => {
    try {
      return Response.json(await getPlatformPresence(), {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch {
      return Response.json(
        { error: 'PRESENCE_UNAVAILABLE' },
        {
          status: 503,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }
  },
  { resolveSession: false }
);

export const POST = apiHandler(
  async (request) => {
    const origin = request.headers.get('origin');
    if (
      (origin &&
        new URL(origin).host !== (request.headers.get('host') || new URL(request.url).host)) ||
      request.headers.get('x-platform-presence') !== '1'
    ) {
      throw new ForbiddenError();
    }
    const userId = await getAuthUserId();
    if (!userId) throw new UnauthorizedError();
    await rateLimit(`presence:${userId}`, { limit: 12, window: '1 m', endpoint: '/api/presence' });
    await recordPlatformPresence(userId);
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  },
  { resolveSession: false }
);
