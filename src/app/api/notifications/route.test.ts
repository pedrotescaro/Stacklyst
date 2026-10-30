// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '@/lib/errors';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), deleteAll: vi.fn(), deleteOne: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getAuthUser: mocks.auth, requireAuth: mocks.auth }));
vi.mock('@/services/notification.service', () => ({
  NotificationService: {
    deleteAll: mocks.deleteAll,
    deleteNotification: mocks.deleteOne,
  },
}));
import { DELETE as deleteAll } from './route';
import { DELETE as deleteOne } from './[id]/route';

describe('notification deletion routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ id: 'signed-in-user' });
    mocks.deleteAll.mockResolvedValue({ count: 3 });
    mocks.deleteOne.mockResolvedValue({ count: 1 });
  });

  it('uses the session owner for bulk deletion, ignoring a supplied user id', async () => {
    const response = await deleteAll(
      new Request('http://localhost/api/notifications?userId=someone-else', { method: 'DELETE' }),
      { params: Promise.resolve({}) }
    );
    expect(response.status).toBe(200);
    expect(mocks.deleteAll).toHaveBeenCalledWith('signed-in-user');
    await expect(response.json()).resolves.toEqual({ success: true, count: 3 });
  });

  it('scopes individual deletion to the session and the requested id', async () => {
    const response = await deleteOne(
      new Request('http://localhost/api/notifications/notice', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'notice' }) }
    );
    expect(response.status).toBe(200);
    expect(mocks.deleteOne).toHaveBeenCalledWith('signed-in-user', 'notice');
  });

  it.each([deleteAll, deleteOne])(
    'rejects unauthenticated deletion before touching the database',
    async (handler) => {
      mocks.auth.mockRejectedValue(new UnauthorizedError());
      const response = await handler(
        new Request('http://localhost/api/notifications/notice', { method: 'DELETE' }),
        { params: Promise.resolve({ id: 'notice' }) }
      );
      expect(response.status).toBe(401);
      expect(mocks.deleteOne).not.toHaveBeenCalled();
      expect(mocks.deleteAll).not.toHaveBeenCalled();
    }
  );
});
