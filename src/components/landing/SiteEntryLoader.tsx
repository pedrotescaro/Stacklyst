'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { BRAND_SUFFIX_OFFSET } from '@/components/BrandLogo';
import { brandGeometry } from '@/lib/brand-geometry';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './SiteEntryLoader.module.css';

/** Time the entry sequence stays on screen before the exit transition starts. */
export const SITE_ENTRY_DURATION_MS = 1600;
/** Fallback in case the exit transition is interrupted and never emits `transitionend`. */
export const SITE_ENTRY_EXIT_FALLBACK_MS = 440;
const REDUCED_EXIT_FALLBACK_MS = 160;

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

export default function SiteEntryLoader({
  onComplete,
}: {
  onComplete?: () => void;
  forceMotion?: boolean;
}) {
  const { text } = useLocalizedText();
  const [exiting, setExiting] = useState(false);
  const complete = useRef(onComplete);
  const completed = useRef(false);
  complete.current = onComplete;

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    complete.current?.();
  }, []);

  useEffect(() => {
    const reveal = window.setTimeout(
      () => setExiting(true),
      prefersReducedMotion() ? 0 : SITE_ENTRY_DURATION_MS
    );
    return () => window.clearTimeout(reveal);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    // Transition end drives navigation; this fallback also covers interrupted transitions.
    const fallback = window.setTimeout(
      finish,
      prefersReducedMotion() ? REDUCED_EXIT_FALLBACK_MS : SITE_ENTRY_EXIT_FALLBACK_MS
    );
    return () => window.clearTimeout(fallback);
  }, [exiting, finish]);

  return (
    <div
      className={`${styles.loader} ${exiting ? styles.exiting : ''}`}
      data-testid="site-entry-loader"
      aria-busy="true"
      onTransitionEnd={(event) => {
        if (exiting && event.target === event.currentTarget && event.propertyName === 'opacity') {
          finish();
        }
      }}
    >
      <svg
        className={styles.brand}
        viewBox={`0 0 ${brandGeometry.wordmarkWidth} ${brandGeometry.wordmarkHeight}`}
        fill="none"
        aria-hidden="true"
        style={
          {
            '--brand-view-ratio': brandGeometry.wordmarkWidth / brandGeometry.wordmarkHeight,
          } as CSSProperties
        }
      >
        <path className={styles.markFill} d={brandGeometry.path} fill="currentColor" />
        <path
          className={styles.markTrace}
          d={brandGeometry.path}
          pathLength={1}
          stroke="currentColor"
        />
        {/* Same vector fill as the S, so the name is exactly the same blue. */}
        <g transform={`translate(${BRAND_SUFFIX_OFFSET} 0)`}>
          <path className={styles.suffix} d={brandGeometry.suffixPath} fill="currentColor" />
        </g>
      </svg>

      <span role="status" aria-live="polite" className="sr-only">
        {text('Carregando Stacklyst', 'Loading Stacklyst')}
      </span>
    </div>
  );
}
