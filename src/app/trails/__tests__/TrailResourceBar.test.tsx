import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TrailResourceBar } from '@/app/trails/TrailResourceBar';

describe('TrailResourceBar', () => {
  it('shows the course selector, streak, total XP and earned gems', () => {
    render(
      <TrailResourceBar
        activeLanguage="JS"
        courses={[{ language: 'JS', xp: 380, started: true }]}
        onSelectCourse={vi.fn()}
        streak={7}
        totalXp={2_350}
        gems={45}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Trocar curso. JavaScript, 380 XP' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('trail-resource-flame')).toHaveAttribute(
      'src',
      expect.stringContaining('streak-flame.png')
    );
    expect(
      screen.getByRole('button', { name: 'Abrir detalhes da ofensiva: 7 dias' })
    ).toBeInTheDocument();
    expect(screen.getByTitle('2.350 XP total')).toBeInTheDocument();
    expect(within(screen.getByTestId('trail-gems')).getByText('45')).toBeInTheDocument();
    expect(screen.getByTestId('trail-gems')).toHaveAttribute(
      'title',
      expect.stringContaining('5 na primeira conclusão')
    );
    expect(screen.getByTestId('trail-resource-bar')).toHaveClass('justify-center');
    expect(screen.getByTestId('trail-gems').querySelector('svg')?.parentElement).toBe(
      screen.getByTestId('trail-gems')
    );
  });
});
