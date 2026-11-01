import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ findMany: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/prisma', () => ({ prisma: { post: { findMany: mocks.findMany } } }));
import { encodeCursor } from '@/lib/pagination';
import { PostService } from './post.service';

describe('profile post search pagination', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps the text and owner filters when requesting the next page', async () => {
    const cursorTime = new Date('2026-10-27T12:00:00Z');
    const cursor = encodeCursor(cursorTime, 'post-id');
    await PostService.getFeed(null, { author: 'developer', search: 'código', cursor, limit: 2 });
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              author: { username: 'developer' },
              OR: expect.arrayContaining([
                { body: { contains: 'código', mode: 'insensitive' } },
                { code_snippet: { contains: 'código', mode: 'insensitive' } },
              ]),
            },
            {
              OR: [
                { created_at: { lt: cursorTime } },
                { created_at: cursorTime, id: { lt: 'post-id' } },
              ],
            },
            { author: {}, OR: [{ audience: 'everyone' }] },
          ],
        },
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: 3,
      })
    );
  });

  it('applies owner and follower access with block protection before limiting a signed-in search', async () => {
    await PostService.getFeed('viewer', { author: 'developer', search: 'código', limit: 2 });

    expect(mocks.findMany).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              author: { username: 'developer' },
              OR: expect.arrayContaining([{ body: { contains: 'código', mode: 'insensitive' } }]),
            },
            {},
            {
              author: {
                blocks_made: { none: { blockedId: 'viewer' } },
                blocks_received: { none: { blockerId: 'viewer' } },
              },
              OR: [
                { audience: 'everyone' },
                { author_id: 'viewer' },
                {
                  audience: 'followers',
                  author: { followers: { some: { followerId: 'viewer' } } },
                },
              ],
            },
          ],
        },
        take: 3,
      })
    );
  });
});
