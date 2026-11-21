import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedEntryBoundary, useFeedEntryReady } from '@/components/FeedEntryBoundary';
import FeedError from '@/app/feed/error';
import {
  SITE_ENTRY_DURATION_MS as ENTRY,
  SITE_ENTRY_EXIT_FALLBACK_MS as EXIT,
} from '@/components/landing/SiteEntryLoader';

vi.mock('@/app/error', () => ({
  default: ({ reset }: { reset: () => void }) => <button onClick={reset}>Tentar novamente</button>,
}));

function ReadyFeed() {
  useFeedEntryReady();
  return <button>Publicar no feed</button>;
}

function advance(milliseconds: number) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Feed entry', () => {
  it('plays the whole logo sequence even when the feed is already ready', () => {
    render(
      <FeedEntryBoundary>
        <ReadyFeed />
      </FeedEntryBoundary>
    );
    expect(screen.getByTestId('site-entry-loader')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar no feed' })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    advance(ENTRY - 1);
    expect(screen.getByTestId('site-entry-loader')).toBeInTheDocument();
    advance(1);
    advance(EXIT);
    expect(screen.queryByTestId('site-entry-loader')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Publicar no feed' }).parentElement
    ).not.toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps one splash above the streaming fallback until feed content arrives', () => {
    const { rerender } = render(
      <FeedEntryBoundary>
        <p>Preparando dados</p>
      </FeedEntryBoundary>
    );
    advance(ENTRY);
    advance(EXIT + 5000);
    expect(screen.getAllByTestId('site-entry-loader')).toHaveLength(1);

    rerender(
      <FeedEntryBoundary>
        <ReadyFeed />
      </FeedEntryBoundary>
    );
    advance(EXIT);
    expect(screen.queryByTestId('site-entry-loader')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publicar no feed' })).toBeInTheDocument();
  });

  it('shows the sequence again on a fresh document mount', () => {
    const first = render(
      <FeedEntryBoundary>
        <ReadyFeed />
      </FeedEntryBoundary>
    );
    advance(ENTRY);
    advance(EXIT);
    first.unmount();

    render(
      <FeedEntryBoundary>
        <ReadyFeed />
      </FeedEntryBoundary>
    );
    expect(screen.getByTestId('site-entry-loader')).toBeInTheDocument();
  });

  it('reveals recovery actions when loading the feed fails', () => {
    const reset = vi.fn();
    render(
      <FeedEntryBoundary>
        <FeedError error={new Error('Unavailable')} reset={reset} />
      </FeedEntryBoundary>
    );
    advance(ENTRY);
    advance(EXIT);
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('site-entry-loader')).not.toBeInTheDocument();
  });

  it('restores scrolling if entry is interrupted by navigating away', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = render(
      <FeedEntryBoundary>
        <p>Preparando dados</p>
      </FeedEntryBoundary>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });
});
