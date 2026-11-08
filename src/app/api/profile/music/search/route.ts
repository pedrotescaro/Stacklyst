import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import {
  searchSpotifyTrackPage,
  spotifySearchAvailability,
  SpotifyCatalogError,
  normalizeSpotifyTrackId,
  resolveSpotifyTrack,
} from '@/lib/profile-music';
import { z } from 'zod';

export const GET = apiHandler(async (request) => {
  const user = await requireAuth();
  await rateLimit(`profile-music-search:${user.id}`, {
    limit: 60,
    window: '1 m',
    endpoint: '/api/profile/music/search',
  });
  const { configured, reason } = spotifySearchAvailability();
  const headers = { 'Cache-Control': 'private, no-store' };

  const params = new URL(request.url).searchParams;
  const rawQuery = params.get('q');
  const query = z.string().trim().min(2).max(500).parse(rawQuery);
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(1000)
    .parse(params.get('offset') || 0);

  // If query is an official Spotify link or track ID, resolve it directly
  const trackId = normalizeSpotifyTrackId(query);
  if (trackId) {
    try {
      const track = await resolveSpotifyTrack(query);
      return Response.json(
        {
          configured: true,
          tracks: [track],
          nextOffset: null,
          total: 1,
          offset: 0,
        },
        { headers }
      );
    } catch {
      // Fall through if direct resolution fails
    }
  }

  if (!configured)
    return Response.json(
      {
        configured: false,
        tracks: [],
        nextOffset: null,
        total: 0,
        offset: 0,
        reason,
        message:
          'A pesquisa do Spotify ainda não foi configurada. Adicione uma faixa pelo link oficial.',
      },
      { headers }
    );

  try {
    return Response.json(
      { configured, ...(await searchSpotifyTrackPage(query, offset)) },
      { headers }
    );
  } catch (error) {
    const failure =
      error instanceof SpotifyCatalogError ? error : new SpotifyCatalogError('connection', 503);
    const status = failure.upstreamStatus === 429 ? 429 : 503;
    return Response.json(
      {
        configured,
        tracks: [],
        offset,
        nextOffset: null,
        total: 0,
        unavailable: true,
        reason: failure.kind,
        upstreamStatus: failure.upstreamStatus,
        retryAfter: failure.retryAfter,
        message: failure.message,
      },
      {
        status,
        headers: failure.retryAfter
          ? { ...headers, 'Retry-After': String(failure.retryAfter) }
          : headers,
      }
    );
  }
});
