'use client';

import { useState, type CSSProperties } from 'react';
import {
  Sprout,
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
  Star,
  Users,
} from 'lucide-react';
import type {
  AchievementProgress,
  ProfileCatalog,
  ProfileMetric,
  ProfilePreferences,
} from '@/lib/profile-customization';
import { getLocalizedTitleName } from '@/lib/profile-customization';
import { readableColor } from '@/lib/profile-style';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './Personalization.module.css';

const rarityNames: Record<string, { pt: string; en: string }> = {
  common: { pt: 'Comum', en: 'Common' },
  uncommon: { pt: 'Incomum', en: 'Uncommon' },
  rare: { pt: 'Raro', en: 'Rare' },
  epic: { pt: 'Épico', en: 'Epic' },
  legendary: { pt: 'Lendário', en: 'Legendary' },
  special: { pt: 'Especial', en: 'Special' },
};

const achievementIcons = {
  sprout: Sprout,
  award: Award,
  message: MessageCircle,
  users: Users,
  heart: Heart,
  code: Code,
  sparkles: Sparkles,
  ghost: Ghost,
  gift: Gift,
  cake: Cake,
  star: Star,
};

const metricDetails: Record<ProfileMetric, { pt: string; en: string }> = {
  posts: {
    pt: 'Publicações precisam ter título com pelo menos 4 caracteres e texto com pelo menos 40. Conteúdos repetidos contam uma vez, com limite de 5 por dia.',
    en: 'Posts must have a title with at least 4 characters and body with at least 40. Duplicate posts count once, up to 5 per day.',
  },
  comments: {
    pt: 'Comentários precisam ter pelo menos 12 caracteres e responder a outra pessoa. Textos repetidos contam uma vez.',
    en: 'Comments must have at least 12 characters and reply to another person. Duplicate comments count once.',
  },
  firstDayComments: {
    pt: 'Escreva um comentário original de pelo menos 12 caracteres para outro membro no dia 1 de qualquer mês, pelo horário de Brasília. Comentários históricos também contam.',
    en: 'Write an original comment of at least 12 characters to another member on the 1st of any month (Brasília time). Historic comments also count.',
  },
  hashtagPosts: {
    pt: 'Publique com a hashtag exata exigida pelo título, com pelo menos 4 caracteres no título e 40 no texto. Conteúdos repetidos contam uma vez, até 5 por dia UTC.',
    en: 'Post with the exact hashtag required by the title, with at least 4 characters in title and 40 in body. Duplicate posts count once, up to 5 per day UTC.',
  },
  peopleHelped: {
    pt: 'Conte as pessoas diferentes às quais você respondeu. A resposta precisa ter pelo menos 12 caracteres e textos repetidos contam uma vez.',
    en: 'Count different people you replied to. Reply must have at least 12 characters and duplicate texts count once.',
  },
  likes: {
    pt: 'Contam curtidas de outras contas criadas há pelo menos 24 horas, até 20 por pessoa por dia.',
    en: 'Count likes from other accounts created at least 24 hours earlier, up to 20 per person per day.',
  },
  followers: {
    pt: 'Contam seguidores cujas contas foram criadas pelo menos 24 horas antes de seguir você.',
    en: 'Count followers whose accounts were created at least 24 hours before following you.',
  },
  learningActivities: {
    pt: 'Conclua exercícios diferentes com resultado aprovado.',
    en: 'Complete distinct exercises with passing results.',
  },
  completedTrails: {
    pt: 'Conclua todas as etapas obrigatórias dos quizzes da trilha.',
    en: 'Complete all mandatory quiz stages of the trail.',
  },
  completedTrailPython: {
    pt: 'Conclua todas as etapas da trilha Python do Zero.',
    en: 'Complete all stages of the Python from Scratch trail.',
  },
  completedTrailRust: {
    pt: 'Conclua todas as etapas da trilha Rust do Zero.',
    en: 'Complete all stages of the Rust from Scratch trail.',
  },
  eventPosts: {
    pt: 'Durante o evento, publique com a hashtag indicada, título com pelo menos 4 caracteres e texto com pelo menos 40. Conteúdos repetidos contam uma vez.',
    en: 'During the event, post with the specified hashtag, title with at least 4 characters and body with at least 40. Duplicate posts count once.',
  },
  eventComments: {
    pt: 'Durante o evento, comente em publicações de outras pessoas feitas no período e com a hashtag do evento. Comentários precisam ter pelo menos 12 caracteres e textos repetidos contam uma vez.',
    en: 'During the event, comment on other people’s posts made in the period with the event hashtag. Comments must have at least 12 characters and duplicate texts count once.',
  },
  eventComplete: {
    pt: 'Conclua todos os outros desafios deste evento durante o período em que ele estiver ativo.',
    en: 'Complete all other challenges of this event while it is active.',
  },
};

export function AchievementsPanel({
  achievements,
  events,
  preferences,
  onChange,
}: {
  achievements: AchievementProgress[];
  events: ProfileCatalog['events'];
  preferences: ProfilePreferences;
  onChange: (preferences: ProfilePreferences) => void;
}) {
  const { isEnglish, text, locale } = useLocalizedText();
  const [filter, setFilter] = useState('all');
  const visible = achievements.filter(
    (item) => filter === 'all' || (filter === 'unlocked' ? item.unlocked : !item.unlocked)
  );

  const eventDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  });

  return (
    <>
      <label className={styles.field}>
        <span className={styles.label}>{text('Mostrar conquistas', 'Show achievements')}</span>
        <select
          className={styles.select}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">{text('Todas as conquistas', 'All achievements')}</option>
          <option value="unlocked">{text('Desbloqueadas', 'Unlocked')}</option>
          <option value="locked">{text('Ainda não desbloqueadas', 'Locked')}</option>
        </select>
      </label>
      <p className={styles.help}>
        {text(
          'Você pode destacar até três conquistas e usar um título principal. As metas são verificadas pela atividade real da sua conta.',
          'You can feature up to three achievements and equip a primary title. Goals are verified by real account activity.'
        )}
      </p>
      <div className={styles.achievementList}>
        {visible.length === 0 && (
          <p className={styles.notice}>
            {text(
              'Nenhuma conquista nesta seleção. Continue participando da comunidade para avançar nas metas.',
              'No achievements in this selection. Keep participating in the community to advance goals.'
            )}
          </p>
        )}
        {visible.map((achievement) => {
          const featured = preferences.featuredAchievementIds.includes(achievement.id);
          const equipped = preferences.equippedTitleId === achievement.id;
          const target = achievement.requirement.target;
          const Icon = achievementIcons[achievement.icon];
          const event = events.find((item) => item.id === achievement.requirement.eventId);
          const titleName = isEnglish ? getLocalizedTitleName(achievement, true) : achievement.name;
          const rarityLabel =
            rarityNames[achievement.rarity]?.[isEnglish ? 'en' : 'pt'] || achievement.rarity;
          const metricDetailText =
            metricDetails[achievement.requirement.metric]?.[isEnglish ? 'en' : 'pt'] || '';

          return (
            <article key={achievement.id} className={styles.achievement}>
              <div
                className={styles.achievementIcon}
                style={{ color: achievement.color }}
                aria-hidden="true"
              >
                {achievement.unlocked ? (
                  achievement.id === 'first-of-month' ? (
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>🐮</span>
                  ) : achievement.id === 'abobora' ? (
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>🎃</span>
                  ) : achievement.id === 'pastel' ? (
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>🥟</span>
                  ) : achievement.id === 'estrela' ? (
                    <Star size={21} fill="currentColor" />
                  ) : Icon ? (
                    <Icon size={21} />
                  ) : (
                    <Award size={21} />
                  )
                ) : (
                  <Lock size={18} />
                )}
              </div>
              <div>
                <h3 className={styles.achievementTitle}>
                  {titleName}
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
                    {rarityLabel}
                  </span>
                </h3>
                <p className={styles.achievementDescription}>{achievement.description}</p>
                <details className={styles.achievementDetails}>
                  <summary>{text('Como conseguir', 'How to obtain')}</summary>
                  <p>{metricDetailText}</p>
                  {event && (
                    <p>
                      {event.name} · #{event.hashtag}.{' '}
                      {isEnglish
                        ? `From ${eventDate.format(new Date(event.startsAt))} to ${eventDate.format(new Date(event.endsAt))} (Brasília time).`
                        : `De ${eventDate.format(new Date(event.startsAt))} até ${eventDate.format(new Date(event.endsAt))} (horário de Brasília, término exclusivo).`}
                      {!event.enabled &&
                        ` ${text('Este evento está desativado.', 'This event is deactivated.')}`}
                    </p>
                  )}
                </details>
                <progress
                  className={styles.progress}
                  value={Math.min(achievement.progress, target)}
                  max={target}
                  aria-label={`${text('Progresso de', 'Progress of')} ${titleName}`}
                />
                <div className={styles.progressCaption}>
                  <span>
                    {Math.min(achievement.progress, target).toLocaleString(locale)} /{' '}
                    {target.toLocaleString(locale)}
                  </span>
                  <span>
                    {achievement.unlocked
                      ? text('Desbloqueada', 'Unlocked')
                      : text('Em progresso', 'In progress')}
                  </span>
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
                      {equipped
                        ? text('Retirar título', 'Remove title')
                        : text('Usar título', 'Equip title')}
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
                      {featured
                        ? text('Remover destaque', 'Remove highlight')
                        : text('Destacar no perfil', 'Feature on profile')}
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
