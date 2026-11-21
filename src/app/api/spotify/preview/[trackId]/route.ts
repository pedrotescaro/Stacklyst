import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { rateLimit } from '@/lib/ratelimit';
import { getSpotifyPreviewUrl, SpotifyPreviewError } from '@/lib/spotify-preview';

const trackId = z.string().regex(/^[a-zA-Z0-9]{22}$/);

/** Preview MP3 for the in-app player when the listener has no Premium account. */
export const GET = apiHandler(
  async (request, { params }) => {
    const id = trackId.parse((await params).trackId);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    await rateLimit(`spotify-preview:${ip}`, {
      limit: 120,
      window: '1 m',
      endpoint: '/api/spotify/preview',
    });
    try {
      const url = await getSpotifyPreviewUrl(id);
      return Response.json(
        { url },
        { headers: { 'Cache-Control': `public, max-age=${url ? 3600 : 600}` } }
      );
    } catch (error) {
      if (!(error instanceof SpotifyPreviewError)) throw error;
      return Response.json(
        { url: null, unavailable: true },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  },
  { resolveSession: false }
);
