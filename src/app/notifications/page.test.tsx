import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsPage from './page';

const router = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
const notices = [
  {
    id: 'follow-1',
    type: 'SYSTEM',
    source_type: 'FOLLOW',
    title: 'Novo seguidor',
    content: '@ana começou a seguir você.',
    link: '/profile/ana',
    is_read: false,
    created_at: new Date().toISOString(),
    actor: {
      username: 'ana',
      avatar_url: null,
      avatar_config: {
        displayName: 'Ana Dev',
        profileStyle: {
          flags: ['BR'],
          title: {
            id: 'posts-1',
            name: 'Iniciante',
            color: '#64748b',
            rarity: 'common',
            icon: 'sprout',
          },
        },
      },
    },
  },
  {
    id: 'like-1',
    type: 'LIKE',
    source_type: 'LIKE',
    title: 'Novo upvote',
    content: '@bruno deu um upvote.',
    link: '/post/one',
    is_read: true,
    created_at: new Date().toISOString(),
    actor: { username: 'bruno', avatar_url: null },
    upvoters: [{ username: 'outra-pessoa' }],
  },
  {
    id: 'mention-1',
    type: 'MENTION',
    source_type: 'MENTION',
    title: 'Você foi mencionado',
    content: '@carol mencionou você.',
    link: '/post/two',
    is_read: true,
    created_at: new Date().toISOString(),
    actor: { username: 'carol', avatar_url: null },
  },
];
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => null }));
vi.mock('@/components/FeedRightSidebar', () => ({ FeedRightSidebar: () => null }));
vi.mock('@/lib/client/current-user', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1', username: 'pessoa' })),
}));

describe('notifications navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => [] }))
    );
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('goes back when the browser has history', async () => {
    const historyLength = vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
    render(<NotificationsPage />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Notificações' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.back).toHaveBeenCalledOnce();
    historyLength.mockRestore();
  });

  it('falls back to the feed without browser history', async () => {
    const historyLength = vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
    render(<NotificationsPage />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Notificações' })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(router.push).toHaveBeenCalledWith('/feed');
    historyLength.mockRestore();
  });

  function loadNotices(deleteOk = true) {
    const fetchMock = vi.fn(async (_url: any, init?: RequestInit) =>
      init?.method === 'DELETE'
        ? { ok: deleteOk, json: async () => ({ success: deleteOk }) }
        : { ok: true, json: async () => notices }
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<NotificationsPage />);
    return fetchMock;
  }

  it('shows the actual actor with their flag and text-only beginner title', async () => {
    loadNotices();
    expect(await screen.findByText('Ana Dev')).toBeInTheDocument();
    expect(screen.getByAltText(/Bandeira: Brasil/)).toBeInTheDocument();
    expect(screen.getByText('Iniciante').querySelector('svg')).toBeNull();
    expect(screen.getByText(/seguiu você/)).toBeInTheDocument();
    expect(screen.getByText('bruno')).toBeInTheDocument();
    expect(screen.queryByText('outra-pessoa')).not.toBeInTheDocument();
  });

  it('filters followers and explicit mentions instead of searching for the recipient in text', async () => {
    loadNotices();
    await screen.findByText('Ana Dev');
    fireEvent.click(screen.getByRole('button', { name: 'Seguidores' }));
    expect(screen.getByText('Ana Dev')).toBeInTheDocument();
    expect(screen.queryByText('bruno')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Menções' }));
    expect(screen.getByText('carol')).toBeInTheDocument();
    expect(screen.queryByText('Ana Dev')).not.toBeInTheDocument();
  });

  it('deletes just the selected notification without following its link', async () => {
    const fetchMock = loadNotices();
    await screen.findByText('Ana Dev');
    fireEvent.click(
      screen.getByRole('button', { name: 'Excluir notificação: Novo seguidor de @ana' })
    );
    await waitFor(() => expect(screen.queryByText('Ana Dev')).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/notifications/follow-1', { method: 'DELETE' });
    expect(screen.getByText('bruno')).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('requires confirmation and deletes all categories even when a filter is active', async () => {
    const fetchMock = loadNotices();
    await screen.findByText('Ana Dev');
    fireEvent.click(screen.getByRole('button', { name: 'Seguidores' }));
    fireEvent.click(screen.getByRole('button', { name: 'Excluir todas as notificações' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Ana Dev')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Excluir todas as notificações' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Excluir todas' }));
    await waitFor(() => expect(screen.queryByText('Ana Dev')).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/notifications', { method: 'DELETE' });
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    expect(screen.queryByText('bruno')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir todas as notificações' })).toBeDisabled();
  });

  it('keeps notifications and reports failed deletion for retry', async () => {
    loadNotices(false);
    await screen.findByText('Ana Dev');
    fireEvent.click(
      screen.getByRole('button', { name: 'Excluir notificação: Novo seguidor de @ana' })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível excluir');
    expect(screen.getByText('Ana Dev')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Excluir notificação: Novo seguidor de @ana' })
    ).toBeEnabled();
  });

  it('reports a loading error and reloads when requested', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue({ ok: true, json: async () => notices });
    vi.stubGlobal('fetch', fetchMock);
    render(<NotificationsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Ana Dev')).toBeInTheDocument();
  });
});
