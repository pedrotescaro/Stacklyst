'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import styles from './FavoriteButton.module.css';

export function FavoriteButton({
  kind,
  refId,
  initial,
  label,
  compact = false,
}: {
  kind: 'ARTICLE' | 'QUESTION';
  refId: string;
  initial: boolean;
  label: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function toggle() {
    const next = !favorite;
    setFavorite(next);
    setPending(true);
    setError(false);
    try {
      const response = await fetch('/api/enade/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, ref: refId, favorite: next }),
      });
      if (!response.ok) throw new Error('favorite');
      router.refresh();
    } catch {
      setFavorite(!next);
      setError(true);
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className={styles.button}
        data-active={favorite}
        data-compact={compact}
        aria-pressed={favorite}
        aria-label={favorite ? `Remover ${label} dos favoritos` : `Favoritar ${label}`}
        title={
          error
            ? 'Não foi possível salvar. Tente novamente.'
            : favorite
              ? 'Nos favoritos'
              : 'Favoritar'
        }
        disabled={pending}
        onClick={() => void toggle()}
      >
        <Star size={16} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
        {!compact && <span>{favorite ? 'Favorito' : 'Favoritar'}</span>}
      </button>
      {error && (
        <span className={styles.error} role="alert">
          Não foi possível salvar o favorito. Tente novamente.
        </span>
      )}
    </>
  );
}
