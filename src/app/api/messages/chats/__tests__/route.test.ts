import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  messageCount: vi.fn(),
  messageCreateMany: vi.fn(),
  messageFindMany: vi.fn(),
  userFindMany: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthUser: mocks.getAuthUser,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
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
    mocks.queryRaw.mockResolvedValue([]);
    mocks.userFindMany.mockResolvedValue([]);
  });

  it('returns an empty list without creating automatic user messages', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    expect(mocks.messageCount).not.toHaveBeenCalled();
    expect(mocks.messageCreateMany).not.toHaveBeenCalled();
  });

  it('selects the latest row per partner before the conversation limit', async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        partnerId: 'old-partner',
        lastMessage: 'Still here',
        lastMessageTime: new Date(),
        lastSenderId: 'old-partner',
      },
    ]);
    mocks.userFindMany.mockResolvedValue([
      { id: 'old-partner', username: 'old', avatar_url: null },
    ]);
    const response = await GET();
    expect(await response.json()).toMatchObject([
      { partnerId: 'old-partner', lastMessage: 'Still here' },
    ]);
    const sql = mocks.queryRaw.mock.calls[0][0].join('');
    expect(sql).toContain('DISTINCT ON');
    expect(sql.indexOf('DISTINCT ON')).toBeLessThan(sql.indexOf('LIMIT 100'));
    expect(mocks.messageFindMany).not.toHaveBeenCalled();
  });
});
