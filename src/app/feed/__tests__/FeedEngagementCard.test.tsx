import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedEngagementCard } from '../FeedEngagementCard';

describe('FeedEngagementCard', () => {
  it('mostra a ofensiva e a atividade da semana juntas', () => {
    render(
      <FeedEngagementCard
        streak={9}
        weeklyActivity={
          new Map([
            [0, 1],
            [2, 3],
          ])
        }
        lastActiveAt="2026-08-11T12:00:00.000Z"
        currentDate="2026-08-11T18:00:00.000Z"
      />
    );

    expect(screen.getByRole('heading', { name: '9 dias de ofensiva' })).toBeInTheDocument();
    expect(screen.getByLabelText('Atividade semanal')).toBeInTheDocument();
    expect(screen.getByLabelText('domingo: 1 atividade concluída')).toBeInTheDocument();
    expect(screen.getByLabelText('terça-feira: 3 atividades concluídas, hoje')).toBeInTheDocument();
    expect(screen.getByText('Ofensiva garantida por hoje.')).toBeInTheDocument();
    expect(screen.getByText('Continue assim!')).toHaveClass('block', 'whitespace-nowrap');
    expect(screen.getByText('Ritmo Stacklyst')).toHaveClass('bg-blue-500');
    expect(screen.getByTestId('feed-streak-flame')).toHaveClass(
      'bg-orange-500/15',
      'text-orange-400'
    );
  });

  it('orienta o usuário quando ainda não houve atividade hoje', () => {
    render(
      <FeedEngagementCard
        streak={1}
        weeklyActivity={new Map()}
        lastActiveAt="2026-08-13T12:00:00.000Z"
        currentDate="2026-08-14T18:00:00.000Z"
      />
    );

    expect(screen.getByRole('heading', { name: '1 dia de ofensiva' })).toBeInTheDocument();
    expect(
      screen.getByText('Faça uma atividade hoje pra aumentar a sua ofensiva!')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('sexta-feira: sem atividade, hoje')).toBeInTheDocument();
  });

  it('preenche os sete dias representados por uma ofensiva de sete dias', () => {
    render(
      <FeedEngagementCard
        streak={7}
        weeklyActivity={new Map()}
        lastActiveAt="2026-08-14T12:00:00.000Z"
        currentDate="2026-08-14T18:00:00.000Z"
      />
    );

    expect(screen.getByRole('heading', { name: '7 dias de ofensiva' })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/dia da ofensiva/)).toHaveLength(7);
  });

  it('preserva a ofensiva valida quando a sessao resumida omite a ultima atividade', () => {
    render(
      <FeedEngagementCard
        streak={7}
        weeklyActivity={new Map()}
        lastActiveAt={null}
        currentDate="2026-08-14T18:00:00.000Z"
      />
    );

    expect(screen.getAllByLabelText(/dia da ofensiva/)).toHaveLength(7);
    expect(screen.getByText('Ofensiva garantida por hoje.')).toBeInTheDocument();
    expect(screen.getByText('Continue assim!')).toHaveClass('block', 'whitespace-nowrap');
  });
});
