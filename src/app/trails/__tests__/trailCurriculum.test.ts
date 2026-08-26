import { describe, expect, it } from 'vitest';
import {
  buildTrailCodeLessonId,
  buildTrailLessonId,
  CURRICULUM_BY_SLUG,
  getCompletedTrailLessonIds,
  getTrailCurriculum,
  parseTrailLessonStepId,
} from '@/app/trails/trailCurriculum';
import type { LearningPathSummary } from '@/lib/learning/types';
import { evaluateCodeEditor } from '@/lib/lessons/evaluators';
import { findCurriculumLessonStepById, getLessonById } from '@/lib/lessons/registry';

function createPath(slug: string, title: string): LearningPathSummary {
  return {
    id: slug,
    slug,
    title,
    description: title,
    accentColor: '#3b82f6',
    estimatedMinutes: 600,
    featured: false,
    nodeIds: ['node'],
    completedNodes: 0,
    totalNodes: 1,
    progressPercent: 0,
    nextRecommendedNodeId: 'node',
  };
}

describe('trailCurriculum', () => {
  it.each([
    ['frontend-react', 'Frontend React'],
    ['javascript-systems', 'JavaScript para Sistemas'],
    ['algorithms', 'Algoritmos Aplicados'],
    ['backend-data', 'Backend e Dados'],
  ])('provides a distinct 32-unit plan for %s', (slug, title) => {
    const curriculum = getTrailCurriculum(createPath(slug, title));
    const sectionTitles = curriculum.sections.map((section) => section.title);
    const units = curriculum.sections.flatMap((section) => section.units);

    expect(curriculum.sections).toHaveLength(8);
    expect(new Set(sectionTitles).size).toBe(8);
    expect(units).toHaveLength(32);
    expect(new Set(units.map((unit) => unit.title)).size).toBe(32);
    expect(units.every((unit) => unit.description.length > 40)).toBe(true);
  });

  it('keeps route-specific subjects instead of repeating fundamentals', () => {
    const frontend = getTrailCurriculum(createPath('frontend-react', 'Frontend React'));
    const systems = getTrailCurriculum(
      createPath('javascript-systems', 'JavaScript para Sistemas')
    );
    const algorithms = getTrailCurriculum(createPath('algorithms', 'Algoritmos Aplicados'));
    const backend = getTrailCurriculum(createPath('backend-data', 'Backend e Dados'));

    expect(frontend.sections[1]?.title).toBe('Componentes e composição');
    expect(systems.sections[4]?.title).toBe('Fluxos assíncronos');
    expect(algorithms.sections[6]?.title).toBe('Grafos e dependências');
    expect(backend.sections[4]?.title).toBe('Consultas PostgreSQL');
  });

  it('builds 128 distinct lessons with globally unique activities', () => {
    const lessons = Object.entries(CURRICULUM_BY_SLUG).flatMap(([pathSlug, curriculum]) =>
      curriculum.sections.flatMap((section, sectionIndex) =>
        section.units.map((_, unitIndex) =>
          getLessonById(buildTrailLessonId('JS', pathSlug, sectionIndex + 1, unitIndex + 1))
        )
      )
    );

    expect(lessons).toHaveLength(128);
    expect(lessons.every(Boolean)).toBe(true);

    const lessonIds = lessons.map((lesson) => lesson!.id);
    const stepIds = lessons.flatMap((lesson) => lesson!.steps.map((step) => step.id));
    const lessonSignatures = lessons.map((lesson) =>
      JSON.stringify({
        title: lesson!.title,
        description: lesson!.description,
        steps: lesson!.steps.map((step) => ({
          title: step.title,
          question: step.question,
          instruction: step.instruction,
          codeSnippet: step.codeSnippet,
        })),
      })
    );

    expect(new Set(lessonIds).size).toBe(128);
    expect(stepIds).toHaveLength(640);
    expect(new Set(stepIds).size).toBe(640);
    expect(new Set(lessonSignatures).size).toBe(128);
  });

  it('marks a lesson complete only after its five distinct activities are correct', () => {
    const lessonId = buildTrailLessonId('JS', 'frontend-react', 2, 3);
    const firstFour = [1, 2, 3, 4].map((step) => `${lessonId}-s${step}`);

    expect(getCompletedTrailLessonIds(firstFour)).toEqual([]);
    expect(getCompletedTrailLessonIds([...firstFour, `${lessonId}-s5`])).toEqual([lessonId]);
    expect(parseTrailLessonStepId(`${lessonId}-s5`)).toMatchObject({
      lessonId,
      pathSlug: 'frontend-react',
      sectionNumber: 2,
      unitNumber: 3,
      stepNumber: 5,
    });
  });

  it('builds and solves unique LeetCode-style challenges for every route, section, unit, and slot', async () => {
    const lessons = Object.entries(CURRICULUM_BY_SLUG).flatMap(([pathSlug, curriculum]) =>
      curriculum.sections.flatMap((section, sectionIndex) =>
        section.units.flatMap((_, unitIndex) =>
          ([1, 2] as const).map((challengeSlot) =>
            getLessonById(
              buildTrailCodeLessonId('JS', pathSlug, sectionIndex + 1, unitIndex + 1, challengeSlot)
            )
          )
        )
      )
    );

    expect(lessons).toHaveLength(256);
    expect(lessons.every(Boolean)).toBe(true);

    const lessonIds = lessons.map((lesson) => lesson!.id);
    const challengeSignatures = lessons.map((lesson) => {
      const step = lesson!.steps[0]!;
      return JSON.stringify({
        lessonTitle: lesson!.title,
        stepTitle: step.title,
        instruction: step.instruction,
        checkCode: step.checkCode,
        expectedOutput: step.expectedOutput,
      });
    });

    expect(new Set(lessonIds).size).toBe(256);
    expect(new Set(challengeSignatures).size).toBe(256);
    expect(
      lessons.every(
        (lesson) =>
          lesson!.steps.length === 1 &&
          lesson!.steps[0]?.type === 'code_editor' &&
          (lesson!.steps[0]?.testCases?.length ?? 0) > 0
      )
    ).toBe(true);

    const invalidSolutions: string[] = [];
    for (const lesson of lessons) {
      const step = lesson!.steps[0]!;
      const outcome = await evaluateCodeEditor(
        step.solutionCode ?? '',
        lesson!.language,
        step.checkCode,
        step.expectedOutput
      );
      if (!outcome.isCorrect) invalidSolutions.push(lesson!.id);
    }
    expect(invalidSolutions).toEqual([]);
  });

  it('persists a code challenge as one exclusive activity', () => {
    const lessonId = buildTrailCodeLessonId('JS', 'algorithms', 3, 2, 1);
    const stepId = `${lessonId}-s1`;
    const lesson = getLessonById(lessonId);
    const context = findCurriculumLessonStepById(stepId);

    expect(lesson).toMatchObject({
      id: lessonId,
      language: 'JS',
      xpReward: 35,
    });
    expect(lesson?.steps[0]).toMatchObject({
      id: stepId,
      type: 'code_editor',
      expectedOutput: 'OK',
    });
    expect(context?.lesson.id).toBe(lessonId);
    expect(context?.step.id).toBe(stepId);
    expect(parseTrailLessonStepId(stepId)).toMatchObject({
      kind: 'code',
      lessonId,
      pathSlug: 'algorithms',
      sectionNumber: 3,
      unitNumber: 2,
      challengeSlot: 1,
      requiredSteps: 1,
    });
    expect(getCompletedTrailLessonIds([stepId])).toEqual([lessonId]);
  });
});
