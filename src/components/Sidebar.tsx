'use client';

import { HeaderRefreshLogo } from '@/components/HeaderRefreshLogo';
import { MobileRefreshHeader } from '@/components/MobileRefreshHeader';
import { BrandLogo } from '@/components/BrandLogo';
import { MobileNavigationDrawer } from '@/components/MobileNavigationDrawer';
import { ProfileName } from '@/components/profile/ProfileIdentity';

import { useState, useEffect, useCallback, type ComponentType } from 'react';
import {
  GamepadFilledIcon,
  CompassFilledIcon,
  HouseFilledIcon,
} from '@/components/nav/FilledNavIcons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus,
  Check,
  Trash2,
  Gamepad2,
  Swords,
  Trophy,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  X,
  Home,
  Compass,
  Bell,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Briefcase,
  Calendar,
  Code2,
  ShieldAlert,
  SquarePen,
  Menu,
  Award,
} from 'lucide-react';
import { NotificationBellIcon } from '@/components/motion/NotificationBellIcon';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { getCurrentUser, invalidateCurrentUser } from '@/lib/client/current-user';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { useSavedAccounts } from '@/hooks/useSavedAccounts';

import { PostComposerDialog, type ComposerQuote } from '@/components/composer/PostComposerDialog';
import {
  ReplyComposerDialog,
  OPEN_REPLY_EVENT,
  type ReplyTarget,
} from '@/components/composer/ReplyComposerDialog';

interface SidebarUser {
  id: string;
  name?: string | null;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  streak?: number;
  streak_days?: number;
  total_xp?: number;
  role?: 'USER' | 'EVALUATOR' | 'ADMIN' | 'RECRUITER';
}

interface SidebarProps {
  user: SidebarUser | null;
  showDivider?: boolean;
  hideMobileHeader?: boolean;
}

// Module-level cache to persist logged-in user across page navigation transitions
let inMemoryUser: SidebarUser | null = null;
let isInitiallyMounted = false;

if (typeof window !== 'undefined') {
  try {
    const cached = sessionStorage.getItem('stacklyst_user');
    if (cached) {
      inMemoryUser = JSON.parse(cached);
    }
  } catch {
    // ignore
  }
}

type SidebarFold = 1 | 2 | 3 | 4;
/**
 * Like X, a short window (or a zoomed-in page) folds the less used links into
 * "Mais" in stages instead of squeezing them. Tailwind needs literal classes, and
 * the heights match where the sidebar would otherwise start to scroll.
 */
const FOLD_HIDE: Record<SidebarFold, string> = {
  1: '[@media(max-height:810px)]:invisible [@media(max-height:810px)]:max-h-0 [@media(max-height:810px)]:!py-0 [@media(max-height:810px)]:opacity-0',
  2: '[@media(max-height:725px)]:invisible [@media(max-height:725px)]:max-h-0 [@media(max-height:725px)]:!py-0 [@media(max-height:725px)]:opacity-0',
  3: '[@media(max-height:680px)]:invisible [@media(max-height:680px)]:max-h-0 [@media(max-height:680px)]:!py-0 [@media(max-height:680px)]:opacity-0',
  4: '[@media(max-height:635px)]:invisible [@media(max-height:635px)]:max-h-0 [@media(max-height:635px)]:!py-0 [@media(max-height:635px)]:opacity-0',
};
const FOLD_SHOW_IN_MORE: Record<SidebarFold, string> = {
  1: 'hidden [@media(max-height:810px)]:flex',
  2: 'hidden [@media(max-height:725px)]:flex',
  3: 'hidden [@media(max-height:680px)]:flex',
  4: 'hidden [@media(max-height:635px)]:flex',
};

export function Sidebar({ user, showDivider = true, hideMobileHeader = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, isEnglish } = useLanguage();
  const { text } = useLocalizedText();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [managingAccounts, setManagingAccounts] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const shouldHideMobileHeader = hideMobileHeader || !['/feed', '/ranking'].includes(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  // Local state for user with sessionStorage cache fallback
  const [activeUser, setActiveUser] = useState<SidebarUser | null>(() => {
    // If we're on the server or performing the very first client hydration render,
    // we must return the user prop to match the server HTML representation exactly.
    if (typeof window === 'undefined' || !isInitiallyMounted) {
      return user;
    }
    // Otherwise, we are rendering client-side (e.g. client-side page transition),
    // so we can immediately return the user prop or the in-memory cache to be instant.
    return user || inMemoryUser;
  });

  const {
    savedAccount,
    busy: accountsBusy,
    switchAccount,
    addAccount,
    removeSavedAccount,
  } = useSavedAccounts(activeUser?.id);

  useEffect(() => {
    isInitiallyMounted = true;
    if (!activeUser) {
      try {
        const cached = sessionStorage.getItem('stacklyst_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          setActiveUser(parsed);
          inMemoryUser = parsed;
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: reads sessionStorage to hydrate state
  }, []);

  useEffect(() => {
    if (user) {
      setActiveUser((prev) => {
        const merged = { ...prev, ...user };
        // Preserve values if new user object lacks them
        if (prev) {
          if (user.total_xp === undefined) merged.total_xp = prev.total_xp;
          if (user.streak === undefined) merged.streak = prev.streak;
          if (user.streak_days === undefined) merged.streak_days = prev.streak_days;
        }
        return merged;
      });
      inMemoryUser = { ...inMemoryUser, ...user };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('stacklyst_user', JSON.stringify(inMemoryUser));
      }
    } else {
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('stacklyst_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setActiveUser(parsed);
            inMemoryUser = parsed;
          } catch {
            // ignore
          }
        }
      }
    }

    // Always fetch the full user profile from /api/users/me in background to keep data fresh and accurate
    getCurrentUser<SidebarUser>()
      .then((data) => {
        if (!data) throw new Error('Not logged in');
        setActiveUser(data);
        inMemoryUser = data;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('stacklyst_user', JSON.stringify(data));
        }
      })
      .catch(() => {
        if (!user) {
          setActiveUser(null);
          inMemoryUser = null;
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('stacklyst_user');
          }
        }
      });
  }, [user]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const refreshIdentity = () => {
      void getCurrentUser<SidebarUser>()
        .then((data) => {
          if (!data) return;
          setActiveUser(data);
          inMemoryUser = data;
          sessionStorage.setItem('stacklyst_user', JSON.stringify(data));
        })
        .catch(() => undefined);
    };
    window.addEventListener('stacklyst:profile-customization', refreshIdentity);
    return () => window.removeEventListener('stacklyst:profile-customization', refreshIdentity);
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch {
        // Silently ignore fetch failures (CSP, network, etc.)
      }
    };
    fetchUnreadCount();
    window.addEventListener('stacklyst:notifications-changed', fetchUnreadCount);
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('stacklyst:notifications-changed', fetchUnreadCount);
    };
  }, [activeUser, pathname]);

  const [composerQuote, setComposerQuote] = useState<ComposerQuote | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  useEffect(() => {
    if (!activeUser) return;
    const openReply = (event: Event) => {
      // Claim the event so the comment icon does not also navigate.
      event.preventDefault();
      setReplyTarget((event as CustomEvent<ReplyTarget>).detail);
    };
    window.addEventListener(OPEN_REPLY_EVENT, openReply);
    return () => window.removeEventListener(OPEN_REPLY_EVENT, openReply);
  }, [activeUser]);
  useEffect(() => {
    const openComposer = (event: Event) => {
      setComposerQuote((event as CustomEvent<{ quote?: ComposerQuote }>).detail?.quote ?? null);
      setModalOpen(true);
    };
    window.addEventListener('stacklyst:open-composer', openComposer);
    return () => window.removeEventListener('stacklyst:open-composer', openComposer);
  }, []);

  // Custom sidebar item states
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  // Space above the "Mais" button, so the menu never runs off the top of a short window.
  const [moreMenuMaxHeight, setMoreMenuMaxHeight] = useState<number | undefined>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreMenuOpen(false);
        setDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDropdownOpen, setMoreMenuOpen]);

  useEffect(() => {
    if (toast?.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const handleSignOut = async () => {
    if (savedAccount) {
      await switchAccount();
      try {
        await fetch('/api/auth/accounts', { method: 'DELETE' });
      } catch {
        // ignore
      }
      return;
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      inMemoryUser = null;
      invalidateCurrentUser();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('stacklyst_user');
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const navItems: Array<{
    id: string;
    label: string;
    href: string;
    icon: any;
    /** Filled variant with cut-out details, used instead of fill-current when active. */
    activeIcon?: ComponentType<{ className?: string }>;
    active?: boolean;
    badge?: 'dot';
    /** Folds into "Mais" when the window gets short, lowest number first, like X. */
    fold?: SidebarFold;
  }> = [
    {
      id: 'home',
      label: t.nav.home,
      href: '/feed',
      icon: Home,
      activeIcon: HouseFilledIcon,
      active: pathname === '/feed',
      badge: 'dot' as const,
    },
    {
      id: 'explore',
      label: isEnglish ? 'Explore' : 'Explorar',
      href: '/explore',
      icon: Compass,
      activeIcon: CompassFilledIcon,
      active: pathname.startsWith('/explore'),
    },
    {
      id: 'notifications',
      label: t.nav.notifications,
      href: '/notifications',
      icon: Bell,
      active: pathname === '/notifications',
    },
    {
      id: 'chat',
      label: t.nav.chat,
      href: '/messages',
      icon: MessageCircle,
      active: pathname.startsWith('/messages'),
    },
    {
      id: 'tracks',
      fold: 4,
      label: t.nav.tracks,
      href: '/trails',
      icon: Gamepad2,
      activeIcon: GamepadFilledIcon,
      active: pathname.startsWith('/trails'),
    },
    {
      id: 'duels',
      fold: 3,
      label: t.nav.duels,
      href: '/duels',
      icon: Swords,
      active: pathname.startsWith('/duels'),
    },
    {
      id: 'titles',
      fold: 1,
      label: isEnglish ? 'Titles' : 'Títulos',
      href: '/achievements',
      icon: Award,
      active: pathname.startsWith('/achievements'),
    },
    {
      id: 'ranking',
      fold: 1,
      label: t.nav.ranking,
      href: '/ranking',
      icon: Trophy,
      active: pathname.startsWith('/ranking') || pathname.startsWith('/leaderboard'),
    },
    {
      id: 'bookmarks',
      fold: 2,
      label: t.nav.bookmarks,
      href: '/bookmarks',
      icon: Bookmark,
      active: pathname.startsWith('/bookmarks'),
    },
    {
      id: 'profile',
      label: t.nav.profile,
      href: activeUser ? `/profile/${activeUser.username}` : '#',
      icon: UserIcon,
      active: activeUser ? pathname === `/profile/${activeUser.username}` : false,
    },
  ];

  const isAdmin = activeUser?.role === 'ADMIN';

  const moreMenuIsActive = [
    '/jobs',
    '/recruiter',
    '/events',
    '/evaluations',
    '/evaluators',
    ...(isAdmin ? ['/admin'] : []),
    '/settings',
  ].some((route) => pathname.startsWith(route));

  const mobileNavItems = [
    {
      id: 'home',
      label: t.nav.home,
      href: '/feed',
      icon: Home,
      activeIcon: HouseFilledIcon,
      active: pathname === '/feed',
      badge: 'dot' as const,
    },
    {
      id: 'explore',
      label: isEnglish ? 'Explore' : 'Explorar',
      href: '/explore',
      icon: Compass,
      activeIcon: CompassFilledIcon,
      active: pathname.startsWith('/explore'),
    },
    {
      id: 'tracks',
      label: t.nav.tracks,
      href: '/trails',
      icon: Gamepad2,
      activeIcon: GamepadFilledIcon,
      active: pathname.startsWith('/trails'),
    },
    {
      id: 'duels',
      label: t.nav.duels,
      href: '/duels',
      icon: Swords,
      active: pathname.startsWith('/duels'),
    },
    {
      id: 'profile',
      label: t.nav.profile,
      href: activeUser ? `/profile/${activeUser.username}` : '#',
      icon: UserIcon,
      active: activeUser ? pathname === `/profile/${activeUser.username}` : false,
    },
  ];

  // Item compartilhado da navegação inferior mobile.
  const renderMobileNavItem = (item: (typeof mobileNavItems)[number]) => {
    const Icon = item.active && item.activeIcon ? item.activeIcon : item.icon;

    const iconEl = (
      <div className="relative flex items-center justify-center">
        <Icon
          className={`w-5.5 h-5.5 text-dd-text dark:text-white ${item.active && !item.activeIcon ? 'fill-current' : ''}`}
        />
        {item.badge === 'dot' && (
          <span className="absolute -top-0.5 -right-0.5 block h-1.5 w-1.5 rounded-full bg-[#1d9bf0]" />
        )}
      </div>
    );

    const classes = `flex flex-col items-center justify-center p-1.5 transition-colors duration-150 ${
      item.active
        ? 'text-dd-text dark:text-white font-black'
        : 'text-dd-text/80 dark:text-white/80 hover:text-dd-text dark:hover:text-white'
    }`;

    return (
      <Link
        key={item.label}
        href={item.href}
        className={classes}
        aria-label={item.label}
        aria-current={item.active ? 'page' : undefined}
      >
        {iconEl}
      </Link>
    );
  };

  return (
    <>
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR (Twitter-like) */}
      {/* ========================================== */}
      <aside
        className={`dd-platform-sidebar z-40 hidden h-screen h-dvh min-h-0 w-[76px] shrink-0 select-none flex-col overflow-visible bg-dd-bg p-2 md:sticky md:top-0 md:flex xl:w-[250px] xl:p-4 2xl:w-[265px] ${
          showDivider ? 'border-r border-dd-border' : ''
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Logo */}
          <Link
            href="/feed"
            className="group flex w-full shrink-0 items-center justify-center px-2 py-1 xl:w-fit xl:justify-start xl:gap-2.5 xl:px-3"
          >
            <span className="xl:hidden">
              <BrandLogo size={27} wordmark={false} />
            </span>
            <span className="hidden xl:inline-flex">
              <BrandLogo size={27} />
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="mt-2 flex min-h-0 flex-initial flex-col gap-0.5 overflow-y-auto overscroll-contain pr-1 scrollbar-none xl:mt-3">
            {navItems.map((item) => {
              const Icon = item.active && item.activeIcon ? item.activeIcon : item.icon;

              const linkClasses = `group flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-3 text-left text-[20px] leading-6 xl:justify-start xl:gap-5 xl:px-4 xl:py-3 [@media(max-height:820px)]:py-2 xl:[@media(max-height:820px)]:py-2 ${
                item.active
                  ? 'font-black text-dd-text dark:text-white'
                  : 'font-bold text-dd-text dark:text-white'
              } max-h-16 overflow-hidden transition-[background-color,max-height,opacity,padding,visibility] duration-300 ease-out hover:bg-black/[0.06] motion-reduce:transition-none dark:hover:bg-white/10 ${
                item.fold ? FOLD_HIDE[item.fold] : ''
              }`;

              const iconEl = (
                <div className="relative flex items-center justify-center w-[26px] h-[26px] shrink-0">
                  {item.id === 'notifications' ? (
                    <NotificationBellIcon unreadCount={unreadCount} active={item.active} />
                  ) : (
                    <Icon
                      className={`w-[26px] h-[26px] text-dd-text dark:text-white stroke-[2.2] transition-transform group-hover:scale-105 duration-150 ${item.active && !item.activeIcon ? 'fill-current' : ''}`}
                    />
                  )}
                  {item.badge === 'dot' && (
                    <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-[#1d9bf0]" />
                  )}
                </div>
              );

              const contentEl = (
                <>
                  {iconEl}
                  <span className="hidden truncate text-dd-text dark:text-white xl:inline">
                    {item.label}
                  </span>
                </>
              );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={linkClasses}
                  aria-label={item.label}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {contentEl}
                </Link>
              );
            })}
          </nav>

          {/* "Mais" dropdown button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(event) => {
                setDropdownOpen(false);
                setMoreMenuMaxHeight(
                  Math.max(160, event.currentTarget.getBoundingClientRect().top - 24)
                );
                setMoreMenuOpen((open) => !open);
              }}
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
              className={`flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-3 text-left text-[20px] leading-6 xl:justify-start xl:gap-5 xl:px-4 xl:py-3 [@media(max-height:820px)]:py-2 xl:[@media(max-height:820px)]:py-2 ${
                moreMenuIsActive
                  ? 'font-black text-dd-text dark:text-white'
                  : 'font-bold text-dd-text dark:text-white'
              } transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/10 group`}
              aria-label={t.nav.more}
            >
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center">
                <MoreHorizontal className="h-[26px] w-[26px] text-dd-text dark:text-white stroke-[2.2] transition-transform duration-150 group-hover:scale-105" />
              </div>
              <span className="hidden text-dd-text dark:text-white xl:inline">{t.nav.more}</span>
            </button>

            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[110] cursor-default"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute bottom-full left-0 z-[120] mb-2 w-[290px] max-w-[calc(100vw-2rem)] origin-bottom-left overflow-y-auto max-h-[75vh] rounded-2xl border border-dd-border/70 bg-dd-surface p-2 font-sans shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-slide-up"
                  style={{ maxHeight: moreMenuMaxHeight }}
                >
                  {/* Links folded out of the sidebar on short windows land here first. */}
                  {navItems
                    .filter((item) => item.fold)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          role="menuitem"
                          aria-current={item.active ? 'page' : undefined}
                          className={`${FOLD_SHOW_IN_MORE[item.fold!]} items-center gap-4 rounded-xl px-4 py-3 text-[17px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none`}
                          onClick={() => setMoreMenuOpen(false)}
                        >
                          <Icon className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  <div
                    aria-hidden="true"
                    className="mx-3 my-1 hidden h-px bg-dd-border [@media(max-height:810px)]:block"
                  />
                  <Link
                    href="/jobs"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[17px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <Briefcase className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>{t.nav.jobsRecruiting}</span>
                  </Link>
                  <Link
                    href="/events"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[17px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <Calendar className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>{t.nav.eventsHackathons}</span>
                  </Link>
                  <Link
                    href="/evaluations"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[17px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <Code2 className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>{t.nav.codeEvaluation}</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex items-center gap-4 rounded-xl px-4 py-3 text-[17px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      <ShieldAlert className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                      <span>{t.nav.adminPanel}</span>
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[17px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <SettingsIcon className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>{t.nav.settings}</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Post action button */}
          {activeUser && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 flex h-12 w-12 self-center cursor-pointer items-center justify-center rounded-full bg-blue-500 p-0 text-center text-[17px] font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-150 hover:bg-blue-600 active:scale-[0.98] xl:h-[52px] xl:w-full xl:px-5"
              aria-label={t.nav.createPost}
            >
              <SquarePen className="h-6 w-6 xl:hidden" />
              <span className="hidden xl:inline">{t.nav.post}</span>
            </button>
          )}
        </div>

        {/* User profile dropdown widget */}
        {activeUser && (
          <div className="relative mt-2 shrink-0 pt-2 xl:mt-3 xl:pt-3">
            <button
              type="button"
              onClick={() => {
                setMoreMenuOpen(false);
                setDropdownOpen((open) => !open);
              }}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="group mx-auto flex w-fit min-w-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-left transition-colors duration-150 hover:bg-black/[0.06] focus-visible:bg-black/[0.06] focus-visible:outline-none dark:hover:bg-white/10 dark:focus-visible:bg-white/10 xl:w-full xl:justify-start xl:gap-3 xl:p-2.5"
              aria-label={t.nav.openProfileMenu}
            >
              <AuthorAvatar
                username={activeUser.username}
                avatar_url={activeUser.avatar_url}
                avatar_config={activeUser.avatar_config}
                size="md"
                className="!h-10 !w-10 shrink-0"
              />
              <div className="hidden min-w-0 flex-1 font-sans xl:block">
                <div className="flex min-w-0 items-center justify-between gap-1.5">
                  <p className="min-w-0 truncate text-[15px] font-bold leading-tight text-dd-text dark:text-white">
                    <ProfileName config={activeUser.avatar_config}>
                      {activeUser.name ||
                        (activeUser.avatar_config as any)?.name ||
                        (activeUser.avatar_config as any)?.displayName ||
                        activeUser.username}
                    </ProfileName>
                  </p>
                </div>
                <div className="mt-0.5 min-w-0">
                  <p className="truncate text-[14px] font-normal leading-tight text-dd-muted dark:text-neutral-500">
                    @{activeUser.username.toLowerCase()}
                  </p>
                </div>
              </div>
              <MoreHorizontal className="hidden h-5 w-5 shrink-0 text-dd-text dark:text-white xl:block" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-[110] cursor-default"
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute bottom-full left-0 z-[120] mb-3 w-[300px] max-w-[calc(100vw-2rem)] origin-bottom-left rounded-2xl border border-dd-border/70 bg-dd-surface p-2 font-sans shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-slide-up"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-10 h-3 w-3 rotate-45 border-b border-r border-dd-border/70 bg-dd-surface"
                  />
                  {/* Active Account */}
                  <div
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    <AuthorAvatar
                      username={activeUser.username}
                      avatar_url={activeUser.avatar_url}
                      avatar_config={activeUser.avatar_config}
                      size="md"
                      className="!h-10 !w-10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold leading-snug text-dd-text dark:text-white">
                        <ProfileName config={activeUser.avatar_config}>
                          {activeUser.name ||
                            (activeUser.avatar_config as any)?.name ||
                            activeUser.username}
                        </ProfileName>
                      </p>
                      <p className="truncate text-xs font-normal text-dd-muted dark:text-neutral-400">
                        @{activeUser.username}
                      </p>
                    </div>
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                      title={isEnglish ? 'Active account' : 'Conta ativa'}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Saved / Secondary Account (if exists) */}
                  {savedAccount && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setDropdownOpen(false);
                        await switchAccount();
                      }}
                      disabled={accountsBusy}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      <AuthorAvatar
                        username={savedAccount.username}
                        avatar_url={savedAccount.avatar_url}
                        avatar_config={savedAccount.avatar_config}
                        size="md"
                        className="!h-10 !w-10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold leading-snug text-dd-text dark:text-white">
                          <ProfileName config={savedAccount.avatar_config}>
                            {savedAccount.name || savedAccount.username}
                          </ProfileName>
                        </p>
                        <p className="truncate text-xs font-normal text-dd-muted dark:text-neutral-400">
                          @{savedAccount.username}
                        </p>
                      </div>
                      {typeof savedAccount.unreadCount === 'number' &&
                        savedAccount.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-black text-white">
                            {savedAccount.unreadCount > 99 ? '99+' : savedAccount.unreadCount}
                          </span>
                        )}
                    </button>
                  )}

                  <div className="my-1.5 h-px bg-dd-border/60" />

                  {/* Add an existing account */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      setDropdownOpen(false);
                      await addAccount();
                    }}
                    disabled={accountsBusy}
                    className="flex w-full items-center px-4 py-3 text-left text-[15px] font-bold text-dd-text transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl disabled:opacity-50"
                  >
                    {isEnglish ? 'Add an existing account' : 'Adicionar uma conta existente'}
                  </button>

                  {/* Manage accounts */}
                  {savedAccount &&
                    (managingAccounts ? (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          await removeSavedAccount();
                          setManagingAccounts(false);
                        }}
                        disabled={accountsBusy}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[14px] font-bold text-amber-500 transition-colors hover:bg-amber-500/10"
                      >
                        <span>
                          {isEnglish
                            ? `Remove @${savedAccount.username}`
                            : `Remover @${savedAccount.username}`}
                        </span>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => setManagingAccounts(true)}
                        className="flex w-full items-center px-4 py-3 text-left text-[15px] font-bold text-dd-text transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl"
                      >
                        {isEnglish ? 'Manage accounts' : 'Gerenciar contas'}
                      </button>
                    ))}

                  {/* Log out of @username */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-[15px] font-bold text-dd-text transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl focus-visible:outline-none"
                  >
                    <span>
                      {isEnglish
                        ? `Log out of @${activeUser.username}`
                        : `Sair de @${activeUser.username}`}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </aside>

      {/* ========================================== */}
      {/* MOBILE HEADER & BOTTOM NAV (Twitter mobile style) */}
      {/* ========================================== */}
      <div className="md:hidden flex flex-col w-full">
        {/* Cabeçalho compartilhado para o web responsivo. */}
        {!shouldHideMobileHeader && (
          <MobileRefreshHeader>
            <button
              type="button"
              aria-label={isEnglish ? 'Open menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-dd-text hover:bg-dd-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link
              href="/feed"
              aria-label="Stacklyst"
              className="justify-self-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <HeaderRefreshLogo />
            </Link>
            <Link
              href="/notifications"
              aria-label={t.nav.notifications}
              className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full hover:bg-dd-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <NotificationBellIcon unreadCount={unreadCount} active={false} />
            </Link>
          </MobileRefreshHeader>
        )}
        {mobileMenuOpen && (
          <MobileNavigationDrawer
            user={activeUser}
            onClose={closeMobileMenu}
            onSignOut={handleSignOut}
            onOpenDraft={() => {
              closeMobileMenu();
              setModalOpen(true);
            }}
          />
        )}

        <nav className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-dd-border bg-dd-bg/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:px-6">
          {mobileNavItems.map(renderMobileNavItem)}

          {activeUser && pathname === '/feed' && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="absolute -top-[4.5rem] right-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              aria-label={isEnglish ? 'New post' : 'Nova postagem'}
            >
              <SquarePen className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </nav>
      </div>

      {activeUser && (
        <PostComposerDialog
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setComposerQuote(null);
          }}
          user={activeUser}
          quote={composerQuote}
        />
      )}
      {activeUser && (
        <ReplyComposerDialog
          key={replyTarget?.id ?? 'closed'}
          target={replyTarget}
          onClose={() => setReplyTarget(null)}
          user={activeUser}
        />
      )}

      {/* ========================================== */}
      {/* PREMIUM UPGRADE MODAL */}
      {/* ========================================== */}
      {premiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-dd-bg/75 backdrop-blur-sm"
            onClick={() => setPremiumModalOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-modal-title"
            className="relative w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl shadow-2xl p-6 overflow-hidden z-10 animate-scale-up font-sans text-center space-y-6"
          >
            <button
              onClick={() => setPremiumModalOpen(false)}
              aria-label={text('Fechar modal', 'Close modal')}
              className="absolute top-4 right-4 p-1 rounded-md text-dd-muted hover:text-dd-text hover:bg-dd-surface transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5 animate-pulse" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0, 131, 254,0.15)] animate-pulse">
              👑
            </div>

            <div className="space-y-2">
              <h3 id="premium-modal-title" className="text-xl font-extrabold text-dd-text">
                {text('Upgrade para o Premium', 'Upgrade to Premium')}
              </h3>
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider bg-blue-500/10 py-1 px-3 rounded-full w-fit mx-auto animate-bounce">
                {text('40% de Desconto Ativo', '40% Discount Active')}
              </p>
              <p className="text-xs text-dd-muted leading-relaxed px-4">
                {text(
                  'Participe da rede global mais incr├¡vel de conversas que estão moldando o futuro.',
                  'Join the most incredible global network of conversations shaping the future.'
                )}
              </p>
            </div>

            <div className="border-t border-b border-dd-border py-4 text-left space-y-3.5 text-xs font-semibold text-dd-text">
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>
                  {text(
                    'Selo verificado premium no perfil',
                    'Premium verified badge on your profile'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>
                  {text(
                    'Recursos avançados para evoluir seu perfil técnico',
                    'Advanced features to grow your technical profile'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>
                  {text(
                    'Ganho de XP em dobro (+100% XP em respostas)',
                    'Double XP gain (+100% XP on answers)'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>
                  {text(
                    'Participação em Duelos e Quizzes exclusivos',
                    'Access to exclusive Duels and Quizzes'
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(
                  text(
                    'Assinatura premium processada com sucesso! Parabéns!',
                    'Premium subscription processed successfully! Congratulations!'
                  )
                );
                setPremiumModalOpen(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              {text('Atualizar Agora', 'Upgrade Now')}
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* FLOATING TOAST NOTIFICATION */}
      {/* ========================================== */}
      {toast && toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right rounded-xl border border-dd-border bg-dd-surface/90 backdrop-blur-xl p-4 shadow-2xl flex items-center gap-3 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm ring-1 ring-blue-500/20">
            i
          </div>
          <div>
            <p className="text-xs font-semibold text-dd-text">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
