import { describe, expect, it, vi } from 'vitest';

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
  it('passes the query from the URL into the interactive feed', async () => {
    const page = await FeedPage({ searchParams: Promise.resolve({ q: '  react  ' }) });
    expect(page.props.initialSearchQuery).toBe('react');
  });
  it('ignores repeated query parameters', async () => {
    const page = await FeedPage({ searchParams: Promise.resolve({ q: ['one', 'two'] }) });
    expect(page.props.initialSearchQuery).toBe('');
  });
});
