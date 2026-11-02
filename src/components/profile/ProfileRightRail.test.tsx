import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { ProfileRightRail } from './ProfileRightRail';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
vi.mock('@/components/AchievementShowcase', () => ({ AchievementShowcase: () => null }));
vi.mock('@/app/feed/FeedEngagementCard', () => ({ FeedEngagementCard: () => null }));

afterEach(() => {
  cleanup();
  push.mockClear();
  vi.unstubAllGlobals();
});

describe('Profile personal rail recommendations', () => {
  it('passes the authenticated viewer to the real WhoToFollow widget without adding IDs to the URL', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/quiz/weekly-activity') return Response.json({ weekDays: [] });
      if (url === '/api/users/suggestions?limit=3')
        return Response.json([
          {
            id: 'viewer-id',
            username: 'viewer',
            display_name: 'Viewer must be excluded',
            avatar_url: null,
            total_xp: 0,
            reason: { type: 'active' },
          },
          {
            id: 'alice-id',
            username: 'alice',
            display_name: 'Alice',
            avatar_url: null,
            total_xp: 40,
            reason: { type: 'active' },
          },
        ]);
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ProfileRightRail
        user={{
          id: 'viewer-id',
          username: 'viewer',
          streak: 0,
          last_active_at: null,
          trails: [],
          badges: [],
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Quem seguir' })).toBeInTheDocument();
    const recommendations = within(screen.getByRole('region', { name: 'Quem seguir' }));
    expect(await recommendations.findByText('@alice')).toBeInTheDocument();
    expect(recommendations.queryByText('Viewer must be excluded')).not.toBeInTheDocument();
    expect(recommendations.queryByText('@viewer')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/users/suggestions?limit=3', {
      signal: expect.any(AbortSignal),
      cache: 'no-store',
    });
    const urls = fetchMock.mock.calls.map(([input]) => String(input));
    expect(urls.every((url) => !url.includes('viewer-id') && !url.includes('owner-id'))).toBe(true);
    expect(urls.some((url) => url.includes('/follow'))).toBe(false);
  });
});

describe('Feed search from another page', () => {
  it('navigates to the feed with the entered query', () => {
    render(<FeedRightSidebar weeklyActivity={new Map()} />);
    const input = screen.getByRole('textbox', { name: 'Buscar' });
    fireEvent.change(input, { target: { value: '  typescript e react  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(push).toHaveBeenCalledWith('/feed?q=typescript%20e%20react');
  });
});
