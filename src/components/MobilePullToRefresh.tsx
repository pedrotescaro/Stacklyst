'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './MobilePullToRefresh.module.css';

const THRESHOLD = 84;
const INTENT_DISTANCE = 8;

interface Props {
  children: ReactNode;
  refreshing: boolean;
  disabled?: boolean;
  onRefresh: () => Promise<void>;
}

/** A mobile-only pull gesture attached to the feed, without intercepting normal scrolls. */
export function MobilePullToRefresh({ children, refreshing, disabled = false, onRefresh }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<{ x: number; y: number; captured: boolean; distance: number } | null>(
    null
  );
  const busyRef = useRef(false);
  const stateRef = useRef({ disabled, refreshing, onRefresh });
  stateRef.current = { disabled, refreshing, onRefresh };
  const [progress, setProgress] = useState(0);
  const [working, setWorking] = useState(false);
  const { text } = useLocalizedText();

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const reset = () => {
      gestureRef.current = null;
      setProgress(0);
    };
    const start = (event: TouchEvent) => {
      if (
        event.touches.length !== 1 ||
        window.innerWidth >= 768 ||
        window.scrollY > 1 ||
        stateRef.current.disabled ||
        stateRef.current.refreshing ||
        busyRef.current
      ) {
        reset();
        return;
      }
      const target = event.target as Element | null;
      // Preserve horizontal code scrolling, text selection and editable controls.
      if (target?.closest('pre, textarea, input, select, [contenteditable="true"]')) {
        reset();
        return;
      }
      const touch = event.touches[0];
      gestureRef.current = { x: touch.clientX, y: touch.clientY, captured: false, distance: 0 };
    };
    const move = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      if (
        event.touches.length !== 1 ||
        window.innerWidth >= 768 ||
        window.scrollY > 1 ||
        stateRef.current.disabled ||
        stateRef.current.refreshing
      ) {
        reset();
        return;
      }
      // Once the browser owns the gesture, do not run a parallel refresh.
      if (!event.cancelable) {
        reset();
        return;
      }
      const touch = event.touches[0];
      const dx = touch.clientX - gesture.x;
      const dy = touch.clientY - gesture.y;
      if (!gesture.captured) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < INTENT_DISTANCE) return;
        if (dy <= 0 || dy <= Math.abs(dx) * 1.2) {
          reset();
          return;
        }
        gesture.captured = true;
      }
      event.preventDefault();
      gesture.distance = Math.max(0, dy);
      setProgress(Math.min(gesture.distance / THRESHOLD, 1));
    };
    const end = () => {
      const gesture = gestureRef.current;
      reset();
      if (
        !gesture?.captured ||
        gesture.distance < THRESHOLD ||
        stateRef.current.disabled ||
        stateRef.current.refreshing ||
        busyRef.current
      )
        return;
      busyRef.current = true;
      setWorking(true);
      void Promise.resolve()
        .then(() => stateRef.current.onRefresh())
        .catch(() => {
          // The caller owns error reporting; always release the gesture on failure.
        })
        .finally(() => {
          busyRef.current = false;
          setWorking(false);
        });
    };
    node.addEventListener('touchstart', start, { passive: true });
    node.addEventListener('touchmove', move, { passive: false });
    node.addEventListener('touchend', end);
    node.addEventListener('touchcancel', reset);
    return () => {
      node.removeEventListener('touchstart', start);
      node.removeEventListener('touchmove', move);
      node.removeEventListener('touchend', end);
      node.removeEventListener('touchcancel', reset);
    };
  }, []);

  const active = working || refreshing;
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('stacklyst:feed-refresh', { detail: { progress, refreshing: active } })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent('stacklyst:feed-refresh', { detail: { progress: 0, refreshing: false } })
      );
    };
  }, [progress, active]);
  return (
    <div ref={wrapperRef} className={styles.wrapper} data-testid="pull-to-refresh">
      <span className={styles.srOnly} role="status" aria-live="polite">
        {active ? text('Atualizando publicações', 'Refreshing posts') : ''}
      </span>
      {children}
    </div>
  );
}
