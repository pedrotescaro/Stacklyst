'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import { FavoriteButton } from '../../_components/FavoriteButton';
import styles from './library.module.css';

const HEARTBEAT = 30_000;

/**
 * Studied toggle, favorite, and reading-time heartbeat. Time is only counted
 * while the tab is visible and the reader interacted in the last two minutes.
 */
export function ArticleActions({
  slug,
  title,
  studied: initialStudied,
  favorite,
}: {
  slug: string;
  title: string;
  studied: boolean;
  favorite: boolean;
}) {
  const router = useRouter();
  const [studied, setStudied] = useState(initialStudied);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const lastInput = useRef(Date.now());
  useEffect(() => {
    const touch = () => (lastInput.current = Date.now());
    const events = ['scroll', 'keydown', 'pointerdown', 'pointermove'] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.min(HEARTBEAT * 2, now - last);
      last = now;
      if (document.visibilityState !== 'visible' || now - lastInput.current > 120_000) return;
      void fetch('/api/enade/library/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, readMs: elapsed }),
        keepalive: true,
      }).catch(() => {});
    }, HEARTBEAT);
    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, touch));
    };
  }, [slug]);
  async function toggle() {
    const next = !studied;
    setStudied(next);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/enade/library/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, studied: next }),
      });
      if (!response.ok) throw new Error('progress');
      router.refresh();
    } catch {
      setStudied(!next);
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className={styles.studyButton}
        aria-pressed={studied}
        disabled={pending}
        onClick={() => void toggle()}
      >
        {studied ? (
          <CheckCircle2 size={16} aria-hidden="true" />
        ) : (
          <Circle size={16} aria-hidden="true" />
        )}
        {studied ? 'Estudado' : 'Marcar como estudado'}
      </button>
      <FavoriteButton
        kind="ARTICLE"
        refId={slug}
        initial={favorite}
        label={title}
        compact
        className={styles.favoriteButton}
      />
      {error && (
        <span role="alert" style={{ fontSize: 12.5, color: 'var(--enade-danger)' }}>
          {error}
        </span>
      )}
    </>
  );
}
