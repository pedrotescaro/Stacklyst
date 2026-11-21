import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { BlockService } from '@/services/block.service';
import { getConversationAccess } from '@/services/chat-privacy.service';

export const GET = apiHandler(async (request) => {
  const user = await requireAuth();
  const partner = z
    .string()
    .min(1)
    .max(128)
    .parse(new URL(request.url).searchParams.get('partner'));
  await BlockService.assertCanInteract(user.id, partner);
  return Response.json(await getConversationAccess(user.id, partner), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
