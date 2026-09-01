import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  DUEL_PROBLEMS,
  getDuelProblemById,
  getRandomDuelProblem,
  buildTestHarness,
} from '../duel-problems';
import { CHALLENGE_LIBRARY } from '../duel-challenge-generator';

describe('duel-problems', () => {
  it('has valid problem presets with test cases', () => {
    expect(DUEL_PROBLEMS.length).toBeGreaterThan(0);

    DUEL_PROBLEMS.forEach((problem) => {
      expect(problem.id).toBeTruthy();
      expect(problem.title).toBeTruthy();
      expect(problem.description).toBeTruthy();
      expect(problem.testCases.length).toBeGreaterThan(0);
      expect(problem.starters.TS).toBeTruthy();
      expect(problem.starters.PYTHON).toBeTruthy();
    });
  });

  it('retrieves problem by id or returns default', () => {
    const reverse = getDuelProblemById('reverse-string');
    expect(reverse.id).toBe('reverse-string');

    const nonExistent = getDuelProblemById('unknown-problem-123');
    expect(nonExistent).toBeDefined();
    expect(nonExistent.id).toBe(DUEL_PROBLEMS[0].id);
  });

  it('returns a random duel problem', () => {
    const p = getRandomDuelProblem();
    expect(p).toBeDefined();
    expect(DUEL_PROBLEMS).toContain(p);
  });

  it('builds TypeScript test harness containing result tokens', () => {
    const problem = getDuelProblemById('reverse-string');
    const userCode =
      'function reverseString(str: string): string { return str.split("").reverse().join(""); }';
    const harness = buildTestHarness(userCode, problem, 'TS');

    expect(harness).toContain('###TEST_RESULTS_START###');
    expect(harness).toContain('###TEST_RESULTS_END###');
    expect(harness).toContain('reverseString');
  });

  it('builds Python test harness containing json dump tokens', () => {
    const problem = getDuelProblemById('reverse-string');
    const userCode = 'def reverse_string(s):\n    return s[::-1]';
    const harness = buildTestHarness(userCode, problem, 'PYTHON');

    expect(harness).toContain('import json');
    expect(harness).toContain('###TEST_RESULTS_START###');
    expect(harness).toContain('###TEST_RESULTS_END###');
    expect(harness).toContain('reverse_string');
  });

  it('uses per-execution result markers supplied by the server judge', () => {
    const problem = getDuelProblemById('reverse-string');
    const harness = buildTestHarness('function reverseString() { return ""; }', problem, 'JS', {
      start: '__PRIVATE_START__',
      end: '__PRIVATE_END__',
    });

    expect(harness).toContain('__PRIVATE_START__');
    expect(harness).toContain('__PRIVATE_END__');
    expect(harness).not.toContain('###TEST_RESULTS_START###');
  });

  it('keeps JavaScript result reporting outside contestant-controlled globals', () => {
    const problem = getDuelProblemById('reverse-string');
    const harness = buildTestHarness(
      `function reverseString() {
        globalThis.JSON = { stringify: () => '"tsylkcats"' };
        globalThis.process = { stdout: { write: () => undefined } };
        return 'forged';
      }`,
      problem,
      'JS',
      { start: '__SERVER_ONLY_START__', end: '__SERVER_ONLY_END__' }
    );

    const output = execFileSync(process.execPath, ['-e', harness], { encoding: 'utf8' });
    const payload = output.slice(
      output.lastIndexOf('__SERVER_ONLY_START__') + '__SERVER_ONLY_START__'.length,
      output.indexOf('__SERVER_ONLY_END__')
    );
    const results = JSON.parse(payload) as Array<{ passed: boolean }>;

    expect(results).toHaveLength(problem.testCases.length);
    expect(results.every((result) => !result.passed)).toBe(true);
  });

  it('executes Python contestant code in a separate restricted namespace', () => {
    const problem = getDuelProblemById('reverse-string');
    const userCode = 'def reverse_string(s):\n    return "forged"';
    const harness = buildTestHarness(userCode, problem, 'PYTHON', {
      start: '__PYTHON_PRIVATE_START__',
      end: '__PYTHON_PRIVATE_END__',
    });

    expect(harness).toContain('__contestant_globals_');
    expect(harness).toContain('__safe_exec_');
    expect(harness).toContain('from __future__ import annotations');
    expect(harness).toContain(JSON.stringify(userCode));
    expect(harness).not.toContain(`\n${userCode}\n`);
  });

  it('supports modern Python annotations on the Python 3.8 judge', () => {
    const problem = CHALLENGE_LIBRARY.find((challenge) => challenge.id === 'binary-search-array');
    expect(problem).toBeDefined();
    if (!problem) throw new Error('Desafio de busca binária não encontrado');
    const userCode = `def binary_search(nums: list[int], target: int) -> int:
    left = 0
    right = len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`;
    const harness = buildTestHarness(userCode, problem, 'PYTHON', {
      start: '__PYTHON_38_START__',
      end: '__PYTHON_38_END__',
    });

    expect(harness).toMatch(/^\s*from __future__ import annotations/);
    expect(harness).toContain(JSON.stringify(userCode));
    expect(harness).not.toContain('"__import__"');
    expect(harness).not.toContain('list =');
  });
});
