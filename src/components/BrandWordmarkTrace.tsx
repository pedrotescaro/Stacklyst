import type { CSSProperties } from 'react';
import { brandWordmarkPaths } from '@/lib/brand-wordmark-paths';
import styles from './BrandWordmarkTrace.module.css';

/**
 * The full logo drawn from the logo font's outlines, letter by letter: each
 * outline is traced and then fills up from the bottom, left to right, like a
 * load. Decorative; the caller provides the accessible label or status.
 */
export function BrandWordmarkTrace({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`${styles.wordmark} ${className}`}
      viewBox={brandWordmarkPaths.viewBox}
      fill="none"
      aria-hidden="true"
      data-testid="brand-wordmark-trace"
    >
      {brandWordmarkPaths.letters.map((letter, index) => (
        <g key={index} style={{ '--letter': index } as CSSProperties}>
          <path className={styles.fill} d={letter.d} fill="currentColor" />
          <path className={styles.trace} d={letter.d} pathLength={1} stroke="currentColor" />
        </g>
      ))}
    </svg>
  );
}
