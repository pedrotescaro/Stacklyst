import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostService } from '@/services/post.service';
import { prisma } from '@/lib/prisma';

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
vi.mock('@/services/post.service', () => ({
  PostService: { getFeed: vi.fn(async () => ({ items: [], nextCursor: null })) },
}));
vi.mock('./FeedContent', () => ({ FeedContent: () => null }));

import FeedPage from './page';

beforeEach(() => vi.clearAllMocks());

describe('Feed entry preferences', () => {
  it.each([null, { value: {} }])(
    'opens the first feed without mandatory onboarding: %j',
    async (state) => {
      vi.mocked(prisma.mobileState.findUnique).mockResolvedValueOnce(state as never);
      const page = await FeedPage({ searchParams: Promise.resolve({}) });
      expect(redirect).not.toHaveBeenCalled();
      expect(page.props.initialPreferences).toEqual({ feed: 'for-you', languages: ['JS'] });
      expect(PostService.getFeed).toHaveBeenCalledWith('viewer', {
        limit: 10,
        filter: 'for-you',
        languages: ['JS'],
        feedId: undefined,
      });
    }
  );

  it('preserves saved feed and language preferences', async () => {
    const preferences = { feed: 'following', languages: ['TS', 'PYTHON'] };
    vi.mocked(prisma.mobileState.findUnique).mockResolvedValueOnce({ value: preferences } as never);
    const page = await FeedPage({ searchParams: Promise.resolve({}) });
    expect(page.props.initialPreferences).toEqual(preferences);
    expect(PostService.getFeed).toHaveBeenCalledWith(
      'viewer',
      expect.objectContaining({ filter: 'following', languages: ['TS', 'PYTHON'] })
    );
  });
});

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
