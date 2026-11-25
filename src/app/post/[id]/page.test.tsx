import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import PostDetailPage from './page';

const mocks = vi.hoisted(() => ({
  findPost: vi.fn(),
  updatePost: vi.fn(),
  findBookmark: vi.fn(),
  renderDetail: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({
    id: 'viewer',
    username: 'viewer',
    email: 'private@example.invalid',
    avatar_url: '/assets/avatar.png',
    avatar_config: { profileStyle: { frame: { id: 'none' } } },
    total_xp: 120,
    streak_days: 3,
    last_active_at: new Date('2026-11-01T01:00:00.000Z'),
    trails: [{ id: 'trail-ts', language: 'TS', level: 2, xp: 50, streak: 4, user_id: 'viewer' }],
    badges: [
      {
        badge: {
          slug: 'first_post',
          label: 'Primeiro post',
          description: 'Primeira publicação.',
          icon: 'sparkles',
          color: '#0083fe',
        },
        earned_at: new Date('2026-10-31T12:00:00.000Z'),
        user_id: 'viewer',
      },
    ],
  })),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: { findFirst: mocks.findPost, update: mocks.updatePost },
    bookmark: { findUnique: mocks.findBookmark },
  },
}));
vi.mock('./PostDetailContent', () => ({
  PostDetailContent: (props: unknown) => {
    mocks.renderDetail(props);
    return null;
  },
}));

describe('post detail author identity', () => {
  it('loads identity and XP for the post author and all visible replies in one query', async () => {
    mocks.updatePost.mockResolvedValue({});
    mocks.findBookmark.mockResolvedValue(null);
    mocks.findPost.mockResolvedValue({ created_at: new Date(), answers: [], quizzes: [] });

    await PostDetailPage({ params: Promise.resolve({ id: 'post-1' }) });

    const include = mocks.findPost.mock.calls[0][0].include;
    const expected = {
      id: true,
      username: true,
      avatar_url: true,
      avatar_config: true,
      total_xp: true,
    };
    expect(include.author.select).toEqual(expected);
    expect(include.answers.include.author.select).toEqual(expected);
    expect(include.answers.where).toEqual({
      author: {
        blocks_made: { none: { blockedId: 'viewer' } },
        blocks_received: { none: { blockerId: 'viewer' } },
      },
    });
    expect(include.answers.include.votes.where).toEqual({ user_id: 'viewer' });
  });

  it('renders saved replies at every depth and omits branches whose parent is hidden', async () => {
    const created_at = new Date('2026-11-01T01:00:00.000Z');
    const chain = Array.from({ length: 6 }, (_, depth) => ({
      id: `reply-${depth}`,
      parent_id: depth === 0 ? null : `reply-${depth - 1}`,
      body: `Resposta ${depth}`,
      created_at,
    }));
    mocks.updatePost.mockResolvedValue({});
    mocks.findBookmark.mockResolvedValue(null);
    mocks.findPost.mockResolvedValue({
      created_at,
      answers: [
        ...chain,
        { id: 'hidden-child', parent_id: 'blocked-author-reply', body: 'Ramo oculto', created_at },
        { id: 'hidden-grandchild', parent_id: 'hidden-child', body: 'Ramo oculto', created_at },
      ],
      quizzes: [],
    });

    render(await PostDetailPage({ params: Promise.resolve({ id: 'post-1' }) }));

    let replies = mocks.renderDetail.mock.calls.at(-1)![0].post.answers;
    for (const row of chain) {
      expect(replies).toHaveLength(1);
      expect(replies[0]).toMatchObject({ ...row, created_at: created_at.toISOString() });
      replies = replies[0].replies;
    }
    expect(replies).toEqual([]);
  });

  it('supplies the shared right rail with the viewer activity and earned badges without private account fields', async () => {
    mocks.updatePost.mockResolvedValue({});
    mocks.findBookmark.mockResolvedValue({ id: 'bookmark' });
    mocks.findPost.mockResolvedValue({
      created_at: new Date('2026-11-01T01:00:00.000Z'),
      answers: [],
      quizzes: [],
    });

    render(await PostDetailPage({ params: Promise.resolve({ id: 'post-1' }) }));

    const props = mocks.renderDetail.mock.calls.at(-1)![0];
    expect(props.user).toEqual({
      id: 'viewer',
      username: 'viewer',
      avatar_url: '/assets/avatar.png',
      avatar_config: { profileStyle: { frame: { id: 'none' } } },
      total_xp: 120,
      streak: 4,
      last_active_at: '2026-11-01T01:00:00.000Z',
      trails: [{ id: 'trail-ts', language: 'TS', level: 2, xp: 50, streak: 4 }],
      badges: [
        {
          slug: 'first_post',
          label: 'Primeiro post',
          description: 'Primeira publicação.',
          icon: 'sparkles',
          color: '#0083fe',
          earned_at: '2026-10-31T12:00:00.000Z',
        },
      ],
    });
    expect(props.initialIsSaved).toBe(true);
    expect(props.user).not.toHaveProperty('email');
    expect(props.user.trails[0]).not.toHaveProperty('user_id');
  });
});
