import { describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ findMany: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/auth', () => ({ getAuthUser: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/prisma', () => ({ prisma: { answer: { findMany: mocks.findMany } } }));
import { GET } from './route';

describe('profile replies search pagination', () => {
  it('combines the author, text and cursor filters', async () => {
    const response = await GET(
      new Request(
        'https://stacklyst.test/api/profile/developer/replies?search=antigo&cursor=1793102400000_reply-id'
      ),
      { params: Promise.resolve({ username: 'developer' }) }
    );
    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          author: { username: { equals: 'developer', mode: 'insensitive' } },
          post: { author: {} },
          AND: [
            {
              OR: expect.arrayContaining([
                { body: { contains: 'antigo', mode: 'insensitive' } },
                { post: { title: { contains: 'antigo', mode: 'insensitive' } } },
              ]),
            },
            { OR: expect.any(Array) },
          ],
          OR: expect.any(Array),
        },
      })
    );
  });
});
