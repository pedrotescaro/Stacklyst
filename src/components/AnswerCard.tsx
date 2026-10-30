'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, BarChart2, Share2, Send } from 'lucide-react';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { PostActionsBar, postActionClassName } from '@/components/PostActionsBar';
import { LikeButton } from '@/components/motion/LikeButton';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { LevelBadge } from '@/components/LevelBadge';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import type { AnswerNode } from '@/components/answer-types';
import { MAX_ANSWER_DEPTH } from '@/components/answer-types';

interface AnswerCardProps {
  answer: AnswerNode;
  /** Indentation depth: 0 = top-level reply to the post, 1 = reply to a top-level answer, etc. */
  depth: number;
  isPostAuthor: boolean;
  onAccept?: (id: string) => void;
  currentUser?: { id?: string; username: string; avatar_url?: string | null };
  onAnswerAdded?: (parentAnswerId: string | null, newAnswer: AnswerNode) => void;
  postId?: string;
}

export function AnswerCard({
  answer,
  depth,
  isPostAuthor,
  onAccept,
  currentUser,
  onAnswerAdded,
  postId,
}: AnswerCardProps) {
  const initialUserVote =
    answer.votes?.[0]?.value === 1 ? 'up' : answer.votes?.[0]?.value === -1 ? 'down' : null;
  const [voteCount, setVoteCount] = useState(answer.upvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [isBookmarked, setIsBookmarked] = useState(false);
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
  const hasReplies = replies.length > 0;

  // Beyond the indent cap, replies are rendered flat and get a "replying to" badge.
  const childDepth = depth + 1;
  const shouldIndentChildren = childDepth <= MAX_ANSWER_DEPTH;

  const isTopLevel = depth === 0;

  return (
    <article className="space-y-2">
      <div
        className={
          isTopLevel
            ? 'bg-transparent border-b border-dd-border/50 rounded-none p-4 sm:p-5 hover:bg-dd-surface/20'
            : 'bg-transparent border-none p-0 pt-3 pb-1'
        }
      >
        {/* Accepted badge */}
        {answer.is_accepted && (
          <div
            className={`flex items-center gap-1.5 text-dd-green text-xs font-medium ${isTopLevel ? 'mb-3' : 'mb-1.5'}`}
          >
            <svg
              width="16"
              height="16"
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

        {/* Header */}
        <div className="flex items-start gap-2 sm:gap-2.5 mb-3">
          <Link
            href={`/profile/${answer.author.username}`}
            className="hover:opacity-85 transition-opacity shrink-0 pt-0.5"
          >
            <AuthorAvatar
              username={answer.author.username}
              avatar_url={answer.author.avatar_url}
              avatar_config={answer.author.avatar_config}
              size="sm"
            />
          </Link>
          <div className="flex-1 min-w-0">
            {/* Row 1: Name, Flags, Title, Level (>=5) */}
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
              {answer.author.total_xp !== undefined && (
                <LevelBadge totalXp={answer.author.total_xp} />
              )}
            </div>

            {/* Row 2: @username · relativeTime */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dd-muted font-medium flex-wrap min-w-0">
              <Link
                href={`/profile/${answer.author.username}`}
                className="hover:underline truncate"
              >
                @{answer.author.username.toLowerCase()}
              </Link>
              <span>·</span>
              <span className="text-[10px]">{relativeTime}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mb-3">
          <MarkdownRenderer content={answer.body} compact={false} />
        </div>

        {/* Legacy code snippet fallback */}
        {answer.code_snippet && !answer.body.includes('```') && (
          <div className="bg-dd-bg rounded-lg p-3 mb-3 overflow-x-auto">
            <pre className="text-dd-text text-xs font-mono whitespace-pre">
              {answer.code_snippet}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-dd-border w-full select-none text-xs">
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

            {/* 5. BookmarkButton */}
            <BookmarkButton
              appearance="post"
              isSaved={isBookmarked}
              onToggle={() => setIsBookmarked(!isBookmarked)}
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
          <div className="mt-2 flex items-center justify-between gap-3">
            {/* 4. Views BarChart */}
            <div className="flex items-center gap-0.5 text-dd-muted select-none group/views">
              <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-400 transition-colors animate-none">
                <BarChart2 className="w-4 h-4 text-dd-muted group-hover/views:text-blue-400" />
              </div>
              <span className="px-1 font-semibold text-[10px] text-dd-muted group-hover/views:text-blue-400">
                {Math.abs(voteCount) * 4 + 12}
              </span>
            </div>

            {/* 7. Accept Button */}
            {isPostAuthor &&
              !answer.is_accepted &&
              currentUser &&
              answer.author.username !== currentUser.username && (
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
              )}
          </div>
        </div>
        {showReplyBox && (
          <form
            onSubmit={handleReplySubmit}
            className="mt-4 pt-4 border-t border-dd-border/60 flex gap-3"
          >
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
      </div>

      {/* Nested replies */}
      {hasReplies && (
        <div
          className={
            shouldIndentChildren
              ? 'pl-4 sm:pl-6 ml-3 sm:ml-5 border-l border-dd-border/30 space-y-4 mt-2'
              : 'space-y-4 mt-2'
          }
        >
          {replies.map((reply) =>
            shouldIndentChildren ? (
              <AnswerCard
                key={reply.id}
                answer={reply}
                depth={childDepth}
                isPostAuthor={isPostAuthor}
                onAccept={onAccept}
                currentUser={currentUser}
                postId={postId}
                onAnswerAdded={onAnswerAdded}
              />
            ) : (
              <div key={reply.id} className="pt-2">
                {/* Beyond the indent cap: flat list with a "replying to" badge to keep context. */}
                <div className="flex items-center gap-1.5 px-2 mb-0.5 text-dd-muted text-[10px] font-semibold">
                  <span>↳</span>
                  <span>respondendo a @{answer.author.username}</span>
                </div>
                <AnswerCard
                  answer={reply}
                  depth={childDepth}
                  isPostAuthor={isPostAuthor}
                  onAccept={onAccept}
                  currentUser={currentUser}
                  postId={postId}
                  onAnswerAdded={onAnswerAdded}
                />
              </div>
            )
          )}
        </div>
      )}
    </article>
  );
}
