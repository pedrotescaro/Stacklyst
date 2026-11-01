// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { LEARNING_LESSONS } from '../catalog';
import { HANDCRAFTED_LESSONS } from '@/lib/lessons/registry';
import { assessLessonStep } from '../assessment';

const lessons = new Map([
  ...LEARNING_LESSONS,
  ...Object.values(HANDCRAFTED_LESSONS).map((lesson) => [lesson.id, lesson] as const),
]);

describe('authored lessons through the production JavaScript sandbox', () => {
  for (const lesson of lessons.values()) {
    if (!['JS', 'TS'].includes(lesson.language)) continue;
    for (const step of lesson.steps) {
      if (!step.solutionCode) continue;
      it(`${lesson.id}/${step.id}: reference passes Run and Submit without external services`, async () => {
        const external = vi
          .spyOn(globalThis, 'fetch')
          .mockRejectedValue(new Error('External execution is not allowed in this check.'));
        try {
          for (const action of ['run', 'submit'] as const) {
            const result = await assessLessonStep(lesson, step, {
              action,
              stepId: step.id,
              code: step.solutionCode,
            });
            expect(result.isCorrect, `${action}: ${JSON.stringify(result)}`).toBe(true);
            expect('unavailable' in result && result.unavailable).toBe(false);
          }
          expect(external).not.toHaveBeenCalled();
        } finally {
          external.mockRestore();
        }
      });
    }
  }
});
