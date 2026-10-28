'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { LevelBadge } from '@/components/LevelBadge';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { LikeButton } from '@/components/motion/LikeButton';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { MessageCircle, BarChart2, Share } from 'lucide-react';

interface ProfileReplyThreadProps {
  reply: any;
  currentUser?: any;
}

export function ProfileReplyThread({ reply }: ProfileReplyThreadProps) {
  const router = useRouter();

  // Answer voting and interaction state
  const initialUserVote =
    reply?.votes?.[0]?.value === 1 ? 'up' : reply?.votes?.[0]?.value === -1 ? 'down' : null;
  const [voteCount, setVoteCount] = useState(reply?.upvotes || 0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const { text: parentRelativeTime } = useHydrationSafeRelativeTime(
    reply?.parent?.created_at ?? reply?.post?.created_at ?? 0
  );
  const { text: replyRelativeTime } = useHydrationSafeRelativeTime(reply?.created_at ?? 0);

  // Defensive check to prevent crash during tab transition state lag
  if (!reply || (!reply.post && !reply.parent)) {
    return null;
  }

  // Determine parent item (can be a parent Answer, or the Post itself)
  const isNestedReply = !!reply.parent;
  const parentAuthor = isNestedReply ? reply.parent.author : reply.post.author;
  const parentBody = isNestedReply ? reply.parent.body : reply.post.body;
  const parentTitle = !isNestedReply ? reply.post.title : undefined;
  const postLanguage = !isNestedReply ? reply.post.language : undefined;

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
      const res = await fetch(`/api/answers/${reply.id}/vote`, {
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/post/${reply.post_id}#answer-${reply.id}`;
    navigator.clipboard.writeText(link);
    alert('Link da resposta copiado para a área de transferência!');
  };

  const handleParentClick = () => {
    if (isNestedReply) {
      router.push(`/post/${reply.post_id}#answer-${reply.parent.id}`);
    } else {
      router.push(`/post/${reply.post_id}`);
    }
  };

  const handleReplyClick = () => {
    router.push(`/post/${reply.post_id}#answer-${reply.id}`);
  };

  return (
    <div className="flex flex-col bg-transparent p-4 sm:p-5 select-none hover:bg-dd-surface/5 transition-colors">
      {/* 1. Parent Item */}
      <div onClick={handleParentClick} className="flex gap-3 cursor-pointer group/parent">
        {/* Left Column (Avatar + Thread Line) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <Link
            href={`/profile/${parentAuthor.username}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:opacity-85 transition-opacity shrink-0"
          >
            <AuthorAvatar
              username={parentAuthor.username}
              avatar_url={parentAuthor.avatar_url}
              avatar_config={parentAuthor.avatar_config}
              size="sm"
            />
          </Link>
          <div className="w-0.5 bg-dd-border/40 flex-grow mt-1.5 min-h-[1.5rem]" />
        </div>

        {/* Right Column (Content) */}
        <div className="flex-grow min-w-0 pb-3">
          <div className="flex flex-col min-w-0">
            {/* Top row: Name, Flags, Title, Level */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Link
                href={`/profile/${parentAuthor.username}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline truncate group/author min-w-0"
              >
                <span className="text-dd-text text-xs font-bold truncate min-w-0 group-hover/author:underline">
                  <ProfileName config={parentAuthor.avatar_config}>
                    {getAuthorDisplayName(parentAuthor)}
                  </ProfileName>
                </span>
              </Link>
              {(() => {
                const parentIdentity = readProfileIdentity(parentAuthor.avatar_config);
                return (
                  <>
                    {parentIdentity.flags && parentIdentity.flags.length > 0 && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        {parentIdentity.flags.map((code) => (
                          <ProfileFlag key={code} code={code} />
                        ))}
                      </span>
                    )}
                    {parentIdentity.title && <ProfileTitle title={parentIdentity.title} />}
                  </>
                );
              })()}
              {parentAuthor.total_xp !== undefined && (
                <LevelBadge totalXp={parentAuthor.total_xp} minLevel={5} />
              )}
            </div>

            {/* Bottom row: @username · relativeTime */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dd-muted font-medium flex-wrap min-w-0">
              <Link
                href={`/profile/${parentAuthor.username}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline truncate"
              >
                @{parentAuthor.username.toLowerCase()}
              </Link>
              <span>·</span>
              <span className="text-[10px]">{parentRelativeTime}</span>
            </div>
          </div>
          <div className="text-xs text-dd-text/90 mt-1 line-clamp-3">
            {parentTitle && (
              <strong className="block mb-0.5 text-dd-text font-semibold">{parentTitle}</strong>
            )}
            <MarkdownRenderer content={parentBody} compact={true} />
          </div>
        </div>
      </div>

      {/* 2. User's Reply */}
      <div onClick={handleReplyClick} className="flex gap-3 cursor-pointer group/reply mt-1">
        {/* Left Column (Avatar only) */}
        <div className="flex flex-col items-center flex-shrink-0">
          <Link
            href={`/profile/${reply.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:opacity-85 transition-opacity shrink-0"
          >
            <AuthorAvatar
              username={reply.author.username}
              avatar_url={reply.author.avatar_url}
              avatar_config={reply.author.avatar_config}
              size="sm"
            />
          </Link>
        </div>

        {/* Right Column (Reply Content) */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col min-w-0">
            {/* Top row: Name, Flags, Title, Level */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Link
                href={`/profile/${reply.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline truncate group/author min-w-0"
              >
                <span className="text-dd-text text-xs font-bold truncate min-w-0 group-hover/author:underline">
                  <ProfileName config={reply.author.avatar_config}>
                    {getAuthorDisplayName(reply.author)}
                  </ProfileName>
                </span>
              </Link>
              {(() => {
                const replyIdentity = readProfileIdentity(reply.author.avatar_config);
                return (
                  <>
                    {replyIdentity.flags && replyIdentity.flags.length > 0 && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        {replyIdentity.flags.map((code) => (
                          <ProfileFlag key={code} code={code} />
                        ))}
                      </span>
                    )}
                    {replyIdentity.title && <ProfileTitle title={replyIdentity.title} />}
                  </>
                );
              })()}
              {reply.author.total_xp !== undefined && (
                <LevelBadge totalXp={reply.author.total_xp} minLevel={5} />
              )}
            </div>

            {/* Bottom row: @username · relativeTime */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dd-muted font-medium flex-wrap min-w-0">
              <Link
                href={`/profile/${reply.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline truncate"
              >
                @{reply.author.username.toLowerCase()}
              </Link>
              <span>·</span>
              <span className="text-[10px]">{replyRelativeTime}</span>
            </div>
          </div>

          <div className="text-[11px] text-dd-muted mt-1.5">
            Repondo a{' '}
            <span className="text-blue-500/90 font-medium">
              @{parentAuthor.username.toLowerCase()}
            </span>
          </div>

          <div className="text-sm text-dd-text mt-2">
            <MarkdownRenderer content={reply.body} compact={false} />
          </div>

          {reply.code_snippet && !reply.body.includes('```') && (
            <div className="bg-dd-bg rounded-lg p-2.5 mt-2.5 overflow-x-auto border border-dd-border/40">
              <pre className="text-dd-text text-[11px] font-mono whitespace-pre">
                {reply.code_snippet}
              </pre>
            </div>
          )}

          {/* Footer Controls (Consistent with AnswerCard) */}
          <div className="flex items-center justify-between pt-2 border-t border-dd-border/40 mt-3 select-none text-xs gap-3">
            <div className="flex items-center justify-between flex-grow max-w-xl">
              {/* Comment Button (just redirects to post thread) */}
              <button
                type="button"
                className="flex items-center gap-0.5 text-dd-muted hover:text-blue-400 active:scale-[0.95] transition-transform p-1 bg-transparent border-none"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Repost Menu */}
              <div onClick={(e) => e.stopPropagation()}>
                <RepostMenu
                  count={repostCount}
                  isReposted={reposted}
                  onRepost={() => {
                    setReposted(!reposted);
                    setRepostCount((prev) => (reposted ? prev - 1 : prev + 1));
                  }}
                  onQuote={() => alert('Citação de resposta mockada!')}
                />
              </div>

              {/* Vote/Like Button */}
              <div onClick={(e) => e.stopPropagation()}>
                <LikeButton
                  count={voteCount}
                  isActive={userVote === 'up'}
                  onToggle={() => handleVote('up')}
                  title="Curtir resposta"
                />
              </div>

              {/* Views Mock */}
              <div className="flex items-center gap-0.5 text-dd-muted select-none group/views">
                <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="px-1 font-semibold text-[10px] text-dd-muted group-hover/views:text-blue-400">
                  {Math.abs(voteCount) * 4 + 12}
                </span>
              </div>

              {/* Bookmark Button */}
              <div onClick={(e) => e.stopPropagation()}>
                <BookmarkButton
                  isSaved={isBookmarked}
                  onToggle={() => setIsBookmarked(!isBookmarked)}
                />
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-0.5 text-dd-muted hover:text-blue-400 transition-colors p-1 bg-transparent border-none"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 transition-colors">
                  <Share className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
