'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock3, ExternalLink } from 'lucide-react';
import catalog from '@/lib/enade/exams.json';
import {
  gradeEnade,
  type EnadeAttempt,
  type EnadeExam,
  type EnadeQuestionContent,
} from '@/lib/enade/types';
import { useEnadeProgress } from './useEnadeProgress';
import { EnadePageViewer } from './EnadePageViewer';
import styles from './EnadeCourse.module.css';
function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
export function EnadeSimulation({
  userId,
  year,
  initialAttempt,
}: {
  userId: string;
  year: number;
  initialAttempt?: EnadeAttempt;
}) {
  const exam = catalog.find((e) => e.year === year) as EnadeExam;
  const { attempts, ready, saveStatus, save } = useEnadeProgress(
    userId,
    initialAttempt ? { [year]: initialAttempt } : {}
  );
  const attempt = attempts[year];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [contents, setContents] = useState<EnadeQuestionContent[]>([]);
  const [pageError, setPageError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirmFinish, setConfirmFinish] = useState(false);
  const questionStart = useRef<HTMLElement>(null);
  const initializing = useRef(false);
  const finished = Boolean(attempt?.finishedAt);
  const question = exam.questions[questionIndex];
  const content = contents.find((item) => item.id === question.id);
  const answered = exam.questions.filter((q) => attempt?.answers[q.id]?.trim()).length;
  const remaining = attempt
    ? Math.max(0, exam.durationMinutes * 60 - (now - attempt.startedAt) / 1000)
    : 0;
  useEffect(() => {
    if (!ready || attempt || initializing.current) return;
    initializing.current = true;
    const stamp = Date.now();
    setNow(stamp);
    void save(year, {
      answers: {},
      marked: [],
      startedAt: stamp,
      updatedAt: stamp,
      finishedAt: null,
    });
  }, [ready, attempt, save, year]);
  useEffect(() => {
    if (!year) return;
    const controller = new AbortController();
    setContents([]);
    setPageError(false);
    void fetch(`/enade/${year}/questions.json`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error('pages');
        const content = (await r.json()) as EnadeQuestionContent[];
        if (!Array.isArray(content) || content.length !== exam.questions.length)
          throw new Error('questions');
        if (!controller.signal.aborted) setContents(content);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPageError(true);
      });
    return () => controller.abort();
  }, [year, retry, exam.questions.length]);

  useEffect(() => {
    if (!exam || !year || finished) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [exam, year, finished]);

  function updateAttempt(next: EnadeAttempt) {
    if (!year) return;
    void save(year, next);
  }

  useEffect(() => {
    if (ready && year && attempt && !finished && remaining <= 0) {
      const next = { ...attempt, finishedAt: Date.now(), updatedAt: Date.now() };
      void save(year, next);
    }
  }, [ready, year, attempt, finished, remaining, save]);

  function selectQuestion(index: number) {
    setQuestionIndex(index);
    setConfirmFinish(false);
    questionStart.current?.scrollIntoView?.({ block: 'start' });
  }
  const result = attempt ? gradeEnade(exam, attempt.answers) : null;
  if (!ready || !attempt)
    return (
      <main className={`${styles.main} ${styles.activity}`}>
        <p role="status">Preparando simulado...</p>
      </main>
    );
  return (
    <main className={`${styles.main} ${styles.activity}`}>
      <header className={styles.activityHeader}>
        <Link className={styles.exit} href="/trails/enade" aria-label="Todas as edições">
          <ArrowLeft size={22} />
        </Link>
        <div className={styles.progressSummary}>
          <div className={styles.progressCaption}>
            <span>Simulado {exam.year}</span>
            <span>
              {answered}/{exam.questions.length} respondidas
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Progresso do simulado"
            aria-valuemin={0}
            aria-valuemax={exam.questions.length}
            aria-valuenow={answered}
            aria-valuetext={`${answered} de ${exam.questions.length} questões respondidas`}
            className={styles.progressTrack}
          >
            <div style={{ width: `${(answered / exam.questions.length) * 100}%` }} />
          </div>
        </div>
        <span
          className={styles.timer}
          aria-label={finished ? 'Simulado concluído' : 'Tempo restante'}
        >
          <Clock3 size={17} aria-hidden="true" />
          {finished ? 'Concluído' : clock(remaining)}
        </span>
      </header>
      <div className={styles.sessionHeader}>
        <div>
          <p className={styles.eyebrow}>Enade · Análise e Desenvolvimento de Sistemas</p>
          <h1>Simulado {exam.year}</h1>
        </div>
        <p className={styles.muted}>
          {finished
            ? 'Revise suas respostas e o gabarito.'
            : 'Responda no seu ritmo. A correção aparece ao finalizar.'}
        </p>
      </div>
      {finished && result && (
        <section className={styles.result} aria-label="Resultado do simulado">
          <h2>{result.percent}% de acerto nas objetivas</h2>
          <p>
            {result.correct} de {result.total} questões válidas. Anuladas e discursivas não entram
            nessa porcentagem.
          </p>
          <a href={`/enade/${exam.year}/padrao-resposta.pdf`} target="_blank" rel="noreferrer">
            Revisar as discursivas com o padrão oficial <ExternalLink size={14} />
          </a>
        </section>
      )}
      <div className={styles.activityNavigation}>
        <label htmlFor="enade-question">Questão</label>
        <select
          id="enade-question"
          value={questionIndex}
          onChange={(event) => selectQuestion(Number(event.target.value))}
        >
          {exam.questions.map((q, index) => (
            <option key={q.id} value={index}>
              {index + 1}/{exam.questions.length} ·{' '}
              {q.kind === 'discursive' ? 'Discursiva' : 'Objetiva'} {q.number}
              {attempt.answers[q.id]?.trim() ? ' · Respondida' : ''}
            </option>
          ))}
        </select>
        <a
          className={styles.originalLink}
          href={`/enade/${exam.year}/prova.pdf#page=${question.page}`}
          target="_blank"
          rel="noreferrer"
        >
          Caderno original <ExternalLink size={14} />
        </a>
      </div>
      <article ref={questionStart} className={styles.question} aria-labelledby="question-title">
        <div className={styles.questionHeading}>
          <div>
            <p className={styles.eyebrow}>
              {question.section === 'general' ? 'Formação geral' : 'Componente específico'}
            </p>
            <h2 id="question-title">
              {question.kind === 'discursive' ? 'Discursiva' : 'Questão'} {question.number}
            </h2>
          </div>
          <span className={styles.questionCounter}>
            {questionIndex + 1} de {exam.questions.length}
          </span>
        </div>
        {question.annulled && (
          <p className={styles.notice}>Anulada pelo Inep. Não conta na correção.</p>
        )}
        {pageError ? (
          <div className={styles.loadError} role="alert">
            <p>Não foi possível carregar a questão. Suas respostas continuam salvas.</p>
            <button className={styles.primary} onClick={() => setRetry((n) => n + 1)}>
              Tentar novamente
            </button>
          </div>
        ) : !content ? (
          <p role="status" className={styles.loading}>
            Carregando questão...
          </p>
        ) : (
          <>
            <section className={styles.questionImages} aria-label="Imagem da questão">
              {content.images.map((image, index) => (
                <div key={image.src} className={styles.paper}>
                  <EnadePageViewer
                    src={image.src}
                    year={exam.year}
                    page={image.page}
                    label={`${question.kind === 'discursive' ? 'Discursiva' : 'Questão'} ${question.number}${content.images.length > 1 ? ` · parte ${index + 1}` : ''}`}
                  />
                </div>
              ))}
            </section>
            <section className={styles.statement} aria-labelledby="statement-title">
              <h3 id="statement-title">Enunciado</h3>
              <p>{content.statement}</p>
              <details className={styles.transcript}>
                <summary>Ler texto completo da questão</summary>
                <p>
                  Texto extraído do caderno. Consulte a imagem para conferir fórmulas, símbolos e
                  diagramas.
                </p>
                <pre>{content.transcript}</pre>
              </details>
            </section>
            <section className={styles.response} aria-label="Resposta da questão">
              {question.kind === 'objective' ? (
                <fieldset>
                  <legend>Escolha uma alternativa</legend>
                  <div
                    className={styles.alternatives}
                    data-compact={content.options.every(
                      (option) => option.text.length < 120 && !option.code && !option.image
                    )}
                  >
                    {content.options.map((option) => {
                      const selected = attempt.answers[question.id] === option.letter;
                      const correction =
                        finished && !question.annulled
                          ? option.letter === question.answer
                            ? 'correct'
                            : selected
                              ? 'incorrect'
                              : undefined
                          : undefined;
                      const id = `${question.id}-${option.letter}`;
                      return (
                        <div
                          key={option.letter}
                          className={styles.alternative}
                          data-selected={selected}
                          data-correction={correction}
                        >
                          <input
                            id={id}
                            type="radio"
                            name={question.id}
                            value={option.letter}
                            disabled={finished || question.annulled}
                            checked={selected}
                            onChange={() =>
                              updateAttempt({
                                ...attempt,
                                answers: { ...attempt.answers, [question.id]: option.letter },
                                updatedAt: Date.now(),
                              })
                            }
                          />
                          <label htmlFor={id}>
                            <span className={styles.optionLetter}>{option.letter}</span>{' '}
                            <span className={option.code ? styles.codeOption : styles.optionText}>
                              {option.text || `Diagrama da alternativa ${option.letter}`}
                              {correction && (
                                <>
                                  {' '}
                                  <span className={styles.correctionLabel}>
                                    {correction === 'correct' ? 'Resposta correta' : 'Sua resposta'}
                                  </span>
                                </>
                              )}
                            </span>
                            {selected && (
                              <Check
                                className={styles.selectedCheck}
                                size={18}
                                aria-hidden="true"
                              />
                            )}
                          </label>
                          {option.image && (
                            <div className={styles.optionImage}>
                              <EnadePageViewer
                                src={option.image.src}
                                year={year}
                                page={option.image.page}
                                label={`Diagrama da alternativa ${option.letter} da questão ${question.number}`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                    readOnly={finished || question.annulled}
                    placeholder="Desenvolva sua resposta aqui..."
                    value={attempt.answers[question.id] || ''}
                    onChange={(event) =>
                      updateAttempt({
                        ...attempt,
                        answers: { ...attempt.answers, [question.id]: event.target.value },
                        updatedAt: Date.now(),
                      })
                    }
                  />
                </>
              )}
              {finished && question.answer && !question.annulled && (
                <p className={styles.notice}>
                  Sua resposta: {attempt.answers[question.id] || 'Em branco'} · Gabarito:{' '}
                  <strong>{question.answer}</strong>
                </p>
              )}
              {finished && question.kind === 'discursive' && !question.annulled && (
                <p className={styles.notice}>
                  Compare sua resposta com o padrão oficial disponível no resultado.
                </p>
              )}
            </section>
          </>
        )}
        <div className={styles.questionNav}>
          <button disabled={questionIndex === 0} onClick={() => selectQuestion(questionIndex - 1)}>
            <ChevronLeft size={18} /> Anterior
          </button>
          <button
            className={styles.nextQuestion}
            disabled={questionIndex === exam.questions.length - 1}
            onClick={() => selectQuestion(questionIndex + 1)}
          >
            Próxima <ChevronRight size={18} />
          </button>
        </div>
      </article>
      <footer className={styles.sessionFooter}>
        <div>
          <p className={styles.saveStatus} role="status">
            {saveStatus}
          </p>
          <button className={styles.back} onClick={() => void save(year, attempt, true)}>
            Salvar novamente
          </button>
        </div>
        {!finished && (
          <button className={styles.finishButton} onClick={() => setConfirmFinish(true)}>
            Finalizar simulado <Check size={16} />
          </button>
        )}
        {confirmFinish && !finished && (
          <div className={styles.confirm}>
            <p>
              Finalizar e conferir o gabarito? Há {exam.questions.length - answered} respostas em
              branco.
            </p>
            <button
              className={styles.primary}
              onClick={() => {
                void save(
                  year,
                  { ...attempt, finishedAt: Date.now(), updatedAt: Date.now() },
                  true
                );
                setConfirmFinish(false);
              }}
            >
              Finalizar e corrigir
            </button>
            <button onClick={() => setConfirmFinish(false)}>Continuar respondendo</button>
          </div>
        )}
      </footer>
    </main>
  );
}
