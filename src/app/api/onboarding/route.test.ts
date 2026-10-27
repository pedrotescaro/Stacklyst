import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@/lib/errors';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: mocks.auth,
  requireAuth: async () => {
    const user = await mocks.auth();
    if (!user) throw new UnauthorizedError();
    return user;
  },
}));
vi.mock('@/lib/prisma', () => ({
  prisma: { mobileState: { findUnique: mocks.findUnique, upsert: mocks.upsert } },
}));
import { GET, PUT } from './route';
const context = { params: Promise.resolve({}) };
const body = { feed: 'for-you', languages: ['JS', 'PYTHON', 'JS'] };
const request = (value: unknown) =>
  new Request('https://stacklyst.test/api/onboarding', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'current-user' });
  mocks.upsert.mockResolvedValue({});
});

describe('Persistent onboarding', () => {
  it('persists preferences under the authenticated owner and initializes language trail selection', async () => {
    const response = await PUT(request({ ...body, user_id: 'another-user' }), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ feed: 'for-you', languages: ['JS', 'PYTHON'] });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id_key: { user_id: 'current-user', key: 'web:onboarding' } },
        create: {
          user_id: 'current-user',
          key: 'web:onboarding',
          value: { feed: 'for-you', languages: ['JS', 'PYTHON'] },
        },
      })
    );
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
  });
  it('loads only the current user preferences after a restart or another device sign-in', async () => {
    mocks.findUnique.mockResolvedValue({ value: { feed: 'following', languages: ['TS'] } });
    const response = await GET(new Request('https://stacklyst.test/api/onboarding'), context);
    expect(await response.json()).toEqual({ feed: 'following', languages: ['TS'] });
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { user_id_key: { user_id: 'current-user', key: 'web:onboarding' } },
    });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('requires authentication and a supported, nonempty language selection', async () => {
    mocks.auth.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    expect((await PUT(request(body), context)).status).toBe(401);
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect((await PUT(request({ feed: 'for-you', languages: [] }), context)).status).toBe(400);
    expect((await PUT(request({ feed: 'for-you', languages: ['INVALID'] }), context)).status).toBe(
      400
    );
  });
});
