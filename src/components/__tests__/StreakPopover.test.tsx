import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { StreakPopover } from '../StreakPopover';

describe('StreakPopover', () => {
  it('opens on click and does not render the X close button', async () => {
    const user = userEvent.setup();
    render(
      <StreakPopover
        streak={3}
        lastActiveAt="2026-09-14T10:00:00.000Z"
        currentDate="2026-09-14T12:00:00.000Z"
        triggerClassName="test-trigger"
      >
        <span>Fogo</span>
      </StreakPopover>
    );

    expect(screen.queryByText('Ritmo Stacklyst')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /abrir detalhes da ofensiva/i }));

    expect(screen.getByText('Ritmo Stacklyst')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '3 dias de ofensiva' })).toBeInTheDocument();
    expect(screen.getByText('Ofensiva garantida por hoje. Continue assim!')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /fechar detalhes da ofensiva/i })
    ).not.toBeInTheDocument();
  });

  it('shows inactive message and 0 days when user did not do activity today and streak is 0', async () => {
    const user = userEvent.setup();
    render(
      <StreakPopover
        streak={0}
        lastActiveAt="2026-09-12T10:00:00.000Z"
        currentDate="2026-09-14T12:00:00.000Z"
        triggerClassName="test-trigger"
      >
        <span>Fogo</span>
      </StreakPopover>
    );

    await user.click(screen.getByRole('button', { name: /abrir detalhes da ofensiva/i }));

    expect(screen.getByRole('heading', { name: '0 dias de ofensiva' })).toBeInTheDocument();
    expect(screen.getByText(/faça uma atividade hoje/i)).toBeInTheDocument();
  });

  it('preserves active streak count from yesterday while prompting for today', async () => {
    const user = userEvent.setup();
    render(
      <StreakPopover
        streak={5}
        lastActiveAt="2026-09-13T10:00:00.000Z"
        currentDate="2026-09-14T12:00:00.000Z"
        triggerClassName="test-trigger"
      >
        <span>Fogo</span>
      </StreakPopover>
    );

    await user.click(screen.getByRole('button', { name: /abrir detalhes da ofensiva/i }));

    expect(screen.getByRole('heading', { name: '5 dias de ofensiva' })).toBeInTheDocument();
    expect(screen.getByText(/faça uma atividade hoje/i)).toBeInTheDocument();
  });
});
