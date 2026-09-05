'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { PostSkeletonList } from '@/components/motion/PostSkeleton';
import { EmptyState } from '@/components/motion/EmptyState';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { getCurrentUser } from '@/lib/client/current-user';
import { Bell, MessageCircle, Sparkles, Swords, Settings, Heart, X } from 'lucide-react';
import Link from 'next/link';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface UpvoterUser {
  username: string;
  avatar_url: string | null;
}

interface NotificationItem {
  id: string;
  user_id: string;
  type: 'ANSWER' | 'XP' | 'DUEL' | 'SYSTEM' | 'LIKE' | string;
  title: string;
  content: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  postTitle?: string;
  postBody?: string;
  upvoters?: UpvoterUser[];
  actor?: { username: string } | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isEnglish, text } = useLocalizedText();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tudo' | 'prioridade' | 'mencoes'>('tudo');
  const [showPushBanner, setShowPushBanner] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchPageData = async () => {
      try {
        const [userData, resNotifications] = await Promise.all([
          getCurrentUser<any>(),
          fetch('/api/notifications', { signal: controller.signal }),
        ]);

        if (!userData) {
          router.replace('/login');
          return;
        }

        if (!active) return;

        let notificationData: NotificationItem[] = [];
        if (resNotifications.ok) {
          try {
            notificationData = await resNotifications.json();
          } catch {
            notificationData = [];
          }
        }

        if (!active) return;
        setUser(userData);
        setNotifications(notificationData);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Error fetching notifications page data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPageData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [router]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (notifications.every((n) => n.is_read)) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        router.refresh();
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  }, [notifications, router]);

  useEffect(() => {
    if (notifications.length > 0 && notifications.some((n) => !n.is_read)) {
      const timer = setTimeout(() => {
        handleMarkAllAsRead();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications, handleMarkAllAsRead]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return text('Agora mesmo', 'Just now');
    if (diffMins < 60) return text(`Há ${diffMins} min`, `${diffMins}m ago`);
    if (diffHours < 24) return text(`Há ${diffHours} h`, `${diffHours}h ago`);
    return text(`Há ${diffDays} dias`, `${diffDays}d ago`);
  };

  const localizedNotification = (item: NotificationItem) => {
    if (!isEnglish) return { title: item.title, content: item.content };
    const actor = item.actor ? `@${item.actor.username}` : 'Someone';
    switch (item.type) {
      case 'LIKE':
        return { title: 'New upvote', content: `${actor} upvoted your post.` };
      case 'ANSWER':
        return item.link === '/messages'
          ? { title: 'New message', content: `${actor} sent you a message in Chat.` }
          : { title: 'New reply', content: `${actor} replied to your question.` };
      case 'XP':
        return { title: 'XP achievement', content: 'You reached a new XP milestone.' };
      case 'DUEL':
        return { title: 'Duel update', content: 'A duel has a new update for you.' };
      default:
        return { title: 'Stacklyst notification', content: 'You received a notification.' };
    }
  };

  // Filter notifications based on tab
  const getFilteredNotifications = () => {
    if (activeTab === 'mencoes') {
      // Return notifications that reference @username
      return notifications.filter((n) => n.content.includes(`@${user?.username}`));
    }
    if (activeTab === 'prioridade') {
      // Prioritize ANSWER and DUEL types
      return notifications.filter((n) => n.type === 'ANSWER' || n.type === 'DUEL');
    }
    return notifications; // 'tudo'
  };

  const getNotificationIcon = (type: string) => {
    const base = 'w-9 h-9 rounded-full flex items-center justify-center shrink-0';
    switch (type) {
      case 'LIKE':
        return (
          <div className={cn(base, 'text-dd-amber bg-dd-amber/10')}>
            <Heart className="w-4 h-4 fill-current" />
          </div>
        );
      case 'ANSWER':
        return (
          <div className={cn(base, 'text-dd-blue bg-dd-blue/10')}>
            <MessageCircle className="w-4 h-4" />
          </div>
        );
      case 'XP':
        return (
          <div className={cn(base, 'text-dd-green bg-dd-green/10')}>
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'DUEL':
        return (
          <div className={cn(base, 'text-blue-500 bg-blue-500/10')}>
            <Swords className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className={cn(base, 'text-dd-purple bg-dd-purple/10')}>
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const filteredNotifs = getFilteredNotifications();

  return (
    <div
      data-testid="notifications-shell"
      className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-blue-500/35 selection:text-white"
    >
      <Sidebar user={user} />

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main
          data-testid="primary-column"
          className="flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8"
        >
          {/* Header (Matching image 3 style) */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md border-b border-dd-border/60">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-lg font-black tracking-tight text-dd-text">
                {text('Notificações', 'Notifications')}
              </h1>
              <button
                aria-label={text('Configurações de notificações', 'Notification settings')}
                className="p-2 text-dd-text hover:bg-dd-surface/60 rounded-full transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs (Tudo, Prioridade, Menções) */}
            <div className="relative flex border-t border-dd-border/40 select-none">
              {(['tudo', 'prioridade', 'mencoes'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3.5 text-xs font-bold text-center relative hover:bg-dd-surface/30 transition-colors cursor-pointer"
                >
                  <span
                    className={
                      activeTab === tab ? 'text-dd-text font-black' : 'text-dd-muted font-bold'
                    }
                  >
                    {tab === 'tudo'
                      ? text('Tudo', 'All')
                      : tab === 'prioridade'
                        ? text('Prioridade', 'Priority')
                        : text('Menções', 'Mentions')}
                  </span>
                </button>
              ))}
              <div
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute bottom-0 left-0 z-20 h-1 w-1/3 flex items-center justify-center transition-transform duration-200 ease-out motion-reduce:transition-none',
                  activeTab === 'tudo' && 'translate-x-0',
                  activeTab === 'prioridade' && 'translate-x-full',
                  activeTab === 'mencoes' && 'translate-x-[200%]'
                )}
              >
                <span className="w-16 h-1 rounded-full bg-blue-500 shadow-sm" />
              </div>
            </div>
          </div>

          {/* List of Notifications */}
          <motion.div
            className="divide-y divide-dd-border/50"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
          >
            {loading ? (
              <div className="p-4">
                <PostSkeletonList count={4} />
              </div>
            ) : filteredNotifs.length === 0 ? (
              <EmptyState type="notifications" className="p-12" />
            ) : (
              filteredNotifs.map((item) => {
                if (item.type === 'LIKE' && item.upvoters && item.upvoters.length > 0) {
                  // Aggregated Likes layout
                  const firstUpvoter = item.upvoters[0];
                  const otherCount = item.upvoters.length - 1;

                  return (
                    <motion.div
                      key={item.id}
                      variants={staggerItemVariants}
                      className="p-4 flex gap-3 hover:bg-dd-surface/20 transition-colors"
                    >
                      <div className="shrink-0 pt-0.5">{getNotificationIcon('LIKE')}</div>

                      {/* Right: Aggregated Details */}
                      <div className="flex-1 space-y-2">
                        {/* Avatar stack */}
                        <div className="flex items-center -space-x-2.5 overflow-hidden">
                          {item.upvoters.slice(0, 10).map((voter, idx) =>
                            voter.avatar_url ? (
                              <Image
                                key={idx}
                                src={voter.avatar_url}
                                alt={voter.username}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full border-2 border-black object-cover shrink-0"
                              />
                            ) : (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full border-2 border-black bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0"
                              >
                                {voter.username.slice(0, 2).toUpperCase()}
                              </div>
                            )
                          )}
                        </div>

                        {/* Text */}
                        <div className="text-xs leading-relaxed text-dd-text">
                          <span className="font-extrabold">{firstUpvoter.username}</span>
                          {otherCount > 0 && (
                            <>
                              {' '}
                              {text('e mais', 'and')}{' '}
                              <span className="font-extrabold">{otherCount}</span>{' '}
                              {text('', 'more')}
                            </>
                          )}{' '}
                          {text('curtiram seu post', 'liked your post')}{' '}
                          <span className="text-dd-muted font-normal">
                            · {formatTimeAgo(item.created_at)}
                          </span>
                        </div>

                        {/* Snippet */}
                        {item.postBody && (
                          <Link
                            href={item.link || '#'}
                            className="block text-xs text-dd-muted leading-relaxed hover:text-dd-text transition-colors line-clamp-2"
                          >
                            {item.postBody}
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                }

                // Standard notification layout (for XP, Answer, Duel, System)
                const localized = localizedNotification(item);
                return (
                  <motion.div
                    key={item.id}
                    variants={staggerItemVariants}
                    className="p-4 flex gap-3 hover:bg-dd-surface/20 transition-colors"
                  >
                    <div className="shrink-0 pt-0.5">{getNotificationIcon(item.type)}</div>

                    {/* Right text details */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-dd-text">{localized.title}</p>
                        <span className="text-[9.5px] text-dd-muted font-medium shrink-0">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-dd-muted leading-relaxed">{localized.content}</p>

                      {item.link && (
                        <div className="pt-1.5">
                          <Link
                            href={item.link}
                            className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-0.5"
                          >
                            {text('Ir para atividade', 'View activity')} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Push Notifications Banner (At bottom of viewport, matching image 3) */}
          {showPushBanner && (
            <div className="mx-4 mt-6 p-4 rounded-xl border border-dd-border bg-dd-surface/80 backdrop-blur-md relative space-y-2.5">
              <button
                onClick={() => setShowPushBanner(false)}
                className="absolute top-3 right-3 text-dd-muted hover:text-dd-text p-0.5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="text-sm font-black text-dd-text">
                {text('Notificações por push', 'Push notifications')}
              </h4>
              <p className="text-xs text-dd-muted leading-relaxed max-w-md">
                {text(
                  'Ative as notificações por push para não perder nunca o que está acontecendo no Stacklyst.',
                  'Turn on push notifications to keep up with everything happening on Stacklyst.'
                )}
              </p>
              <button
                onClick={() => {
                  alert(
                    text(
                      'Notificações por push ativadas com sucesso!',
                      'Push notifications enabled!'
                    )
                  );
                  setShowPushBanner(false);
                }}
                className="bg-white hover:bg-slate-100 text-black text-xs font-black py-2 px-4 rounded-full transition-all"
              >
                {text('Ativar notificações', 'Enable notifications')}
              </button>
            </div>
          )}
        </main>
        <FeedRightSidebar user={user} />
      </div>
    </div>
  );
}
