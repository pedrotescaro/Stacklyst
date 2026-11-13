'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Image as ImageIcon, ImagePlay, Music2, Mic, Code2, MoreHorizontal, X } from 'lucide-react';
import { ComposeModal } from '@/components/motion/ComposeModal';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { PostAttachments } from '@/components/posts/PostAttachments';
import { PostComposerExtras } from '@/components/PostComposerExtras';
import { ProfileName } from '@/components/profile/ProfileIdentity';
import { ComposerAttachments } from './ComposerAttachments';
import { ComposerAttachmentPicker, type ComposerAttachmentPanel } from './ComposerAttachmentPicker';
import type { NotionEditorRef } from '@/components/editor/NotionEditor';
import type { ComposerUser } from './PostComposerDialog';
import { appendPostExtras, parsePostExtras, type ReplyAudience } from '@/lib/post-composer';
import type { PostAttachment } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { getAuthorDisplayName } from '@/lib/profile-style';
import { useHydrationSafeRelativeTime } from '@/hooks/useHydrationSafeRelativeTime';
import { POST_CHAR_LIMIT } from '@/lib/motion';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { cn } from '@/lib/cn';
import './PostComposer.css';

const Editor = dynamic(
  () => import('@/components/editor/NotionEditor').then((module) => module.NotionEditor),
  { ssr: false, loading: () => <div className="dd-skeleton h-16 w-full rounded-lg" /> }
);

/** The post being answered, as the feed already has it. */
export interface ReplyTarget {
  id: string;
  body: string;
  created_at: string | Date;
  image_url?: string | null;
  attachments?: PostAttachment[] | null;
  music?: SpotifyProfileTrack | null;
  audience?: string | null;
  author: {
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
    name?: string | null;
  };
}

export const OPEN_REPLY_EVENT = 'stacklyst:open-reply';
export const REPLY_CREATED_EVENT = 'stacklyst:reply-created';

/**
 * Asks the app shell to open the reply pop-up. Returns false when nobody can
 * handle it (signed out), so the caller can fall back to the post page.
 */
export function openReplyComposer(target: ReplyTarget) {
  const event = new CustomEvent(OPEN_REPLY_EVENT, { detail: target, cancelable: true });
  return !window.dispatchEvent(event);
}

function Tool({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onPointerDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn('composer-tool', active && 'is-active')}
    >
      {children}
    </button>
  );
}

function OriginalPost({ target }: { target: ReplyTarget }) {
  const { text } = useLocalizedText();
  const { text: time } = useHydrationSafeRelativeTime(target.created_at);
  const presented = parsePostExtras(target.body);
  return (
    <div className="reply-original">
      <div className="reply-original-rail">
        <AuthorAvatar
          username={target.author.username}
          avatar_url={target.author.avatar_url}
          avatar_config={target.author.avatar_config}
          size="lg"
          className="!h-10 !w-10 md:!h-11 md:!w-11"
        />
        <span aria-hidden="true" className="reply-thread-line" />
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <p className="flex min-w-0 items-center gap-1.5 text-[15px]">
          <span className="truncate font-bold text-dd-text">
            <ProfileName config={target.author.avatar_config}>
              {getAuthorDisplayName(target.author)}
            </ProfileName>
          </span>
          <span className="truncate text-dd-muted">
            @{target.author.username.toLowerCase()}
            {time ? ` · ${time}` : ''}
          </span>
        </p>
        {presented.isSensitive ? (
          <p className="mt-1 text-sm text-dd-muted">
            {text('Conteúdo sensível', 'Sensitive content')}
          </p>
        ) : (
          <>
            {presented.content && (
              <div className="reply-original-body mt-1 text-[15px] text-dd-text">
                <MarkdownRenderer content={presented.content} compact />
              </div>
            )}
            <div className="reply-original-media">
              <PostAttachments
                postId={target.id}
                attachments={target.attachments}
                music={target.music}
                legacyImage={target.image_url}
              />
            </div>
          </>
        )}
        <p className="mt-3 text-[15px] text-dd-muted">
          {text('Respondendo a', 'Replying to')}{' '}
          <Link
            href={`/profile/${target.author.username}`}
            className="text-dd-accent hover:underline"
          >
            @{target.author.username.toLowerCase()}
          </Link>
        </p>
      </div>
    </div>
  );
}

const emptyExtras = () => ({
  location: '',
  scheduledAt: null as string | null,
  isSensitive: false,
  replyAudience: 'everyone' as ReplyAudience,
});

export function ReplyComposerDialog({
  target,
  onClose,
  user,
}: {
  target: ReplyTarget | null;
  onClose: () => void;
  user: ComposerUser;
}) {
  const { text } = useLocalizedText();
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <ComposeModal
      open={Boolean(target)}
      onClose={onClose}
      hasDraft={dirty}
      composerLayout
      fitContent
      busy={busy}
      label={text('Responder postagem', 'Reply to post')}
    >
      {target && (
        <ReplyComposerForm
          postId={target.id}
          user={user}
          header={<OriginalPost target={target} />}
          onDone={onClose}
          onDraftChange={setDirty}
          onBusyChange={setBusy}
        />
      )}
    </ComposeModal>
  );
}

/**
 * The reply writer shared by the pop-up and the post page: text, images, GIF,
 * music, audio, code and the extra options, posted to the answers API.
 */
export function ReplyComposerForm({
  postId,
  user,
  header,
  onDone,
  onDraftChange,
  onBusyChange,
  className,
}: {
  postId: string;
  user: ComposerUser;
  header?: ReactNode;
  onDone?: () => void;
  onDraftChange?: (hasDraft: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  className?: string;
}) {
  const { text } = useLocalizedText();
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [music, setMusic] = useState<SpotifyProfileTrack | null>(null);
  const [extras, setExtras] = useState(emptyExtras);
  const [panel, setPanel] = useState<ComposerAttachmentPanel | 'more'>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<NotionEditorRef>(null);
  const formId = useId();

  const reset = () => {
    setBody('');
    setAttachments([]);
    setMusic(null);
    setExtras(emptyExtras());
    setPanel(null);
    setError(null);
  };

  const finalBody = appendPostExtras(body, extras);
  const hasContent = Boolean(body.trim() || attachments.length || music);
  const tooShort = !attachments.length && !music && body.trim().length < 5;
  const canReply =
    hasContent && !tooShort && finalBody.length <= POST_CHAR_LIMIT && !busy && !submitting;
  useEffect(() => onDraftChange?.(hasContent), [hasContent, onDraftChange]);
  useEffect(() => onBusyChange?.(busy || submitting), [busy, submitting, onBusyChange]);
  const toggle = (value: ComposerAttachmentPanel | 'more') =>
    setPanel((current) => (current === value ? null : value));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canReply) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/posts/${postId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: finalBody, attachments, music }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.message ||
            data.error ||
            text('Não foi possível responder. Tente novamente.', 'Could not reply. Try again.')
        );
      window.dispatchEvent(new CustomEvent(REPLY_CREATED_EVENT, { detail: { postId, ...data } }));
      reset();
      onDone?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : text('Não foi possível responder. Tente novamente.', 'Could not reply. Try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const extrasProps = {
    contentToolsOnly: true,
    postBody: body,
    setPostBody: setBody,
    editorRef,
    replyAudience: extras.replyAudience,
    setReplyAudience: (value: ReplyAudience) =>
      setExtras((current) => ({ ...current, replyAudience: value })),
    scheduledAt: extras.scheduledAt,
    setScheduledAt: (value: string | null) =>
      setExtras((current) => ({ ...current, scheduledAt: value })),
    location: extras.location,
    setLocation: (value: string) => setExtras((current) => ({ ...current, location: value })),
    isSensitive: extras.isSensitive,
    setIsSensitive: (value: boolean) =>
      setExtras((current) => ({ ...current, isSensitive: value })),
  };
  const pickerPanel = panel === 'more' ? null : panel;

  return (
    <form
      id={formId}
      onSubmit={submit}
      className={cn('post-composer-form relative', pickerPanel && 'min-h-[480px]', className)}
      aria-label={text('Responder postagem', 'Reply to post')}
    >
      <div className="composer-scroll">
        {header}
        <div className="composer-writing-row">
          <div className="shrink-0 pt-1">
            <AuthorAvatar
              username={user.username}
              avatar_url={user.avatar_url}
              avatar_config={user.avatar_config}
              size="lg"
              className="!h-10 !w-10 md:!h-11 md:!w-11"
            />
          </div>
          <div className="relative min-w-0 flex-1">
            <Editor
              ref={editorRef}
              value={body}
              onChange={setBody}
              placeholder={text('Postar sua resposta', 'Post your reply')}
              minHeight="5rem"
              className="post-composer-editor"
            />
            {finalBody.length > POST_CHAR_LIMIT * 0.8 && (
              <p
                className={cn(
                  'composer-counter',
                  finalBody.length > POST_CHAR_LIMIT && 'text-red-500'
                )}
              >
                {finalBody.length.toLocaleString('pt-BR')}/{POST_CHAR_LIMIT.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>
        <div className="composer-attachments-area">
          <ComposerAttachments
            attachments={attachments}
            onChange={setAttachments}
            music={music}
            onMusicChange={setMusic}
            poll={null}
            onPollChange={() => {}}
            disabled={busy || submitting}
          />
          {(extras.location || extras.isSensitive) && (
            <PostComposerExtras {...extrasProps} section="meta" />
          )}
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mx-4 mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
      {busy && (
        <p role="status" className="px-4 pb-2 text-xs text-dd-muted">
          {text('Preparando anexo…', 'Preparing attachment…')}
        </p>
      )}
      <div className="composer-footer">
        {panel === 'more' && (
          <div
            className="composer-popover"
            role="region"
            aria-label={text('Mais opções', 'More options')}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{text('Mais opções', 'More options')}</p>
              <button
                type="button"
                aria-label={text('Fechar opções', 'Close options')}
                className="composer-tool !h-8 !w-8"
                onClick={() => setPanel(null)}
              >
                <X />
              </button>
            </div>
            <PostComposerExtras {...extrasProps} section="tools" />
          </div>
        )}
        <div className="reply-composer-bar">
          <div
            className="reply-composer-tools"
            role="toolbar"
            aria-label={text('Adicionar conteúdo', 'Add content')}
          >
            <Tool
              label={text('Adicionar imagens', 'Add images')}
              active={panel === 'image'}
              onClick={() => toggle('image')}
            >
              <ImageIcon />
            </Tool>
            <Tool
              label={text('Adicionar GIF', 'Add GIF')}
              active={panel === 'gif'}
              onClick={() => toggle('gif')}
            >
              <ImagePlay />
            </Tool>
            <Tool
              label={text('Adicionar música', 'Add music')}
              active={panel === 'music' || Boolean(music)}
              onClick={() => toggle('music')}
            >
              <Music2 />
            </Tool>
            <Tool
              label={text('Gravar áudio', 'Record audio')}
              active={panel === 'audio'}
              onClick={() => toggle('audio')}
            >
              <Mic />
            </Tool>
            <Tool
              label={text('Inserir código executável', 'Insert executable code')}
              onClick={() => {
                editorRef.current?.insertCodeBlock();
                setPanel(null);
              }}
            >
              <Code2 />
            </Tool>
            <Tool
              label={text('Mais opções', 'More options')}
              active={panel === 'more'}
              onClick={() => toggle('more')}
            >
              <MoreHorizontal />
            </Tool>
          </div>
          <button
            type="submit"
            form={formId}
            disabled={!canReply}
            className="shrink-0 cursor-pointer rounded-full bg-dd-accent px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? text('Respondendo…', 'Replying…') : text('Responder', 'Reply')}
          </button>
        </div>
      </div>
      <ComposerAttachmentPicker
        panel={pickerPanel}
        onClose={() => setPanel(null)}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        music={music}
        onMusicChange={setMusic}
        onBusyChange={setBusy}
      />
    </form>
  );
}
