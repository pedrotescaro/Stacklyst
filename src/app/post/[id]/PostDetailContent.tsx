'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';
import type { AchievementBadge } from '@/components/AchievementShowcase';
import { LevelBadge } from '@/components/LevelBadge';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import { QuizWidget } from '@/components/QuizWidget';
import { AnswerThread, countAnswers, removeAnswerFromTree } from '@/components/AnswerThread';
import type { AnswerNode } from '@/components/answer-types';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Sparkles,
  MessageCircle,
  ArrowLeft,
  Flag,
  Check,
  Zap,
  Pin,
  PinOff,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { PostActionsBar, postActionClassName, InteractionCount } from '@/components/PostActionsBar';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { LikeButton } from '@/components/motion/LikeButton';
import {
  openReplyComposer,
  ReplyComposerForm,
  REPLY_CREATED_EVENT,
  type ReplyCreatedDetail,
} from '@/components/composer/ReplyComposerDialog';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostAttachments } from '@/components/posts/PostAttachments';
import { ReportPostDialog } from '@/components/posts/ReportPostDialog';
import { ThreadAncestors } from '@/components/posts/ThreadAncestors';
import { ReplyEditForm } from '@/components/replies/ReplyEditForm';
import { ReplyOwnerMenu } from '@/components/replies/ReplyOwnerMenu';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { PostLocation, SensitiveContentGate } from '@/components/PostPresentation';
import { parsePostExtras } from '@/lib/post-composer';
import { findAnswerPath } from '@/lib/answer-threads';
import { parseReplyMedia } from '@/lib/reply-media';
import { isKlipyMediaUrl } from '@/lib/klipy';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import {
  POST_BOOKMARK_CHANGED,
  writePostBookmark,
  type PostBookmarkChange,
} from '@/lib/client/post-bookmarks';
import { POST_PIN_CHANGED, writePostPin, type PostPinChange } from '@/lib/client/post-pins';

type AnswerDetailNode = AnswerNode & {
  is_accepted?: boolean;
  view_count?: number;
  reposts_count?: number;
  votes?: Array<{ value: number }>;
  user_vote?: 'up' | 'down' | null;
};

interface PostDetailContentProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    total_xp: number;
    streak?: number;
    last_active_at?: string | null;
    trails?: Array<{ id: string; language: string; level: number; xp: number; streak: number }>;
    badges?: AchievementBadge[];
  };
  post: any;
  initialIsSaved?: boolean;
  focusedAnswerId?: string;
}

function containsAnswerId(answers: AnswerNode[] | undefined, id: string): boolean {
  if (!answers) return false;
  return answers.some((node) => node.id === id || containsAnswerId(node.replies, id));
}

function insertReplyIntoTree(answers: AnswerNode[], newReply: AnswerNode): AnswerNode[] {
  if (containsAnswerId(answers, newReply.id)) return answers;
  if (!newReply.parent_id) return [...answers, newReply];
  let inserted = false;
  const append = (nodes: AnswerNode[]): AnswerNode[] =>
    nodes.map((answer) => {
      if (answer.id === newReply.parent_id) {
        inserted = true;
        return { ...answer, replies: [...(answer.replies ?? []), newReply] };
      }
      if (answer.replies?.length) {
        return { ...answer, replies: append(answer.replies) };
      }
      return answer;
    });
  const next = append(answers);
  return inserted ? next : [...next, newReply];
}

function updateAnswerInTree(
  answers: AnswerNode[],
  targetId: string,
  updater: (node: AnswerDetailNode) => AnswerDetailNode
): AnswerNode[] {
  let changed = false;
  const visit = (nodes: AnswerNode[]): AnswerNode[] =>
    nodes.map((node) => {
      if (node.id === targetId) {
        changed = true;
        return updater(node as AnswerDetailNode);
      }
      if (node.replies?.length) {
        const nextReplies = visit(node.replies);
        if (nextReplies !== node.replies) {
          return { ...node, replies: nextReplies };
        }
      }
      return node;
    });
  const next = visit(answers);
  return changed ? next : answers;
}

function readAnswerVote(answer: AnswerDetailNode | null): 'up' | 'down' | null {
  if (!answer) return null;
  if (answer.votes?.[0]?.value === 1) return 'up';
  if (answer.votes?.[0]?.value === -1) return 'down';
  if (answer.user_vote === 'up' || answer.user_vote === 'down') return answer.user_vote;
  return null;
}

function computeVoteTransition(currentVote: 'up' | 'down' | null, type: 'up' | 'down') {
  const newValue: 0 | 1 | -1 =
    type === 'up' ? (currentVote === 'up' ? 0 : 1) : currentVote === 'down' ? 0 : -1;

  let diff = 0;
  let newUserVote: 'up' | 'down' | null = null;
  if (type === 'up') {
    diff = currentVote === 'up' ? -1 : currentVote === 'down' ? 2 : 1;
    newUserVote = currentVote === 'up' ? null : 'up';
  } else {
    diff = currentVote === 'down' ? 1 : currentVote === 'up' ? -2 : -1;
    newUserVote = currentVote === 'down' ? null : 'down';
  }

  return { newValue, diff, newUserVote };
}

function confirmDownvoteJustification(): boolean {
  const justification = prompt(
    'No Stacklyst, o downvote exige uma justificativa construtiva. Escreva seu motivo para o autor melhorar:'
  );
  if (!justification || justification.trim().length <= 3) {
    alert(
      'O downvote foi cancelado. É necessária uma justificativa construtiva de pelo menos 4 caracteres.'
    );
    return false;
  }
  return true;
}

function unwrapFocalContent(post: any, focusedAnswer: AnswerDetailNode | null) {
  if (focusedAnswer) {
    const media = parseReplyMedia(focusedAnswer.body);
    const extras = parsePostExtras(media.content);
    return {
      content: extras.content,
      attachments: media.attachments,
      music: media.music,
      poll: null,
      legacyImage: null,
      audience: null,
      location: extras.location,
      isSensitive: extras.isSensitive,
      codeSnippet: focusedAnswer.code_snippet ?? null,
    };
  }
  const extras = parsePostExtras(post.body);
  return {
    content: extras.content,
    attachments: post.attachments,
    music: post.music,
    poll: post.poll,
    legacyImage: post.image_url,
    audience: post.audience,
    location: post.location || extras.location,
    isSensitive: extras.isSensitive,
    codeSnippet: post.code_snippet ?? null,
  };
}

export function PostDetailContent({
  user,
  post: initialPost,
  initialIsSaved = false,
  focusedAnswerId,
}: PostDetailContentProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const [post, setPost] = useState<any>(initialPost);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const answers: AnswerDetailNode[] = post.answers ?? [];
  const focusedPath = focusedAnswerId ? findAnswerPath(answers, focusedAnswerId) : null;
  const focusedAnswer =
    (focusedPath?.[focusedPath.length - 1] as AnswerDetailNode | undefined) ?? null;
  const ancestorReplies = focusedPath ? focusedPath.slice(0, -1) : [];
  const visibleAnswers = focusedAnswer ? (focusedAnswer.replies ?? []) : answers;
  const focalReplyCount = countAnswers(visibleAnswers);
  const isPostAuthor = post.author_id === user.id;
  const isFocusedOwnAnswer = Boolean(focusedAnswer && focusedAnswer.author_id === user.id);
  const parentUsername = focusedAnswer
    ? ancestorReplies.length > 0
      ? ancestorReplies[ancestorReplies.length - 1].author.username
      : post.author.username
    : null;
  const parentHref = focusedAnswer
    ? ancestorReplies.length > 0
      ? `/post/${post.id}/reply/${ancestorReplies[ancestorReplies.length - 1].id}`
      : `/post/${post.id}`
    : '/';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingFocused, setEditingFocused] = useState(false);
  const [pinPending, setPinPending] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const pinLock = useRef(false);
  const [toastXp, setToastXp] = useState<{ amount: number; language: string | null } | null>(null);
  const focalRef = useRef<HTMLElement>(null);
  const previousFocusedIdRef = useRef(focusedAnswerId);

  useEffect(() => {
    const onPinChange = (event: Event) => {
      const detail = (event as CustomEvent<PostPinChange>).detail;
      if (detail.postId === post.id) {
        setPost((prev: any) => ({ ...prev, is_pinned: detail.pinned }));
      } else if (detail.pinned && post.author_id === user.id) {
        setPost((prev: any) => (prev.is_pinned ? { ...prev, is_pinned: false } : prev));
      }
    };
    window.addEventListener(POST_PIN_CHANGED, onPinChange);
    return () => window.removeEventListener(POST_PIN_CHANGED, onPinChange);
  }, [post.id, post.author_id, user.id]);

  const handlePinToggle = async () => {
    if (pinLock.current || !isPostAuthor || focusedAnswer) return;
    pinLock.current = true;
    setPinPending(true);
    setPinError(null);
    const previousPinned = Boolean(post.is_pinned);
    const nextPinned = !previousPinned;
    setPost((prev: any) => ({ ...prev, is_pinned: nextPinned }));
    try {
      const savedPinned = await writePostPin(post.id, nextPinned);
      setPost((prev: any) => ({ ...prev, is_pinned: savedPinned }));
    } catch (err) {
      setPost((prev: any) => ({ ...prev, is_pinned: previousPinned }));
      setPinError(err instanceof Error ? err.message : 'Não foi possível fixar este post.');
    } finally {
      pinLock.current = false;
      setPinPending(false);
    }
  };

  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const bookmarkLock = useRef(false);
  useEffect(() => {
    if (!bookmarkLock.current) setIsSaved(initialIsSaved);
  }, [initialIsSaved]);
  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<PostBookmarkChange>).detail;
      if (detail.postId === post.id) setIsSaved(detail.bookmarked);
    };
    window.addEventListener(POST_BOOKMARK_CHANGED, onChange);
    return () => window.removeEventListener(POST_BOOKMARK_CHANGED, onChange);
  }, [post.id]);
  const [repostState, setRepostState] = useState({
    count: post.reposts_count ?? 0,
    reposted: false,
  });
  const [focusedRepostState, setFocusedRepostState] = useState({
    count: focusedAnswer?.reposts_count ?? 0,
    reposted: false,
  });

  useEffect(() => {
    if (previousFocusedIdRef.current !== focusedAnswerId) {
      previousFocusedIdRef.current = focusedAnswerId;
      setEditingFocused(false);
      setMenuOpen(false);
      setIsExpanded(false);
      setFocusedRepostState({
        count: focusedAnswer?.reposts_count ?? 0,
        reposted: false,
      });
    }
    if (focusedAnswerId && focalRef.current) {
      const rect = focalRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.65 || rect.top < 0) {
        focalRef.current.scrollIntoView?.({ block: 'start' });
      }
    }
  }, [focusedAnswerId, focusedAnswer?.reposts_count]);

  const handleBookmarkToggle = async () => {
    if (bookmarkLock.current) return;
    bookmarkLock.current = true;
    setBookmarkPending(true);
    setBookmarkError(null);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      setIsSaved(await writePostBookmark(post.id, nextSaved));
    } catch (err) {
      setIsSaved(!nextSaved);
      setBookmarkError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      bookmarkLock.current = false;
      setBookmarkPending(false);
    }
  };

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const activeRepostState = focusedAnswer ? focusedRepostState : repostState;
  const handleRepost = () => {
    const updater = (prev: { count: number; reposted: boolean }) => ({
      count: prev.reposted ? Math.max(0, prev.count - 1) : prev.count + 1,
      reposted: !prev.reposted,
    });
    if (focusedAnswer) {
      setFocusedRepostState(updater);
    } else {
      setRepostState(updater);
    }
  };

  const handleQuotePost = () => {
    alert('Citação mockada no detalhe do post!');
  };

  const postUserVote: 'up' | 'down' | null =
    post.votes?.[0]?.value === 1 ? 'up' : post.votes?.[0]?.value === -1 ? 'down' : null;
  const postVotesCount = post.upvotes;
  const focalUserVote = focusedAnswer ? readAnswerVote(focusedAnswer) : postUserVote;
  const focalVotesCount = focusedAnswer ? (focusedAnswer.upvotes ?? 0) : postVotesCount;

  const handlePostVote = async (type: 'up' | 'down') => {
    const currentVote = postUserVote;
    const currentCount = postVotesCount;
    const { newValue, diff, newUserVote } = computeVoteTransition(currentVote, type);
    if (newValue === -1 && !confirmDownvoteJustification()) return;

    setPost((prev: any) => ({
      ...prev,
      upvotes: currentCount + diff,
      votes: newUserVote ? [{ value: newUserVote === 'up' ? 1 : -1 }] : [],
    }));

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        throw new Error('Erro ao registrar voto');
      }

      const data = await res.json();
      setPost((prev: any) => ({
        ...prev,
        upvotes: data.upvotes,
      }));
    } catch (err) {
      console.error(err);
      setPost((prev: any) => ({
        ...prev,
        upvotes: currentCount,
        votes: currentVote ? [{ value: currentVote === 'up' ? 1 : -1 }] : [],
      }));
    }
  };

  const handleAnswerVote = async (targetAnswer: AnswerDetailNode, type: 'up' | 'down') => {
    const currentVote = readAnswerVote(targetAnswer);
    const currentCount = targetAnswer.upvotes ?? 0;
    const { newValue, diff, newUserVote } = computeVoteTransition(currentVote, type);
    if (newValue === -1 && !confirmDownvoteJustification()) return;

    const patchAnswerVote = (votesCount: number, vote: 'up' | 'down' | null) => {
      setPost((prev: any) => ({
        ...prev,
        answers: updateAnswerInTree(prev.answers ?? [], targetAnswer.id, (node) => ({
          ...node,
          upvotes: votesCount,
          user_vote: vote,
          votes: vote ? [{ value: vote === 'up' ? 1 : -1 }] : [],
        })),
      }));
    };

    patchAnswerVote(currentCount + diff, newUserVote);

    try {
      const res = await fetch(`/api/answers/${targetAnswer.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        throw new Error('Erro ao registrar voto');
      }

      const data = await res.json();
      patchAnswerVote(data.upvotes, newUserVote);
    } catch (err) {
      console.error(err);
      patchAnswerVote(currentCount, currentVote);
    }
  };

  const handleFocalVote = (type: 'up' | 'down') =>
    focusedAnswer ? handleAnswerVote(focusedAnswer, type) : handlePostVote(type);

  // Recarregar os dados do post
  const reloadPost = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      }
    } catch (err) {
      console.error('Error reloading post:', err);
    }
  };

  // Both inline and pop-up composers send the saved answer, including its parent.
  useEffect(() => {
    const onReply = (event: Event) => {
      const detail = (event as CustomEvent<ReplyCreatedDetail>).detail;
      if (detail.postId !== post.id) return;
      setPost((current: any) => ({
        ...current,
        answers: insertReplyIntoTree(current.answers ?? [], detail.answer),
      }));
      if (detail.xpResult?.xpEarned)
        showXPToast(detail.xpResult.xpEarned, detail.xpResult.language);
    };
    window.addEventListener(REPLY_CREATED_EVENT, onReply);
    return () => window.removeEventListener(REPLY_CREATED_EVENT, onReply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const showXPToast = (amount: number, language: string | null) => {
    setToastXp({ amount, language });
    playSound('xpgain');
    setTimeout(() => {
      setToastXp(null);
    }, 4000);
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const res = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        await reloadPost();

        if (data.xpResult?.xpEarned) {
          showXPToast(data.xpResult.xpEarned, data.xpResult.language);
        }
      }
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
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

  const presentedFocal = unwrapFocalContent(post, focusedAnswer);
  const focalAuthor = focusedAnswer ? focusedAnswer.author : post.author;
  const focalCreatedAt = focusedAnswer ? focusedAnswer.created_at : post.created_at;
  const focalViewCount = focusedAnswer ? focusedAnswer.view_count : post.view_count;
  const focalAuthorIdentity = readProfileIdentity(focalAuthor.avatar_config);
  const focalSharePath = focusedAnswer
    ? `/post/${post.id}/reply/${focusedAnswer.id}`
    : `/post/${post.id}`;

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-blue-500/35 selection:text-white">
      {/* XP Toast */}
      {toastXp && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right rounded-xl border border-emerald-500/30 bg-dd-surface/90 backdrop-blur-xl p-4 shadow-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-base ring-1 ring-emerald-500/30">
            +{toastXp.amount}
          </div>
          <div>
            <p className="font-bold text-sm text-dd-text">XP Concedido!</p>
            <p className="text-xs text-dd-muted">
              {toastXp.language
                ? text(
                    `Você progrediu na trilha de ${toastXp.language}`,
                    `You progressed in the ${toastXp.language} trail`
                  )
                : text('Sua participação rendeu XP.', 'You earned XP for participating.')}
            </p>
          </div>
        </div>
      )}

      <Sidebar user={user} />

      <div className="dd-platform-body mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main
          data-testid="primary-column"
          className="dd-platform-main flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-dd-border/60 bg-dd-bg pb-24 md:border-x md:pb-8"
        >
          {/* Header (Twitter style: Back arrow + Title) */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md border-b border-dd-border/60 px-4 py-3 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (focusedAnswer && typeof window !== 'undefined' && window.history.length <= 1) {
                  router.push(parentHref);
                  return;
                }
                router.back();
              }}
              className="flex items-center text-dd-muted hover:text-dd-text transition-colors cursor-pointer"
              style={{ background: 'transparent', border: 'none', padding: '4px' }}
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-dd-text text-base font-extrabold tracking-tight">Post</h1>
            </div>
          </div>

          {focusedAnswer && <ThreadAncestors post={post} ancestors={ancestorReplies} />}

          {/* Post Detail Card (root post or focal reply treated as post) */}
          <article
            ref={focalRef}
            data-testid={focusedAnswer ? 'focal-reply-article' : 'focal-post-article'}
            className={cn(
              'bg-transparent border-b border-dd-border/50 scroll-mt-14 space-y-6',
              focusedAnswer ? 'px-4 sm:px-6 pt-2 pb-4 sm:pb-6' : 'p-4 sm:p-6'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <Link
                  href={`/profile/${focalAuthor.username}`}
                  className="hover:opacity-85 transition-opacity shrink-0 pt-0.5"
                >
                  <AuthorAvatar
                    username={focalAuthor.username}
                    avatar_url={focalAuthor.avatar_url}
                    avatar_config={focalAuthor.avatar_config}
                    size="md"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  {/* Top row: Display Name, Flags, Title, Level (>= 5) */}
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <Link
                      href={`/profile/${focalAuthor.username}`}
                      className="hover:underline truncate group/author min-w-0"
                    >
                      <span className="text-xs sm:text-sm font-bold text-dd-text truncate min-w-0 group-hover/author:underline">
                        <ProfileName config={focalAuthor.avatar_config}>
                          {getAuthorDisplayName(focalAuthor)}
                        </ProfileName>
                      </span>
                    </Link>
                    {focalAuthorIdentity.flags && focalAuthorIdentity.flags.length > 0 && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        {focalAuthorIdentity.flags.map((code) => (
                          <ProfileFlag key={code} code={code} />
                        ))}
                      </span>
                    )}
                    {focalAuthorIdentity.title && (
                      <ProfileTitle title={focalAuthorIdentity.title} />
                    )}
                    <LevelBadge totalXp={focalAuthor.total_xp ?? 0} />
                  </div>

                  {/* Bottom row: @username */}
                  <div className="mt-0.5 text-[11px] text-dd-muted font-medium">
                    <Link
                      href={`/profile/${focalAuthor.username}`}
                      className="hover:underline truncate"
                    >
                      @{focalAuthor.username.toLowerCase()}
                    </Link>
                  </div>
                </div>
              </div>

              {focusedAnswer ? (
                <div className="flex items-center gap-2 shrink-0">
                  {isPostAuthor && !focusedAnswer.is_accepted && (
                    <button
                      type="button"
                      onClick={() => handleAcceptAnswer(focusedAnswer.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                    >
                      <Check className="h-3 w-3" />
                      <span>Aceitar</span>
                    </button>
                  )}
                  {isFocusedOwnAnswer && (
                    <ReplyOwnerMenu
                      answerId={focusedAnswer.id}
                      onEdit={() => setEditingFocused(true)}
                      onDeleted={() => {
                        router.push(parentHref);
                        router.refresh();
                      }}
                    />
                  )}
                </div>
              ) : isPostAuthor ? (
                <button
                  type="button"
                  onClick={() => void handlePinToggle()}
                  disabled={pinPending}
                  aria-pressed={Boolean(post.is_pinned)}
                  title={
                    post.is_pinned
                      ? text('Desafixar post principal do perfil', 'Unpin main profile post')
                      : text('Fixar como post principal do perfil', 'Pin as main profile post')
                  }
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors shrink-0 cursor-pointer disabled:opacity-50',
                    post.is_pinned
                      ? 'border-dd-accent/40 bg-dd-accent/15 text-dd-accent hover:bg-dd-accent/25'
                      : 'border-dd-border bg-dd-surface/50 text-dd-muted hover:text-dd-text hover:bg-dd-surface'
                  )}
                >
                  {post.is_pinned ? (
                    <>
                      <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{text('Fixado no perfil', 'Pinned to profile')}</span>
                    </>
                  ) : (
                    <>
                      <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{text('Fixar no perfil', 'Pin to profile')}</span>
                    </>
                  )}
                </button>
              ) : post.is_pinned ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-accent/30 bg-dd-accent/10 px-2.5 py-1 text-[11px] font-semibold text-dd-accent shrink-0">
                  <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{text('Fixado no perfil', 'Pinned to profile')}</span>
                </span>
              ) : null}
            </div>
            {pinError && (
              <p role="alert" className="text-xs text-red-400">
                {pinError}
              </p>
            )}

            {focusedAnswer && parentUsername && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-dd-muted">
                <span>
                  Respondendo a{' '}
                  <Link href={parentHref} className="text-dd-accent hover:underline">
                    @{parentUsername.toLowerCase()}
                  </Link>
                </span>
                {focusedAnswer.is_accepted && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <Check className="h-3 w-3" />
                    Resposta aceita
                  </span>
                )}
              </div>
            )}

            {focusedAnswer && editingFocused ? (
              <ReplyEditForm
                answerId={focusedAnswer.id}
                body={focusedAnswer.body}
                onSaved={(newBody) => {
                  setPost((prev: any) => ({
                    ...prev,
                    answers: updateAnswerInTree(prev.answers ?? [], focusedAnswer.id, (node) => ({
                      ...node,
                      body: newBody,
                    })),
                  }));
                  setEditingFocused(false);
                }}
                onCancel={() => setEditingFocused(false)}
              />
            ) : (
              <SensitiveContentGate isSensitive={presentedFocal.isSensitive}>
                {presentedFocal.content && (
                  <MarkdownRenderer content={presentedFocal.content} compact={false} />
                )}
                <PostAttachments
                  postId={focusedAnswer?.id ?? post.id}
                  attachments={presentedFocal.attachments}
                  music={presentedFocal.music}
                  poll={presentedFocal.poll}
                  legacyImage={presentedFocal.legacyImage}
                  audience={presentedFocal.audience}
                />

                {presentedFocal.codeSnippet && !presentedFocal.content.includes('```') && (
                  <div className="rounded-lg border border-dd-border bg-dd-bg p-4 overflow-x-auto shadow-inner">
                    {highlightCode(presentedFocal.codeSnippet)}
                  </div>
                )}
              </SensitiveContentGate>
            )}

            {/* Metadata Row: Time, Date, Views (Twitter style) */}
            <div className="text-[11px] text-dd-muted font-medium pt-3 border-t border-dd-border/30 flex flex-wrap items-center gap-1.5 select-none">
              <span>
                {new Date(focalCreatedAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>·</span>
              <span>
                {new Date(focalCreatedAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {presentedFocal.location && (
                <>
                  <span>·</span>
                  <PostLocation location={presentedFocal.location} className="max-w-48" />
                </>
              )}
              {typeof focalViewCount === 'number' && (
                <>
                  <span>·</span>
                  <span className="text-dd-text font-bold">
                    {focalViewCount >= 1000
                      ? `${(focalViewCount / 1000).toFixed(0)} mil`
                      : focalViewCount}
                  </span>
                  <span>Visualizações</span>
                </>
              )}
            </div>

            {/* Post bottom actions section: the divider bleeds to the column borders. */}
            <div
              className="-mx-4 sm:-mx-6 px-4 sm:px-6 pt-2.5 mt-2 border-t border-dd-border/50 text-xs select-none text-dd-muted"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <PostActionsBar>
                <button
                  type="button"
                  className={postActionClassName}
                  title="Responder"
                  aria-label={`Responder (${focalReplyCount} respostas)`}
                  onClick={() => {
                    const replyTarget = focusedAnswer
                      ? {
                          ...focusedAnswer,
                          postId: post.id,
                          parentAnswer: {
                            id: focusedAnswer.id,
                            username: focusedAnswer.author.username,
                          },
                        }
                      : post;
                    if (!openReplyComposer(replyTarget)) setIsExpanded(true);
                  }}
                >
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                  <InteractionCount count={focalReplyCount} />
                </button>

                {/* 2. Repost Menu */}
                <RepostMenu
                  appearance="post"
                  count={activeRepostState.count}
                  isReposted={activeRepostState.reposted}
                  onRepost={handleRepost}
                  onQuote={handleQuotePost}
                />

                {/* 3. Heart/Like button */}
                <LikeButton
                  appearance="post"
                  count={focalVotesCount}
                  isActive={focalUserVote === 'up'}
                  onToggle={() => handleFocalVote('up')}
                  title={focusedAnswer ? 'Curtir resposta' : 'Curtir post'}
                />

                {/* 4. BookmarkButton */}
                <BookmarkButton
                  appearance="post"
                  isSaved={isSaved}
                  onToggle={handleBookmarkToggle}
                  disabled={bookmarkPending}
                />
                {bookmarkError && (
                  <span role="alert" className="text-xs text-red-400">
                    {bookmarkError}
                  </span>
                )}

                {/* 5. Share Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const url =
                        typeof window !== 'undefined'
                          ? `${window.location.origin}${focalSharePath}`
                          : focalSharePath;
                      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
                        try {
                          await navigator.share({
                            title: focusedAnswer
                              ? `Resposta de @${focusedAnswer.author.username}`
                              : post.title || 'Stacklyst Post',
                            text: presentedFocal.content.substring(0, 100),
                            url,
                          });
                          return;
                        } catch {
                          // fallback
                        }
                      }
                      try {
                        await navigator.clipboard.writeText(url);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      } catch (err) {
                        console.error('Failed to copy share link:', err);
                      }
                    }}
                    className={`${postActionClassName} hover:bg-blue-500/10 hover:text-blue-400`}
                    title={focusedAnswer ? 'Compartilhar resposta' : 'Compartilhar post'}
                  >
                    {shareCopied ? (
                      <Check className="w-[18px] h-[18px] text-emerald-400" />
                    ) : (
                      <Share2 className="w-[18px] h-[18px]" />
                    )}
                  </button>
                  {shareCopied && (
                    <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-dd-surface border border-dd-border text-dd-text text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl animate-slide-up z-50">
                      Link copiado!
                    </div>
                  )}
                </div>

                {/* 6. More Options (...) */}
                {!isFocusedOwnAnswer && (
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setMenuOpen(!menuOpen);
                      }}
                      className={`${postActionClassName} hover:bg-blue-500/10 hover:text-blue-400`}
                      ref={menuButtonRef}
                      aria-expanded={menuOpen}
                      title={text('Mais opções', 'More options')}
                    >
                      <MoreHorizontal className="w-[18px] h-[18px]" />
                    </button>

                    {menuOpen && (
                      <div
                        className="absolute right-0 bottom-full mb-1.5 w-48 rounded-2xl border border-dd-border/80 bg-dd-surface p-1.5 shadow-2xl z-40 animate-slide-up"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        {!focusedAnswer && isPostAuthor ? (
                          <button
                            type="button"
                            disabled={pinPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setMenuOpen(false);
                              void handlePinToggle();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-dd-text hover:bg-dd-bg transition-colors cursor-pointer text-left disabled:opacity-50"
                          >
                            {post.is_pinned ? (
                              <>
                                <PinOff className="w-4 h-4 text-dd-muted" />
                                <span>{text('Desafixar do perfil', 'Unpin from profile')}</span>
                              </>
                            ) : (
                              <>
                                <Pin className="w-4 h-4 text-dd-accent" />
                                <span>{text('Fixar no perfil', 'Pin to profile')}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setReportModalOpen(true);
                              setMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-dd-text hover:bg-dd-bg transition-colors cursor-pointer text-left"
                          >
                            <Flag className="w-4 h-4 text-dd-muted" />
                            <span>{text('Denunciar', 'Report')}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </PostActionsBar>
            </div>
          </article>

          {/* Resolver como Quiz button outside/below the post box (Duolingo style) */}
          {!focusedAnswer &&
            post.quizzes &&
            post.quizzes.length > 0 &&
            (() => {
              const hasCompleted = Boolean(
                post.quizzes[0].attempts && post.quizzes[0].attempts.length > 0
              );
              return (
                <div className="px-4 sm:px-6 py-4 border-b border-dd-border/50 flex flex-col gap-4">
                  {/* Duolingo style quiz card */}
                  <div
                    onClick={() => setShowQuiz(!showQuiz)}
                    className={cn(
                      'p-4 rounded-2xl border-2 border-b-4 transition-all duration-200 group/quiz cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                      hasCompleted
                        ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-950/30'
                        : 'border-blue-500/40 bg-blue-950/20 hover:border-blue-400 hover:bg-blue-950/30'
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl border-2 border-b-4 flex items-center justify-center shrink-0 shadow-md group-hover/quiz:scale-105 transition-transform duration-200',
                          hasCompleted
                            ? 'border-emerald-600 bg-emerald-500 text-white'
                            : 'border-blue-600 bg-blue-500 text-white'
                        )}
                      >
                        {hasCompleted ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <Sparkles className="w-6 h-6 fill-white stroke-[2.5]" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase tracking-widest',
                              hasCompleted ? 'text-emerald-400' : 'text-blue-400'
                            )}
                          >
                            {hasCompleted ? 'Desafio Concluído' : 'Quiz de Aprendizado'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-black border-2 border-b-[3px] border-amber-500/40 bg-amber-500/15 text-amber-300">
                            <Zap className="w-3.5 h-3.5 fill-amber-300 stroke-none" />
                            +15 XP
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white tracking-tight mt-0.5">
                          {hasCompleted
                            ? 'Você já completou este desafio!'
                            : 'Coloque seus conhecimentos em prática e ganhe XP!'}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={cn(
                        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all duration-150 shrink-0 self-start sm:self-auto cursor-pointer border-b-[4px] active:border-b-0 active:translate-y-[4px]',
                        hasCompleted
                          ? 'border-emerald-700 bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'border-blue-700 bg-blue-500 hover:bg-blue-400 shadow-md shadow-blue-500/20'
                      )}
                    >
                      {showQuiz ? (
                        <span>Ocultar Quiz</span>
                      ) : hasCompleted ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Ver Resultados</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-white" />
                          <span>Resolver Quiz</span>
                        </>
                      )}
                    </button>
                  </div>

                  {showQuiz && (
                    <div className="rounded-2xl border-2 border-b-4 border-dd-border/80 bg-dd-card p-2 sm:p-4 backdrop-blur-sm shadow-lg">
                      <QuizWidget
                        quiz={post.quizzes[0]}
                        postId={post.id}
                        attempted={post.quizzes[0].attempts && post.quizzes[0].attempts.length > 0}
                        userAnswer={post.quizzes[0].attempts?.[0]?.selected_index}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

          {/* Write Answer Form */}
          {!isExpanded ? (
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center justify-between gap-4 p-4 border-b border-dd-border/50 bg-transparent cursor-pointer hover:bg-dd-surface/5 transition-colors"
            >
              <div className="flex items-center gap-3 flex-grow">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={36}
                    height={36}
                    unoptimized={isKlipyMediaUrl(user.avatar_url)}
                    className="w-9 h-9 rounded-full object-cover border border-dd-border shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10 shrink-0">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-dd-muted select-none">Postar sua resposta</span>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-full bg-dd-accent px-5 py-2 text-sm font-semibold text-white"
              >
                Responder
              </button>
            </div>
          ) : (
            <div className="relative z-10 border-b border-dd-border/50 bg-transparent">
              <ReplyComposerForm
                postId={post.id}
                parentAnswer={
                  focusedAnswer
                    ? { id: focusedAnswer.id, username: focusedAnswer.author.username }
                    : undefined
                }
                surfaceVariant="inline"
                user={user}
                onCancel={() => setIsExpanded(false)}
                onDone={() => setIsExpanded(false)}
              />
            </div>
          )}

          {/* Answers List Section */}
          <AnswerThread
            answers={visibleAnswers}
            isPostAuthor={isPostAuthor}
            currentUser={user}
            postId={post.id}
            onAccept={handleAcceptAnswer}
            onAnswerDeleted={(id) =>
              setPost((prev: any) => ({
                ...prev,
                answers: removeAnswerFromTree(prev.answers ?? [], id),
              }))
            }
          />
        </main>
        <FeedRightSidebar user={user} />
      </div>

      {reportModalOpen && (
        <ReportPostDialog
          postId={post.id}
          onClose={() => setReportModalOpen(false)}
          returnFocusRef={menuButtonRef}
        />
      )}
    </div>
  );
}
