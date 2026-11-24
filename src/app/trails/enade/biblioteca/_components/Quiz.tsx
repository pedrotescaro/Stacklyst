'use client';
import { useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import type { QuizItem } from '@/lib/enade/library/markdown';
import styles from './article.module.css';

/** Authored fixation quiz (not official INEP questions). The best score is saved. */
export function Quiz({
  slug,
  index,
  items,
  best,
}: {
  slug: string;
  index: number;
  items: QuizItem[];
  best?: { best: number | null; total: number | null };
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null));
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === items[i].answer).length;
  async function save(next: number[]) {
    setSaved('saving');
    try {
      const response = await fetch('/api/enade/library/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, quiz: { index, answers: next } }),
      });
      setSaved(response.ok ? 'saved' : 'error');
    } catch {
      setSaved('error');
    }
  }
  function choose(question: number, option: number) {
    if (answers[question] !== null) return;
    const next = answers.map((a, i) => (i === question ? option : a));
    setAnswers(next);
    if (next.every((a) => a !== null)) void save(next);
  }
  return (
    <section className={styles.quiz} aria-label="Miniquestionário de fixação">
      <p className={styles.quizHead}>
        <strong>Miniquestionário de fixação</strong>
        <span>
          Exercícios autorais da equipe Stacklyst
          {best?.best != null && best.total ? ` · seu melhor: ${best.best}/${best.total}` : ''}
        </span>
      </p>
      <ol className={styles.quizList}>
        {items.map((item, q) => {
          const chosen = answers[q];
          return (
            <li key={q}>
              <fieldset>
                <legend>{item.question}</legend>
                <div className={styles.quizOptions}>
                  {item.options.map((option, o) => {
                    const state =
                      chosen === null
                        ? undefined
                        : o === item.answer
                          ? 'correct'
                          : o === chosen
                            ? 'incorrect'
                            : undefined;
                    return (
                      <button
                        key={o}
                        type="button"
                        className={styles.quizOption}
                        data-state={state}
                        aria-pressed={chosen === o}
                        disabled={chosen !== null}
                        onClick={() => choose(q, o)}
                      >
                        <span className={styles.quizLetter}>{String.fromCharCode(65 + o)}</span>
                        <span>{option}</span>
                        {state === 'correct' && <Check size={16} aria-label="Correta" />}
                        {state === 'incorrect' && (
                          <X size={16} aria-label="Sua resposta, incorreta" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {chosen !== null && (
                  <p className={styles.quizExplain} role="status">
                    <strong>{chosen === item.answer ? 'Correto. ' : 'Não é essa. '}</strong>
                    {item.explanation}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      {done && (
        <p className={styles.quizResult} role="status">
          Você acertou {score} de {items.length}. {saved === 'saving' && 'Salvando resultado… '}
          {saved === 'saved' && 'Resultado salvo. '}
          {saved === 'error' && (
            <>
              Não foi possível salvar.{' '}
              <button type="button" onClick={() => void save(answers)}>
                Salvar novamente
              </button>{' '}
            </>
          )}
          <button
            type="button"
            disabled={saved === 'saving'}
            onClick={() => {
              setAnswers(items.map(() => null));
              setSaved('idle');
            }}
          >
            <RotateCcw size={14} aria-hidden="true" /> Refazer
          </button>
        </p>
      )}
    </section>
  );
}
