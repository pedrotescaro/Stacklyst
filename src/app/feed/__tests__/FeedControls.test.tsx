import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FeedControls } from '../FeedControls';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { createFeed } from '@/lib/feed-preferences';

function Controls() {
  const [filter, setFilter] = useState<'for-you' | 'following'>('for-you');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  return (
    <FeedControls filter={filter} onFilterChange={setFilter} sort={sort} onSortChange={setSort} />
  );
}

vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => true }));

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

  it('keeps personalization without a duplicate refresh action in the header', () => {
    render(<Controls />);
    expect(screen.getByRole('button', { name: 'Personalizar feed' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Atualizar publicações' })).not.toBeInTheDocument();
  });

  it('shows the built-in feeds in English while keeping names the user typed', async () => {
    localStorage.setItem('site-language', 'en');
    try {
      render(
        <LanguageProvider>
          <FeedControls
            filter="for-you"
            onFilterChange={vi.fn()}
            sort="recent"
            onSortChange={vi.fn()}
            feeds={[
              createFeed('following', 'Seguindo', []),
              createFeed('for-you', 'Para você', ['JS']),
              createFeed('custom-1', 'Rustaceans', ['RUST']),
            ]}
            activeFeedId="for-you"
          />
        </LanguageProvider>
      );
      expect(await screen.findByRole('tab', { name: 'Following' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'For you' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Rustaceans' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: /Seguindo|Para você/ })).not.toBeInTheDocument();
    } finally {
      localStorage.removeItem('site-language');
    }
  });
});
