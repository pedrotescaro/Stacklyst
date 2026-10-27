'use client';
import { useEffect, useRef, useState } from 'react';
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
  complete.current = onComplete;
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const reveal = window.setTimeout(() => setExiting(true), reduced ? 0 : 1080);
    const finish = window.setTimeout(() => complete.current?.(), reduced ? 80 : 1440);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(finish);
    };
  }, []);
  return (
    <div
      className={`${styles.loader} ${exiting ? styles.exiting : ''}`}
      data-testid="site-entry-loader"
      aria-busy="true"
    >
      <BrandReveal />
    </div>
  );
}
