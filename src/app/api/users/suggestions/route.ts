import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getFollowRecommendations } from '@/services/follow-recommendation.service';
import { parseFollowRecommendationQuery } from '@/lib/follow-recommendations';
import { ValidationError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req, { session }) => {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' };
  if (!session) {
    return NextResponse.json([], { headers });
  }

  let options: ReturnType<typeof parseFollowRecommendationQuery>;
  try {
    options = parseFollowRecommendationQuery(new URL(req.url).searchParams);
  } catch {
    throw new ValidationError(
      'INVALID_SUGGESTION_QUERY',
      'Confira o limite e os perfis da atualização e tente novamente.'
    );
  }
  const suggestions = await getFollowRecommendations(session.id, options.limit, undefined, {
    exclude: options.exclude,
  });
  return NextResponse.json(suggestions, {
    headers,
  });
});
