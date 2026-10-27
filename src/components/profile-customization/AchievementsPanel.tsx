'use client';

import { useState, type CSSProperties } from 'react';
import {
  Award,
  Cake,
  Check,
  Code,
  Ghost,
  Gift,
  Heart,
  Lock,
  MessageCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import type { AchievementProgress, ProfilePreferences } from '@/lib/profile-customization';
import { readableColor } from '@/lib/profile-style';
import styles from './Personalization.module.css';

const rarityNames: Record<string, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
  special: 'Especial',
};
const achievementIcons = {
  award: Award,
  message: MessageCircle,
  users: Users,
  heart: Heart,
  code: Code,
  sparkles: Sparkles,
  ghost: Ghost,
  gift: Gift,
  cake: Cake,
};

export function AchievementsPanel({
  achievements,
  preferences,
  onChange,
}: {
  achievements: AchievementProgress[];
  preferences: ProfilePreferences;
  onChange: (preferences: ProfilePreferences) => void;
}) {
  const [filter, setFilter] = useState('all');
  const visible = achievements.filter(
    (item) => filter === 'all' || (filter === 'unlocked' ? item.unlocked : !item.unlocked)
  );
  return (
    <>
      <label className={styles.field}>
        <span className={styles.label}>Mostrar conquistas</span>
        <select
          className={styles.select}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">Todas as conquistas</option>
          <option value="unlocked">Desbloqueadas</option>
          <option value="locked">Ainda não desbloqueadas</option>
        </select>
      </label>
      <p className={styles.help}>
        Você pode destacar até três conquistas e usar um título principal. As metas são verificadas
        pela atividade real da sua conta.
      </p>
      <div className={styles.achievementList}>
        {visible.length === 0 && (
          <p className={styles.notice}>
            Nenhuma conquista nesta seleção. Continue participando da comunidade para avançar nas
            metas.
          </p>
        )}
        {visible.map((achievement) => {
          const featured = preferences.featuredAchievementIds.includes(achievement.id);
          const equipped = preferences.equippedTitleId === achievement.id;
          const target = achievement.requirement.target;
          const Icon = achievementIcons[achievement.icon];
          return (
            <article key={achievement.id} className={styles.achievement}>
              <div
                className={styles.achievementIcon}
                style={{ color: achievement.color }}
                aria-hidden="true"
              >
                {achievement.unlocked ? <Icon size={21} /> : <Lock size={18} />}
              </div>
              <div>
                <h3 className={styles.achievementTitle}>
                  {achievement.name}
                  <span
                    className={`${styles.titlePill} ${styles.rarity}`}
                    style={
                      {
                        '--rarity-light': readableColor(achievement.color, '#ffffff'),
                        '--rarity-dark': readableColor(achievement.color, '#08090b'),
                        borderColor: achievement.color,
                      } as CSSProperties
                    }
                  >
                    {rarityNames[achievement.rarity] || achievement.rarity}
                  </span>
                </h3>
                <p className={styles.achievementDescription}>{achievement.description}</p>
                <progress
                  className={styles.progress}
                  value={Math.min(achievement.progress, target)}
                  max={target}
                  aria-label={`Progresso de ${achievement.name}`}
                />
                <div className={styles.progressCaption}>
                  <span>
                    {Math.min(achievement.progress, target).toLocaleString('pt-BR')} /{' '}
                    {target.toLocaleString('pt-BR')}
                  </span>
                  <span>{achievement.unlocked ? 'Desbloqueada' : 'Em progresso'}</span>
                </div>
                {achievement.unlocked && (
                  <div className={styles.achievementActions}>
                    <button
                      type="button"
                      className={styles.button}
                      aria-pressed={equipped}
                      onClick={() =>
                        onChange({
                          ...preferences,
                          equippedTitleId: equipped ? null : achievement.id,
                        })
                      }
                    >
                      {equipped && <Check size={14} />}
                      {equipped ? 'Retirar título' : 'Usar título'}
                    </button>
                    <button
                      type="button"
                      className={styles.quietButton}
                      aria-pressed={featured}
                      disabled={!featured && preferences.featuredAchievementIds.length >= 3}
                      onClick={() =>
                        onChange({
                          ...preferences,
                          featuredAchievementIds: featured
                            ? preferences.featuredAchievementIds.filter(
                                (id) => id !== achievement.id
                              )
                            : [...preferences.featuredAchievementIds, achievement.id],
                        })
                      }
                    >
                      {featured ? 'Remover destaque' : 'Destacar no perfil'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
