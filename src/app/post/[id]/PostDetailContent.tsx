'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { LevelBadge } from '@/components/LevelBadge';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import { QuizWidget } from '@/components/QuizWidget';
import { AnswerThread } from '@/components/AnswerThread';
import type { AnswerNode } from '@/components/answer-types';
import { MarkdownEditor, type NotionEditorRef } from '@/components/MarkdownEditor';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  Sparkles,
  MessageCircle,
  ArrowLeft,
  Flag,
  X,
  Send,
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
import { PostComposerExtras } from '@/components/PostComposerExtras';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { PostLocation, SensitiveContentGate } from '@/components/PostPresentation';
import { parsePostExtras, ReplyAudience } from '@/lib/post-composer';
import { POST_CHAR_LIMIT } from '@/lib/motion';
import { cn } from '@/lib/cn';

interface PostDetailContentProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    total_xp: number;
    streak?: number;
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
  const [answerBody, setAnswerBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastXp, setToastXp] = useState<{ amount: number; language: string } | null>(null);

  // States to match the main post composer extra options
  const [replyAudience, setReplyAudience] = useState<ReplyAudience>('everyone');
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [answerLocation, setAnswerLocation] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [answerImage, setAnswerImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const answerBodyEditorRef = useRef<NotionEditorRef>(null);

  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [repostState, setRepostState] = useState({
    count: post.reposts_count ?? 0,
    reposted: false,
  });

  const handleBookmarkToggle = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: 'POST',
      });
      if (!res.ok) {
        setIsSaved(!nextSaved);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setIsSaved(!nextSaved);
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

  const showXPToast = (amount: number, language: string) => {
    setToastXp({ amount, language });
    playSound('xpgain');
    setTimeout(() => {
      setToastXp(null);
    }, 4000);
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
        setAnswerImage(data.url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: answerBody,
          code_snippet: null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswerBody('');
        setAnswerImage('');
        setReplyAudience('everyone');
        setScheduledAt(null);
        setAnswerLocation('');
        setIsSensitive(false);
        setIsExpanded(false);
        await reloadPost();

        if (data.xpResult?.xpEarned) {
          showXPToast(data.xpResult.xpEarned, data.xpResult.language);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
    <div className="dd-platform-shell selection:bg-blue-500/35 selection:text-white">
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

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main className="flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8">
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
            <div className="flex items-start justify-between gap-3 border-b border-dd-border/50 pb-3">
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

            {/* Post bottom actions section */}
            <div
              className="pt-2.5 mt-2 border-t border-dd-border/60 text-xs w-full select-none text-dd-muted max-w-full"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <PostActionsBar>
                {/* Existing response count: this detail view has no comment action here. */}
                <span
                  className={postActionClassName}
                  aria-label={`Respostas: ${post.answers?.length || 0}`}
                >
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                  <InteractionCount count={post.answers?.length || 0} />
                </span>

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
                />

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
                className="flex items-center gap-1.5 bg-dd-surface border border-dd-border/60 hover:bg-dd-border/30 text-dd-muted hover:text-dd-text text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Responder</span>
              </button>
            </div>
          ) : (
            <div className="relative z-10 bg-transparent border-b border-dd-border/50 p-4 sm:p-6 transition-colors duration-200">
              {/* Header row to match modal layout */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-dd-border/30">
                <button
                  type="button"
                  onClick={() => {
                    setAnswerBody('');
                    setAnswerImage('');
                    setReplyAudience('everyone');
                    setScheduledAt(null);
                    setAnswerLocation('');
                    setIsSensitive(false);
                    setIsExpanded(false);
                  }}
                  className="p-1 text-dd-muted hover:text-dd-text hover:bg-dd-border/30 rounded-full transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-xs text-dd-muted font-medium">
                  {answerBody.length}/{POST_CHAR_LIMIT}
                </div>
              </div>

              {/* Main Composer Form */}
              <form onSubmit={handlePostAnswer} className="space-y-4">
                <div className="flex gap-3">
                  <div className="shrink-0 pt-1">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-dd-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10 shrink-0">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    <MarkdownEditor
                      ref={answerBodyEditorRef}
                      value={answerBody}
                      onChange={setAnswerBody}
                      maxLength={POST_CHAR_LIMIT}
                      minHeight="7rem"
                      placeholder="Postar sua resposta técnica..."
                    />

                    {/* Image Preview */}
                    {answerImage && (
                      <div className="relative rounded-2xl overflow-hidden border border-dd-border max-h-80 bg-black/40">
                        <Image
                          src={answerImage}
                          alt="Anexo"
                          width={600}
                          height={400}
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setAnswerImage('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/85 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Toolbar matching X composer */}
                <div className="flex items-center justify-between border-t border-dd-border/40 pt-3">
                  <div className="flex items-center gap-1.5 text-blue-500">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="answer-file-upload"
                      />
                      <label
                        htmlFor="answer-file-upload"
                        className="p-2 hover:bg-blue-500/10 rounded-full transition-colors cursor-pointer block"
                        title="Adicionar imagem"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4.5 h-4.5 fill-none stroke-current"
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
                      postBody={answerBody}
                      setPostBody={setAnswerBody}
                      editorRef={answerBodyEditorRef}
                      replyAudience={replyAudience}
                      setReplyAudience={setReplyAudience}
                      scheduledAt={scheduledAt}
                      setScheduledAt={setScheduledAt}
                      location={answerLocation}
                      setLocation={setAnswerLocation}
                      isSensitive={isSensitive}
                      setIsSensitive={setIsSensitive}
                    />
                  </div>

                  {/* Right submit button */}
                  <div className="flex items-center gap-3">
                    {uploadingImage && (
                      <span className="text-[10px] text-dd-muted animate-pulse font-semibold">
                        Enviando...
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={submitting || !answerBody.trim() || uploadingImage}
                      className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-full transition-colors cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Postando...' : 'Postar'}</span>
                    </button>
                  </div>
                </div>
              </form>
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
