import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getFollowRecommendations } from '@/services/follow-recommendation.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req, { session }) => {
  if (!session) {
    return NextResponse.json([]);
  }

  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5)
    .parse(new URL(req.url).searchParams.get('limit') ?? undefined);
  const suggestions = await getFollowRecommendations(session.id, limit);
  return NextResponse.json(suggestions, {
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' },
  });
});
