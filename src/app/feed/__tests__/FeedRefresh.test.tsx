import type { ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  loadMore: null as null | (() => Promise<void>),
  text: (pt: string) => pt,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/i18n/useLocalizedText', () => ({ useLocalizedText: () => ({ text: mocks.text }) }));
vi.mock('@/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: ({ onLoadMore }: { onLoadMore: () => Promise<void> }) => {
    mocks.loadMore = onLoadMore;
    return { current: null };
  },
}));
vi.mock('@/hooks/useSoundEffects', () => ({ useSoundEffects: () => ({ playSound: vi.fn() }) }));
vi.mock('@/lib/client/current-user', () => ({ getCurrentUser: async () => null }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/FeedRightSidebar', () => ({ FeedRightSidebar: () => null }));
vi.mock('@/components/PostCard', () => ({
  PostCard: ({ post }: { post: { id: string; title: string; bookmarks?: unknown[] } }) => (
    <article aria-label={post.id} data-bookmarked={Boolean(post.bookmarks?.length)}>
      {post.title}
    </article>
  ),
}));
vi.mock('@/components/MobilePullToRefresh', () => ({
  MobilePullToRefresh: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../FeedControls', () => ({
  FeedControls: ({
    onFilterChange,
    onSortChange,
  }: {
    onFilterChange: (value: string) => void;
    onSortChange: (value: string) => void;
  }) => (
    <>
      <button onClick={() => onFilterChange('following')}>Seguindo</button>
      <button onClick={() => onSortChange('popular')}>Popular</button>
    </>
  ),
}));
import { FeedContent } from '../FeedContent';
import { getFeedSettings } from '@/lib/feed-preferences';

function post(id: string, created_at = '2026-11-01T10:00:00Z') {
  return {
    id,
    title: id,
    created_at,
    author: { username: 'author' },
    upvotes: 0,
    votes: [],
    bookmarks: [],
  };
}
const props = {
  initialUser: { id: 'viewer', username: 'viewer', total_xp: 0, trails: [], badges: [] },
  initialPosts: [post('old')],
  initialDuels: [{ id: 'closed', status: 'CLOSED' }],
  initialCurrentDate: '2026-11-01T10:01:00Z',
  initialNextCursor: 'old-cursor',
};
const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;
function fallback(input: RequestInfo | URL) {
  const url = String(input);
  return response(
    url.includes('mode=count')
      ? { count: 1 }
      : url.includes('weekly-activity')
        ? { weekDays: [] }
        : {}
  );
}
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  );
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(global, 'fetch').mockImplementation(async (input) => fallback(input));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Feed refresh and request ownership', () => {
  it('reloads the current feed when only its content preferences change', async () => {
    const preferences = {
      feed: 'for-you' as const,
      languages: ['JS' as const],
      feedSettings: getFeedSettings(),
    };
    const fetchMock = vi
      .mocked(fetch)
      .mockImplementation(async (input) =>
        String(input).includes('feedRevision=1') && !String(input).includes('mode=count')
          ? response({ items: [post('filtered')], nextCursor: null })
          : fallback(input)
      );
    render(<FeedContent {...props} initialPreferences={preferences} />);
    await act(async () => {
      window.dispatchEvent(
        new CustomEvent('stacklyst:feed-preferences', {
          detail: {
            ...preferences,
            feedSettings: {
              ...preferences.feedSettings,
              feeds: preferences.feedSettings.feeds.map((feed) => ({ ...feed, showCode: false })),
            },
          },
        })
      );
    });
    expect(await screen.findByRole('article', { name: 'filtered' })).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes('feedId=for-you&feedRevision=1'))
    ).toBe(true);
  });
  it('replaces the snapshot and pagination when refreshed, instead of retaining removed posts', async () => {
    const fetchMock = vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).startsWith('/api/posts?limit=')
        ? response({
            items: [{ ...post('new'), bookmarks: [{ id: 'bookmark' }] }],
            nextCursor: 'fresh-cursor',
          })
        : String(input).includes('cursor=fresh-cursor')
          ? response({ items: [post('older')], nextCursor: null })
          : fallback(input)
    );
    render(<FeedContent {...props} />);
    fireEvent.click(await screen.findByRole('button', { name: /Ver 1 novo post/ }));
    expect(await screen.findByRole('article', { name: 'new' })).toHaveAttribute(
      'data-bookmarked',
      'true'
    );
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'old' })).not.toBeInTheDocument()
    );
    await act(async () => {
      await mocks.loadMore?.();
    });
    expect(await screen.findByRole('article', { name: 'older' })).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('cursor=fresh-cursor'))).toBe(
      true
    );
    expect(
      fetchMock.mock.calls.find(([url]) => String(url).includes('cursor=fresh-cursor'))?.[1]
    ).toMatchObject({ cache: 'no-store' });
  });
  it('does not append an old page after a newer refresh has completed', async () => {
    let resolveOld!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).includes('cursor=old-cursor')
        ? new Promise<Response>((resolve) => {
            resolveOld = resolve;
          })
        : String(input).startsWith('/api/posts?limit=')
          ? response({ items: [post('new')], nextCursor: null })
          : fallback(input)
    );
    render(<FeedContent {...props} />);
    let pending: Promise<void> | undefined;
    act(() => {
      pending = mocks.loadMore?.();
    });
    fireEvent.click(await screen.findByRole('button', { name: /Ver 1 novo post/ }));
    expect(await screen.findByRole('article', { name: 'new' })).toBeInTheDocument();
    await act(async () => {
      resolveOld(response({ items: [post('stale-page')], nextCursor: 'stale-cursor' }));
      await pending;
    });
    expect(screen.queryByRole('article', { name: 'stale-page' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'old' })).not.toBeInTheDocument()
    );
  });
  it('adopts the server snapshot after router.refresh without remounting', async () => {
    const { rerender } = render(<FeedContent {...props} />);
    rerender(
      <FeedContent {...props} initialPosts={[post('server-new')]} initialNextCursor={null} />
    );
    expect(await screen.findByRole('article', { name: 'server-new' })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: 'old' })).not.toBeInTheDocument()
    );
  });
  it('ignores an old refresh response after switching to following', async () => {
    let resolveRefresh!: (response: Response) => void;
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).startsWith('/api/posts?limit=')
        ? new Promise<Response>((resolve) => {
            resolveRefresh = resolve;
          })
        : String(input).includes('filter=following') && !String(input).includes('mode=count')
          ? response({ items: [post('followed')], nextCursor: null })
          : fallback(input)
    );
    render(<FeedContent {...props} />);
    fireEvent.click(await screen.findByRole('button', { name: /Ver 1 novo post/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Seguindo' }));
    expect(await screen.findByRole('article', { name: 'followed' })).toBeInTheDocument();
    await act(async () => {
      resolveRefresh(response({ items: [post('stale-refresh')], nextCursor: null }));
    });
    expect(screen.queryByRole('article', { name: 'stale-refresh' })).not.toBeInTheDocument();
  });
  it('checks an empty feed for newly published posts instead of polling only nonempty lists', async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockImplementation(async (input) =>
        String(input).includes('mode=count') ? response({ count: 1 }) : fallback(input)
      );
    render(<FeedContent {...props} initialPosts={[]} initialNextCursor={null} />);
    expect(await screen.findByRole('button', { name: /Ver 1 novo post/ })).toBeInTheDocument();
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes('after=2026-11-01T10%3A01%3A00Z'))
      ).toBe(true)
    );
  });
  it('keeps Popular ordering and its own cursor after a chronological server refresh', async () => {
    let popularRequests = 0;
    const fetchMock = vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('mode=count')) return response({ count: 0 });
      if (url.includes('cursor=popular-cursor'))
        return response({ items: [post('popular-next')], nextCursor: null });
      if (url.includes('sort=popular')) {
        popularRequests++;
        return response({
          items: [post(popularRequests === 1 ? 'popular-old' : 'popular-new')],
          nextCursor: 'popular-cursor',
        });
      }
      return fallback(input);
    });
    const preferences = { feed: 'following' as const, languages: ['TS' as const] };
    const { rerender } = render(<FeedContent {...props} initialPreferences={preferences} />);
    fireEvent.click(screen.getByRole('button', { name: 'Popular' }));
    expect(await screen.findByRole('article', { name: 'popular-old' })).toBeInTheDocument();
    rerender(
      <FeedContent
        {...props}
        initialPreferences={preferences}
        initialPosts={[post('chronological-server')]}
        initialNextCursor="chronological-cursor"
      />
    );
    expect(await screen.findByRole('article', { name: 'popular-new' })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'chronological-server' })).not.toBeInTheDocument();
    await act(async () => {
      await mocks.loadMore?.();
    });
    expect(await screen.findByRole('article', { name: 'popular-next' })).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes('cursor=chronological-cursor'))
    ).toBe(false);
  });
});
