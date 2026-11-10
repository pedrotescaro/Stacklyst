'use client';

import type { ReactNode } from 'react';
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Home,
  Menu,
  MessageCircle,
  MoreHorizontal,
  SquarePen,
  Swords,
  Trophy,
  User as UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { HeaderRefreshLogo } from '@/components/HeaderRefreshLogo';
import { MobileRefreshHeader } from '@/components/MobileRefreshHeader';
import { NotificationBellIcon } from '@/components/motion/NotificationBellIcon';
import { ProfileName } from '@/components/profile/ProfileIdentity';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/cn';
import { DEMO_USER } from './demo-data';

export type DemoRoute = 'feed' | 'trails' | 'ranking' | 'profile';

interface DemoShellProps {
  route: DemoRoute;
  mobile: boolean;
  rail?: ReactNode;
  children: ReactNode;
  shellClassName?: string;
  bodyClassName?: string;
  mainClassName?: string;
  /** The real app only shows the mobile header on /feed and /ranking. */
  mobileHeader?: boolean;
}

/**
 * Read-only projection of the platform shell (`Sidebar` + `dd-platform-*`
 * columns). The real `Sidebar` depends on the router, session storage and
 * notification polling, so the walkthrough mirrors its desktop and mobile
 * markup with the same classes, icons and `t.nav` labels.
 */
export function DemoShell({
  route,
  mobile,
  rail,
  children,
  shellClassName,
  bodyClassName,
  mainClassName,
  mobileHeader = route === 'feed' || route === 'ranking',
}: DemoShellProps) {
  const { t, isEnglish } = useLanguage();
  const items: Array<{ id: DemoRoute | string; label: string; icon: LucideIcon; dot?: boolean }> = [
    { id: 'feed', label: t.nav.home, icon: Home, dot: true },
    { id: 'trails', label: t.nav.tracks, icon: BookOpen },
    { id: 'duels', label: t.nav.duels, icon: Swords },
    { id: 'titles', label: isEnglish ? 'Titles' : 'Títulos', icon: Award },
    { id: 'notifications', label: t.nav.notifications, icon: Bell },
    { id: 'ranking', label: t.nav.ranking, icon: Trophy },
    { id: 'messages', label: t.nav.chat, icon: MessageCircle },
    { id: 'bookmarks', label: t.nav.bookmarks, icon: Bookmark },
    { id: 'profile', label: t.nav.profile, icon: UserIcon },
  ];
  const mobileItems = [items[0], items[1], items[2], items[8]];

  return (
    <div
      className={cn('dd-platform-shell dd-platform-shell--fullscreen demo-shell', shellClassName)}
      data-route={route}
    >
      {!mobile && (
        <aside className="dd-platform-sidebar z-40 flex h-full min-h-0 w-[250px] shrink-0 select-none flex-col overflow-visible border-r border-dd-border bg-dd-bg p-4">
          <div className="flex min-h-0 flex-1 flex-col">
            <span className="flex w-fit shrink-0 items-center justify-start gap-2.5 px-3 py-1">
              <BrandLogo size={27} />
            </span>
            <nav className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden pr-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = item.id === route;
                return (
                  <span
                    key={item.id}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center justify-start gap-4 rounded-full px-4 py-2.5 text-left text-[15px] text-dd-text dark:text-white',
                      active ? 'font-black' : 'font-bold'
                    )}
                  >
                    <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                      {item.id === 'notifications' ? (
                        <NotificationBellIcon unreadCount={0} active={false} />
                      ) : (
                        <Icon
                          className={cn(
                            'h-6 w-6 stroke-[2.2] text-dd-text dark:text-white',
                            active && 'fill-current'
                          )}
                        />
                      )}
                      {item.dot && (
                        <span className="absolute -right-0.5 -top-0.5 block h-2 w-2 rounded-full bg-[#1d9bf0]" />
                      )}
                    </div>
                    <span className="truncate text-dd-text dark:text-white">{item.label}</span>
                  </span>
                );
              })}
            </nav>
            <div className="relative shrink-0">
              <span className="group flex w-full items-center justify-start gap-4 rounded-full px-4 py-2.5 text-left text-[15px] font-bold text-dd-text dark:text-white">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  <MoreHorizontal className="h-6 w-6 stroke-[2.2] text-dd-text dark:text-white" />
                </div>
                <span className="text-dd-text dark:text-white">{t.nav.more}</span>
              </span>
            </div>
            <span className="mt-3 flex h-auto w-full items-center justify-center rounded-full bg-blue-500 px-5 py-3 text-center text-[16px] font-bold text-white shadow-md shadow-blue-500/20">
              {t.nav.post}
            </span>
          </div>
          <div className="relative mt-3 shrink-0 pt-3">
            <div className="group flex w-full min-w-0 items-center justify-start gap-3 rounded-full p-2.5 text-left">
              <AuthorAvatar
                username={DEMO_USER.username}
                size="md"
                className="!h-10 !w-10 shrink-0"
              />
              <div className="min-w-0 flex-1 font-sans">
                <p className="min-w-0 truncate text-[15px] font-bold leading-tight text-dd-text dark:text-white">
                  <ProfileName config={DEMO_USER.avatar_config}>{DEMO_USER.name}</ProfileName>
                </p>
                <p className="mt-0.5 truncate text-[14px] font-normal leading-tight text-dd-muted dark:text-neutral-500">
                  @{DEMO_USER.username}
                </p>
              </div>
              <MoreHorizontal className="h-5 w-5 shrink-0 text-dd-text dark:text-white" />
            </div>
          </div>
        </aside>
      )}

      {mobile && mobileHeader && (
        <MobileRefreshHeader>
          <span
            aria-label={isEnglish ? 'Open menu' : 'Abrir menu'}
            className="flex h-11 w-11 items-center justify-center rounded-full text-dd-text"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="justify-self-center">
            <HeaderRefreshLogo />
          </span>
          <span
            aria-label={t.nav.notifications}
            className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full"
          >
            <NotificationBellIcon unreadCount={0} active={false} />
          </span>
        </MobileRefreshHeader>
      )}

      <div
        className={
          bodyClassName ??
          'dd-platform-body mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start'
        }
      >
        <main
          data-testid="primary-column"
          className={
            mainClassName ??
            'dd-platform-main flex min-h-full w-full min-w-0 max-w-[720px] flex-grow flex-col border-dd-border/60 bg-dd-bg md:border-x xl:max-w-[820px] 2xl:max-w-[920px]'
          }
        >
          {children}
        </main>
        {!mobile && rail}
      </div>

      {mobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-dd-border bg-dd-bg/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:px-6">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === route;
            return (
              <span
                key={item.id}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center p-1.5',
                  active
                    ? 'font-black text-dd-text dark:text-white'
                    : 'text-dd-text/80 dark:text-white/80'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={cn(
                      'h-5.5 w-5.5 text-dd-text dark:text-white',
                      active && 'fill-current'
                    )}
                  />
                  {item.dot && (
                    <span className="absolute -right-0.5 -top-0.5 block h-1.5 w-1.5 rounded-full bg-[#1d9bf0]" />
                  )}
                </div>
              </span>
            );
          })}
          {route === 'feed' && (
            <span
              className="absolute -top-[4.5rem] right-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
              aria-label={isEnglish ? 'New post' : 'Nova postagem'}
            >
              <SquarePen className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
