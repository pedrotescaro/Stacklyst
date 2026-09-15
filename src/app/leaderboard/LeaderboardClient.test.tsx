import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeaderboardClient } from './LeaderboardClient';

vi.mock('@/components/Sidebar', () => ({
  Sidebar: (props: Record<string, unknown>) => (
    <aside data-testid="sidebar" data-variant={props.variant ?? 'default'} />
  ),
}));

const viewer = {
  id: 'viewer-1',
  username: 'pedro',
  avatar_url: null,
  total_xp: 720,
  streak: 4,
};

const leaderboard = [
  { rank: 1, username: 'alice', avatar_url: null, xp: 900, level: 1 },
  { rank: 2, username: 'bruno', avatar_url: null, xp: 800, level: 1 },
  { rank: 3, username: 'pedro', avatar_url: null, xp: 720, level: 1 },
  { rank: 4, username: 'carol', avatar_url: null, xp: 500, level: 1 },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('LeaderboardClient', () => {
  it('usa a sidebar padrão e apresenta a classificação somente em XP', () => {
    render(<LeaderboardClient initialUser={viewer} initialLeaderboard={leaderboard} />);

    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByRole('heading', { level: 1, name: 'Ranking de XP' })).toBeInTheDocument();
    expect(screen.getAllByText('900 XP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('500 XP').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: '1º lugar, alice, 900 XP' })).toHaveAttribute(
      'href',
      '/profile/alice'
    );
    expect(screen.getByRole('link', { name: '4º lugar, carol, 500 XP' })).toHaveAttribute(
      'href',
      '/profile/carol'
    );
    expect(screen.queryByText('Alexa miliano')).not.toBeInTheDocument();
    expect(screen.getByText('Divisão Ouro')).toBeInTheDocument();
    expect(screen.queryByText(/\bRP\b/i)).not.toBeInTheDocument();
  });

  it('troca para o XP da linguagem sem refazer a requisição em loop', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ rank: 1, username: 'pythonista', avatar_url: null, xp: 420, level: 2 }],
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <LeaderboardClient
        initialUser={viewer}
        initialLeaderboard={leaderboard}
        initialLanguage="JS"
        courses={[
          { language: 'JS', xp: 720, started: true },
          { language: 'PYTHON', xp: 420, started: true },
        ]}
      />
    );

    await user.click(screen.getByTestId('course-selector-trigger-rail'));
    await user.click(await screen.findByRole('menuitemradio', { name: /Python/i }));

    expect(await screen.findByText('420 XP')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith('/api/leaderboard?language=PYTHON', {
      signal: expect.any(AbortSignal),
    });
  });

  it('renderiza classes que suportam temas claro e escuro sem texto branco invisível', () => {
    render(<LeaderboardClient initialUser={viewer} initialLeaderboard={leaderboard} />);

    // Título da divisão usa text-dd-text (visível tanto no claro quanto no escuro)
    const divisionHeading = screen.getByRole('heading', { level: 2, name: 'Divisão Ouro' });
    expect(divisionHeading).toHaveClass('text-dd-text');
    expect(divisionHeading).not.toHaveClass('text-white');

    // Seção de status com suporte claro/escuro
    const statusSection = screen.getByRole('region', { name: /escolha o seu status/i });
    expect(statusSection).toHaveClass('bg-white');
    expect(statusSection).toHaveClass('dark:bg-black');

    // Linha do espectador com destaque azul tanto no claro quanto no escuro
    const viewerRow = screen.getByRole('link', { name: /pedro/i });
    expect(viewerRow.className).toContain('bg-blue-500/[0.08]');
    expect(viewerRow.className).toContain('dark:bg-[#121c2e]');
  });

  it('renderiza ZONA DE PROMOÇÃO em azul e ZONA DE REBAIXAMENTO em vermelho com a fonte em caixa alta', () => {
    // Cria lista com 14 participantes (como no banco real)
    const longLeaderboard = Array.from({ length: 14 }, (_, i) => ({
      rank: i + 1,
      username: `user_${i + 1}`,
      avatar_url: null,
      xp: 1000 - i * 50,
      level: 1,
    }));

    render(<LeaderboardClient initialUser={viewer} initialLeaderboard={longLeaderboard} />);

    const promoElement = screen.getByText('ZONA DE PROMOÇÃO');
    expect(promoElement).toBeInTheDocument();
    const promoContainer = promoElement.parentElement;
    expect(promoContainer?.className).toContain('text-blue-500');
    expect(promoContainer?.className).toContain('font-black');
    expect(promoContainer?.className).toContain('uppercase');
    expect(promoContainer?.className).toContain('tracking-wider');

    const relegElement = screen.getByText('ZONA DE REBAIXAMENTO');
    expect(relegElement).toBeInTheDocument();
    const relegContainer = relegElement.parentElement;
    expect(relegContainer?.className).toContain('text-red-500');
    expect(relegContainer?.className).toContain('font-black');
    expect(relegContainer?.className).toContain('uppercase');
    expect(relegContainer?.className).toContain('tracking-wider');
  });
});
