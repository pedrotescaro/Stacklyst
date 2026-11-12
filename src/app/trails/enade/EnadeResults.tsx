'use client';
import { RotateCcw } from 'lucide-react';
import { formatDuration, gradeSession, type EnadeSession } from '@/lib/enade/simulator';
import type { QuestionPresentation } from '@/lib/enade/feedback';
import { EnadePageViewer } from './EnadePageViewer';
import styles from './EnadeCourse.module.css';

export function EnadeResults({
  session,
  result,
  questions,
  onRepeat,
  onReview,
}: {
  session: EnadeSession;
  result: ReturnType<typeof gradeSession>;
  questions: QuestionPresentation[];
  onRepeat: (wrongOnly: boolean) => void;
  onReview: (index: number) => void;
}) {
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
      <p className={styles.muted}>
        {result.correct} de {result.total} questões válidas · {result.percent}% de acerto.{' '}
        {result.unanswered} objetivas em branco. Discursivas e anuladas não entram na nota
        automática. Os comentários são material de estudo independente; o gabarito é do Inep.
      </p>
      <div className={styles.resultActions}>
        <button className={styles.startButton} onClick={() => onRepeat(false)}>
          <RotateCcw size={17} />
          Refazer com a mesma configuração
        </button>
        <button
          className={styles.secondaryButton}
          disabled={!result.wrongIds.length}
          onClick={() => onRepeat(true)}
        >
          Refazer só as que errei ({result.errors})
        </button>
      </div>
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
                          src={q.correctOption.image.src}
                          year={q.year}
                          page={q.correctOption.image.page}
                          label={`Diagrama da resposta correta da questão ${q.number}`}
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
                <p>{q.explanation}</p>
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
