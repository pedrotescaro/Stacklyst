import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

  afterEach(() => vi.restoreAllMocks());

  it('requires authentication before reading any private conversations', async () => {
    mocks.getAuthUser.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect(mocks.queryRaw).not.toHaveBeenCalled();
    expect(mocks.userFindMany).not.toHaveBeenCalled();
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
    expect(mocks.userFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: ['old-partner'] },
          blocks_made: { none: { blockedId: 'current-user' } },
          blocks_received: { none: { blockerId: 'current-user' } },
        },
      })
    );
    expect(mocks.messageFindMany).not.toHaveBeenCalled();
  });

  it('keeps unavailable or blocked partners out of the response', async () => {
    mocks.queryRaw.mockResolvedValue([
      {
        partnerId: 'hidden',
        lastMessage: 'Private',
        lastMessageTime: new Date(),
        lastSenderId: 'hidden',
      },
    ]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it('reports a temporary database failure without claiming an empty conversation list', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.queryRaw.mockRejectedValueOnce(
      Object.assign(new Error('private database detail'), { code: 'P1001' })
    );
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('retry-after')).toBe('5');
    const payload = await response.json();
    expect(payload).toMatchObject({ error: 'CHATS_UNAVAILABLE', message: expect.any(String) });
    expect(JSON.stringify(payload)).not.toContain('private database detail');
    expect(mocks.userFindMany).not.toHaveBeenCalled();
  });

  it('does not disguise query defects as a temporary connection failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.queryRaw.mockRejectedValueOnce(
      Object.assign(new Error('invalid query'), { code: '42P10' })
    );
    const response = await GET();
    expect(response.status).toBe(500);
  });
});
