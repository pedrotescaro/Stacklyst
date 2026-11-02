import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EquipmentInventory } from './EquipmentInventory';
import { equipmentStats } from '../../lib/mundinho/equipment';

describe('Battle equipment inventory', () => {
  it('explains how to obtain the first item and shows base odds', () => {
    render(
      <EquipmentInventory
        inventory={[]}
        equipped={{}}
        stats={equipmentStats([], {})}
        busy={false}
        locked={false}
        onEquip={() => {}}
      />
    );
    expect(screen.getByText(/Seu primeiro equipamento pode cair/)).toBeInTheDocument();
    expect(
      screen.getByText(/Golpe direto: 50% · Exercício: 50% · Chance de drop: 50%/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('shows only owned gear and allows equipping or removing its matching slot', () => {
    const onEquip = vi.fn();
    const inventory = ['gear-moon', 'gear-wood', 'gear-heart'];
    const equipped = { charm: 'gear-moon' };
    const { rerender } = render(
      <EquipmentInventory
        inventory={inventory}
        equipped={equipped}
        stats={equipmentStats(inventory, equipped)}
        busy={false}
        locked={false}
        onEquip={onEquip}
      />
    );
    expect(screen.getByRole('img', { name: 'Amuleto lunar' })).toBeInTheDocument();
    expect(screen.queryByText('Estrela da fortuna')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desequipar Amuleto lunar' }));
    expect(onEquip).toHaveBeenLastCalledWith('gear-moon', true);
    fireEvent.click(screen.getByRole('button', { name: 'Equipar Escudo do bosque' }));
    expect(onEquip).toHaveBeenLastCalledWith('gear-wood', false);
    rerender(
      <EquipmentInventory
        inventory={inventory}
        equipped={equipped}
        stats={equipmentStats(inventory, equipped)}
        busy={false}
        locked={true}
        onEquip={onEquip}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Encerre a batalha');
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });
});
