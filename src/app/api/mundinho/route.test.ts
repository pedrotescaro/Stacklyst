import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MUNDINHO_LANGUAGE_HEADER } from '@/lib/mundinho/i18n';
const calls = vi.hoisted(() => ({
  user: { id: 'authenticated-player' } as { id: string } | null,
  arena: vi.fn(),
  adventure: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: async () => calls.user }));
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));
vi.mock('@/lib/mundinho/arena', async (original) => ({
  ...(await original<typeof import('@/lib/mundinho/arena')>()),
  arena: calls.arena,
}));
vi.mock('@/lib/mundinho/repository', async (original) => ({
  ...(await original<typeof import('@/lib/mundinho/repository')>()),
  adventure: calls.adventure,
}));
import { GET, POST } from './route';
const request = (body: unknown, origin = 'http://localhost') =>
  new Request('http://localhost/api/mundinho', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  calls.user = { id: 'authenticated-player' };
  calls.arena.mockReset().mockResolvedValue({
    selfId: 'authenticated-player',
    room: null,
    friends: [],
    invitations: [],
  });
  calls.adventure.mockReset();
});
describe('Authenticated multiplayer API dispatch', () => {
  it('returns a localized retryable response for an expired database transaction', async () => {
    const failure = Object.assign(new Error('Transaction expired; private database details'), {
      code: 'P2028',
    });
    calls.adventure.mockRejectedValue(failure);
    const response = await GET(new Request('http://localhost/api/mundinho'), {
      params: Promise.resolve({}),
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'MUNDINHO_UNAVAILABLE',
      message: 'O Mundinho está demorando para responder. Tente novamente em instantes.',
    });

    calls.arena.mockRejectedValue(failure);
    const englishRequest = request({ type: 'arena', action: { type: 'inbox' } });
    englishRequest.headers.set(MUNDINHO_LANGUAGE_HEADER, 'en');
    const englishResponse = await POST(englishRequest, { params: Promise.resolve({}) });
    expect(englishResponse.status).toBe(503);
    expect(await englishResponse.json()).toEqual({
      error: 'MUNDINHO_UNAVAILABLE',
      message: 'Mundinho is taking too long to respond. Please try again shortly.',
    });
  });
  it('derives identity from the session and validates the nested arena action', async () => {
    const response = await POST(
      request({
        type: 'arena',
        userId: 'victim',
        action: { type: 'enter', language: 'PYTHON', userId: 'victim', damage: 999 },
      }),
      { params: Promise.resolve({}) }
    );
    expect(response.status).toBe(200);
    expect(calls.arena).toHaveBeenCalledWith('authenticated-player', {
      type: 'enter',
      language: 'PYTHON',
    });
    expect(calls.adventure).not.toHaveBeenCalled();
  });
  it('rejects unauthenticated and cross-origin mutations', async () => {
    calls.user = null;
    expect(
      (
        await POST(request({ type: 'arena', action: { type: 'inbox' } }), {
          params: Promise.resolve({}),
        })
      ).status
    ).toBe(401);
    calls.user = { id: 'authenticated-player' };
    expect(
      (
        await POST(
          request({ type: 'arena', action: { type: 'inbox' } }, 'https://untrusted.invalid'),
          { params: Promise.resolve({}) }
        )
      ).status
    ).toBe(403);
    expect(calls.arena).not.toHaveBeenCalled();
  });
  it('rejects malformed movement and preserves the existing daily chest endpoint', async () => {
    expect(
      (
        await POST(
          request({ type: 'arena', action: { type: 'sync', roomId: 'invalid', position: {} } }),
          { params: Promise.resolve({}) }
        )
      ).status
    ).toBe(400);
    calls.adventure.mockResolvedValue({ coins: 10 });
    expect((await POST(request({ type: 'chest' }), { params: Promise.resolve({}) })).status).toBe(
      200
    );
    expect(calls.adventure).toHaveBeenCalledWith('authenticated-player', { type: 'chest' });
  });
});
