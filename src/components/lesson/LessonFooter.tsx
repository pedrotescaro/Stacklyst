'use client';

import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  LoaderCircle,
} from 'lucide-react';
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
              <h3>{isCorrect ? 'Mandou muito bem!' : 'Ops, não foi dessa vez!'}</h3>
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
            <Lightbulb size={18} aria-hidden="true" /> Ver Dica
          </button>
        ) : (
          <span className={styles.guidance}>
            {isConceptOnly
              ? 'Leia o conteúdo e avance quando estiver pronto.'
              : 'Responda à atividade para verificar sua solução.'}
          </span>
        )}
        <div className={styles.actions}>
          {answered && !isCorrect && onRetry && (
            <button type="button" onClick={onRetry} className={styles.secondaryButton}>
              <RotateCcw size={17} aria-hidden="true" /> Tentar Novamente
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
                ? 'Continuar'
                : isConceptOnly
                  ? 'Entendi, Continuar'
                  : isVerifying
                    ? 'Verificando…'
                    : 'Verificar'}
            </span>
            {!isVerifying && <ArrowRight size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </footer>
  );
}
