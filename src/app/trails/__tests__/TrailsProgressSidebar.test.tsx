import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TrailsProgressSidebar } from '@/app/trails/TrailsProgressSidebar';

const baseProps = {
  activeLanguage: 'JS' as const,
  courses: [
    { language: 'JS' as const, xp: 380, started: true },
    { language: 'PYTHON' as const, xp: 120, started: true },
  ],
  onSelectCourse: vi.fn(),
  totalXp: 425,
  gems: 18,
  streak: 9,
  globalRank: 4,
  totalParticipants: 12,
  username: 'pedrotescaro',
  avatarUrl: null,
  dailyProgress: {
    xpEarned: 15,
    correctAnswers: 2,
    trailActivities: 0,
  },
};

describe('TrailsProgressSidebar', () => {
  it('renders real trail stats and the global ranking link', () => {
    render(<TrailsProgressSidebar {...baseProps} />);

    expect(screen.getByTestId('trails-progress-sidebar')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Trocar curso. JavaScript, 380 XP' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('active-language-logo')).toHaveAccessibleName('Logo de JavaScript');
    expect(screen.getByTestId('glossy-streak-flame')).toHaveAttribute(
      'src',
      expect.stringContaining('streak-flame.png')
    );
    expect(
      screen.getByRole('button', { name: 'Abrir detalhes da ofensiva: 9 dias' })
    ).toBeInTheDocument();
    expect(screen.getByTitle('425 XP total')).toBeInTheDocument();
    expect(screen.getByTitle('18 gemas')).toBeInTheDocument();
    expect(screen.getByText('Classificação')).toBeInTheDocument();
    expect(screen.getByText('Sua posição:')).toHaveTextContent('4º');
    expect(screen.getByText('4 de 12 desenvolvedores')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver ranking/i })).toHaveAttribute('href', '/ranking');
  });

  it('opens the streak details from the flame instead of rendering a fixed card', async () => {
    const user = userEvent.setup();
    render(<TrailsProgressSidebar {...baseProps} />);

    expect(screen.queryByText('Ritmo Stacklyst')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir detalhes da ofensiva: 9 dias' }));

    expect(screen.getByRole('heading', { name: '9 dias de ofensiva' })).toBeInTheDocument();
    expect(screen.getByLabelText('Atividade semanal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar detalhes da ofensiva' })).toBeInTheDocument();
  });

  it('exposes accessible mission progress and clamps it to each goal', () => {
    render(
      <TrailsProgressSidebar
        {...baseProps}
        dailyProgress={{ xpEarned: 45, correctAnswers: -2, trailActivities: 1 }}
      />
    );

    const xpMission = screen.getByRole('progressbar', { name: 'Ganhe 30 XP em trilhas' });
    const correctMission = screen.getByRole('progressbar', { name: 'Acerte 3 exercícios' });
    const activityMission = screen.getByRole('progressbar', {
      name: 'Responda 1 exercício da trilha',
    });

    expect(xpMission).toHaveAttribute('aria-valuenow', '30');
    expect(xpMission.firstElementChild).toHaveStyle({ width: '100%' });
    expect(correctMission).toHaveAttribute('aria-valuenow', '0');
    expect(correctMission.firstElementChild).toHaveStyle({ width: '0%' });
    expect(activityMission).toHaveAttribute('aria-valuenow', '1');
    expect(activityMission.firstElementChild).toHaveStyle({ width: '100%' });

    const missionsCard = screen
      .getByRole('heading', { name: 'Desafios diários' })
      .closest('section');
    expect(missionsCard).toHaveClass('shrink-0');
    expect(screen.getByText('Missões do dia')).toHaveClass('bg-blue-500');
  });

  it('updates the active language metrics when the selected trail changes', () => {
    const { rerender } = render(<TrailsProgressSidebar {...baseProps} />);

    rerender(<TrailsProgressSidebar {...baseProps} activeLanguage="PYTHON" />);

    expect(
      screen.getByRole('button', { name: 'Trocar curso. Python, 120 XP' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('active-language-logo')).toHaveAccessibleName('Logo de Python');
    expect(
      screen.queryByRole('button', { name: 'Trocar curso. JavaScript, 380 XP' })
    ).not.toBeInTheDocument();
  });

  it('renders the compact profile rail without duplicating the streak card', () => {
    render(<TrailsProgressSidebar {...baseProps} variant="profile" allowAddingCourses={false} />);

    expect(screen.getByTestId('profile-progress-sidebar')).toHaveAttribute(
      'aria-label',
      'Progresso e missões do perfil'
    );
    expect(screen.getByText('Classificação')).toBeInTheDocument();
    expect(screen.getByText('Desafios diários')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Abrir detalhes da ofensiva: 9 dias' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Ritmo Stacklyst')).not.toBeInTheDocument();
  });
});
