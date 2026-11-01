'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Lesson, LessonSessionState } from '@/lib/lessons/types';
import styles from './LessonSummary.module.css';

interface LessonSummaryProps {
  lesson: Lesson;
  sessionState: LessonSessionState;
  onFinish: () => void;
}

export function LessonSummary({ lesson, sessionState, onFinish }: LessonSummaryProps) {
  const totalAttempts = sessionState.correctAnswersCount + sessionState.wrongAnswersCount;
  const accuracy =
    totalAttempts > 0 ? Math.round((sessionState.correctAnswersCount / totalAttempts) * 100) : 100;

  return (
    <section className={styles.summary}>
      <Image
        src="/assets/trails/devdeck-robot-victory.png"
        alt="Mascote comemorando a conclusão da lição"
        width={136}
        height={136}
        className={styles.mascot}
        priority
      />
      <h1>Lição Concluída!</h1>
      <p className={styles.description}>
        Você concluiu as atividades de <strong>{lesson.title}</strong>.
      </p>
      <p className={styles.reward}>
        <CheckCircle2 size={21} aria-hidden="true" /> +{sessionState.earnedXp} XP
      </p>
      <dl className={styles.stats}>
        <div>
          <dt>Precisão</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>Maior Combo</dt>
          <dd>{sessionState.maxCombo}×</dd>
        </div>
        <div>
          <dt>Acertos</dt>
          <dd>{sessionState.correctAnswersCount}</dd>
        </div>
      </dl>
      <button type="button" onClick={onFinish} className={styles.finish}>
        Voltar para a Trilha <ArrowRight size={19} aria-hidden="true" />
      </button>
      <Link
        href="/certificates"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-dd-accent underline-offset-4 hover:underline"
      >
        Ver badges e certificados
      </Link>
    </section>
  );
}
