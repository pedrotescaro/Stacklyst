import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { BlockService } from '@/services/block.service';
import { z } from 'zod';

export const POST = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const targetId = z.string().uuid().parse(id);
  await rateLimit(`blocks:${user.id}`, {
    limit: 30,
    window: '1 m',
    endpoint: '/api/users/[id]/block',
  });
  return Response.json(await BlockService.block(user.id, targetId));
});

export const DELETE = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  return Response.json(await BlockService.unblock(user.id, z.string().uuid().parse(id)));
});
