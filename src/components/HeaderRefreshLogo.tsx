'use client';
import { useEffect, useId, useState } from 'react';
import { brandGeometry } from '@/lib/brand-geometry';
import styles from './HeaderRefreshLogo.module.css';
export function HeaderRefreshLogo() {
  const [state, setState] = useState({ progress: 0, refreshing: false });
  const id = useId().replace(/:/g, '');
  useEffect(() => {
    const update = (e: Event) => setState((e as CustomEvent<typeof state>).detail);
    window.addEventListener('stacklyst:feed-refresh', update);
    return () => window.removeEventListener('stacklyst:feed-refresh', update);
  }, []);
  const active = state.progress > 0 || state.refreshing;
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
            className={styles.mask}
            width={brandGeometry.width}
            height={brandGeometry.height * (state.refreshing || !active ? 1 : state.progress)}
          />
        </clipPath>
      </defs>
      <path d={brandGeometry.path} fill="#0083fe" opacity={active ? 0.2 : 1} />
      <path d={brandGeometry.path} fill="#0083fe" clipPath={`url(#${id})`} />
    </svg>
  );
}
