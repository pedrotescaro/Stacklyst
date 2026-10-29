'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './MobileRefreshHeader.module.css';

export function MobileRefreshHeader({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ progress: 0, refreshing: false });
  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<typeof state>).detail;
      setState({
        progress: Math.max(0, Math.min(1, detail.progress)),
        refreshing: detail.refreshing,
      });
    };
    window.addEventListener('stacklyst:feed-refresh', update);
    return () => window.removeEventListener('stacklyst:feed-refresh', update);
  }, []);
  const distance = state.refreshing ? 44 : state.progress * 64;
  return (
    <header
      className={`${styles.header} sticky top-0 z-[100] grid w-full grid-cols-3 items-center border-b border-dd-border bg-dd-bg/95 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md`}
      data-pulling={state.progress > 0 && !state.refreshing}
      data-refreshing={state.refreshing}
      style={{ '--header-pull': `${distance}px` } as CSSProperties}
    >
      {children}
    </header>
  );
}
