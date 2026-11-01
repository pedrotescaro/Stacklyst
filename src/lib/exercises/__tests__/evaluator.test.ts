import { describe, expect, it } from 'vitest';
import { buildExerciseHarness, evaluateExerciseCode } from '@/lib/exercises/evaluator';

describe('exercise evaluator harness', () => {
  it('builds server-side test invocations with an unpredictable result marker', () => {
    const result = buildExerciseHarness(
      'function sum(left, right) { return left + right; }',
      'sum',
      [
        {
          id: 'public-1',
          label: 'Adds positive values',
          input: [2, 3],
          invocation_code: null,
          expected_output: 5,
          is_hidden: false,
          position: 1,
        },
      ],
      '__TEST_MARKER__'
    );

    expect(result.marker).toBe('__TEST_MARKER__');
    expect(result.code).toContain('sum(...[2,3])');
    expect(result.code).toContain('__stacklystDeepEqual');
    expect(result.code).toContain('console.log("__TEST_MARKER__"');
    expect(result.code).not.toContain('new Function');
  });

  it('supports trusted asynchronous invocation code for behavioral tests', () => {
    const result = buildExerciseHarness(
      'async function mapWithConcurrency() {}',
      'mapWithConcurrency',
      [
        {
          id: 'hidden-1',
          label: 'Concurrency cap',
          input: null,
          invocation_code: 'await mapWithConcurrency([1, 2], 1, async value => value)',
          expected_output: [1, 2],
          is_hidden: true,
          position: 1,
        },
      ],
      '__TEST_MARKER__'
    );

    expect(result.code).toContain(
      'await (await mapWithConcurrency([1, 2], 1, async value => value))'
    );
  });

  it('runs a valid Retry-After TypeScript solution through the actual QuickJS sandbox', async () => {
    const evaluation = await evaluateExerciseCode({
      code: `function parseRetryAfter(value: string | null, nowMs: number): number | null {
        if (value === null || !value.trim()) return null;
        const raw = value.trim();
        if (/^-/.test(raw)) return null;
        const delay = /^\\d+$/.test(raw) ? Number(raw) * 1000 : Date.parse(raw) - nowMs;
        return Number.isFinite(delay) ? Math.min(300000, Math.max(0, delay)) : null;
      }`,
      language: 'TS',
      functionName: 'parseRetryAfter',
      testCases: [
        {
          id: 'tc-retry-1',
          label: 'Segundos inteiros',
          input: ['120', 0],
          invocation_code: null,
          expected_output: 120000,
          is_hidden: false,
          position: 1,
        },
        {
          id: 'tc-retry-2',
          label: 'Data HTTP relativa',
          input: ['Wed, 21 Oct 2015 07:28:00 GMT', 1445412420000],
          invocation_code: null,
          expected_output: 60000,
          is_hidden: false,
          position: 2,
        },
      ],
    });

    expect(evaluation, evaluation.error).toMatchObject({
      ok: true,
      passed: true,
      passedTests: 2,
      totalTests: 2,
      consoleOutput: '',
    });
  });
});
