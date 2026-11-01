'use client';

/* Protected media requires the browser's session cookies; image optimization cannot proxy it. */
/* eslint-disable @next/next/no-img-element */
import { ArrowLeft, ArrowRight, Music2, Plus, Trash2, X } from 'lucide-react';
import type { PostAttachment, PostPollDraft } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import styles from './ComposerMedia.module.css';

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
                  aria-label="Prévia da gravação"
                />
              ) : (
                <img src={attachment.url} alt={attachment.alt || `Prévia ${index + 1}`} />
              )}
              <div className={styles.mediaActions}>
                {index > 0 && attachment.type !== 'audio' && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => move(index, -1)}
                    aria-label={`Mover imagem ${index + 1} para a esquerda`}
                  >
                    <ArrowLeft size={15} />
                  </button>
                )}
                {index < attachments.length - 1 && attachment.type !== 'audio' && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => move(index, 1)}
                    aria-label={`Mover imagem ${index + 1} para a direita`}
                  >
                    <ArrowRight size={15} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  aria-label={
                    attachment.type === 'audio' ? 'Remover áudio' : `Remover imagem ${index + 1}`
                  }
                >
                  <X size={16} />
                </button>
              </div>
              {attachment.type !== 'audio' && (
                <input
                  className={styles.altInput}
                  aria-label={`Descrição da imagem ${index + 1}`}
                  placeholder="Descrição da imagem (opcional)"
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
            <img src={music.artworkUrl} width={48} height={48} alt="Capa do álbum" />
          ) : (
            <Music2 size={26} aria-hidden="true" />
          )}
          <div>
            <strong>{music.title || 'Faixa do Spotify'}</strong>
            <span>{music.artist}</span>
            <small>Spotify</small>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onMusicChange(null)}
            disabled={disabled}
            aria-label="Remover música"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {poll && (
        <section className={styles.pollEditor} aria-label="Editar enquete">
          <div className={styles.panelTitle}>
            <strong>Enquete</strong>
            <button
              type="button"
              className={styles.iconButton}
              disabled={disabled}
              onClick={() => onPollChange(null)}
              aria-label="Remover enquete"
            >
              <Trash2 size={17} />
            </button>
          </div>
          <label className={styles.field}>
            <span>Pergunta</span>
            <input
              value={poll.question}
              maxLength={200}
              placeholder="O que você quer saber?"
              disabled={disabled}
              onChange={(event) => onPollChange({ ...poll, question: event.target.value })}
            />
          </label>
          {poll.options.map((option, index) => (
            <div key={index} className={styles.optionRow}>
              <input
                aria-label={`Opção ${index + 1}`}
                placeholder={`Opção ${index + 1}`}
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
                  aria-label={`Remover opção ${index + 1}`}
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
                Adicionar opção
              </button>
            )}
            <label className={styles.duration}>
              <span>Duração</span>
              <select
                aria-label="Duração da enquete"
                value={poll.durationHours}
                disabled={disabled}
                onChange={(event) =>
                  onPollChange({ ...poll, durationHours: Number(event.target.value) })
                }
              >
                <option value={1}>1 hora</option>
                <option value={6}>6 horas</option>
                <option value={24}>1 dia</option>
                <option value={72}>3 dias</option>
                <option value={168}>7 dias</option>
              </select>
            </label>
          </div>
        </section>
      )}
    </div>
  );
}
