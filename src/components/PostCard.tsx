/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MessageCircle, Pin, Share2, Check } from 'lucide-react';
import { LikeButton } from './motion/LikeButton';
import { BookmarkButton } from './motion/BookmarkButton';
import { openReplyComposer, REPLY_CREATED_EVENT } from './composer/ReplyComposerDialog';
import { RepostMenu } from './motion/RepostMenu';
import { PostActionsBar, postActionClassName, InteractionCount } from '@/components/PostActionsBar';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { LevelBadge } from '@/components/LevelBadge';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PostLocation, SensitiveContentGate } from './PostPresentation';
import { cn } from '@/lib/cn';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { parsePostExtras } from '@/lib/post-composer';
import { PostAttachments } from '@/components/posts/PostAttachments';
import { PostOptionsMenu, type PostBodyUpdate } from '@/components/posts/PostOptionsMenu';
import type { PostAttachment, PostPoll } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import {
  POST_BOOKMARK_CHANGED,
  writePostBookmark,
  type PostBookmarkChange,
} from '@/lib/client/post-bookmarks';
import { POST_PIN_CHANGED, writePostPin, type PostPinChange } from '@/lib/client/post-pins';
import { prismaLanguageToEditor } from '@/lib/editor/languages';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './PostCard.module.css';

interface PostAuthor {
  id?: string;
  name?: string | null;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
  total_xp?: number;
}

interface Post {
  id: string;
  author_id?: string;
  title: string;
  body: string;
  language?: string | null;
  code_snippet?: string | null;
  image_url?: string | null;
  attachments?: PostAttachment[] | null;
  music?: SpotifyProfileTrack | null;
  poll?: PostPoll | null;
  audience?: string | null;
  is_pinned?: boolean;
  created_at: string;
  view_count: number;
  author: PostAuthor;
  _count: {
    answers: number;
  };
  votes?: Array<{ value: number }>;
  bookmarks?: Array<{ id: string }>;
  reactions?: Array<{ type: string }>;
  upvotes?: number;
  quizzes?: any[];
}

interface PostCardProps {
  post: Post;
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, update: PostBodyUpdate) => void;
  flat?: boolean;
  showPinnedBadge?: boolean;
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void;
}

function createSnippetMarkdown(code: string, language?: string | null) {
  const fenceLength = Math.max(3, ...[...code.matchAll(/`+/g)].map((match) => match[0].length + 1));
  const fence = '`'.repeat(fenceLength);
  const snippetLanguage = language ? prismaLanguageToEditor(language) : 'text-static';
  return `${fence}${snippetLanguage}\n${code.replace(/\n?$/, '\n')}${fence}`;
}

export function PostCard({
  post,
  isOwner = false,
  onDelete,
  onEdit,
  flat = false,
  showPinnedBadge = false,
  onBookmarkToggle,
}: PostCardProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const [shareCopied, setShareCopied] = useState(false);
  const [pinned, setPinned] = useState(Boolean(post.is_pinned));
  const [pinPending, setPinPending] = useState(false);
  const pinLock = useRef(false);
  const [authorBlocked, setAuthorBlocked] = useState(false);

  useEffect(() => {
    if (!pinLock.current) setPinned(Boolean(post.is_pinned));
  }, [post.is_pinned]);

  useEffect(() => {
    const onPinChange = (event: Event) => {
      const detail = (event as CustomEvent<PostPinChange>).detail;
      if (detail.postId === post.id) {
        setPinned(detail.pinned);
      } else if (detail.pinned && isOwner) {
        setPinned(false);
      }
    };
    window.addEventListener(POST_PIN_CHANGED, onPinChange);
    return () => window.removeEventListener(POST_PIN_CHANGED, onPinChange);
  }, [post.id, isOwner]);

  useEffect(() => {
    const onBlock = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; blocked: boolean }>).detail;
      if (detail.userId === (post.author.id ?? post.author_id)) setAuthorBlocked(detail.blocked);
    };
    window.addEventListener('stacklyst:block-changed', onBlock);
    return () => window.removeEventListener('stacklyst:block-changed', onBlock);
  }, [post.author.id, post.author_id]);

  // Stateful copy of post fields for instant local updates
  const [postBody, setPostBody] = useState(post.body);
  const [postLanguage, setPostLanguage] = useState(post.language);
  const [postCodeSnippet, setPostCodeSnippet] = useState(post.code_snippet);

  useEffect(() => {
    setPostBody(post.body);
    setPostLanguage(post.language);
    setPostCodeSnippet(post.code_snippet);
  }, [post.body, post.language, post.code_snippet]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('pre') ||
      window.getSelection()?.toString()
    ) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  // Estados interativos locais
  const EMOJI_TO_TYPE: Record<string, string> = {
    '🔥': 'FIRE',
    '❤️': 'HEART',
    '😂': 'LAUGH',
    '👏': 'CLAP',
    '💡': 'BULB',
  };

  const TYPE_TO_EMOJI: Record<string, string> = {
    FIRE: '🔥',
    HEART: '❤️',
    LAUGH: '😂',
    CLAP: '👏',
    BULB: '💡',
  };

  const getInitialLikeState = () => {
    if (post.votes && post.votes.length > 0 && post.votes[0].value === 1) {
      return true;
    }
    return false;
  };

  const initialLiked = getInitialLikeState();
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState(post.upvotes ?? 0);
  const [bookmarked, setBookmarked] = useState<boolean>(
    !!(post.bookmarks && post.bookmarks.length > 0)
  );
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const bookmarkRequestPending = useRef(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const serverBookmarked = Boolean(post.bookmarks?.length);
  useEffect(() => {
    if (!bookmarkRequestPending.current) setBookmarked(serverBookmarked);
  }, [serverBookmarked]);
  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<PostBookmarkChange>).detail;
      if (detail.postId === post.id) setBookmarked(detail.bookmarked);
    };
    window.addEventListener(POST_BOOKMARK_CHANGED, onChange);
    return () => window.removeEventListener(POST_BOOKMARK_CHANGED, onChange);
  }, [post.id]);
  const [answersCount, setAnswersCount] = useState(post._count?.answers ?? 0);
  useEffect(() => setAnswersCount(post._count?.answers ?? 0), [post._count?.answers]);
  useEffect(() => {
    const onReply = (event: Event) => {
      if ((event as CustomEvent<{ postId: string }>).detail.postId === post.id)
        setAnswersCount((count) => count + 1);
    };
    window.addEventListener(REPLY_CREATED_EVENT, onReply);
    return () => window.removeEventListener(REPLY_CREATED_EVENT, onReply);
  }, [post.id]);
  const [repostsCount, setRepostsCount] = useState(0);
  const [reposted, setReposted] = useState(false);

  const handleLikeToggle = async () => {
    const nextLiked = !liked;
    const newValue = nextLiked ? 1 : 0;
    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?reason=session_expired');
          return;
        }
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || errorData?.message || 'Falha ao registrar curtida');
      }

      const data = await res.json();
      setLikesCount(data.upvotes);
    } catch (err) {
      // Offline or the server dropped the request: just undo the like. Only
      // unexpected failures are worth a console error.
      if (!(err instanceof TypeError)) console.error(err);
      setLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleBookmarkToggle = async () => {
    if (bookmarkRequestPending.current) return;
    bookmarkRequestPending.current = true;
    setBookmarkPending(true);
    setBookmarkError(null);
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    onBookmarkToggle?.(post.id, newBookmarked);

    try {
      const saved = await writePostBookmark(post.id, newBookmarked);
      setBookmarked(saved);
      if (saved !== newBookmarked) onBookmarkToggle?.(post.id, saved);
    } catch (error) {
      setBookmarked(!newBookmarked);
      onBookmarkToggle?.(post.id, !newBookmarked);
      setBookmarkError(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      bookmarkRequestPending.current = false;
      setBookmarkPending(false);
    }
  };

  const handleRepostToggle = () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setRepostsCount((prev) => (newReposted ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handlePinToggle = async () => {
    if (pinLock.current || !isOwner) return;
    pinLock.current = true;
    setPinPending(true);
    const previousPinned = pinned;
    const nextPinned = !previousPinned;
    setPinned(nextPinned);
    try {
      const savedPinned = await writePostPin(post.id, nextPinned);
      setPinned(savedPinned);
    } catch {
      setPinned(previousPinned);
    } finally {
      pinLock.current = false;
      setPinPending(false);
    }
  };

  const handleBodyUpdated = (update: PostBodyUpdate) => {
    setPostBody(update.body);
    setPostLanguage(update.language);
    setPostCodeSnippet(update.code_snippet);
    onEdit?.(post.id, update);
  };

  const presentedPost = parsePostExtras(postBody);
  const snippetMarkdown = postCodeSnippet
    ? createSnippetMarkdown(postCodeSnippet, postLanguage)
    : null;
  const { text: relativeTime, isRelative } = useHydrationSafeRelativeTime(post.created_at);
  const authorIdentity = readProfileIdentity(post.author.avatar_config);
  const authorDisplayName = getAuthorDisplayName(post.author);

  return (
    <div
      hidden={authorBlocked}
      onClick={handleCardClick}
      className={authorBlocked ? 'hidden' : 'block min-w-0 group cursor-pointer'}
    >
      <article
        className={cn(
          'relative min-w-0 transition-colors',
          flat
            ? 'rounded-none border-b border-dd-border/50 bg-transparent p-3 sm:p-4 lg:p-5 hover:bg-dd-surface/20'
            : 'bg-dd-card border border-dd-border rounded-xl p-3 sm:p-5 hover:border-blue-500/30'
        )}
      >
        {showPinnedBadge && pinned && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-dd-accent">
            <Pin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{text('Fixado no perfil', 'Pinned to profile')}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-2.5 flex items-start gap-2 sm:mb-3 sm:gap-3">
          <Link
            href={`/profile/${post.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:opacity-85 transition-opacity shrink-0 pt-0.5"
          >
            <AuthorAvatar
              username={post.author.username}
              avatar_url={post.author.avatar_url}
              avatar_config={post.author.avatar_config}
            />
          </Link>
          <div className="flex-1 min-w-0">
            {/* Row 1: Name, Flags, Title, Level */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Link
                href={`/profile/${post.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline truncate group/author min-w-0"
              >
                <span className="text-dd-text text-xs font-bold truncate min-w-0 group-hover/author:underline">
                  <ProfileName config={post.author.avatar_config}>{authorDisplayName}</ProfileName>
                </span>
              </Link>
              {authorIdentity.flags && authorIdentity.flags.length > 0 && (
                <span className="inline-flex items-center gap-1 shrink-0">
                  {authorIdentity.flags.map((code) => (
                    <ProfileFlag key={code} code={code} />
                  ))}
                </span>
              )}
              {authorIdentity.title && <ProfileTitle title={authorIdentity.title} />}
              <LevelBadge totalXp={post.author.total_xp ?? 0} />
            </div>

            {/* Row 2: @username · Postado há pouco / Postado ... */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dd-muted font-medium flex-wrap min-w-0">
              <Link
                href={`/profile/${post.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline truncate"
              >
                @{post.author.username.toLowerCase()}
              </Link>
              <span>·</span>
              <span className="text-[10px]">
                {isRelative && (relativeTime === 'agora' || relativeTime === 'just now')
                  ? text('Postado há pouco', 'Posted just now')
                  : `${text('Postado', 'Posted')} ${relativeTime}`}
              </span>
            </div>
          </div>
          <PostOptionsMenu
            post={{ ...post, body: postBody }}
            isOwner={isOwner}
            pinned={pinned}
            pinPending={pinPending}
            onTogglePin={() => void handlePinToggle()}
            onDeleted={(id) => onDelete?.(id)}
            onUpdated={handleBodyUpdated}
          />
        </div>

        <SensitiveContentGate isSensitive={presentedPost.isSensitive}>
          {/* Body preview */}
          <div className={cn('mb-3 min-w-0 text-dd-muted', styles.content)}>
            <MarkdownRenderer content={presentedPost.content} compact />
          </div>

          <PostAttachments
            postId={post.id}
            attachments={post.attachments}
            music={post.music}
            poll={post.poll}
            legacyImage={post.image_url}
            audience={post.audience}
          />

          {/* Code snippet preview */}
          {snippetMarkdown && !presentedPost.content.includes('```') && (
            <MarkdownRenderer content={snippetMarkdown} compact />
          )}
        </SensitiveContentGate>

        <PostLocation location={presentedPost.location} className="mb-3" />

        {/* Footer: Action bar (Twitter style) */}
        <PostActionsBar
          className={cn(
            'pt-2.5 mt-2',
            styles.actions,
            flat ? styles.actionsFlat : styles.actionsCard
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {/* 1. Comment bubble */}
          <Link
            href={`/post/${post.id}`}
            className={postActionClassName}
            title={text('Responder', 'Reply')}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
              if (openReplyComposer({ ...post, body: postBody })) event.preventDefault();
            }}
          >
            <MessageCircle aria-hidden="true" />
            <InteractionCount count={answersCount} />
          </Link>

          {/* 2. Repost Menu */}
          <RepostMenu
            appearance="post"
            count={repostsCount}
            isReposted={reposted}
            onRepost={handleRepostToggle}
            onQuote={() => {}}
          />

          {/* 3. Heart/Like button */}
          <LikeButton
            appearance="post"
            count={likesCount}
            isActive={liked}
            onToggle={handleLikeToggle}
            title={text('Curtir post', 'Like post')}
          />

          {/* 4. BookmarkButton */}
          <BookmarkButton
            appearance="post"
            isSaved={bookmarked}
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
                    // fallback to clipboard
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
              className={postActionClassName}
              title={text('Compartilhar post', 'Share post')}
            >
              {shareCopied ? (
                <Check className="text-emerald-400" aria-hidden="true" />
              ) : (
                <Share2 aria-hidden="true" />
              )}
            </button>
            {shareCopied && (
              <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-dd-surface border border-dd-border text-dd-text text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl animate-slide-up z-50">
                Link copiado!
              </div>
            )}
          </div>
        </PostActionsBar>
      </article>
    </div>
  );
}
