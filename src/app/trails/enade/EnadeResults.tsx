'use client';
import { RotateCcw } from 'lucide-react';
import {
  formatDuration,
  gradeSession,
  SECTION_LABELS,
  type EnadeSession,
} from '@/lib/enade/simulator';
import type { QuestionPresentation } from '@/lib/enade/feedback';
import { EnadePageViewer } from './EnadePageViewer';
import { QuestionExplanation, type QuestionStudyAids } from './_components/QuestionExplanation';
import styles from './EnadeCourse.module.css';

export function EnadeResults({
  session,
  result,
  questions,
  onRepeat,
  onReview,
  repeating = false,
  repeatError = '',
  aids = {},
}: {
  session: EnadeSession;
  result: ReturnType<typeof gradeSession>;
  questions: QuestionPresentation[];
  onRepeat: (wrongOnly: boolean) => void;
  onReview: (index: number) => void;
  repeating?: boolean;
  repeatError?: string;
  aids?: Record<string, QuestionStudyAids>;
}) {
  const bySection = (['general', 'specific'] as const)
    .map((section) => {
      const scored = questions.filter(
        (q) => q.section === section && q.kind === 'objective' && !q.annulled
      );
      return {
        section,
        label: SECTION_LABELS[section],
        total: scored.length,
        correct: scored.filter((q) => q.feedback === 'correct').length,
      };
    })
    .filter((part) => part.total > 0);
  return (
    <section className={styles.results} aria-labelledby="results-title">
      <h2 id="results-title">Resultado do simulado</h2>
      {session.finishReason === 'timeout' && (
        <p className={styles.notice}>
          O tempo terminou. As objetivas em branco foram contadas como erro.
        </p>
      )}
      <dl className={styles.resultMetrics}>
        <div>
          <dt>Nota nas objetivas</dt>
          <dd>
            {result.total
              ? `${(result.percent / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/10`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Acertos / erros</dt>
          <dd>
            {result.correct} / {result.errors}
          </dd>
        </div>
        <div>
          <dt>Tempo total</dt>
          <dd>{formatDuration(result.elapsedMs)}</dd>
        </div>
        <div>
          <dt>Média por questão</dt>
          <dd>{formatDuration(result.averageMs)}</dd>
        </div>
      </dl>
      {bySection.length > 1 && (
        <ul className={styles.sectionBreakdown} aria-label="Acertos por parte da prova">
          {bySection.map((part) => (
            <li key={part.section}>
              <span>{part.label}</span>
              <strong>
                {part.correct}/{part.total}
              </strong>
              <span
                className={styles.sectionMeter}
                aria-hidden="true"
                style={
                  {
                    '--value': `${part.total ? (part.correct / part.total) * 100 : 0}%`,
                  } as React.CSSProperties
                }
              />
            </li>
          ))}
        </ul>
      )}
      <p className={styles.muted}>
        {result.correct} de {result.total} questões válidas · {result.percent}% de acerto.{' '}
        {result.unanswered} objetivas em branco. Discursivas e anuladas não entram na nota
        automática. Os comentários são material de estudo independente; o gabarito é do Inep.
      </p>
      <div className={styles.resultActions}>
        <button className={styles.startButton} disabled={repeating} onClick={() => onRepeat(false)}>
          <RotateCcw size={17} />
          Refazer com a mesma configuração
        </button>
        <button
          className={styles.secondaryButton}
          disabled={repeating || !result.wrongIds.length}
          onClick={() => onRepeat(true)}
        >
          Refazer só as que errei ({result.errors})
        </button>
      </div>
      <p className={styles.muted}>
        Cada refação vira uma nova tentativa no histórico; esta continua salva como está.
      </p>
      {repeatError && (
        <p className={styles.notice} role="alert">
          {repeatError}
        </p>
      )}
      <h3 className={styles.correctionHeading}>Correção comentada</h3>
      <ol className={styles.resultList}>
        {questions.map((q, index) => (
          <li key={q.id}>
            <details>
              <summary>
                <span className={styles.resultNumber}>{index + 1}</span>
                <span>
                  Enade {q.year} · {q.kind === 'discursive' ? 'Discursiva' : 'Questão'} {q.number}
                  <small>
                    {SECTION_LABELS[q.section]} ·{' '}
                    {q.feedback === 'correct'
                      ? 'Correta'
                      : q.feedback === 'incorrect'
                        ? 'Incorreta'
                        : q.feedback === 'blank'
                          ? 'Em branco · conta como erro'
                          : q.feedback === 'annulled'
                            ? 'Anulada'
                            : 'Autoavaliação'}
                  </small>
                </span>
              </summary>
              <div className={styles.resultDetail}>
                {q.kind === 'objective' && !q.annulled ? (
                  <>
                    <p>
                      <strong>Sua resposta:</strong>{' '}
                      {q.userLetter
                        ? `${q.userLetter} · ${q.options.find((o) => o.selected)?.text || 'Diagrama'}`
                        : 'Em branco'}
                    </p>
                    <p>
                      <strong>Resposta correta:</strong> {q.answerLetter} ·{' '}
                      {q.correctOption?.text || 'Diagrama'}
                    </p>
                    {q.correctOption?.image && (
                      <div className={styles.resultDiagram}>
                        <EnadePageViewer
                          {...q.correctOption.image}
                          year={q.year}
                          label={`${q.correctOption.text ? 'Imagem' : 'Diagrama'} da resposta correta da questão ${q.number}`}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  q.kind === 'discursive' && (
                    <p className={styles.discursiveResult}>
                      <strong>Sua resposta:</strong>
                      {'\n'}
                      {q.selected || 'Em branco'}
                    </p>
                  )
                )}
                <QuestionExplanation question={q} aids={aids[q.id]} />
                <div className={styles.resultDetailActions}>
                  <button className={styles.secondaryButton} onClick={() => onReview(index)}>
                    Ver questão completa
                  </button>
                  <a
                    href={`/enade/${q.year}/${q.kind === 'discursive' ? 'padrao-resposta' : 'gabarito'}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {q.kind === 'discursive' ? 'Padrão oficial' : 'Gabarito oficial'}
                  </a>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
