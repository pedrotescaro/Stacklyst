'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Crown, Star } from 'lucide-react';
import type { Lesson, LessonSessionState } from '@/lib/lessons/types';
import styles from './LessonSummary.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface LessonSummaryProps {
  lesson: Lesson;
  sessionState: LessonSessionState;
  /** 1 to 3 for game-mode lessons; null keeps the classic summary. */
  stars?: 1 | 2 | 3 | null;
  onFinish: () => void;
}

/** Counts up to the earned XP so the reward feels earned. */
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function LessonSummary({
  lesson,
  sessionState,
  stars = null,
  onFinish,
}: LessonSummaryProps) {
  const { text } = useLocalizedText();
  const totalAttempts = sessionState.correctAnswersCount + sessionState.wrongAnswersCount;
  const accuracy =
    totalAttempts > 0 ? Math.round((sessionState.correctAnswersCount / totalAttempts) * 100) : 100;
  const xp = useCountUp(sessionState.earnedXp);
  const [elapsed] = useState(() => Date.now() - sessionState.startedAt);
  const boss = lesson.mode?.kind === 'boss';

  const headline = boss
    ? text('Chefão derrotado!', 'Boss defeated!')
    : stars === 3
      ? text('Perfeito!', 'Perfect!')
      : stars === 2
        ? text('Mandou bem!', 'Nicely done!')
        : text('Lição Concluída!', 'Lesson Complete!');

  return (
    <section className={styles.summary} data-boss={boss ? 'true' : undefined}>
      {boss ? (
        <div className={styles.bossTrophy} aria-hidden="true">
          <Crown size={64} />
        </div>
      ) : (
        <Image
          src="/assets/trails/devdeck-robot-victory.png"
          alt={text(
            'Mascote comemorando a conclusão da lição',
            'Mascot celebrating the lesson completion'
          )}
          width={136}
          height={136}
          className={styles.mascot}
          priority
        />
      )}
      {stars !== null && (
        <div
          className={styles.stars}
          role="img"
          aria-label={text(`${stars} de 3 estrelas`, `${stars} of 3 stars`)}
        >
          {[1, 2, 3].map((index) => (
            <Star
              key={index}
              aria-hidden="true"
              className={index <= stars ? styles.starEarned : styles.starEmpty}
              style={{ animationDelay: `${index * 220}ms` }}
              size={index === 2 ? 52 : 42}
            />
          ))}
        </div>
      )}
      <h1>{headline}</h1>
      <p className={styles.description}>
        {text('Você concluiu as atividades de', 'You completed the activities of')}{' '}
        <strong>{lesson.title}</strong>.
        {stars !== null && stars < 3 && (
          <>
            {' '}
            {text(
              'Refaça sem errar para conquistar as 3 estrelas.',
              'Replay without mistakes to earn all 3 stars.'
            )}
          </>
        )}
      </p>
      <p className={styles.reward}>
        <CheckCircle2 size={21} aria-hidden="true" /> +{xp} XP
      </p>
      <dl className={styles.stats}>
        <div>
          <dt>{text('Precisão', 'Accuracy')}</dt>
          <dd>{accuracy}%</dd>
        </div>
        <div>
          <dt>{text('Maior Combo', 'Best Combo')}</dt>
          <dd>{sessionState.maxCombo}×</dd>
        </div>
        <div>
          <dt>{stars !== null ? text('Tempo', 'Time') : text('Acertos', 'Correct')}</dt>
          <dd>{stars !== null ? formatDuration(elapsed) : sessionState.correctAnswersCount}</dd>
        </div>
      </dl>
      <button type="button" onClick={onFinish} className={styles.finish}>
        {text('Voltar para a Trilha', 'Back to the Trail')}{' '}
        <ArrowRight size={19} aria-hidden="true" />
      </button>
      <Link
        href="/certificates"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-dd-accent underline-offset-4 hover:underline"
      >
        {text('Ver badges e certificados', 'View badges and certificates')}
      </Link>
    </section>
  );
}
