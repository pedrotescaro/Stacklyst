import Link from 'next/link';
import { Award, GraduationCap, Music2, Tags } from 'lucide-react';
import type { ProfilePreferences, AchievementProgress } from '@/lib/profile-customization';
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
  if (!customization) return null;
  const { preferences, achievements } = customization;
  const { tags, studies, music } = preferences;
  if (!tags.length && !studies.length && !music && !achievements.length) return null;
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
          <div className={styles.music}>
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
              >
                Ouvir no Spotify
              </a>
            </div>
          </div>
          <iframe
            className={styles.player}
            src={`https://open.spotify.com/embed/track/${music.trackId}?utm_source=stacklyst`}
            title={`Player Spotify: ${music.title || 'música do perfil'}`}
            allow="encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
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
