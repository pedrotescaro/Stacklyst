'use client';

import Link from 'next/link';
import { Award, GraduationCap, Music2, Pause, Play, Tags } from 'lucide-react';
import type { ProfilePreferences, AchievementProgress } from '@/lib/profile-customization';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import styles from './ProfilePublic.module.css';

export interface PublicProfileCustomization {
  preferences: ProfilePreferences;
  achievements: Pick<AchievementProgress, 'id' | 'name' | 'description' | 'color'>[];
}

export function ProfilePublic({
  customization,
}: {
  customization?: PublicProfileCustomization | null;
}) {
  const { currentTrack, isPlaying, playTrack } = useMusicPlayer();

  if (!customization) return null;
  const { preferences, achievements } = customization;
  const { tags, studies, music } = preferences;
  if (!tags.length && !studies.length && !music && !achievements.length) return null;

  const isCurrentPlaying = currentTrack?.id === music?.trackId && isPlaying;

  const handlePlayProfileMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!music) return;
    playTrack({
      id: music.trackId,
      title: music.title || 'Música do perfil',
      artist: music.artist || 'Spotify',
      artworkUrl: music.artworkUrl,
      spotifyUrl: `https://open.spotify.com/track/${music.trackId}`,
    });
  };

  return (
    <div className={styles.details}>
      {tags.length > 0 && (
        <section className={styles.section} aria-label="Tags e interesses">
          <h2 className={styles.label}>
            <Tags size={15} aria-hidden="true" />
            Interesses
          </h2>
          <div className={styles.tags}>
            {tags.map((tag) => (
              <Link key={tag} href={`/explore?q=${encodeURIComponent(tag)}`} className={styles.tag}>
                #{tag}
              </Link>
            ))}
          </div>
        </section>
      )}
      {studies.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.label}>
            <GraduationCap size={15} aria-hidden="true" />
            Estudando atualmente
          </h2>
          <div className={styles.tags}>
            {studies.map((study) => (
              <span className={styles.tag} key={study}>
                {study}
              </span>
            ))}
          </div>
        </section>
      )}
      {music && (
        <section className={styles.section}>
          <h2 className={styles.label}>
            <Music2 size={15} aria-hidden="true" />
            Música do perfil
          </h2>
          <div
            className={`${styles.music} group cursor-pointer transition-colors hover:border-blue-500/40`}
            onClick={handlePlayProfileMusic}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePlayProfileMusic(e as unknown as React.MouseEvent);
              }
            }}
            aria-label={`Reproduzir ${music.title || 'faixa'} de ${music.artist || 'Spotify'}`}
          >
            {music.artworkUrl && (
              <img
                src={music.artworkUrl}
                alt="Capa do álbum"
                className={styles.cover}
                width={56}
                height={56}
              />
            )}
            <div className={styles.track}>
              <strong>{music.title || 'Faixa do Spotify'}</strong>
              {music.artist && <p>{music.artist}</p>}
              <a
                href={`https://open.spotify.com/track/${music.trackId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotify}
                onClick={(e) => e.stopPropagation()}
              >
                Ouvir no Spotify
              </a>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ml-auto"
              aria-label={isCurrentPlaying ? 'Pausar música do perfil' : 'Tocar música do perfil'}
              onClick={handlePlayProfileMusic}
            >
              {isCurrentPlaying ? (
                <Pause size={18} className="fill-white" />
              ) : (
                <Play size={18} className="ml-0.5 fill-white" />
              )}
            </button>
          </div>
        </section>
      )}
      {achievements.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.label}>
            <Award size={15} aria-hidden="true" />
            Conquistas em destaque
          </h2>
          <div className={styles.achievements}>
            {achievements.map((achievement) => (
              <div
                className={styles.achievement}
                key={achievement.id}
                title={achievement.description}
              >
                <Award size={20} style={{ color: achievement.color }} aria-hidden="true" />
                <span>{achievement.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
