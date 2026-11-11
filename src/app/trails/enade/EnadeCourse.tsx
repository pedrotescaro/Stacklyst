'use client';

/* Official exam page renders retain diagrams, code and mathematical notation. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TrailCourseSelector, type TrailCourseOption } from '../TrailCourseSelector';
import type { TrailCourseCode } from '../TrailLanguageLogo';
import catalog from '@/lib/enade/exams.json';
import { gradeEnade, type EnadeAttempt, type EnadeExam } from '@/lib/enade/types';
import styles from './EnadeCourse.module.css';
import { EnadePageViewer } from './EnadePageViewer';

const exams = [...catalog].reverse() as EnadeExam[];
type Page = { image: string; text: string };
type Props = {
  user: { id: string; username: string; avatar_url: string | null; total_xp: number };
  courses: TrailCourseOption[];
  initialAttempts: Record<string, EnadeAttempt>;
};

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function EnadeCourse({ user, courses, initialAttempts }: Props) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(initialAttempts);
  const [year, setYear] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageError, setPageError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [saveStatus, setSaveStatus] = useState('');
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState<number | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'paper' | 'answers'>('paper');
  const pendingSave = useRef(Promise.resolve());
  const saveTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const saveRevision = useRef(0);
  const exam = exams.find((e) => e.year === year);
  const attempt = year ? attempts[year] : undefined;
  const question = exam?.questions[questionIndex];
  const finished = Boolean(attempt?.finishedAt);
  const remaining =
    exam && attempt ? Math.max(0, exam.durationMinutes * 60 - (now - attempt.startedAt) / 1000) : 0;

  const persist = useCallback(
    (edition: number, value: EnadeAttempt) => {
      try {
        localStorage.setItem(`enade-ads:${user.id}:${edition}`, JSON.stringify(value));
      } catch {
        /* Server saving remains available. */
      }
      setSaveStatus('Salvando...');
      const revision = ++saveRevision.current;
      const previous = saveTimers.current.get(edition);
      if (previous) clearTimeout(previous);
      const timer = setTimeout(
        () => {
          saveTimers.current.delete(edition);
          pendingSave.current = pendingSave.current
            .catch(() => {})
            .then(async () => {
              try {
                const response = await fetch(`/api/enade/${edition}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(value),
                });
                if (!response.ok) throw new Error('save');
                if (revision === saveRevision.current) setSaveStatus('Progresso salvo');
              } catch {
                if (revision === saveRevision.current)
                  setSaveStatus(
                    'Não foi possível sincronizar com a conta. Tente salvar novamente.'
                  );
              }
            });
        },
        value.finishedAt ? 0 : 700
      );
      saveTimers.current.set(edition, timer);
    },
    [user.id]
  );

  useEffect(() => {
    // Recover the latest local draft if a request was interrupted on navigation.
    setAttempts((current) => {
      const next = { ...current };
      for (const edition of exams) {
        try {
          const local = JSON.parse(
            localStorage.getItem(`enade-ads:${user.id}:${edition.year}`) || 'null'
          ) as EnadeAttempt | null;
          if (
            local &&
            typeof local.startedAt === 'number' &&
            typeof local.updatedAt === 'number' &&
            local.answers &&
            Array.isArray(local.marked) &&
            local.updatedAt > (next[edition.year]?.updatedAt || 0)
          )
            next[edition.year] = local;
        } catch {
          /* Ignore a damaged local draft. */
        }
      }
      return next;
    });
    // Enrolling in the course uses the same preferences as the other courses.
    void fetch('/api/trails/course-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activeLanguage: 'ENADE',
        startedLanguages: [
          ...new Set(
            courses
              .filter((c) => c.started)
              .map((c) => c.language)
              .concat('ENADE')
          ),
        ],
      }),
    }).catch(() => {});
  }, [user.id, courses]);

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
    setAttempts((current) => ({ ...current, [year]: next }));
    persist(year, next);
  }

  useEffect(() => {
    if (year && attempt && !finished && remaining <= 0) {
      const next = { ...attempt, finishedAt: Date.now(), updatedAt: Date.now() };
      setAttempts((current) => ({ ...current, [year]: next }));
      persist(year, next);
    }
  }, [year, attempt, finished, remaining, persist]);

  function openExam(edition: EnadeExam, restart = false) {
    if (!attempts[edition.year] || restart) {
      const value = {
        answers: {},
        marked: [],
        startedAt: Date.now(),
        finishedAt: null,
        updatedAt: Date.now(),
      };
      setAttempts((current) => ({ ...current, [edition.year]: value }));
      persist(edition.year, value);
    }
    setNow(Date.now());
    setQuestionIndex(0);
    setPageNumber(edition.questions[0].page);
    setYear(edition.year);
    setConfirmRestart(null);
    setConfirmFinish(false);
    setMobilePanel('paper');
  }

  function selectQuestion(index: number) {
    setQuestionIndex(index);
    setPageNumber(exam!.questions[index].page);
    setMobilePanel('paper');
  }

  async function selectCourse(language: TrailCourseCode) {
    if (language === 'ENADE') {
      setYear(null);
      return;
    }
    try {
      const response = await fetch('/api/trails/course-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeLanguage: language,
          startedLanguages: [
            ...new Set(
              courses
                .filter((c) => c.started)
                .map((c) => c.language)
                .concat(language, 'ENADE')
            ),
          ],
        }),
      });
      if (!response.ok) throw new Error('preferences');
      router.push(`/trails?view=map&language=${language}`);
    } catch {
      setSaveStatus('Não foi possível trocar de curso. Tente novamente.');
    }
  }

  const result = exam && attempt ? gradeEnade(exam, attempt.answers) : null;

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />
      <div className="dd-platform-body">
        <main className={`dd-platform-main ${styles.main}`}>
          <header className={styles.header}>
            <a href="/trails?view=map&language=JS" className={styles.back}>
              <ArrowLeft size={16} /> Trilhas
            </a>
            <TrailCourseSelector
              activeLanguage="ENADE"
              courses={courses}
              onSelectCourse={selectCourse}
            />
          </header>
          {!exam ? (
            <div className={styles.overview}>
              <img src="/enade/logo.png" alt="Enade" className={styles.logo} />
              <h1>Curso Enade · ADS</h1>
              <p className={styles.intro}>
                Prepare-se para o Enade de Análise e Desenvolvimento de Sistemas com as provas que
                já foram aplicadas.
              </p>
              <div className={styles.facts}>
                <span>
                  <BookOpen size={16} /> 5 edições · 200 questões
                </span>
                <span>
                  <Clock3 size={16} /> 4 horas por simulado
                </span>
              </div>
              <h2>Seu caminho de preparação</h2>
              <p className={styles.muted}>
                Escolha uma edição. Você pode começar por qualquer uma e retomar de onde parou.
              </p>
              <ol className={styles.path}>
                {exams.map((edition) => {
                  const saved = attempts[edition.year];
                  const summary = saved?.finishedAt ? gradeEnade(edition, saved.answers) : null;
                  return (
                    <li key={edition.year}>
                      <span className={`${styles.pathDot} ${summary ? styles.done : ''}`}>
                        {summary ? <Check size={20} /> : <BookOpen size={19} />}
                      </span>
                      <div className={styles.edition}>
                        <h3>Enade {edition.year}</h3>
                        <p>40 questões · Formação geral e componente específico</p>
                        {summary ? (
                          <p>
                            {summary.correct}/{summary.total} objetivas válidas · {summary.percent}%
                            de acerto
                          </p>
                        ) : saved ? (
                          <p>
                            {Object.values(saved.answers).filter(Boolean).length}/40 respondidas ·
                            Em andamento
                          </p>
                        ) : null}
                      </div>
                      <button className={styles.primary} onClick={() => openExam(edition)}>
                        {summary ? 'Revisar' : saved ? 'Continuar' : 'Iniciar'}
                        <ArrowRight size={16} />
                      </button>
                      {saved && (
                        <button
                          className={styles.iconButton}
                          aria-label={`Reiniciar simulado ${edition.year}`}
                          onClick={() => setConfirmRestart(edition.year)}
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      {confirmRestart === edition.year && (
                        <div className={styles.confirm}>
                          <p>Reiniciar substitui as respostas salvas desta edição.</p>
                          <button
                            className={styles.primary}
                            onClick={() => openExam(edition, true)}
                          >
                            Reiniciar
                          </button>
                          <button onClick={() => setConfirmRestart(null)}>Cancelar</button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className={styles.source}>
                Cadernos, gabaritos definitivos e padrões de resposta do{' '}
                <a
                  href="https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enade/provas-e-gabaritos"
                  target="_blank"
                  rel="noreferrer"
                >
                  Inep <ExternalLink size={12} />
                </a>
                . Preparação independente, sem vínculo com o Inep. As discursivas são revisadas pelo
                padrão oficial; a porcentagem de acertos não é a nota oficial do Enade.
              </p>
            </div>
          ) : (
            <div className={styles.session}>
              <div className={styles.sessionHeader}>
                <div>
                  <button className={styles.back} onClick={() => setYear(null)}>
                    <ArrowLeft size={16} /> Todas as edições
                  </button>
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
                    {result.correct} de {result.total} questões válidas. Anuladas e discursivas não
                    entram nessa porcentagem.
                  </p>
                  <a
                    href={`/enade/${exam.year}/padrao-resposta.pdf`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Revisar as discursivas com o padrão oficial <ExternalLink size={14} />
                  </a>
                </section>
              )}
              <div className={styles.mobileTabs} aria-label="Área do simulado">
                <button
                  aria-pressed={mobilePanel === 'paper'}
                  onClick={() => setMobilePanel('paper')}
                >
                  Caderno
                </button>
                <button
                  aria-pressed={mobilePanel === 'answers'}
                  onClick={() => setMobilePanel('answers')}
                >
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
                          A extração pode não representar fórmulas e diagramas. Confira esses
                          elementos na imagem ou no PDF original.
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
                <aside
                  className={styles.answerSheet}
                  data-mobile-active={mobilePanel === 'answers'}
                  aria-label="Respostas do simulado"
                >
                  <h2>Suas respostas</h2>
                  <p className={styles.muted}>
                    {Object.values(attempt?.answers || {}).filter(Boolean).length}/40 respondidas
                  </p>
                  <div className={styles.questionGrid}>
                    {exam.questions.map((q, index) => (
                      <button
                        key={q.id}
                        onClick={() => selectQuestion(index)}
                        aria-current={index === questionIndex ? 'step' : undefined}
                        aria-label={`${q.kind === 'discursive' ? 'Discursiva' : 'Questão'} ${q.number}${attempt?.marked.includes(q.id) ? ', marcada para revisar' : ''}${attempt?.answers[q.id] ? ', respondida' : ''}`}
                        data-answered={Boolean(attempt?.answers[q.id])}
                        data-marked={attempt?.marked.includes(q.id)}
                      >
                        {q.kind === 'discursive' ? 'D' : ''}
                        {q.number}
                      </button>
                    ))}
                  </div>
                  {question && attempt && (
                    <div className={styles.response}>
                      <p className={styles.muted}>
                        {question.section === 'general'
                          ? 'Formação geral'
                          : 'Componente específico'}
                      </p>
                      <h3>
                        {question.kind === 'discursive' ? 'Discursiva' : 'Questão'}{' '}
                        {question.number}
                      </h3>
                      {question.annulled && (
                        <p className={styles.notice}>Anulada pelo Inep. Não conta na correção.</p>
                      )}
                      {question.kind === 'objective' ? (
                        <fieldset disabled={finished || question.annulled}>
                          <legend className={styles.muted}>Marque a alternativa do caderno</legend>
                          <div className={styles.alternatives}>
                            {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                              <label
                                key={letter}
                                data-selected={attempt.answers[question.id] === letter}
                              >
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
                      {!finished && (
                        <button
                          className={styles.bookmark}
                          aria-pressed={attempt.marked.includes(question.id)}
                          onClick={() =>
                            updateAttempt({
                              ...attempt,
                              marked: attempt.marked.includes(question.id)
                                ? attempt.marked.filter((id) => id !== question.id)
                                : [...attempt.marked, question.id],
                              updatedAt: Date.now(),
                            })
                          }
                        >
                          <Bookmark size={15} />{' '}
                          {attempt.marked.includes(question.id)
                            ? 'Marcada para revisar'
                            : 'Marcar para revisar'}
                        </button>
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
                  <button
                    className={styles.back}
                    onClick={() => attempt && persist(exam.year, attempt)}
                  >
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
                        {40 - Object.values(attempt.answers).filter(Boolean).length} respostas em
                        branco.
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
                </aside>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
