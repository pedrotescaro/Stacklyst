import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { AppError } from '@/lib/errors';

const keySchema = z.string().regex(/^(preferences|draft:[a-zA-Z0-9:_-]{1,180})$/);
const bodySchema = z.object({
  version: z.number().int().min(0),
  value: z.union([
    z.string().max(20000),
    z.record(
      z.string(),
      z.union([z.string().max(2000), z.number(), z.boolean(), z.array(z.string().max(100)).max(30)])
    ),
  ]),
});
export const GET = apiHandler(async (_req, { params }) => {
  const user = await requireAuth();
  const key = keySchema.parse((await params).key);
  return Response.json(
    await prisma.mobileState.findUnique({ where: { user_id_key: { user_id: user.id, key } } })
  );
});
export const PUT = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const key = keySchema.parse((await params).key);
  const body = bodySchema.parse(await req.json());
  const where = { user_id: user.id, key };
  if (body.version === 0) {
    try {
      return Response.json(
        await prisma.mobileState.create({ data: { ...where, value: body.value } })
      );
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2002') throw error;
    }
  } else {
    const result = await prisma.mobileState.updateMany({
      where: { ...where, version: body.version },
      data: { value: body.value, version: { increment: 1 } },
    });
    if (result.count) return Response.json({ value: body.value, version: body.version + 1 });
  }
  throw new AppError(
    'DRAFT_CONFLICT',
    'Existe uma versão mais recente. Compare antes de substituir.',
    409
  );
});
