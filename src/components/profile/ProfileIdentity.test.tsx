import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProfileTitle } from './ProfileIdentity';

describe('ProfileTitle', () => {
  it.each(['posts-1', 'saved-legacy-beginner'])(
    'renders Iniciante as text without the old icon (%s)',
    (id) => {
      render(
        <ProfileTitle
          title={{ id, name: 'Iniciante', color: '#64748b', rarity: 'common', icon: 'sprout' }}
        />
      );
      expect(screen.getByText('Iniciante').querySelector('svg')).toBeNull();
    }
  );
  it('renders titles not in the icon whitelist without an icon', () => {
    render(
      <ProfileTitle
        title={{
          id: 'comments-5',
          name: 'Participativo',
          color: '#64748b',
          rarity: 'common',
          icon: 'message',
        }}
      />
    );
    const el = screen.getByText('Participativo').closest('span[data-rarity]');
    expect(el?.querySelector('svg')).toBeNull();
  });

  it('renders Pythonista with an icon positioned after the text', () => {
    render(
      <ProfileTitle
        title={{
          id: 'pythonista',
          name: 'Pythonista',
          color: '#38bdf8',
          rarity: 'rare',
          icon: 'code',
        }}
      />
    );
    const el = screen.getByText('Pythonista').closest('span[data-rarity]')!;
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.childNodes[0].textContent).toBe('Pythonista');
    expect(el.childNodes[1].nodeName.toLowerCase()).toBe('svg');
  });

  it('renders Muuuu with cow emoji after the text', () => {
    render(
      <ProfileTitle
        title={{
          id: 'first-of-month',
          name: 'Muuuu',
          color: '#ffffff',
          rarity: 'special',
          icon: 'message',
        }}
      />
    );
    const el = screen.getByText('Muuuu').closest('span[data-rarity]')!;
    expect(el.textContent).toContain('Muuuu');
    expect(el.textContent).toContain('🐮');
    expect(el.childNodes[0].textContent).toBe('Muuuu');
  });

  it('renders Estrela with a star icon after the text', () => {
    render(
      <ProfileTitle
        title={{
          id: 'estrela',
          name: 'Estrela',
          color: '#c72f3b',
          rarity: 'special',
          icon: 'star',
        }}
      />
    );
    const el = screen.getByText('Estrela').closest('span[data-rarity]')!;
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.childNodes[0].textContent).toBe('Estrela');
    expect(el.childNodes[1].nodeName.toLowerCase()).toBe('svg');
  });

  it('supports compact text-only catalog pills without changing their persisted color', () => {
    render(
      <ProfileTitle
        title={{
          id: 'first-of-month',
          name: 'Muuuu',
          color: '#ffffff',
          rarity: 'special',
          icon: 'sparkles',
        }}
        showIcon={false}
        className="catalog-pill"
      />
    );
    const pill = screen.getByText('Muuuu').closest('span[data-rarity]')!;
    expect(pill.querySelector('svg')).toBeNull();
    expect(pill.textContent).toBe('Muuuu');
    expect(pill).toHaveClass('catalog-pill');
    expect(pill).toHaveStyle({ backgroundColor: '#ffffff', color: '#111827' });
  });
});
