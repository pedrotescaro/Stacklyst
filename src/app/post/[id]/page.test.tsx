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
  it('loads identity and XP for the post author and every fetched reply level', async () => {
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
    let answers = include.answers;
    for (let depth = 0; depth <= 3; depth++) {
      expect(answers.include.author.select).toEqual(expected);
      answers = answers.include.replies;
    }
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
