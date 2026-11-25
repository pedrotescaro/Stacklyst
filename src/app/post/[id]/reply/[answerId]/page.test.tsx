import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReplyDetailPage from './page';

const mocks = vi.hoisted(() => ({
  findPost: vi.fn(),
  updatePost: vi.fn(),
  findBookmark: vi.fn(),
  renderDetail: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: mocks.notFound,
}));
vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({
    id: 'viewer',
    username: 'viewer',
    avatar_url: null,
    avatar_config: null,
    total_xp: 100,
    streak_days: 1,
    last_active_at: null,
    trails: [],
    badges: [],
  })),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: { findFirst: mocks.findPost, update: mocks.updatePost },
    bookmark: { findUnique: mocks.findBookmark },
  },
}));
vi.mock('../../PostDetailContent', () => ({
  PostDetailContent: (props: unknown) => {
    mocks.renderDetail(props);
    return null;
  },
}));

describe('reply detail page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updatePost.mockResolvedValue({});
    mocks.findBookmark.mockResolvedValue(null);
  });

  it('passes focusedAnswerId when the nested reply exists in the visible thread', async () => {
    const created_at = new Date('2026-11-01T01:00:00.000Z');
    mocks.findPost.mockResolvedValue({
      id: 'post-1',
      created_at,
      answers: [
        { id: 'r1', parent_id: null, body: 'Primeira', created_at },
        { id: 'r2', parent_id: 'r1', body: 'Segunda', created_at },
      ],
      quizzes: [],
    });

    render(await ReplyDetailPage({ params: Promise.resolve({ id: 'post-1', answerId: 'r2' }) }));

    expect(mocks.renderDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        focusedAnswerId: 'r2',
        post: expect.objectContaining({ id: 'post-1' }),
      })
    );
  });

  it('returns notFound when the target reply belongs to a hidden branch or is missing', async () => {
    const created_at = new Date('2026-11-01T01:00:00.000Z');
    mocks.findPost.mockResolvedValue({
      id: 'post-1',
      created_at,
      answers: [{ id: 'orphan', parent_id: 'blocked-parent', body: 'Oculta', created_at }],
      quizzes: [],
    });

    await expect(
      ReplyDetailPage({ params: Promise.resolve({ id: 'post-1', answerId: 'orphan' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.updatePost).not.toHaveBeenCalled();
  });
});
