'use client';

import Link from 'next/link';
import { Check, Plus, Trash2 } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSavedAccounts } from '@/hooks/useSavedAccounts';

type User = {
  id: string;
  username: string;
  name?: string | null;
  avatar_url?: string | null;
  avatar_config?: unknown;
};

export function AccountSwitcher({ user }: { user: User }) {
  const { isEnglish } = useLanguage();
  const { savedAccount, busy, error, switchAccount, addAccount, removeSavedAccount } =
    useSavedAccounts(user.id);

  return (
    <div className="min-w-0">
      <div className="inline-flex items-center gap-2 rounded-full border border-dd-border bg-dd-surface/40 p-1">
        {/* Active Account Avatar */}
        <Link
          href={`/profile/${encodeURIComponent(user.username)}`}
          aria-label={`${isEnglish ? 'Profile of' : 'Perfil de'} ${user.name || user.username}`}
          className="relative block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <AuthorAvatar
            username={user.username}
            avatar_url={user.avatar_url}
            avatar_config={user.avatar_config}
            size="lg"
            className="!h-10 !w-10"
          />
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-dd-bg"
            title={isEnglish ? 'Active account' : 'Conta ativa'}
          >
            <Check className="h-2.5 w-2.5 stroke-[3] text-white" />
          </span>
        </Link>

        {/* Second account avatar (if exists) or Plus button */}
        {savedAccount ? (
          <button
            type="button"
            onClick={() => void switchAccount()}
            disabled={busy}
            aria-label={`${isEnglish ? 'Switch to' : 'Trocar para'} @${savedAccount.username}`}
            className="relative block rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer"
            title={`${isEnglish ? 'Switch to' : 'Trocar para'} @${savedAccount.username}`}
          >
            <AuthorAvatar
              username={savedAccount.username}
              avatar_url={savedAccount.avatar_url}
              avatar_config={savedAccount.avatar_config}
              size="lg"
              className="!h-10 !w-10"
            />
            {typeof savedAccount.unreadCount === 'number' && savedAccount.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-black text-white ring-2 ring-dd-bg">
                {savedAccount.unreadCount > 99 ? '99+' : savedAccount.unreadCount}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void addAccount()}
            disabled={busy}
            aria-label={isEnglish ? 'Add account' : 'Adicionar conta'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-dd-surface text-dd-text transition-colors hover:bg-dd-border disabled:opacity-50"
          >
            <Plus size={21} />
          </button>
        )}
      </div>

      {savedAccount && (
        <div className="mt-1.5 flex items-center gap-1.5 px-1">
          <button
            type="button"
            onClick={() => void removeSavedAccount()}
            disabled={busy}
            aria-label={isEnglish ? 'Remove other account' : 'Remover outra conta'}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-dd-muted hover:text-red-400"
          >
            <Trash2 size={12} />
            <span>
              {isEnglish ? `Remove @${savedAccount.username}` : `Remover @${savedAccount.username}`}
            </span>
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 max-w-[260px] text-xs leading-4 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
