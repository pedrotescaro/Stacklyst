import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeedRankingSwitcher } from '../FeedRankingSwitcher';

describe('feed and ranking navigation', () => {
  it('opens the real ranking from the feed', () => {
    render(<FeedRankingSwitcher active="feed" />);
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Ver ranking' })).toHaveAttribute('href', '/ranking');
  });
  it('makes the feed return available beside the selected ranking', () => {
    render(<FeedRankingSwitcher active="ranking" />);
    expect(screen.getByRole('link', { name: 'Ranking' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Voltar ao feed' })).toHaveAttribute('href', '/feed');
  });
});
