'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Check, X } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { PostActionDialog } from './PostActionDialog';
import styles from './ReportPostDialog.module.css';

const reasons = [
  ['Spam / Propaganda enganosa', 'Spam / Misleading advertising'],
  ['Discurso de ódio / Ofensa', 'Hate speech / Offensive content'],
  ['Assédio / Bullying', 'Harassment / Bullying'],
  ['Código / Conteúdo malicioso ou perigoso', 'Malicious or dangerous code / content'],
  ['Outro motivo', 'Other reason'],
] as const;

export function ReportPostDialog({
  postId,
  onClose,
  returnFocusRef,
}: {
  postId: string;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const id = useId();
  const { text } = useLocalizedText();
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'sent'>('idle');
  const doneButton = useRef<HTMLButtonElement>(null);
  const sending = status === 'sending';
  const sent = status === 'sent';

  useEffect(() => {
    if (sent) doneButton.current?.focus();
  }, [sent]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!reason || sending || sent) return;
    setStatus('sending');
    try {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      setStatus(response.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <PostActionDialog
      variant="report"
      titleId={`${id}-title`}
      descriptionId={`${id}-description`}
      busy={sending}
      onClose={onClose}
      returnFocusRef={returnFocusRef}
    >
      <header className={styles.header}>
        <h2 id={`${id}-title`}>
          {sent
            ? text('Denúncia enviada', 'Report sent')
            : text('Denunciar postagem', 'Report post')}
        </h2>
        <button
          type="button"
          className={styles.close}
          aria-label={text('Fechar', 'Close')}
          data-dialog-initial-focus
          disabled={sending}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      {sent ? (
        <>
          <div className={styles.confirmation}>
            <Check size={21} aria-hidden="true" />
            <p className={styles.description} id={`${id}-description`} role="status">
              {text(
                'Obrigado por ajudar a cuidar da comunidade.',
                'Thanks for helping our community.'
              )}
            </p>
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.primary} ref={doneButton} onClick={onClose}>
              {text('Concluir', 'Done')}
            </button>
          </div>
        </>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.body}>
            <p className={styles.intro} id={`${id}-description`}>
              {text(
                'Selecione o motivo que melhor descreve o problema.',
                'Select the reason that best describes the issue.'
              )}
            </p>
            <fieldset className={styles.reasons} disabled={sending}>
              <legend className="sr-only">{text('Motivo da denúncia', 'Report reason')}</legend>
              {reasons.map(([portuguese, english]) => (
                <label className={styles.reason} key={portuguese}>
                  <span>{text(portuguese, english)}</span>
                  <input
                    type="radio"
                    name={id}
                    value={portuguese}
                    checked={reason === portuguese}
                    onChange={() => {
                      setReason(portuguese);
                      setStatus('idle');
                    }}
                  />
                </label>
              ))}
            </fieldset>
          </div>
          {status === 'error' && (
            <p role="alert" className={styles.error}>
              {text(
                'Não foi possível enviar a denúncia. Tente novamente.',
                'Could not send the report. Try again.'
              )}
            </p>
          )}
          <div className={styles.footer}>
            <button type="button" className={styles.cancel} disabled={sending} onClick={onClose}>
              {text('Cancelar', 'Cancel')}
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={!reason}
              aria-disabled={sending || undefined}
            >
              {sending ? text('Enviando…', 'Sending…') : text('Enviar denúncia', 'Send report')}
            </button>
          </div>
        </form>
      )}
    </PostActionDialog>
  );
}
