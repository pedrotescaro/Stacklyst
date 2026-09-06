import 'server-only';
import { Language } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { awardXPInTransaction } from '@/lib/xp';
import { getLearningLesson, isLessonComplete } from './catalog';
import type { Lesson, LessonStep } from '@/lib/lessons/types';
import { learningTransaction } from './transaction';

export async function getLessonProgress(userId: string, lesson: Lesson) {
  const rows = await prisma.quizAttempt.findMany({
    where: { user_id: userId, quiz_id: { in: lesson.steps.map((s) => s.id) }, is_correct: true },
    select: { quiz_id: true },
  });
  return rows.map((r) => r.quiz_id);
}
export async function requireLessonAccess(userId: string, lesson: Lesson) {
  const learning = getLearningLesson(lesson.id);
  if (!learning) return;
  const needed = learning.prerequisites
    .map((id) => getLearningLesson(id))
    .filter((l) => l !== null);
  if (!needed.length) return;
  const rows = await prisma.quizAttempt.findMany({
    where: {
      user_id: userId,
      is_correct: true,
      quiz_id: {
        in: [...needed.flatMap((l) => l.steps.map((s) => s.id)), ...lesson.steps.map((s) => s.id)],
      },
    },
    select: { quiz_id: true },
  });
  const done = new Set(rows.map((r) => r.quiz_id));
  // Keep legitimate already-completed lessons reviewable after a curriculum update.
  if (isLessonComplete(learning, done)) return;
  const missing = needed.filter((l) => !isLessonComplete(l, done));
  if (missing.length)
    throw new AppError(
      'LESSON_LOCKED',
      `Conclua primeiro: ${missing.map((l) => l.title).join(', ')}.`,
      403
    );
}
export async function saveLessonAssessment(
  userId: string,
  lesson: Lesson,
  step: LessonStep,
  isCorrect: boolean,
  selectedIndex: number
) {
  return learningTransaction(async (tx) => {
    // Same per-user lock across lessons, quizzes and exercise rewards; handles different activities concurrently.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`learning:${userId}`}))`;
    const where = { user_id_quiz_id: { user_id: userId, quiz_id: step.id } };
    const attempts = await tx.quizAttempt.findMany({
      where: { user_id: userId, quiz_id: { in: lesson.steps.map((s) => s.id) } },
      select: { quiz_id: true, is_correct: true },
    });
    const previous = attempts.find((attempt) => attempt.quiz_id === step.id);
    const firstCompletion = isCorrect && !previous?.is_correct;
    const xpEarned = firstCompletion ? Math.max(0, step.xp) : 0;
    if (!previous)
      await tx.quiz.upsert({
        where: { id: step.id },
        create: {
          id: step.id,
          question: step.question ?? step.instruction ?? step.title,
          options: step.options ?? ['Avaliado no servidor'],
          correct_index: step.correctOptionIndex ?? 0,
          is_daily: false,
        },
        update: {},
      });
    if (!previous)
      await tx.quizAttempt.create({
        data: {
          user_id: userId,
          quiz_id: step.id,
          selected_index: selectedIndex,
          is_correct: isCorrect,
          xp_earned: xpEarned,
        },
      });
    else if (firstCompletion)
      await tx.quizAttempt.update({
        where,
        data: { selected_index: selectedIndex, is_correct: true, xp_earned: xpEarned },
      });
    const xpResult =
      xpEarned > 0
        ? await awardXPInTransaction(
            tx,
            userId,
            Object.values(Language).includes(lesson.language as Language)
              ? (lesson.language as Language)
              : null,
            xpEarned
          )
        : null;
    const completedStepIds = attempts.filter((r) => r.is_correct).map((r) => r.quiz_id);
    if (firstCompletion) completedStepIds.push(step.id);
    const required = lesson.steps.filter((s) => s.type !== 'concept_explanation');
    const complete = required.length > 0 && required.every((s) => completedStepIds.includes(s.id));
    const totalXp =
      xpResult?.totalXp ??
      (
        await tx.user.findUniqueOrThrow({
          where: { id: userId },
          select: { total_xp: true },
        })
      ).total_xp;
    return {
      xpEarned,
      xpResult,
      firstCompletion,
      completedStepIds,
      lessonCompleted: complete,
      totalXp,
    };
  });
}
