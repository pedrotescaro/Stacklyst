'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Code2, Image as ImageIcon, Search, X } from 'lucide-react';
import { PlatformPageShell } from '@/components/PlatformPageShell';
import { PostCard } from '@/components/PostCard';
import { ProfileReplyThread } from '@/components/ProfileReplyThread';
import { parseReplyMedia } from '@/lib/reply-media';
import { ANSWER_BOOKMARK_CHANGED, type AnswerBookmarkChange } from '@/lib/client/post-bookmarks';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './BookmarksContent.module.css';

type SavedPost = ComponentProps<typeof PostCard>['post'] & { saved_at?: string };
/** A saved reply, shaped like the profile's reply items. */
export interface SavedReply {
  id: string;
  body: string;
  code_snippet?: string | null;
  saved_at?: string;
  author: { username: string; name?: string | null };
  [key: string]: unknown;
}
type SavedItem = { kind: 'post'; item: SavedPost } | { kind: 'reply'; item: SavedReply };
type Filter = 'all' | 'code' | 'media';
interface BookmarksContentProps {
  user: NonNullable<ComponentProps<typeof PlatformPageShell>['user']> & {
    total_xp: number;
    last_active_at?: string | null;
    trails?: Array<{ id: string; language: string; xp: number; level: number }>;
  };
  initialPosts: SavedPost[];
  initialReplies?: SavedReply[];
}

function hasCode(post: SavedPost) {
  return Boolean(post.code_snippet?.trim() || /(^|\n)\s{0,3}(`{3,}|~{3,})/.test(post.body));
}

function hasMedia(post: SavedPost) {
  return Boolean(post.image_url || post.attachments?.length || post.music);
}

function replyHasCode(reply: SavedReply) {
  return Boolean(reply.code_snippet?.trim() || /(^|\n)\s{0,3}(`{3,}|~{3,})/.test(reply.body));
}

function replyHasMedia(reply: SavedReply) {
  const media = parseReplyMedia(reply.body);
  return Boolean(media.attachments.length || media.music);
}

const EMPTY_REPLIES: SavedReply[] = [];

export function BookmarksContent({
  user,
  initialPosts,
  initialReplies = EMPTY_REPLIES,
}: BookmarksContentProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const reduced = useReducedMotion();
  const [posts, setPosts] = useState(initialPosts);
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [replies, setReplies] = useState(initialReplies);
  const [removedReplyIds, setRemovedReplyIds] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const allFilterButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    setPosts(initialPosts);
    setRemovedIds(new Set());
  }, [initialPosts]);
  useEffect(() => {
    setReplies(initialReplies);
    setRemovedReplyIds(new Set());
  }, [initialReplies]);
  useEffect(() => {
    const onChange = (event: Event) => {
      const { answerId, bookmarked } = (event as CustomEvent<AnswerBookmarkChange>).detail;
      setRemovedReplyIds((previous) => {
        const next = new Set(previous);
        if (bookmarked) next.delete(answerId);
        else next.add(answerId);
        return next;
      });
    };
    window.addEventListener(ANSWER_BOOKMARK_CHANGED, onChange);
    return () => window.removeEventListener(ANSWER_BOOKMARK_CHANGED, onChange);
  }, []);

  const savedPosts = posts.filter((post) => !removedIds.has(post.id));
  const query = searchQuery.trim().toLocaleLowerCase();
  const filteredPosts = savedPosts.filter((post) => {
    if (filter === 'code' && !hasCode(post)) return false;
    if (filter === 'media' && !hasMedia(post)) return false;
    return (
      !query ||
      [
        post.title,
        post.body,
        post.author.username,
        post.author.name,
        post.language,
        post.music?.title,
        post.music?.artist,
      ].some((value) => value?.toLocaleLowerCase().includes(query))
    );
  });
  const savedReplies = replies.filter((reply) => !removedReplyIds.has(reply.id));
  const filteredReplies = savedReplies.filter((reply) => {
    if (filter === 'code' && !replyHasCode(reply)) return false;
    if (filter === 'media' && !replyHasMedia(reply)) return false;
    return (
      !query ||
      [reply.body, reply.author.username, reply.author.name].some((value) =>
        value?.toLocaleLowerCase().includes(query)
      )
    );
  });
  const savedCount = savedPosts.length + savedReplies.length;
  const items: SavedItem[] = [
    ...filteredPosts.map((item) => ({ kind: 'post' as const, item })),
    ...filteredReplies.map((item) => ({ kind: 'reply' as const, item })),
  ].sort((a, b) => (b.item.saved_at ?? '').localeCompare(a.item.saved_at ?? ''));
  const filters = [
    { value: 'all' as const, label: text('Todos', 'All'), icon: Bookmark },
    { value: 'code' as const, label: text('Código', 'Code'), icon: Code2 },
    { value: 'media' as const, label: text('Mídia', 'Media'), icon: ImageIcon },
  ];
  const filtered = Boolean(query || filter !== 'all');
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    searchButton.current?.focus();
  };
  const resetFilters = () => {
    setFilter('all');
    setSearchQuery('');
    (searchInput.current || allFilterButton.current)?.focus();
  };

  // PostCard owns the request. Preserve order and local edits for its rollback.
  const handleBookmarkToggle = (postId: string, bookmarked: boolean) => {
    setRemovedIds((previous) => {
      const next = new Set(previous);
      if (bookmarked) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <PlatformPageShell user={user} className={styles.surface}>
      <header className={styles.header}>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={text('Voltar', 'Back')}
            onClick={() => (window.history.length > 1 ? router.back() : router.push('/feed'))}
          >
            <ArrowLeft size={21} aria-hidden="true" />
          </button>
          <h1>{text('Itens salvos', 'Bookmarks')}</h1>
          <output
            className={styles.count}
            aria-label={`${savedCount} ${savedCount === 1 ? text('item salvo', 'saved item') : text('itens salvos', 'saved items')}`}
          >
            {savedCount.toLocaleString()}
          </output>
          <button
            ref={searchButton}
            type="button"
            className={styles.iconButton}
            aria-label={
              searchOpen
                ? text('Fechar busca', 'Close search')
                : text('Buscar itens salvos', 'Search bookmarks')
            }
            aria-expanded={searchOpen}
            aria-controls={searchOpen ? 'bookmarks-search' : undefined}
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          >
            {searchOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Search size={20} aria-hidden="true" />
            )}
          </button>
        </div>
        <nav className={styles.tabs} aria-label={text('Filtrar itens salvos', 'Filter bookmarks')}>
          {filters.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              ref={value === 'all' ? allFilterButton : undefined}
              type="button"
              className={styles.tab}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <p className={styles.intro}>
        {text(
          'Suas publicações favoritas, sempre por perto.',
          'Your favorite posts, always close at hand.'
        )}
      </p>
      {searchOpen && (
        <div id="bookmarks-search" className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <input
            ref={searchInput}
            type="search"
            aria-label={text('Buscar nos itens salvos', 'Search saved posts')}
            placeholder={text(
              'Buscar por conteúdo, pessoa ou música…',
              'Search content, people or music…'
            )}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeSearch();
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.iconButton}
              aria-label={text('Limpar busca', 'Clear search')}
              onClick={() => {
                setSearchQuery('');
                searchInput.current?.focus();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className={styles.empty} role="status">
          {filtered ? (
            <Search size={32} aria-hidden="true" />
          ) : (
            <Bookmark size={32} aria-hidden="true" />
          )}
          <h2>
            {filtered
              ? text('Nenhum item encontrado', 'No bookmarks found')
              : text('Guarde boas descobertas', 'Keep your discoveries')}
          </h2>
          <p>
            {filtered
              ? text(
                  'Tente outra busca ou veja todos os seus itens salvos.',
                  'Try another search or view all your bookmarks.'
                )
              : text(
                  'Salve uma publicação pelo marcador para encontrá-la aqui depois.',
                  'Save a post with its bookmark button to find it here whenever you need it.'
                )}
          </p>
          {filtered ? (
            <button type="button" onClick={resetFilters}>
              {text('Ver todos os itens', 'View all bookmarks')}
            </button>
          ) : (
            <Link href="/feed">{text('Explorar o feed', 'Explore the feed')}</Link>
          )}
        </div>
      ) : (
        <ul className={styles.list} aria-label={text('Publicações salvas', 'Saved posts')}>
          <AnimatePresence initial={false}>
            {items.map(({ kind, item }) => (
              <motion.li
                key={`${kind}:${item.id}`}
                className={styles.item}
                initial={false}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.16 }}
              >
                {kind === 'reply' ? (
                  <ProfileReplyThread reply={item} currentUser={user} />
                ) : (
                  <PostCard
                    post={item}
                    isOwner={item.author.username === user.username}
                    flat
                    onBookmarkToggle={handleBookmarkToggle}
                    onDelete={(postId) =>
                      setPosts((previous) => previous.filter((item) => item.id !== postId))
                    }
                    onEdit={(postId, updatedPost) =>
                      setPosts((previous) =>
                        previous.map((item) =>
                          item.id === postId ? { ...item, ...updatedPost } : item
                        )
                      )
                    }
                  />
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </PlatformPageShell>
  );
}
