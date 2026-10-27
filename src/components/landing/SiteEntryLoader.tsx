'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrandReveal } from '@/components/BrandReveal';
import styles from './SiteEntryLoader.module.css';
export default function SiteEntryLoader({
  onComplete,
}: {
  onComplete?: () => void;
  forceMotion?: boolean;
}) {
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
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveal = window.setTimeout(() => setExiting(true), reduced ? 0 : 960);
    return () => {
      window.clearTimeout(reveal);
    };
  }, []);
  useEffect(() => {
    if (!exiting) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Transition end drives navigation; this fallback also covers interrupted transitions.
    const fallback = window.setTimeout(finish, reduced ? 160 : 440);
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
      <BrandReveal />
    </div>
  );
}
