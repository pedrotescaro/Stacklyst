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
  ExternalLink,
  Pause,
  Play,
  Shuffle,
} from 'lucide-react';
import type { EnadeAttempt } from '@/lib/enade/types';
import { formatDuration, type EnadeWorkspace } from '@/lib/enade/simulator';
import { useEnadeSession } from './useEnadeSession';
import { EnadeQuestion } from './EnadeQuestion';
import { EnadeResults } from './EnadeResults';
import { QuestionPicker } from './QuestionPicker';
import styles from './EnadeCourse.module.css';

export function EnadeSimulation(props: {
  userId: string;
  year?: number;
  initialAttempt?: EnadeAttempt;
  initialWorkspace?: EnadeWorkspace;
}) {
  const simulation = useEnadeSession(props);
  const { session, question, result, ready, remaining } = simulation;
  const router = useRouter();
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const questionStart = useRef<HTMLElement>(null);
  const resultsStart = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (session?.finishedAt) {
      setShowResults(true);
      resultsStart.current?.scrollIntoView?.({ block: 'start' });
    }
  }, [session?.finishedAt]);
  function navigate(index: number) {
    simulation.navigate(index);
    setConfirmFinish(false);
    setShowResults(false);
    questionStart.current?.scrollIntoView?.({ block: 'start' });
  }
  function repeat(wrongOnly: boolean) {
    const next = simulation.repeat(wrongOnly);
    if (next && props.year && !next.sourceYear) router.push('/trails/enade/personalizado');
    setShowResults(false);
    window.scrollTo?.({ top: 0 });
  }
  if (!ready)
    return (
      <main className={`${styles.main} ${styles.activity}`}>
        <p role="status">Preparando simulado...</p>
      </main>
    );
  if (!session || !question || !result)
    return (
      <main className={`${styles.main} ${styles.activity}`}>
        <Link className={styles.back} href="/trails/enade">
          <ArrowLeft size={17} />
          Todas as edições
        </Link>
        <h1>Monte seu simulado</h1>
        <p className={styles.intro}>
          Escolha as edições, a quantidade de questões e o tempo para começar.
        </p>
        <Link className={styles.startButton} href="/trails/enade#custom-title">
          Configurar simulado
        </Link>
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
            <span>{simulation.title}</span>
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
              {session.paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          )}
        </div>
      </header>
      <div className={styles.sessionHeader}>
        <h1>{simulation.title}</h1>
        <p className={styles.muted}>
          {session.config.mode === 'training'
            ? 'Modo treino · correção comentada após responder.'
            : 'Modo prova · a correção aparece ao finalizar.'}
          {remaining === null && !session.finishedAt ? ' Sem limite de tempo.' : ''}
        </p>
      </div>
      {session.finishedAt && showResults ? (
        <div ref={resultsStart} className={styles.resultsAnchor}>
          <EnadeResults
            session={session}
            result={result}
            questions={simulation.presentations}
            onRepeat={repeat}
            onReview={navigate}
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
                <p role="status" className={styles.loading}>
                  Carregando questão...
                </p>
              ) : (
                <EnadeQuestion
                  question={question}
                  index={session.currentIndex}
                  total={simulation.questions.length}
                  onAnswer={simulation.answer}
                  onMark={simulation.mark}
                  onCheckDiscursive={simulation.checkDiscursive}
                />
              )}
              <div className={styles.questionNav}>
                <button
                  disabled={session.currentIndex === 0}
                  onClick={() => navigate(session.currentIndex - 1)}
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>
                <button
                  className={styles.nextQuestion}
                  disabled={session.currentIndex === simulation.questions.length - 1}
                  onClick={() => navigate(session.currentIndex + 1)}
                >
                  Próxima
                  <ChevronRight size={18} />
                </button>
              </div>
              {!session.finishedAt && (
                <button
                  className={styles.skipButton}
                  disabled={!simulation.canSkip}
                  onClick={() => {
                    simulation.skip();
                    questionStart.current?.scrollIntoView?.({ block: 'start' });
                  }}
                >
                  <Shuffle size={16} />
                  Pular para uma aleatória em branco
                </button>
              )}
            </article>
          )}
        </>
      )}
      <footer className={styles.sessionFooter}>
        <div>
          <p className={styles.saveStatus} role="status">
            {simulation.saveStatus}
          </p>
          <button className={styles.back} onClick={simulation.saveNow}>
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
            <button onClick={() => setConfirmFinish(false)}>Continuar respondendo</button>
          </div>
        )}
      </footer>
    </main>
  );
}
