import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getLevelFromTotalXp, LevelBadge } from '../LevelBadge';
import { colorContrast } from '@/lib/profile-customization';

describe('LevelBadge', () => {
  it('calcula o nível global por XP', () => {
    expect(getLevelFromTotalXp(0)).toBe(1);
    expect(getLevelFromTotalXp(4_000)).toBe(5);
    expect(getLevelFromTotalXp(29_000)).toBe(30);
  });

  it('usa cores e sombra diferentes conforme o nível na variante badge', () => {
    const { rerender } = render(<LevelBadge totalXp={0} variant="badge" />);
    const beginner = screen.getByLabelText('Nível 1');
    expect(beginner).toHaveStyle({ backgroundColor: '#1cb0f6', boxShadow: '0 3px 0 #087db5' });

    rerender(<LevelBadge totalXp={19_000} variant="badge" />);
    const advanced = screen.getByLabelText('Nível 20');
    expect(advanced).toHaveStyle({ backgroundColor: '#ffc800', boxShadow: '0 3px 0 #c79700' });
  });

  it('usa o design de pílula por padrão correspondendo ao estilo dos títulos', () => {
    render(<LevelBadge totalXp={0} />);
    const beginner = screen.getByLabelText('Nível 1');
    expect(beginner).toHaveClass('rounded-full');
    expect(beginner).toHaveClass('text-[11px]');
    expect(beginner).toHaveClass('font-semibold');
    expect(beginner).toHaveStyle({ backgroundColor: '#1cb0f6' });
    expect(beginner.style.boxShadow).toBe('');
  });
  it('maintains readable small text in every level palette', () => {
    const { rerender } = render(<LevelBadge totalXp={0} />);
    const hex = (rgb: string) =>
      '#' +
      rgb
        .match(/\d+/g)!
        .map((channel) => Number(channel).toString(16).padStart(2, '0'))
        .join('');
    for (const level of [1, 5, 10, 20, 30]) {
      rerender(<LevelBadge totalXp={(level - 1) * 1000} />);
      const badge = screen.getByLabelText(`Nível ${level}`);
      expect(
        colorContrast(hex(badge.style.color), hex(badge.style.backgroundColor))
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('respects minLevel threshold', () => {
    const { container, rerender } = render(<LevelBadge totalXp={0} minLevel={5} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<LevelBadge totalXp={3_000} minLevel={5} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<LevelBadge totalXp={4_000} minLevel={5} />);
    expect(screen.getByLabelText('Nível 5')).toBeInTheDocument();
  });
});
