import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaderboardMedal } from '../LeaderboardMedal';

describe('LeaderboardMedal', () => {
  it('renders gold medal for rank 1', () => {
    render(<LeaderboardMedal rank={1} />);
    const medal = screen.getByRole('img', { name: '1º Lugar - Medalha de Ouro' });
    expect(medal).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('renders silver medal for rank 2', () => {
    render(<LeaderboardMedal rank={2} />);
    const medal = screen.getByRole('img', { name: '2º Lugar - Medalha de Prata' });
    expect(medal).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('renders bronze medal for rank 3', () => {
    render(<LeaderboardMedal rank={3} />);
    const medal = screen.getByRole('img', { name: '3º Lugar - Medalha de Bronze' });
    expect(medal).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });
});
