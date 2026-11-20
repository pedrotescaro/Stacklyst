import { describe, expect, it, vi } from 'vitest';
import { PostService } from '@/services/post.service';

const redirect = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  })
);
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({
    id: 'viewer',
    username: 'viewer',
    total_xp: 0,
    streak_days: 0,
    last_active_at: null,
    trails: [],
    badges: [],
  })),
}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    mobileState: { findUnique: vi.fn(async () => ({ value: {} })) },
    badge: { findMany: vi.fn(async () => []) },
  },
}));
vi.mock('@/lib/onboarding', () => ({
  ONBOARDING_STATE_KEY: 'onboarding',
  parseOnboarding: () => ({ feed: 'for-you', languages: [] }),
}));
vi.mock('@/services/post.service', () => ({
  PostService: { getFeed: vi.fn(async () => ({ items: [], nextCursor: null })) },
}));
vi.mock('./FeedContent', () => ({ FeedContent: () => null }));

import FeedPage from './page';

describe('Feed search URL', () => {
  it('redirects older search links to Explore before loading the timeline', async () => {
    await expect(
      FeedPage({ searchParams: Promise.resolve({ q: '  #react hooks  ' }) })
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/explore?q=%23react+hooks');
    expect(PostService.getFeed).not.toHaveBeenCalled();
  });
  it('ignores repeated query parameters', async () => {
    const page = await FeedPage({ searchParams: Promise.resolve({ q: ['one', 'two'] }) });
    expect(page.props.initialPosts).toEqual([]);
  });
});
