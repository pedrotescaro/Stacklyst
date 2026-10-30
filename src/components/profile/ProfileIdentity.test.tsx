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
  it('preserves the icon for other titles', () => {
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
    expect(screen.getByText('Participativo').querySelector('svg')).not.toBeNull();
  });
});
