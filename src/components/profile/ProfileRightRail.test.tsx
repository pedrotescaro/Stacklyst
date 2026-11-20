import { cleanup, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { ProfileRightRail } from './ProfileRightRail';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/i18n/useLocalizedText', () => ({
  useLocalizedText: () => ({ text: (pt: string) => pt }),
}));
vi.mock('@/components/AchievementShowcase', () => ({ AchievementShowcase: () => null }));

afterEach(() => {
  cleanup();
  push.mockClear();
  vi.unstubAllGlobals();
});

describe('Profile personal rail recommendations', () => {
  it('renders stable initial streak and XP text across UTC midnight', () => {
    const rail = (
      <FeedRightSidebar
        hideWhoToFollow
        user={{
          streak: 1,
          last_active_at: '2026-11-20T22:00:00Z',
          trails: [{ id: 'ts', language: 'TS', level: 3, xp: 1600 }],
        }}
      />
    );
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-11-20T23:59:59Z'));
      const before = renderToString(rail);
      vi.setSystemTime(new Date('2026-11-21T00:00:01Z'));
      expect(renderToString(rail)).toBe(before);
      expect(before).toContain('1.600');
    } finally {
      vi.useRealTimers();
    }
  });

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

describe('Rail search from another page', () => {
  it('waits for submission and opens Explore with the entered query', async () => {
    render(<FeedRightSidebar weeklyActivity={new Map()} />);
    const user = userEvent.setup();
    const input = screen.getByRole('searchbox', { name: 'Pesquisar posts e pessoas' });
    await user.type(input, '  tipos & react  ');
    expect(push).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(push).toHaveBeenCalledWith('/explore?q=tipos+%26+react');
  });

  it('opens the People tab for a handle typed in the compact field', async () => {
    render(<FeedRightSidebar weeklyActivity={new Map()} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox'), '@marina');
    await user.click(screen.getByRole('button', { name: 'Pesquisar' }));
    expect(push).toHaveBeenCalledWith('/explore?q=%40marina&tab=people');
  });
});
