// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { saveLessonAssessment } from '../lesson-progress';
import { LEARNING_LESSONS } from '../catalog';

// Explicitly opt in: only this disposable user's records are written or removed.
describe.skipIf(process.env.LEARNING_DB_TEST !== '1')(
  'lesson persistence against PostgreSQL',
  () => {
    const id = randomUUID();
    const lesson = LEARNING_LESSONS.get('learn-js-first-output')!;
    let created = false;
    afterAll(async () => {
      if (created) await prisma.user.delete({ where: { id } });
      await prisma.$disconnect();
    });
    it('saves incorrect → correct, serializes concurrent retries and preserves XP on review', async () => {
      await prisma.user.create({
        data: { id, username: `qa_${id}`, email: `${id}@example.invalid` },
      });
      created = true;
      const step = lesson.steps.find((s) => s.type !== 'concept_explanation')!;
      const wrong = await saveLessonAssessment(id, lesson, step, false, 0);
      expect(wrong.xpEarned).toBe(0);
      expect(wrong.completedStepIds).not.toContain(step.id);
      const results = await Promise.all([
        saveLessonAssessment(id, lesson, step, true, 0),
        saveLessonAssessment(id, lesson, step, true, 0),
        saveLessonAssessment(id, lesson, step, true, 0),
      ]);
      expect(results.reduce((xp, result) => xp + result.xpEarned, 0)).toBe(step.xp);
      const review = await saveLessonAssessment(id, lesson, step, false, 0);
      expect(review.xpEarned).toBe(0);
      expect(review.completedStepIds).toContain(step.id);
      const user = await prisma.user.findUniqueOrThrow({ where: { id } });
      expect(user.total_xp).toBe(step.xp);
      expect(await prisma.quizAttempt.count({ where: { user_id: id, quiz_id: step.id } })).toBe(1);
      const language = await prisma.languageTrail.findMany({ where: { user_id: id } });
      expect(language.reduce((sum, trail) => sum + trail.xp, 0)).toBe(step.xp);
    }, 90000);
  }
);
