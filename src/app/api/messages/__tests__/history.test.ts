// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ findMany: vi.fn(), execute: vi.fn() }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: async () => ({ id: 'me' }),
  requireAuth: async () => ({ id: 'me' }),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userBlock: { findFirst: vi.fn().mockResolvedValue(null) },
    message: { findMany: mocks.findMany },
    $executeRawUnsafe: mocks.execute,
  },
}));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));
vi.mock('@/services/notification.service', () => ({ NotificationService: { create: vi.fn() } }));
import { GET } from '../route';
import { decodeCursor } from '@/lib/pagination';
const context = { params: Promise.resolve({}) };

describe('chat history pagination', () => {
  const timestamp = new Date('2026-10-26T12:00:00Z');
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.execute.mockResolvedValue(0);
  });

  it('returns the latest page chronologically and exposes a stable older-page cursor', async () => {
    mocks.findMany.mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        id: String(200 - index),
        created_at: timestamp,
        content: `message-${200 - index}`,
      }))
    );
    const response = await GET(
      new Request('https://stacklyst.test/api/messages?receiver_id=partner'),
      context
    );
    const rows = await response.json();
    expect(rows).toHaveLength(100);
    expect(rows[0].id).toBe('101');
    expect(rows.at(-1).id).toBe('200');
    expect(decodeCursor(response.headers.get('X-Next-Cursor')!)).toEqual({
      t: timestamp.toISOString(),
      i: '101',
    });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ created_at: 'desc' }, { id: 'desc' }], take: 101 })
    );
  });

  it('keeps cursor pagination restricted to the authenticated pair', async () => {
    mocks.findMany.mockResolvedValue([]);
    await GET(new Request('https://stacklyst.test/api/messages?receiver_id=partner'), context);
    expect(mocks.findMany.mock.calls[0][0].where.AND[0]).toEqual({
      OR: [
        { sender_id: 'me', receiver_id: 'partner' },
        { sender_id: 'partner', receiver_id: 'me' },
      ],
    });
  });
});
