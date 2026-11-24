'use client';

import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  LoaderCircle,
  X,
  Info,
} from 'lucide-react';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './LessonFooter.module.css';

interface LessonFooterProps {
  isConceptOnly?: boolean;
  answered: boolean;
  isCorrect: boolean;
  feedbackMessage?: string;
  feedbackDetails?: string;
  earnedXp?: number;
  combo?: number;
  hints?: string[];
  /** How many hints the learner has already revealed on this step. */
  revealedHints?: number;
  onOpenHint?: () => void;
  onVerify: () => void;
  onContinue: () => void;
  onRetry?: () => void;
  canVerify: boolean;
  isVerifying?: boolean;
  /** A failed save: shown in the footer, next to the button that retries it. */
  errorMessage?: string | null;
  onDismissError?: () => void;
  /** Neutral guidance, e.g. after being sent back to an unfinished step. */
  notice?: string | null;
}

export function LessonFooter({
  isConceptOnly = false,
  answered,
  isCorrect,
  feedbackMessage,
  feedbackDetails,
  earnedXp = 0,
  combo = 0,
  hints,
  revealedHints = 0,
  onOpenHint,
  onVerify,
  onContinue,
  onRetry,
  canVerify,
  isVerifying = false,
  errorMessage,
  onDismissError,
  notice,
}: LessonFooterProps) {
  const { text } = useLocalizedText();
  return (
    <footer className={styles.footer}>
      {(errorMessage || notice) && (
        <div className={styles.banner} data-tone={errorMessage ? 'error' : 'info'}>
          {errorMessage ? (
            <XCircle size={18} aria-hidden="true" />
          ) : (
            <Info size={18} aria-hidden="true" />
          )}
          <p role={errorMessage ? 'alert' : 'status'}>{errorMessage ?? notice}</p>
          {errorMessage && onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              aria-label={text('Fechar aviso', 'Dismiss message')}
              className={styles.bannerClose}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <div className={styles.inner}>
        {answered ? (
          <div className={styles.feedback} data-correct={isCorrect} role="status">
            {isCorrect ? (
              <CheckCircle2 size={24} aria-hidden="true" />
            ) : (
              <XCircle size={24} aria-hidden="true" />
            )}
            <div>
              <h3>
                {isCorrect
                  ? text('Mandou muito bem!', 'Well done!')
                  : text('Ops, não foi dessa vez!', 'Oops, not this time!')}
              </h3>
              {feedbackMessage && <p>{feedbackMessage}</p>}
              {feedbackDetails && <pre>{feedbackDetails}</pre>}
              {isCorrect && earnedXp > 0 && (
                <span>
                  +{earnedXp} XP{combo > 1 ? ` · ${combo}× combo` : ''}
                </span>
              )}
            </div>
          </div>
        ) : hints && hints.length > 0 && onOpenHint ? (
          <div className={styles.hintArea}>
            <div aria-live="polite" className={styles.hintUpdates}>
              {revealedHints > 0 && (
                <ol className={styles.hintList}>
                  {hints.slice(0, revealedHints).map((hint) => (
                    <li key={hint}>
                      <Lightbulb size={16} aria-hidden="true" />
                      <span>{hint}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {revealedHints < hints.length && (
              <button type="button" onClick={onOpenHint} className={styles.secondaryButton}>
                <Lightbulb size={18} aria-hidden="true" />{' '}
                {revealedHints === 0
                  ? text('Ver dica', 'Show hint')
                  : text('Mais uma dica', 'Another hint')}
                {hints.length > 1 && (
                  <span className={styles.hintCount}>
                    {revealedHints + 1}/{hints.length}
                  </span>
                )}
              </button>
            )}
          </div>
        ) : (
          <span className={styles.guidance}>
            {isConceptOnly
              ? text(
                  'Leia o conteúdo e avance quando estiver pronto.',
                  'Read the content and move on when you are ready.'
                )
              : text(
                  'Responda à atividade para verificar sua solução.',
                  'Answer the activity to check your solution.'
                )}
          </span>
        )}
        <div className={styles.actions}>
          {answered && !isCorrect && onRetry ? (
            <button type="button" onClick={onRetry} className={styles.primaryButton}>
              <RotateCcw size={17} aria-hidden="true" />{' '}
              <span>{text('Tentar Novamente', 'Try again')}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!answered && (!canVerify || isVerifying)}
              onClick={answered || isConceptOnly ? onContinue : onVerify}
              className={styles.primaryButton}
            >
              {isVerifying && (
                <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />
              )}
              <span>
                {answered
                  ? text('Continuar', 'Continue')
                  : isVerifying
                    ? text('Verificando…', 'Checking…')
                    : errorMessage
                      ? text('Tentar salvar novamente', 'Retry saving')
                      : isConceptOnly
                        ? text('Entendi, Continuar', 'Got it, continue')
                        : text('Verificar', 'Check')}
              </span>
              {!isVerifying && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
