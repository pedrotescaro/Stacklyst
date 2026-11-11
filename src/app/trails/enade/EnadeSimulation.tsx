'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock3, ExternalLink } from 'lucide-react';
import catalog from '@/lib/enade/exams.json';
import { gradeEnade, type EnadeAttempt, type EnadeExam } from '@/lib/enade/types';
import { useEnadeProgress } from './useEnadeProgress';
import { EnadePageViewer } from './EnadePageViewer';
import styles from './EnadeCourse.module.css';
type Page = { image: string; text: string };
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
  const [pageNumber, setPageNumber] = useState(exam.questions[0].page);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageError, setPageError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'paper' | 'answers'>('paper');
  const initializing = useRef(false);
  const finished = Boolean(attempt?.finishedAt);
  const question = exam.questions[questionIndex];
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
    setPages([]);
    setPageError(false);
    void fetch(`/enade/${year}/pages.json`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error('pages');
        const content = (await r.json()) as Page[];
        if (!controller.signal.aborted) setPages(content);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPageError(true);
      });
    return () => controller.abort();
  }, [year, retry]);

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
    setPageNumber(exam.questions[index].page);
    setMobilePanel('paper');
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
      <div className={styles.sessionHeader}>
        <div>
          <Link className={styles.back} href="/trails/enade">
            <ArrowLeft size={16} /> Todas as edições
          </Link>
          <h1>Simulado {exam.year}</h1>
        </div>
        <span className={styles.timer}>
          <Clock3 size={16} />
          {finished ? 'Concluído' : clock(remaining)}
        </span>
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
              {index + 1}/40 · {q.kind === 'discursive' ? 'Discursiva' : 'Objetiva'} {q.number}
            </option>
          ))}
        </select>
        <button
          className={styles.back}
          disabled={questionIndex === 0}
          onClick={() => selectQuestion(questionIndex - 1)}
          aria-label="Questão anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className={styles.back}
          disabled={questionIndex === 39}
          onClick={() => selectQuestion(questionIndex + 1)}
          aria-label="Próxima questão"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className={styles.activityTabs} aria-label="Área do simulado">
        <button aria-pressed={mobilePanel === 'paper'} onClick={() => setMobilePanel('paper')}>
          Caderno
        </button>
        <button aria-pressed={mobilePanel === 'answers'} onClick={() => setMobilePanel('answers')}>
          Respostas
        </button>
      </div>
      <div className={styles.workspace}>
        <section
          className={styles.paper}
          data-mobile-active={mobilePanel === 'paper'}
          aria-label="Caderno da prova"
        >
          <div className={styles.pageToolbar}>
            <button
              onClick={() => setPageNumber((n) => Math.max(1, n - 1))}
              disabled={pageNumber === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Página {pageNumber} de {exam.pageCount}
            </span>
            <button
              onClick={() => setPageNumber((n) => Math.min(exam.pageCount, n + 1))}
              disabled={pageNumber === exam.pageCount}
              aria-label="Próxima página"
            >
              <ChevronRight size={18} />
            </button>
            <a
              href={`/enade/${exam.year}/prova.pdf#page=${pageNumber}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir caderno original em outra aba"
            >
              <ExternalLink size={17} />
            </a>
          </div>
          {pageError ? (
            <p role="alert">
              Não foi possível carregar o caderno.{' '}
              <button onClick={() => setRetry((n) => n + 1)}>Tentar novamente</button>
            </p>
          ) : pages[pageNumber - 1] ? (
            <>
              <EnadePageViewer
                key={`${exam.year}:${pageNumber}`}
                src={pages[pageNumber - 1].image}
                year={exam.year}
                page={pageNumber}
              />
              <details className={styles.transcript}>
                <summary>Ler texto desta página</summary>
                <p>
                  A extração pode não representar fórmulas e diagramas. Confira esses elementos na
                  imagem ou no PDF original.
                </p>
                <pre>{pages[pageNumber - 1].text}</pre>
              </details>
            </>
          ) : (
            <p role="status" className={styles.loading}>
              Carregando caderno...
            </p>
          )}
        </section>
        <section
          className={styles.responsePanel}
          data-mobile-active={mobilePanel === 'answers'}
          aria-label="Resposta da questão"
        >
          <h2>Sua resposta</h2>
          <p className={styles.muted}>
            {Object.values(attempt?.answers || {}).filter(Boolean).length}/40 respondidas
          </p>
          {question && attempt && (
            <div className={styles.response}>
              <p className={styles.muted}>
                {question.section === 'general' ? 'Formação geral' : 'Componente específico'}
              </p>
              <h3>
                {question.kind === 'discursive' ? 'Discursiva' : 'Questão'} {question.number}
              </h3>
              {question.annulled && (
                <p className={styles.notice}>Anulada pelo Inep. Não conta na correção.</p>
              )}
              {question.kind === 'objective' ? (
                <fieldset disabled={finished || question.annulled}>
                  <legend className={styles.muted}>Marque a alternativa do caderno</legend>
                  <div className={styles.alternatives}>
                    {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                      <label key={letter} data-selected={attempt.answers[question.id] === letter}>
                        <input
                          type="radio"
                          name={question.id}
                          value={letter}
                          checked={attempt.answers[question.id] === letter}
                          onChange={() =>
                            updateAttempt({
                              ...attempt,
                              answers: { ...attempt.answers, [question.id]: letter },
                              updatedAt: Date.now(),
                            })
                          }
                        />
                        {letter}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <>
                  <label className={styles.muted} htmlFor="discursive-answer">
                    Escreva sua resposta
                  </label>
                  <textarea
                    id="discursive-answer"
                    maxLength={10000}
                    rows={8}
                    readOnly={finished}
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
              {finished && question.answer && (
                <p className={styles.notice}>
                  Sua resposta: {attempt.answers[question.id] || 'Em branco'} · Gabarito:{' '}
                  <strong>{question.answer}</strong>
                </p>
              )}
              <div className={styles.questionNav}>
                <button
                  disabled={questionIndex === 0}
                  onClick={() => selectQuestion(questionIndex - 1)}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button
                  disabled={questionIndex === 39}
                  onClick={() => selectQuestion(questionIndex + 1)}
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          <p className={styles.saveStatus} role="status">
            {saveStatus}
          </p>
          <button className={styles.back} onClick={() => void save(year, attempt, true)}>
            Salvar novamente
          </button>
          {!finished && (
            <button className={styles.primary} onClick={() => setConfirmFinish(true)}>
              Finalizar simulado <Check size={16} />
            </button>
          )}
          {confirmFinish && !finished && attempt && (
            <div className={styles.confirm}>
              <p>
                Finalizar e conferir o gabarito? Há{' '}
                {40 - Object.values(attempt.answers).filter(Boolean).length} respostas em branco.
              </p>
              <button
                className={styles.primary}
                onClick={() => {
                  updateAttempt({
                    ...attempt,
                    finishedAt: Date.now(),
                    updatedAt: Date.now(),
                  });
                  setConfirmFinish(false);
                }}
              >
                Finalizar e corrigir
              </button>
              <button onClick={() => setConfirmFinish(false)}>Continuar respondendo</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
