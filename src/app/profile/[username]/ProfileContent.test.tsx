import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileContent } from './ProfileContent';
vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <nav aria-label="Navegação global" /> }));
vi.mock('@/components/profile/ProfileRightRail', () => ({
  ProfileRightRail: ({ user }: { user: { username: string } }) => (
    <aside aria-label="Painel pessoal">{user.username}</aside>
  ),
}));
vi.mock('@/components/PostCard', () => ({
  PostCard: ({ post }: { post: { body: string } }) => <article>{post.body}</article>,
}));
vi.mock('@/components/ProfileReplyThread', () => ({
  ProfileReplyThread: ({ reply }: { reply: { body: string } }) => <article>{reply.body}</article>,
}));
vi.mock('@/components/motion/FollowersModal', () => ({ FollowersModal: () => null }));
vi.mock('@/components/AchievementShowcase', () => ({ AchievementShowcase: () => null }));
vi.mock('@/components/LanguageTrailBar', () => ({ LanguageTrailBar: () => null }));
vi.mock('@/components/profile-inline/SocialProfileOverview', () => ({
  SocialProfileOverview: () => (
    <section aria-label="Perfil social">
      <h1>Developer</h1>
      <p>Uma biografia compacta</p>
      <h2>Tags e hobbies</h2>
      <h2>Estudando atualmente</h2>
      <h2>Música do perfil</h2>
    </section>
  ),
}));
const props = {
  railUser: { username: 'viewer', streak: 0, last_active_at: null, trails: [], badges: [] },
  user: { id: 'owner', username: 'developer', total_xp: 30 },
  profileUser: {
    id: 'owner',
    username: 'developer',
    created_at: '2026-10-01T12:00:00Z',
    total_xp: 30,
    badges: [],
  },
  stats: { answers_count: 7, accuracy: 80, accepted_count: 2, posts_count: 12, likes_received: 23 },
  trails: [],
  allBadges: [],
  isFollowing: false,
  followersCount: 16,
  followingCount: 21,
  globalRank: 1,
  totalParticipants: 10,
  dailyProgress: { xpEarned: 0, correctAnswers: 0, trailActivities: 0 },
};
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      Response.json(
        url.includes('type=photos')
          ? {
              items: [{ id: 'photo-post', title: 'Foto real', image_url: '/test-photo.png' }],
              nextCursor: null,
            }
          : url.includes('weekly-activity')
            ? { weekDays: [] }
            : {
                items: [
                  {
                    id: 'post',
                    body: url.includes('/replies') ? 'Resposta real' : 'Publicação real',
                    author_id: 'owner',
                  },
                ],
                nextCursor: null,
              }
      )
    )
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('Compact social profile content', () => {
  it('renders original posts and contextual replies together in Postagens and Curtidas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          items: [
            { id: 'original', kind: 'post', author_id: 'owner', body: 'Publicação própria' },
            {
              id: 'featured',
              kind: 'reply',
              author_id: 'owner',
              body: 'Minha resposta como publicação',
            },
          ],
          nextCursor: null,
        })
      )
    );
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação própria');
    expect(await screen.findByText('Minha resposta como publicação')).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByTestId('profile-desktop-tabs')).getByRole('tab', { name: 'Curtidas' })
    );
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/activity?tab=likes'),
        expect.any(Object)
      )
    );
    expect(await screen.findByText('Minha resposta como publicação')).toBeInTheDocument();
  });
  it('shows the authenticated viewer in the personal rail when visiting a profile', () => {
    render(<ProfileContent {...props} />);
    expect(screen.getByLabelText('Painel pessoal')).toHaveTextContent('viewer');
  });
  it('shows exactly six requested tabs and keeps all metrics inside Statistics', async () => {
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação real');
    const desktop = within(screen.getByTestId('profile-desktop-tabs'));
    expect(desktop.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Postagens',
      'Fotos',
      'Vídeos',
      'Curtidas',
      'Respostas',
      'Estatísticas',
    ]);
    expect(screen.queryByText('Publicações')).not.toBeInTheDocument();
    fireEvent.click(desktop.getByRole('tab', { name: 'Estatísticas' }));
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('Publicações')).toBeInTheDocument();
    expect(within(panel).getByText('Comentários')).toBeInTheDocument();
    expect(within(panel).getByText('12')).toBeInTheDocument();
    expect(within(panel).getByText('7')).toBeInTheDocument();
    expect(within(panel).getByText('23')).toBeInTheDocument();
    expect(within(panel).queryByText('Seguidores')).not.toBeInTheDocument();
    expect(within(panel).queryByText('Seguindo')).not.toBeInTheDocument();
    expect(
      screen
        .getByLabelText('Perfil social')
        .compareDocumentPosition(screen.getByTestId('profile-desktop-tabs')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
  it('loads actual photos and replies and supports tab keyboard navigation', async () => {
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação real');
    const desktop = within(screen.getByTestId('profile-desktop-tabs'));
    fireEvent.click(desktop.getByRole('tab', { name: 'Fotos' }));
    const link = await screen.findByRole('link', { name: 'Abrir foto: Foto real' });
    expect(link).toHaveAttribute('href', '/post/photo-post');
    fireEvent.keyDown(desktop.getByRole('tab', { name: 'Fotos' }), { key: 'ArrowRight' });
    await waitFor(() =>
      expect(desktop.getByRole('tab', { name: 'Vídeos' })).toHaveAttribute('aria-selected', 'true')
    );
    fireEvent.click(desktop.getByRole('tab', { name: 'Respostas' }));
    await screen.findByText('Resposta real');
  });
  it('searches the full server-backed list and keeps the query when changing tabs', async () => {
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação real');
    const desktop = within(screen.getByTestId('profile-desktop-tabs'));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar no perfil' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar no conteúdo do perfil' }), {
      target: { value: 'código antigo' },
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          '/profile/developer/activity?tab=posts&limit=10&search=c%C3%B3digo%20antigo'
        ),
        expect.any(Object)
      )
    );
    fireEvent.click(desktop.getByRole('tab', { name: 'Respostas' }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/replies?limit=10&search=c%C3%B3digo%20antigo'),
        expect.any(Object)
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar busca' }));
    await waitFor(() => expect(screen.queryByRole('searchbox')).not.toBeInTheDocument());
  });

  describe('Twitter/X style mobile profile navigation', () => {
    it('displays exactly five main options on mobile: Postagens, Curtidas, Respostas, Estatísticas, Mídia', async () => {
      render(<ProfileContent {...props} />);
      await screen.findByText('Publicação real');
      const mobile = within(screen.getByTestId('profile-mobile-tabs'));
      const tabs = mobile.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
      expect(tabs.map((tab) => tab.getAttribute('aria-label'))).toEqual([
        'Postagens',
        'Curtidas',
        'Respostas',
        'Estatísticas',
        'Vídeos',
      ]);
    });

    it('shows icon and visible text only on active tab, and only icon (hidden text) on inactive tabs', async () => {
      render(<ProfileContent {...props} />);
      await screen.findByText('Publicação real');
      const mobile = within(screen.getByTestId('profile-mobile-tabs'));

      // Initially 'posts' is active
      const postsTab = mobile.getByRole('tab', { name: 'Postagens' });
      expect(postsTab).toHaveAttribute('aria-selected', 'true');
      expect(postsTab.querySelector('span:not(.sr-only)')).toHaveTextContent('Postagens');

      // Inactive tabs only have sr-only labels
      const likesTab = mobile.getByRole('tab', { name: 'Curtidas' });
      expect(likesTab).toHaveAttribute('aria-selected', 'false');
      const likesVisibleSpan = likesTab.querySelector('span:not(.sr-only)');
      expect(likesVisibleSpan?.querySelector('._mobileTabLabel_029fb0')).toBeNull();

      // Switch to Curtidas
      fireEvent.click(likesTab);
      await waitFor(() => {
        expect(likesTab).toHaveAttribute('aria-selected', 'true');
        expect(postsTab).toHaveAttribute('aria-selected', 'false');
      });
      expect(likesTab.textContent).toContain('Curtidas');
    });

    it('groups Vídeos and Fotos into a single Mídia tab with dropdown menu', async () => {
      render(<ProfileContent {...props} />);
      await screen.findByText('Publicação real');
      const mobile = within(screen.getByTestId('profile-mobile-tabs'));

      const mediaTab = mobile.getByRole('tab', { name: 'Vídeos' });
      expect(mediaTab).toBeInTheDocument();
      expect(mediaTab).toHaveAttribute('aria-haspopup', 'menu');
      expect(mediaTab).toHaveAttribute('aria-expanded', 'false');

      // Tapping Mídia opens the dropdown menu
      fireEvent.click(mediaTab);
      expect(mediaTab).toHaveAttribute('aria-expanded', 'true');

      const menu = screen.getByRole('menu', { name: 'Opções de mídia' });
      expect(menu).toBeInTheDocument();

      const options = within(menu).getAllByRole('menuitemradio');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Vídeos');
      expect(options[1]).toHaveTextContent('Fotos');
      expect(options[0]).toHaveAttribute('aria-checked', 'true');
      expect(options[1]).toHaveAttribute('aria-checked', 'false');

      // Clicking Fotos in dropdown switches to photos, closes menu, and updates tab label
      fireEvent.click(options[1]);
      await waitFor(() => {
        expect(screen.queryByRole('menu', { name: 'Opções de mídia' })).not.toBeInTheDocument();
      });
      expect(mediaTab).toHaveAttribute('aria-label', 'Fotos');
      expect(mediaTab.textContent).toContain('Fotos');

      // Reopening menu now marks Fotos as checked
      fireEvent.click(mediaTab);
      const reopenedMenu = screen.getByRole('menu', { name: 'Opções de mídia' });
      const reopenedOptions = within(reopenedMenu).getAllByRole('menuitemradio');
      expect(reopenedOptions[0]).toHaveAttribute('aria-checked', 'false');
      expect(reopenedOptions[1]).toHaveAttribute('aria-checked', 'true');

      // Dismiss menu on Escape key
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('menu', { name: 'Opções de mídia' })).not.toBeInTheDocument();
      });
    });

    it('supports mobile keyboard navigation between the 5 tabs', async () => {
      render(<ProfileContent {...props} />);
      await screen.findByText('Publicação real');
      const mobile = within(screen.getByTestId('profile-mobile-tabs'));

      const postsTab = mobile.getByRole('tab', { name: 'Postagens' });
      expect(postsTab).toHaveAttribute('aria-selected', 'true');

      fireEvent.keyDown(postsTab, { key: 'ArrowRight' });
      await waitFor(() => {
        expect(mobile.getByRole('tab', { name: 'Curtidas' })).toHaveAttribute(
          'aria-selected',
          'true'
        );
      });

      const likesTab = mobile.getByRole('tab', { name: 'Curtidas' });
      fireEvent.keyDown(likesTab, { key: 'End' });
      await waitFor(() => {
        expect(mobile.getByRole('tab', { name: 'Vídeos' })).toHaveAttribute(
          'aria-selected',
          'true'
        );
      });
    });
  });
});
