import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export const GET = apiHandler(async () => {
  const user = await requireAuth();
  return Response.json(
    await prisma.jobApplication.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 100,
      include: { job: { select: { id: true, title: true } }, stage: true },
    })
  );
});
