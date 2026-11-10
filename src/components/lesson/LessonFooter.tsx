'use client';

import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  LoaderCircle,
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
  onOpenHint?: () => void;
  onVerify: () => void;
  onContinue: () => void;
  onRetry?: () => void;
  canVerify: boolean;
  isVerifying?: boolean;
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
  onOpenHint,
  onVerify,
  onContinue,
  onRetry,
  canVerify,
  isVerifying = false,
}: LessonFooterProps) {
  const { text } = useLocalizedText();
  return (
    <footer className={styles.footer}>
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
          <button type="button" onClick={onOpenHint} className={styles.secondaryButton}>
            <Lightbulb size={18} aria-hidden="true" /> {text('Ver Dica', 'Show hint')}
          </button>
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
          {answered && !isCorrect && onRetry && (
            <button type="button" onClick={onRetry} className={styles.secondaryButton}>
              <RotateCcw size={17} aria-hidden="true" /> {text('Tentar Novamente', 'Try again')}
            </button>
          )}
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
                : isConceptOnly
                  ? text('Entendi, Continuar', 'Got it, continue')
                  : isVerifying
                    ? text('Verificando…', 'Checking…')
                    : text('Verificar', 'Check')}
            </span>
            {!isVerifying && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </footer>
  );
}
