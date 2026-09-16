import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { requireCompanyAccess } from '@/lib/mobile/company-access';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { JobStatus } from '@prisma/client';
const schema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(20000).optional(),
  status: z.nativeEnum(JobStatus).optional(),
});
export const PATCH = apiHandler(async (req, { params }) => {
  const user = await requireAuth();
  const { id } = await params;
  const job = await prisma.job.findUniqueOrThrow({ where: { id } });
  await requireCompanyAccess(job.company_id, user);
  return Response.json(
    await prisma.job.update({ where: { id }, data: schema.parse(await req.json()) })
  );
});
