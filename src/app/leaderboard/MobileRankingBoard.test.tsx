import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MobileRankingBoard } from './MobileRankingBoard';

vi.mock('@/components/FeedRankingSwitcher', () => ({
  FeedRankingSwitcher: () => <nav aria-label="Feed e ranking" />,
  feedRankingSurfaceClassName: '',
}));

const rows = [
  {
    rank: 1,
    username: 'ana',
    xp: 1500,
    level: 3,
    avatar_config: {
      displayName: 'Ana',
      profileStyle: {
        frame: { id: 'neon', decoration: 'neon', color: '#0083fe' },
        title: { id: 'posts-1', name: 'Primeiros Passos', color: '#0083fe', rarity: 'common' },
      },
    },
  },
  { rank: 2, username: 'bia', xp: 900, level: 2 },
  { rank: 3, username: 'caio', xp: 600, level: 2 },
  { rank: 4, username: 'davi', xp: 100, level: 1 },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MobileRankingBoard', () => {
  it('opens the server-rendered global ranking immediately when available', () => {
    render(
      <MobileRankingBoard
        initialLeaderboard={[]}
        initialGlobalLeaderboard={rows}
        initialLanguage="PYTHON"
      />
    );
    expect(screen.getByLabelText('Classificação')).toHaveValue('GLOBAL');
    expect(within(screen.getByLabelText('Pódio')).getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByText('Carregando classificação…')).not.toBeInTheDocument();
  });
  it('shows real podium positions 2, 1, 3, identity and following ranks', () => {
    render(<MobileRankingBoard initialLeaderboard={rows} initialLanguage="JS" />);
    const podium = screen.getByLabelText('Pódio');
    const links = within(podium).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/profile/bia',
      '/profile/ana',
      '/profile/caio',
    ]);
    expect(within(podium).getByText('Primeiros Passos')).toBeInTheDocument();
    expect(links[1].querySelector('[data-decoration="neon"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /4º lugar, davi, 100 XP/ })).toHaveAttribute(
      'href',
      '/profile/davi'
    );
    expect(screen.getByText('Classificação por XP acumulado')).toBeInTheDocument();
  });

  it('does not invent podium members when fewer than three exist', () => {
    render(<MobileRankingBoard initialLeaderboard={rows.slice(0, 1)} initialLanguage="JS" />);
    expect(within(screen.getByLabelText('Pódio')).getAllByRole('link')).toHaveLength(1);
  });

  it('fetches global and language scores on selection', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [rows[0]] });
    vi.stubGlobal('fetch', fetchMock);
    render(<MobileRankingBoard initialLeaderboard={rows} initialLanguage="JS" />);
    const select = screen.getByLabelText('Classificação');
    await user.selectOptions(select, 'GLOBAL');
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/leaderboard', expect.anything())
    );
    await user.selectOptions(select, 'PYTHON');
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/leaderboard?language=PYTHON', expect.anything())
    );
  });

  it('distinguishes failure from an empty ranking and retries', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    render(<MobileRankingBoard initialLeaderboard={rows} initialLanguage="JS" />);
    await user.selectOptions(screen.getByLabelText('Classificação'), 'GLOBAL');
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByText('Ainda não há participantes nesta classificação.')
    ).toBeInTheDocument();
  });
});
