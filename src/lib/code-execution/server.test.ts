import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeCode } from '@/lib/code-execution/server';
import { runJavaScriptInSandbox } from '@/lib/code-execution/javascript-sandbox';
import { judgeDuelCode } from '@/lib/duels/judge';

describe('server code execution fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('executes JavaScript inside the local sandbox without contacting external providers', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeCode('console.log("sandbox funcionando")', 'javascript');

    expect(result).toMatchObject({ ok: true, output: 'sandbox funcionando' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('transpiles and executes TypeScript inside the local sandbox', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeCode(
      'const message: string = "typescript funcionando"; console.log(message);',
      'typescript'
    );

    expect(result).toMatchObject({ ok: true, output: 'typescript funcionando' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('evaluates the reverse-string duel without external providers', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await judgeDuelCode({
      problemId: 'reverse-string',
      language: 'TS',
      includeHiddenTests: false,
      code: 'function reverseString(str: string): string { return str.split("").reverse().join(""); }',
    });

    expect(result.status, result.error).toBe('ACCEPTED');
    expect(result.passedTests).toBe(3);
    expect(result.publicPassedTests).toBe(3);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('interrupts JavaScript that exceeds the execution limit', async () => {
    const result = await runJavaScriptInSandbox('while (true) {}', 25);

    expect(result).toMatchObject({ ok: false });
    expect(result?.error).toContain('Tempo limite de execução atingido');
  });

  it('caps output captured from untrusted JavaScript', async () => {
    const result = await runJavaScriptInSandbox('console.log("x".repeat(50_000))');

    expect(result?.ok).toBe(true);
    expect(result?.output.length).toBeLessThanOrEqual(16_384);
  });

  it('uses Wandbox for Python when Judge0 is unavailable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 400 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          program_output: 'fallback funcionando',
          program_error: '',
          compiler_output: '',
          compiler_error: '',
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const result = await executeCode('print("ok")', 'python');

    expect(result).toMatchObject({ ok: true, output: 'fallback funcionando' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain('wandbox.org');
  });
});
