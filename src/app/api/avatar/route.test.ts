import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultAvatarConfig } from '@/lib/avatar';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  lock: vi.fn(),
  user: vi.fn(),
  update: vi.fn(),
  version: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: async (callback: (tx: unknown) => unknown) =>
      callback({
        $executeRaw: mocks.lock,
        user: { findUniqueOrThrow: mocks.user, update: mocks.update },
        profileCustomization: { upsert: mocks.version },
      }),
  },
}));
import { PUT } from './route';
const request = (body: unknown) =>
  new Request('https://stacklyst.test/api/avatar', { method: 'PUT', body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ id: 'owner' });
  mocks.user.mockResolvedValue({
    avatar_config: { displayName: 'Current name', profileStyle: { title: { id: 'earned-title' } } },
  });
  mocks.update.mockImplementation(async (input) => ({ id: 'owner', ...input.data }));
});
describe('legacy illustrated avatar concurrency boundary', () => {
  it('preserves earned identity and invalidates existing inline drafts in the same transaction', async () => {
    const response = await PUT(
      request({
        ...getDefaultAvatarConfig('owner'),
        profileStyle: { title: { id: 'forged-title' } },
      })
    );
    expect(response.status).toBe(200);
    expect(mocks.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'owner' },
      data: {
        avatar_config: {
          displayName: 'Current name',
          profileStyle: { title: { id: 'earned-title' } },
        },
      },
    });
    expect(mocks.version).toHaveBeenCalledExactlyOnceWith({
      where: { userId: 'owner' },
      create: { userId: 'owner', preferences: {}, chat: {} },
      update: { version: { increment: 1 } },
    });
  });
  it('rejects missing sessions and invalid values without creating a version row', async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await PUT(request(getDefaultAvatarConfig('owner')))).status).toBe(401);
    mocks.auth.mockResolvedValue({ id: 'owner' });
    expect((await PUT(request({ skin: -5 }))).status).toBe(400);
    expect(mocks.version).not.toHaveBeenCalled();
  });
});
