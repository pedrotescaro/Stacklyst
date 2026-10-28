import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, it, vi, expect } from 'vitest';
import { MobileRankingBoard } from './MobileRankingBoard';
const rows = [
  {
    rank: 1,
    username: 'ana',
    xp: 150,
    level: 1,
    avatar_config: {
      profileStyle: {
        frame: { id: 'neon', decoration: 'neon', color: '#0083fe' },
        title: { id: 'first', name: 'Pioneiro', color: '#0083fe', rarity: 'common' },
      },
    },
  },
  { rank: 2, username: 'bia', xp: 100, level: 1 },
  { rank: 3, username: 'caio', xp: 90, level: 1 },
  { rank: 4, username: 'davi', xp: 80, level: 1 },
];
const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => rows });
  vi.stubGlobal('fetch', fetchMock);
});
describe('Ranking periods', () => {
  it('shows real podium, identity and daily XP, then changes period and language', async () => {
    render(
      <MobileRankingBoard
        initialLanguage="JS"
        initialLeaderboard={rows}
        initialGlobalLeaderboard={rows}
      />
    );
    const podium = await screen.findByLabelText('Pódio');
    expect(
      within(podium)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href'))
    ).toEqual(['/profile/bia', '/profile/ana', '/profile/caio']);
    expect(screen.getByText('Pioneiro')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Semanal' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/leaderboard?period=weekly',
        expect.anything()
      )
    );
    fireEvent.click(screen.getByRole('button', { name: 'Escolher linguagem do ranking' }));
    fireEvent.change(screen.getByLabelText('Classificação'), { target: { value: 'PYTHON' } });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/leaderboard?period=weekly&language=PYTHON',
        expect.anything()
      )
    );
  });
  it('distinguishes network errors and empty rankings', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<MobileRankingBoard initialLanguage="JS" initialLeaderboard={[]} />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByText('Ainda não há participantes nesta classificação.')
    ).toBeInTheDocument();
  });
});
