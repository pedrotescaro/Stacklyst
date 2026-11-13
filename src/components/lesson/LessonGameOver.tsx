'use client';

import { HeartCrack, RotateCcw } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './LessonSummary.module.css';

interface LessonGameOverProps {
  lessonTitle: string;
  boss?: boolean;
  onRetry: () => void;
  onExit: () => void;
}

/** Shown when the learner runs out of hearts. Saved progress is kept. */
export function LessonGameOver({
  lessonTitle,
  boss = false,
  onRetry,
  onExit,
}: LessonGameOverProps) {
  const { text } = useLocalizedText();
  return (
    <section className={styles.summary} aria-labelledby="lesson-game-over-title">
      <div className={styles.gameOverIcon} aria-hidden="true">
        <HeartCrack size={56} />
      </div>
      <h1 id="lesson-game-over-title">
        {boss
          ? text('O chefão venceu desta vez', 'The boss won this time')
          : text('Sem corações!', 'Out of hearts!')}
      </h1>
      <p className={styles.description}>
        {text(
          `As etapas que você já acertou em ${lessonTitle} continuam salvas. Respire e tente de novo com os corações cheios.`,
          `The steps you already got right in ${lessonTitle} stay saved. Take a breath and try again with full hearts.`
        )}
      </p>
      <button type="button" onClick={onRetry} className={styles.finish}>
        <RotateCcw size={19} aria-hidden="true" /> {text('Tentar de novo', 'Try again')}
      </button>
      <button type="button" onClick={onExit} className={styles.secondary}>
        {text('Voltar para a trilha', 'Back to the trail')}
      </button>
    </section>
  );
}
