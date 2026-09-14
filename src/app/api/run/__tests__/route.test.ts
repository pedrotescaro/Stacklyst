import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { executeCode } from '@/lib/code-execution/server';
import { requireAuth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

vi.mock('@/lib/code-execution/server', () => ({
  executeCode: vi.fn(async () => ({ ok: true, output: 'ok', executionMs: 10 })),
}));

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => null),
  requireAuth: vi.fn(async () => ({ id: 'user-1' })),
}));

vi.mock('@/lib/ratelimit', () => ({
  rateLimit: vi.fn(async () => undefined),
}));

describe('POST /api/run', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['js', 'ts'])('executes authenticated %s submissions on the server', async (language) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost:3000/api/run', {
      method: 'POST',
      body: JSON.stringify({ code: "console.log('ok')", language }),
    });

    const response = await POST(request, { params: Promise.resolve({}) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ ok: true, output: 'ok' });
    expect(executeCode).toHaveBeenCalledWith("console.log('ok')", language);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated execution before contacting a provider', async () => {
    vi.mocked(requireAuth).mockRejectedValueOnce(
      new UnauthorizedError('UNAUTHORIZED', 'Autenticação necessária')
    );
    vi.mocked(executeCode).mockClear();
    const response = await POST(
      new Request('http://localhost:3000/api/run', {
        method: 'POST',
        body: JSON.stringify({ code: '1', language: 'js' }),
      }),
      { params: Promise.resolve({}) }
    );
    expect(response.status).toBe(401);
    expect(executeCode).not.toHaveBeenCalled();
  });

  it.each([
    { result: { ok: true, output: '42', executionMs: 0 }, status: 200 },
    {
      result: { ok: false, output: '', error: 'Erro de compilação.', executionMs: 0 },
      status: 200,
    },
    {
      result: {
        ok: false,
        output: '',
        error: 'Serviço de execução indisponível no momento. Tente novamente em instantes.',
        unavailable: true,
        executionMs: 0,
      },
      status: 502,
    },
  ])(
    'uses status $status for an execution rounded to zero milliseconds: $result',
    async ({ result, status }) => {
      vi.mocked(executeCode).mockResolvedValueOnce(result);
      const response = await POST(
        new Request('http://localhost:3000/api/run', {
          method: 'POST',
          body: JSON.stringify({ code: 'console.log(42)', language: 'js' }),
        }),
        { params: Promise.resolve({}) }
      );
      expect(response.status).toBe(status);
      expect(await response.json()).toMatchObject(result);
    }
  );
});
