import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EquipmentStore } from './EquipmentStore';
describe('Battle equipment shop', () => {
  it('displays all nine equipment pieces with real prices, sprites and bonuses', () => {
    render(
      <EquipmentStore
        inventory={[]}
        equipped={{}}
        coins={100}
        busy={false}
        locked={false}
        confirming={null}
        onConfirmChange={() => {}}
        onBuy={async () => {}}
        onEquip={() => {}}
      />
    );
    expect(screen.getAllByRole('article')).toHaveLength(9);
    expect(screen.getByRole('img', { name: 'Trevo da clareira' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Comprar Trevo da clareira por 100 moedas' })
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Comprar Amuleto lunar por 250 moedas' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Comprar Núcleo da fênix por 500 moedas' })
    ).toBeDisabled();
    expect(screen.getByText('+5 p.p. de sorte')).toBeInTheDocument();
    expect(screen.getByText('−2 de dano recebido')).toBeInTheDocument();
    expect(screen.getByText('+10 de vida máxima')).toBeInTheDocument();
  });
  it('requires confirmation before buying and disables equipment changes in combat', () => {
    const change = vi.fn(),
      buy = vi.fn(),
      equip = vi.fn();
    const base = {
      inventory: [],
      equipped: {},
      coins: 1000,
      busy: false,
      locked: false,
      confirming: null,
      onConfirmChange: change,
      onBuy: buy,
      onEquip: equip,
    };
    const { rerender } = render(<EquipmentStore {...base} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Comprar Trevo da clareira por 100 moedas' })
    );
    expect(change).toHaveBeenCalledWith('gear-clover');
    expect(buy).not.toHaveBeenCalled();
    rerender(<EquipmentStore {...base} confirming="gear-clover" />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar compra de Trevo da clareira por 100 moedas' })
    );
    expect(buy).toHaveBeenCalledWith('gear-clover');
    rerender(
      <EquipmentStore
        {...base}
        inventory={['gear-clover']}
        equipped={{ charm: 'gear-clover' }}
        locked
      />
    );
    expect(screen.getByRole('button', { name: 'Desequipar Trevo da clareira' })).toBeDisabled();
    expect(screen.getByText(/podem ser trocados após encerrar a batalha/)).toBeInTheDocument();
  });
});
