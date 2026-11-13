import { describe, expect, it } from 'vitest';
import { LEARNING_COURSES, LEARNING_LESSONS } from '../catalog';
import { completedLearningBossIds, learningBossId } from '../gamify';
import { getLessonById } from '@/lib/lessons/registry';

const required = (steps: { id: string; type: string; practice?: boolean }[]) =>
  steps
    .filter((step) => step.type !== 'concept_explanation' && !step.practice)
    .map((step) => step.id)
    .sort();

describe('gamified learning catalog', () => {
  const lessons = [...LEARNING_LESSONS.values()];

  it('keeps every original step id and the exact completion contract', () => {
    for (const lesson of lessons) {
      const served = getLessonById(lesson.id)!;
      const servedIds = new Set(served.steps.map((step) => step.id));
      for (const step of lesson.steps) expect(servedIds.has(step.id)).toBe(true);
      expect(required(served.steps)).toEqual(required(lesson.steps));
      for (const step of served.steps.filter((s) => !lesson.steps.some((o) => o.id === s.id))) {
        expect(step.practice).toBe(true);
        expect(step.id.startsWith(`${lesson.id}-practice-`)).toBe(true);
      }
    }
  });

  it('serves gradable, shuffled answers with the same correct text', () => {
    for (const lesson of lessons) {
      const served = getLessonById(lesson.id)!;
      for (const step of served.steps) {
        if (step.options && step.correctOptionIndex !== undefined) {
          expect(step.correctOptionIndex).toBeGreaterThanOrEqual(0);
          const original = lesson.steps.find((o) => o.id === step.id);
          if (original?.options && original.correctOptionIndex !== undefined) {
            expect(step.options[step.correctOptionIndex]).toBe(
              original.options[original.correctOptionIndex]
            );
          }
        }
      }
      expect(served.mode?.lives).toBe(3);
    }
    const predictions = lessons
      .map((lesson) => getLessonById(lesson.id)!)
      .flatMap((lesson) => lesson.steps)
      .filter((step) => step.type === 'output_prediction' && !step.practice);
    const firstShare =
      predictions.filter((step) => step.correctOptionIndex === 0).length / predictions.length;
    expect(firstShare).toBeLessThan(0.5);
  });

  it('builds a seven-step boss for every unit and recognises its completion', () => {
    for (const course of LEARNING_COURSES) {
      const firsts = new Map<string, string>();
      for (const lesson of course.lessons) {
        if (!firsts.has(lesson.unitTitle)) firsts.set(lesson.unitTitle, lesson.id);
      }
      for (const first of firsts.values()) {
        const boss = getLessonById(learningBossId(first))!;
        expect(boss.steps).toHaveLength(7);
        expect(boss.mode?.kind).toBe('boss');
        expect(completedLearningBossIds(boss.steps.map((step) => step.id))).toEqual([boss.id]);
        expect(completedLearningBossIds(boss.steps.slice(1).map((step) => step.id))).toEqual([]);
      }
    }
  });

  it('gives consecutive lessons different shapes', () => {
    const course = LEARNING_COURSES.find((c) => c.id === 'review-python')!;
    const shapes = course.lessons.map((lesson) =>
      getLessonById(lesson.id)!
        .steps.map((step) => step.variant ?? step.type)
        .join(',')
    );
    expect(new Set(shapes).size).toBeGreaterThan(course.lessons.length * 0.6);
  });
});
