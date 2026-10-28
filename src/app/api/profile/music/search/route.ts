import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import {
  searchSpotifyTrackPage,
  spotifySearchAvailability,
  SpotifyCatalogError,
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
          reason === 'approval_required'
            ? 'A pesquisa pública aguarda a aprovação do Spotify. Você pode adicionar uma faixa pelo link oficial.'
            : 'A pesquisa do Spotify ainda não foi configurada. Adicione uma faixa pelo link oficial.',
      },
      { headers }
    );
  const params = new URL(request.url).searchParams;
  const query = z.string().trim().min(2).max(100).parse(params.get('q'));
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(1000)
    .parse(params.get('offset') || 0);
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
        headers: {
          ...headers,
          ...(failure.retryAfter ? { 'Retry-After': String(failure.retryAfter) } : {}),
        },
      }
    );
  }
});
