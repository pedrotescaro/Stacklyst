'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Share2 } from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { ProfileName, ProfileFlag, ProfileTitle } from '@/components/profile/ProfileIdentity';
import { LevelBadge } from '@/components/LevelBadge';
import { readProfileIdentity, getAuthorDisplayName } from '@/lib/profile-style';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { parseReplyMedia } from '@/lib/reply-media';
import { parsePostExtras } from '@/lib/post-composer';
import { PostAttachments } from '@/components/posts/PostAttachments';
import { ReplyOwnerMenu } from '@/components/replies/ReplyOwnerMenu';
import { ReplyEditForm } from '@/components/replies/ReplyEditForm';
import { PostLocation, SensitiveContentGate } from '@/components/PostPresentation';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { PostActionsBar, postActionClassName } from '@/components/PostActionsBar';
import { LikeButton } from '@/components/motion/LikeButton';
import { useLocalizedText } from '@/i18n/useLocalizedText';

function ThreadIdentity({ author, createdAt }: { author: any; createdAt: string | Date }) {
  const { text: relativeTime } = useHydrationSafeRelativeTime(createdAt);
  const identity = readProfileIdentity(author.avatar_config);
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <Link
          href={`/profile/${author.username}`}
          className="min-w-0 truncate text-xs font-bold text-dd-text hover:underline sm:text-sm"
        >
          <ProfileName config={author.avatar_config}>{getAuthorDisplayName(author)}</ProfileName>
        </Link>
        {identity.flags?.map((code) => (
          <ProfileFlag key={code} code={code} />
        ))}
        {identity.title && <ProfileTitle title={identity.title} />}
        <LevelBadge totalXp={author.total_xp ?? 0} />
      </div>
      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-dd-muted">
        <Link href={`/profile/${author.username}`} className="truncate hover:underline">
          @{author.username}
        </Link>
        <span aria-hidden="true">·</span>
        <span>{relativeTime}</span>
      </div>
    </div>
  );
}

/**
 * Posts keep media in their own columns; replies carry it inside the body
 * (see reply-media). Both also hide composer markers such as the location.
 */
function readThreadContent(item: any, kind: 'post' | 'reply') {
  const body = typeof item?.body === 'string' ? item.body : '';
  const media =
    kind === 'post'
      ? {
          content: body,
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
          music: item.music ?? null,
        }
      : parseReplyMedia(body);
  const extras = parsePostExtras(media.content);
  return { ...media, ...extras };
}

function ThreadBody({
  item,
  kind,
  compact = false,
}: {
  item: any;
  kind: 'post' | 'reply';
  compact?: boolean;
}) {
  const content = readThreadContent(item, kind);
  const hasMedia =
    content.attachments.length > 0 ||
    Boolean(content.music) ||
    (kind === 'post' && Boolean(item.poll || item.image_url));
  return (
    <SensitiveContentGate isSensitive={content.isSensitive}>
      {content.content && (
        <div
          className={
            compact ? 'mt-2 line-clamp-4 text-sm text-dd-text/85' : 'mt-3 text-sm text-dd-text'
          }
        >
          <MarkdownRenderer content={content.content} compact={compact} />
        </div>
      )}
      {hasMedia && (
        <div className="mt-2">
          <PostAttachments
            postId={item.id}
            attachments={content.attachments}
            music={content.music}
            poll={kind === 'post' ? item.poll : null}
            legacyImage={kind === 'post' ? item.image_url : null}
          />
        </div>
      )}
      <PostLocation location={content.location} className="mt-2" />
    </SensitiveContentGate>
  );
}

function ThreadContext({
  item,
  kind,
  href,
  label,
}: {
  item: any;
  kind: 'post' | 'reply';
  href: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <Link href={`/profile/${item.author.username}`}>
          <AuthorAvatar
            username={item.author.username}
            avatar_url={item.author.avatar_url}
            avatar_config={item.author.avatar_config}
            size="sm"
          />
        </Link>
        <div aria-hidden="true" className="mt-1.5 min-h-6 w-px flex-1 bg-dd-border" />
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <ThreadIdentity author={item.author} createdAt={item.created_at} />
        <ThreadBody item={item} kind={kind} compact />
        {item.code_snippet && !item.body?.includes('```') && (
          <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-dd-surface p-3 text-xs text-dd-text">
            <code>{item.code_snippet}</code>
          </pre>
        )}
        <Link
          href={href}
          className="mt-2 inline-block text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
        >
          {label}
        </Link>
      </div>
    </div>
  );
}

export function ProfileReplyThread({ reply, currentUser }: { reply: any; currentUser?: any }) {
  const { text } = useLocalizedText();
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  // Edits are applied locally so the reply updates without reloading the tab.
  const [body, setBody] = useState<string>(reply?.body ?? '');
  const [voteCount, setVoteCount] = useState(reply?.upvotes ?? 0);
  const [userVote, setUserVote] = useState(reply?.votes?.[0]?.value ?? 0);
  const [voting, setVoting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [blockedIds, setBlockedIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const ids = [reply?.author?.id, reply?.post?.author?.id, reply?.parent?.author?.id];
    const onBlock = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; blocked: boolean }>).detail;
      if (!ids.includes(detail.userId)) return;
      setBlockedIds((previous) => {
        const next = new Set(previous);
        if (detail.blocked) next.add(detail.userId);
        else next.delete(detail.userId);
        return next;
      });
    };
    window.addEventListener('stacklyst:block-changed', onBlock);
    return () => window.removeEventListener('stacklyst:block-changed', onBlock);
  }, [reply?.author?.id, reply?.post?.author?.id, reply?.parent?.author?.id]);
  if (!reply?.post?.author || !reply?.author || blockedIds.size || deleted) return null;
  const isOwnReply = Boolean(
    currentUser?.id && (reply.author_id ?? reply.author.id) === currentUser.id
  );

  const href = `/post/${reply.post_id}#answer-${reply.id}`;

  async function toggleLike() {
    if (voting) return;
    const beforeCount = voteCount,
      beforeVote = userVote;
    const next = userVote === 1 ? 0 : 1;
    setVoteCount(voteCount + next - userVote);
    setUserVote(next);
    setVoting(true);
    setError('');
    try {
      const response = await fetch(`/api/answers/${reply.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: next }),
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      setVoteCount(result.upvotes);
    } catch {
      setVoteCount(beforeCount);
      setUserVote(beforeVote);
      setError(
        text(
          'Não foi possível atualizar a curtida. Tente novamente.',
          'Could not update your like. Try again.'
        )
      );
    } finally {
      setVoting(false);
    }
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${href}`);
      setFeedback(text('Link da resposta copiado.', 'Reply link copied.'));
    } catch {
      setError(
        text(
          'Não foi possível copiar o link. Tente novamente.',
          'Could not copy the link. Try again.'
        )
      );
    }
  }

  return (
    <article
      aria-label={text(
        `Resposta de @${reply.author.username}`,
        `Reply by @${reply.author.username}`
      )}
      className="min-w-0 bg-transparent p-3 transition-colors hover:bg-dd-surface/10 sm:p-4 lg:p-5"
    >
      <ThreadContext
        item={reply.post}
        kind="post"
        href={`/post/${reply.post_id}`}
        label={text('Ver publicação original', 'View original post')}
      />
      {reply.parent?.author && (
        <ThreadContext
          item={reply.parent}
          kind="reply"
          href={`/post/${reply.post_id}#answer-${reply.parent.id}`}
          label={text('Ver resposta anterior', 'View previous reply')}
        />
      )}
      <div className="flex min-w-0 gap-3">
        <Link href={`/profile/${reply.author.username}`} className="shrink-0 self-start">
          <AuthorAvatar
            username={reply.author.username}
            avatar_url={reply.author.avatar_url}
            avatar_config={reply.author.avatar_config}
            size="sm"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <ThreadIdentity author={reply.author} createdAt={reply.created_at} />
          <p className="mt-1 text-xs text-dd-muted">
            {text('Respondendo a', 'Replying to')}{' '}
            <Link
              href={`/profile/${(reply.parent?.author ?? reply.post.author).username}`}
              className="text-blue-700 underline underline-offset-2 dark:text-blue-400"
            >
              @{(reply.parent?.author ?? reply.post.author).username}
            </Link>
          </p>
          {editing ? (
            <ReplyEditForm
              answerId={reply.id}
              body={body}
              onCancel={() => setEditing(false)}
              onSaved={(next) => {
                setBody(next);
                setEditing(false);
              }}
            />
          ) : (
            <ThreadBody item={{ ...reply, body }} kind="reply" />
          )}
          {reply.code_snippet && !body.includes('```') && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-dd-surface p-3 text-xs text-dd-text">
              <code>{reply.code_snippet}</code>
            </pre>
          )}
          <div className="mt-4 border-t border-dd-border pt-2">
            <PostActionsBar>
              <Link
                href={href}
                className={postActionClassName}
                aria-label={text('Abrir resposta', 'Open reply')}
              >
                <MessageCircle size={18} aria-hidden="true" />
              </Link>
              <LikeButton
                appearance="post"
                count={voteCount}
                isActive={userVote === 1}
                onToggle={toggleLike}
                title={text('Curtir resposta', 'Like reply')}
              />
              <button
                type="button"
                onClick={share}
                className={postActionClassName}
                aria-label={text('Compartilhar resposta', 'Share reply')}
              >
                <Share2 size={18} aria-hidden="true" />
              </button>
              {isOwnReply && (
                <ReplyOwnerMenu
                  answerId={reply.id}
                  onEdit={() => setEditing(true)}
                  onDeleted={() => setDeleted(true)}
                />
              )}
            </PostActionsBar>
          </div>
          {feedback && (
            <p role="status" className="mt-2 text-xs text-dd-muted">
              {feedback}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-2 text-xs text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
