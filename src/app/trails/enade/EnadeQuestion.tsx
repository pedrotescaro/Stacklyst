'use client';
import { Check, Flag } from 'lucide-react';
import type { QuestionPresentation } from '@/lib/enade/feedback';
import { EnadePageViewer } from './EnadePageViewer';
import styles from './EnadeCourse.module.css';

export function EnadeQuestion({
  question: q,
  index,
  total,
  onAnswer,
  onMark,
  onCheckDiscursive,
}: {
  question: QuestionPresentation;
  index: number;
  total: number;
  onAnswer: (id: string, value: string) => void;
  onMark: (id: string) => void;
  onCheckDiscursive: () => void;
}) {
  if (!q.content) return null;
  return (
    <>
      <div className={styles.questionHeading}>
        <div>
          <h2 id="question-title">
            {q.kind === 'discursive' ? 'Discursiva' : 'Questão'} {q.number}{' '}
            <span className={styles.editionLabel}>· Enade {q.year}</span>
          </h2>
          <p className={styles.muted}>
            {q.section === 'general' ? 'Formação geral' : 'Componente específico'}
          </p>
        </div>
        <span className={styles.questionCounter}>
          {index + 1} de {total}
        </span>
      </div>
      <button
        className={styles.reviewButton}
        aria-pressed={q.marked}
        onClick={() => onMark(q.id)}
        disabled={q.readOnly}
      >
        <Flag size={16} />
        {q.marked ? 'Marcada para revisão' : 'Marcar para revisar'}
      </button>
      {q.annulled && <p className={styles.notice}>Anulada pelo Inep. Não conta na correção.</p>}
      <section className={styles.questionImages} aria-label="Imagem da questão">
        {q.content.images.map((image, part) => (
          <div key={image.src} className={styles.paper}>
            <EnadePageViewer
              src={image.src}
              year={q.year}
              page={image.page}
              label={`${q.kind === 'discursive' ? 'Discursiva' : 'Questão'} ${q.number}${q.content!.images.length > 1 ? ` · parte ${part + 1}` : ''}`}
            />
          </div>
        ))}
      </section>
      <section className={styles.statement} aria-labelledby="statement-title">
        <h3 id="statement-title">Enunciado</h3>
        <p>{q.content.statement}</p>
        <details className={styles.transcript}>
          <summary>Ler texto completo da questão</summary>
          <p>
            Texto extraído do caderno. Consulte a imagem para conferir fórmulas, símbolos e
            diagramas.
          </p>
          <pre>{q.content.transcript}</pre>
        </details>
      </section>
      <section className={styles.response} aria-label="Resposta da questão">
        {q.kind === 'objective' ? (
          <fieldset>
            <legend>Escolha uma alternativa</legend>
            <div
              className={styles.alternatives}
              data-compact={q.options.every((o) => o.text.length < 120 && !o.code && !o.image)}
            >
              {q.options.map((option) => (
                <div
                  key={option.canonical}
                  className={styles.alternative}
                  data-selected={option.selected}
                  data-correction={option.correction}
                >
                  <input
                    id={`${q.id}-${option.canonical}`}
                    type="radio"
                    name={q.id}
                    value={option.canonical}
                    disabled={option.disabled}
                    checked={option.selected}
                    onChange={() => onAnswer(q.id, option.canonical)}
                  />
                  <label htmlFor={`${q.id}-${option.canonical}`}>
                    <span className={styles.optionLetter}>{option.letter}</span>{' '}
                    <span className={option.code ? styles.codeOption : styles.optionText}>
                      {option.text || `Diagrama da alternativa ${option.letter}`}
                      {option.correction && (
                        <>
                          {' '}
                          <span className={styles.correctionLabel}>
                            {option.correction === 'correct' ? 'Resposta correta' : 'Sua resposta'}
                          </span>
                        </>
                      )}
                    </span>
                    {option.selected && (
                      <Check className={styles.selectedCheck} size={18} aria-hidden="true" />
                    )}
                  </label>
                  {option.image && (
                    <div className={styles.optionImage}>
                      <EnadePageViewer
                        src={option.image.src}
                        year={q.year}
                        page={option.image.page}
                        label={`Diagrama da alternativa ${option.letter} da questão ${q.number}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        ) : (
          <>
            <label className={styles.answerLabel} htmlFor="discursive-answer">
              Escreva sua resposta
            </label>
            <textarea
              id="discursive-answer"
              maxLength={10000}
              rows={8}
              readOnly={q.readOnly}
              placeholder="Desenvolva sua resposta aqui..."
              value={q.selected || ''}
              onChange={(event) => onAnswer(q.id, event.target.value)}
            />
            {q.showDiscursiveCheck && (
              <button className={styles.secondaryButton} onClick={onCheckDiscursive}>
                Conferir padrão de resposta
              </button>
            )}
          </>
        )}
        {q.reveal && (
          <div className={styles.feedback} data-feedback={q.feedback} role="status">
            <h3>
              {q.feedback === 'correct'
                ? 'Você acertou'
                : q.feedback === 'incorrect'
                  ? 'Resposta incorreta'
                  : q.feedback === 'blank'
                    ? 'Questão em branco'
                    : q.feedback === 'annulled'
                      ? 'Questão anulada'
                      : 'Autoavaliação da discursiva'}
            </h3>
            {q.kind === 'objective' && !q.annulled && (
              <p>
                Sua resposta: {q.userLetter || 'Em branco'} · Gabarito:{' '}
                <strong>{q.answerLetter}</strong>
              </p>
            )}
            <p>{q.explanation}</p>
            <a
              href={`/enade/${q.year}/${q.kind === 'discursive' ? 'padrao-resposta' : 'gabarito'}.pdf`}
              target="_blank"
              rel="noreferrer"
            >
              {q.kind === 'discursive'
                ? 'Abrir padrão oficial do Inep'
                : 'Consultar gabarito oficial do Inep'}
            </a>
          </div>
        )}
      </section>
    </>
  );
}
