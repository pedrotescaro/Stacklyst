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
      style={{ '--brand-size': `${size}px` } as CSSProperties}
    >
      <svg className={styles.mark} viewBox={brandGeometry.viewBox} fill="none" aria-hidden="true">
        <path d={brandGeometry.path} fill="#0083fe" />
      </svg>
      {wordmark && (
        <span className={styles.suffix} aria-hidden="true">
          tacklyst
        </span>
      )}
    </span>
  );
}
