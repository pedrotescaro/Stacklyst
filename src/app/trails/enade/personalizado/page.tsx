import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireEnadeUserId } from '@/lib/enade/hub.server';
import { importLegacyProgress } from '@/lib/enade/attempts.server';

/** The former single custom slot: resume the running custom attempt or configure a new one. */
export default async function LegacyCustomPage() {
  const userId = await requireEnadeUserId();
  await importLegacyProgress(userId);
  const running = await prisma.enadeAttempt.findFirst({
    where: { user_id: userId, kind: 'CUSTOM', status: 'IN_PROGRESS' },
    orderBy: { updated_at: 'desc' },
    select: { id: true },
  });
  redirect(
    running ? `/trails/enade/simulados/${running.id}` : '/trails/enade/simulados#personalizado'
  );
}
