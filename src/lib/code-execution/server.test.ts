import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeCode } from '@/lib/code-execution/server';

describe('server code execution fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses Wandbox when Judge0 is unavailable', async () => {
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

    const result = await executeCode('console.log("ok")', 'javascript');

    expect(result).toMatchObject({ ok: true, output: 'fallback funcionando' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toContain('wandbox.org');
  });
});
