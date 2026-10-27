import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeCode } from '@/lib/code-execution/server';
import { judgeDuelCode } from '@/lib/duels/judge';

vi.mock('@/lib/code-execution/server', () => ({ executeCode: vi.fn() }));

const mockedExecuteCode = vi.mocked(executeCode);

describe('duel TypeScript judge', () => {
  beforeEach(() => {
    mockedExecuteCode.mockReset();
  });

  it('keeps a transport timeout out of contestant runtime penalties and scoring', async () => {
    mockedExecuteCode.mockResolvedValue({
      ok: false,
      output: '',
      unavailable: true,
      error: 'Tempo limite',
      executionMs: 15000,
    });
    const result = await judgeDuelCode({
      problemId: 'compress-string-rle-live',
      language: 'TS',
      includeHiddenTests: false,
      code: 'function solve() {}',
    });
    expect(result).toMatchObject({ status: 'JUDGE_UNAVAILABLE', score: 0, runtimeMs: null });
  });

  it('rejects duplicate test identifiers instead of manufacturing a passing score', async () => {
    mockedExecuteCode.mockImplementation(async (harness) => {
      const start = harness.match(/__STACKLYST_DUEL_[\w-]+_START__/)?.[0];
      const end = harness.match(/__STACKLYST_DUEL_[\w-]+_END__/)?.[0];
      return {
        ok: true,
        output: `${start}${JSON.stringify([
          { id: 't1', passed: true },
          { id: 't1', passed: true },
        ])}${end}`,
        executionMs: 10,
      };
    });
    expect(
      await judgeDuelCode({
        problemId: 'compress-string-rle-live',
        language: 'TS',
        includeHiddenTests: false,
        code: 'function solve() {}',
      })
    ).toMatchObject({ status: 'JUDGE_UNAVAILABLE', score: 0 });
  });

  it('transpiles TypeScript and evaluates a single renamed solution function', async () => {
    mockedExecuteCode.mockImplementation(async (harness, language) => {
      const start = harness.match(/__STACKLYST_DUEL_[\w-]+_START__/)?.[0];
      const end = harness.match(/__STACKLYST_DUEL_[\w-]+_END__/)?.[0];
      if (!start || !end) throw new Error('Marcadores do juiz ausentes.');

      expect(language).toBe('javascript');
      expect(harness).toContain('compressRLE');
      expect(harness).not.toContain('str: string');

      return {
        ok: true,
        output: `${start}${JSON.stringify([
          { id: 't1', passed: true },
          { id: 't2', passed: true },
        ])}${end}`,
        executionMs: 12,
      };
    });

    const result = await judgeDuelCode({
      problemId: 'compress-string-rle-live',
      language: 'TS',
      includeHiddenTests: false,
      code: `function compressRLE(str: string): string {
        if (!str) return str;
        let output = '';
        let count = 1;
        for (let index = 1; index <= str.length; index += 1) {
          if (str[index] === str[index - 1]) count += 1;
          else { output += str[index - 1] + count; count = 1; }
        }
        return output.length < str.length ? output : str;
      }`,
    });

    expect(result.status).toBe('ACCEPTED');
    expect(result.publicPassedTests).toBe(2);
    expect(result.error).toBeUndefined();
  });
});
