import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { HashtagService } from '@/services/hashtag.service';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (req) => {
  const user = await requireAuth();
  const requested = Number.parseInt(new URL(req.url).searchParams.get('limit') || '12', 10);
  const limit = Number.isFinite(requested) ? requested : 12;
  const items = await HashtagService.popular(user.id, limit);
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, no-store' } });
});
