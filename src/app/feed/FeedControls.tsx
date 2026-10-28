'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BarChart2, Check, ChevronDown, Newspaper, Pencil, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

type FeedFilter = 'for-you' | 'following';
type FollowingSort = 'recent' | 'popular';

interface FeedControlsProps {
  filter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  sort: FollowingSort;
  onSortChange: (sort: FollowingSort) => void;
  refreshing: boolean;
  refreshDisabled: boolean;
  onRefresh: () => void;
}

export function FeedControls({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  refreshing,
  refreshDisabled,
  onRefresh,
}: FeedControlsProps) {
  const { text } = useLocalizedText();
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const close = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSortOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [sortOpen]);

  const selectFilter = (next: FeedFilter) => {
    setSortOpen(false);
    onFilterChange(next);
  };

  return (
    <div className="relative z-30 min-w-0 border-b border-dd-border/60 bg-dd-bg px-3 py-3 md:sticky md:top-0 md:flex md:p-0">
      <div className="mb-2 flex items-center gap-2 md:hidden">
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dd-accent px-4 text-xs font-bold text-white">
          <Newspaper className="h-4 w-4" aria-hidden="true" /> Feed
        </span>
        <Link
          href="/ranking"
          aria-label={text('Ver ranking', 'View ranking')}
          className="dd-focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-dd-surface text-dd-muted hover:text-dd-text"
        >
          <BarChart2 className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex min-w-0 items-center gap-2 md:flex-1 md:gap-0">
        <div
          role="tablist"
          aria-label={text('Filtros do feed', 'Feed filters')}
          data-testid="feed-tabs"
          className="relative flex min-w-0 items-center gap-2 md:flex-1 md:gap-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'for-you'}
            onClick={() => selectFilter('for-you')}
            className={cn(
              'dd-focus-ring order-2 min-h-11 rounded-full border px-4 text-xs font-bold transition-colors md:order-1 md:flex-1 md:rounded-none md:border-0 md:py-3',
              filter === 'for-you'
                ? 'border-dd-accent bg-dd-accent text-white md:bg-transparent md:text-dd-text'
                : 'border-dd-border text-dd-muted hover:text-dd-text'
            )}
          >
            {text('Para você', 'For you')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'following'}
            onClick={() => selectFilter('following')}
            className={cn(
              'dd-focus-ring order-1 min-h-11 rounded-full border px-4 text-xs font-bold transition-colors md:order-2 md:flex-1 md:rounded-none md:border-0 md:py-3',
              filter === 'following'
                ? 'border-dd-accent bg-dd-accent text-white md:bg-transparent md:text-dd-text'
                : 'border-dd-border text-dd-muted hover:text-dd-text'
            )}
          >
            {text('Seguindo', 'Following')}
          </button>
          <span
            aria-hidden="true"
            data-testid="feed-tab-indicator"
            className={cn(
              'pointer-events-none absolute bottom-0 left-0 hidden h-0.5 w-1/2 rounded-full bg-blue-500 transition-transform motion-reduce:transition-none md:block',
              filter === 'following' && 'translate-x-full'
            )}
          />
        </div>
        {filter === 'following' && (
          <div ref={sortRef} className="relative shrink-0">
            <button
              type="button"
              aria-label={text('Ordenar publicações seguidas', 'Sort followed posts')}
              aria-expanded={sortOpen}
              aria-haspopup="menu"
              onClick={() => setSortOpen(!sortOpen)}
              className="dd-focus-ring flex h-11 w-9 items-center justify-center rounded-full text-dd-muted hover:bg-dd-surface hover:text-dd-text"
            >
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', sortOpen && 'rotate-180')}
              />
            </button>
            {sortOpen && (
              <div
                role="menu"
                aria-label={text('Ordenação', 'Sort order')}
                className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-dd-border bg-dd-surface p-1 shadow-lg"
              >
                {(['recent', 'popular'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === value}
                    onClick={() => {
                      onSortChange(value);
                      setSortOpen(false);
                    }}
                    className="dd-focus-ring flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-xs text-dd-text hover:bg-dd-bg"
                  >
                    {value === 'recent' ? text('Recente', 'Recent') : text('Popular', 'Popular')}
                    {sort === value && <Check className="h-4 w-4 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <Link
          href="/onboarding"
          aria-label={text('Personalizar feed', 'Customize feed')}
          title={text('Personalizar feed', 'Customize feed')}
          className="dd-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border text-dd-text hover:bg-dd-surface md:hidden"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshDisabled}
        aria-label={text('Atualizar publicações', 'Refresh posts')}
        title={text('Atualizar publicações', 'Refresh posts')}
        className="dd-focus-ring hidden h-11 w-11 shrink-0 items-center justify-center text-dd-muted hover:bg-dd-surface hover:text-blue-500 disabled:cursor-wait disabled:opacity-60 md:flex"
      >
        <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
      </button>
    </div>
  );
}
