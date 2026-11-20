'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { postActionClassName } from '@/components/PostActionsBar';
import { PostActionDialog } from '@/components/posts/PostActionDialog';
import { useLocalizedText } from '@/i18n/useLocalizedText';

/**
 * The "..." menu on the signed-in author's replies, matching the one on posts:
 * Edit opens the caller's editor, Delete confirms and calls the API.
 */
export function ReplyOwnerMenu({
  answerId,
  onEdit,
  onDeleted,
}: {
  answerId: string;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const { text } = useLocalizedText();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/answers/${answerId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          typeof data?.error === 'string'
            ? data.error
            : text(
                'Não foi possível excluir a resposta. Tente novamente.',
                'Could not delete the reply. Try again.'
              )
        );
        return;
      }
      setConfirming(false);
      onDeleted();
    } catch {
      setError(
        text(
          'Não foi possível conectar. Tente excluir novamente.',
          'Could not connect. Try deleting again.'
        )
      );
    } finally {
      setDeleting(false);
    }
  }

  const itemClass =
    'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors';

  return (
    <div className="relative" ref={menu}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(!open)}
        className={`${postActionClassName} hover:bg-blue-500/10 hover:text-blue-400`}
        title={text('Mais opções', 'More options')}
        aria-label={text('Mais opções da resposta', 'More reply options')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full z-40 mb-1.5 w-44 rounded-2xl border border-dd-border/80 bg-dd-surface p-1.5 shadow-2xl animate-slide-up"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className={`${itemClass} text-dd-text hover:bg-dd-bg`}
          >
            <Pencil className="h-4 w-4 text-dd-muted" aria-hidden="true" />
            {text('Editar', 'Edit')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setError('');
              setConfirming(true);
            }}
            className={`${itemClass} text-red-400 hover:bg-red-500/10`}
          >
            <Trash2 className="h-4 w-4 text-red-400" aria-hidden="true" />
            {text('Excluir', 'Delete')}
          </button>
        </div>
      )}
      {confirming && (
        <PostActionDialog
          variant="confirm"
          titleId={`delete-reply-title-${answerId}`}
          descriptionId={`delete-reply-description-${answerId}`}
          busy={deleting}
          onClose={() => setConfirming(false)}
          returnFocusRef={trigger}
        >
          <h3
            id={`delete-reply-title-${answerId}`}
            className="text-xl font-extrabold leading-6 text-dd-text"
          >
            {text('Excluir resposta?', 'Delete reply?')}
          </h3>
          <p
            id={`delete-reply-description-${answerId}`}
            className="mt-2 text-[15px] leading-5 text-dd-muted"
          >
            {text(
              'Isso não pode ser desfeito. As respostas de outras pessoas a esta continuam na conversa.',
              "This can't be undone. Other people's replies to it stay in the conversation."
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
              onClick={remove}
              disabled={deleting}
              className="dd-touch min-h-11 w-full cursor-pointer rounded-full bg-[#f4212e] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#dc1e29] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4212e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? text('Excluindo...', 'Deleting...') : text('Excluir', 'Delete')}
            </button>
            <button
              type="button"
              data-dialog-initial-focus
              disabled={deleting}
              onClick={() => setConfirming(false)}
              className="dd-touch min-h-11 w-full cursor-pointer rounded-full border border-dd-border px-6 text-[15px] font-bold text-dd-text transition-colors hover:bg-dd-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {text('Cancelar', 'Cancel')}
            </button>
          </div>
        </PostActionDialog>
      )}
    </div>
  );
}
