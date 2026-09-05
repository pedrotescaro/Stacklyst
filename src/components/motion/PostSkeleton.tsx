'use client';

import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface PostSkeletonProps {
  variant?: 'feed' | 'card';
  index?: number;
}

export function PostSkeleton({ variant = 'card', index = 0 }: PostSkeletonProps) {
  return (
    <article
      aria-hidden="true"
      className={cn(
        'dd-skeleton-post p-4 sm:p-5',
        variant === 'feed'
          ? 'border-b border-dd-border/60 bg-dd-bg'
          : 'rounded-xl border border-dd-border bg-dd-card'
      )}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="dd-skeleton h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="dd-skeleton h-3 w-28 rounded-full" />
            <div className="dd-skeleton h-3 w-14 rounded-full" />
          </div>
          <div className="dd-skeleton h-2.5 w-20 rounded-full" />
        </div>
        <div className="dd-skeleton h-7 w-7 rounded-full" />
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="dd-skeleton h-3.5 w-[94%] rounded-full" />
        <div className="dd-skeleton h-3.5 w-full rounded-full" />
        <div className="dd-skeleton h-3.5 w-[68%] rounded-full" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-dd-border/60 pt-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <div className="dd-skeleton h-7 w-7 rounded-full" />
            {item < 4 && <div className="dd-skeleton hidden h-2.5 w-4 rounded-full sm:block" />}
          </div>
        ))}
      </div>
    </article>
  );
}

interface PostSkeletonListProps {
  count?: number;
  variant?: 'feed' | 'card';
  label?: string;
}

export function PostSkeletonList({ count = 3, variant = 'card', label }: PostSkeletonListProps) {
  const { text } = useLocalizedText();
  const accessibleLabel = label ?? text('Carregando publicações', 'Loading posts');
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={accessibleLabel}
      className={variant === 'card' ? 'space-y-4' : undefined}
    >
      <span className="sr-only">{accessibleLabel}</span>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} variant={variant} index={index} />
      ))}
    </div>
  );
}
