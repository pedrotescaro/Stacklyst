'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './PostActionsBar.module.css';

export const postActionClassName = styles.action;

/** Direct children are evenly spaced action slots; fewer actions need no placeholders. */
export function PostActionsBar({
  children,
  className,
  onClick,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(styles.bar, className)}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
    >
      {children}
    </div>
  );
}

export function InteractionCount({ count }: { count: number }) {
  const { isEnglish } = useLanguage();
  const locale = isEnglish ? 'en-US' : 'pt-BR';
  const value = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const full = new Intl.NumberFormat(locale).format(value);
  let compact = full;
  for (const [minimum, divisor, suffix] of [
    [999_500_000_000, 1_000_000_000_000, 'T'],
    [999_500_000, 1_000_000_000, 'B'],
    [999_500, 1_000_000, 'M'],
    [1_000, 1_000, 'K'],
  ] as const) {
    if (value >= minimum) {
      const scaled = value / divisor;
      compact = `${new Intl.NumberFormat(locale, { maximumFractionDigits: scaled < 100 ? 1 : 0 }).format(scaled)}${suffix}`;
      break;
    }
  }
  return (
    <span className={styles.count} title={full}>
      <span className={styles.full} aria-hidden="true">
        {value >= 1_000_000 ? compact : full}
      </span>
      <span className={styles.compact} aria-hidden="true">
        {compact}
      </span>
      <span className={styles.srOnly}>{full}</span>
    </span>
  );
}
