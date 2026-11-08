import { beforeEach, expect, it, vi } from 'vitest';
import { RateLimitError } from '@/lib/errors';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth }));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: mocks.limit }));
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/duels/judge', () => ({ judgeDuelCode: vi.fn(), judgeDuelSubmission: vi.fn() }));
vi.mock('@/lib/duels/resolution', () => ({
  resolveDuelIfReady: vi.fn(),
  resolveDuelAtDeadline: vi.fn(),
}));
import { POST as run } from '../[id]/run/route';
import { POST as submit } from '../[id]/solution/route';
beforeEach(() => {
  mocks.auth.mockResolvedValue({ id: 'viewer' });
  mocks.limit.mockRejectedValue(
    new RateLimitError('RATE_LIMITED', 'Aguarde para tentar novamente.', {
      reset: Date.now() + 60000,
    })
  );
});
it.each([
  ['run', run],
  ['submit', submit],
] as const)(
  '%s preserves quota status, readable feedback and retry delay',
  async (_name, handler) => {
    const response = await handler(
      new Request('https://stacklyst.test/api/duels/test/run', {
        method: 'POST',
        body: JSON.stringify({ code: 'print(42)' }),
      }),
      { params: Promise.resolve({ id: 'duel' }) }
    );
    expect(response.status).toBe(429);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(await response.json()).toMatchObject({ message: 'Aguarde para tentar novamente.' });
  }
);
