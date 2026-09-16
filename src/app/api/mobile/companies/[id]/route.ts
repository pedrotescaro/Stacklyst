import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { requireCompanyAccess } from '@/lib/mobile/company-access';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const schema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(5000),
  website: z.union([z.literal(''), z.url()]).optional(),
  location: z.string().max(200).optional(),
});
export const PATCH = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  await requireCompanyAccess(id, user);
  return Response.json(
    await prisma.company.update({ where: { id }, data: schema.parse(await req.json()) })
  );
});
