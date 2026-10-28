import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  lock: vi.fn(),
  read: vi.fn(),
  update: vi.fn(),
  version: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        $executeRaw: mocks.lock,
        user: { findUniqueOrThrow: mocks.read, update: mocks.update },
        profileCustomization: { upsert: mocks.version },
      }),
  },
}));
import { POST } from './route';
const request = (body: unknown) =>
  new Request('https://stacklyst.test/api/profile/update', {
    method: 'POST',
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({
    id: 'owner',
    username: 'pedro',
    avatar_config: { profileStyle: { title: { id: 'stale' } } },
  });
  mocks.read.mockResolvedValue({
    avatar_config: { skin: 1, profileStyle: { title: { id: 'latest-earned' } } },
  });
  mocks.update.mockImplementation(async (input) => ({ id: 'owner', ...input.data }));
});
describe('legacy profile edits and earned decoration protection', () => {
  it('keeps the latest server decoration even if a client forges it or auth contains a stale snapshot', async () => {
    const response = await POST(
      request({
        userId: 'victim',
        name: 'Pedro',
        avatar_config: { hair: 2, profileStyle: { title: { id: 'fake-legend' } } },
      })
    );
    expect(response.status).toBe(200);
    expect(mocks.lock).toHaveBeenCalledOnce();
    expect(mocks.version).toHaveBeenCalledExactlyOnceWith({
      where: { userId: 'owner' },
      create: { userId: 'owner', preferences: {}, chat: {} },
      update: { version: { increment: 1 } },
    });
    expect(mocks.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'owner' },
      data: {
        avatar_config: {
          skin: 1,
          hair: 2,
          name: 'Pedro',
          profileStyle: { title: { id: 'latest-earned' } },
        },
      },
    });
  });
  it('rejects another account image and anonymous edits before writing', async () => {
    expect((await POST(request({ avatar_url: 'https://evil.example/fake.png' }))).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
    mocks.auth.mockResolvedValue(null);
    expect((await POST(request({ avatar_url: null }))).status).toBe(401);
  });
  it('supports explicit photo removal for the authenticated account', async () => {
    expect((await POST(request({ avatar_url: null }))).status).toBe(200);
    expect(mocks.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'owner' },
      data: { avatar_url: null },
    });
  });
});
