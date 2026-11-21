'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { brandGeometry } from '@/lib/brand-geometry';
import { brandWordmark, WORDMARK_HEIGHT_RATIO, WORDMARK_WIDTH_RATIO } from '@/lib/brand-wordmark';
import styles from './BrandLogo.module.css';

export interface BrandLogoProps {
  /** Height of the S in px; the full logo's "y" descender extends below it. */
  size?: number;
  className?: string;
  /** Full logo (S + name). `false` shows only the S, e.g. in a collapsed sidebar. */
  wordmark?: boolean;
  label?: string;
}

let artworkCheck: Promise<boolean> | null = null;
let artworkFailed = false;

/** One shared load check for every logo on the page. */
function checkArtwork() {
  artworkCheck ??= new Promise<boolean>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = brandWordmark.src;
  });
  return artworkCheck;
}

/** True once the logo artwork failed to load, so the name is typeset instead. */
function useBrandArtworkFailed() {
  const [failed, setFailed] = useState(artworkFailed);
  useEffect(() => {
    if (artworkFailed || typeof Image === 'undefined') return;
    let active = true;
    void checkArtwork().then((loaded) => {
      if (loaded) return;
      artworkFailed = true;
      if (active) setFailed(true);
    });
    return () => {
      active = false;
    };
  }, []);
  return failed;
}

/** Shape-only artwork painted with `currentColor`, so callers keep choosing the colour. */
const brandArtworkStyle = {
  '--brand-artwork': `url("${brandWordmark.src}")`,
  '--brand-wordmark-height': WORDMARK_HEIGHT_RATIO,
  '--brand-wordmark-width': WORDMARK_WIDTH_RATIO,
  '--brand-text-scale': 1 / brandWordmark.textMarkRatio,
} as CSSProperties;

export function BrandLogo({
  size = 32,
  className = '',
  wordmark = true,
  label = 'Stacklyst',
}: BrandLogoProps) {
  const artworkFailed = useBrandArtworkFailed();
  const height = Math.min(size, 32);

  return (
    <span
      role="img"
      aria-label={label}
      className={`${styles.brand} ${className}`}
      style={
        {
          ...brandArtworkStyle,
          '--brand-requested-size': `${size}px`,
          '--brand-width-ratio': wordmark
            ? WORDMARK_WIDTH_RATIO + 0.1
            : brandGeometry.width / brandGeometry.height,
        } as CSSProperties
      }
    >
      {!wordmark ? (
        <svg
          className={styles.logo}
          width={(height * brandGeometry.width) / brandGeometry.height}
          height={height}
          viewBox={brandGeometry.viewBox}
          fill="none"
          aria-hidden="true"
        >
          <path className={styles.mark} d={brandGeometry.path} fill="currentColor" />
        </svg>
      ) : artworkFailed ? (
        <span className={styles.wordmarkText} aria-hidden="true" data-testid="brand-wordmark-text">
          {brandWordmark.text}
        </span>
      ) : (
        <span className={styles.wordmark} aria-hidden="true" data-testid="brand-wordmark" />
      )}
    </span>
  );
}
