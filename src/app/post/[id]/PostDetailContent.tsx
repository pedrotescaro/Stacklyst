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
import { AnswerThread } from '@/components/AnswerThread';
import type { AnswerNode } from '@/components/answer-types';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Sparkles,
  MessageCircle,
  ArrowLeft,
  Flag,
  X,
  Check,
  Zap,
  Share2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { PostActionsBar, postActionClassName, InteractionCount } from '@/components/PostActionsBar';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { LikeButton } from '@/components/motion/LikeButton';
import {
  openReplyComposer,
  ReplyComposerForm,
  REPLY_CREATED_EVENT,
} from '@/components/composer/ReplyComposerDialog';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostAttachments } from '@/components/posts/PostAttachments';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { PostLocation, SensitiveContentGate } from '@/components/PostPresentation';
import { parsePostExtras } from '@/lib/post-composer';
import { cn } from '@/lib/cn';
import {
  POST_BOOKMARK_CHANGED,
  writePostBookmark,
  type PostBookmarkChange,
} from '@/lib/client/post-bookmarks';

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
}

/**
 * Recursively inserts a new reply into the answer tree under the answer whose
 * id matches `parentId`. Returns a new tree (does not mutate the input).
 * If the parent cannot be found (e.g. its level wasn't fetched from the server
 * because it was beyond the include depth), the reply is appended to the
 * nearest ancestor that was found, so it still surfaces in the UI.
 */
function insertReplyIntoTree(
  answers: AnswerNode[],
  parentId: string,
  newReply: AnswerNode
): AnswerNode[] {
  const insert = (node: AnswerNode): AnswerNode => {
    if (node.id === parentId) {
      return { ...node, replies: [...(node.replies ?? []), newReply] };
    }
    if (node.replies && node.replies.length > 0) {
      return { ...node, replies: node.replies.map(insert) };
    }
    return node;
  };

  const next = answers.map(insert);
  return next.some((node) => node.id === parentId || containsId(node.replies, parentId))
    ? next
    : [...next, newReply];
}

/** Returns true if the given id exists anywhere in the answer subtree. */
function containsId(answers: AnswerNode[] | undefined, id: string): boolean {
  if (!answers) return false;
  return answers.some((node) => node.id === id || containsId(node.replies, id));
}

export function PostDetailContent({
  user,
  post: initialPost,
  initialIsSaved = false,
}: PostDetailContentProps) {
  const router = useRouter();
  const [post, setPost] = useState<any>(initialPost);
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastXp, setToastXp] = useState<{ amount: number; language: string } | null>(null);

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

  // Report post state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/report`, {
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

  const handleRepost = () => {
    setRepostState((prev) => ({
      count: prev.reposted ? Math.max(0, prev.count - 1) : prev.count + 1,
      reposted: !prev.reposted,
    }));
  };

  const handleQuotePost = () => {
    alert('Citação mockada no detalhe do post!');
  };

  const postUserVote =
    post.votes?.[0]?.value === 1 ? 'up' : post.votes?.[0]?.value === -1 ? 'down' : null;
  const postVotesCount = post.upvotes;

  const handlePostVote = async (type: 'up' | 'down') => {
    const currentVote = postUserVote;
    const currentCount = postVotesCount;
    let newValue = 0;

    if (type === 'up') {
      newValue = currentVote === 'up' ? 0 : 1;
    } else {
      newValue = currentVote === 'down' ? 0 : -1;
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
      if (currentVote === 'up') {
        diff = -1;
        newUserVote = null;
      } else if (currentVote === 'down') {
        diff = 2;
        newUserVote = 'up';
      } else {
        diff = 1;
        newUserVote = 'up';
      }
    } else {
      if (currentVote === 'down') {
        diff = 1;
        newUserVote = null;
      } else if (currentVote === 'up') {
        diff = -2;
        newUserVote = 'down';
      } else {
        diff = -1;
        newUserVote = 'down';
      }
    }

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

  // Replies sent from the pop-up land here too.
  useEffect(() => {
    const onReply = (event: Event) => {
      const detail = (event as CustomEvent<{ postId: string; xpResult?: any }>).detail;
      if (detail.postId !== post.id) return;
      void reloadPost();
      if (detail.xpResult?.xpEarned)
        showXPToast(detail.xpResult.xpEarned, detail.xpResult.language);
    };
    window.addEventListener(REPLY_CREATED_EVENT, onReply);
    return () => window.removeEventListener(REPLY_CREATED_EVENT, onReply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const showXPToast = (amount: number, language: string) => {
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

  const isPostAuthor = post.author_id === user.id;
  const presentedPost = parsePostExtras(post.body);

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
            <p className="text-xs text-dd-muted">Você progrediu na trilha de {toastXp.language}</p>
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
              onClick={() => router.back()}
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

          {/* Post Detail Card */}
          <article className="bg-transparent border-b border-dd-border/50 p-4 sm:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="hover:opacity-85 transition-opacity shrink-0 pt-0.5"
                >
                  <AuthorAvatar
                    username={post.author.username}
                    avatar_url={post.author.avatar_url}
                    avatar_config={post.author.avatar_config}
                    size="md"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  {/* Top row: Display Name, Flags, Title, Level (>= 5) */}
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="hover:underline truncate group/author min-w-0"
                    >
                      <span className="text-xs sm:text-sm font-bold text-dd-text truncate min-w-0 group-hover/author:underline">
                        <ProfileName config={post.author.avatar_config}>
                          {getAuthorDisplayName(post.author)}
                        </ProfileName>
                      </span>
                    </Link>
                    {(() => {
                      const postAuthorIdentity = readProfileIdentity(post.author.avatar_config);
                      return (
                        <>
                          {postAuthorIdentity.flags && postAuthorIdentity.flags.length > 0 && (
                            <span className="inline-flex items-center gap-1 shrink-0">
                              {postAuthorIdentity.flags.map((code) => (
                                <ProfileFlag key={code} code={code} />
                              ))}
                            </span>
                          )}
                          {postAuthorIdentity.title && (
                            <ProfileTitle title={postAuthorIdentity.title} />
                          )}
                        </>
                      );
                    })()}
                    <LevelBadge totalXp={post.author.total_xp ?? 0} />
                  </div>

                  {/* Bottom row: @username */}
                  <div className="mt-0.5 text-[11px] text-dd-muted font-medium">
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="hover:underline truncate"
                    >
                      @{post.author.username.toLowerCase()}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <SensitiveContentGate isSensitive={presentedPost.isSensitive}>
              <MarkdownRenderer content={presentedPost.content} compact={false} />
              <PostAttachments
                postId={post.id}
                attachments={post.attachments}
                music={post.music}
                poll={post.poll}
                legacyImage={post.image_url}
                audience={post.audience}
              />

              {post.code_snippet && !presentedPost.content.includes('```') && (
                <div className="rounded-lg border border-dd-border bg-dd-bg p-4 overflow-x-auto shadow-inner">
                  {highlightCode(post.code_snippet)}
                </div>
              )}
            </SensitiveContentGate>

            {/* Metadata Row: Time, Date, Views (Twitter style) */}
            <div className="text-[11px] text-dd-muted font-medium pt-3 border-t border-dd-border/30 flex flex-wrap items-center gap-1.5 select-none">
              <span>
                {new Date(post.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>·</span>
              <span>
                {new Date(post.created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {(post.location || presentedPost.location) && (
                <>
                  <span>·</span>
                  <PostLocation
                    location={post.location || presentedPost.location}
                    className="max-w-48"
                  />
                </>
              )}
              <span>·</span>
              <span className="text-dd-text font-bold">
                {post.view_count >= 1000
                  ? `${(post.view_count / 1000).toFixed(0)} mil`
                  : post.view_count}
              </span>
              <span>Visualizações</span>
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
                  aria-label={`Responder (${post.answers?.length || 0} respostas)`}
                  onClick={() => {
                    if (!openReplyComposer(post)) setIsExpanded(true);
                  }}
                >
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                  <InteractionCount count={post.answers?.length || 0} />
                </button>

                {/* 2. Repost Menu */}
                <RepostMenu
                  appearance="post"
                  count={repostState.count}
                  isReposted={repostState.reposted}
                  onRepost={handleRepost}
                  onQuote={handleQuotePost}
                />

                {/* 3. Heart/Like button */}
                <LikeButton
                  appearance="post"
                  count={postVotesCount}
                  isActive={postUserVote === 'up'}
                  onToggle={() => handlePostVote('up')}
                  title="Curtir post"
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
                          ? `${window.location.origin}/post/${post.id}`
                          : `/post/${post.id}`;
                      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
                        try {
                          await navigator.share({
                            title: post.title || 'Stacklyst Post',
                            text: post.body.substring(0, 100),
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
                    title="Compartilhar post"
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
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setMenuOpen(!menuOpen);
                    }}
                    className={`${postActionClassName} hover:bg-blue-500/10 hover:text-blue-400`}
                    title="Mais opções"
                  >
                    <MoreHorizontal className="w-[18px] h-[18px]" />
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 bottom-full mb-1.5 w-44 rounded-2xl border border-dd-border/80 bg-dd-surface p-1.5 shadow-2xl z-40 animate-slide-up"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
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
                        <span>Denunciar</span>
                      </button>
                    </div>
                  )}
                </div>
              </PostActionsBar>
            </div>
          </article>

          {/* Resolver como Quiz button outside/below the post box (Duolingo style) */}
          {post.quizzes &&
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
              <div className="flex items-center px-3 pt-3 md:px-5">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full p-1.5 text-dd-muted transition-colors hover:bg-dd-border/30 hover:text-dd-text cursor-pointer"
                  title="Fechar"
                  aria-label="Fechar resposta"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ReplyComposerForm postId={post.id} user={user} onDone={() => setIsExpanded(false)} />
            </div>
          )}

          {/* Answers List Section */}
          <AnswerThread
            answers={post.answers ?? []}
            isPostAuthor={isPostAuthor}
            currentUser={{
              id: user.id,
              username: user.username,
              avatar_url: user.avatar_url,
            }}
            postId={post.id}
            onAccept={handleAcceptAnswer}
            onAnswerAdded={(parentAnswerId, newAnswer) => {
              setPost((prev: any) => {
                const roots: AnswerNode[] = prev.answers ?? [];
                const next = parentAnswerId
                  ? insertReplyIntoTree(roots, parentAnswerId, newAnswer)
                  : [...roots, newAnswer];
                return { ...prev, answers: next };
              });
            }}
          />
        </main>
        <FeedRightSidebar user={user} />
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
