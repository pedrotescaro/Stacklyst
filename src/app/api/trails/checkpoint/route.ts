import { Language } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { TRAILS_DATA } from '@/lib/trailsData';
import { saveLessonAssessment } from '@/lib/learning/lesson-progress';
import type { Lesson, LessonStep } from '@/lib/lessons/types';

const schema = z.object({
  checkpointId: z.string().max(100),
  language: z.nativeEnum(Language),
  unitNumber: z.number().int().positive(),
});
export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const { checkpointId, language, unitNumber } = schema.parse(await req.json());
  const levels = (TRAILS_DATA[language] ?? []).filter((level) => level.unitNumber === unitNumber);
  if (!levels.length || checkpointId !== `${language.toLowerCase()}-u${unitNumber}-checkpoint`)
    throw new AppError('CHECKPOINT_NOT_FOUND', 'Checkpoint inexistente.', 404);
  const ids = levels.flatMap((level) => level.questions.map((q) => q.id));
  const count = await prisma.quizAttempt.count({
    where: { user_id: user.id, quiz_id: { in: ids }, is_correct: true },
  });
  if (count !== ids.length)
    throw new AppError(
      'CHECKPOINT_LOCKED',
      'Conclua todos os exercícios da unidade antes de resgatar o checkpoint.',
      403
    );
  const step: LessonStep = {
    id: checkpointId,
    type: 'concept_explanation',
    title: `Conclusão da unidade ${unitNumber}`,
    xp: 50,
  };
  const lesson: Lesson = {
    id: checkpointId,
    title: step.title,
    description: 'Checkpoint legado validado',
    language,
    unitNumber,
    levelNumber: 1,
    xpReward: 50,
    difficulty: 'iniciante',
    estimatedTime: '1 min',
    steps: [step],
  };
  const result = await saveLessonAssessment(user.id, lesson, step, true, 0);
  return NextResponse.json({
    ok: true,
    xpEarned: result.xpEarned,
    xpResult: result.xpResult
      ? {
          newTotalXp: result.totalXp,
          newLanguageXp: result.xpResult.newXp,
          newLanguageLevel: result.xpResult.newLevel,
        }
      : null,
  });
});
