import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireEnadeUser } from '@/lib/enade/hub.server';
import { enadeSessionSchema } from '@/lib/enade/simulator-schema';
import type { EnadeSession } from '@/lib/enade/simulator';
import { KIND_LABELS } from '@/lib/enade/attempts';
import { studyAids } from '@/lib/enade/aids.server';
import { EnadeSimulation } from '../../EnadeSimulation';

export const metadata = { title: 'Simulado ENADE · Stacklyst' };

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireEnadeUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const attempt = await prisma.enadeAttempt.findFirst({ where: { id, user_id: user.id } });
  if (!attempt || attempt.status === 'ABANDONED') notFound();
  const parsed = enadeSessionSchema.safeParse(attempt.state);
  if (!parsed.success) notFound();
  const session = parsed.data as EnadeSession;
  const favorites = await prisma.enadeFavorite.findMany({
    where: { user_id: user.id, kind: 'QUESTION', ref: { in: session.questionIds } },
    select: { ref: true },
  });
  return (
    <EnadeSimulation
      key={attempt.id}
      attemptId={attempt.id}
      title={attempt.title}
      kindLabel={KIND_LABELS[attempt.kind]}
      initialSession={session}
      aids={studyAids(session.questionIds)}
      favorites={favorites.map((f) => f.ref)}
    />
  );
}
