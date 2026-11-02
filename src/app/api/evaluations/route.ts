import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireEvaluator } from '@/lib/auth';
import { EvaluatorService } from '@/services/evaluator.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getReviewableLanguages } from '@/lib/evaluators/policy';
import { ForbiddenError } from '@/lib/errors';
import type { Prisma } from '@prisma/client';
import { reconcileDuelReview } from '@/lib/duels/resolution';

const evaluationSchema = z.object({
  duel_id: z.string().min(1),
  score_player1: z.number().int().min(0).max(1000),
  score_player2: z.number().int().min(0).max(1000),
  winner_id: z.string().min(1),
  human_feedback: z.string().trim().min(5, 'Adicione um feedback explicativo'),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
});

// GET /api/evaluations: List duels awaiting evaluation or recently evaluated
export const GET = apiHandler(async (req) => {
  const evaluator = await requireEvaluator();
  const profile = await prisma.evaluatorProfile.findUnique({
    where: { user_id: evaluator.id },
  });
  const reviewableLanguages = profile ? getReviewableLanguages(profile.tech_stack) : [];
  if (
    evaluator.role !== 'ADMIN' &&
    (!profile || !['ACTIVE', 'PROBATION'].includes(profile.status))
  ) {
    throw new ForbiddenError(
      'EVALUATOR_INACTIVE',
      'Seu perfil de avaliador está suspenso ou revogado.'
    );
  }

  const requestedDuelId = z
    .string()
    .trim()
    .min(1)
    .max(128)
    .optional()
    .parse(new URL(req.url).searchParams.get('duel') ?? undefined);
  const where: Prisma.DuelWhereInput = {
    status: 'REVIEW_PENDING',
    challenger_id: { not: evaluator.id },
    opponent_id: { not: evaluator.id },
    solutions: { some: {} },
    language: evaluator.role === 'ADMIN' ? undefined : { in: reviewableLanguages },
  };
  const include = {
    challenger: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
    opponent: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
    solutions: {
      include: {
        user: { select: { id: true, username: true } },
      },
    },
    evaluations: {
      include: {
        evaluator: { select: { id: true, username: true, avatar_url: true } },
      },
    },
  } satisfies Prisma.DuelInclude;
  const repairs = await prisma.duel.findMany({
    where: { ...where, ...(requestedDuelId ? { id: requestedDuelId } : {}) },
    select: { id: true },
    take: 20,
    orderBy: { created_at: 'desc' },
  });
  for (const duel of repairs) await reconcileDuelReview(duel.id);
  const pendingDuels = await prisma.duel.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: 20,
    include,
  });
  // Notifications may reference an older item beyond the first page. Apply exactly the
  // same participant, profile and language restrictions before including that target.
  if (requestedDuelId && !pendingDuels.some((duel) => duel.id === requestedDuelId)) {
    const requested = await prisma.duel.findFirst({
      where: { AND: [where, { id: requestedDuelId }] },
      include,
    });
    if (requested) pendingDuels.unshift(requested);
  }

  return NextResponse.json(pendingDuels);
});

// POST /api/evaluations: Submit human code review
export const POST = apiHandler(async (req) => {
  const evaluator = await requireEvaluator();
  const body = await req.json();
  const parsed = evaluationSchema.parse(body);

  const evaluation = await EvaluatorService.submitDuelEvaluation({
    duelId: parsed.duel_id,
    evaluatorId: evaluator.id,
    scorePlayer1: parsed.score_player1,
    scorePlayer2: parsed.score_player2,
    winnerId: parsed.winner_id,
    humanFeedback: parsed.human_feedback,
    strengths: parsed.strengths,
    improvements: parsed.improvements,
  });

  return NextResponse.json({
    success: true,
    message: 'Avaliação técnica submetida com sucesso!',
    evaluation,
  });
});
