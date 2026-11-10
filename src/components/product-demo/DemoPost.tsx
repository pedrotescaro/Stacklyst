'use client';

import { useMemo } from 'react';
import { MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { CodeBlockFrame } from '@/components/CodeBlockFrame';
import { LevelBadge } from '@/components/LevelBadge';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostActionsBar, postActionClassName, InteractionCount } from '@/components/PostActionsBar';
import { ProfileName } from '@/components/profile/ProfileIdentity';
import { LikeButton } from '@/components/motion/LikeButton';
import { RepostMenu } from '@/components/motion/RepostMenu';
import { BookmarkButton } from '@/components/motion/BookmarkButton';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from '@/components/PostCard.module.css';

hljs.registerLanguage('python', python);

export interface DemoPostProps {
  author: { username: string; name: string; total_xp: number; avatar_url?: string | null };
  body: string;
  /** Already-localized "Postado …" label. */
  createdLabel: string;
  code?: { language: 'python'; source: string; output?: string | null; running?: boolean };
  answers?: number;
  reposts?: number;
  likes: number;
  liked?: boolean;
  bookmarked?: boolean;
  /** Mirrors the pulsing border the feed shows while a post is being saved. */
  optimistic?: boolean;
  className?: string;
}

const noop = () => {};

/**
 * Projection of `PostCard` in its `flat` feed variant: same header, markdown
 * body, executable code block and action bar, fed with fictional data and
 * no network handlers.
 */
export function DemoPost({
  author,
  body,
  createdLabel,
  code,
  answers = 0,
  reposts = 0,
  likes,
  liked = false,
  bookmarked = false,
  optimistic = false,
  className,
}: DemoPostProps) {
  const { text } = useLocalizedText();
  const highlighted = useMemo(
    () => (code ? hljs.highlight(code.source, { language: code.language }).value : ''),
    [code]
  );

  return (
    <div className={cn('block min-w-0', optimistic && 'dd-optimistic-post', className)}>
      <article className="relative min-w-0 rounded-none border-b border-dd-border/50 bg-transparent p-3 transition-colors sm:p-4 lg:p-5">
        <div className="mb-2.5 flex items-start gap-2 sm:mb-3 sm:gap-3">
          <span className="shrink-0 pt-0.5">
            <AuthorAvatar username={author.username} avatar_url={author.avatar_url} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="min-w-0 truncate text-xs font-bold text-dd-text">
                <ProfileName>{author.name}</ProfileName>
              </span>
              <LevelBadge totalXp={author.total_xp} />
            </div>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-medium text-dd-muted">
              <span className="truncate">@{author.username.toLowerCase()}</span>
              <span>·</span>
              <span className="text-[10px]">{createdLabel}</span>
            </div>
          </div>
        </div>

        <div className={cn('mb-3 min-w-0 text-dd-muted', styles.content)}>
          <MarkdownRenderer content={body} compact />
        </div>

        {code && (
          <CodeBlockFrame
            language={code.language}
            canRun
            running={code.running}
            output={code.output ?? null}
            onRun={noop}
            onCopy={noop}
          >
            <span dangerouslySetInnerHTML={{ __html: highlighted }} />
          </CodeBlockFrame>
        )}

        <PostActionsBar className={cn('mt-2 pt-2.5', styles.actions, styles.actionsFlat)}>
          <button type="button" className={postActionClassName} title={text('Responder', 'Reply')}>
            <MessageCircle aria-hidden="true" />
            <InteractionCount count={answers} />
          </button>
          <RepostMenu appearance="post" count={reposts} onRepost={noop} onQuote={noop} />
          <LikeButton
            appearance="post"
            count={likes}
            isActive={liked}
            onToggle={noop}
            title={text('Curtir post', 'Like post')}
          />
          <BookmarkButton appearance="post" isSaved={bookmarked} onToggle={noop} />
          <button
            type="button"
            className={postActionClassName}
            title={text('Compartilhar post', 'Share post')}
          >
            <Share2 aria-hidden="true" />
          </button>
          <button
            type="button"
            className={postActionClassName}
            title={text('Mais opções', 'More options')}
          >
            <MoreHorizontal aria-hidden="true" />
          </button>
        </PostActionsBar>
      </article>
    </div>
  );
}
