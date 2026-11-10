'use client';

import { ArrowLeft, Heart, Zap } from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './LessonClient.module.css';

export interface LessonSessionHeaderProps {
  title: string;
  language: string;
  estimatedTime: string;
  combo: number;
  earnedXp: number;
  lives: number;
  maxLives: number;
  currentStepIndex: number;
  totalSteps: number;
  onExit: () => void;
}

/** The real lesson toolbar and step progress, without session or network state. */
export function LessonSessionHeader({
  title,
  language,
  estimatedTime,
  combo,
  earnedXp,
  lives,
  maxLives,
  currentStepIndex,
  totalSteps,
  onExit,
}: LessonSessionHeaderProps) {
  const { text } = useLocalizedText();
  const steps = Math.max(1, totalSteps);
  return (
    <header className={styles.header}>
      <div className={styles.toolbar}>
        <button
          type="button"
          aria-label={text('Sair da lição', 'Exit lesson')}
          onClick={onExit}
          className={styles.iconButton}
        >
          <ArrowLeft size={21} aria-hidden="true" />
        </button>
        <div className={styles.heading}>
          <h1>{title}</h1>
          <p>
            {language} · {estimatedTime}
          </p>
        </div>
        <div className={styles.sessionStats}>
          {combo > 1 && (
            <span>
              <Zap size={17} aria-hidden="true" /> {combo}× combo
            </span>
          )}
          {earnedXp > 0 && <span>+{earnedXp} XP</span>}
          <span
            aria-label={text(
              `${lives} de ${maxLives} vidas restantes`,
              `${lives} of ${maxLives} lives left`
            )}
          >
            <Heart size={18} aria-hidden="true" /> {lives}
          </span>
        </div>
      </div>
      <div className={styles.progressRow}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={text('Progresso da lição', 'Lesson progress')}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStepIndex}
        >
          <span style={{ width: `${Math.min(100, (currentStepIndex / steps) * 100)}%` }} />
        </div>
        <span>
          {text('Etapa', 'Step')} {Math.min(currentStepIndex + 1, totalSteps)} {text('de', 'of')}{' '}
          {totalSteps}
        </span>
      </div>
    </header>
  );
}
