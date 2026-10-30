'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export function BlockUserButton({
  userId,
  username,
  blocked = false,
  onChanged,
  className = '',
}: {
  userId: string;
  username: string;
  blocked?: boolean;
  onChanged?: (blocked: boolean) => void;
  className?: string;
}) {
  const { text } = useLocalizedText();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userId)}/block`, {
        method: blocked ? 'DELETE' : 'POST',
      });
      if (!response.ok) {
        if (response.status === 401)
          throw new Error(text('Entre na sua conta para continuar.', 'Sign in to continue.'));
        throw new Error(
          text(
            'Não foi possível atualizar o bloqueio. Tente novamente.',
            'Could not update this block. Try again.'
          )
        );
      }
      window.dispatchEvent(
        new CustomEvent('stacklyst:block-changed', { detail: { userId, blocked: !blocked } })
      );
      onChanged?.(!blocked);
      setConfirming(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : text('Tente novamente.', 'Try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0" onClick={(event) => event.stopPropagation()}>
      {confirming ? (
        <div className="space-y-3 p-3 text-sm">
          <p className="font-semibold text-dd-text">
            {text(`Bloquear @${username}?`, `Block @${username}?`)}
          </p>
          <p className="text-xs leading-5 text-dd-text/80">
            {text(
              'Vocês deixarão de ver o conteúdo um do outro e não poderão interagir. Os vínculos de seguir serão removidos. Você pode desbloquear nas configurações.',
              'You will no longer see each other’s content or be able to interact. Follows will be removed. You can unblock in settings.'
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="rounded-lg bg-dd-accent px-3 py-2 text-xs font-bold text-black disabled:opacity-50"
            >
              {busy
                ? text('Bloqueando…', 'Blocking…')
                : text('Confirmar bloqueio', 'Confirm block')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                setError('');
              }}
              className="rounded-lg border border-dd-border px-3 py-2 text-xs text-dd-text"
            >
              {text('Cancelar', 'Cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => (blocked ? submit() : setConfirming(true))}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-dd-text transition-colors hover:bg-dd-surface disabled:opacity-50 ${className}`}
        >
          <Ban size={16} aria-hidden="true" />
          {busy
            ? text('Desbloqueando…', 'Unblocking…')
            : blocked
              ? text('Desbloquear', 'Unblock')
              : text(`Bloquear @${username}`, `Block @${username}`)}
        </button>
      )}
      {error && (
        <p role="alert" className="px-3 py-2 text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
