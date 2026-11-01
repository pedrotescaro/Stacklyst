// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { LEARNING_COURSES, LEARNING_LESSONS } from '@/lib/learning/catalog';
import { buildCredentialCatalog, credentialGoalProgress, firstLessonGoal } from '../catalog';
import { CREDENTIAL_LANGUAGES, credentialDefinitionSchema } from '../types';

describe('credential requirements', () => {
  it('covers real foundation courses, sections and practices in all six languages with nonempty validated requirements', () => {
    const { goals } = buildCredentialCatalog();
    expect(new Set(goals.map((goal) => goal.definition.id)).size).toBe(goals.length);
    for (const language of CREDENTIAL_LANGUAGES) {
      const course = goals.find(
        (goal) => goal.definition.id === `course:foundations-${language.toLowerCase()}`
      )!;
      expect(course.definition.language).toBe(language);
      expect(course.checks.length).toBeGreaterThan(0);
      expect(
        goals.some(
          (goal) => goal.definition.kind === 'section' && goal.definition.language === language
        )
      ).toBe(true);
      expect(
        goals.some(
          (goal) => goal.definition.kind === 'practice' && goal.definition.language === language
        )
      ).toBe(true);
    }
    for (const { definition, checks } of goals) {
      expect(credentialDefinitionSchema.safeParse(definition).success, definition.id).toBe(true);
      expect(checks.length).toBeGreaterThan(0);
      expect(JSON.stringify(definition)).not.toMatch(
        /solutionCode|correctOptionIndex|expected_output|email/
      );
    }
  });
  it('requires every assessed step and preserves a single generic first-lesson milestone', () => {
    const lesson = LEARNING_LESSONS.get('learn-python-first-output')!;
    const required = lesson.steps
      .filter((step) => step.type !== 'concept_explanation')
      .map((step) => step.id);
    const lessons = new Map([[lesson.id, lesson]]);
    const partial = firstLessonGoal(lessons, new Set(required.slice(0, 1)));
    expect(partial.definition.id).toBe('first-lesson');
    expect(credentialGoalProgress(partial, new Set(required.slice(0, 1)), new Set()).eligible).toBe(
      false
    );
    const complete = firstLessonGoal(lessons, new Set(required));
    expect(complete.definition.language).toBe('PYTHON');
    expect(complete.definition.requirements).toEqual([
      { id: lesson.id, title: lesson.title, source: 'lesson' },
    ]);
    expect(credentialGoalProgress(complete, new Set(required), new Set()).eligible).toBe(true);
  });
  it('does not grant a course for a section jump, partial lesson or empty requirement set', () => {
    const { goals } = buildCredentialCatalog();
    const course = goals.find((goal) => goal.definition.id === 'course:foundations-js')!;
    const steps = new Set(LEARNING_COURSES[0].lessons[0].steps.map((step) => step.id));
    steps.add('trail-jump-js-foundations-js-s8');
    expect(credentialGoalProgress(course, steps, new Set()).eligible).toBe(false);
    expect(credentialGoalProgress({ ...course, checks: [] }, steps, new Set()).eligible).toBe(
      false
    );
  });
  it('never infers a legacy curriculum from unknown path names or unsupported languages', () => {
    const { goals } = buildCredentialCatalog({
      completedStepIds: new Set(['js-fake-react-s1-u1-s2', 'cpp-algorithms-s1-u1-s2']),
    });
    expect(goals.some((goal) => goal.definition.id.includes('curriculum:'))).toBe(false);
    const known = buildCredentialCatalog({
      completedStepIds: new Set(['go-algorithms-s1-u1-code-1-s1']),
    });
    expect(known.goals.some((goal) => goal.definition.id === 'path:curriculum:GO:algorithms')).toBe(
      true
    );
  });
  it('never certifies a database practice without tests or a path with an empty required node', () => {
    const base = {
      id: 'exercise',
      title: 'Practice',
      language: 'JS',
      knowledge_node_id: 'node',
      estimated_minutes: 5,
    };
    const empty = buildCredentialCatalog({ exercises: [{ ...base, testCount: 0 }] });
    expect(empty.goals.some((goal) => goal.definition.id === 'practice:exercise:exercise')).toBe(
      false
    );
    const full = buildCredentialCatalog({
      exercises: [{ ...base, testCount: 2 }],
      paths: [
        {
          id: 'path',
          slug: 'path',
          title: 'Path',
          description: 'Valid path',
          nodes: [
            { id: 'node', title: 'First', language: 'JS' },
            { id: 'empty', title: 'Empty', language: 'JS' },
          ],
        },
      ],
    });
    expect(full.goals.some((goal) => goal.definition.id.startsWith('path:database:'))).toBe(false);
  });
});
