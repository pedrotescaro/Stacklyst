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

/** Horizontal offset of "tackLyst" after the S, matching public/brand/wordmark.svg. */
export const BRAND_SUFFIX_OFFSET = 904;
const WORDMARK_VIEWBOX = `0 0 ${brandGeometry.wordmarkWidth} ${brandGeometry.wordmarkHeight}`;

/**
 * The S and "tackLyst" are both drawn as vector outlines with the same fill,
 * so the name renders in exactly the same blue as the monogram.
 */
export function BrandLogo({
  size = 32,
  className = '',
  wordmark = true,
  animated = false,
  label = 'Stacklyst',
}: BrandLogoProps) {
  const height = Math.min(size, 32);
  const viewWidth = wordmark ? brandGeometry.wordmarkWidth : brandGeometry.width;
  const viewHeight = wordmark ? brandGeometry.wordmarkHeight : brandGeometry.height;

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
          '--brand-view-ratio': viewWidth / viewHeight,
          '--brand-height-ratio': viewHeight / brandGeometry.height,
        } as CSSProperties
      }
    >
      <svg
        className={styles.logo}
        width={(height * viewWidth) / brandGeometry.height}
        height={(height * viewHeight) / brandGeometry.height}
        viewBox={wordmark ? WORDMARK_VIEWBOX : brandGeometry.viewBox}
        fill="none"
        aria-hidden="true"
      >
        <path className={styles.mark} d={brandGeometry.path} fill="currentColor" />
        {wordmark && (
          <g transform={`translate(${BRAND_SUFFIX_OFFSET} 0)`}>
            <path className={styles.suffix} d={brandGeometry.suffixPath} fill="currentColor" />
          </g>
        )}
      </svg>
    </span>
  );
}
