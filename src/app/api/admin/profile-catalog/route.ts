import { apiHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProfileCatalog, saveProfileCatalog } from '@/services/profile-customization.service';
import { z } from 'zod';
export const GET = apiHandler(async () => {
  await requireAdmin();
  const row = await prisma.profileAchievementCatalog.findUnique({
    where: { id: 'profile-catalog' },
  });
  return Response.json(
    { catalog: await getProfileCatalog(), version: row?.version || 0 },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
});
export const PUT = apiHandler(async (request) => {
  await requireAdmin();
  const body = z
    .object({ version: z.number().int().min(0), catalog: z.unknown() })
    .strict()
    .parse(await request.json());
  return Response.json(await saveProfileCatalog(body.catalog, body.version), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
