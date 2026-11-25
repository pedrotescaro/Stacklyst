import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  lock: vi.fn(),
  read: vi.fn(),
  update: vi.fn(),
  findFirst: vi.fn(),
  version: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: (callback: (tx: unknown) => unknown) =>
      callback({
        $executeRaw: mocks.lock,
        user: { findUniqueOrThrow: mocks.read, update: mocks.update, findFirst: mocks.findFirst },
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
  mocks.findFirst.mockResolvedValue(null);
  mocks.read.mockResolvedValue({
    username: 'pedro',
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
  it('supports explicit photo removal and KLIPY GIF avatars for the authenticated account', async () => {
    expect((await POST(request({ avatar_url: null }))).status).toBe(200);
    expect(mocks.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'owner' },
      data: { avatar_url: null },
    });

    const gif = 'https://static.klipy.com/ii/abc/14/af/avatar.gif';
    expect((await POST(request({ avatar_url: gif }))).status).toBe(200);
    expect(mocks.update.mock.calls[1][0]).toMatchObject({
      where: { id: 'owner' },
      data: { avatar_url: gif },
    });
  });
});

describe('username changes', () => {
  it('uses the locked timestamp and releases the name change at exactly three minutes', async () => {
    vi.useFakeTimers();
    try {
      const changedAt = new Date('2026-01-01T12:00:00Z');
      mocks.read.mockResolvedValue({ username: 'pedro', username_changed_at: changedAt });
      vi.setSystemTime(changedAt.getTime() + 179_999);
      const blocked = await POST(request({ username: 'New-Name' }));
      expect(blocked.status).toBe(429);
      expect(await blocked.json()).toMatchObject({
        usernameChangeAvailableAt: '2026-01-01T12:03:00.000Z',
      });
      expect(mocks.update).not.toHaveBeenCalled();
      vi.setSystemTime(changedAt.getTime() + 180_000);
      expect((await POST(request({ username: 'New-Name' }))).status).toBe(200);
      expect(mocks.update.mock.calls[0][0].data.username).toBe('new-name');
    } finally {
      vi.useRealTimers();
    }
  });
  it('returns a conflict for a case-insensitive match or a simultaneous unique index failure', async () => {
    mocks.findFirst.mockResolvedValueOnce({ id: 'another' });
    expect((await POST(request({ username: 'Taken' }))).status).toBe(409);
    expect(mocks.findFirst.mock.calls[0][0].where.username).toEqual({
      equals: 'taken',
      mode: 'insensitive',
    });
    mocks.update.mockRejectedValueOnce({ code: 'P2002' });
    expect((await POST(request({ username: 'Taken' }))).status).toBe(409);
  });
});
