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
import { PostComposerExtras } from '@/components/PostComposerExtras';
import type { NotionEditorRef } from '@/components/MarkdownEditor';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { extractPostMetadata } from '@/lib/editor/extract-metadata';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { appendPostExtras, ReplyAudience, resetPostComposerExtras } from '@/lib/post-composer';
import { PostSkeletonList } from '@/components/motion/PostSkeleton';
import { NewPostsPill } from '@/components/motion/NewPostsPill';
import { PublishButton, PublishState } from '@/components/motion/PublishButton';
import { XPProgressBar } from '@/components/motion/XPProgressBar';
import { FeedEngagementCard } from '@/app/feed/FeedEngagementCard';
import { CharCounter } from '@/components/motion/CharCounter';
import { MentionDropdown } from '@/components/motion/MentionDropdown';
import { EmptyState } from '@/components/motion/EmptyState';
import { LevelUpOverlay } from '@/components/motion/LevelUpOverlay';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import { POST_CHAR_LIMIT, crossfadeVariants, springGentle } from '@/lib/motion';
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

const MarkdownEditor = dynamic(
  () => import('@/components/MarkdownEditor').then((module) => module.MarkdownEditor),
  {
    ssr: false,
    loading: () => (
      <div className="dd-skeleton-post space-y-2 py-2" aria-label="Carregando editor">
        <div className="dd-skeleton h-3.5 w-4/5 rounded-full" />
        <div className="dd-skeleton h-3.5 w-2/5 rounded-full" />
      </div>
    ),
  }
);

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

export function FeedContent({
  initialCurrentDate,
  initialUser,
  initialPosts,
  initialDuels = [],
  initialNextCursor,
  initialBookmarks = {},
}: FeedContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'quizzes' | 'duels' | 'ranking'>('feed');
  const [feedFilter, setFeedFilter] = useState<'for-you' | 'following'>('for-you');
  const [followingSort, setFollowingSort] = useState<'recent' | 'popular'>('recent');
  const [showFollowingSortMenu, setShowFollowingSortMenu] = useState(false);
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [duels, setDuels] = useState<any[]>(initialDuels);
  const [duelsLoading, setDuelsLoading] = useState(initialDuels.length === 0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLanguage, setLeaderboardLanguage] = useState<string>('GLOBAL');
  const [weeklyActivity, setWeeklyActivity] = useState<Map<number, number>>(new Map());
  const [currentWeekDate, setCurrentWeekDate] = useState(initialCurrentDate);

  // Post Form state
  const [postBody, setPostBody] = useState('');
  const [publishState, setPublishState] = useState<PublishState>('idle');
  const [composeFocused, setComposeFocused] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const getInitialCursor = (items: any[]) => {
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
  };

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
  const [newPostsCount, setNewPostsCount] = useState(0);
  const FEED_PAGE_SIZE = 10;
  const [postImage, setPostImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quotePost, setQuotePost] = useState<any | null>(null);
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

  // Mention Suggestions state
  const [mentionUsers, setMentionUsers] = useState<any[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'inline' | 'modal' | null>(null);
  const postBodyEditorRef = useRef<NotionEditorRef>(null);
  const composerContainerRef = useRef<HTMLDivElement>(null);
  const [replyAudience, setReplyAudience] = useState<ReplyAudience>('everyone');
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [postLocation, setPostLocation] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const didMountFilterEffectRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        composerContainerRef.current &&
        !composerContainerRef.current.contains(event.target as Node)
      ) {
        if (
          !postBody.trim() &&
          !quotePost &&
          !postImage &&
          !postLocation &&
          !scheduledAt &&
          !isSensitive &&
          replyAudience === 'everyone'
        ) {
          setComposeFocused(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [postBody, quotePost, postImage, postLocation, scheduledAt, isSensitive, replyAudience]);

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
        alert('Falha ao enviar denúncia.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLoadingSearch(false);
      setFeedError(null);
      return;
    }
    if (searchQuery.trim().length < 2) {
      setLoadingSearch(false);
      return;
    }
    const controller = new AbortController();
    setLoadingSearch(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&type=posts&limit=${FEED_PAGE_SIZE}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setPosts(data.items || []);
          setNextCursor(data.nextCursor || null);
          setHasMore(!!data.nextCursor);
          setFeedError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Search posts error:', err);
        setFeedError('Não foi possível atualizar a busca agora.');
      } finally {
        if (!controller.signal.aborted) setLoadingSearch(false);
      }
    }, 300);
    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [searchQuery]);

  // Carregar posts quando o filtro (Para você / Seguindo) muda
  useEffect(() => {
    const controller = new AbortController();
    const fetchFilteredPosts = async () => {
      setLoadingSearch(true);
      try {
        const url =
          feedFilter === 'following'
            ? `/api/posts?filter=following&sort=${followingSort}&limit=${FEED_PAGE_SIZE}&useCursor=true`
            : `/api/posts?limit=${FEED_PAGE_SIZE}&useCursor=true`;
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setPosts(data.items || []);
          setNextCursor(data.nextCursor || null);
          setHasMore(!!data.nextCursor);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error fetching filtered posts:', err);
      } finally {
        if (!controller.signal.aborted) setLoadingSearch(false);
      }
    };

    if (!didMountFilterEffectRef.current) {
      didMountFilterEffectRef.current = true;
      return;
    }

    if (!searchQuery.trim()) {
      void fetchFilteredPosts();
    }

    return () => controller.abort();
  }, [feedFilter, followingSort, searchQuery]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let url = '';
      if (searchQuery.trim()) {
        url = `/api/search?q=${encodeURIComponent(searchQuery)}&type=posts&limit=${FEED_PAGE_SIZE}${nextCursor ? `&cursor=${nextCursor}` : ''}`;
      } else {
        url =
          feedFilter === 'following'
            ? `/api/posts?filter=following&sort=${followingSort}&useCursor=true&limit=${FEED_PAGE_SIZE}${nextCursor ? `&cursor=${nextCursor}` : ''}`
            : `/api/posts?useCursor=true&limit=${FEED_PAGE_SIZE}${nextCursor ? `&cursor=${nextCursor}` : ''}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const fresh = (data.items || []).filter((p: { id: string }) => !ids.has(p.id));
          return [...prev, ...fresh];
        });
        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.warn('Load more posts network issue:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, searchQuery, nextCursor, feedFilter, followingSort]);

  const scrollSentinelRef = useInfiniteScroll({
    onLoadMore: loadMorePosts,
    hasMore: hasMore,
    loading: loadingMore,
  });

  const newestVisiblePostTimestamp = useMemo(() => {
    const newestPost = posts.find((post) => !post._pending && !String(post.id).startsWith('temp-'));
    return newestPost?.created_at ? new Date(newestPost.created_at).toISOString() : null;
  }, [posts]);

  const firstPageUrl = useCallback(() => {
    const params = new URLSearchParams({
      limit: String(FEED_PAGE_SIZE),
      useCursor: 'true',
    });
    if (feedFilter === 'following') {
      params.set('filter', 'following');
      params.set('sort', followingSort);
    }
    return `/api/posts?${params.toString()}`;
  }, [feedFilter, followingSort]);

  useEffect(() => {
    if (activeTab !== 'feed' || searchQuery.trim() || !newestVisiblePostTimestamp) return;

    const controller = new AbortController();
    let checking = false;

    const checkForNewPosts = async () => {
      if (checking || document.visibilityState === 'hidden') return;
      checking = true;
      try {
        const params = new URLSearchParams({
          mode: 'count',
          after: newestVisiblePostTimestamp,
        });
        if (feedFilter === 'following') params.set('filter', 'following');

        const res = await fetch(`/api/posts?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data: { count?: number } = await res.json();
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

    const interval = window.setInterval(checkForNewPosts, 30000);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [activeTab, feedFilter, newestVisiblePostTimestamp, searchQuery]);

  const handleLoadNewPosts = useCallback(async () => {
    if (refreshRequestRef.current) return;

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
      const data: { items?: any[] } = await res.json();
      const latest = data.items ?? [];

      setPosts((previousPosts) => {
        const latestIds = new Set(latest.map((post) => post.id));
        return [...latest, ...previousPosts.filter((post) => !latestIds.has(post.id))];
      });
      setNewPostsCount(0);
      setFeedError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (isAbortedRequest(err)) {
        setFeedError('A atualização demorou mais que o esperado. O feed atual foi mantido.');
      } else {
        setFeedError(
          navigator.onLine
            ? 'Não foi possível conectar ao servidor. O feed atual foi mantido; tente novamente em instantes.'
            : 'Você está sem conexão. O feed atual continuará disponível até a internet voltar.'
        );
      }
    } finally {
      window.clearTimeout(timeout);
      if (refreshRequestRef.current === controller) refreshRequestRef.current = null;
      setRefreshingPosts(false);
    }
  }, [firstPageUrl]);

  useEffect(() => {
    return () => refreshRequestRef.current?.abort();
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

  const handleBodyChange = async (val: string, inputType: 'inline' | 'modal') => {
    setPostBody(val);
    const words = val.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@') && lastWord.length >= 1) {
      const q = lastWord.slice(1);
      try {
        const res = await fetch(`/api/users/search?q=${q}`);
        if (res.ok) {
          const data = await res.json();
          setMentionUsers(data);
          setShowMentionSuggestions(true);
          setFocusedInput(inputType);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionUsers([]);
    }
  };

  const handleSelectMention = (username: string) => {
    const words = postBody.split(/\s+/);
    words[words.length - 1] = `@${username} `;
    setPostBody(words.join(' '));
    setShowMentionSuggestions(false);
    setMentionUsers([]);
  };

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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postBody.trim()) return;

    // Client-side validation
    if (postBody.trim().length < 10) {
      setPostError('O conteúdo deve ter pelo menos 10 caracteres');
      setTimeout(() => setPostError(null), 4000);
      return;
    }

    setPublishState('submitting');
    setPostError(null);

    const isFirstPost = initialPosts.length === 0;
    const tempId = `temp-${Date.now()}`;
    const postMetadata = extractPostMetadata(postBody);

    const optimisticPost = {
      id: tempId,
      title: postBody.trim().substring(0, 40) || 'Discussao Geral',
      body: postBody,
      language: postMetadata.language,
      code_snippet: null,
      image_url: postImage || null,
      created_at: new Date().toISOString(),
      view_count: 0,
      upvotes: 0,
      author: {
        username: initialUser.username,
        avatar_url: initialUser.avatar_url,
        avatar_config: initialUser.avatar_config,
        total_xp: initialUser.total_xp,
      },
      _count: { answers: 0 },
      _pending: true,
      votes: [],
      quoted_post: quotePost,
      _clientKey: tempId,
    };

    setPosts((prev) => [optimisticPost, ...prev]);

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
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === tempId
              ? {
                  ...data.post,
                  created_at: data.post.created_at || new Date().toISOString(),
                  author: optimisticPost.author,
                  _count: { answers: 0 },
                  upvotes: 0,
                  view_count: 0,
                  votes: [],
                  quoted_post: quotePost,
                  _pending: false,
                  _clientKey: tempId,
                }
              : p
          )
        );
        setPostBody('');
        setPostImage('');
        setQuotePost(null);
        setComposeFocused(false);
        const resetExtras = resetPostComposerExtras();
        setReplyAudience(resetExtras.replyAudience);
        setScheduledAt(resetExtras.scheduledAt);
        setPostLocation(resetExtras.location);
        setIsSensitive(resetExtras.isSensitive);
        setPublishState('success');
        playSound('post');
        setTimeout(() => setPublishState('idle'), 1500);

        if (data.xpResult?.xpEarned) {
          showXPToast(data.xpResult.xpEarned, data.xpResult.language);
        }
        if (isFirstPost) {
          setFirstPostToastVisible(true);
          showXPToast(50, 'Primeira postagem');
          setTimeout(() => setFirstPostToastVisible(false), 3000);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao postar');
      }
    } catch (err: any) {
      console.error(err);
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      setPostError(err.message || 'Algo deu errado. Seu rascunho foi salvo automaticamente.');
      setPublishState('idle');
      // Auto-dismiss error after 4s
      setTimeout(() => setPostError(null), 4000);
    }
  };

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

  const handleBookmarkToggle = async (postId: string) => {
    const isCurrentlySaved = !!bookmarkedPostIds[postId];
    setBookmarkedPostIds((prev) => ({
      ...prev,
      [postId]: !isCurrentlySaved,
    }));
    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
      });
      if (!res.ok) {
        setBookmarkedPostIds((prev) => ({
          ...prev,
          [postId]: isCurrentlySaved,
        }));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setBookmarkedPostIds((prev) => ({
        ...prev,
        [postId]: isCurrentlySaved,
      }));
    }
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

  const handleQuotePost = (post: any) => {
    setQuotePost(post);
    setComposeFocused(true);
    setActiveTab('feed');
    requestAnimationFrame(() => {
      postBodyEditorRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

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
        'No Stacklyst, o downvote exige uma justificativa construtiva. Escreva seu motivo para o autor melhorar:'
      );
      if (!justification || justification.trim().length <= 3) {
        alert(
          'O downvote foi cancelado. É necessária uma justificativa construtiva de pelo menos 4 caracteres.'
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

  const activeDuels = duels.filter((d) => d.status === 'ACTIVE').slice(0, 2);
  const startedTrails = initialUser.trails.filter(hasStartedTrail);

  const charRatio = postBody.length / POST_CHAR_LIMIT;
  const xpReward = extractPostMetadata(postBody).language ? 10 : 5;
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
            <p className="font-bold text-sm text-dd-text">XP Concedido!</p>
            <p className="text-xs text-dd-muted">Voce progrediu na trilha de {toastXp.language}</p>
          </div>
        </div>
      )}
      {firstPostToastVisible && (
        <div className="fixed left-1/2 top-[calc(4.5rem+env(safe-area-inset-top))] z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-dd-accent px-4 py-2 text-center text-xs font-black text-white shadow-xl shadow-blue-500/25 dd-soft-bounce sm:top-24">
          +50 XP - Primeira postagem! Bem-vindo ao Stacklyst.
        </div>
      )}

      <Sidebar user={initialUser} />

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        {/* ========================================================================= */}
        {/* COLUNA CENTRAL: O Feed Principal e PostCard */}
        {/* ========================================================================= */}
        <main
          data-testid="primary-column"
          className="flex min-h-screen w-full min-w-0 max-w-[720px] flex-grow flex-col border-r border-dd-border/60 bg-dd-bg pb-[calc(6rem+env(safe-area-inset-bottom))] md:border-l md:pb-8 xl:max-w-[820px] 2xl:max-w-[920px]"
        >
          {/* Seletor de Abas Feed / Quizzes */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md flex border-b border-dd-border/60 select-none">
            <div
              role="tablist"
              aria-label="Filtros do feed"
              data-testid="feed-tabs"
              className="relative flex min-w-0 flex-1 overflow-visible"
            >
              <button
                role="tab"
                aria-selected={feedFilter === 'for-you'}
                onClick={() => setFeedFilter('for-you')}
                className={`relative flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
                  feedFilter === 'for-you'
                    ? 'text-dd-text'
                    : 'text-dd-muted hover:text-dd-text hover:bg-dd-surface/30'
                }`}
              >
                Para você
              </button>
              <div className="relative flex flex-1">
                <button
                  role="tab"
                  aria-selected={feedFilter === 'following'}
                  onClick={() => setFeedFilter('following')}
                  className={`relative flex-1 py-3 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    feedFilter === 'following'
                      ? 'text-dd-text'
                      : 'text-dd-muted hover:text-dd-text hover:bg-dd-surface/30'
                  }`}
                >
                  Seguindo
                  {feedFilter === 'following' && (
                    <span className="text-[10px] text-dd-muted font-normal">
                      ({followingSort === 'recent' ? 'Recente' : 'Popular'})
                    </span>
                  )}
                </button>
                {feedFilter === 'following' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFollowingSortMenu(!showFollowingSortMenu);
                    }}
                    aria-label="Ordenar publicações seguidas"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-dd-surface/50 text-dd-muted hover:text-dd-text transition-colors z-10 cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${showFollowingSortMenu ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
                <AnimatePresence>
                  {showFollowingSortMenu && feedFilter === 'following' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-36 rounded-xl border border-dd-border bg-dd-surface shadow-lg backdrop-blur-xl z-50 overflow-hidden py-1"
                    >
                      <button
                        onClick={() => {
                          setFollowingSort('recent');
                          setShowFollowingSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                          followingSort === 'recent'
                            ? 'text-blue-400 font-bold bg-blue-500/5'
                            : 'text-dd-text hover:bg-dd-surface/80'
                        }`}
                      >
                        Recente
                      </button>
                      <button
                        onClick={() => {
                          setFollowingSort('popular');
                          setShowFollowingSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                          followingSort === 'popular'
                            ? 'text-blue-400 font-bold bg-blue-500/5'
                            : 'text-dd-text hover:bg-dd-surface/80'
                        }`}
                      >
                        Popular
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span
                aria-hidden="true"
                data-testid="feed-tab-indicator"
                className={cn(
                  'pointer-events-none absolute bottom-0 left-0 z-20 h-0.5 w-1/2 rounded-full bg-blue-500 transition-transform duration-200 ease-out motion-reduce:transition-none',
                  feedFilter === 'following' && 'translate-x-full'
                )}
              />
            </div>
            <button
              type="button"
              onClick={handleLoadNewPosts}
              disabled={
                refreshingPosts || loadingSearch || activeTab !== 'feed' || !!searchQuery.trim()
              }
              aria-label="Atualizar publicações"
              title="Atualizar publicações"
              className="dd-focus-ring dd-touch flex w-12 shrink-0 items-center justify-center text-dd-muted transition-colors hover:bg-dd-surface/40 hover:text-blue-500 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={cn('h-4 w-4', refreshingPosts && 'animate-spin')} />
            </button>
          </div>

          {/* Feed Tab View */}
          {activeTab === 'feed' && (
            <>
              <div
                ref={composerContainerRef}
                onClick={() => setComposeFocused(true)}
                className="relative z-20 border-b border-dd-border/60 bg-transparent px-3 pb-2 pt-3 transition-[border-color,box-shadow] duration-200 focus-within:border-blue-500/40 sm:px-4 sm:pb-2.5 sm:pt-3.5"
              >
                <form onSubmit={handleCreatePost} className="flex gap-2 sm:gap-3">
                  <div className="shrink-0 pt-0.5">
                    <AuthorAvatar
                      username={initialUser.username}
                      avatar_url={initialUser.avatar_url}
                      avatar_config={initialUser.avatar_config}
                      size="md"
                      className="!h-9 !w-9 sm:!h-10 sm:!w-10"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="relative">
                      <MarkdownEditor
                        ref={postBodyEditorRef}
                        value={postBody}
                        onChange={(value) => handleBodyChange(value, 'inline')}
                        onFocus={() => setComposeFocused(true)}
                        maxLength={POST_CHAR_LIMIT}
                        minHeight={
                          composeFocused ||
                          Boolean(postBody.trim()) ||
                          Boolean(quotePost) ||
                          Boolean(postLocation) ||
                          Boolean(scheduledAt) ||
                          isSensitive ||
                          replyAudience !== 'everyone'
                            ? '3.5rem'
                            : '1.75rem'
                        }
                        placeholder="O que você está construindo hoje?"
                        className="feed-composer-editor"
                      />
                      {(composeFocused || postBody.trim().length > 0) && (
                        <div className="absolute bottom-0 right-0">
                          <CharCounter text={postBody} limit={POST_CHAR_LIMIT} />
                        </div>
                      )}
                      <MentionDropdown
                        query={postBody.split(/\s+/).at(-1)?.replace(/^@/, '') || ''}
                        visible={showMentionSuggestions && focusedInput === 'inline'}
                        onSelect={handleSelectMention}
                        onClose={() => {
                          setShowMentionSuggestions(false);
                          setMentionUsers([]);
                        }}
                      />
                    </div>

                    {quotePost && (
                      <div className="dd-quote-card my-2 rounded-2xl border border-dd-border bg-dd-bg/60 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-dd-muted">
                            Citando @{quotePost.author.username}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuotePost(null)}
                            className="dd-touch rounded-full p-1 text-dd-muted transition-colors hover:bg-dd-surface hover:text-dd-text"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="line-clamp-2 text-xs text-dd-muted">
                          {quotePost.body.replace(/```[\s\S]*?```/g, '').substring(0, 120)}
                        </p>
                      </div>
                    )}

                    {postError && (
                      <p className="my-1 text-[11px] font-medium text-red-400">{postError}</p>
                    )}

                    {postImage && (
                      <div className="relative my-2 rounded-xl overflow-hidden border border-dd-border max-h-60 bg-dd-bg">
                        <Image
                          src={postImage}
                          alt="Preview"
                          width={800}
                          height={240}
                          className="w-full h-full object-cover max-h-60"
                        />
                        <button
                          type="button"
                          onClick={() => setPostImage('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/85 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {(composeFocused ||
                      Boolean(postBody.trim()) ||
                      Boolean(quotePost) ||
                      Boolean(postLocation) ||
                      Boolean(scheduledAt) ||
                      isSensitive ||
                      replyAudience !== 'everyone') && (
                      <div className="my-2 border-b border-dd-border/40 pb-2 animate-slide-up">
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
                    )}

                    <div
                      className={cn(
                        'flex flex-wrap items-center gap-x-2 gap-y-1',
                        composeFocused ||
                          Boolean(postBody.trim()) ||
                          Boolean(quotePost) ||
                          Boolean(postLocation) ||
                          Boolean(scheduledAt) ||
                          isSensitive ||
                          replyAudience !== 'everyone'
                          ? 'pt-1'
                          : 'pt-2'
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-1 text-blue-500">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="inline-file-upload"
                          />
                          <label
                            htmlFor="inline-file-upload"
                            className="dd-touch inline-flex items-center justify-center rounded-full p-2 transition-colors hover:bg-blue-500/10 cursor-pointer"
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
                        </div>

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

                      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                        {uploadingImage && (
                          <span className="text-[10px] text-dd-muted animate-pulse font-semibold">
                            Enviando imagem...
                          </span>
                        )}
                        <PublishButton
                          disabled={
                            !postBody.trim() || uploadingImage || postBody.length >= POST_CHAR_LIMIT
                          }
                          state={publishState}
                          xpReward={xpReward}
                          className="px-3 text-xs sm:px-4 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {feedError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs font-semibold text-red-300">
                  {feedError}
                </div>
              )}

              <div className="flex flex-col">
                {loadingSearch ? (
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
                              handleBookmarkToggle(postId);
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
                  <PostSkeletonList count={2} variant="feed" label="Carregando mais publicações" />
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
                  Responda ao quiz diário curado para ganhar bônus de +15 XP.
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
                        Quiz Diário do Dia (+15 XP)
                      </span>
                    </div>
                    <span className="text-[10px] text-dd-muted flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> Rotativo Diário
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
                    ⚔️ Arena de Duelos
                  </h2>
                  <p className="text-dd-muted text-xs mt-1">
                    Crie um duelo e aguarde matchmaking, ou entre em duelos abertos criados pela
                    comunidade.
                  </p>
                </div>
                <button
                  onClick={() => setShowDuelForm(!showDuelForm)}
                  className="bg-blue-500 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-colors hover:bg-blue-600 whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(0, 131, 254,0.15)] flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  {showDuelForm ? 'Fechar Formulário' : 'Criar Novo Duelo'}
                </button>
              </div>

              {showDuelForm && (
                <div className="rounded-xl border border-dd-border bg-dd-surface p-5 backdrop-blur-sm shadow-sm">
                  <h3 className="font-bold text-sm text-dd-text mb-4">Lançar Novo Desafio</h3>
                  <form onSubmit={handleCreateDuel} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={duelTitle}
                          onChange={(e) => setDuelTitle(e.target.value)}
                          required
                          placeholder="Título do problema (Ex: Inverter String sem Built-ins)..."
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
                        placeholder="Descreva o problema de algoritmo, formatos de entradas/saídas e exemplos..."
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
                    Nenhum duelo de código ocorrendo no momento. Inicie um novo duelo acima!
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
                    🏆 Quadro de Líderes
                  </h2>
                  <p className="text-dd-muted text-xs mt-1">
                    Os desenvolvedores lendários com maior XP na comunidade Stacklyst.
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
                      <th className="py-4 px-6 text-center">Nível</th>
                      <th className="py-4 px-6 text-right">XP Acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-dd-muted font-medium">
                          Carregando ranking de líderes...
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
                            Nível {row.level}
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
          duels={duels}
          duelsLoading={duelsLoading}
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
            <h3 className="text-sm font-black text-dd-text">Denunciar Postagem</h3>
            <p className="text-xs text-dd-muted font-semibold leading-relaxed">
              Ajude-nos a entender o que há de errado com esta postagem. Ela viola alguma de nossas
              diretrizes de comunidade?
            </p>

            {reported ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3 rounded-lg text-center animate-pulse">
                Denúncia enviada com sucesso. Obrigado por ajudar!
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-dd-muted font-bold uppercase tracking-wider block">
                    Motivo da denúncia
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-dd-border bg-dd-bg px-3 py-2.5 text-dd-text focus:border-red-500/50 focus:outline-none"
                  >
                    <option value="">Selecione um motivo...</option>
                    <option value="Spam / Propaganda enganosa">Spam / Propaganda enganosa</option>
                    <option value="Discurso de ódio / Ofensa">Discurso de ódio / Ofensa</option>
                    <option value="Assédio / Bullying">Assédio / Bullying</option>
                    <option value="Código / Conteúdo malicioso ou perigoso">
                      Código / Conteúdo malicioso ou perigoso
                    </option>
                    <option value="Outro motivo">Outro motivo</option>
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
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => e.stopPropagation()}
                    disabled={reporting || !reportReason}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {reporting ? 'Enviando...' : 'Denunciar'}
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
