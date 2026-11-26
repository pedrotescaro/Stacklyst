'use client';

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import {
  AtSign,
  Check,
  Flag,
  Globe,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  Users,
} from 'lucide-react';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { BlockUserButton } from '@/components/BlockUserButton';
import { MarkdownEditor, type NotionEditorRef } from '@/components/MarkdownEditor';
import { CharCounter } from '@/components/motion/CharCounter';
import { ComposeModal } from '@/components/motion/ComposeModal';
import { PostActionDialog } from '@/components/posts/PostActionDialog';
import { ReportPostDialog } from '@/components/posts/ReportPostDialog';
import {
  POST_MENU_ICON,
  POST_MENU_ITEM,
  POST_MENU_ITEM_DANGER,
  POST_MENU_PANEL,
  POST_MENU_TRIGGER,
} from '@/components/posts/menu-styles';
import { POST_CHAR_LIMIT } from '@/lib/motion';
import {
  readReplyAudience,
  REPLY_AUDIENCE_OPTIONS,
  withReplyAudience,
  type ReplyAudience,
} from '@/lib/post-composer';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export interface PostOptionsTarget {
  id: string;
  body: string;
  author_id?: string;
  author: {
    id?: string;
    username: string;
    avatar_url?: string | null;
    avatar_config?: unknown;
  };
}

export interface PostBodyUpdate {
  body: string;
  language?: string | null;
  code_snippet?: string | null;
}

interface PostOptionsMenuProps {
  post: PostOptionsTarget;
  isOwner: boolean;
  /** Owner only: shows "Fixar no seu perfil" / "Desafixar do perfil" when provided. */
  pinned?: boolean;
  pinPending?: boolean;
  onTogglePin?: () => void;
  onDeleted?: (postId: string) => void;
  onUpdated?: (update: PostBodyUpdate) => void;
  className?: string;
}

function MenuItem({
  icon: Icon,
  children,
  onSelect,
  danger = false,
  disabled = false,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  children: ReactNode;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onSelect();
      }}
      className={danger ? POST_MENU_ITEM_DANGER : POST_MENU_ITEM}
    >
      <Icon className={POST_MENU_ICON} aria-hidden />
      <span className="min-w-0">{children}</span>
    </button>
  );
}

const AUDIENCE_ICONS: Record<ReplyAudience, typeof Globe> = {
  everyone: Globe,
  followers: Users,
  mentioned: AtSign,
};

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  return fallback;
}

/**
 * The "..." menu in a post's top-right corner. Owners get delete, pin, edit and
 * who-can-reply; everyone else gets report and block.
 */
export function PostOptionsMenu({
  post,
  isOwner,
  pinned = false,
  pinPending = false,
  onTogglePin,
  onDeleted,
  onUpdated,
  className,
}: PostOptionsMenuProps) {
  const { text } = useLocalizedText();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<'delete' | 'edit' | 'audience' | 'report' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editBody, setEditBody] = useState(post.body);
  const [audience, setAudience] = useState<ReplyAudience>(() => readReplyAudience(post.body));
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<NotionEditorRef>(null);
  const authorId = post.author.id ?? post.author_id;

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const openDialog = (next: NonNullable<typeof dialog>) => {
    setOpen(false);
    setError(null);
    if (next === 'edit') setEditBody(post.body);
    if (next === 'audience') setAudience(readReplyAudience(post.body));
    setDialog(next);
  };

  const closeDialog = () => {
    if (!busy) setDialog(null);
  };

  async function saveBody(body: string) {
    const response = await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) {
      throw new Error(
        await readError(
          response,
          text('Não foi possível salvar a postagem.', 'Could not save the post.')
        )
      );
    }
    const updated = await response.json();
    onUpdated?.({
      body: updated.body,
      language: updated.language,
      code_snippet: updated.code_snippet,
    });
  }

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!response.ok) {
        setError(
          await readError(
            response,
            text(
              'Não foi possível excluir a publicação. Tente novamente.',
              'Could not delete the post. Try again.'
            )
          )
        );
        return;
      }
      setDialog(null);
      onDeleted?.(post.id);
    } catch (err) {
      console.error(err);
      setError(
        text(
          'Não foi possível conectar. Tente excluir novamente.',
          'Could not connect. Try deleting again.'
        )
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleEditSubmit(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (busy || editBody.trim().length < 10) return;
    setBusy(true);
    setError(null);
    try {
      await saveBody(editBody.trim());
      setDialog(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : text('Erro ao editar post.', 'Error editing post.')
      );
    } finally {
      setBusy(false);
    }
  }

  /** Like X: choosing an option saves it right away and closes the sheet. */
  async function handleAudienceSelect(next: ReplyAudience) {
    if (busy) return;
    setAudience(next);
    if (next === readReplyAudience(post.body)) {
      setDialog(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveBody(withReplyAudience(post.body, next));
      setDialog(null);
    } catch (err) {
      setAudience(readReplyAudience(post.body));
      setError(
        err instanceof Error
          ? err.message
          : text('Não foi possível salvar. Tente novamente.', 'Could not save. Try again.')
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      ref={menuRef}
      className={cn('relative shrink-0', className)}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          setOpen((value) => !value);
        }}
        className={POST_MENU_TRIGGER}
        title={text('Mais opções', 'More options')}
        aria-label={text('Mais opções', 'More options')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className={cn('absolute right-0 top-0', POST_MENU_PANEL)}>
          {isOwner ? (
            <>
              <MenuItem icon={Trash2} danger onSelect={() => openDialog('delete')}>
                {text('Excluir', 'Delete')}
              </MenuItem>
              {onTogglePin && (
                <MenuItem
                  icon={pinned ? PinOff : Pin}
                  disabled={pinPending}
                  onSelect={() => {
                    setOpen(false);
                    onTogglePin();
                  }}
                >
                  {pinned
                    ? text('Desafixar do perfil', 'Unpin from profile')
                    : text('Fixar no seu perfil', 'Pin to your profile')}
                </MenuItem>
              )}
              <MenuItem icon={Pencil} onSelect={() => openDialog('edit')}>
                {text('Editar', 'Edit')}
              </MenuItem>
              <MenuItem icon={MessageCircle} onSelect={() => openDialog('audience')}>
                {text('Altere quem pode responder', 'Change who can reply')}
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem icon={Flag} onSelect={() => openDialog('report')}>
                {text('Denunciar post', 'Report post')}
              </MenuItem>
              {authorId && (
                <BlockUserButton
                  userId={authorId}
                  username={post.author.username}
                  className="w-full text-left"
                />
              )}
            </>
          )}
        </div>
      )}

      {dialog === 'report' && (
        <ReportPostDialog
          postId={post.id}
          onClose={() => setDialog(null)}
          returnFocusRef={triggerRef}
        />
      )}

      {dialog === 'delete' && (
        <PostActionDialog
          variant="confirm"
          titleId={`delete-post-title-${post.id}`}
          descriptionId={`delete-post-description-${post.id}`}
          busy={busy}
          onClose={closeDialog}
          returnFocusRef={triggerRef}
        >
          <h3
            id={`delete-post-title-${post.id}`}
            className="text-xl font-extrabold leading-6 text-dd-text"
          >
            {text('Deletar postagem?', 'Delete post?')}
          </h3>
          <p
            id={`delete-post-description-${post.id}`}
            className="mt-2 text-[15px] leading-5 text-dd-muted"
          >
            {text(
              'Isso não pode ser desfeito, e a postagem será removida do seu perfil, do feed de quem segue você e dos resultados de busca.',
              "This can't be undone and it will be removed from your profile, the feed of anyone following you, and search results."
            )}
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void handleDelete();
              }}
              disabled={busy}
              className="dd-touch min-h-11 w-full cursor-pointer rounded-full bg-[#f4212e] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#dc1e29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4212e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? text('Deletando...', 'Deleting...') : text('Deletar', 'Delete')}
            </button>
            <button
              type="button"
              data-dialog-initial-focus
              disabled={busy}
              onClick={(event) => {
                event.stopPropagation();
                setDialog(null);
              }}
              className="dd-touch min-h-11 w-full cursor-pointer rounded-full border border-dd-border px-6 text-[15px] font-bold text-dd-text transition-colors hover:bg-dd-bg/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {text('Cancelar', 'Cancel')}
            </button>
          </div>
        </PostActionDialog>
      )}

      {dialog === 'audience' && (
        <PostActionDialog
          variant="sheet"
          titleId={`reply-audience-title-${post.id}`}
          descriptionId={`reply-audience-description-${post.id}`}
          busy={busy}
          onClose={closeDialog}
          returnFocusRef={triggerRef}
        >
          <h3
            id={`reply-audience-title-${post.id}`}
            className="text-xl font-extrabold leading-6 text-dd-text"
          >
            {text('Quem pode responder?', 'Who can reply?')}
          </h3>
          <p
            id={`reply-audience-description-${post.id}`}
            className="mt-1 text-[15px] leading-5 text-dd-muted"
          >
            {text(
              'Escolha quem pode responder a esta postagem. Quem for mencionado sempre pode responder.',
              'Pick who can reply to this post. Anyone mentioned can always reply.'
            )}
          </p>
          <div role="radiogroup" aria-busy={busy || undefined} className="-mx-6 mt-4">
            {REPLY_AUDIENCE_OPTIONS.map((option) => {
              const selected = audience === option.value;
              const Icon = AUDIENCE_ICONS[option.value];
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-dialog-initial-focus={selected ? true : undefined}
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleAudienceSelect(option.value);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-dd-bg/60 focus-visible:bg-dd-bg/60 focus-visible:outline-none disabled:cursor-wait"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0] text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] font-bold leading-5 text-dd-text">
                    {text(option.label, option.labelEn)}
                  </span>
                  {selected && (
                    <Check
                      className="h-5 w-5 shrink-0 text-[#1d9bf0]"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}
        </PostActionDialog>
      )}

      {isOwner && (
        <ComposeModal
          open={dialog === 'edit'}
          onClose={closeDialog}
          hasDraft={editBody !== post.body}
          onDiscard={() => setEditBody(post.body)}
          busy={busy}
        >
          <form
            onSubmit={handleEditSubmit}
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3">
              <AuthorAvatar
                username={post.author.username}
                avatar_url={post.author.avatar_url}
                avatar_config={post.author.avatar_config}
              />
              <div className="relative min-w-0 flex-grow space-y-3">
                <h3 className="text-sm font-black text-dd-text">
                  {text('Editar publicação', 'Edit post')}
                </h3>
                <MarkdownEditor
                  ref={editorRef}
                  value={editBody}
                  onChange={setEditBody}
                  maxLength={POST_CHAR_LIMIT}
                  minHeight="8rem"
                  placeholder={text('Editar conteúdo...', 'Edit content...')}
                />
                <div className="flex justify-end">
                  <CharCounter text={editBody} limit={POST_CHAR_LIMIT} />
                </div>
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
            <div className="flex items-center justify-end gap-2 border-t border-dd-border/50 pt-3">
              <button
                type="button"
                disabled={busy}
                onClick={(event) => {
                  event.stopPropagation();
                  setDialog(null);
                }}
                className="cursor-pointer rounded-lg px-4 py-2 text-xs font-bold text-dd-muted transition-all hover:bg-dd-surface hover:text-dd-text"
              >
                {text('Cancelar', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={busy || editBody.trim().length < 10 || editBody.length >= POST_CHAR_LIMIT}
                className="cursor-pointer rounded-lg bg-blue-500 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                {busy ? text('Salvando...', 'Saving...') : text('Salvar', 'Save')}
              </button>
            </div>
          </form>
        </ComposeModal>
      )}
    </div>
  );
}
