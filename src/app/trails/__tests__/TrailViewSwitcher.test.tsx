import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { TrailViewSwitcher } from '../TrailViewSwitcher';

it('expands the active view first and preserves the accessible name of the compact alternative', () => {
  const onChange = vi.fn();
  const { rerender } = render(<TrailViewSwitcher active="map" onChange={onChange} />);
  expect(screen.getByRole('button', { name: 'Mapa' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Trilha' }).textContent).toBe('');
  fireEvent.click(screen.getByRole('button', { name: 'Trilha' }));
  expect(onChange).toHaveBeenCalledWith('trail');
  rerender(<TrailViewSwitcher active="trail" onChange={onChange} />);
  expect(screen.getAllByRole('button')[0]).toHaveAccessibleName('Trilha');
  expect(screen.getByRole('button', { name: 'Trilha' }).textContent).toBe('Trilha');
  expect(screen.getByRole('button', { name: 'Mapa' }).textContent).toBe('');
});
