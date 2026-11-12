'use client';
import { useEffect, useId, useState } from 'react';
import { brandGeometry } from '@/lib/brand-geometry';
import styles from './HeaderRefreshLogo.module.css';

/**
 * Mobile header S that mirrors the landing loader: while pulling, the S rises
 * from the bottom with the gesture; while refreshing, it replays the loader's
 * bottom-up reveal in a loop.
 */
export function HeaderRefreshLogo() {
  const [state, setState] = useState({ progress: 0, refreshing: false });
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    const update = (e: Event) => setState((e as CustomEvent<typeof state>).detail);
    window.addEventListener('stacklyst:feed-refresh', update);
    return () => window.removeEventListener('stacklyst:feed-refresh', update);
  }, []);
  const active = state.progress > 0 || state.refreshing;
  const filled = state.refreshing || !active ? 1 : state.progress;
  const fillHeight = brandGeometry.height * filled;
  return (
    <svg
      role="img"
      aria-label="Stacklyst"
      viewBox={brandGeometry.viewBox}
      className={styles.logo}
      data-refreshing={state.refreshing}
    >
      <defs>
        <clipPath id={id}>
          <rect
            y={brandGeometry.height - fillHeight}
            width={brandGeometry.width}
            height={fillHeight}
          />
        </clipPath>
      </defs>
      <path d={brandGeometry.path} fill="#0083fe" opacity={active ? 0.2 : 1} />
      {state.refreshing ? (
        <path className={styles.reveal} d={brandGeometry.path} fill="#0083fe" />
      ) : (
        <path d={brandGeometry.path} fill="#0083fe" clipPath={`url(#${id})`} />
      )}
    </svg>
  );
}
