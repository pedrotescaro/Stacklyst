import { apiHandler } from '@/lib/api-handler';
import { getProfileActivity } from '@/services/profile-activity.service';
import { z } from 'zod';

export const GET = apiHandler(async (request, { params, session }) => {
  const { username } = await params;
  const query = new URL(request.url).searchParams;
  const tab = z.enum(['posts', 'likes']).parse(query.get('tab') ?? 'posts');
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(30)
    .parse(query.get('limit') ?? 10);
  const result = await getProfileActivity(session?.id ?? null, username, {
    tab,
    limit,
    cursor: query.get('cursor') ?? undefined,
    search: query.get('search')?.trim().slice(0, 200) || undefined,
  });
  return Response.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
});
