import type { CSSProperties } from 'react';
import { brandGeometry } from '@/lib/brand-geometry';
import styles from './BrandLogo.module.css';

export interface BrandLogoProps {
  size?: number;
  className?: string;
  wordmark?: boolean;
  animated?: boolean;
  label?: string;
}

/** The supplied S replaces the first letter, with one accessible name. */
export function BrandLogo({
  size = 32,
  className = '',
  wordmark = true,
  animated = false,
  label = 'Stacklyst',
}: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`${styles.brand} ${animated ? styles.animated : ''} ${className}`}
      style={
        {
          '--brand-requested-size': `${size}px`,
          '--brand-width-ratio': wordmark
            ? brandGeometry.wordmarkWidth / brandGeometry.height + 0.1
            : brandGeometry.width / brandGeometry.height,
          '--brand-suffix-ratio':
            (brandGeometry.wordmarkWidth - brandGeometry.width - 36) / brandGeometry.height,
        } as CSSProperties
      }
    >
      <svg
        className={styles.mark}
        width={Math.min(size, 32) * (brandGeometry.width / brandGeometry.height)}
        height={Math.min(size, 32)}
        viewBox={brandGeometry.viewBox}
        fill="none"
        aria-hidden="true"
      >
        <path d={brandGeometry.path} fill="currentColor" />
      </svg>
      {wordmark && (
        <span className={styles.suffix} aria-hidden="true">
          tacklyst
        </span>
      )}
    </span>
  );
}
