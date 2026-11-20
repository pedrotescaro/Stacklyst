'use client';

import { useState, type FormEvent } from 'react';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { parsePostExtras } from '@/lib/post-composer';
import { parseReplyMedia } from '@/lib/reply-media';
import { useLocalizedText } from '@/i18n/useLocalizedText';

/** Only the visible text is editable; the server keeps the reply's media and markers. */
export function editableReplyText(body: string) {
  return parsePostExtras(parseReplyMedia(body).content).content;
}

export function ReplyEditForm({
  answerId,
  body,
  onSaved,
  onCancel,
}: {
  answerId: string;
  body: string;
  onSaved: (body: string) => void;
  onCancel: () => void;
}) {
  const { text } = useLocalizedText();
  const original = editableReplyText(body);
  const [value, setValue] = useState(original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.body !== 'string') {
        setError(
          typeof data?.error === 'string'
            ? data.error
            : text(
                'Não foi possível salvar a resposta. Tente novamente.',
                'Could not save the reply. Try again.'
              )
        );
        return;
      }
      onSaved(data.body);
    } catch {
      setError(
        text(
          'Não foi possível conectar. Tente salvar novamente.',
          'Could not connect. Try saving again.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="mt-3 space-y-2"
      aria-label={text('Editar resposta', 'Edit reply')}
    >
      <MarkdownEditor
        value={value}
        onChange={setValue}
        maxLength={5000}
        minHeight="5rem"
        placeholder={text('Escreva sua resposta...', 'Write your reply...')}
        className="rounded-xl border border-dd-border bg-dd-bg px-3 py-2 text-sm text-dd-text focus-within:border-dd-accent"
      />
      {error && (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="cursor-pointer rounded-lg border border-dd-border px-3 py-1.5 text-xs font-bold text-dd-muted transition-colors hover:bg-dd-border/30 hover:text-dd-text disabled:opacity-50"
        >
          {text('Cancelar', 'Cancel')}
        </button>
        <button
          type="submit"
          disabled={saving || value.trim() === original.trim()}
          className="cursor-pointer rounded-lg bg-blue-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? text('Salvando...', 'Saving...') : text('Salvar', 'Save')}
        </button>
      </div>
    </form>
  );
}
