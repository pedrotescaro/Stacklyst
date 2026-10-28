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
        flags: ['BR', 'PT'],
      },
    },
  },
  { rank: 2, username: 'bia', xp: 100, level: 1 },
  { rank: 3, username: 'caio', xp: 90, level: 1 },
  { rank: 4, username: 'davi', xp: 80, level: 1, avatar_config: { profileStyle: { flag: 'BR' } } },
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
    expect(within(podium).getByAltText('Bandeira: Brasil')).toBeInTheDocument();
    expect(within(podium).getByAltText('Bandeira: Portugal')).toBeInTheDocument();
    expect(screen.getAllByAltText('Bandeira: Brasil')).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Semanal' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        '/api/leaderboard?period=weekly',
        expect.anything()
      )
    );
    expect(await screen.findAllByAltText('Bandeira: Brasil')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Semanal' }));
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith('/api/leaderboard', expect.anything())
    );
    fireEvent.click(screen.getByRole('button', { name: 'Semanal' }));
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
