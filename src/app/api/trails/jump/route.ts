import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { buildTrailJumpId, TRAIL_SECTION_COUNT } from '@/lib/trails/jump';

const jumpSchema = z.object({
  pathSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  language: z.enum(['JS', 'TS', 'PYTHON', 'RUST', 'GO', 'JAVA']),
  sectionNumber: z.number().int().min(2).max(TRAIL_SECTION_COUNT),
  exerciseId: z.string().min(1).max(120),
});

export const POST = apiHandler(async (request) => {
  const user = await requireAuth();
  const { pathSlug, language, sectionNumber, exerciseId } = jumpSchema.parse(await request.json());

  const [path, exercise] = await Promise.all([
    prisma.learningPath.findUnique({
      where: { slug: pathSlug },
      select: {
        title: true,
        is_published: true,
        nodes: { select: { knowledge_node_id: true } },
      },
    }),
    prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { knowledge_node_id: true },
    }),
  ]);

  if (!path?.is_published || !exercise) {
    throw new NotFoundError('TRAIL_JUMP_NOT_FOUND', 'Desafio de salto não encontrado.');
  }

  const belongsToPath = path.nodes.some(
    (pathNode) => pathNode.knowledge_node_id === exercise.knowledge_node_id
  );
  if (!belongsToPath) {
    throw new ValidationError(
      'TRAIL_JUMP_EXERCISE_MISMATCH',
      'O exercício concluído não pertence a esta trilha.'
    );
  }

  const passedHardSubmission = await prisma.exerciseSubmission.findFirst({
    where: {
      user_id: user.id,
      exercise_id: exerciseId,
      status: 'PASSED',
      assistance_mode: 'HARD',
    },
    select: { id: true },
  });

  if (!passedHardSubmission) {
    throw new ValidationError(
      'TRAIL_JUMP_CHALLENGE_REQUIRED',
      'Conclua o desafio em modo Difícil antes de liberar esta seção.'
    );
  }

  const jumpId = buildTrailJumpId(language, pathSlug, sectionNumber);

  await prisma.$transaction([
    prisma.quiz.upsert({
      where: { id: jumpId },
      update: {
        question: `Salto para ${path.title} - Seção ${sectionNumber}`,
      },
      create: {
        id: jumpId,
        question: `Salto para ${path.title} - Seção ${sectionNumber}`,
        options: ['Desafio concluído'],
        correct_index: 0,
        is_daily: false,
      },
    }),
    prisma.quizAttempt.upsert({
      where: {
        user_id_quiz_id: {
          user_id: user.id,
          quiz_id: jumpId,
        },
      },
      update: { is_correct: true },
      create: {
        user_id: user.id,
        quiz_id: jumpId,
        selected_index: 0,
        is_correct: true,
        xp_earned: 0,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, jumpId, sectionNumber });
});
