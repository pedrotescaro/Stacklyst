'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from '@base-ui/react/dialog';
import {
  ArrowLeft,
  AtSign,
  Bell,
  Heart,
  LoaderCircle,
  MessageCircle,
  Sparkles,
  Trash2,
  UserRoundPlus,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileFlag, ProfileName, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { PostSkeletonList } from '@/components/motion/PostSkeleton';
import { getCurrentUser } from '@/lib/client/current-user';
import { getAuthorDisplayName, readProfileIdentity } from '@/lib/profile-style';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './notifications.module.css';

interface NotificationActor {
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
}

interface NotificationItem {
  id: string;
  type: string;
  source_type?: string;
  resource_type?: string | null;
  title: string;
  content: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  actor?: NotificationActor | null;
}

type NotificationTab = 'all' | 'likes' | 'replies' | 'followers' | 'mentions' | 'priority';
const notifyChanged = () => window.dispatchEvent(new Event('stacklyst:notifications-changed'));
const unreadBackgrounds = { light: '#f1f1f1', dark: '#0e0e0e' };

export default function NotificationsPage() {
  const router = useRouter();
  const { text, isEnglish } = useLocalizedText();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const deleteAllButton = useRef<HTMLButtonElement>(null);
  const deletingAll = deleting === 'all';

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    async function fetchPageData() {
      try {
        const [userData, response] = await Promise.all([
          getCurrentUser<any>(),
          fetch('/api/notifications', { signal: controller.signal, cache: 'no-store' }),
        ]);
        if (!userData) {
          router.replace('/login');
          return;
        }
        if (!active) return;
        setUser(userData);
        if (!response.ok) throw new Error('Notifications unavailable');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid notifications');
        if (active) setNotifications(data);
      } catch (error) {
        if (active && (error as Error).name !== 'AbortError') setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchPageData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [router, reload]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', { method: 'POST' });
      if (response.ok) {
        setNotifications((previous) => previous.map((item) => ({ ...item, is_read: true })));
        notifyChanged();
      }
    } catch {
      // Reading can be retried on the next visit without interrupting the list.
    }
  }, []);

  useEffect(() => {
    if (!notifications.some((item) => !item.is_read)) return;
    const timer = setTimeout(() => void markAllAsRead(), 3000);
    return () => clearTimeout(timer);
  }, [notifications, markAllAsRead]);

  async function deleteNotifications(id?: string) {
    if (deleting) return;
    setDeleting(id ?? 'all');
    setActionError(null);
    try {
      const response = await fetch(
        id ? `/api/notifications/${encodeURIComponent(id)}` : '/api/notifications',
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Deletion failed');
      setNotifications((previous) => (id ? previous.filter((item) => item.id !== id) : []));
      setAnnouncement(
        id
          ? text('Notificação excluída.', 'Notification deleted.')
          : text('Todas as notificações foram excluídas.', 'All notifications deleted.')
      );
      setConfirmDeleteAll(false);
      notifyChanged();
    } catch {
      setActionError(
        text(
          'Não foi possível excluir. Tente novamente.',
          'Could not delete notifications. Try again.'
        )
      );
    } finally {
      setDeleting(null);
    }
  }

  const tabs = [
    { id: 'all', label: text('Todas', 'All'), icon: Bell },
    { id: 'likes', label: text('Curtidas', 'Likes'), icon: Heart },
    { id: 'replies', label: text('Respostas', 'Replies'), icon: MessageCircle },
    { id: 'followers', label: text('Seguidores', 'Followers'), icon: UserRoundPlus },
    { id: 'mentions', label: text('Menções', 'Mentions'), icon: AtSign },
    { id: 'priority', label: text('Prioridade', 'Priority'), icon: Sparkles },
  ] as const;

  const filtered = notifications.filter((item) => {
    const type = item.source_type ?? item.type;
    if (activeTab === 'likes') return type === 'LIKE' || type === 'REACTION';
    if (activeTab === 'replies') return type === 'COMMENT' || type === 'ANSWER';
    if (activeTab === 'followers') return type === 'FOLLOW';
    if (activeTab === 'mentions') return type === 'MENTION';
    if (activeTab === 'priority')
      return ['ANSWER', 'DUEL', 'JOB_APPLICATION_UPDATE'].includes(item.type);
    return true;
  });

  function formatTimeAgo(dateString: string) {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 60000));
    if (minutes < 1) return text('Agora mesmo', 'Just now');
    if (minutes < 60) return text(`Há ${minutes} min`, `${minutes}m ago`);
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return text(`Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`, `${hours}h ago`);
    const days = Math.floor(hours / 24);
    return text(`Há ${days} ${days === 1 ? 'dia' : 'dias'}`, `${days}d ago`);
  }

  function actorAction(item: NotificationItem) {
    switch (item.source_type ?? item.type) {
      case 'FOLLOW':
        return text('seguiu você', 'followed you');
      case 'LIKE':
        return text('curtiu sua postagem', 'liked your post');
      case 'REACTION':
        return text('reagiu à sua postagem', 'reacted to your post');
      case 'COMMENT':
      case 'ANSWER':
        return item.resource_type === 'MESSAGE' || item.link === '/messages'
          ? text('enviou uma mensagem', 'sent you a message')
          : text('respondeu à sua postagem', 'replied to your post');
      case 'MENTION':
        return text('mencionou você', 'mentioned you');
      case 'DUEL_REQUEST':
      case 'DUEL_CHALLENGE':
        return text('desafiou você para um duelo', 'challenged you to a duel');
      case 'DUEL_ACCEPTED':
        return text('aceitou seu desafio', 'accepted your challenge');
      case 'DUEL_REJECTED':
        return text('recusou seu desafio', 'declined your challenge');
      default:
        return null;
    }
  }

  function notificationCopy(item: NotificationItem) {
    if (!isEnglish) return item;
    switch (item.type) {
      case 'LIKE':
        return { title: 'New like', content: 'Someone liked your post.' };
      case 'ANSWER':
        return item.resource_type === 'MESSAGE'
          ? { title: 'New message', content: 'You received a message in Chat.' }
          : { title: 'New reply', content: 'Someone replied to your post.' };
      case 'XP':
        return { title: 'XP achievement', content: 'You reached a new XP milestone.' };
      case 'DUEL':
        return { title: 'Duel update', content: 'A duel has a new update for you.' };
      default:
        return item;
    }
  }

  return (
    <div
      data-testid="notifications-shell"
      className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-blue-500/35 selection:text-white"
    >
      <Sidebar user={user} />
      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main
          data-testid="primary-column"
          className={`flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8 ${styles.main}`}
        >
          <header className={styles.header}>
            <div className={styles.toolbar}>
              <button
                type="button"
                aria-label={text('Voltar', 'Back')}
                className={styles.iconButton}
                onClick={() => {
                  if (window.history.length > 1) router.back();
                  else router.push('/feed');
                }}
              >
                <ArrowLeft size={24} aria-hidden="true" />
              </button>
              <h1>{text('Notificações', 'Notifications')}</h1>
              <button
                ref={deleteAllButton}
                type="button"
                className={styles.deleteAll}
                disabled={loading || !!deleting || notifications.length === 0}
                aria-label={text('Excluir todas as notificações', 'Delete all notifications')}
                title={text('Excluir todas as notificações', 'Delete all notifications')}
                onClick={() => {
                  setActionError(null);
                  setConfirmDeleteAll(true);
                }}
              >
                <Trash2 size={22} aria-hidden="true" />
              </button>
            </div>
            <nav
              className={styles.tabs}
              aria-label={text('Filtrar notificações', 'Filter notifications')}
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={styles.tab}
                  aria-pressed={activeTab === id}
                  onClick={(event) => {
                    setActiveTab(id);
                    event.currentTarget.scrollIntoView?.({
                      block: 'nearest',
                      inline: 'nearest',
                      behavior: 'auto',
                    });
                  }}
                >
                  <Icon size={19} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </nav>
          </header>

          {actionError && !confirmDeleteAll && (
            <p role="alert" className={styles.error}>
              {actionError}
            </p>
          )}
          <p className="sr-only" role="status">
            {announcement}
          </p>
          {loading ? (
            <div className="p-4">
              <PostSkeletonList count={4} />
            </div>
          ) : loadError ? (
            <div className={styles.empty} role="alert">
              <p>
                {text(
                  'Não foi possível carregar as notificações.',
                  'Could not load notifications.'
                )}
              </p>
              <button
                type="button"
                className={styles.retry}
                onClick={() => setReload((value) => value + 1)}
              >
                {text('Tentar novamente', 'Try again')}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <Bell size={32} aria-hidden="true" />
              <h2>{text('Nenhuma notificação por aqui', 'No notifications here')}</h2>
              <p>
                {activeTab === 'all'
                  ? text(
                      'Suas próximas interações aparecem aqui.',
                      'Your next interactions will appear here.'
                    )
                  : text(
                      'Não há notificações nesta categoria.',
                      'There are no notifications in this category.'
                    )}
              </p>
            </div>
          ) : (
            <ul
              className={styles.list}
              aria-label={text('Notificações recebidas', 'Received notifications')}
            >
              {filtered.map((item) => {
                const actor = item.actor;
                const identity = readProfileIdentity(actor?.avatar_config);
                const backgrounds = item.is_read ? undefined : unreadBackgrounds;
                const copy = notificationCopy(item);
                const action = actor ? actorAction(item) : null;
                const detail = (
                  <>
                    <p className={styles.summary}>
                      {actor && (
                        <>
                          <span className={styles.identity}>
                            <ProfileName
                              config={actor.avatar_config}
                              backgrounds={backgrounds}
                              className={styles.actorName}
                            >
                              {getAuthorDisplayName(actor)}
                            </ProfileName>
                            {identity.flags?.map((flag) => (
                              <ProfileFlag code={flag} key={flag} />
                            ))}
                            <ProfileTitle title={identity.title} />
                          </span>{' '}
                        </>
                      )}
                      {action ?? (actor ? copy.title : <strong>{copy.title}</strong>)}
                    </p>
                    {!action && <p className={styles.content}>{copy.content}</p>}
                    <time dateTime={item.created_at} className={styles.time}>
                      {formatTimeAgo(item.created_at)}
                    </time>
                  </>
                );
                return (
                  <li
                    key={item.id}
                    className={styles.item}
                    data-unread={!item.is_read || undefined}
                  >
                    {actor ? (
                      <Link
                        href={`/profile/${encodeURIComponent(actor.username)}`}
                        className={styles.avatarLink}
                        aria-label={text(
                          `Ver perfil de @${actor.username}`,
                          `View @${actor.username}'s profile`
                        )}
                      >
                        <AuthorAvatar {...actor} size="lg" className={styles.avatar} />
                      </Link>
                    ) : (
                      <span className={styles.systemAvatar}>
                        <Bell size={25} aria-hidden="true" />
                      </span>
                    )}
                    {item.link ? (
                      <Link href={item.link} className={styles.detail}>
                        {detail}
                      </Link>
                    ) : (
                      <div className={styles.detail}>{detail}</div>
                    )}
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.deleteItem}`}
                      disabled={!!deleting}
                      aria-label={text(
                        `Excluir notificação: ${item.title}${actor ? ` de @${actor.username}` : ''}`,
                        `Delete notification: ${item.title}${actor ? ` from @${actor.username}` : ''}`
                      )}
                      onClick={() => void deleteNotifications(item.id)}
                    >
                      {deleting === item.id ? (
                        <LoaderCircle
                          size={20}
                          className="animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 size={20} aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
        <FeedRightSidebar user={user} />
      </div>
      <Dialog.Root
        open={confirmDeleteAll}
        onOpenChange={(open) => {
          if (!deletingAll) setConfirmDeleteAll(open);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className={styles.backdrop} />
          <Dialog.Popup className={styles.dialog} finalFocus={deleteAllButton}>
            <Dialog.Title className={styles.dialogTitle}>
              {text('Excluir todas as notificações?', 'Delete all notifications?')}
            </Dialog.Title>
            <Dialog.Description className={styles.dialogDescription}>
              {text(
                'Isso apaga todas as notificações da sua conta, inclusive as de outras categorias. Essa ação não pode ser desfeita.',
                'This deletes every notification in your account, including other categories. This cannot be undone.'
              )}
            </Dialog.Description>
            {actionError && (
              <p className={styles.error} role="alert">
                {actionError}
              </p>
            )}
            <div className={styles.dialogActions}>
              <Dialog.Close className={styles.cancel} disabled={deletingAll}>
                {text('Cancelar', 'Cancel')}
              </Dialog.Close>
              <button
                type="button"
                className={styles.confirm}
                disabled={deletingAll}
                onClick={() => void deleteNotifications()}
              >
                {deletingAll
                  ? text('Excluindo…', 'Deleting…')
                  : text('Excluir todas', 'Delete all')}
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
