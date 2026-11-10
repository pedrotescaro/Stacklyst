'use client';

import { LanguageTrailBar } from '@/components/LanguageTrailBar';
import { calculateLevel } from '@/lib/learning/rewards';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from '@/components/profile-inline/InlineProfile.module.css';

export interface ProfileStatisticsProps {
  stats: {
    answers_count: number;
    accuracy: number;
    accepted_count: number;
    posts_count?: number;
    likes_received?: number;
  };
  totalXp: number;
  streakDays: number;
  weeklyActivity: ReadonlyMap<number, number>;
  trails: Array<{ language: string; xp: number; level: number }>;
}

export function Metric({
  value,
  label,
  onClick,
}: {
  value: number | string;
  label: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <strong>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</strong>
      <span>{label}</span>
    </>
  );
  return (
    <div className={styles.metric}>
      {onClick ? (
        <button type="button" onClick={onClick}>
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
}

/** The profile "Estatísticas" tab, rendered from already-loaded data. */
export function ProfileStatistics({
  stats,
  totalXp,
  streakDays,
  weeklyActivity,
  trails,
}: ProfileStatisticsProps) {
  const { text, isEnglish } = useLocalizedText();
  return (
    <section className={styles.statistics}>
      <h2>{text('Estatísticas do perfil', 'Profile statistics')}</h2>
      <div className={styles.metrics}>
        <Metric value={stats.posts_count ?? 0} label={text('Publicações', 'Posts')} />
        <Metric value={stats.answers_count} label={text('Comentários', 'Comments')} />
        <Metric
          value={stats.likes_received ?? 0}
          label={text('Curtidas recebidas', 'Likes received')}
        />
        <Metric value={totalXp} label="XP" />
      </div>
      <section className={styles.statisticsSection}>
        <h3>{text('Aprendizagem e atividade', 'Learning and activity')}</h3>
        <div className={styles.learningMetrics}>
          <Metric
            value={`${stats.accuracy}%`}
            label={text('Precisão nos quizzes', 'Quiz accuracy')}
          />
          <Metric
            value={stats.accepted_count}
            label={text('Respostas aceitas', 'Accepted answers')}
          />
          <Metric value={streakDays} label={text('Dias de ofensiva', 'Streak days')} />
        </div>
      </section>
      <section className={styles.statisticsSection}>
        <h3>{text('Atividade semanal', 'Weekly activity')}</h3>
        <div
          className={styles.weekly}
          aria-label={text('Atividade semanal de quizzes', 'Weekly quiz activity')}
        >
          {(isEnglish
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
          ).map((day, index) => (
            <div key={index}>
              <span>{day}</span>
              <b data-active={Boolean(weeklyActivity.get(index))}>
                {weeklyActivity.get(index) || 0}
              </b>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.statisticsSection}>
        <h3>{text('Progresso por linguagem', 'Language progress')}</h3>
        <div className={styles.languageProgress}>
          {trails.map((trail) => (
            <LanguageTrailBar
              key={trail.language}
              language={trail.language}
              xp={trail.xp}
              level={trail.level}
              maxXp={calculateLevel(trail.xp).nextLevelXp}
              compact
            />
          ))}
          {trails.length === 0 && (
            <p className={styles.empty}>{text('Nenhuma trilha iniciada.', 'No trails started.')}</p>
          )}
        </div>
      </section>
    </section>
  );
}
