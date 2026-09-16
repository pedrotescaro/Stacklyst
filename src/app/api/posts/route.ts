import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { PostService } from '@/services/post.service';
import { createPostSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/ratelimit';
import { requireAuth } from '@/lib/auth';

export const GET = apiHandler(async (req, { session }) => {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get('language') || undefined;
  const search = searchParams.get('search') || undefined;
  const author = searchParams.get('author') || undefined;
  const filter = searchParams.get('filter') || undefined;
  const cursor = searchParams.get('cursor') || undefined;
  const requestedLimit = parseInt(searchParams.get('limit') || '10', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 10;
  const likedBy = searchParams.get('likedBy') || undefined;
  const answeredBy = searchParams.get('answeredBy') || undefined;
  const after = searchParams.get('after');

  if (searchParams.get('mode') === 'count' && after) {
    const afterDate = new Date(after);
    if (Number.isNaN(afterDate.getTime())) {
      return NextResponse.json({ error: 'Data de atualização inválida' }, { status: 400 });
    }

    const count = await PostService.countNewer(session?.id || null, {
      after: afterDate,
      filter,
    });

    return NextResponse.json(
      { count },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  }

  const feed = await PostService.getFeed(session?.id || null, {
    language,
    search,
    author,
    filter,
    cursor,
    limit,
    likedBy,
    answeredBy,
  });

  return NextResponse.json(feed, {
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  });
});

export const POST = apiHandler(async (req) => {
  const user = await requireAuth();

  // Execute Upstash rate limit
  await rateLimit(`posts:${user.id}`, {
    limit: 10,
    window: '1 h',
    endpoint: '/api/posts',
  });

  const body = await req.json();
  const parsed = await createPostSchema.parseAsync(body);
  const clientId =
    req.headers.get('x-idempotency-key') ||
    req.headers.get('idempotency-key') ||
    (body && typeof body === 'object' && body.client_id ? String(body.client_id) : undefined);

  const result = await PostService.create(user.id, parsed, clientId);

  return NextResponse.json(result, { status: 201 });
});
