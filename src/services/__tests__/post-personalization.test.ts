import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeCursor } from '@/lib/pagination';
const mocks = vi.hoisted(() => ({ findMany: vi.fn(), count: vi.fn(), following: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { post: mocks, follow: { findMany: mocks.following } } }));
vi.mock('@/services/xp.service', () => ({ XpService: {}, calculateLevel: vi.fn() }));
vi.mock('@/services/notification.service', () => ({ NotificationService: {} }));
import { PostService } from '../post.service';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([]);
  mocks.count.mockResolvedValue(0);
  mocks.following.mockResolvedValue([]);
});
describe('Feed relevance and freshness', () => {
  it('uses language preferences as ranking signals rather than hiding general/new posts', async () => {
    await PostService.getFeed('user', { languages: ['JS', 'PYTHON'], limit: 10 });
    expect(mocks.findMany.mock.calls[0][0].where.AND[0].language).toBeUndefined();
    expect(mocks.findMany.mock.calls[0][0].take).toBe(11);
    await PostService.countNewer('user', { after: new Date(), languages: ['JS', 'PYTHON'] });
    expect(mocks.count.mock.calls[0][0].where.AND[0].language).toBeUndefined();
    expect(mocks.count.mock.calls[0][0].where.AND[1].author).toBeDefined();
  });
  it('keeps following about people and preserves explicit single-language filters', async () => {
    await PostService.getFeed('user', { filter: 'following', languages: ['TS'] });
    expect(mocks.findMany.mock.calls[0][0].where.AND[0].language).toBeUndefined();
    expect(mocks.findMany.mock.calls[0][0].where.AND[0].author).toEqual({
      followers: { some: { followerId: 'user' } },
    });
    await PostService.getFeed('user', { language: 'JAVA', languages: ['TS'] });
    expect(mocks.findMany.mock.calls[1][0].where.AND[0].language).toBe('JAVA');
  });
  it('uses the chronological boundary rather than the last ranked card, preserving all posts across pages', async () => {
    const posts = ['fresh', 'unrelated', 'interest', 'next'].map((id, index) => ({
      id,
      author_id: id,
      created_at: new Date(Date.now() - index * 1000),
      language: id === 'interest' ? 'TS' : null,
      upvotes: 0,
      quizzes: [],
      poll: null,
    }));
    mocks.findMany.mockResolvedValueOnce(posts);
    const result = await PostService.getFeed('user', { languages: ['TS'], limit: 3 });
    expect(result.items.map((post) => post.id)).toEqual(['fresh', 'interest', 'unrelated']);
    expect(decodeCursor(result.nextCursor!)).toEqual({
      t: posts[2].created_at.toISOString(),
      i: 'interest',
    });
    expect(mocks.following).toHaveBeenCalledOnce();
    expect(mocks.following.mock.calls[0][0].where.followingId.in).toHaveLength(3);
    expect(mocks.findMany.mock.calls[0][0].where.AND[2].OR).toContainEqual({
      audience: 'everyone',
    });
  });
  it('honors the explicit popularity choice in the following feed', async () => {
    await PostService.getFeed('user', { filter: 'following', sort: 'popular' });
    expect(mocks.findMany.mock.calls[0][0].orderBy).toEqual([
      { upvotes: 'desc' },
      { created_at: 'desc' },
      { id: 'desc' },
    ]);
    expect(mocks.following).not.toHaveBeenCalled();
  });
});
