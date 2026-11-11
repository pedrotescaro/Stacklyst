import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import catalog from '@/lib/enade/exams.json';
import type { EnadeAttempt } from '@/lib/enade/types';
import { EnadeSimulation } from '../EnadeSimulation';

export default async function EnadeSimulationPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  const { year } = await params;
  const exam = catalog.find((edition) => String(edition.year) === year);
  if (!exam) notFound();
  const progress = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: user.id, key: `enade-ads-${exam.year}` } },
    select: { value: true },
  });
  return (
    <EnadeSimulation
      key={`${user.id}:${exam.year}`}
      userId={user.id}
      year={exam.year}
      initialAttempt={progress?.value as unknown as EnadeAttempt | undefined}
    />
  );
}
