import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { LeaderboardClient } from './LeaderboardClient';
vi.mock('@/components/FeedRightSidebar', () => ({
  FeedRightSidebar: () => <aside aria-label="Busca e progresso" />,
}));
vi.mock('@/components/Sidebar', () => ({ Sidebar: () => <aside aria-label="Navegação" /> }));
vi.mock('./MobileRankingBoard', () => ({
  MobileRankingBoard: () => <section aria-label="Ranking por período" />,
}));
describe('Ranking shell', () => {
  it('shares the ranking surface on all screen widths', () => {
    render(<LeaderboardClient initialUser={null} initialLeaderboard={[]} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Ranking de XP' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Ranking por período' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Busca e progresso' })).toBeInTheDocument();
  });
});
