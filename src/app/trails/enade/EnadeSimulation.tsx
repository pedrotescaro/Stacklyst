'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudCheck,
  CloudOff,
  ExternalLink,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  Shuffle,
} from 'lucide-react';
import { formatDuration, SECTION_LABELS, type EnadeSession } from '@/lib/enade/simulator';
import { useEnadeSession } from './useEnadeSession';
import { EnadeQuestion } from './EnadeQuestion';
import { EnadeResults } from './EnadeResults';
import { QuestionPicker } from './QuestionPicker';
import { startAttempt } from './_components/StartAttemptButton';
import type { QuestionStudyAids } from './_components/QuestionExplanation';
import styles from './EnadeCourse.module.css';

/** Label with three dots lighting up in turn, above a plain spinning ring. */
function LoadingState({ label, page = false }: { label: string; page?: boolean }) {
  return (
    <div role="status" className={`${styles.loading} ${page ? styles.loadingPage : ''}`}>
      <p className={styles.loadingText}>
        {label}
        <span className={styles.loadingDots} aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}

export function EnadeSimulation(props: {
  attemptId: string;
  title: string;
  kindLabel: string;
  initialSession: EnadeSession;
  aids: Record<string, QuestionStudyAids>;
  favorites: string[];
}) {
  const simulation = useEnadeSession({
    attemptId: props.attemptId,
    initialSession: props.initialSession,
  });
  const { session, question, result, ready, remaining } = simulation;
  const router = useRouter();
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [repeatError, setRepeatError] = useState('');
  const [repeating, setRepeating] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const questionStart = useRef<HTMLElement>(null);
  const resultsStart = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (session?.finishedAt) {
      setShowResults(true);
      resultsStart.current?.scrollIntoView?.({ block: 'start' });
    }
  }, [session?.finishedAt]);
  // ← / → move between questions; ignored while typing, choosing an option or zooming an image.
  const stepBy = useRef<(delta: number) => void>(() => {});
  useEffect(() => {
    stepBy.current = (delta) => {
      if (!session || session.paused || (session.finishedAt && showResults)) return;
      const next = session.currentIndex + delta;
      if (next >= 0 && next < simulation.questions.length) navigate(next);
    };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]'))
        return;
      if (document.querySelector('[role="dialog"], dialog[open]')) return;
      event.preventDefault();
      stepBy.current(event.key === 'ArrowLeft' ? -1 : 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  function navigate(index: number) {
    simulation.navigate(index);
    setConfirmFinish(false);
    setShowResults(false);
    questionStart.current?.scrollIntoView?.({ block: 'start' });
  }
  /** A repeat is a new attempt: the finished one stays untouched in the history. */
  async function repeat(wrongOnly: boolean) {
    setRepeating(true);
    setRepeatError('');
    try {
      if (!(await simulation.flush())) {
        throw new Error('Salve o resultado para iniciar outra tentativa.');
      }
      const id = await startAttempt({
        kind: wrongOnly ? 'WRONG_ONLY' : 'REPEAT',
        parentId: props.attemptId,
      });
      router.push(`/trails/enade/simulados/${id}`);
    } catch (error) {
      setRepeatError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a nova tentativa. Tente novamente.'
      );
      setRepeating(false);
    }
  }
  if (!ready || !question)
    return (
      <main className={`${styles.main} ${styles.activity}`}>
        <LoadingState label="Preparando simulado" page />
      </main>
    );
  const firstBlank = simulation.presentations.findIndex((q) => !q.answered && !q.annulled);
  const saveState = simulation.saveStatus.startsWith('Salvando')
    ? 'saving'
    : simulation.saveStatus.startsWith('Não foi possível')
      ? 'error'
      : 'saved';
  return (
    <main className={`${styles.main} ${styles.activity}`}>
      <header className={styles.activityHeader}>
        <Link
          className={styles.exit}
          href="/trails/enade/simulados"
          aria-label="Voltar aos simulados"
        >
          <ArrowLeft size={22} />
        </Link>
        <div className={styles.progressSummary}>
          <div className={styles.progressCaption}>
            <span>{props.title}</span>
            <span>
              {result.answered}/{simulation.questions.length} respondidas
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Progresso do simulado"
            aria-valuemin={0}
            aria-valuemax={simulation.questions.length}
            aria-valuenow={result.answered}
            aria-valuetext={`${result.answered} de ${simulation.questions.length} questões respondidas`}
            className={styles.progressTrack}
          >
            <div style={{ width: `${(result.answered / simulation.questions.length) * 100}%` }} />
          </div>
        </div>
        <div className={styles.timerControls}>
          <span
            className={styles.timer}
            data-warning={simulation.timeWarning && !session.finishedAt}
            aria-label={
              session.finishedAt
                ? 'Simulado concluído'
                : remaining === null
                  ? 'Tempo decorrido'
                  : 'Tempo restante'
            }
          >
            <Clock3 size={17} aria-hidden="true" />
            {session.finishedAt ? 'Concluído' : formatDuration(remaining ?? simulation.elapsed)}
          </span>
          {!session.finishedAt && (
            <button
              className={styles.pauseButton}
              onClick={simulation.pause}
              aria-label={session.paused ? 'Retomar simulado' : 'Pausar simulado'}
              title={session.paused ? 'Retomar' : 'Pausar'}
            >
              {session.paused ? (
                <Play size={14} aria-hidden="true" />
              ) : (
                <Pause size={14} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </header>
      <div className={styles.sessionHeader}>
        <h1>{props.title}</h1>
        <p className={styles.muted}>
          {props.kindLabel} ·{' '}
          {session.config.section && session.config.section !== 'all'
            ? `${SECTION_LABELS[session.config.section]} · `
            : ''}
          {session.config.mode === 'training'
            ? 'Modo estudo · correção comentada logo após responder.'
            : 'Modo simulado · o gabarito e os comentários aparecem ao finalizar.'}
          {remaining === null && !session.finishedAt ? ' Sem limite de tempo.' : ''}
        </p>
      </div>
      {session.finishedAt && showResults ? (
        <div ref={resultsStart} className={styles.resultsAnchor}>
          <EnadeResults
            session={session}
            result={result}
            questions={simulation.presentations}
            onRepeat={(wrongOnly) => void repeat(wrongOnly)}
            onReview={navigate}
            repeating={repeating}
            repeatError={repeatError}
            aids={props.aids}
          />
        </div>
      ) : (
        <>
          {session.finishedAt && (
            <button
              className={styles.secondaryButton}
              onClick={() => {
                setShowResults(true);
                window.scrollTo?.({ top: 0 });
              }}
            >
              Voltar ao resultado
            </button>
          )}
          <div className={styles.activityNavigation}>
            <QuestionPicker
              questions={simulation.presentations}
              currentIndex={session.currentIndex}
              onNavigate={navigate}
            />
            <a
              className={styles.originalLink}
              href={`/enade/${question.year}/prova.pdf#page=${question.page}`}
              target="_blank"
              rel="noreferrer"
            >
              Caderno original <ExternalLink size={14} />
            </a>
          </div>
          {session.paused ? (
            <section className={styles.pausedPanel} aria-label="Simulado pausado">
              <Pause size={32} />
              <h2>Uma pausa para respirar</h2>
              <p>O cronômetro está parado. Suas respostas continuam salvas.</p>
              <button className={styles.startButton} onClick={simulation.pause}>
                <Play size={17} />
                Retomar simulado
              </button>
            </section>
          ) : (
            <article
              ref={questionStart}
              className={styles.question}
              aria-labelledby="question-title"
            >
              {simulation.contentError ? (
                <div className={styles.loadError} role="alert">
                  <p>Não foi possível carregar a questão. Suas respostas continuam salvas.</p>
                  <button className={styles.primary} onClick={simulation.retryLoad}>
                    Tentar novamente
                  </button>
                </div>
              ) : !question.content ? (
                <LoadingState label="Carregando questão" />
              ) : (
                <EnadeQuestion
                  key={question.id}
                  favorite={props.favorites.includes(question.id)}
                  aids={props.aids[question.id]}
                  question={question}
                  index={session.currentIndex}
                  total={simulation.questions.length}
                  onAnswer={simulation.answer}
                  onMark={simulation.mark}
                  onCheckDiscursive={simulation.checkDiscursive}
                />
              )}
              <div className={styles.questionNav} aria-label="Navegar entre questões" role="group">
                <button
                  disabled={session.currentIndex === 0}
                  onClick={() => navigate(session.currentIndex - 1)}
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>
                <div className={styles.navRight}>
                  {!session.finishedAt && (
                    <button
                      className={styles.skipButton}
                      disabled={!simulation.canSkip}
                      aria-label="Pular para uma aleatória em branco"
                      title="Pular para uma questão aleatória em branco"
                      onClick={() => {
                        simulation.skip();
                        questionStart.current?.scrollIntoView?.({ block: 'start' });
                      }}
                    >
                      <Shuffle size={15} aria-hidden="true" />
                      <span>Aleatória em branco</span>
                    </button>
                  )}
                  <button
                    className={styles.nextQuestion}
                    disabled={session.currentIndex === simulation.questions.length - 1}
                    onClick={() => navigate(session.currentIndex + 1)}
                  >
                    Próxima
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <p className={styles.keyboardHint}>
                <ChevronLeft size={13} aria-hidden="true" />
                <ChevronRight size={13} aria-hidden="true" />
                <span>Use as setas do teclado para trocar de questão</span>
              </p>
            </article>
          )}
        </>
      )}
      <footer className={styles.sessionFooter}>
        <div className={styles.saveRow}>
          <p className={styles.saveStatus} role="status" data-state={saveState}>
            {simulation.saveStatus && (
              <>
                {saveState === 'saving' ? (
                  <LoaderCircle size={14} aria-hidden="true" className={styles.saveSpin} />
                ) : saveState === 'error' ? (
                  <CloudOff size={14} aria-hidden="true" />
                ) : (
                  <CloudCheck size={14} aria-hidden="true" />
                )}
                <span>{simulation.saveStatus}</span>
              </>
            )}
          </p>
          <button className={styles.saveAgain} onClick={simulation.saveNow}>
            <RefreshCw size={13} aria-hidden="true" />
            Salvar novamente
          </button>
        </div>
        {!session.finishedAt && (
          <button className={styles.finishButton} onClick={() => setConfirmFinish(true)}>
            Finalizar simulado
            <Check size={16} />
          </button>
        )}
        {confirmFinish && !session.finishedAt && (
          <div className={styles.confirm}>
            <p>
              Finalizar e conferir o gabarito? Há {simulation.questions.length - result.answered}{' '}
              respostas em branco.
            </p>
            <button
              className={styles.primary}
              onClick={() => {
                simulation.finish();
                setConfirmFinish(false);
              }}
            >
              Finalizar e corrigir
            </button>
            {firstBlank >= 0 && (
              <button onClick={() => navigate(firstBlank)}>Ir para a primeira em branco</button>
            )}
            <button onClick={() => setConfirmFinish(false)}>Continuar respondendo</button>
          </div>
        )}
      </footer>
    </main>
  );
}
