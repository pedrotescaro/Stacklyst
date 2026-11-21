'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrandWordmarkTrace } from '@/components/BrandWordmarkTrace';
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
  ready = true,
}: {
  onComplete?: () => void;
  /** Keep the completed logo visible while the destination is still loading. */
  ready?: boolean;
  forceMotion?: boolean;
}) {
  const { text } = useLocalizedText();
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const exiting = sequenceComplete && ready;
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
      () => setSequenceComplete(true),
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
      <BrandWordmarkTrace className={styles.brand} />

      <span role="status" aria-live="polite" className="sr-only">
        {text('Carregando Stacklyst', 'Loading Stacklyst')}
      </span>
    </div>
  );
}
