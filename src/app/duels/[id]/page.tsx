import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resolveDuelAtDeadline } from '@/lib/duels/resolution';
import { DuelDetailContent } from './DuelDetailContent';

export const revalidate = 0;

export default async function DuelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([getAuthUser(), params]);
  if (!user) redirect('/login');

  const current = await prisma.duel.findUnique({
    where: { id },
    select: { status: true, started_at: true, time_limit_seconds: true },
  });
  if (!current) notFound();

  if (
    current.status === 'ACTIVE' &&
    current.started_at &&
    current.started_at.getTime() + current.time_limit_seconds * 1000 <= Date.now()
  ) {
    await resolveDuelAtDeadline(id);
  }

  const duel = await prisma.duel.findUnique({
    where: { id },
    include: {
      challenger: { select: { id: true, username: true, avatar_url: true } },
      opponent: { select: { id: true, username: true, avatar_url: true } },
      winner: { select: { id: true, username: true } },
      solutions: {
        where: { user_id: user.id },
        select: {
          id: true,
          user_id: true,
          code: true,
          score: true,
          runtime_ms: true,
          complexity: true,
          submitted_at: true,
        },
      },
      submissions: {
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        take: 20,
        select: {
          id: true,
          status: true,
          passed_tests: true,
          total_tests: true,
          runtime_ms: true,
          complexity: true,
          complexity_score: true,
          score: true,
          created_at: true,
        },
      },
      evaluations: {
        orderBy: { created_at: 'desc' },
        take: 1,
        select: {
          type: true,
          score_player1: true,
          score_player2: true,
          human_feedback: true,
          created_at: true,
        },
      },
    },
  });
  if (!duel) notFound();

  const isParticipant = duel.challenger_id === user.id || duel.opponent_id === user.id;
  if (
    duel.status === 'ACTIVE' &&
    !isParticipant &&
    user.role !== 'EVALUATOR' &&
    user.role !== 'ADMIN'
  ) {
    redirect('/duels');
  }

  return (
    <DuelDetailContent
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        total_xp: user.total_xp,
      }}
      initialDuel={{
        ...duel,
        created_at: duel.created_at.toISOString(),
        match_deadline: duel.match_deadline?.toISOString() ?? null,
        started_at: duel.started_at?.toISOString() ?? null,
        finished_at: duel.finished_at?.toISOString() ?? null,
        solutions: duel.solutions.map((solution) => ({
          ...solution,
          submitted_at: solution.submitted_at.toISOString(),
        })),
        submissions: duel.submissions.map((submission) => ({
          ...submission,
          created_at: submission.created_at.toISOString(),
        })),
        evaluations: duel.evaluations.map((evaluation) => ({
          ...evaluation,
          created_at: evaluation.created_at.toISOString(),
        })),
      }}
    />
  );
}
