import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { BlockService } from '@/services/block.service';

export const GET = apiHandler(async () => {
  const user = await requireAuth();
  return Response.json(await BlockService.list(user.id), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
