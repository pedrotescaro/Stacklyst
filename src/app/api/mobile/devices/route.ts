import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const schema = z.object({
  token: z.string().regex(/^(ExponentPushToken|ExpoPushToken)\[[\w-]+\]$/),
  enabled: z.boolean().default(true),
});
export const PUT = apiHandler(async (req) => {
  const user = await requireAuth();
  const { token, enabled } = schema.parse(await req.json());
  await prisma.mobileDevice.upsert({
    where: { token },
    create: { token, user_id: user.id, enabled },
    update: { user_id: user.id, enabled },
  });
  return Response.json({ success: true });
});
export const DELETE = apiHandler(async (req) => {
  const user = await requireAuth();
  const { token } = schema.parse(await req.json());
  await prisma.mobileDevice.deleteMany({ where: { token, user_id: user.id } });
  return Response.json({ success: true });
});
