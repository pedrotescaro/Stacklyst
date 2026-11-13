import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { getLessonById } from '@/lib/lessons/registry';
import { getLessonProgress } from '@/lib/learning/lesson-progress';
import {
  STAR_LESSON_ID_PATTERN,
  TRAIL_STARS_STATE_KEY,
  parseStoredStars,
} from '@/lib/lessons/game';

const bodySchema = z.object({
  lessonId: z.string().max(120).regex(STAR_LESSON_ID_PATTERN),
  stars: z.number().int().min(1).max(3),
});

/**
 * Records the best star rating of a finished trail lesson. Stars are cosmetic
 * (no XP); they only go up and only for lessons whose steps are all completed.
 */
export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const { lessonId, stars } = bodySchema.parse(await req.json());
  const lesson = getLessonById(lessonId);
  if (!lesson || lesson.id !== lessonId) {
    throw new AppError('LESSON_NOT_FOUND', 'Lição não encontrada.', 404);
  }
  const completed = new Set(await getLessonProgress(user.id, lesson));
  const required = lesson.steps.filter(
    (step) => step.type !== 'concept_explanation' && !step.practice
  );
  if (!required.every((step) => completed.has(step.id))) {
    throw new AppError('LESSON_INCOMPLETE', 'Conclua a lição para registrar as estrelas.', 409);
  }

  const key = { user_id: user.id, key: TRAIL_STARS_STATE_KEY };
  const best = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${TRAIL_STARS_STATE_KEY}:${user.id}`}))`;
    const row = await tx.mobileState.findUnique({ where: { user_id_key: key } });
    const current = parseStoredStars(row?.value);
    const value = Math.max(current[lessonId] ?? 0, stars);
    if (value === current[lessonId]) return value;
    const next = { ...current, [lessonId]: value };
    if (row) {
      await tx.mobileState.update({
        where: { user_id_key: key },
        data: { value: next, version: { increment: 1 } },
      });
    } else {
      await tx.mobileState.create({ data: { ...key, value: next } });
    }
    return value;
  });

  return NextResponse.json({ lessonId, stars: best }, { headers: { 'Cache-Control': 'no-store' } });
});
