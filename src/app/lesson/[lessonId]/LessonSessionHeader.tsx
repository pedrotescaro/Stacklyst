'use client';

import { ArrowLeft, Crown, Heart, Timer, Zap } from 'lucide-react';
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
  /** Short rules line for game-mode lessons. */
  tagline?: string;
  boss?: boolean;
  timeLeft?: number | null;
  timeLimit?: number;
  xpPop?: { amount: number; key: number } | null;
  comboBurst?: { value: number; key: number } | null;
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
  tagline,
  boss = false,
  timeLeft = null,
  timeLimit,
  xpPop = null,
  comboBurst = null,
}: LessonSessionHeaderProps) {
  const { text } = useLocalizedText();
  const steps = Math.max(1, totalSteps);
  const timerShare = timeLeft !== null && timeLimit ? timeLeft / timeLimit : null;
  return (
    <header className={styles.header} data-boss={boss ? 'true' : undefined}>
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
          <h1>
            {boss && <Crown size={18} aria-hidden="true" className={styles.bossCrown} />}
            {title}
          </h1>
          <p>{tagline ?? `${language} · ${estimatedTime}`}</p>
        </div>
        <div className={styles.sessionStats}>
          {combo > 1 && (
            <span className={styles.comboChip}>
              <Zap size={17} aria-hidden="true" /> {combo}× combo
            </span>
          )}
          {(earnedXp > 0 || xpPop) && (
            <span className={styles.xpChip}>
              +{earnedXp} XP
              {xpPop && (
                <span key={xpPop.key} className={styles.xpPop} aria-hidden="true">
                  +{xpPop.amount}
                </span>
              )}
            </span>
          )}
          <span
            className={styles.hearts}
            aria-label={text(
              `${lives} de ${maxLives} vidas restantes`,
              `${lives} of ${maxLives} lives left`
            )}
          >
            {maxLives <= 5 ? (
              Array.from({ length: maxLives }, (_, index) => (
                <Heart
                  key={index}
                  size={18}
                  aria-hidden="true"
                  className={index < lives ? styles.heartFull : styles.heartLost}
                />
              ))
            ) : (
              <>
                <Heart size={18} aria-hidden="true" className={styles.heartFull} /> {lives}
              </>
            )}
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
      {timerShare !== null && (
        <div
          className={styles.timerRow}
          data-urgent={timeLeft !== null && timeLeft <= 10 ? 'true' : undefined}
          role="timer"
          aria-label={text(`${timeLeft} segundos restantes`, `${timeLeft} seconds left`)}
        >
          <Timer size={15} aria-hidden="true" />
          <div className={styles.timerTrack}>
            <span style={{ width: `${Math.max(0, timerShare) * 100}%` }} />
          </div>
          <span className={styles.timerValue}>{timeLeft}s</span>
        </div>
      )}
      {comboBurst && (
        <div key={comboBurst.key} className={styles.comboBurst} role="status">
          <Zap size={22} aria-hidden="true" /> {text('Combo', 'Combo')} {comboBurst.value}×!
        </div>
      )}
    </header>
  );
}
