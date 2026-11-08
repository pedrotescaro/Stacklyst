import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { recruitmentActivity } from '@/services/job-activity.service';

export const GET = apiHandler(async (_request, { params }) => {
  const user = await requireAuth();
  return Response.json(await recruitmentActivity(user.id, (await params).id));
});
export const POST = apiHandler(async (request, { params }) => {
  const user = await requireAuth();
  const { action } = z
    .object({ action: z.enum(['start', 'refresh']) })
    .strict()
    .parse(await request.json().catch(() => null));
  return Response.json(await recruitmentActivity(user.id, (await params).id, action));
});
