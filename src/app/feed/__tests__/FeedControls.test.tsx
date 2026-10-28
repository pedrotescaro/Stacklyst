import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedControls } from '../FeedControls';

function Controls({ refresh = vi.fn() }: { refresh?: () => void }) {
  const [filter, setFilter] = useState<'for-you' | 'following'>('for-you');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  return (
    <FeedControls
      filter={filter}
      onFilterChange={setFilter}
      sort={sort}
      onSortChange={setSort}
      refreshing={false}
      refreshDisabled={false}
      onRefresh={refresh}
    />
  );
}

describe('Feed controls', () => {
  it('switches the real feed filters and keeps sorting available for followed posts', () => {
    render(<Controls />);
    expect(screen.getByRole('tab', { name: 'Para você' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'Seguindo' }));
    expect(screen.getByRole('tab', { name: 'Seguindo' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar publicações seguidas' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Popular' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar publicações seguidas' }));
    expect(screen.getByRole('menuitemradio', { name: 'Popular' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens feed personalization and refreshes the posts', () => {
    const refresh = vi.fn();
    render(<Controls refresh={refresh} />);
    expect(screen.getByRole('link', { name: 'Personalizar feed' })).toHaveAttribute(
      'href',
      '/onboarding'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar publicações' }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});
