import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import catalog from '@/lib/enade/exams.json';
import { requireEnadeUserId } from '@/lib/enade/hub.server';
import { importLegacyProgress } from '@/lib/enade/attempts.server';

/** Old edition links now open the latest attempt of that edition, or the simulations list. */
export default async function LegacyEditionPage({ params }: { params: Promise<{ year: string }> }) {
  const userId = await requireEnadeUserId();
  const { year } = await params;
  const exam = catalog.find((edition) => String(edition.year) === year);
  if (!exam) notFound();
  await importLegacyProgress(userId);
  const latest = await prisma.enadeAttempt.findFirst({
    where: {
      user_id: userId,
      kind: 'STANDARD',
      source_year: exam.year,
      status: { not: 'ABANDONED' },
    },
    orderBy: [{ status: 'asc' }, { updated_at: 'desc' }],
    select: { id: true },
  });
  redirect(latest ? `/trails/enade/simulados/${latest.id}` : '/trails/enade/simulados');
}
