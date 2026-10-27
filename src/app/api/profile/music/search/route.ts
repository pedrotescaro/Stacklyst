import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { searchSpotifyTracks, spotifySearchConfigured } from '@/lib/profile-music';
import { z } from 'zod';

export const GET = apiHandler(async (request) => {
  const user = await requireAuth();
  await rateLimit(`profile-music-search:${user.id}`, {
    limit: 20,
    window: '1 m',
    endpoint: '/api/profile/music/search',
  });
  const configured = spotifySearchConfigured();
  if (!configured) return Response.json({ configured: false, tracks: [] });
  const query = z.string().trim().min(2).max(100).parse(new URL(request.url).searchParams.get('q'));
  try {
    return Response.json(
      { configured, tracks: await searchSpotifyTracks(query) },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch {
    return Response.json({ configured, tracks: [], unavailable: true }, { status: 503 });
  }
});
