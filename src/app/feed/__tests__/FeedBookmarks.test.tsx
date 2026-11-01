import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/hooks/useInfiniteScroll', () => ({ useInfiniteScroll: () => ({ current: null }) }));
vi.mock('@/hooks/useSoundEffects', () => ({ useSoundEffects: () => ({ playSound: vi.fn() }) }));
vi.mock('@/lib/client/current-user', () => ({ getCurrentUser: async () => null }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/FeedRightSidebar', () => ({ FeedRightSidebar: () => null }));
vi.mock('@/components/MobilePullToRefresh', () => ({
  MobilePullToRefresh: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
import { FeedContent } from '../FeedContent';

const post = {
  id: 'feed-bookmark',
  title: 'Salvar para estudar',
  body: 'Conteúdo para reler depois.',
  created_at: '2026-11-01T12:00:00Z',
  view_count: 0,
  author: { id: 'author', username: 'author', total_xp: 100 },
  _count: { answers: 0 },
  votes: [],
  bookmarks: [],
};
const props = {
  initialUser: { id: 'viewer', username: 'viewer', total_xp: 100, trails: [], badges: [] },
  initialPosts: [post],
  initialDuels: [],
  initialCurrentDate: '2026-11-01',
  initialNextCursor: null,
};
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi
      .fn()
      .mockImplementation((media: string) => ({
        media,
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
  );
  localStorage.setItem('stacklyst-sound', 'false');
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('saves through the real FeedContent and PostCard with one write and stays saved after reload', async () => {
  let saved = false;
  const writes: RequestInit[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/bookmark')) {
        writes.push(init!);
        saved = JSON.parse(String(init?.body)).bookmarked;
        return Response.json({ success: true, bookmarked: saved });
      }
      return Response.json(
        url.includes('mode=count')
          ? { count: 0 }
          : url.includes('weekly-activity')
            ? { weekDays: [] }
            : url.includes('/duels')
              ? []
              : {}
      );
    })
  );
  const user = userEvent.setup();
  const initial = render(<FeedContent {...props} />);
  await user.click(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Remover dos salvos' })).not.toBeDisabled()
  );
  expect(writes).toHaveLength(1);
  expect(JSON.parse(String(writes[0].body))).toEqual({ bookmarked: true });
  expect(saved).toBe(true);
  initial.unmount();
  await act(async () => {
    render(
      <FeedContent
        {...props}
        initialPosts={[{ ...post, bookmarks: saved ? [{ id: 'persisted' }] : [] }]}
        initialBookmarks={{ [post.id]: saved }}
      />
    );
  });
  expect(screen.getByRole('button', { name: 'Remover dos salvos' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  expect(writes).toHaveLength(1);
});
