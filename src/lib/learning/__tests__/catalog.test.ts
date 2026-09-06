// @vitest-environment node
import { describe, it, expect } from 'vitest';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { LEARNING_COURSES, LEARNING_LESSONS, buildLearningMap, isLessonComplete } from '../catalog';
import { publicLesson } from '../assessment';
import { calculateLevel, getXpBand, usersAheadWhere } from '../rewards';

describe('curriculum contracts', () => {
  it('keeps unique IDs, explicit prerequisites, nonempty exercises and shared foundations', () => {
    for (const course of LEARNING_COURSES) {
      expect(new Set(course.lessons.map((l) => l.id)).size).toBe(course.lessons.length);
      const seen = new Set<string>();
      for (const lesson of course.lessons) {
        expect(lesson.steps.some((s) => s.type !== 'concept_explanation')).toBe(true);
        for (const required of lesson.prerequisites)
          expect(seen.has(required), `${lesson.id} requires ${required}`).toBe(true);
        seen.add(lesson.id);
        expect(lesson.xpReward).toBe(lesson.steps.reduce((n, s) => n + s.xp, 0));
        if (lesson.kind === 'project') {
          expect(lesson.project?.requirements.length).toBeGreaterThan(0);
          expect(lesson.project?.completion.length).toBeGreaterThan(0);
        }
      }
    }
  });
  it('has one node per lesson, exact exercise counts and unlocks only after all practice is saved', () => {
    const first = LEARNING_LESSONS.get('learn-js-first-output')!;
    const partial = buildLearningMap([first.steps[1].id]);
    expect(partial.nodes.find((n) => n.id === first.id)?.completedExercises).toBe(1);
    expect(partial.nodes.find((n) => n.id === 'learn-js-values')?.status).toBe('NOT_STARTED');
    const full = buildLearningMap(first.steps.map((s) => s.id));
    expect(full.nodes.find((n) => n.id === 'learn-js-values')?.status).toBe('AVAILABLE');
    expect(isLessonComplete(first, new Set(first.steps.map((s) => s.id)))).toBe(true);
    expect(full.paths.find((p) => p.id === 'frontend-react')?.completedNodes).toBe(1);
    expect(full.paths.find((p) => p.id === 'algorithms')?.completedNodes).toBe(1);
    for (const course of LEARNING_COURSES) {
      const path = full.paths.find((p) => p.id === course.id)!;
      expect(path.nodeIds).toEqual(course.lessons.map((l) => l.id));
      expect(path.totalNodes).toBe(course.lessons.length);
    }
  });
  it('does not repeat equivalent code solutions inside a course', () => {
    const normalize = (s: string) =>
      s
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\s+/g, '')
        .replace(/"[^"\n]*"|'[^'\n]*'/g, 'TEXT')
        .replace(/\b\d+\b/g, 'N');
    for (const course of LEARNING_COURSES) {
      const solutions = course.lessons.flatMap((l) =>
        l.steps.filter((s) => s.solutionCode).map((s) => normalize(s.solutionCode!))
      );
      expect(new Set(solutions).size, course.id).toBe(solutions.length);
    }
  });
  it('does not serialize solutions or hidden assessments', () => {
    for (const lesson of LEARNING_LESSONS.values())
      for (const step of publicLesson(lesson).steps) {
        expect(step.solutionCode).toBeUndefined();
        expect(step.evaluation).toBeUndefined();
        expect(step.checkCode).toBeUndefined();
        expect(step.correctOptionIndex).toBeUndefined();
      }
  });
});
describe('authored reference solutions', () => {
  for (const lesson of LEARNING_LESSONS.values()) {
    if (!['JS', 'TS', 'PYTHON'].includes(lesson.language)) continue;
    for (const step of lesson.steps.filter((s) => s.solutionCode)) {
      it(`${lesson.id}: accepts reference and rejects empty implementation`, async () => {
        if (lesson.language === 'PYTHON') {
          const result = spawnSync('python', ['-X', 'utf8', '-c', step.solutionCode!], {
            encoding: 'utf8',
            timeout: 5000,
          });
          expect(result.status, result.stderr).toBe(0);
          expect(result.stdout.replace(/\r/g, '').trim()).toBe(step.expectedOutput);
          return;
        }
        const logs: string[] = [];
        const context = vm.createContext({
          console: { log: (...args: unknown[]) => logs.push(args.join(' ')) },
        });
        const code =
          lesson.language === 'TS'
            ? ts.transpileModule(step.solutionCode!, {
                compilerOptions: { target: ts.ScriptTarget.ES2022 },
              }).outputText
            : step.solutionCode!;
        vm.runInContext(code, context, { timeout: 1000 });
        if (step.evaluation) {
          for (const test of step.evaluation.cases) {
            const invocation =
              test.invocation ??
              `${step.evaluation.functionName}(...${JSON.stringify(test.input)})`;
            const actual = await vm.runInContext(invocation, context, { timeout: 1000 });
            expect(JSON.parse(JSON.stringify(actual)), invocation).toEqual(test.expected);
          }
          const emptyContext = vm.createContext({});
          vm.runInContext(step.codeTemplate!, emptyContext, { timeout: 1000 });
          const outcomes = await Promise.all(
            step.evaluation.cases.map(async (test) => {
              try {
                const actual = await vm.runInContext(
                  test.invocation ??
                    `${step.evaluation!.functionName}(...${JSON.stringify(test.input)})`,
                  emptyContext,
                  { timeout: 1000 }
                );
                return JSON.stringify(actual) === JSON.stringify(test.expected);
              } catch {
                return false;
              }
            })
          );
          expect(outcomes.every(Boolean)).toBe(false);
        } else expect(logs.join('\n')).toBe(step.expectedOutput);
      });
    }
  }
});
describe('XP boundaries', () => {
  it.each([
    [0, 'BRONZE'],
    [499, 'BRONZE'],
    [500, 'SILVER'],
    [1199, 'SILVER'],
    [1200, 'GOLD'],
    [2499, 'GOLD'],
    [2500, 'PLATINUM'],
    [4999, 'PLATINUM'],
    [5000, 'DIAMOND'],
  ])('%s XP -> %s', (xp, tier) => expect(getXpBand(Number(xp)).tier).toBe(tier));
  it('keeps historical level boundaries separate from bands', () => {
    expect(calculateLevel(799).level).toBe(2);
    expect(calculateLevel(800).level).toBe(3);
    expect(calculateLevel(2600).level).toBe(7);
  });
  it('has deterministic rank tie predicates', () =>
    expect(usersAheadWhere({ id: 'u', username: 'ana', total_xp: 500 }).OR).toHaveLength(3));
});
