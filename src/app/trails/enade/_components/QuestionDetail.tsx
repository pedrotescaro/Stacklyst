'use client';
import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { EnadeQuestionContent } from '@/lib/enade/types';
import { createSession, finishSession, QUESTION_BY_ID } from '@/lib/enade/simulator';
import { focusedConfig } from '@/lib/enade/attempts';
import { questionPresentation } from '@/lib/enade/feedback';
import type { QuestionStudyAids } from '@/lib/enade/insights';
import { EnadePageViewer } from '../EnadePageViewer';
import { EnadeStatement } from '../EnadeStatement';
import { QuestionExplanation } from './QuestionExplanation';
import styles from '../EnadeCourse.module.css';
import ui from './ui.module.css';

/** Read-only view of an official question with the commented answer behind a reveal. */
export function QuestionDetail({
  questionId,
  aids,
}: {
  questionId: string;
  aids: QuestionStudyAids;
}) {
  const question = QUESTION_BY_ID.get(questionId)!;
  const [content, setContent] = useState<EnadeQuestionContent | null>(null);
  const [error, setError] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [retries, setRetries] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/enade/${question.year}/questions.json`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('content'))))
      .then((list: EnadeQuestionContent[]) => {
        const match = list.find((q) => q.id === questionId);
        if (!match) throw new Error('content');
        if (!controller.signal.aborted) setContent(match);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [question.year, questionId, retries]);
  const presentation = useMemo(() => {
    if (question.annulled) return null;
    const session = finishSession(
      createSession(focusedConfig([questionId], 'exam'), 0, 1, [questionId]),
      2
    );
    return questionPresentation(session, question, content ?? undefined);
  }, [question, questionId, content]);
  if (error) {
    return (
      <div>
        <p className={ui.error} role="alert">
          Não foi possível carregar a questão.
        </p>
        <button
          type="button"
          className={ui.secondary}
          onClick={() => {
            setError(false);
            setRetries(retries + 1);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  if (!content)
    return (
      <div aria-busy="true" style={{ display: 'grid', gap: 10 }}>
        <span className={ui.skeleton} style={{ height: 220 }} />
        <span className={ui.skeleton} style={{ height: 18, width: '70%' }} />
        <span className={ui.skeleton} style={{ height: 18, width: '55%' }} />
      </div>
    );
  return (
    <article className={styles.question} style={{ padding: 0 }}>
      {question.annulled && <p className={styles.notice}>Questão anulada pelo Inep.</p>}
      <section className={styles.questionImages} aria-label="Imagem da questão">
        {content.images.map((image, part) => (
          <div key={image.src} className={styles.paper}>
            <EnadePageViewer
              {...image}
              year={question.year}
              label={`${question.kind === 'discursive' ? 'Discursiva' : 'Questão'} ${question.number}${content.images.length > 1 ? ` · parte ${part + 1}` : ''}`}
            />
          </div>
        ))}
      </section>
      <EnadeStatement content={content} />
      {question.kind === 'objective' && (
        <ol className={styles.alternatives} style={{ listStyle: 'none' }}>
          {content.options.map((option) => {
            const correct = revealed && option.letter === question.answer;
            return (
              <li
                key={option.letter}
                className={styles.alternative}
                data-correction={correct ? 'correct' : undefined}
              >
                <div className={styles.optionDescription}>
                  <span className={styles.optionLetter}>{option.letter}</span>{' '}
                  <span className={option.code ? styles.codeOption : styles.optionText}>
                    {option.text || `Diagrama da alternativa ${option.letter}`}
                    {correct && <span className={styles.correctionLabel}> Resposta correta</span>}
                  </span>
                </div>
                {option.image && (
                  <div className={styles.optionImage}>
                    <EnadePageViewer
                      {...option.image}
                      year={question.year}
                      label={`Alternativa ${option.letter}`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {!question.annulled && (
        <div style={{ marginTop: 20 }}>
          {revealed && presentation ? (
            <div className={styles.feedback} data-feedback="correct">
              <h3>
                {question.kind === 'objective'
                  ? `Gabarito oficial: ${question.answer}`
                  : 'Padrão de resposta'}
              </h3>
              <QuestionExplanation question={presentation} aids={aids} />
              <a
                href={`/enade/${question.year}/${question.kind === 'discursive' ? 'padrao-resposta' : 'gabarito'}.pdf`}
                target="_blank"
                rel="noreferrer"
              >
                {question.kind === 'discursive'
                  ? 'Abrir padrão oficial do Inep'
                  : 'Consultar gabarito oficial do Inep'}
              </a>
            </div>
          ) : (
            <button type="button" className={ui.secondary} onClick={() => setRevealed(true)}>
              <Eye size={15} aria-hidden="true" /> Mostrar gabarito e correção comentada
            </button>
          )}
        </div>
      )}
    </article>
  );
}
