import { describe, expect, it, vi } from 'vitest';
import PostDetailPage from './page';

const mocks = vi.hoisted(() => ({
  findPost: vi.fn(),
  updatePost: vi.fn(),
  findBookmark: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({ id: 'viewer', username: 'viewer', total_xp: 0 })),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: { findUnique: mocks.findPost, update: mocks.updatePost },
    bookmark: { findUnique: mocks.findBookmark },
  },
}));
vi.mock('./PostDetailContent', () => ({ PostDetailContent: () => null }));

describe('post detail author identity', () => {
  it('loads identity and XP for the post author and every fetched reply level', async () => {
    mocks.updatePost.mockResolvedValue({});
    mocks.findBookmark.mockResolvedValue(null);
    mocks.findPost.mockResolvedValue({ created_at: new Date(), answers: [], quizzes: [] });

    await PostDetailPage({ params: Promise.resolve({ id: 'post-1' }) });

    const include = mocks.findPost.mock.calls[0][0].include;
    const expected = { username: true, avatar_url: true, avatar_config: true, total_xp: true };
    expect(include.author.select).toEqual(expected);
    let answers = include.answers;
    for (let depth = 0; depth <= 3; depth++) {
      expect(answers.include.author.select).toEqual(expected);
      answers = answers.include.replies;
    }
  });
});
