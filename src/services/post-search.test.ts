import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ findMany: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/prisma', () => ({ prisma: { post: { findMany: mocks.findMany } } }));
import { encodeCursor } from '@/lib/pagination';
import { PostService } from './post.service';

describe('profile post search pagination', () => {
  it('keeps the text and owner filters when requesting the next page', async () => {
    const cursor = encodeCursor(new Date('2026-10-27T12:00:00Z'), 'post-id');
    await PostService.getFeed(null, { author: 'developer', search: 'código', cursor });
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
            { OR: expect.any(Array) },
          ],
        },
      })
    );
  });
});
