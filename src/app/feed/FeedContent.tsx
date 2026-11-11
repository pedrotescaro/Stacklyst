/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { PostCard } from '@/components/PostCard';
import { LanguageTag } from '@/components/LanguageTag';
import { Footer } from '@/components/Footer';
import { AchievementShowcase } from '@/components/AchievementShowcase';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostSkeletonList } from '@/components/motion/PostSkeleton';
import { NewPostsPill } from '@/components/motion/NewPostsPill';
import { XPProgressBar } from '@/components/motion/XPProgressBar';
import { FeedEngagementCard } from '@/app/feed/FeedEngagementCard';
import { FeedControls } from '@/app/feed/FeedControls';
import { MobilePullToRefresh } from '@/components/MobilePullToRefresh';
import { feedRankingSurfaceClassName } from '@/components/FeedRankingSwitcher';
import { EmptyState } from '@/components/motion/EmptyState';
import { LevelUpOverlay } from '@/components/motion/LevelUpOverlay';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { crossfadeVariants, springGentle } from '@/lib/motion';
import { openPostComposer } from '@/components/composer/PostComposerDialog';
import { cn } from '@/lib/cn';
import { getCurrentUser } from '@/lib/client/current-user';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSearchWithDebounce } from '@/hooks/useSearchWithDebounce';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Language } from '@prisma/client';
import {
  Swords,
  MessageSquare,
  Trophy,
  ChevronRight,
  ArrowBigDown,
  AlertTriangle,
  Code,
  Plus,
  Sparkles,
  BookOpen,
  Calendar,
  X,
  Search,
  Flag,
  Heart,
  BarChart2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import type { OnboardingPreferences } from '@/lib/onboarding';
import { getFeedSettings } from '@/lib/feed-preferences';

const QuizWidget = dynamic(
  () => import('@/components/QuizWidget').then((module) => module.QuizWidget),
  { loading: () => <div className="dd-skeleton-post dd-skeleton h-44 rounded-xl" /> }
);

const DuelCard = dynamic(() => import('@/components/DuelCard').then((module) => module.DuelCard), {
  loading: () => <div className="dd-skeleton-post dd-skeleton h-52 rounded-xl" />,
});

interface LanguageTrail {
  id: string;
  user_id: string;
  language: Language;
  xp: number;
  level: number;
  streak: number;
}

interface Badge {
  id: string;
  slug: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  earned_at?: string | null;
}

function getLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 1000) + 1);
}

function hasStartedTrail(trail: LanguageTrail) {
  return trail.xp > 0 || trail.level > 1 || trail.streak > 0;
}

function isAbortedRequest(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function fetchWithSingleRetry(url: string, init: RequestInit) {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (init.signal?.aborted || !navigator.onLine) throw error;

    // HMR e reinícios rápidos podem interromper uma requisição por poucos milissegundos.
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    return fetch(url, init);
  }
}

function highlightMatches(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark key={`${part}-${index}`} className="dd-search-highlight text-inherit">
          {part}
        </mark>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

interface FeedContentProps {
  initialSearchQuery?: string;
  initialPreferences?: OnboardingPreferences;
  initialCurrentDate: string;
  initialUser: {
    id: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    total_xp: number;
    streak?: number;
    last_active_at?: string | null;
    trails: LanguageTrail[];
    badges: Badge[];
  };
  initialPosts: any[];
  initialDuels?: any[];
  initialNextCursor?: string | null;
  initialBookmarks?: Record<string, boolean>;
}

function RailSectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-black leading-tight text-dd-text">{title}</h3>
        <p className="mt-1 text-[11px] font-bold leading-4 text-dd-muted">{description}</p>
      </div>
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-400"
      >
        <Icon className="h-6 w-6" strokeWidth={2.6} />
      </div>
    </div>
  );
}

function getInitialCursor(items: any[]) {
  if (items.length < 10) return null;
  const lastItem = items[items.length - 1];
  if (!lastItem) return null;
  try {
    const payload = JSON.stringify({
      t: new Date(lastItem.created_at).toISOString(),
      i: lastItem.id,
    });
    const base64 = btoa(payload);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Failed to encode initial cursor:', e);
    const lastTime = new Date(lastItem.created_at).getTime();
    return `${lastTime}_${lastItem.id}`;
  }
}

export function FeedContent({
  initialSearchQuery = '',
  initialPreferences,
  initialCurrentDate,
  initialUser,
  initialPosts,
  initialDuels = [],
  initialNextCursor,
  initialBookmarks = {},
}: FeedContentProps) {
  const { text } = useLocalizedText();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'quizzes' | 'duels' | 'ranking'>('feed');
  const [feedFilter, setFeedFilter] = useState<'for-you' | 'following'>(
    initialPreferences?.feed || 'for-you'
  );
  const [feedLanguages, setFeedLanguages] = useState(initialPreferences?.languages.join(',') || '');
  const [feedSettings, setFeedSettings] = useState(initialPreferences?.feedSettings);
  const [activeFeedId, setActiveFeedId] = useState(
    getFeedSettings(initialPreferences).defaultFeedId
  );
  const [feedRevision, setFeedRevision] = useState(0);
  const feedRequestSuffix = feedSettings
    ? `&feedId=${encodeURIComponent(activeFeedId)}&feedRevision=${feedRevision}`
    : '';
  useEffect(() => {
    const update = (e: Event) => {
      const prefs = (e as CustomEvent<OnboardingPreferences>).detail;
      setFeedLanguages(prefs.languages.join(','));
      setFeedFilter(prefs.feed);
      setFeedSettings(prefs.feedSettings);
      setActiveFeedId(getFeedSettings(prefs).defaultFeedId);
      setFeedRevision((value) => value + 1);
    };
    window.addEventListener('stacklyst:feed-preferences', update);
    return () => window.removeEventListener('stacklyst:feed-preferences', update);
  }, []);
  const [followingSort, setFollowingSort] = useState<'recent' | 'popular'>('recent');
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [duels, setDuels] = useState<any[]>(initialDuels);
  const [duelsLoading, setDuelsLoading] = useState(initialDuels.length === 0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLanguage, setLeaderboardLanguage] = useState<string>('GLOBAL');
  const [weeklyActivity, setWeeklyActivity] = useState<Map<number, number>>(new Map());
  const [currentWeekDate, setCurrentWeekDate] = useState(initialCurrentDate);

  const [nextCursor, setNextCursor] = useState<string | null>(() =>
    initialNextCursor === undefined ? getInitialCursor(initialPosts) : initialNextCursor
  );
  const [hasMore, setHasMore] = useState(
    initialNextCursor === undefined ? initialPosts.length >= 10 : initialNextCursor !== null
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [refreshingPosts, setRefreshingPosts] = useState(false);
  const refreshRequestRef = useRef<AbortController | null>(null);
  const pageRequestRef = useRef<AbortController | null>(null);
  const filterRequestRef = useRef<AbortController | null>(null);
  const feedGenerationRef = useRef(0);
  const initialSnapshotRef = useRef(initialPosts);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const FEED_PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  useEffect(() => setSearchQuery(initialSearchQuery), [initialSearchQuery]);
  const [bookmarkedPostIds, setBookmarkedPostIds] =
    useState<Record<string, boolean>>(initialBookmarks);
  const [repostState, setRepostState] = useState<
    Record<string, { count: number; reposted: boolean }>
  >({});
  const [activeReactions, setActiveReactions] = useState<Record<string, string | null>>({});
  const [currentXp, setCurrentXp] = useState(initialUser.total_xp);
  const [currentLevel, setCurrentLevel] = useState(getLevelFromXp(initialUser.total_xp));
  const [currentStreak, setCurrentStreak] = useState(initialUser.streak ?? 0);
  const [currentLastActiveAt, setCurrentLastActiveAt] = useState(
    initialUser.last_active_at ?? null
  );
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [firstPostToastVisible, setFirstPostToastVisible] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getCurrentUser<any>()
        .then((data) => {
          if (data) {
            if (data.total_xp !== undefined) {
              setCurrentXp(data.total_xp);
              setCurrentLevel(getLevelFromXp(data.total_xp));
            }
            const streakVal = data.streak_days ?? data.streak ?? 0;
            setCurrentStreak(streakVal);
            if (typeof data.last_active_at === 'string') {
              setCurrentLastActiveAt(data.last_active_at);
            }
          }
        })
        .catch(() => {});
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const updateSoundState = () => {
      setSoundEnabled(localStorage.getItem('stacklyst-sound') !== 'false');
    };

    updateSoundState();

    window.addEventListener('storage', updateSoundState);
    window.addEventListener('stacklyst-sound-changed', updateSoundState);

    return () => {
      window.removeEventListener('storage', updateSoundState);
      window.removeEventListener('stacklyst-sound-changed', updateSoundState);
    };
  }, []);

  const { playSound } = useSoundEffects(soundEnabled);

  // Daily Quiz state
  const [dailyQuiz, setDailyQuiz] = useState<any>(null);
  const [dailyAttempt, setDailyAttempt] = useState<any>(null);

  const didMountFilterEffectRef = useRef(false);

  // Report post state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [selectedReportPostId, setSelectedReportPostId] = useState<string | null>(null);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !selectedReportPostId) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/posts/${selectedReportPostId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (res.ok) {
        setReported(true);
        setTimeout(() => {
          setReportModalOpen(false);
          setReported(false);
          setReportReason('');
          setSelectedReportPostId(null);
        }, 1500);
      } else {
        alert(text('Falha ao enviar denúncia.', 'Could not send report.'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  // One first-page request owns the current search/filter. Old requests cannot
  // overwrite a refresh or a newly selected feed after they finish out of order.
  useEffect(() => {
    const generation = ++feedGenerationRef.current;
    filterRequestRef.current?.abort();
    pageRequestRef.current?.abort();
    pageRequestRef.current = null;
    refreshRequestRef.current?.abort();
    refreshRequestRef.current = null;
    setRefreshingPosts(false);
    setLoadingMore(false);
    setNewPostsCount(0);
    setFeedError(null);
    const firstMount = !didMountFilterEffectRef.current;
    didMountFilterEffectRef.current = true;
    const query = searchQuery.trim();
    if (firstMount && !query) return;
    if (query && query.length < 2) {
      setLoadingSearch(false);
      return;
    }

    const controller = new AbortController();
    filterRequestRef.current = controller;
    setLoadingSearch(true);
    const timer = window.setTimeout(
      async () => {
        if (controller.signal.aborted) return;
        try {
          const url = query
            ? `/api/search?q=${encodeURIComponent(query)}&type=posts&limit=${FEED_PAGE_SIZE}`
            : feedFilter === 'following'
              ? `/api/posts?filter=following&sort=${followingSort}&limit=${FEED_PAGE_SIZE}&useCursor=true`
              : `/api/posts?limit=${FEED_PAGE_SIZE}&useCursor=true${feedLanguages ? `&languages=${encodeURIComponent(feedLanguages)}` : ''}`;
          const response = await fetch(query ? url : url + feedRequestSuffix, {
            signal: controller.signal,
            cache: 'no-store',
          });
          if (!response.ok) throw new Error('Feed unavailable');
          const data = await response.json();
          if (controller.signal.aborted || generation !== feedGenerationRef.current) return;
          setPosts(data.items || []);
          setBookmarkedPostIds(
            Object.fromEntries(
              (data.items || [])
                .filter((post: any) => post.bookmarks?.length)
                .map((post: any) => [post.id, true])
            )
          );
          setNextCursor(data.nextCursor || null);
          setHasMore(Boolean(data.nextCursor));
        } catch {
          if (controller.signal.aborted || generation !== feedGenerationRef.current) return;
          setFeedError(
            text(
              'Não foi possível atualizar as publicações. Tente novamente.',
              'Could not update posts. Try again.'
            )
          );
        } finally {
          if (generation === feedGenerationRef.current) setLoadingSearch(false);
          if (filterRequestRef.current === controller) filterRequestRef.current = null;
        }
      },
      query ? 300 : 0
    );
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    feedFilter,
    followingSort,
    searchQuery,
    feedLanguages,
    text,
    initialPosts,
    feedRequestSuffix,
  ]);

  // Next router.refresh keeps Client Component state. Adopt a new server snapshot
  // rather than leaving the old useState(initialPosts) list on screen forever.
  useEffect(() => {
    if (initialSnapshotRef.current === initialPosts) return;
    initialSnapshotRef.current = initialPosts;
    if (
      searchQuery.trim() ||
      activeFeedId !== getFeedSettings(initialPreferences).defaultFeedId ||
      feedRevision > 0 ||
      (feedFilter === 'following' && followingSort === 'popular') ||
      feedFilter !== (initialPreferences?.feed || 'for-you') ||
      feedLanguages !== (initialPreferences?.languages.join(',') || '')
    )
      return;
    feedGenerationRef.current++;
    pageRequestRef.current?.abort();
    pageRequestRef.current = null;
    filterRequestRef.current?.abort();
    refreshRequestRef.current?.abort();
    refreshRequestRef.current = null;
    setRefreshingPosts(false);
    setLoadingMore(false);
    setLoadingSearch(false);
    setPosts(initialPosts);
    const cursor =
      initialNextCursor === undefined ? getInitialCursor(initialPosts) : initialNextCursor;
    setNextCursor(cursor);
    setHasMore(Boolean(cursor));
    setNewPostsCount(0);
    setFeedError(null);
    setBookmarkedPostIds(initialBookmarks);
  }, [
    initialPosts,
    initialNextCursor,
    initialBookmarks,
    initialPreferences,
    followingSort,
    searchQuery,
    feedFilter,
    feedLanguages,
    activeFeedId,
    feedRevision,
  ]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || pageRequestRef.current || refreshingPosts || loadingSearch)
      return;
    const controller = new AbortController();
    const generation = feedGenerationRef.current;
    pageRequestRef.current = controller;
    setLoadingMore(true);
    try {
      let url = '';
      if (searchQuery.trim()) {
        url = `/api/search?q=${encodeURIComponent(searchQuery)}&type=posts&limit=${FEED_PAGE_SIZE}${nextCursor ? `&cursor=${nextCursor}` : ''}`;
      } else {
        url =
          feedFilter === 'following'
            ? `/api/posts?filter=following&sort=${followingSort}&useCursor=true&limit=${FEED_PAGE_SIZE}${nextCursor ? `&cursor=${nextCursor}` : ''}`
            : `/api/posts?useCursor=true&limit=${FEED_PAGE_SIZE}${nextCursor ? `&cursor=${nextCursor}` : ''}${feedLanguages ? `&languages=${encodeURIComponent(feedLanguages)}` : ''}`;
      }
      const res = await fetch(searchQuery.trim() ? url : url + feedRequestSuffix, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (controller.signal.aborted || generation !== feedGenerationRef.current) return;
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const fresh = (data.items || []).filter((p: { id: string }) => !ids.has(p.id));
          return [...prev, ...fresh];
        });
        setBookmarkedPostIds((previous) => ({
          ...previous,
          ...Object.fromEntries(
            (data.items || []).map((post: any) => [post.id, Boolean(post.bookmarks?.length)])
          ),
        }));
        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.warn('Load more posts network issue:', err);
    } finally {
      if (pageRequestRef.current === controller) pageRequestRef.current = null;
      if (generation === feedGenerationRef.current) setLoadingMore(false);
    }
  }, [
    loadingMore,
    hasMore,
    searchQuery,
    nextCursor,
    feedFilter,
    followingSort,
    feedLanguages,
    refreshingPosts,
    loadingSearch,
    feedRequestSuffix,
  ]);

  const scrollSentinelRef = useInfiniteScroll({
    onLoadMore: loadMorePosts,
    hasMore: hasMore,
    loading: loadingMore,
  });

  const newestVisiblePostTimestamp = useMemo(() => {
    const timestamps = posts
      .filter((post) => !post._pending && !String(post.id).startsWith('temp-'))
      .map((post) => new Date(post.created_at).getTime())
      .filter(Number.isFinite);
    return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;
  }, [posts]);

  const firstPageUrl = useCallback(() => {
    const params = new URLSearchParams({
      limit: String(FEED_PAGE_SIZE),
      useCursor: 'true',
    });
    if (feedFilter === 'following') {
      params.set('filter', 'following');
      params.set('sort', followingSort);
    } else if (feedLanguages) {
      params.set('languages', feedLanguages);
    }
    return `/api/posts?${params.toString()}${feedRequestSuffix}`;
  }, [feedFilter, followingSort, feedLanguages, feedRequestSuffix]);

  useEffect(() => {
    if (activeTab !== 'feed' || searchQuery.trim()) return;

    const controller = new AbortController();
    let checking = false;

    const checkForNewPosts = async () => {
      if (checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const params = new URLSearchParams({
          mode: 'count',
          after: newestVisiblePostTimestamp || initialCurrentDate,
        });
        if (feedFilter === 'following') params.set('filter', 'following');
        else if (feedLanguages) params.set('languages', feedLanguages);

        const res = await fetch(`/api/posts?${params.toString()}${feedRequestSuffix}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data: { count?: number } = await res.json();
        if (controller.signal.aborted) return;
        setNewPostsCount(Math.max(0, data.count ?? 0));
      } catch {
        // O feed atual continua utilizável mesmo se a verificação em background falhar.
      } finally {
        checking = false;
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') void checkForNewPosts();
    };

    void checkForNewPosts();
    const interval = window.setInterval(checkForNewPosts, 30000);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [
    activeTab,
    feedFilter,
    newestVisiblePostTimestamp,
    searchQuery,
    feedLanguages,
    initialCurrentDate,
    feedRequestSuffix,
  ]);

  const handleLoadNewPosts = useCallback(async () => {
    if (refreshRequestRef.current || activeTab !== 'feed' || searchQuery.trim()) return;
    const generation = ++feedGenerationRef.current;
    pageRequestRef.current?.abort();
    pageRequestRef.current = null;
    filterRequestRef.current?.abort();
    setLoadingMore(false);
    setLoadingSearch(false);

    const controller = new AbortController();
    refreshRequestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setRefreshingPosts(true);
    try {
      const res = await fetchWithSingleRetry(firstPageUrl(), {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Falha ao atualizar o feed');
      const data: { items?: any[]; nextCursor?: string | null } = await res.json();
      if (controller.signal.aborted || generation !== feedGenerationRef.current) return;
      const latest = data.items ?? [];
      setPosts(latest);
      setNextCursor(data.nextCursor || null);
      setHasMore(Boolean(data.nextCursor));
      setBookmarkedPostIds(
        Object.fromEntries(
          latest.filter((post) => post.bookmarks?.length).map((post) => [post.id, true])
        )
      );
      setNewPostsCount(0);
      setFeedError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (generation !== feedGenerationRef.current) return;
      if (isAbortedRequest(err)) {
        setFeedError(
          text(
            'A atualização demorou mais que o esperado. O feed atual foi mantido.',
            'The update took longer than expected. The current feed was kept.'
          )
        );
      } else {
        setFeedError(
          navigator.onLine
            ? text(
                'Não foi possível conectar ao servidor. O feed atual foi mantido; tente novamente em instantes.',
                'Could not connect to the server. The current feed was kept; try again shortly.'
              )
            : text(
                'Você está sem conexão. O feed atual continuará disponível até a internet voltar.',
                'You are offline. The current feed will remain available until the connection returns.'
              )
        );
      }
    } finally {
      window.clearTimeout(timeout);
      if (refreshRequestRef.current === controller) refreshRequestRef.current = null;
      if (generation === feedGenerationRef.current) setRefreshingPosts(false);
    }
  }, [firstPageUrl, text, activeTab, searchQuery]);

  useEffect(() => {
    const refreshAfterPublishing = () => void handleLoadNewPosts();
    window.addEventListener('stacklyst:post-created', refreshAfterPublishing);
    return () => window.removeEventListener('stacklyst:post-created', refreshAfterPublishing);
  }, [handleLoadNewPosts]);

  useEffect(() => {
    return () => {
      refreshRequestRef.current?.abort();
      pageRequestRef.current?.abort();
      filterRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchDailyQuiz = async () => {
      try {
        const res = await fetch('/api/quiz/daily', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setDailyQuiz(data.quiz);
          setDailyAttempt(data.attempt);
        }
      } catch (err) {
        if (controller.signal.aborted || isAbortedRequest(err)) return;
        console.error('Error loading daily quiz:', err);
      }
    };
    const timer = window.setTimeout(fetchDailyQuiz, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  // Fetch weekly activity data (days with quiz answers)
  const refetchWeeklyActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/weekly-activity');
      if (res.ok) {
        const data = await res.json();
        const counts = new Map<number, number>();
        (data.weekDays as Array<{ index: number; count: number }>).forEach((d) => {
          counts.set(d.index, d.count);
        });
        setWeeklyActivity(counts);
        setCurrentWeekDate(typeof data.today === 'string' ? data.today : new Date().toISOString());
      }
    } catch (err) {
      console.error('Error loading weekly activity:', err);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refetchWeeklyActivity, 900);
    return () => window.clearTimeout(timer);
  }, [refetchWeeklyActivity]);

  // Duel Form state
  const [duelTitle, setDuelTitle] = useState('');
  const [duelBody, setDuelBody] = useState('');
  const [duelLanguage, setDuelLanguage] = useState<Language>('TS');
  const [creatingDuel, setCreatingDuel] = useState(false);
  const [showDuelForm, setShowDuelForm] = useState(false);

  // XP Toast state
  const [toastXp, setToastXp] = useState<{ amount: number; language: string } | null>(null);

  // Thumbs state for posts
  const [votes, setVotes] = useState<
    Record<string, { up: number; userVote: 'up' | 'down' | null }>
  >(() => {
    const initialVotes: Record<string, { up: number; userVote: 'up' | 'down' | null }> = {};
    initialPosts.forEach((post) => {
      const userPostVote = post.votes?.[0];
      let userVote: 'up' | 'down' | null = null;
      if (userPostVote) {
        userVote = userPostVote.value === 1 ? 'up' : userPostVote.value === -1 ? 'down' : null;
      }
      initialVotes[post.id] = {
        up: post.upvotes,
        userVote,
      };
    });
    return initialVotes;
  });

  useEffect(() => {
    const newVotes = { ...votes };
    let changed = false;
    posts.forEach((post) => {
      const userPostVote = post.votes?.[0];
      let userVote: 'up' | 'down' | null = null;
      if (userPostVote) {
        userVote = userPostVote.value === 1 ? 'up' : userPostVote.value === -1 ? 'down' : null;
      }
      if (
        !votes[post.id] ||
        votes[post.id].up !== post.upvotes ||
        votes[post.id].userVote !== userVote
      ) {
        newVotes[post.id] = {
          up: post.upvotes,
          userVote,
        };
        changed = true;
      }
    });
    if (changed) {
      setVotes(newVotes);
    }
  }, [posts, votes]);

  // Helper to format language name
  const formatLangName = (lang: string) => {
    const map: Record<string, string> = {
      TS: 'TypeScript',
      JS: 'JavaScript',
      PYTHON: 'Python',
      RUST: 'Rust',
      GO: 'Go',
      CPP: 'C++',
      JAVA: 'Java',
      KOTLIN: 'Kotlin',
      SWIFT: 'Swift',
    };
    return map[lang] || lang;
  };

  // Helper to get language specific progress bar color
  const getLangColor = (lang: string) => {
    const map: Record<string, string> = {
      TS: 'bg-blue-500',
      JS: 'bg-amber-500',
      PYTHON: 'bg-emerald-500',
      RUST: 'bg-blue-500',
      GO: 'bg-cyan-500',
      CPP: 'bg-blue-600',
      JAVA: 'bg-red-500',
      KOTLIN: 'bg-purple-500',
      SWIFT: 'bg-blue-600',
    };
    return map[lang] || 'bg-slate-500';
  };

  // Simulated syntax highlighter for code snippets
  const highlightCode = (code: string) => {
    if (!code) return null;
    const lines = code.split('\n');
    return (
      <pre className="font-mono text-[11px] leading-relaxed text-dd-text">
        <code>
          {lines.map((line, idx) => {
            let html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            // Highlight keywords
            const keywords =
              /\b(const|let|var|function|return|fn|impl|pub|use|import|from|def|class|async|await|struct|enum|if|else|for|while|match)\b/g;
            html = html.replace(keywords, '<span class="text-blue-400 font-semibold">$1</span>');

            // Highlight types
            const types =
              /\b(string|number|boolean|any|void|User|Post|Language|int|float|str|char)\b/g;
            html = html.replace(types, '<span class="text-cyan-400 font-medium">$1</span>');

            // Highlight comments
            if (html.includes('//')) {
              const parts = html.split('//');
              html =
                parts[0] +
                '<span class="text-dd-muted italic">//' +
                parts.slice(1).join('//') +
                '</span>';
            } else if (html.startsWith('#') || html.includes(' #')) {
              const parts = html.split('#');
              html =
                parts[0] +
                '<span class="text-dd-muted italic">#' +
                parts.slice(1).join('#') +
                '</span>';
            }

            return (
              <div key={idx} className="table-row">
                <span className="table-cell text-right pr-4 select-none opacity-20 text-[9px] w-6">
                  {idx + 1}
                </span>
                <span className="table-cell" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            );
          })}
        </code>
      </pre>
    );
  };

  // Fetch duels helper
  const refreshDuels = useCallback(async () => {
    setDuelsLoading(true);
    try {
      const res = await fetch('/api/duels?limit=24');
      if (res.ok) {
        const data = await res.json();
        setDuels(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDuelsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialDuels.length > 0) return;

    const loadDuels = () => void refreshDuels();
    const timer = globalThis.setTimeout(loadDuels, 750);
    return () => globalThis.clearTimeout(timer);
  }, [initialDuels.length, refreshDuels]);

  // Fetch leaderboard ranking
  const fetchRankings = async (lang: string) => {
    try {
      const url = lang === 'GLOBAL' ? '/api/leaderboard' : `/api/leaderboard?language=${lang}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'ranking') {
      fetchRankings(leaderboardLanguage);
    }
  }, [activeTab, leaderboardLanguage]);

  const handleCreateDuel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDuel(true);

    try {
      const res = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_title: duelTitle,
          problem_body: duelBody,
          language: duelLanguage,
        }),
      });

      if (res.ok) {
        setDuelTitle('');
        setDuelBody('');
        setShowDuelForm(false);
        await refreshDuels();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingDuel(false);
    }
  };

  const showXPToast = (amount: number, language: string) => {
    setToastXp({ amount, language });
    setCurrentXp((prevXp) => prevXp + amount);
    playSound('xpgain');
    setTimeout(() => {
      setToastXp(null);
    }, 4000);
  };

  useEffect(() => {
    const published = (event: Event) => {
      playSound('post');
      const detail = (event as CustomEvent<{ xpResult?: { xpEarned?: number; language?: string } }>)
        .detail;
      const amount = detail?.xpResult?.xpEarned;
      if (amount) {
        setToastXp({ amount, language: detail?.xpResult?.language || 'Global' });
        setCurrentXp((current) => current + amount);
        window.setTimeout(() => setToastXp(null), 4000);
      }
    };
    window.addEventListener('stacklyst:post-created', published);
    return () => window.removeEventListener('stacklyst:post-created', published);
  }, [playSound]);

  useEffect(() => {
    const nextLevel = getLevelFromXp(currentXp);
    if (nextLevel > currentLevel) {
      setCurrentLevel(nextLevel);
      setLevelUpVisible(true);
    } else if (nextLevel !== currentLevel) {
      setCurrentLevel(nextLevel);
    }
  }, [currentXp, currentLevel]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFeedError(null);
    }
  }, [searchQuery]);

  const handleReactionSelect = async (postId: string, reaction?: string | null) => {
    const hasUpvote = votes[postId]?.userVote === 'up';

    if (!hasUpvote) {
      setActiveReactions((prev) => ({ ...prev, [postId]: reaction ?? null }));
      await handleVote(postId, 'up');
      return;
    }

    if (reaction) {
      setActiveReactions((prev) => ({ ...prev, [postId]: reaction }));
      return;
    }

    setActiveReactions((prev) => ({ ...prev, [postId]: null }));
    await handleVote(postId, 'up');
  };

  const handleBookmarkToggle = (postId: string, bookmarked: boolean) => {
    setBookmarkedPostIds((prev) => ({
      ...prev,
      [postId]: bookmarked,
    }));
  };

  const handleRepost = (post: any) => {
    setRepostState((prev) => {
      const current = prev[post.id] ?? { count: post.reposts_count ?? 0, reposted: false };
      return {
        ...prev,
        [post.id]: {
          count: current.reposted ? Math.max(0, current.count - 1) : current.count + 1,
          reposted: !current.reposted,
        },
      };
    });
  };

  const handleQuotePost = (post: any) => openPostComposer(post);

  // Upvote/Downvote handling with API
  const handleVote = async (postId: string, type: 'up' | 'down') => {
    const current = votes[postId] || { up: 0, userVote: null };
    let newValue = 0;

    if (type === 'up') {
      newValue = current.userVote === 'up' ? 0 : 1;
    } else {
      newValue = current.userVote === 'down' ? 0 : -1;
    }

    if (newValue === -1) {
      const justification = prompt(
        text(
          'No Stacklyst, o downvote exige uma justificativa construtiva. Escreva seu motivo para o autor melhorar:',
          'On Stacklyst, a downvote requires constructive feedback. Write your reason so the author can improve:'
        )
      );
      if (!justification || justification.trim().length <= 3) {
        alert(
          text(
            'O downvote foi cancelado. É necessária uma justificativa construtiva de pelo menos 4 caracteres.',
            'The downvote was canceled. Constructive feedback of at least 4 characters is required.'
          )
        );
        return;
      }
    }

    // Optimistic UI update
    let diff = 0;
    let newUserVote: 'up' | 'down' | null = null;
    if (type === 'up') {
      if (current.userVote === 'up') {
        diff = -1;
        newUserVote = null;
      } else if (current.userVote === 'down') {
        diff = 2;
        newUserVote = 'up';
      } else {
        diff = 1;
        newUserVote = 'up';
      }
    } else {
      if (current.userVote === 'down') {
        diff = 1;
        newUserVote = null;
      } else if (current.userVote === 'up') {
        diff = -2;
        newUserVote = 'down';
      } else {
        diff = -1;
        newUserVote = 'down';
      }
    }

    setVotes((prev) => ({
      ...prev,
      [postId]: {
        up: current.up + diff,
        userVote: newUserVote,
      },
    }));

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        throw new Error('Erro ao registrar voto');
      }

      const data = await res.json();
      setVotes((prev) => ({
        ...prev,
        [postId]: {
          up: data.upvotes,
          userVote: newUserVote,
        },
      }));
    } catch (err) {
      console.error(err);
      setVotes((prev) => ({
        ...prev,
        [postId]: current,
      }));
    }
  };

  const startedTrails = initialUser.trails.filter(hasStartedTrail);

  return (
    <div
      data-testid="app-shell"
      className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-blue-500/35 selection:text-white"
    >
      <LevelUpOverlay
        visible={levelUpVisible}
        level={currentLevel}
        onDone={() => setLevelUpVisible(false)}
      />
      <NewPostsPill
        count={newPostsCount}
        onClick={handleLoadNewPosts}
        visible={activeTab === 'feed' && !searchQuery.trim()}
        loading={refreshingPosts}
      />
      {/* XP Toast Notification */}
      {toastXp && (
        <div className="fixed left-3 right-3 top-[calc(3.75rem+env(safe-area-inset-top))] z-50 flex animate-slide-in-right items-center gap-3 rounded-xl border border-emerald-500/30 bg-dd-surface/90 p-4 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6 sm:top-20 sm:w-auto">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-base ring-1 ring-emerald-500/30">
            +{toastXp.amount}
          </div>
          <div>
            <p className="font-bold text-sm text-dd-text">{text('XP Concedido!', 'XP Awarded!')}</p>
            <p className="text-xs text-dd-muted">
              {text('Voce progrediu na trilha de', 'You progressed on the trail for')}{' '}
              {toastXp.language}
            </p>
          </div>
        </div>
      )}
      {firstPostToastVisible && (
        <div className="fixed left-1/2 top-[calc(4.5rem+env(safe-area-inset-top))] z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-dd-accent px-4 py-2 text-center text-xs font-black text-white shadow-xl shadow-blue-500/25 dd-soft-bounce sm:top-24">
          {text(
            '+50 XP - Primeira postagem! Bem-vindo ao Stacklyst.',
            '+50 XP - First post! Welcome to Stacklyst.'
          )}
        </div>
      )}

      <Sidebar user={initialUser} />

      <div className="dd-platform-body mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        {/* ========================================================================= */}
        {/* COLUNA CENTRAL: O Feed Principal e PostCard */}
        {/* ========================================================================= */}
        <main
          data-testid="primary-column"
          className={cn(
            'dd-platform-main flex min-h-screen w-full min-w-0 max-w-[720px] flex-grow flex-col border-dd-border/60 bg-dd-bg md:border-r pb-[calc(6rem+env(safe-area-inset-bottom))] md:border-l md:pb-8 xl:max-w-[820px] 2xl:max-w-[920px]',
            feedRankingSurfaceClassName
          )}
        >
          <MobilePullToRefresh
            refreshing={refreshingPosts}
            disabled={loadingSearch || activeTab !== 'feed' || !!searchQuery.trim()}
            onRefresh={handleLoadNewPosts}
          >
            <FeedControls
              filter={feedFilter}
              onFilterChange={setFeedFilter}
              sort={followingSort}
              onSortChange={setFollowingSort}
              feeds={feedSettings?.feeds}
              activeFeedId={activeFeedId}
              onFeedSelect={(id) => {
                const feed = feedSettings?.feeds.find((item) => item.id === id);
                if (feed) {
                  setActiveFeedId(id);
                  setFeedFilter(feed.source);
                }
              }}
            />

            {/* Feed Tab View */}
            {activeTab === 'feed' && (
              <>
                <div
                  data-testid="desktop-feed-composer"
                  className="hidden border-b border-dd-border px-5 py-5 md:block"
                >
                  <button
                    type="button"
                    onClick={() => openPostComposer()}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <AuthorAvatar
                      username={initialUser.username}
                      avatar_url={initialUser.avatar_url}
                      avatar_config={initialUser.avatar_config}
                      size="md"
                    />
                    <span className="flex-1 text-lg text-dd-muted">
                      {text('O que você está pensando?', "What's on your mind?")}
                    </span>
                    <span className="rounded-full bg-dd-accent px-5 py-2 text-sm font-semibold text-white">
                      {text('Criar postagem', 'Create post')}
                    </span>
                  </button>
                  <p className="mt-3 pl-13 text-xs text-dd-muted">
                    {text(
                      'Compartilhe uma ideia, um código ou uma descoberta.',
                      'Share an idea, code snippet, or insight.'
                    )}
                  </p>
                </div>

                {feedError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs font-semibold text-red-300">
                    {feedError}
                  </div>
                )}

                <div className="flex flex-col">
                  {searchQuery.trim().length === 1 ? (
                    <p className="px-6 py-12 text-center text-sm text-dd-muted" role="status">
                      {text(
                        'Digite pelo menos 2 caracteres para buscar.',
                        'Enter at least 2 characters to search.'
                      )}
                    </p>
                  ) : loadingSearch ? (
                    <PostSkeletonList count={3} variant="feed" />
                  ) : posts.length === 0 ? (
                    <EmptyState
                      type={searchQuery.trim() ? 'search' : 'feed'}
                      searchTerm={searchQuery}
                      className="bg-transparent border-0 rounded-none py-12 px-6"
                    />
                  ) : (
                    <AnimatePresence initial={false}>
                      {posts.map((post) => {
                        const postWithBookmarks = {
                          ...post,
                          bookmarks: bookmarkedPostIds[post.id] ? [{ id: 'temp-id' }] : [],
                        };
                        return (
                          <motion.div
                            key={post._clientKey ?? post.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={springGentle}
                          >
                            <PostCard
                              post={postWithBookmarks}
                              isOwner={post.author.username === initialUser.username}
                              flat={true}
                              onBookmarkToggle={(postId, isBookmarked) => {
                                handleBookmarkToggle(postId, isBookmarked);
                              }}
                              onDelete={(postId) => {
                                setPosts((prev) => prev.filter((p) => p.id !== postId));
                              }}
                              onEdit={(postId, updatedPost) => {
                                setPosts((prev) =>
                                  prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p))
                                );
                              }}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  {loadingMore && (
                    <PostSkeletonList
                      count={2}
                      variant="feed"
                      label={text('Carregando mais publicações', 'Loading more posts')}
                    />
                  )}
                  {!searchQuery.trim() && hasMore && (
                    <div ref={scrollSentinelRef} className="h-1" aria-hidden />
                  )}
                </div>
              </>
            )}

            {/* TAB DE QUIZZES */}
            {activeTab === 'quizzes' && (
              <motion.div
                initial="enter"
                animate="center"
                variants={crossfadeVariants}
                className="space-y-6 dd-tab-crossfade"
              >
                <div className="rounded-xl border border-dd-border bg-dd-surface p-5 backdrop-blur-sm">
                  <h2 className="font-bold text-lg text-dd-text flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    🧩 Stacklyst Quizzes
                  </h2>
                  <p className="text-dd-muted text-xs mt-1">
                    {text(
                      'Responda ao quiz diário curado para ganhar bônus de +15 XP.',
                      'Complete the daily quiz to earn a +15 XP bonus.'
                    )}
                  </p>
                </div>

                {/* Quiz Diário do Dia */}
                {dailyQuiz && (
                  <div className="dd-glow-ring rounded-xl border border-blue-500/35 bg-dd-surface p-5 backdrop-blur-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-dd-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-md uppercase tracking-wider">
                          Oficial
                        </span>
                        <span className="text-xs font-bold text-dd-text">
                          {text('Quiz Diário do Dia (+15 XP)', 'Daily Quiz (+15 XP)')}
                        </span>
                      </div>
                      <span className="text-[10px] text-dd-muted flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />{' '}
                        {text('Rotativo Diário', 'Daily rotation')}
                      </span>
                    </div>
                    <QuizWidget
                      quiz={dailyQuiz}
                      postId=""
                      attempted={!!dailyAttempt}
                      userAnswer={dailyAttempt?.selected_index}
                      onAttemptSuccess={(
                        selectedIndex: number,
                        isCorrect: boolean,
                        xpResult: any
                      ) => {
                        setDailyAttempt({
                          quiz_id: dailyQuiz.id,
                          selected_index: selectedIndex,
                          is_correct: isCorrect,
                        });
                        refetchWeeklyActivity();
                        if (isCorrect) {
                          showXPToast(15, 'Global');
                        }
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB DE DUELOS */}
            {activeTab === 'duels' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 rounded-xl border border-dd-border bg-dd-surface p-5 backdrop-blur-sm shadow-sm">
                  <div>
                    <h2 className="font-bold text-lg text-dd-text flex items-center gap-2">
                      <Swords className="w-5 h-5 text-blue-500" />
                      {text('⚔️ Arena de Duelos', '⚔️ Duel Arena')}
                    </h2>
                    <p className="text-dd-muted text-xs mt-1">
                      {text(
                        'Crie um duelo e aguarde matchmaking, ou entre em duelos abertos criados pela comunidade.',
                        'Create a duel and wait for matchmaking, or join open duels created by the community.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDuelForm(!showDuelForm)}
                    className="bg-blue-500 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-colors hover:bg-blue-600 whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(0, 131, 254,0.15)] flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    {showDuelForm
                      ? text('Fechar formulário', 'Close form')
                      : text('Criar novo duelo', 'Create new duel')}
                  </button>
                </div>

                {showDuelForm && (
                  <div className="rounded-xl border border-dd-border bg-dd-surface p-5 backdrop-blur-sm shadow-sm">
                    <h3 className="font-bold text-sm text-dd-text mb-4">
                      {text('Lançar novo desafio', 'Launch a new challenge')}
                    </h3>
                    <form onSubmit={handleCreateDuel} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={duelTitle}
                            onChange={(e) => setDuelTitle(e.target.value)}
                            required
                            placeholder={text(
                              'Título do problema (Ex: Inverter String sem Built-ins)...',
                              'Problem title (e.g. Reverse a string without built-ins)...'
                            )}
                            className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-dd-text placeholder-slate-600 focus:border-blue-500/60 focus:outline-none"
                          />
                        </div>
                        <div>
                          <select
                            value={duelLanguage}
                            onChange={(e) => setDuelLanguage(e.target.value as Language)}
                            className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg/80 px-3 py-2.5 text-dd-text focus:border-blue-500/60 focus:outline-none cursor-pointer"
                          >
                            <option value="TS">TypeScript</option>
                            <option value="JS">JavaScript</option>
                            <option value="PYTHON">Python</option>
                            <option value="RUST">Rust</option>
                            <option value="GO">Go</option>
                            <option value="CPP">C++</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <textarea
                          value={duelBody}
                          onChange={(e) => setDuelBody(e.target.value)}
                          required
                          rows={4}
                          placeholder={text(
                            'Descreva o problema de algoritmo, formatos de entradas/saídas e exemplos...',
                            'Describe the algorithm problem, input/output formats, and examples...'
                          )}
                          className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg/80 px-4 py-2.5 text-dd-text placeholder-slate-600 focus:border-blue-500/60 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={creatingDuel}
                          className="bg-blue-500 text-white text-xs font-bold px-6 py-2 rounded-lg transition-all hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                        >
                          {creatingDuel ? 'Enviando...' : 'Publicar Duelo'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {duelsLoading ? (
                    <div className="col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="dd-skeleton-post dd-skeleton h-52 rounded-xl" />
                      <div className="dd-skeleton-post dd-skeleton h-52 rounded-xl" />
                    </div>
                  ) : duels.length === 0 ? (
                    <div className="col-span-2 rounded-xl border border-dd-border bg-dd-surface/10 p-12 text-center text-dd-muted text-sm">
                      {text(
                        'Nenhum duelo de código ocorrendo no momento. Inicie um novo duelo acima!',
                        'No code duels are happening right now. Start a new duel above!'
                      )}
                    </div>
                  ) : (
                    duels.map((duel) => <DuelCard key={duel.id} duel={duel} />)
                  )}
                </div>
              </div>
            )}

            {/* TAB DE RANKINGS */}
            {activeTab === 'ranking' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-dd-border bg-dd-surface p-5 backdrop-blur-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="font-bold text-lg text-dd-text flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-blue-500" />
                      {text('Quadro de líderes', 'Leaderboard')}
                    </h2>
                    <p className="text-dd-muted text-xs mt-1">
                      {text(
                        'Os desenvolvedores lendários com maior XP na comunidade Stacklyst.',
                        'The developers with the most XP in the Stacklyst community.'
                      )}
                    </p>
                  </div>
                  <div>
                    <select
                      value={leaderboardLanguage}
                      onChange={(e) => setLeaderboardLanguage(e.target.value)}
                      className="text-xs rounded-lg border border-dd-border bg-dd-bg/80 px-3 py-2 text-dd-text focus:border-blue-500/60 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="GLOBAL">Leaderboard Global</option>
                      <option value="TS">TypeScript</option>
                      <option value="JS">JavaScript</option>
                      <option value="PYTHON">Python</option>
                      <option value="RUST">Rust</option>
                      <option value="GO">Go</option>
                      <option value="CPP">C++</option>
                      <option value="JAVA">Java</option>
                      <option value="KOTLIN">Kotlin</option>
                      <option value="SWIFT">Swift</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-dd-border bg-dd-surface backdrop-blur-sm overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-dd-border bg-dd-surface text-dd-muted font-bold uppercase tracking-wider">
                        <th className="py-4 px-6 text-center w-20">Rank</th>
                        <th className="py-4 px-6">Desenvolvedor</th>
                        <th className="py-4 px-6 text-center">{text('Nível', 'Level')}</th>
                        <th className="py-4 px-6 text-right">XP Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-dd-muted font-medium">
                            {text('Carregando ranking de líderes...', 'Loading leaderboard...')}
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((row) => (
                          <tr
                            key={row.username}
                            className={`border-b border-dd-border hover:bg-dd-surface transition-colors ${
                              row.rank === 1
                                ? 'bg-blue-500/5 border-l-2 border-l-blue-400'
                                : row.rank === 2
                                  ? 'bg-slate-300/5 border-l-2 border-l-slate-400'
                                  : row.rank === 3
                                    ? 'bg-blue-700/5 border-l-2 border-l-blue-700'
                                    : ''
                            }`}
                          >
                            <td className="py-4 px-6 text-center font-extrabold text-sm text-dd-text">
                              {row.rank === 1
                                ? '🥇'
                                : row.rank === 2
                                  ? '🥈'
                                  : row.rank === 3
                                    ? '🥉'
                                    : `#${row.rank}`}
                            </td>
                            <td className="py-4 px-6 font-bold text-dd-text">
                              <Link
                                href={`/profile/${row.username}`}
                                className="flex items-center gap-3 hover:text-blue-400 transition-colors w-fit"
                              >
                                <div className="w-7 h-7 rounded-full bg-dd-surface text-dd-text flex items-center justify-center font-bold text-xs select-none">
                                  {row.username.slice(0, 2).toUpperCase()}
                                </div>
                                {row.username}
                              </Link>
                            </td>
                            <td className="py-4 px-6 text-center text-blue-400 font-mono font-bold">
                              {text('Nível', 'Level')} {row.level}
                            </td>
                            <td className="py-4 px-6 text-right font-mono font-bold text-dd-text">
                              {row.xp.toLocaleString()} XP
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </MobilePullToRefresh>
        </main>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA: GamificationWidget (Engajamento e Streak) */}
        {/* ========================================================================= */}
        {/* COLUNA LATERAL DIREITA: FeedRightSidebar */}
        {/* ========================================================================= */}
        <FeedRightSidebar
          user={initialUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loadingSearch={loadingSearch}
          weeklyActivity={weeklyActivity}
          currentDate={currentWeekDate}
        />
      </div>

      {reportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setReportModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-dd-surface border border-dd-border rounded-2xl p-5 space-y-4 text-left relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-black text-dd-text">
              {text('Denunciar postagem', 'Report post')}
            </h3>
            <p className="text-xs text-dd-muted font-semibold leading-relaxed">
              {text(
                'Ajude-nos a entender o que há de errado com esta postagem. Ela viola alguma de nossas diretrizes de comunidade?',
                'Help us understand what is wrong with this post. Does it violate our community guidelines?'
              )}
            </p>

            {reported ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-lg text-center animate-pulse">
                {text(
                  'Denúncia enviada com sucesso. Obrigado por ajudar!',
                  'Report sent. Thanks for helping!'
                )}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-dd-muted font-bold uppercase tracking-wider block">
                    {text('Motivo da denúncia', 'Report reason')}
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg px-3 py-2.5 text-dd-text focus:border-red-500/50 focus:outline-none"
                  >
                    <option value="">{text('Selecione um motivo...', 'Select a reason...')}</option>
                    <option value="Spam / Propaganda enganosa">
                      {text('Spam / Propaganda enganosa', 'Spam / Misleading advertising')}
                    </option>
                    <option value="Discurso de ódio / Ofensa">
                      {text('Discurso de ódio / Ofensa', 'Hate speech / Offense')}
                    </option>
                    <option value="Assédio / Bullying">
                      {text('Assédio / Bullying', 'Harassment / Bullying')}
                    </option>
                    <option value="Código / Conteúdo malicioso ou perigoso">
                      {text(
                        'Código / Conteúdo malicioso ou perigoso',
                        'Malicious or dangerous code / content'
                      )}
                    </option>
                    <option value="Outro motivo">{text('Outro motivo', 'Other reason')}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-dd-border">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setReportModalOpen(false);
                    }}
                    className="text-xs font-bold text-dd-muted hover:text-dd-text py-2 px-4 rounded-lg hover:bg-dd-surface transition-all cursor-pointer"
                  >
                    {text('Cancelar', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    disabled={reporting || !reportReason}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {reporting ? text('Enviando...', 'Sending...') : text('Denunciar', 'Report')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
