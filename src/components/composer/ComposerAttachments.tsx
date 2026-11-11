'use client';

/* Protected media requires the browser's session cookies; image optimization cannot proxy it. */
/* eslint-disable @next/next/no-img-element */
import { ArrowLeft, ArrowRight, Music2, Plus, Trash2, X } from 'lucide-react';
import type { PostAttachment, PostPollDraft } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import styles from './ComposerMedia.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export interface ComposerAttachmentsProps {
  attachments: PostAttachment[];
  onChange: (attachments: PostAttachment[]) => void;
  music: SpotifyProfileTrack | null;
  onMusicChange: (music: SpotifyProfileTrack | null) => void;
  poll: PostPollDraft | null;
  onPollChange: (poll: PostPollDraft | null) => void;
  disabled?: boolean;
}

export function ComposerAttachments({
  attachments,
  onChange,
  music,
  onMusicChange,
  poll,
  onPollChange,
  disabled,
}: ComposerAttachmentsProps) {
  const { text } = useLocalizedText();
  const remove = (index: number) => onChange(attachments.filter((_, item) => item !== index));
  const move = (index: number, direction: number) => {
    const next = [...attachments];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };
  return (
    <div className={styles.attachments}>
      {!!attachments.length && (
        <div className={styles.previewGrid}>
          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.url}-${index}`}
              className={attachment.type === 'audio' ? styles.audioPreview : styles.imagePreview}
            >
              {attachment.type === 'audio' ? (
                <audio
                  controls
                  preload="metadata"
                  src={attachment.url}
                  aria-label={text('Prévia da gravação', 'Recording preview')}
                />
              ) : (
                <img
                  src={attachment.url}
                  alt={attachment.alt || `${text('Prévia', 'Preview')} ${index + 1}`}
                />
              )}
              <div className={styles.mediaActions}>
                {index > 0 && attachment.type !== 'audio' && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => move(index, -1)}
                    aria-label={text(
                      `Mover imagem ${index + 1} para a esquerda`,
                      `Move image ${index + 1} left`
                    )}
                  >
                    <ArrowLeft size={15} />
                  </button>
                )}
                {index < attachments.length - 1 && attachment.type !== 'audio' && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => move(index, 1)}
                    aria-label={text(
                      `Mover imagem ${index + 1} para a direita`,
                      `Move image ${index + 1} right`
                    )}
                  >
                    <ArrowRight size={15} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  aria-label={
                    attachment.type === 'audio'
                      ? text('Remover áudio', 'Remove audio')
                      : `Remover imagem ${index + 1}`
                  }
                >
                  <X size={16} />
                </button>
              </div>
              {attachment.type !== 'audio' && (
                <input
                  className={styles.altInput}
                  aria-label={`${text('Descrição da imagem', 'Image description')} ${index + 1}`}
                  placeholder={text(
                    'Descrição da imagem (opcional)',
                    'Image description (optional)'
                  )}
                  maxLength={300}
                  value={attachment.alt || ''}
                  disabled={disabled}
                  onChange={(event) =>
                    onChange(
                      attachments.map((item, i) =>
                        i === index ? { ...item, alt: event.target.value } : item
                      )
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}
      {music && (
        <div className={styles.musicPreview}>
          {music.artworkUrl ? (
            <img
              src={music.artworkUrl}
              width={48}
              height={48}
              alt={text('Capa do álbum', 'Album cover')}
            />
          ) : (
            <Music2 size={26} aria-hidden="true" />
          )}
          <div>
            <strong>{music.title || text('Faixa do Spotify', 'Spotify track')}</strong>
            <span>{music.artist}</span>
            <small>Spotify</small>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onMusicChange(null)}
            disabled={disabled}
            aria-label={text('Remover música', 'Remove music')}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {poll && (
        <section className={styles.pollEditor} aria-label={text('Editar enquete', 'Edit poll')}>
          <div className={styles.panelTitle}>
            <strong>{text('Enquete', 'Poll')}</strong>
            <button
              type="button"
              className={styles.iconButton}
              disabled={disabled}
              onClick={() => onPollChange(null)}
              aria-label={text('Remover enquete', 'Remove poll')}
            >
              <Trash2 size={17} />
            </button>
          </div>
          <label className={styles.field}>
            <span>{text('Pergunta', 'Question')}</span>
            <input
              value={poll.question}
              maxLength={200}
              placeholder={text('O que você quer saber?', 'What do you want to know?')}
              disabled={disabled}
              onChange={(event) => onPollChange({ ...poll, question: event.target.value })}
            />
          </label>
          {poll.options.map((option, index) => (
            <div key={index} className={styles.optionRow}>
              <input
                aria-label={`${text('Opção', 'Option')} ${index + 1}`}
                placeholder={`${text('Opção', 'Option')} ${index + 1}`}
                value={option}
                maxLength={100}
                disabled={disabled}
                onChange={(event) =>
                  onPollChange({
                    ...poll,
                    options: poll.options.map((item, i) =>
                      i === index ? event.target.value : item
                    ),
                  })
                }
              />
              {poll.options.length > 2 && (
                <button
                  type="button"
                  className={styles.iconButton}
                  disabled={disabled}
                  aria-label={`${text('Remover opção', 'Remove option')} ${index + 1}`}
                  onClick={() =>
                    onPollChange({ ...poll, options: poll.options.filter((_, i) => i !== index) })
                  }
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <div className={styles.pollFooter}>
            {poll.options.length < 4 && (
              <button
                type="button"
                className={styles.textButton}
                disabled={disabled}
                onClick={() => onPollChange({ ...poll, options: [...poll.options, ''] })}
              >
                <Plus size={16} />
                {text('Adicionar opção', 'Add option')}
              </button>
            )}
            <label className={styles.duration}>
              <span>{text('Duração', 'Duration')}</span>
              <select
                aria-label={text('Duração da enquete', 'Poll duration')}
                value={poll.durationHours}
                disabled={disabled}
                onChange={(event) =>
                  onPollChange({ ...poll, durationHours: Number(event.target.value) })
                }
              >
                <option value={1}>{text('1 hora', '1 hour')}</option>
                <option value={6}>{text('6 horas', '6 hours')}</option>
                <option value={24}>{text('1 dia', '1 day')}</option>
                <option value={72}>{text('3 dias', '3 days')}</option>
                <option value={168}>{text('7 dias', '7 days')}</option>
              </select>
            </label>
          </div>
        </section>
      )}
    </div>
  );
}
