import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireEvaluator } from '@/lib/auth';
import { EvaluatorService } from '@/services/evaluator.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const evaluationSchema = z.object({
  duel_id: z.string(),
  score_player1: z.number().min(0).max(1000),
  score_player2: z.number().min(0).max(1000),
  winner_id: z.string().min(1),
  human_feedback: z.string().min(5, 'Adicione um feedback explicativo'),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
});

// GET /api/evaluations: List duels awaiting evaluation or recently evaluated
export const GET = apiHandler(async () => {
  const evaluator = await requireEvaluator();

  const pendingDuels = await prisma.duel.findMany({
    where: {
      status: 'REVIEW_PENDING',
      challenger_id: { not: evaluator.id },
      opponent_id: { not: evaluator.id },
      solutions: { some: {} },
    },
    orderBy: { created_at: 'desc' },
    take: 20,
    include: {
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
    },
  });

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
