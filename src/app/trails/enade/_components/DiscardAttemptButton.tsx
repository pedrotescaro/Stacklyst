'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import ui from './ui.module.css';

/** Discarding hides an unfinished attempt from the history; finished ones cannot be discarded. */
export function DiscardAttemptButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  if (!confirm)
    return (
      <button
        type="button"
        className={ui.ghost}
        aria-label={`Descartar ${title}`}
        title="Descartar"
        onClick={() => setConfirm(true)}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    );
  return (
    <span className={ui.rowAside} role="group" aria-label="Confirmar descarte">
      <span className={ui.muted}>Descartar esta tentativa em andamento?</span>
      <button
        type="button"
        className={ui.secondary}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const response = await fetch(`/api/enade/attempts/${id}`, { method: 'DELETE' }).catch(
            () => null
          );
          if (response?.ok) router.refresh();
          else {
            setError('Não foi possível descartar.');
            setPending(false);
          }
        }}
      >
        Descartar
      </button>
      <button type="button" className={ui.ghost} onClick={() => setConfirm(false)}>
        Cancelar
      </button>
      {error && <span className={ui.error}>{error}</span>}
    </span>
  );
}
