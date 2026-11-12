'use client';

/* Session-protected attachments must keep browser cookies on their requests. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { Check, Users } from 'lucide-react';
import type { PostAttachment, PostPoll } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { SpotifyTrackCard } from '@/components/music/SpotifyTrackCard';
import styles from './PostAttachments.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface PostAttachmentsProps {
  postId: string;
  attachments?: PostAttachment[] | null;
  music?: SpotifyProfileTrack | null;
  poll?: PostPoll | null;
  legacyImage?: string | null;
  audience?: string | null;
}

export function PostAttachments({
  postId,
  attachments,
  music,
  poll,
  legacyImage,
  audience,
}: PostAttachmentsProps) {
  const { text } = useLocalizedText();
  const media = Array.isArray(attachments) ? attachments : [];
  const images = media.filter((item) => item.type === 'image' || item.type === 'gif');
  const audio = media.find((item) => item.type === 'audio');
  const showLegacy = legacyImage && !images.some((item) => item.url === legacyImage);
  return (
    <div className={styles.attachments} onClick={(event) => event.stopPropagation()}>
      {audience === 'followers' && (
        <p className={styles.audience}>
          <Users size={13} aria-hidden="true" />
          {text('Apenas seguidores', 'Followers only')}
        </p>
      )}
      {(images.length > 0 || showLegacy) && (
        <div className={styles.imageGrid}>
          {[
            ...images,
            ...(showLegacy
              ? [
                  {
                    type: 'image' as const,
                    url: legacyImage,
                    alt: text('Imagem da publicação', 'Post image'),
                  },
                ]
              : []),
          ].map((item, index) => (
            <a
              href={item.url}
              key={`${item.url}-${index}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${text('Abrir imagem', 'Open image')} ${index + 1}`}
            >
              <img
                src={item.url}
                alt={
                  item.alt || text(`Imagem ${index + 1} da publicação`, `Post image ${index + 1}`)
                }
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
      {audio && (
        <audio
          className={styles.audio}
          controls
          preload="none"
          src={audio.url}
          aria-label={text('Áudio da publicação', 'Post audio')}
        />
      )}
      <SpotifyTrackCard music={music} />
      {poll && <PostPollWidget key={poll.id} postId={postId} initialPoll={poll} />}
    </div>
  );
}

export function PostPollWidget({ postId, initialPoll }: { postId: string; initialPoll: PostPoll }) {
  const { text, isEnglish } = useLocalizedText();
  const [poll, setPoll] = useState(initialPoll);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => setPoll(initialPoll), [initialPoll]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(timer);
  }, []);
  const closed = poll.closed || new Date(poll.expiresAt).getTime() <= now;
  const hasVoted = typeof poll.myVote === 'number';
  const results = hasVoted || closed;
  const vote = async (optionIndex: number) => {
    if (busy || closed || hasVoted) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/posts/${postId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message ||
            result.error ||
            text(
              'Não foi possível registrar seu voto. Tente novamente.',
              'Could not record your vote. Try again.'
            )
        );
      setPoll(result.poll || result);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : text('Não foi possível registrar seu voto.', 'Could not record your vote.')
      );
    } finally {
      setBusy(false);
    }
  };
  const remaining = Math.max(0, new Date(poll.expiresAt).getTime() - now);
  const hours = Math.ceil(remaining / 3600000);
  return (
    <section className={styles.poll} aria-label={text('Enquete', 'Poll')}>
      <h3>{poll.question}</h3>
      <div className={styles.pollOptions}>
        {poll.options.map((option, index) => {
          const count = poll.counts[index] || 0;
          const percentage = poll.totalVotes ? Math.round((count * 100) / poll.totalVotes) : 0;
          const selected = poll.myVote === index;
          return (
            <button
              key={index}
              type="button"
              className={`${styles.pollOption} ${selected ? styles.selected : ''}`}
              disabled={busy || closed || hasVoted}
              onClick={() => void vote(index)}
              aria-label={
                results
                  ? text(
                      `${option}: ${percentage}%, ${count} votos${selected ? ', sua escolha' : ''}`,
                      `${option}: ${percentage}%, ${count} ${count === 1 ? 'vote' : 'votes'}${selected ? ', your choice' : ''}`
                    )
                  : `${text('Votar em', 'Vote for')} ${option}`
              }
            >
              {results && (
                <span
                  className={styles.pollBar}
                  style={{ width: `${percentage}%` }}
                  aria-hidden="true"
                />
              )}
              <span className={styles.pollOptionText}>
                {option}
                {selected && <Check size={14} aria-label={text('Seu voto', 'Your vote')} />}
              </span>
              {results && <strong>{percentage}%</strong>}
            </button>
          );
        })}
      </div>
      <p className={styles.pollMeta} role="status">
        {busy
          ? text('Registrando voto…', 'Recording vote…')
          : isEnglish
            ? `${poll.totalVotes} ${poll.totalVotes === 1 ? 'vote' : 'votes'} · ${closed ? 'Closed' : hours >= 24 ? `${Math.ceil(hours / 24)} day(s) left` : hours > 1 ? `${hours} hours left` : 'Less than 1 hour'}`
            : `${poll.totalVotes} ${poll.totalVotes === 1 ? 'voto' : 'votos'} · ${closed ? 'Encerrada' : hours >= 24 ? `${Math.ceil(hours / 24)} dia(s) restante(s)` : hours > 1 ? `${hours} horas restantes` : 'Menos de 1 hora'}`}
        {hasVoted ? text(' · Você votou', ' · You voted') : ''}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
