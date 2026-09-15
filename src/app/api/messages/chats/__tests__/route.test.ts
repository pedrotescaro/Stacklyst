import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  messageCount: vi.fn(),
  messageCreateMany: vi.fn(),
  messageFindMany: vi.fn(),
  userFindMany: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthUser: mocks.getAuthUser,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    message: {
      count: mocks.messageCount,
      createMany: mocks.messageCreateMany,
      findMany: mocks.messageFindMany,
    },
    user: {
      findMany: mocks.userFindMany,
    },
  },
}));

import { GET } from '../route';

describe('GET /api/messages/chats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthUser.mockResolvedValue({ id: 'current-user' });
    mocks.messageFindMany.mockResolvedValue([]);
    mocks.userFindMany.mockResolvedValue([]);
  });

  it('returns an empty list without creating automatic user messages', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(mocks.messageCount).not.toHaveBeenCalled();
    expect(mocks.messageCreateMany).not.toHaveBeenCalled();
  });
});
