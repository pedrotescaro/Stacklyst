import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { resolveSpotifyTrack } from '@/lib/profile-music';
import { z } from 'zod';

export const POST = apiHandler(async (request) => {
  const user = await requireAuth();
  await rateLimit(`profile-music:${user.id}`, {
    limit: 20,
    window: '1 m',
    endpoint: '/api/profile/music/resolve',
  });
  const { url } = z.object({ url: z.string().min(1).max(500) }).parse(await request.json());
  const { trackId, title, artist, artworkUrl, album, durationMs } = await resolveSpotifyTrack(url);
  // Diagnostic metadata must never enter the strict persisted music preference.
  return Response.json(
    {
      trackId,
      title,
      artist,
      artworkUrl,
      ...(album !== undefined ? { album } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
    },
    {
      headers: { 'Cache-Control': 'private, no-store' },
    }
  );
});
