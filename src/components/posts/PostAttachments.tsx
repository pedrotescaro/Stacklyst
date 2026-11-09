'use client';

/* Session-protected attachments must keep browser cookies on their requests. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import { Check, ExternalLink, Music2, Pause, Play, Users } from 'lucide-react';
import type { PostAttachment, PostPoll } from '@/lib/post-content';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './PostAttachments.module.css';

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
  const media = Array.isArray(attachments) ? attachments : [];
  const images = media.filter((item) => item.type === 'image' || item.type === 'gif');
  const audio = media.find((item) => item.type === 'audio');
  const showLegacy = legacyImage && !images.some((item) => item.url === legacyImage);
  const trackId = music && /^[a-zA-Z0-9]{22}$/.test(music.trackId) ? music.trackId : null;
  const { currentTrack, isPlaying, playTrack } = useMusicPlayer();
  const isCurrentPlaying = currentTrack?.id === trackId && isPlaying;

  const handlePlayMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!trackId) return;
    playTrack({
      id: trackId,
      title: music?.title || 'Faixa do Spotify',
      artist: music?.artist || 'Spotify',
      artworkUrl: music?.artworkUrl,
      spotifyUrl: `https://open.spotify.com/track/${trackId}`,
    });
  };

  return (
    <div className={styles.attachments} onClick={(event) => event.stopPropagation()}>
      {audience === 'followers' && (
        <p className={styles.audience}>
          <Users size={13} aria-hidden="true" />
          Apenas seguidores
        </p>
      )}
      {(images.length > 0 || showLegacy) && (
        <div className={styles.imageGrid}>
          {[
            ...images,
            ...(showLegacy
              ? [{ type: 'image' as const, url: legacyImage, alt: 'Imagem da publicação' }]
              : []),
          ].map((item, index) => (
            <a
              href={item.url}
              key={`${item.url}-${index}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir imagem ${index + 1}`}
            >
              <img
                src={item.url}
                alt={item.alt || `Imagem ${index + 1} da publicação`}
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
          aria-label="Áudio da publicação"
        />
      )}
      {trackId && (
        <div
          className={`${styles.music} group cursor-pointer transition-colors hover:border-blue-500/40`}
          onClick={handlePlayMusic}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePlayMusic(e as unknown as React.MouseEvent);
            }
          }}
          aria-label={`Reproduzir ${music?.title || 'faixa'} de ${music?.artist || 'Spotify'}`}
        >
          <div className={styles.musicInfo}>
            {music?.artworkUrl ? (
              <img
                src={music.artworkUrl}
                width={48}
                height={48}
                alt="Capa do álbum"
                loading="lazy"
                className="rounded-lg shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 text-blue-400">
                <Music2 size={24} aria-hidden="true" />
              </div>
            )}
            <div>
              <strong>{music?.title || 'Faixa do Spotify'}</strong>
              <span>{music?.artist}</span>
              <a
                href={`https://open.spotify.com/track/${trackId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Abrir no Spotify <ExternalLink size={11} />
              </a>
            </div>
            <button
              type="button"
              className={`${styles.playerToggle} inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                isCurrentPlaying
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-white/5 text-neutral-300 hover:bg-blue-500 hover:text-white border border-white/10'
              }`}
              onClick={handlePlayMusic}
              aria-label={isCurrentPlaying ? 'Pausar música' : 'Ouvir música'}
            >
              {isCurrentPlaying ? (
                <>
                  <Pause size={13} className="fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play size={13} className="ml-0.5 fill-current" />
                  <span>Ouvir</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {poll && <PostPollWidget key={poll.id} postId={postId} initialPoll={poll} />}
    </div>
  );
}

export function PostPollWidget({ postId, initialPoll }: { postId: string; initialPoll: PostPoll }) {
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
          result.message || result.error || 'Não foi possível registrar seu voto. Tente novamente.'
        );
      setPoll(result.poll || result);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível registrar seu voto.');
    } finally {
      setBusy(false);
    }
  };
  const remaining = Math.max(0, new Date(poll.expiresAt).getTime() - now);
  const hours = Math.ceil(remaining / 3600000);
  return (
    <section className={styles.poll} aria-label="Enquete">
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
                  ? `${option}: ${percentage}%, ${count} votos${selected ? ', sua escolha' : ''}`
                  : `Votar em ${option}`
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
                {selected && <Check size={14} aria-label="Seu voto" />}
              </span>
              {results && <strong>{percentage}%</strong>}
            </button>
          );
        })}
      </div>
      <p className={styles.pollMeta} role="status">
        {busy
          ? 'Registrando voto…'
          : `${poll.totalVotes} ${poll.totalVotes === 1 ? 'voto' : 'votos'} · ${closed ? 'Encerrada' : hours >= 24 ? `${Math.ceil(hours / 24)} dia(s) restante(s)` : hours > 1 ? `${hours} horas restantes` : 'Menos de 1 hora'}`}
        {hasVoted ? ' · Você votou' : ''}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
