import { beforeEach, describe, it, expect, vi } from 'vitest';
vi.mock('@/lib/code-execution/server', () => ({ executeCode: vi.fn() }));
import { executeCode } from '@/lib/code-execution/server';
import { judgeDuelCode } from '../judge';
describe('correctness-only duel scoring', () => {
  beforeEach(() => {
    vi.mocked(executeCode).mockReset();
  });
  it.each([
    [10, true, 1000],
    [5000, true, 1000],
    [10, false, 500],
  ])('keeps execution %d ms out of correctness points', async (runtime, passed, score) => {
    vi.mocked(executeCode).mockImplementation(async (harness) => {
      const start = harness.match(/__STACKLYST_DUEL_[\w-]+_START__/)![0],
        end = harness.match(/__STACKLYST_DUEL_[\w-]+_END__/)![0];
      return {
        ok: true,
        output: `${start}${JSON.stringify([
          { id: 't1', passed: true },
          { id: 't2', passed },
        ])}${end}`,
        executionMs: runtime as number,
      };
    });
    const result = await judgeDuelCode({
      problemId: 'compress-string-rle-live',
      language: 'TS',
      code: 'function solve(a){return a}',
      includeHiddenTests: false,
    });
    expect(result.score).toBe(score);
    expect(result.status).toBe(passed ? 'ACCEPTED' : 'WRONG_ANSWER');
  });
});
