'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import {
  AlignLeft,
  Bold,
  Italic,
  Underline,
  Baseline,
  Globe,
  Users,
  Check,
  Image as ImageIcon,
  ImagePlay,
  Music2,
  Mic,
  ChartNoAxesColumnIncreasing,
  Code2,
  MoreHorizontal,
  Eraser,
  ChevronDown,
  X,
  List,
  Quote,
  Heading2,
  Pilcrow,
} from 'lucide-react';
import { ComposeModal } from '@/components/motion/ComposeModal';
import { PublishButton, type PublishState } from '@/components/motion/PublishButton';
import { MentionDropdown } from '@/components/motion/MentionDropdown';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { PostComposerExtras } from '@/components/PostComposerExtras';
import { ComposerAttachments } from './ComposerAttachments';
import { ComposerAttachmentPicker } from './ComposerAttachmentPicker';
import type { NotionEditorRef } from '@/components/editor/NotionEditor';
import { POST_TEXT_COLORS } from '@/lib/editor/text-colors';
import { appendPostExtras, type ReplyAudience } from '@/lib/post-composer';
import type { PostAttachment, PostAudience, PostPollDraft } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { extractPostMetadata } from '@/lib/editor/extract-metadata';
import { POST_CHAR_LIMIT } from '@/lib/motion';
import { cn } from '@/lib/cn';
import './PostComposer.css';

const Editor = dynamic(
  () => import('@/components/editor/NotionEditor').then((module) => module.NotionEditor),
  { ssr: false, loading: () => <div className="dd-skeleton h-24 w-full rounded-lg" /> }
);

export interface ComposerUser {
  id: string;
  username: string;
  avatar_url?: string | null;
  avatar_config?: unknown;
}
export interface ComposerQuote {
  id: string;
  body: string;
  author: { username: string };
}
type Panel = 'audience' | 'color' | 'text' | 'more' | 'gif' | 'image' | 'music' | 'audio' | null;
type FormatState = { bold: boolean; italic: boolean; underline: boolean; color: string | null };
interface Draft {
  clientId: string;
  body: string;
  audience: PostAudience;
  attachments: PostAttachment[];
  music: SpotifyProfileTrack | null;
  poll: PostPollDraft | null;
  location: string;
  scheduledAt: string | null;
  isSensitive: boolean;
  replyAudience: ReplyAudience;
  quote: ComposerQuote | null;
}
const emptyDraft = (): Draft => ({
  clientId: crypto.randomUUID(),
  body: '',
  audience: 'everyone',
  attachments: [],
  music: null,
  poll: null,
  location: '',
  scheduledAt: null,
  isSensitive: false,
  replyAudience: 'everyone',
  quote: null,
});

export function openPostComposer(quote?: ComposerQuote) {
  window.dispatchEvent(new CustomEvent('stacklyst:open-composer', { detail: { quote } }));
}

function Tool({
  label,
  active,
  onClick,
  children,
  className,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onPointerDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn('composer-tool', active && 'is-active', className)}
    >
      {children}
    </button>
  );
}

export function PostComposerDialog({
  open,
  onClose,
  user,
  quote,
}: {
  open: boolean;
  onClose: () => void;
  user: ComposerUser;
  quote?: ComposerQuote | null;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [state, setState] = useState<PublishState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [format, setFormat] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    color: null,
  });
  const [showMentions, setShowMentions] = useState(true);
  const editorRef = useRef<NotionEditorRef>(null);
  const formId = useId();
  const submitLock = useRef(false);
  const storageKey = `stacklyst-post-draft:${user.id}`;
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      setDraft(
        parsed
          ? {
              ...emptyDraft(),
              ...parsed,
              body: typeof parsed.body === 'string' ? parsed.body : '',
              audience: parsed.audience === 'followers' ? 'followers' : 'everyone',
              attachments: Array.isArray(parsed.attachments)
                ? parsed.attachments
                : parsed.image
                  ? [{ type: 'image', url: parsed.image }]
                  : [],
            }
          : emptyDraft()
      );
    } catch {
      setDraft(emptyDraft());
    }
  }, [storageKey]);

  useEffect(() => {
    if (quote) setDraft((current) => ({ ...current, quote }));
  }, [quote]);
  useEffect(() => {
    if (!open) {
      setPanel(null);
      setError(null);
    }
  }, [open]);

  const hasDraft = Boolean(
    draft.body.trim() ||
    draft.attachments.length ||
    draft.music ||
    draft.poll ||
    draft.quote ||
    draft.location ||
    draft.scheduledAt ||
    draft.isSensitive ||
    draft.audience !== 'everyone' ||
    draft.replyAudience !== 'everyone'
  );
  const saveDraft = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      return true;
    } catch {
      return false;
    }
  };
  const discard = () => {
    setDraft(emptyDraft());
    setError(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* Browser storage can be unavailable. */
    }
  };
  const bodyWithQuote = draft.quote
    ? `${draft.body.trim()}\n\n> [@${draft.quote.author.username}](/post/${draft.quote.id})\n> ${draft.quote.body.replace(/\n/g, ' ').slice(0, 200)}`.trim()
    : draft.body;
  const validPoll =
    !draft.poll ||
    (draft.poll.question.trim() &&
      draft.poll.options.length >= 2 &&
      draft.poll.options.every((option) => option.trim()) &&
      new Set(draft.poll.options.map((option) => option.trim().toLocaleLowerCase())).size ===
        draft.poll.options.length);
  const hasContent = Boolean(
    draft.body.trim() || draft.attachments.length || draft.music || draft.poll || draft.quote
  );
  const finalBody = appendPostExtras(bodyWithQuote, draft);
  const canPublish =
    hasContent &&
    Boolean(validPoll) &&
    finalBody.length <= POST_CHAR_LIMIT &&
    !busy &&
    state === 'idle';
  const lastWord = draft.body.split(/\s+/).at(-1) ?? '';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPublish || submitLock.current) return;
    submitLock.current = true;
    setState('submitting');
    setError(null);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-idempotency-key': draft.clientId },
        body: JSON.stringify({
          body: finalBody,
          language: extractPostMetadata(draft.body).language,
          audience: draft.audience,
          attachments: draft.attachments,
          music: draft.music,
          poll: draft.poll,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.message || data.error || 'Não foi possível publicar. Tente novamente.'
        );
      discard();
      setState('success');
      setPanel(null);
      window.dispatchEvent(new CustomEvent('stacklyst:post-created', { detail: data }));
      window.setTimeout(() => {
        setState('idle');
        onClose();
      }, 800);
    } catch (cause) {
      saveDraft();
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível publicar. Seu rascunho continua aqui.'
      );
      setState('idle');
    } finally {
      submitLock.current = false;
    }
  };

  const extras = {
    contentToolsOnly: true,
    postBody: draft.body,
    setPostBody: (value: string) => update('body', value),
    editorRef,
    replyAudience: draft.replyAudience,
    setReplyAudience: (value: ReplyAudience) => update('replyAudience', value),
    scheduledAt: draft.scheduledAt,
    setScheduledAt: (value: string | null) => update('scheduledAt', value),
    location: draft.location,
    setLocation: (value: string) => update('location', value),
    isSensitive: draft.isSensitive,
    setIsSensitive: (value: boolean) => update('isSensitive', value),
  };
  const toggle = (value: Panel) => setPanel((current) => (current === value ? null : value));
  const pickerPanel =
    panel === 'gif' || panel === 'music' || panel === 'audio' || panel === 'image' ? panel : null;

  return (
    <ComposeModal
      open={open}
      onClose={onClose}
      hasDraft={hasDraft}
      onDiscard={discard}
      onSaveDraft={saveDraft}
      composerLayout
      busy={busy || state !== 'idle'}
      mobileTitle="Nova postagem"
      headerExtra={
        <PublishButton
          form={formId}
          disabled={!canPublish}
          state={state}
          xpReward={extractPostMetadata(draft.body).language ? 10 : 5}
          label={
            state === 'idle' ? 'Publicar' : state === 'submitting' ? 'Publicando…' : 'Publicado'
          }
          className="min-h-10 px-5"
        />
      }
    >
      <form
        id={formId}
        onSubmit={submit}
        className="post-composer-form"
        aria-label="Criar postagem"
      >
        <div className="composer-scroll">
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
            <div className="min-w-0 flex-1 relative">
              <Editor
                ref={editorRef}
                value={draft.body}
                onChange={(value) => {
                  update('body', value);
                  setShowMentions(true);
                }}
                onStateChange={setFormat}
                placeholder="O que você está pensando?"
                minHeight="10rem"
                className="post-composer-editor"
              />
              <MentionDropdown
                query={lastWord.replace(/^@/, '')}
                visible={showMentions && lastWord.startsWith('@')}
                onClose={() => setShowMentions(false)}
                onSelect={(username) => {
                  const words = draft.body.split(/\s+/);
                  words[words.length - 1] = `@${username} `;
                  update('body', words.join(' '));
                  setShowMentions(false);
                }}
              />
              <p
                className={cn(
                  'composer-counter',
                  finalBody.length > POST_CHAR_LIMIT && 'text-red-500'
                )}
                aria-live={finalBody.length > POST_CHAR_LIMIT ? 'polite' : 'off'}
              >
                {draft.body.length.toLocaleString('pt-BR')}/
                {POST_CHAR_LIMIT.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="composer-attachments-area">
            {draft.quote && (
              <div className="relative mb-3 rounded-xl border border-dd-border p-4 pr-12 text-sm">
                <span className="text-dd-muted">Citando @{draft.quote.author.username}</span>
                <p className="mt-2 line-clamp-3 break-words">{draft.quote.body}</p>
                <button
                  type="button"
                  onClick={() => update('quote', null)}
                  aria-label="Remover citação"
                  className="composer-tool absolute right-1 top-1"
                >
                  <X />
                </button>
              </div>
            )}
            <ComposerAttachments
              attachments={draft.attachments}
              onChange={(value) => update('attachments', value)}
              music={draft.music}
              onMusicChange={(value) => update('music', value)}
              poll={draft.poll}
              onPollChange={(value) => update('poll', value)}
              disabled={busy || state !== 'idle'}
            />
            {(draft.location || draft.scheduledAt || draft.isSensitive) && (
              <PostComposerExtras {...extras} section="meta" />
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
            Preparando anexo…
          </p>
        )}
        <div className="composer-footer">
          {panel && !pickerPanel && (
            <div
              className="composer-popover"
              role="region"
              aria-label={
                panel === 'audience'
                  ? 'Público da postagem'
                  : panel === 'color'
                    ? 'Cor do texto'
                    : panel === 'text'
                      ? 'Blocos de texto'
                      : 'Mais opções'
              }
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-semibold">
                  {panel === 'audience'
                    ? 'Quem pode ver?'
                    : panel === 'color'
                      ? 'Cor do texto'
                      : panel === 'text'
                        ? 'Blocos de texto'
                        : 'Mais opções'}
                </p>
                <button
                  type="button"
                  aria-label="Fechar opções"
                  className="composer-tool !h-8 !w-8"
                  onClick={() => setPanel(null)}
                >
                  <X />
                </button>
              </div>
              {panel === 'audience' && (
                <div className="space-y-1">
                  {(
                    [
                      {
                        value: 'everyone',
                        label: 'Todos',
                        description: 'Qualquer pessoa pode ver sua postagem.',
                        icon: Globe,
                      },
                      {
                        value: 'followers',
                        label: 'Apenas seguidores',
                        description: 'Você e as pessoas que seguem você.',
                        icon: Users,
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="flex min-h-14 w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-dd-surface"
                      onClick={() => {
                        update('audience', item.value);
                        setPanel(null);
                      }}
                    >
                      <item.icon className="h-5 w-5 shrink-0 text-dd-accent" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{item.label}</span>
                        <span className="block text-xs text-dd-muted">{item.description}</span>
                      </span>
                      {draft.audience === item.value && (
                        <Check className="h-4 w-4 text-dd-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {panel === 'color' && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {POST_TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => {
                          editorRef.current?.setTextColor(color.value);
                          setPanel(null);
                        }}
                        aria-label={color.label}
                        aria-pressed={format.color === color.value}
                        className={cn(
                          'composer-color',
                          format.color === color.value && 'is-selected'
                        )}
                        style={{ backgroundColor: color.light }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 flex min-h-10 items-center gap-2 text-sm text-dd-muted hover:text-dd-text"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => {
                      editorRef.current?.setTextColor(null);
                      setPanel(null);
                    }}
                  >
                    <Baseline className="h-4 w-4" />
                    Cor padrão
                  </button>
                </>
              )}
              {panel === 'text' && (
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: 'Texto', icon: Pilcrow, value: 'paragraph' as const },
                    { label: 'Título', icon: Heading2, value: 'heading' as const },
                    { label: 'Lista', icon: List, value: 'bulletList' as const },
                    { label: 'Citação', icon: Quote, value: 'blockquote' as const },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.label}
                      className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-dd-surface"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => {
                        editorRef.current?.insertBlock(item.value);
                        setPanel(null);
                      }}
                    >
                      <item.icon className="h-4 w-4 text-dd-accent" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
              {panel === 'more' && (
                <>
                  <div className="composer-secondary-menu grid-cols-2 gap-1">
                    <button
                      type="button"
                      className="flex min-h-11 items-center gap-2 px-2 text-sm"
                      onClick={() => setPanel('text')}
                    >
                      <AlignLeft className="h-4 w-4 text-dd-accent" />
                      Texto e blocos
                    </button>
                    <button
                      type="button"
                      className="flex min-h-11 items-center gap-2 px-2 text-sm"
                      onClick={() => setPanel('gif')}
                    >
                      <ImagePlay className="h-4 w-4 text-dd-accent" />
                      Adicionar GIF
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 text-sm hover:bg-dd-surface"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => {
                      editorRef.current?.clearFormatting();
                      setPanel(null);
                    }}
                  >
                    <Eraser className="h-4 w-4 text-dd-accent" />
                    Remover formatação
                  </button>
                  <PostComposerExtras {...extras} section="tools" />
                  <PostComposerExtras {...extras} section="meta" />
                </>
              )}
            </div>
          )}
          <div className="composer-formatting" role="toolbar" aria-label="Formatação do texto">
            <button
              type="button"
              onClick={() => toggle('audience')}
              aria-expanded={panel === 'audience'}
              className="composer-audience"
              title="Público da postagem"
            >
              {draft.audience === 'everyone' ? <Globe /> : <Users />}
              <span>{draft.audience === 'everyone' ? 'Todos' : 'Seguidores'}</span>
              <ChevronDown className="!h-3 !w-3" />
            </button>
            <Tool
              label="Negrito"
              active={format.bold}
              onClick={() => editorRef.current?.toggleBold()}
            >
              <Bold />
            </Tool>
            <Tool
              label="Itálico"
              active={format.italic}
              onClick={() => editorRef.current?.toggleItalic()}
            >
              <Italic />
            </Tool>
            <Tool
              label="Sublinhado"
              active={format.underline}
              onClick={() => editorRef.current?.toggleUnderline()}
            >
              <Underline />
            </Tool>
            <Tool
              label="Cor do texto"
              active={panel === 'color' || Boolean(format.color)}
              onClick={() => toggle('color')}
            >
              <Baseline />
              <span
                className="composer-color-indicator"
                style={{
                  backgroundColor:
                    POST_TEXT_COLORS.find((color) => color.value === format.color)?.light ??
                    'currentColor',
                }}
              />
            </Tool>
          </div>
          <div className="composer-content-tools" role="toolbar" aria-label="Adicionar conteúdo">
            <Tool
              label="Texto e blocos"
              className="composer-secondary-tool"
              active={panel === 'text'}
              onClick={() => toggle('text')}
            >
              <AlignLeft />
            </Tool>
            <Tool
              label="Adicionar GIF"
              className="composer-secondary-tool"
              active={panel === 'gif'}
              onClick={() => toggle('gif')}
            >
              <ImagePlay />
              <span className="sr-only">GIF</span>
            </Tool>
            <Tool
              label="Adicionar imagens"
              active={panel === 'image'}
              onClick={() => toggle('image')}
            >
              <ImageIcon />
            </Tool>
            <Tool
              label="Adicionar música"
              active={panel === 'music' || Boolean(draft.music)}
              onClick={() => toggle('music')}
            >
              <Music2 />
            </Tool>
            <Tool label="Gravar áudio" active={panel === 'audio'} onClick={() => toggle('audio')}>
              <Mic />
            </Tool>
            <Tool
              label="Criar enquete"
              active={Boolean(draft.poll)}
              onClick={() => {
                if (!draft.poll)
                  update('poll', { question: '', options: ['', ''], durationHours: 24 });
                setPanel(null);
              }}
            >
              <ChartNoAxesColumnIncreasing />
            </Tool>
            <Tool
              label="Inserir código executável"
              onClick={() => {
                editorRef.current?.insertCodeBlock();
                setPanel(null);
              }}
            >
              <Code2 />
            </Tool>
            <Tool label="Mais opções" active={panel === 'more'} onClick={() => toggle('more')}>
              <MoreHorizontal />
            </Tool>
          </div>
        </div>
        <ComposerAttachmentPicker
          panel={pickerPanel}
          onClose={() => setPanel(null)}
          attachments={draft.attachments}
          onAttachmentsChange={(value) => update('attachments', value)}
          music={draft.music}
          onMusicChange={(value) => update('music', value)}
          onBusyChange={setBusy}
        />
      </form>
    </ComposeModal>
  );
}
