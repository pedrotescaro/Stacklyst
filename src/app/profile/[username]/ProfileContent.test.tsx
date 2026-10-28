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
  it('shows the authenticated viewer in the personal rail when visiting a profile', () => {
    render(<ProfileContent {...props} />);
    expect(screen.getByLabelText('Painel pessoal')).toHaveTextContent('viewer');
  });
  it('shows exactly six requested tabs and keeps all metrics inside Statistics', async () => {
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação real');
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Postagens',
      'Fotos',
      'Vídeos',
      'Curtidas',
      'Respostas',
      'Estatísticas',
    ]);
    expect(screen.queryByText('Publicações')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Estatísticas' }));
    const panel = screen.getByRole('tabpanel');
    expect(within(panel).getByText('Publicações')).toBeInTheDocument();
    expect(within(panel).getByText('Comentários')).toBeInTheDocument();
    expect(within(panel).getByText('12')).toBeInTheDocument();
    expect(within(panel).getByText('7')).toBeInTheDocument();
    expect(within(panel).getByText('23')).toBeInTheDocument();
    expect(within(panel).queryByText('Seguidores')).not.toBeInTheDocument();
    expect(within(panel).queryByText('Seguindo')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Perfil social').compareDocumentPosition(screen.getByRole('tablist')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
  it('loads actual photos and replies and supports tab keyboard navigation', async () => {
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação real');
    fireEvent.click(screen.getByRole('tab', { name: 'Fotos' }));
    const link = await screen.findByRole('link', { name: 'Abrir foto: Foto real' });
    expect(link).toHaveAttribute('href', '/post/photo-post');
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Fotos' }), { key: 'ArrowRight' });
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Vídeos' })).toHaveAttribute('aria-selected', 'true')
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Respostas' }));
    await screen.findByText('Resposta real');
  });
  it('searches the full server-backed list and keeps the query when changing tabs', async () => {
    render(<ProfileContent {...props} />);
    await screen.findByText('Publicação real');
    fireEvent.click(screen.getByRole('button', { name: 'Buscar no perfil' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar no conteúdo do perfil' }), {
      target: { value: 'código antigo' },
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'author=developer&useCursor=true&limit=10&search=c%C3%B3digo%20antigo'
        ),
        expect.any(Object)
      )
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Respostas' }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/replies?limit=10&search=c%C3%B3digo%20antigo'),
        expect.any(Object)
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar busca' }));
    await waitFor(() => expect(screen.queryByRole('searchbox')).not.toBeInTheDocument());
  });
});
