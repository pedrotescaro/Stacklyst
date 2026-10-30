'use client';

import { useEffect, useState } from 'react';
import { BlockUserButton } from '@/components/BlockUserButton';
import { useLocalizedText } from '@/i18n/useLocalizedText';

type Entry = { blocked: { id: string; username: string }; createdAt: string };

export function BlockedUsersSettings() {
  const { text } = useLocalizedText();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/users/blocked', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setEntries(await response.json());
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section className="space-y-6 p-5 sm:p-8">
      <div>
        <h2 className="text-lg font-bold text-dd-text">
          {text('Usuários bloqueados', 'Blocked users')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          {text(
            'O bloqueio oculta o conteúdo e impede interações entre as duas contas. Desbloquear não restaura os vínculos de seguir e não remove um bloqueio feito pela outra pessoa.',
            'Blocking hides content and prevents interactions between both accounts. Unblocking does not restore follows or remove a block placed by the other person.'
          )}
        </p>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-dd-muted">
          {text('Carregando bloqueios…', 'Loading blocks…')}
        </p>
      ) : error ? (
        <div role="alert">
          <p className="text-sm text-dd-muted">
            {text('Não foi possível carregar seus bloqueios.', 'Could not load your blocks.')}
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-3 text-sm font-semibold text-dd-accent"
          >
            {text('Tentar novamente', 'Try again')}
          </button>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-dd-muted">
          {text('Você ainda não bloqueou ninguém.', 'You haven’t blocked anyone.')}
        </p>
      ) : (
        <ul className="divide-y divide-dd-border">
          {entries.map(({ blocked }) => (
            <li key={blocked.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <span className="min-w-0 break-all text-sm font-semibold text-dd-text">
                @{blocked.username}
              </span>
              <BlockUserButton
                userId={blocked.id}
                username={blocked.username}
                blocked
                onChanged={() =>
                  setEntries((current) => current.filter((item) => item.blocked.id !== blocked.id))
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
