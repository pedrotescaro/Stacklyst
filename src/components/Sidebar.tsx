'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Swords,
  Trophy,
  User as UserIcon,
  Settings as SettingsIcon,
  Plus,
  LogOut,
  X,
  Home,
  Bell,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Briefcase,
  Calendar,
  Code2,
  ShieldAlert,
  SquarePen,
} from 'lucide-react';
import { PostComposerExtras } from '@/components/PostComposerExtras';
import type { NotionEditorRef } from '@/components/MarkdownEditor';
import { extractPostMetadata } from '@/lib/editor/extract-metadata';
import { ComposeModal } from '@/components/motion/ComposeModal';
import { NotificationBellIcon } from '@/components/motion/NotificationBellIcon';
import { PublishButton, PublishState } from '@/components/motion/PublishButton';
import { CharCounter } from '@/components/motion/CharCounter';
import { MentionDropdown } from '@/components/motion/MentionDropdown';
import { appendPostExtras, ReplyAudience, resetPostComposerExtras } from '@/lib/post-composer';
import { POST_CHAR_LIMIT } from '@/lib/motion';
import { ThemeLogo } from '@/components/ThemeLogo';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { getCurrentUser, invalidateCurrentUser } from '@/lib/client/current-user';

const MarkdownEditor = dynamic(
  () => import('@/components/MarkdownEditor').then((module) => module.MarkdownEditor),
  {
    ssr: false,
    loading: () => <div className="dd-skeleton h-32 w-full rounded-xl" />,
  }
);

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

export function Sidebar({ user, showDivider = true }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [activeUser, pathname]);

  // Post creation modal state
  const [postBody, setPostBody] = useState('');
  const [, setSubmitting] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [postError, setPostError] = useState<string | null>(null);
  const [postImage, setPostImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const postBodyEditorRef = useRef<NotionEditorRef>(null);
  const [replyAudience, setReplyAudience] = useState<ReplyAudience>('everyone');
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [postLocation, setPostLocation] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);

  // Custom sidebar item states
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

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

  // Mention Suggestions state
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);

  const handleBodyChange = async (val: string) => {
    setPostBody(val);
    const words = val.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@') && lastWord.length >= 1) {
      const q = lastWord.slice(1);
      try {
        const res = await fetch(`/api/users/search?q=${q}`);
        if (res.ok) {
          await res.json();
          setShowMentionSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleSelectMention = (username: string) => {
    const words = postBody.split(/\s+/);
    words[words.length - 1] = `@${username} `;
    setPostBody(words.join(' '));
    setShowMentionSuggestions(false);
  };

  const resetCompose = () => {
    setPostBody('');
    setPostImage('');
    setShowMentionSuggestions(false);
    setPostError(null);
    const resetExtras = resetPostComposerExtras();
    setReplyAudience(resetExtras.replyAudience);
    setScheduledAt(resetExtras.scheduledAt);
    setPostLocation(resetExtras.location);
    setIsSensitive(resetExtras.isSensitive);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim()) return;

    if (postBody.trim().length < 10) {
      setPostError('O conteúdo deve ter pelo menos 10 caracteres');
      return;
    }

    setSubmitting(true);
    setPublishState('submitting');
    setPostError(null);

    const postMetadata = extractPostMetadata(postBody);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: appendPostExtras(postBody, {
            location: postLocation,
            scheduledAt,
            replyAudience,
            isSensitive,
          }),
          language: postMetadata.language,
          code_snippet: null,
          image_url: postImage || null,
        }),
      });

      if (res.ok) {
        resetCompose();
        setPublishState('success');
        setTimeout(() => {
          setPublishState('idle');
          setModalOpen(false);
        }, 1500);
        router.refresh();
        if (pathname !== '/feed') {
          router.push('/feed');
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao postar');
      }
    } catch (err: any) {
      console.error('Error creating post from sidebar:', err);
      setPostError(err.message || 'Algo deu errado ao postar. Seu texto foi salvo como rascunho.');
      setPublishState('idle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setPostError(null);
  };

  const hasDraft = Boolean(postBody.trim() || postImage);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPostImage(data.url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const navItems: Array<{
    label: string;
    href: string;
    icon: any;
    active?: boolean;
    badge?: 'dot';
  }> = [
    {
      label: 'Página Inicial',
      href: '/feed',
      icon: Home,
      active: pathname === '/feed',
      badge: 'dot' as const,
    },
    {
      label: 'Trilhas',
      href: '/trails',
      icon: BookOpen,
      active: pathname.startsWith('/trails'),
    },
    {
      label: 'Notificações',
      href: '/notifications',
      icon: Bell,
      active: pathname === '/notifications',
    },
    {
      label: 'Ranking',
      href: '/ranking',
      icon: Trophy,
      active: pathname.startsWith('/ranking') || pathname.startsWith('/leaderboard'),
    },
    {
      label: 'Duelos',
      href: '/duels',
      icon: Swords,
      active: pathname.startsWith('/duels'),
    },
    {
      label: 'Bate-papo',
      href: '/messages',
      icon: MessageCircle,
      active: pathname.startsWith('/messages'),
    },
    {
      label: 'Itens salvos',
      href: '/bookmarks',
      icon: Bookmark,
      active: pathname.startsWith('/bookmarks'),
    },
    {
      label: 'Perfil',
      href: activeUser ? `/profile/${activeUser.username}` : '#',
      icon: UserIcon,
      active: activeUser ? pathname === `/profile/${activeUser.username}` : false,
    },
  ];

  const isAdmin = activeUser?.role === 'ADMIN';

  const moreMenuIsActive = [
    '/jobs',
    '/recruiter',
    // '/guilds',
    '/events',
    '/evaluations',
    '/evaluators',
    ...(isAdmin ? ['/admin'] : []),
    '/settings',
  ].some((route) => pathname.startsWith(route));

  const mobileNavItems = [
    {
      label: 'Página Inicial',
      href: '/feed',
      icon: Home,
      active: pathname === '/feed',
      badge: 'dot' as const,
    },
    {
      label: 'Trilhas',
      href: '/trails',
      icon: BookOpen,
      active: pathname.startsWith('/trails'),
    },
    {
      label: 'Notificações',
      href: '/notifications',
      icon: Bell,
      active: pathname === '/notifications',
    },
    {
      label: 'Perfil',
      href: activeUser ? `/profile/${activeUser.username}` : '#',
      icon: UserIcon,
      active: activeUser ? pathname === `/profile/${activeUser.username}` : false,
    },
  ];

  // Item compartilhado da navegação inferior mobile.
  const renderMobileNavItem = (item: (typeof mobileNavItems)[number]) => {
    const Icon = item.icon;

    const iconEl = (
      <div className="relative flex items-center justify-center">
        {item.label === 'Notificações' ? (
          <NotificationBellIcon unreadCount={unreadCount} active={item.active} />
        ) : (
          <>
            <Icon
              className={`w-5.5 h-5.5 text-dd-text dark:text-white ${item.active ? 'fill-current' : ''}`}
            />
            {item.badge === 'dot' && (
              <span className="absolute -top-0.5 -right-0.5 block h-1.5 w-1.5 rounded-full bg-[#1d9bf0]" />
            )}
          </>
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
        className={`z-40 hidden h-screen h-dvh min-h-0 w-[76px] shrink-0 select-none flex-col overflow-visible bg-dd-bg p-2 md:sticky md:top-0 md:flex xl:w-[250px] xl:p-4 2xl:w-[265px] ${
          showDivider ? 'border-r border-dd-border' : ''
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Logo */}
          <Link
            href="/feed"
            className="group flex w-full shrink-0 items-center justify-center px-2 py-1 xl:w-fit xl:justify-start xl:gap-2.5 xl:px-3"
            aria-label="Stacklyst"
          >
            <ThemeLogo
              alt="Stacklyst Logo"
              width={28}
              height={28}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="hidden text-dd-text dark:text-white font-black text-xl tracking-tight xl:inline">
              Stacklyst
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain pr-1 scrollbar-none xl:mt-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              const linkClasses = `group flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-3 text-left text-[15px] xl:justify-start xl:gap-4 xl:px-4 xl:py-2.5 ${
                item.active
                  ? 'font-black text-dd-text dark:text-white'
                  : 'font-bold text-dd-text dark:text-white'
              } transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/10`;

              const iconEl = (
                <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                  {item.label === 'Notificações' ? (
                    <NotificationBellIcon unreadCount={unreadCount} active={item.active} />
                  ) : (
                    <Icon
                      className={`w-6 h-6 text-dd-text dark:text-white stroke-[2.2] transition-transform group-hover:scale-105 duration-150 ${item.active ? 'fill-current' : ''}`}
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
              onClick={() => {
                setDropdownOpen(false);
                setMoreMenuOpen((open) => !open);
              }}
              aria-expanded={moreMenuOpen}
              aria-haspopup="menu"
              className={`flex w-full cursor-pointer items-center justify-center rounded-full px-2 py-3 text-left text-[15px] xl:justify-start xl:gap-4 xl:px-4 xl:py-2.5 ${
                moreMenuIsActive
                  ? 'font-black text-dd-text dark:text-white'
                  : 'font-bold text-dd-text dark:text-white'
              } transition-colors duration-150 hover:bg-black/[0.06] dark:hover:bg-white/10 group`}
              aria-label="Mais"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <MoreHorizontal className="h-6 w-6 text-dd-text dark:text-white stroke-[2.2] transition-transform duration-150 group-hover:scale-105" />
              </div>
              <span className="hidden text-dd-text dark:text-white xl:inline">Mais</span>
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
                >
                  <Link
                    href="/jobs"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <Briefcase className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>Vagas & Recrutamento</span>
                  </Link>
                  <Link
                    href="/events"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <Calendar className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>Eventos & Hackathons</span>
                  </Link>
                  <Link
                    href="/evaluations"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <Code2 className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>Avaliação de Código</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      <ShieldAlert className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                      <span>Painel Administrativo</span>
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <SettingsIcon className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>Configurações</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Post action button */}
          {activeUser && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 flex h-12 w-12 self-center cursor-pointer items-center justify-center rounded-full bg-blue-500 p-0 text-center text-[16px] font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-150 hover:bg-blue-600 active:scale-[0.98] xl:h-auto xl:w-full xl:px-5 xl:py-3"
              aria-label="Criar publicação"
            >
              <SquarePen className="h-6 w-6 xl:hidden" />
              <span className="hidden xl:inline">Postar</span>
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
              aria-label="Abrir menu do perfil"
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
                    {activeUser.name ||
                      (activeUser.avatar_config as any)?.name ||
                      (activeUser.avatar_config as any)?.displayName ||
                      activeUser.username}
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
                  className="absolute bottom-full left-0 z-[120] mb-2 w-[290px] max-w-[calc(100vw-2rem)] origin-bottom-left overflow-hidden rounded-2xl border border-dd-border/70 bg-dd-surface p-2 font-sans shadow-[0_12px_40px_rgba(0,0,0,0.4)] animate-slide-up"
                >
                  <Link
                    href={`/profile/${activeUser.username}`}
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <SettingsIcon className="h-5.5 w-5.5 shrink-0 text-dd-text" />
                    <span>Configurações</span>
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] font-extrabold leading-none text-red-500 transition-colors hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none"
                  >
                    <LogOut className="h-5.5 w-5.5 shrink-0" />
                    <span>Sair da Conta</span>
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
        {/* Top Header */}
        <header className="sticky top-0 z-[100] flex w-full items-center justify-between border-b border-dd-border bg-dd-bg/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
          <Link href="/feed" className="flex items-center gap-2 group">
            <ThemeLogo alt="Stacklyst Logo" width={24} height={24} className="object-contain" />
            <span className="text-dd-text font-extrabold text-base tracking-tight">Stacklyst</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {activeUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setDropdownOpen((open) => !open);
                  }}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center focus:outline-none"
                >
                  <AuthorAvatar
                    username={activeUser.username}
                    avatar_url={activeUser.avatar_url}
                    avatar_config={activeUser.avatar_config}
                    size="sm"
                    className="!h-7 !w-7"
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setDropdownOpen(false)} />
                    <div
                      role="menu"
                      className="absolute right-0 z-[120] mt-2 w-60 overflow-hidden rounded-2xl border border-dd-border/70 bg-dd-surface p-2 font-sans shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                    >
                      <Link
                        href={`/profile/${activeUser.username}`}
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Meu Perfil</span>
                      </Link>
                      <Link
                        href="/ranking"
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Trophy className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Ranking</span>
                      </Link>
                      <Link
                        href="/jobs"
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Briefcase className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Vagas</span>
                      </Link>
                      <Link
                        href="/events"
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Calendar className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Eventos</span>
                      </Link>
                      <Link
                        href="/duels"
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Swords className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Duelos</span>
                      </Link>
                      <Link
                        href="/evaluations"
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Code2 className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Avaliação de Código</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          role="menuitem"
                          className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <ShieldAlert className="h-5 w-5 shrink-0 text-dd-text" />
                          <span>Painel Admin</span>
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        role="menuitem"
                        className="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-extrabold leading-none text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <SettingsIcon className="h-5 w-5 shrink-0 text-dd-text" />
                        <span>Configurações</span>
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-3 text-left text-sm font-extrabold leading-none text-red-500 transition-colors hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <nav className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t border-dd-border bg-dd-bg/90 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md sm:px-6">
          {mobileNavItems.map(renderMobileNavItem)}

          {/* O feed já possui um compositor próprio; mantém o atalho flutuante para a raiz. */}
          {activeUser && pathname === '/' && (
            <button
              onClick={() => setModalOpen(true)}
              className="absolute -top-14 right-4 bg-blue-500 text-white rounded-full p-3.5 shadow-lg shadow-blue-500/25 active:scale-95 transition-all w-12 h-12 flex items-center justify-center cursor-pointer"
              aria-label="Postar"
            >
              <Plus className="w-5.5 h-5.5" />
            </button>
          )}
        </nav>
      </div>

      {/* GLOBAL TWEET/POST MODAL */}
      <ComposeModal
        open={modalOpen}
        onClose={handleCloseModal}
        hasDraft={hasDraft}
        onDiscard={resetCompose}
        headerExtra={
          <button
            type="button"
            onClick={() => showToast('Rascunhos salvos localmente!')}
            className="text-xs font-black text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
          >
            Rascunhos
          </button>
        }
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex gap-3">
            {/* Avatar */}
            {activeUser && (
              <AuthorAvatar
                username={activeUser.username}
                avatar_url={activeUser.avatar_url}
                avatar_config={activeUser.avatar_config}
                size="lg"
              />
            )}

            {/* Textarea Area */}
            <div className="flex-grow min-w-0 space-y-3 relative">
              <MarkdownEditor
                ref={postBodyEditorRef}
                value={postBody}
                onChange={handleBodyChange}
                maxLength={POST_CHAR_LIMIT}
                minHeight="8rem"
                placeholder="O que você está construindo hoje? Digite / para inserir blocos..."
              />
              <div className="flex justify-end">
                <CharCounter text={postBody} limit={POST_CHAR_LIMIT} />
              </div>

              {/* Mention Suggestions Popup */}
              <MentionDropdown
                query={postBody.split(/\s+/).at(-1)?.replace(/^@/, '') || ''}
                visible={showMentionSuggestions}
                onSelect={handleSelectMention}
                onClose={() => {
                  setShowMentionSuggestions(false);
                }}
              />

              {postImage && (
                <div className="relative rounded-xl overflow-hidden border border-dd-border max-h-40">
                  <Image
                    src={postImage}
                    alt="Preview"
                    width={600}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPostImage('')}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <PostComposerExtras
                section="meta"
                postBody={postBody}
                setPostBody={setPostBody}
                editorRef={postBodyEditorRef}
                replyAudience={replyAudience}
                setReplyAudience={setReplyAudience}
                scheduledAt={scheduledAt}
                setScheduledAt={setScheduledAt}
                location={postLocation}
                setLocation={setPostLocation}
                isSensitive={isSensitive}
                setIsSensitive={setIsSensitive}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dd-border/50 pt-3 flex items-center justify-between">
            {/* Left tools (Icons) */}
            <div className="flex items-center gap-2 text-blue-500">
              {/* Image input trigger */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="sidebar-tweet-image-upload"
              />
              <label
                htmlFor="sidebar-tweet-image-upload"
                className="p-2.5 hover:bg-blue-500/10 rounded-full transition-colors cursor-pointer"
                title="Adicionar imagem"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-none stroke-current"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </label>

              <PostComposerExtras
                section="tools"
                postBody={postBody}
                setPostBody={setPostBody}
                editorRef={postBodyEditorRef}
                replyAudience={replyAudience}
                setReplyAudience={setReplyAudience}
                scheduledAt={scheduledAt}
                setScheduledAt={setScheduledAt}
                location={postLocation}
                setLocation={setPostLocation}
                isSensitive={isSensitive}
                setIsSensitive={setIsSensitive}
              />
            </div>

            {/* Right submit button */}
            <PublishButton
              disabled={!postBody.trim() || uploadingImage || postBody.length >= POST_CHAR_LIMIT}
              state={publishState}
              xpReward={extractPostMetadata(postBody).language ? 10 : 5}
            />
          </div>
          {postError && <p className="text-[11px] text-red-400 font-medium">{postError}</p>}
        </form>
      </ComposeModal>

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
              aria-label="Fechar modal"
              className="absolute top-4 right-4 p-1 rounded-md text-dd-muted hover:text-dd-text hover:bg-dd-surface transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5 animate-pulse" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0, 131, 254,0.15)] animate-pulse">
              👑
            </div>

            <div className="space-y-2">
              <h3 id="premium-modal-title" className="text-xl font-extrabold text-dd-text">
                Upgrade para o Premium
              </h3>
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider bg-blue-500/10 py-1 px-3 rounded-full w-fit mx-auto animate-bounce">
                40% de Desconto Ativo
              </p>
              <p className="text-xs text-dd-muted leading-relaxed px-4">
                Participe da rede global mais incr├¡vel de conversas que estão moldando o futuro.
              </p>
            </div>

            <div className="border-t border-b border-dd-border py-4 text-left space-y-3.5 text-xs font-semibold text-dd-text">
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>Selo verificado premium no perfil</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>Recursos avançados para evoluir seu perfil técnico</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>Ganho de XP em dobro (+100% XP em respostas)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span>
                <span>Participação em Duelos e Quizzes exclusivos</span>
              </div>
            </div>

            <button
              onClick={() => {
                showToast('Assinatura premium processada com sucesso! Parabéns!');
                setPremiumModalOpen(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              Atualizar Agora
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
