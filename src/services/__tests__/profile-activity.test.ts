// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeCursor, decodeCursor } from '@/lib/pagination';
const mocks = vi.hoisted(() => ({
  posts: vi.fn(),
  replies: vi.fn(),
  postCount: vi.fn(),
  replyCount: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: { findMany: mocks.posts, count: mocks.postCount },
    answer: { findMany: mocks.replies, count: mocks.replyCount },
  },
}));
import { getProfileActivity, getProfilePublicationCounts } from '../profile-activity.service';

const time = new Date('2026-10-29T12:00:00Z');
const post = (id: string, createdAt = time) => ({
  id,
  created_at: createdAt,
  body: `post ${id}`,
  quizzes: [],
});
const reply = (id: string, createdAt = time) => ({
  id,
  created_at: createdAt,
  body: `reply ${id}`,
  post: post('root'),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.posts.mockResolvedValue([]);
  mocks.replies.mockResolvedValue([]);
  mocks.postCount.mockResolvedValue(0);
  mocks.replyCount.mockResolvedValue(0);
});

describe('profile publications include replies', () => {
  it('merges by the reply creation date instead of the original post date', async () => {
    mocks.posts.mockResolvedValue([post('original')]);
    mocks.replies.mockResolvedValue([reply('latest', new Date(time.getTime() + 1000))]);
    const result = await getProfileActivity('viewer', 'developer');
    expect(result.items.map((item) => `${item.kind}:${item.id}`)).toEqual([
      'reply:latest',
      'post:original',
    ]);
    expect(result.items[0]).toHaveProperty('post.body', 'post root');
  });

  it('uses kind and id to paginate same-instant posts and replies without collisions', async () => {
    mocks.posts.mockResolvedValue([post('same')]);
    mocks.replies.mockResolvedValue([reply('same')]);
    const first = await getProfileActivity('viewer', 'developer', { limit: 1 });
    expect(first.items[0].kind).toBe('reply');
    expect(decodeCursor(first.nextCursor!)).toEqual({ t: time.toISOString(), i: 'reply:same' });
    await getProfileActivity('viewer', 'developer', { limit: 1, cursor: first.nextCursor! });
    const postWhere = mocks.posts.mock.calls[1][0].where.AND[2];
    const replyWhere = mocks.replies.mock.calls[1][0].where.AND[2];
    expect(postWhere.OR).toContainEqual({ created_at: time });
    expect(replyWhere.OR).toContainEqual({ created_at: time, id: { lt: 'same' } });
    expect(mocks.posts.mock.calls[0][0].take).toBe(2);
    expect(mocks.replies.mock.calls[0][0].take).toBe(2);
  });

  it('selects liked replies separately instead of substituting their root posts', async () => {
    await getProfileActivity('viewer', 'developer', { tab: 'likes' });
    for (const query of [mocks.posts.mock.calls[0][0], mocks.replies.mock.calls[0][0]]) {
      expect(query.where.AND[1]).toMatchObject({
        votes: {
          some: { value: 1, user: { username: { equals: 'developer', mode: 'insensitive' } } },
        },
      });
    }
  });

  it('keeps search, ownership, visibility and cursor together before pagination', async () => {
    await getProfileActivity('viewer', 'developer', {
      search: 'antigo',
      cursor: encodeCursor(time, 'post:cursor'),
    });
    expect(mocks.replies.mock.calls[0][0].where.AND).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          post: { author: expect.objectContaining({ blocks_made: expect.any(Object) }) },
        }),
        {
          author: expect.objectContaining({
            username: { equals: 'developer', mode: 'insensitive' },
          }),
        },
        { OR: [{ created_at: { lt: time } }] },
        { OR: expect.arrayContaining([{ body: { contains: 'antigo', mode: 'insensitive' } }]) },
      ])
    );
  });

  it('counts each authored post and reply once, without counting context copies', async () => {
    mocks.postCount.mockResolvedValue(2);
    mocks.replyCount.mockResolvedValue(3);
    expect(await getProfilePublicationCounts('viewer', 'author')).toEqual({
      posts: 2,
      replies: 3,
      total: 5,
    });
    expect(mocks.replyCount.mock.calls[0][0].where.AND[0]).toEqual({ author_id: 'author' });
  });

  it('does not disclose quiz answers in original posts or reply context', async () => {
    const quiz = { id: 'quiz', question: '?', correct_index: 2, attempts: [] };
    mocks.posts.mockResolvedValue([{ ...post('p'), quizzes: [quiz] }]);
    mocks.replies.mockResolvedValue([
      { ...reply('r'), post: { ...post('root'), quizzes: [quiz] } },
    ]);
    const result = await getProfileActivity('viewer', 'developer');
    expect(JSON.stringify(result)).not.toContain('correct_index');
  });

  it('rejects cursors from another timeline or with invalid dates', async () => {
    await expect(
      getProfileActivity('viewer', 'developer', { cursor: encodeCursor(time, 'untyped') })
    ).rejects.toMatchObject({ code: 'INVALID_CURSOR' });
    const invalid = Buffer.from(JSON.stringify({ t: 'not-a-date', i: 'reply:123' })).toString(
      'base64url'
    );
    await expect(
      getProfileActivity('viewer', 'developer', { cursor: invalid })
    ).rejects.toMatchObject({ code: 'INVALID_CURSOR' });
    expect(mocks.posts).not.toHaveBeenCalled();
  });
});
