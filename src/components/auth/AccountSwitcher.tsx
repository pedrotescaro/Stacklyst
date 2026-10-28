'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { invalidateCurrentUser } from '@/lib/client/current-user';
import { useLanguage } from '@/contexts/LanguageContext';

type User = {
  id: string;
  username: string;
  name?: string | null;
  avatar_url?: string | null;
  avatar_config?: unknown;
};
type SavedAccount = { id: string; label: string };

export function AccountSwitcher({ user }: { user: User }) {
  const { isEnglish } = useLanguage();
  const [saved, setSaved] = useState<SavedAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/accounts', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (alive) setSaved(data?.saved ?? null);
      })
      .catch(() => {
        if (alive)
          setError(isEnglish ? 'Could not load accounts.' : 'Não foi possível carregar as contas.');
      });
    return () => {
      alive = false;
    };
  }, [user.id, isEnglish]);

  async function act(action: 'save' | 'switch' | 'remove') {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/accounts', {
        method: action === 'remove' ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...(action === 'remove' ? {} : { body: JSON.stringify({ action }) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível concluir a ação.');
      if (action === 'remove') {
        setSaved(null);
      } else if (action === 'save') {
        // Reset client-side auth state before opening another login.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/login?addAccount=1');
      } else {
        invalidateCurrentUser();
        sessionStorage.removeItem('stacklyst_user');
        // A full navigation clears all in-memory data from the previous user.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/feed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a ação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-dd-border p-1">
        <Link
          href={`/profile/${encodeURIComponent(user.username)}`}
          aria-label={`${isEnglish ? 'Profile of' : 'Perfil de'} ${user.name || user.username}`}
        >
          <AuthorAvatar
            username={user.username}
            avatar_url={user.avatar_url}
            avatar_config={user.avatar_config}
            size="lg"
          />
        </Link>
        <button
          type="button"
          onClick={() => (saved ? setExpanded(!expanded) : void act('save'))}
          disabled={busy}
          aria-label={
            saved
              ? isEnglish
                ? 'Switch account'
                : 'Trocar de conta'
              : isEnglish
                ? 'Add account'
                : 'Adicionar conta'
          }
          aria-expanded={saved ? expanded : undefined}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-dd-surface text-dd-text transition-colors hover:bg-dd-border disabled:opacity-50"
        >
          <Plus size={21} />
        </button>
      </div>
      {saved && expanded && (
        <div className="mt-2 flex max-w-[260px] items-center gap-1 rounded-xl border border-dd-border bg-dd-surface p-1">
          <button
            type="button"
            onClick={() => void act('switch')}
            disabled={busy}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-dd-text hover:bg-dd-border disabled:opacity-50"
          >
            <RefreshCw size={16} className="shrink-0 text-blue-300" />
            <span className="truncate">{saved.label}</span>
          </button>
          <button
            type="button"
            onClick={() => void act('remove')}
            disabled={busy}
            aria-label={isEnglish ? 'Remove saved account' : 'Remover conta salva'}
            className="rounded-lg p-2 text-dd-text hover:bg-dd-border disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 max-w-[260px] text-xs leading-4 text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
