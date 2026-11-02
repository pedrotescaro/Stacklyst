'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Award,
  Bookmark,
  Briefcase,
  Calendar,
  ChevronRight,
  Code2,
  LogOut,
  Settings,
  ShieldAlert,
  SquarePen,
  X,
} from 'lucide-react';
import { AccountSwitcher } from '@/components/auth/AccountSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface DrawerUser {
  id: string;
  username: string;
  name?: string | null;
  avatar_url?: string | null;
  avatar_config?: unknown;
  role?: 'USER' | 'EVALUATOR' | 'ADMIN' | 'RECRUITER';
}

interface MobileNavigationDrawerProps {
  user: DrawerUser | null;
  onClose: () => void;
  onSignOut: () => void;
  onOpenDraft: () => void;
}

export function MobileNavigationDrawer({
  user,
  onClose,
  onSignOut,
  onOpenDraft,
}: MobileNavigationDrawerProps) {
  const { t, isEnglish } = useLanguage();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'Tab' && panelRef.current) {
        const elements = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!elements.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  const items = [
    { href: '/bookmarks', label: t.nav.bookmarks, icon: Bookmark },
    { href: '/achievements', label: isEnglish ? 'Titles' : 'Títulos', icon: Award },
    { href: '/jobs', label: t.nav.jobs, icon: Briefcase },
    { href: '/events', label: t.nav.events, icon: Calendar },
    { href: '/evaluations', label: t.nav.codeEvaluation, icon: Code2 },
    ...(user?.role === 'ADMIN'
      ? [{ href: '/admin', label: t.nav.adminPanel, icon: ShieldAlert }]
      : []),
  ];
  const linkClass =
    'flex min-h-14 w-full items-center gap-4 rounded-2xl border border-dd-border px-4 text-sm font-bold text-dd-text transition-colors hover:bg-dd-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

  return (
    <div className="fixed inset-0 z-[150] md:hidden">
      <button
        type="button"
        tabIndex={-1}
        aria-label={isEnglish ? 'Close menu' : 'Fechar menu'}
        onClick={onClose}
        className="absolute inset-0 bg-black/65"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEnglish ? 'Navigation menu' : 'Menu de navegação'}
        className="absolute inset-y-0 left-0 flex w-[min(85vw,380px)] flex-col bg-dd-bg shadow-2xl"
      >
        <div className="flex min-h-20 items-center justify-between gap-3 border-b border-dd-border px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          {user ? (
            <AccountSwitcher user={user} />
          ) : (
            <span className="text-sm font-bold text-dd-text">Stacklyst</span>
          )}
          <button
            ref={closeRef}
            type="button"
            aria-label={isEnglish ? 'Close menu' : 'Fechar menu'}
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border text-dd-text hover:bg-dd-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <X size={21} />
          </button>
        </div>
        <nav
          aria-label={isEnglish ? 'More navigation' : 'Mais navegação'}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5"
        >
          {items.map(({ href, label, icon: Icon }) => (
            <div key={href} className="contents">
              <Link href={href} onClick={onClose} className={linkClass}>
                <Icon className="h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="h-5 w-5 text-dd-muted" aria-hidden="true" />
              </Link>
              {href === '/bookmarks' && user && (
                <button type="button" onClick={onOpenDraft} className={linkClass}>
                  <SquarePen className="h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span className="flex-1 text-left">{isEnglish ? 'Drafts' : 'Rascunhos'}</span>
                  <ChevronRight className="h-5 w-5 text-dd-muted" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          <div className="mt-auto space-y-3 pt-3">
            <Link href="/settings" onClick={onClose} className={linkClass}>
              <Settings className="h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
              <span className="flex-1">{t.nav.settings}</span>
              <ChevronRight className="h-5 w-5 text-dd-muted" aria-hidden="true" />
            </Link>
            {user && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className={`${linkClass} text-red-500`}
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                {t.nav.signOut}
              </button>
            )}
          </div>
        </nav>
      </aside>
    </div>
  );
}
