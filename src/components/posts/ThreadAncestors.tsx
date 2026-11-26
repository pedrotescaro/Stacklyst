'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { LevelBadge } from '@/components/LevelBadge';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostLocation, SensitiveContentGate } from '@/components/PostPresentation';
import { PostAttachments } from '@/components/posts/PostAttachments';
import type { PostBodyUpdate } from '@/components/posts/PostOptionsMenu';
import { ThreadItemMenu } from '@/components/posts/ThreadItemMenu';
import { ReplyEditForm } from '@/components/replies/ReplyEditForm';
import { ProfileFlag, ProfileName, ProfileTitle } from '@/components/profile/ProfileIdentity';
import type { AnswerNode } from '@/components/answer-types';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { prismaLanguageToEditor } from '@/lib/editor/languages';
import { parsePostExtras } from '@/lib/post-composer';
import { getAuthorDisplayName, readProfileIdentity } from '@/lib/profile-style';
import { parseReplyMedia } from '@/lib/reply-media';

const INTERACTIVE_SELECTOR =
  'button, a, select, input, textarea, pre, audio, video, form, [role="dialog"], [role="menu"], [data-code-block], .notion-editor';

function createSnippetMarkdown(code: string, language?: string | null) {
  const fenceLength = Math.max(3, ...[...code.matchAll(/`+/g)].map((match) => match[0].length + 1));
  const fence = '`'.repeat(fenceLength);
  const snippetLanguage = language ? prismaLanguageToEditor(language) : 'text-static';
  return `${fence}${snippetLanguage}\n${code.replace(/\n?$/, '\n')}${fence}`;
}

function AncestorItem({
  id,
  href,
  author,
  createdAt,
  rawBody,
  kind,
  attachments,
  music,
  poll,
  legacyImage,
  audience,
  location,
  language,
  codeSnippet,
  menu,
  editor,
}: {
  id: string;
  href: string;
  author: any;
  createdAt: string | Date;
  rawBody: string;
  kind: 'post' | 'reply';
  attachments?: any;
  music?: any;
  poll?: any;
  legacyImage?: string | null;
  audience?: string | null;
  location?: string | null;
  language?: string | null;
  codeSnippet?: string | null;
  /** The item's "..." menu, top right. */
  menu?: ReactNode;
  /** Replaces the body while the item is being edited. */
  editor?: ReactNode;
}) {
  const router = useRouter();
  const { text: relativeTime } = useHydrationSafeRelativeTime(createdAt);
  const identity = readProfileIdentity(author.avatar_config);
  const media = kind === 'reply' ? parseReplyMedia(rawBody) : null;
  const extras = parsePostExtras(media ? media.content : rawBody);
  const resolvedAttachments = media ? media.attachments : attachments;
  const resolvedMusic = media ? media.music : music;
  const snippetMarkdown =
    kind === 'post' && codeSnippet && !extras.content.includes('```')
      ? createSnippetMarkdown(codeSnippet, language)
      : null;

  return (
    <div
      data-testid={kind === 'post' ? 'ancestor-root-post' : `ancestor-reply-${id}`}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest(INTERACTIVE_SELECTOR) || window.getSelection()?.toString()) return;
        router.push(href);
      }}
      className="flex cursor-pointer gap-2.5 px-4 pt-4 transition-colors hover:bg-dd-surface/20 sm:gap-3 sm:px-6"
    >
      <div className="flex w-9 shrink-0 flex-col items-center">
        <Link
          href={`/profile/${author.username}`}
          onClick={(event) => event.stopPropagation()}
          className="shrink-0 pt-0.5 transition-opacity hover:opacity-85"
        >
          <AuthorAvatar
            username={author.username}
            avatar_url={author.avatar_url}
            avatar_config={author.avatar_config}
            size="md"
          />
        </Link>
        <span
          aria-hidden="true"
          data-testid="ancestor-thread-line"
          className="mt-1.5 min-h-4 w-0.5 flex-1 rounded-full bg-dd-border"
        />
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <Link
                href={`/profile/${author.username}`}
                onClick={(event) => event.stopPropagation()}
                className="group/author min-w-0 truncate hover:underline"
              >
                <span className="min-w-0 truncate text-xs font-bold text-dd-text group-hover/author:underline sm:text-sm">
                  <ProfileName config={author.avatar_config}>
                    {getAuthorDisplayName(author)}
                  </ProfileName>
                </span>
              </Link>
              {identity.flags && identity.flags.length > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1">
                  {identity.flags.map((code) => (
                    <ProfileFlag key={code} code={code} />
                  ))}
                </span>
              )}
              {identity.title && <ProfileTitle title={identity.title} />}
              {author.total_xp !== undefined && <LevelBadge totalXp={author.total_xp} />}
            </div>

            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-medium text-dd-muted">
              <Link
                href={`/profile/${author.username}`}
                onClick={(event) => event.stopPropagation()}
                className="truncate hover:underline"
              >
                @{author.username.toLowerCase()}
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href={href}
                onClick={(event) => event.stopPropagation()}
                className="text-[10px] hover:underline"
              >
                {relativeTime}
              </Link>
            </div>
          </div>
          {menu}
        </div>

        {editor ?? (
          <SensitiveContentGate isSensitive={extras.isSensitive}>
            {extras.content && (
              <div className="mt-2">
                <MarkdownRenderer content={extras.content} compact />
              </div>
            )}
            {(resolvedAttachments?.length > 0 ||
              resolvedMusic ||
              (kind === 'post' && (poll || legacyImage))) && (
              <div className="mt-2">
                <PostAttachments
                  postId={id}
                  attachments={resolvedAttachments}
                  music={resolvedMusic}
                  poll={kind === 'post' ? poll : null}
                  legacyImage={kind === 'post' ? legacyImage : null}
                  audience={kind === 'post' ? audience : null}
                />
              </div>
            )}
            {snippetMarkdown && <MarkdownRenderer content={snippetMarkdown} compact />}
            {kind === 'reply' && codeSnippet && !rawBody.includes('```') && (
              <div className="mt-3 overflow-x-auto rounded-lg bg-dd-bg p-3">
                <pre className="whitespace-pre font-mono text-xs text-dd-text">{codeSnippet}</pre>
              </div>
            )}
            <PostLocation location={location || extras.location} className="mt-2" />
          </SensitiveContentGate>
        )}
      </div>
    </div>
  );
}

export function ThreadAncestors({
  post,
  ancestors,
  viewerId,
  onPostDeleted,
  onPostUpdated,
  onReplyUpdated,
  onReplyDeleted,
}: {
  post: any;
  ancestors: AnswerNode[];
  viewerId?: string | null;
  onPostDeleted?: () => void;
  onPostUpdated?: (update: PostBodyUpdate) => void;
  onReplyUpdated?: (answerId: string, body: string) => void;
  onReplyDeleted?: (answerId: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  return (
    <div aria-label="Contexto da thread">
      <AncestorItem
        id={post.id}
        href={`/post/${post.id}`}
        author={post.author}
        createdAt={post.created_at}
        rawBody={post.body}
        kind="post"
        attachments={post.attachments}
        music={post.music}
        poll={post.poll}
        legacyImage={post.image_url}
        audience={post.audience}
        location={post.location}
        language={post.language}
        codeSnippet={post.code_snippet}
        menu={
          <ThreadItemMenu
            kind="post"
            item={post}
            viewerId={viewerId}
            onDeleted={onPostDeleted}
            onUpdated={onPostUpdated}
          />
        }
      />
      {ancestors.map((ancestor) => (
        <AncestorItem
          key={ancestor.id}
          id={ancestor.id}
          href={`/post/${post.id}/reply/${ancestor.id}`}
          author={ancestor.author}
          createdAt={ancestor.created_at}
          rawBody={ancestor.body}
          kind="reply"
          codeSnippet={ancestor.code_snippet}
          menu={
            <ThreadItemMenu
              kind="reply"
              item={ancestor}
              viewerId={viewerId}
              onEdit={() => setEditingId(ancestor.id)}
              onDeleted={() => onReplyDeleted?.(ancestor.id)}
            />
          }
          editor={
            editingId === ancestor.id ? (
              <ReplyEditForm
                answerId={ancestor.id}
                body={ancestor.body}
                onCancel={() => setEditingId(null)}
                onSaved={(next) => {
                  onReplyUpdated?.(ancestor.id, next);
                  setEditingId(null);
                }}
              />
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
