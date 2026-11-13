'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, BarChart2, Share2, Send } from 'lucide-react';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { PostActionsBar, postActionClassName } from '@/components/PostActionsBar';
import { LikeButton } from '@/components/motion/LikeButton';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostAttachments } from '@/components/posts/PostAttachments';
import { PostLocation, SensitiveContentGate } from '@/components/PostPresentation';
import { parsePostExtras } from '@/lib/post-composer';
import { parseReplyMedia } from '@/lib/reply-media';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { LevelBadge } from '@/components/LevelBadge';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import type { AnswerNode } from '@/components/answer-types';
import { MAX_ANSWER_DEPTH } from '@/components/answer-types';
import {
  POST_BOOKMARK_CHANGED,
  readPostBookmark,
  writePostBookmark,
  type PostBookmarkChange,
} from '@/lib/client/post-bookmarks';

interface AnswerCardProps {
  answer: AnswerNode;
  /** Indentation depth: 0 = top-level reply to the post, 1 = reply to a top-level answer, etc. */
  depth: number;
  isPostAuthor: boolean;
  onAccept?: (id: string) => void;
  currentUser?: { id?: string; username: string; avatar_url?: string | null };
  onAnswerAdded?: (parentAnswerId: string | null, newAnswer: AnswerNode) => void;
  postId?: string;
  /** Rendered as the next step of its parent's thread, in the same column (no card chrome). */
  continued?: boolean;
  /** Draw the thread line below this answer even when it has no replies of its own. */
  connectToNext?: boolean;
  /** Username shown as "Respondendo a @user" when a branch is flattened past the indent cap. */
  replyingTo?: string;
}

export function AnswerCard({
  answer,
  depth,
  isPostAuthor,
  onAccept,
  currentUser,
  onAnswerAdded,
  postId,
  continued = false,
  connectToNext = false,
  replyingTo,
}: AnswerCardProps) {
  const replyMedia = parseReplyMedia(answer.body);
  const replyExtras = parsePostExtras(replyMedia.content);
  const initialUserVote =
    answer.votes?.[0]?.value === 1 ? 'up' : answer.votes?.[0]?.value === -1 ? 'down' : null;
  const [voteCount, setVoteCount] = useState(answer.upvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const bookmarkLock = useRef(false);
  const targetPostId = answer.post_id || postId;
  useEffect(() => {
    if (!targetPostId || !currentUser) return;
    let active = true;
    let changed = false;
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<PostBookmarkChange>).detail;
      if (detail.postId === targetPostId) {
        changed = true;
        setIsBookmarked(detail.bookmarked);
      }
    };
    window.addEventListener(POST_BOOKMARK_CHANGED, onChange);
    void readPostBookmark(targetPostId)
      .then((saved) => {
        if (active && !changed && !bookmarkLock.current) setIsBookmarked(saved);
      })
      .catch(() => {});
    return () => {
      active = false;
      window.removeEventListener(POST_BOOKMARK_CHANGED, onChange);
    };
  }, [targetPostId, currentUser]);
  const handleBookmarkToggle = async () => {
    if (!targetPostId || !currentUser || bookmarkLock.current) return;
    bookmarkLock.current = true;
    setBookmarkPending(true);
    setBookmarkError(null);
    const previous = isBookmarked;
    setIsBookmarked(!previous);
    try {
      setIsBookmarked(await writePostBookmark(targetPostId, !previous));
    } catch (error) {
      setIsBookmarked(previous);
      setBookmarkError(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      bookmarkLock.current = false;
      setBookmarkPending(false);
    }
  };
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);

  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState(`@${answer.author.username} `);
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPostId = answer.post_id || postId;
    if (replySubmitting || !replyText.trim() || !targetPostId) return;

    setReplySubmitting(true);

    try {
      const res = await fetch(`/api/posts/${targetPostId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyText,
          parent_answer_id: answer.id,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao responder comentário');
      }

      const data = await res.json();
      if (onAnswerAdded) {
        // Pass the parent answer id so the tree can insert the reply in the right place.
        onAnswerAdded(answer.id, data.answer as AnswerNode);
      }

      setReplyText(`@${answer.author.username} `);
      setShowReplyBox(false);
    } catch (err) {
      console.error(err);
      alert('Não foi possível enviar sua resposta agora.');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/post/${answer.post_id || ''}#answer-${answer.id}`;
    navigator.clipboard.writeText(link);
    alert('Link da resposta copiado para a área de transferência!');
  };

  const [accepting, setAccepting] = useState(false);

  const handleVote = async (type: 'up' | 'down') => {
    const currentVote = userVote;
    const currentCount = voteCount;
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

    setVoteCount(currentCount + diff);
    setUserVote(newUserVote);

    try {
      const res = await fetch(`/api/answers/${answer.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        throw new Error('Erro ao registrar voto');
      }

      const data = await res.json();
      setVoteCount(data.upvotes);
    } catch (err) {
      console.error(err);
      setVoteCount(currentCount);
      setUserVote(currentVote);
    }
  };

  const handleAccept = async () => {
    if (!onAccept || accepting) return;
    setAccepting(true);
    try {
      onAccept(answer.id);
    } finally {
      setAccepting(false);
    }
  };

  const { text: relativeTime } = useHydrationSafeRelativeTime(answer.created_at);
  const replies = answer.replies ?? [];

  /*
   * Thread layout (Twitter/X style):
   * - A single reply continues the conversation in the same column, joined to
   *   this answer by a line under the avatars, so "1/4 → 2/4 → 3/4" reads as one
   *   thread instead of a staircase.
   * - Several replies branch: they sit in this answer's content column while the
   *   avatar line runs alongside them.
   * - Past the indent cap, branches fall back to the same column with a
   *   "replying to" label.
   */
  const continuation = replies.length === 1 ? replies[0] : null;
  const branches = replies.length > 1 ? replies : [];
  const childDepth = depth + 1;
  const canIndentBranches = childDepth <= MAX_ANSWER_DEPTH;
  const nestedBranches = canIndentBranches ? branches : [];
  const flatBranches = canIndentBranches ? [] : branches;
  const connectDown = replies.length > 0 || connectToNext;
  const isRoot = depth === 0 && !continued;

  const childProps = { isPostAuthor, onAccept, currentUser, postId, onAnswerAdded };
  const showAccept =
    isPostAuthor &&
    !answer.is_accepted &&
    currentUser &&
    answer.author.username !== currentUser.username;

  const row = (
    <div id={`answer-${answer.id}`} className="flex scroll-mt-20 gap-3">
      {/* Avatar gutter: the line below the avatar joins this answer to the next one. */}
      <div className="flex w-8 shrink-0 flex-col items-center">
        <Link
          href={`/profile/${answer.author.username}`}
          className="hover:opacity-85 transition-opacity shrink-0"
        >
          <AuthorAvatar
            username={answer.author.username}
            avatar_url={answer.author.avatar_url}
            avatar_config={answer.author.avatar_config}
            size="sm"
          />
        </Link>
        {connectDown && (
          <span
            aria-hidden="true"
            data-testid="thread-line"
            className="mt-1.5 w-0.5 flex-1 rounded-full bg-dd-border"
          />
        )}
      </div>

      <div className={`min-w-0 flex-1 ${connectDown ? 'pb-5' : ''}`}>
        {/* Row 1: Name, Flags, Title, Level */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <Link
            href={`/profile/${answer.author.username}`}
            className="hover:underline truncate group/author min-w-0"
          >
            <span className="text-dd-text text-xs sm:text-sm font-bold truncate min-w-0 group-hover/author:underline">
              <ProfileName config={answer.author.avatar_config}>
                {getAuthorDisplayName(answer.author)}
              </ProfileName>
            </span>
          </Link>
          {(() => {
            const answerIdentity = readProfileIdentity(answer.author.avatar_config);
            return (
              <>
                {answerIdentity.flags && answerIdentity.flags.length > 0 && (
                  <span className="inline-flex items-center gap-1 shrink-0">
                    {answerIdentity.flags.map((code) => (
                      <ProfileFlag key={code} code={code} />
                    ))}
                  </span>
                )}
                {answerIdentity.title && <ProfileTitle title={answerIdentity.title} />}
              </>
            );
          })()}
          {answer.author.total_xp !== undefined && <LevelBadge totalXp={answer.author.total_xp} />}
        </div>

        {/* Row 2: @username · relativeTime */}
        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dd-muted font-medium flex-wrap min-w-0">
          <Link href={`/profile/${answer.author.username}`} className="hover:underline truncate">
            @{answer.author.username.toLowerCase()}
          </Link>
          <span>·</span>
          <span className="text-[10px]">{relativeTime}</span>
        </div>

        {replyingTo && (
          <p className="mt-1 text-[11px] text-dd-muted">
            Respondendo a{' '}
            <Link href={`/profile/${replyingTo}`} className="text-blue-400 hover:underline">
              @{replyingTo}
            </Link>
          </p>
        )}

        {/* Accepted badge */}
        {answer.is_accepted && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-dd-green/10 px-2 py-0.5 text-dd-green text-[11px] font-semibold">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Resposta aceita
          </div>
        )}

        {/* Body */}
        <SensitiveContentGate isSensitive={replyExtras.isSensitive}>
          {replyExtras.content && (
            <div className="mt-2">
              <MarkdownRenderer content={replyExtras.content} compact={false} />
            </div>
          )}
          {(replyMedia.attachments.length > 0 || replyMedia.music) && (
            <div className="mt-2">
              <PostAttachments
                postId={answer.id}
                attachments={replyMedia.attachments}
                music={replyMedia.music}
              />
            </div>
          )}
          <PostLocation location={replyExtras.location} className="mt-2" />
        </SensitiveContentGate>

        {/* Legacy code snippet fallback */}
        {answer.code_snippet && !answer.body.includes('```') && (
          <div className="bg-dd-bg rounded-lg p-3 mt-3 overflow-x-auto">
            <pre className="text-dd-text text-xs font-mono whitespace-pre">
              {answer.code_snippet}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 w-full select-none text-xs">
          <PostActionsBar>
            {/* 1. Comment bubble */}
            <button
              type="button"
              onClick={() => {
                setShowReplyBox(!showReplyBox);
                if (!showReplyBox) {
                  setReplyText(`@${answer.author.username} `);
                }
              }}
              className={`${postActionClassName} hover:bg-blue-500/10 hover:text-blue-400`}
              title="Responder a este comentário"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            {/* 2. Repost Menu */}
            <RepostMenu
              appearance="post"
              count={repostCount}
              isReposted={reposted}
              onRepost={() => {
                setReposted(!reposted);
                setRepostCount((prev) => (reposted ? prev - 1 : prev + 1));
              }}
              onQuote={() => alert('Citação de resposta mockada!')}
            />

            {/* 3. Heart/Like button */}
            <LikeButton
              appearance="post"
              count={voteCount}
              isActive={userVote === 'up'}
              onToggle={() => handleVote('up')}
              title="Curtir resposta"
            />

            {/* 4. Views */}
            <span className={`${postActionClassName} pointer-events-none`} title="Visualizações">
              <BarChart2 className="h-4 w-4" aria-hidden="true" />
              <span className="text-[11px] font-semibold">{Math.abs(voteCount) * 4 + 12}</span>
            </span>

            {/* 5. BookmarkButton */}
            <BookmarkButton
              appearance="post"
              isSaved={isBookmarked}
              onToggle={handleBookmarkToggle}
              disabled={bookmarkPending || !targetPostId || !currentUser}
            />

            {/* 6. Share button */}
            <button
              type="button"
              onClick={handleShare}
              className={`${postActionClassName} hover:bg-blue-500/10 hover:text-blue-400`}
              title="Compartilhar"
            >
              <Share2 className="h-[18px] w-[18px]" />
            </button>
          </PostActionsBar>
          {bookmarkError && (
            <p role="alert" className="mt-1 text-xs text-red-400">
              {bookmarkError}
            </p>
          )}

          {/* 7. Accept Button */}
          {showAccept && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex items-center gap-1 text-[10px] font-bold text-dd-green bg-dd-green/10 hover:bg-dd-green/20 px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50 shrink-0"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Aceitar
              </button>
            </div>
          )}
        </div>

        {showReplyBox && (
          <form onSubmit={handleReplySubmit} className="mt-3 flex gap-3">
            <div className="shrink-0">
              {currentUser?.avatar_url ? (
                <Image
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-dd-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/10">
                  {currentUser?.username?.slice(0, 2).toUpperCase() || 'ME'}
                </div>
              )}
            </div>
            <div className="flex-grow space-y-2">
              <MarkdownEditor
                value={replyText}
                onChange={setReplyText}
                maxLength={280}
                minHeight="5rem"
                placeholder={`Responder a @${answer.author.username}...`}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText(`@${answer.author.username} `);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-dd-border text-xs font-bold text-dd-muted hover:text-dd-text hover:bg-dd-border/30 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    replySubmitting ||
                    !replyText.trim() ||
                    replyText.trim() === `@${answer.author.username}`
                  }
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{replySubmitting ? 'Enviando...' : 'Responder'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Branching replies: indented under this answer's text, beside the avatar line. */}
        {nestedBranches.length > 0 && (
          <div className="mt-4 flex flex-col gap-5">
            {nestedBranches.map((reply) => (
              <AnswerCard key={reply.id} answer={reply} depth={childDepth} {...childProps} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const thread = (
    <>
      {row}
      {continuation && (
        <AnswerCard
          answer={continuation}
          depth={depth}
          continued
          connectToNext={connectToNext}
          {...childProps}
        />
      )}
      {flatBranches.map((reply, index) => (
        <AnswerCard
          key={reply.id}
          answer={reply}
          depth={depth}
          continued
          replyingTo={answer.author.username}
          connectToNext={connectToNext || index < flatBranches.length - 1}
          {...childProps}
        />
      ))}
    </>
  );

  // Keep a thread together as one block so a parent gap never splits its line.
  if (!isRoot) return <div>{thread}</div>;

  return (
    <article className="border-b border-dd-border/50 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 transition-colors hover:bg-dd-surface/20">
      {thread}
    </article>
  );
}
