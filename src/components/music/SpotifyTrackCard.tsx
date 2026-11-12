'use client';

/* Spotify artwork comes from i.scdn.co and is rendered as-is. */
/* eslint-disable @next/next/no-img-element */
import { ExternalLink, LoaderCircle, Music2, Pause, Play } from 'lucide-react';
import type { SpotifyProfileTrack } from '@/lib/profile-music';
import { useMusicPlayerControls } from '@/contexts/MusicPlayerContext';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './SpotifyTrackCard.module.css';

const SPOTIFY_TRACK_ID = /^[a-zA-Z0-9]{22}$/;

type SpotifyTrackLike = Pick<SpotifyProfileTrack, 'trackId'> & {
  title?: string | null;
  artist?: string | null;
  artworkUrl?: string | null;
};

interface SpotifyTrackCardProps {
  music: SpotifyTrackLike | null | undefined;
  className?: string;
}

/** Shared Spotify track card used by feed posts and the profile music section. */
export function SpotifyTrackCard({ music, className }: SpotifyTrackCardProps) {
  const { text } = useLocalizedText();
  const trackId = music && SPOTIFY_TRACK_ID.test(music.trackId) ? music.trackId : null;
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    error: musicError,
    playTrack,
  } = useMusicPlayerControls();

  if (!trackId) return null;

  const isCurrent = currentTrack?.id === trackId;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isCurrentLoading = isCurrent && isBuffering;
  const hasMusicError = isCurrent && musicError;
  const title = music?.title || text('Faixa do Spotify', 'Spotify track');
  const spotifyUrl = `https://open.spotify.com/track/${trackId}`;

  const handlePlayMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack({
      id: trackId,
      title,
      artist: music?.artist || 'Spotify',
      artworkUrl: music?.artworkUrl,
      spotifyUrl,
    });
  };

  return (
    <div className={className ? `${styles.music} ${className}` : styles.music}>
      <div className={styles.musicInfo}>
        {music?.artworkUrl ? (
          <img
            src={music.artworkUrl}
            width={56}
            height={56}
            alt=""
            loading="lazy"
            className={styles.musicArtwork}
          />
        ) : (
          <div className={styles.musicArtwork}>
            <Music2 size={24} aria-hidden="true" />
          </div>
        )}
        <div className={styles.musicDetails}>
          <strong title={music?.title ?? undefined}>{title}</strong>
          <span title={music?.artist ?? undefined}>{music?.artist}</span>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {text('Abrir no Spotify', 'Open in Spotify')}{' '}
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        </div>
        <button
          type="button"
          className={styles.playerToggle}
          onClick={handlePlayMusic}
          aria-label={
            isCurrentLoading
              ? text('Cancelar carregamento da música', 'Cancel music loading')
              : isCurrentPlaying
                ? text(`Pausar ${music?.title || 'música'}`, `Pause ${music?.title || 'music'}`)
                : text(`Reproduzir ${music?.title || 'música'}`, `Play ${music?.title || 'music'}`)
          }
        >
          {isCurrentLoading ? (
            <LoaderCircle size={18} className={styles.loadingIcon} aria-hidden="true" />
          ) : isCurrentPlaying ? (
            <Pause size={18} fill="currentColor" aria-hidden="true" />
          ) : (
            <Play size={18} fill="currentColor" className={styles.playIcon} aria-hidden="true" />
          )}
        </button>
      </div>
      {hasMusicError && (
        <p className={styles.musicError} role="alert">
          {text(
            'Não foi possível tocar. Tente novamente ou abra no Spotify.',
            'Could not play. Try again or open in Spotify.'
          )}
        </p>
      )}
    </div>
  );
}
