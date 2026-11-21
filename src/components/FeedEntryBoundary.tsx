'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import SiteEntryLoader from '@/components/landing/SiteEntryLoader';

const FeedEntryReadyContext = createContext<(() => void) | null>(null);

/** Signals that the streamed feed (or its recovery screen) can be revealed. */
export function useFeedEntryReady() {
  const markReady = useContext(FeedEntryReadyContext);
  useEffect(() => {
    markReady?.();
  }, [markReady]);
}

/** One logo sequence per feed entry, including full document reloads. */
export function FeedEntryBoundary({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const revealFeed = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  return (
    <FeedEntryReadyContext.Provider value={markReady}>
      {visible && <SiteEntryLoader ready={ready} onComplete={revealFeed} />}
      <div inert={visible} aria-hidden={visible ? true : undefined}>
        {children}
      </div>
    </FeedEntryReadyContext.Provider>
  );
}
