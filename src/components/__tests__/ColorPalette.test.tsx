import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ColorPalette, PROFILE_COLORS } from '../ColorPalette';
it('offers only fixed colors with a selected state and no free color or text input', () => {
  const changed = vi.fn();
  const { container } = render(
    <ColorPalette aria-label="Cor do perfil" value="#000000" onChange={changed} />
  );
  expect(screen.getAllByRole('button')).toHaveLength(PROFILE_COLORS.length);
  expect(screen.getByRole('button', { name: 'Cor do perfil: #000000' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cor do perfil: #0083fe' }));
  expect(changed).toHaveBeenCalledWith({ target: { value: '#0083fe' } });
  expect(container.querySelector('input')).toBeNull();
});
