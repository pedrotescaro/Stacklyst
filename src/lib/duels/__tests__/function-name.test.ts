import { describe, expect, it } from 'vitest';
import { getDuelProblemById } from '@/lib/duel-problems';
import {
  adaptTestsToContestantFunction,
  findContestantFunctionName,
} from '@/lib/duels/function-name';

describe('duel contestant function names', () => {
  it('accepts a single TypeScript function even when the participant renames it', () => {
    const code = 'function compressRLE(value: string): string { return value; }';
    expect(findContestantFunctionName(code, 'TS', 'compressString')).toBe('compressRLE');
  });

  it('keeps the required function when several functions exist', () => {
    const code = 'function helper() {}\nfunction reverseString(value: string) { return value; }';
    expect(findContestantFunctionName(code, 'TS', 'reverseString')).toBe('reverseString');
  });

  it('rewrites trusted test calls without changing their expected values', () => {
    const problem = getDuelProblemById('reverse-string');
    const tests = adaptTestsToContestantFunction(
      problem.testCases,
      'reverseString',
      'reverseText',
      'TS'
    );

    expect(tests[0].testExpression.TS).toContain('reverseText("stacklyst")');
    expect(tests[0].testExpression.TS).toContain('"tsylkcats"');
  });
});
