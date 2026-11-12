'use client';

import { useCallback, useEffect, useRef, useState, type ComponentProps } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Search, X } from 'lucide-react';
import { PlatformPageShell } from '@/components/PlatformPageShell';
import { PostCard } from '@/components/PostCard';
import { PostSkeletonList } from '@/components/motion/PostSkeleton';
import { FollowButton } from '@/components/motion/FollowButton';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileFlag } from '@/components/profile/ProfileIdentity';
import { WhoToFollow } from '@/components/WhoToFollow';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import type { FollowProfileIdentity } from '@/lib/follow-recommendations';
import { cn } from '@/lib/cn';
import styles from './ExploreContent.module.css';

type ExploreTab = 'posts' | 'people';
type ExplorePost = ComponentProps<typeof PostCard>['post'];
type ShellUser = NonNullable<ComponentProps<typeof PlatformPageShell>['user']>;

interface PersonResult {
  id: string;
  username: string;
  display_name?: string;
  avatar_url: string | null;
  identity?: FollowProfileIdentity;
  is_following?: boolean;
}

interface PopularHashtag {
  tag: string;
  count: number;
}

interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

function exploreUrl(query: string, tab: ExploreTab) {
  if (!query) return '/explore';
  const params = new URLSearchParams({ q: query });
  if (tab === 'people') params.set('tab', 'people');
  return `/explore?${params}`;
}

export function ExploreContent({
  user,
  initialQuery,
  initialTab,
}: {
  user: ShellUser & {
    id: string;
    username: string;
    total_xp: number;
    streak?: number;
    last_active_at?: string | null;
    trails?: Array<{ id: string; language: string; xp: number; level: number }>;
  };
  initialQuery: string;
  initialTab: ExploreTab;
}) {
  const { text } = useLocalizedText();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<ExploreTab>(initialTab);

  // Commit the typed text after a short pause and keep it in the URL so back/forward work.
  useEffect(() => {
    const next = input.trim();
    if (next === query) return;
    const timer = window.setTimeout(() => setQuery(next), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [input, query]);

  useEffect(() => {
    // The native history API keeps the URL shareable without a server round-trip per search.
    const next = exploreUrl(query, tab);
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, '', next);
    }
  }, [query, tab]);

  const searching = query.length > 0;

  const openQuery = (value: string) => {
    setInput(value);
    setQuery(value);
    setTab('posts');
    window.scrollTo({ top: 0 });
  };

  const clearSearch = () => {
    setInput('');
    setQuery('');
    setTab('posts');
    inputRef.current?.focus();
  };

  return (
    <PlatformPageShell
      user={user}
      className={styles.surface}
      railProps={{ hideSearch: true, hideWhoToFollow: true }}
    >
      <div className={styles.top}>
        <form
          role="search"
          className={styles.searchRow}
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(input.trim());
          }}
        >
          {searching && (
            <button
              type="button"
              className={styles.back}
              onClick={clearSearch}
              aria-label={text('Voltar para Explorar', 'Back to Explore')}
            >
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
          )}
          <label className={styles.search}>
            <Search size={20} aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={input}
              maxLength={100}
              enterKeyHint="search"
              placeholder={text('Pesquisar', 'Search')}
              aria-label={text('Pesquisar posts e pessoas', 'Search posts and people')}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && input) {
                  event.preventDefault();
                  clearSearch();
                }
              }}
            />
            {input && (
              <button
                type="button"
                className={styles.clear}
                onClick={clearSearch}
                aria-label={text('Limpar pesquisa', 'Clear search')}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </label>
        </form>

        {searching && (
          <div role="tablist" aria-label={text('Resultados', 'Results')} className={styles.tabs}>
            {(
              [
                ['posts', text('Postagens', 'Posts')],
                ['people', text('Pessoas', 'People')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`explore-tab-${id}`}
                aria-selected={tab === id}
                aria-controls="explore-results"
                className={cn(styles.tab, tab === id && styles.tabActive)}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {searching ? (
        <div id="explore-results" role="tabpanel" aria-labelledby={`explore-tab-${tab}`}>
          {query.length < MIN_QUERY_LENGTH ? (
            <EmptyMessage
              title={text('Continue digitando', 'Keep typing')}
              body={text(
                `Use pelo menos ${MIN_QUERY_LENGTH} caracteres para pesquisar.`,
                `Use at least ${MIN_QUERY_LENGTH} characters to search.`
              )}
            />
          ) : tab === 'posts' ? (
            <PostResults key={query} query={query} viewerUsername={user.username} />
          ) : (
            <PeopleResults key={query} query={query} viewerId={user.id} />
          )}
        </div>
      ) : (
        <div className={styles.home}>
          <PopularHashtags onSelect={(tag) => openQuery(`#${tag}`)} />
          <WhoToFollow viewerId={user.id} limit={10} className={styles.whoToFollow} />
        </div>
      )}
    </PlatformPageShell>
  );
}

function EmptyMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.empty} role="status">
      <Search size={28} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

/** Loads cursor pages from an endpoint and appends the next one when the sentinel scrolls in. */
function usePagedSearch<T>(buildUrl: (cursor: string | null) => string) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const busy = useRef(false);
  const buildRef = useRef(buildUrl);
  buildRef.current = buildUrl;

  const load = useCallback(async (from: string | null) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(buildRef.current(from), { cache: 'no-store' });
      if (!response.ok) throw new Error('Search failed');
      const page: Page<T> = await response.json();
      setItems((current) => (from ? [...current, ...page.items] : page.items));
      setCursor(page.nextCursor);
      setDone(!page.nextCursor);
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || done || error || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && cursor) void load(cursor);
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, done, error, load]);

  return { items, setItems, loading, error, done, retry: () => load(cursor), sentinel };
}

function PostResults({ query, viewerUsername }: { query: string; viewerUsername: string }) {
  const { text } = useLocalizedText();
  const { items, setItems, loading, error, retry, sentinel } = usePagedSearch<ExplorePost>(
    (cursor) => {
      const params = new URLSearchParams({ search: query, limit: '10' });
      if (cursor) params.set('cursor', cursor);
      return `/api/posts?${params}`;
    }
  );

  if (!loading && !error && items.length === 0) {
    return (
      <EmptyMessage
        title={text(`Nada encontrado para “${query}”`, `No results for “${query}”`)}
        body={text(
          'Tente outra palavra, uma hashtag ou procure em Pessoas.',
          'Try another word, a hashtag, or look in People.'
        )}
      />
    );
  }

  return (
    <>
      <ul className={styles.postList} aria-label={text('Postagens encontradas', 'Posts found')}>
        {items.map((post) => (
          <li key={post.id} className={styles.postItem}>
            <PostCard
              post={post}
              isOwner={post.author.username === viewerUsername}
              flat
              onDelete={(postId) =>
                setItems((current) => current.filter((item) => item.id !== postId))
              }
              onEdit={(postId, updated) =>
                setItems((current) =>
                  current.map((item) => (item.id === postId ? { ...item, ...updated } : item))
                )
              }
            />
          </li>
        ))}
      </ul>
      {loading && (
        <PostSkeletonList
          count={items.length ? 2 : 4}
          variant="feed"
          label={text('Carregando postagens', 'Loading posts')}
        />
      )}
      {error && <RetryRow onRetry={retry} />}
      <div ref={sentinel} aria-hidden="true" />
    </>
  );
}

function PeopleResults({ query, viewerId }: { query: string; viewerId: string }) {
  const { text } = useLocalizedText();
  const { items, setItems, loading, error, retry, sentinel } = usePagedSearch<PersonResult>(
    (cursor) => {
      const params = new URLSearchParams({ q: query, type: 'users', limit: '15' });
      if (cursor) params.set('cursor', cursor);
      return `/api/search?${params}`;
    }
  );

  const toggleFollow = async (person: PersonResult) => {
    const response = await fetch(`/api/users/${encodeURIComponent(person.id)}/follow`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Follow failed');
    const data: { following?: boolean } = await response.json();
    setItems((current) =>
      current.map((item) =>
        item.id === person.id ? { ...item, is_following: Boolean(data.following) } : item
      )
    );
  };

  if (!loading && !error && items.length === 0) {
    return (
      <EmptyMessage
        title={text('Ninguém encontrado', 'No one found')}
        body={text(`Nenhum perfil corresponde a “${query}”.`, `No profiles match “${query}”.`)}
      />
    );
  }

  return (
    <>
      <ul className={styles.people} aria-label={text('Pessoas encontradas', 'People found')}>
        {items.map((person) => {
          const name = person.display_name || person.username;
          return (
            <li key={person.id} className={styles.person}>
              <Link
                href={`/profile/${encodeURIComponent(person.username)}`}
                className={styles.identity}
                title={name}
              >
                <AuthorAvatar
                  username={person.username}
                  avatar_url={person.avatar_url}
                  avatar_config={person.identity}
                  size="lg"
                />
                <span className={styles.copy}>
                  <span className={styles.nameRow}>
                    <span className={styles.name}>{name}</span>
                    {Boolean(person.identity?.flags.length) && (
                      <span className={styles.flags}>
                        {person.identity?.flags.map((flag) => (
                          <ProfileFlag key={flag} code={flag} />
                        ))}
                      </span>
                    )}
                  </span>
                  <span className={styles.handle}>@{person.username}</span>
                </span>
              </Link>
              {person.id !== viewerId && (
                <FollowButton
                  isFollowing={Boolean(person.is_following)}
                  onToggle={() => toggleFollow(person)}
                />
              )}
            </li>
          );
        })}
        {loading &&
          [0, 1, 2].map((index) => (
            <li key={`skeleton-${index}`} className={styles.person} aria-hidden="true">
              <span className={styles.avatarSkeleton} />
              <span className={styles.lineSkeleton}>
                <span />
                <span />
              </span>
            </li>
          ))}
      </ul>
      {error && <RetryRow onRetry={retry} />}
      <div ref={sentinel} aria-hidden="true" />
    </>
  );
}

function RetryRow({ onRetry }: { onRetry: () => void }) {
  const { text } = useLocalizedText();
  return (
    <div className={styles.retryRow} role="alert">
      <p>{text('Não foi possível carregar os resultados.', 'Could not load the results.')}</p>
      <button type="button" onClick={onRetry}>
        {text('Tentar novamente', 'Try again')}
      </button>
    </div>
  );
}

function PopularHashtags({ onSelect }: { onSelect: (tag: string) => void }) {
  const { text } = useLocalizedText();
  const [tags, setTags] = useState<PopularHashtag[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/explore/hashtags?limit=12', { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Hashtags unavailable');
        return response.json() as Promise<{ items: PopularHashtag[] }>;
      })
      .then((data) => setTags(Array.isArray(data.items) ? data.items : []))
      .catch((failure: unknown) => {
        if ((failure as Error).name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, []);

  if (error || (tags && tags.length === 0)) return null;

  return (
    <section className={styles.section} aria-labelledby="explore-hashtags-title">
      <header className={styles.sectionHeader}>
        <h2 id="explore-hashtags-title">
          <Hash size={22} aria-hidden="true" />
          {text('Hashtags populares', 'Popular hashtags')}
        </h2>
        <p>{text('Descubra as hashtags em alta', 'Discover trending hashtags')}</p>
      </header>
      {tags ? (
        <ul className={styles.chips}>
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <button
                type="button"
                className={styles.chip}
                onClick={() => onSelect(tag)}
                aria-label={text(
                  `#${tag}, ${count} ${count === 1 ? 'postagem' : 'postagens'}`,
                  `#${tag}, ${count} ${count === 1 ? 'post' : 'posts'}`
                )}
              >
                <span className={styles.chipTag}>#{tag}</span>
                <span className={styles.chipCount}>{count}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.chips} aria-hidden="true">
          {[96, 72, 110, 64, 88, 78].map((width, index) => (
            <span key={index} className={styles.chipSkeleton} style={{ width }} />
          ))}
        </div>
      )}
    </section>
  );
}
