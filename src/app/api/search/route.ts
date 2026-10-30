import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { SearchService } from '@/services/search.service';

export const GET = apiHandler(async (req) => {
  const user = await requireAuth();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'posts';
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (q.trim().length < 2) {
    const response = NextResponse.json({ items: [], nextCursor: null });
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    return response;
  }

  let result;
  if (type === 'users') {
    result = await SearchService.searchUsers(q, cursor, limit, user.id);
  } else {
    result = await SearchService.searchPosts(q, cursor, limit, user.id);
  }

  const response = NextResponse.json(result);

  // Cache the identical query + cursor for 60 seconds
  response.headers.set('Cache-Control', 'private, no-store');

  return response;
});
