import 'server-only';

import type { Language } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { awardXPInTransaction } from '@/lib/xp';
import {
  chooseBestDuelSubmission,
  decideDuelResolution,
  type ComparableSubmission,
  type DuelResolutionDecision,
} from '@/lib/duels/resolution-policy';
import { getAbandonmentUpdate } from '@/lib/duels/participation-policy';

export { chooseBestDuelSubmission, decideDuelResolution } from '@/lib/duels/resolution-policy';

export async function resolveDuelIfReady(duelId: string) {
  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: { submissions: { orderBy: { created_at: 'asc' } } },
  });
  if (!duel || duel.status !== 'ACTIVE' || !duel.opponent_id) return null;

  const first = chooseBestDuelSubmission(duel.submissions, duel.challenger_id, true);
  const second = chooseBestDuelSubmission(duel.submissions, duel.opponent_id, true);
  if (!first || !second) return null;

  const decision = decideDuelResolution({ first, second, reason: 'automatic_score' });
  if (!decision) return null;
  return persistResolution(duel, first, second, decision);
}

export async function resolveDuelAtDeadline(duelId: string) {
  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: { submissions: { orderBy: { created_at: 'asc' } } },
  });
  if (!duel || duel.status !== 'ACTIVE' || !duel.opponent_id) return null;

  const first = chooseBestDuelSubmission(duel.submissions, duel.challenger_id);
  const second = chooseBestDuelSubmission(duel.submissions, duel.opponent_id);
  const decision = decideDuelResolution({ first, second, reason: 'deadline_score' });
  if (!decision) return null;
  return persistResolution(duel, first, second, decision);
}

async function persistResolution(
  duel: {
    id: string;
    status: string;
    challenger_id: string;
    opponent_id: string | null;
    language: Language;
  },
  first: ComparableSubmission | null,
  second: ComparableSubmission | null,
  decision: DuelResolutionDecision
) {
  const targetStatus = decision.kind === 'review' ? 'REVIEW_PENDING' : 'CLOSED';
  const finishedAt = new Date();
  const xpAwardedAt = decision.kind === 'closed' && decision.winnerId ? finishedAt : null;
  const committed = await prisma.$transaction(async (tx) => {
    const claim = await tx.duel.updateMany({
      where: { id: duel.id, status: 'ACTIVE' },
      data: {
        status: targetStatus,
        winner_id: decision.winnerId,
        finished_at: finishedAt,
        closed_reason: decision.reason,
        xp_awarded_at: xpAwardedAt,
      },
    });
    if (claim.count !== 1) return false;

    for (const submission of [first, second]) {
      if (!submission) continue;
      await tx.duelSolution.upsert({
        where: { duel_id_user_id: { duel_id: duel.id, user_id: submission.user_id } },
        update: {
          code: submission.code,
          score: submission.score,
          runtime_ms: submission.runtime_ms,
          complexity: submission.complexity,
          submitted_at: submission.created_at,
        },
        create: {
          duel_id: duel.id,
          user_id: submission.user_id,
          code: submission.code,
          score: submission.score,
          runtime_ms: submission.runtime_ms,
          complexity: submission.complexity,
          submitted_at: submission.created_at,
        },
      });
    }

    await tx.duelEvaluation.create({
      data: {
        duel_id: duel.id,
        type: 'AUTOMATIC',
        score_player1: first?.score ?? 0,
        score_player2: second?.score ?? 0,
        strengths: [],
        improvements: [],
        system_analysis: {
          reason: decision.reason,
          scoreGap: decision.scoreGap,
          runtimeGap: decision.runtimeGap,
          firstSubmissionId: first?.id ?? null,
          secondSubmissionId: second?.id ?? null,
        },
      },
    });

    if (decision.kind === 'closed' && decision.winnerId) {
      await awardXPInTransaction(tx, decision.winnerId, duel.language, 50);
    }

    const participation = [
      { userId: duel.challenger_id, submitted: Boolean(first) },
      { userId: duel.opponent_id, submitted: Boolean(second) },
    ];
    for (const participant of participation) {
      if (!participant.userId) continue;
      if (participant.submitted) {
        await tx.user.update({
          where: { id: participant.userId },
          data: { consecutive_duel_abandons: 0 },
        });
        continue;
      }

      const user = await tx.user.findUnique({
        where: { id: participant.userId },
        select: { consecutive_duel_abandons: true },
      });
      if (!user) continue;
      await tx.user.update({
        where: { id: participant.userId },
        data: getAbandonmentUpdate(user.consecutive_duel_abandons, finishedAt),
      });
    }

    return true;
  });

  if (!committed) return null;

  return prisma.duel.findUnique({
    where: { id: duel.id },
    select: { id: true, status: true, winner_id: true, closed_reason: true, finished_at: true },
  });
}

export async function awardDuelWinnerXP(duelId: string, winnerId: string, language: Language) {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.duel.updateMany({
      where: { id: duelId, status: 'CLOSED', winner_id: winnerId, xp_awarded_at: null },
      data: { xp_awarded_at: new Date() },
    });
    if (claim.count !== 1) return null;
    return awardXPInTransaction(tx, winnerId, language, 50);
  });
}
