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
      <div className="flex items-center gap-2.5">
        {/* Active Account Avatar with Frame */}
        <Link
          href={`/profile/${encodeURIComponent(user.username)}`}
          aria-label={`${isEnglish ? 'Profile of' : 'Perfil de'} ${user.name || user.username}`}
          className="relative block shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <AuthorAvatar
            username={user.username}
            avatar_url={user.avatar_url}
            avatar_config={user.avatar_config}
            size="lg"
            className="!h-11 !w-11"
          />
        </Link>

        {/* Second account avatar (if exists) or Plus button */}
        {savedAccount ? (
          <button
            type="button"
            onClick={() => void switchAccount()}
            disabled={busy}
            aria-label={`${isEnglish ? 'Switch to' : 'Trocar para'} @${savedAccount.username}`}
            className="relative block shrink-0 rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer"
            title={`${isEnglish ? 'Switch to' : 'Trocar para'} @${savedAccount.username}`}
          >
            <AuthorAvatar
              username={savedAccount.username}
              avatar_url={savedAccount.avatar_url}
              avatar_config={savedAccount.avatar_config}
              size="lg"
              className="!h-11 !w-11"
            />
            {typeof savedAccount.unreadCount === 'number' && savedAccount.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-black text-white ring-2 ring-black">
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-white transition-colors hover:border-neutral-500 hover:bg-neutral-800 disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <Plus size={20} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {savedAccount && (
        <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
          <button
            type="button"
            onClick={() => void removeSavedAccount()}
            disabled={busy}
            aria-label={isEnglish ? 'Remove other account' : 'Remover outra conta'}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-dd-muted hover:text-red-400 transition-colors"
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
