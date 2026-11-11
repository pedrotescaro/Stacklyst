'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleX,
  Clock3,
  Code2,
  ExternalLink,
  FlaskConical,
  Gauge,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { AssistanceControls } from '@/components/lesson/AssistanceControls';
import { CodeEditor } from '@/components/CodeEditor';
import { cn } from '@/lib/cn';
import type {
  AssistanceMode,
  ExerciseApiTestResult,
  ExerciseWorkspaceData,
} from '@/lib/exercises/types';
import styles from './ExerciseWorkspace.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface ExerciseWorkspaceProps {
  exercise: ExerciseWorkspaceData;
  returnTo?: string;
  jumpChallenge?: {
    sectionNumber: number;
    pathSlug: string;
    language: string;
  };
}

interface EvaluationResponse {
  ok: boolean;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  tests: ExerciseApiTestResult[];
  consoleOutput: string;
  error?: string;
  executionMs: number;
  runCount?: number;
  submissionCount?: number;
  firstCompletion?: boolean;
  xpEarned?: number;
  gemsEarned?: number;
  totalGems?: number;
  mastery?: number;
  nodeStatus?: string;
  totalXp?: number;
  message?: string;
}

function displayValue(value: unknown) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function TestResultRow({ test }: { test: ExerciseApiTestResult }) {
  const { text } = useLocalizedText();
  return (
    <li className={styles.testRow}>
      <div className={styles.testHeading}>
        {test.passed ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
        ) : (
          <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
        )}
        <div className={styles.testDetail}>
          <div className={styles.testStatus}>
            <p>{test.label}</p>
            <span data-passed={test.passed}>
              {test.passed ? text('Aprovado', 'Passed') : text('Não passou', 'Failed')}
            </span>
          </div>
          {test.error && <p className={styles.error}>{test.error}</p>}
          {!test.hidden &&
            !test.passed &&
            (test.actual !== undefined || test.expected !== undefined) && (
              <div className={styles.testValues}>
                <div>
                  <span>{text('Recebido', 'Received')}</span>
                  <pre>{displayValue(test.actual)}</pre>
                </div>
                <div>
                  <span>{text('Esperado', 'Expected')}</span>
                  <pre>{displayValue(test.expected)}</pre>
                </div>
              </div>
            )}
        </div>
      </div>
    </li>
  );
}

export function ExerciseWorkspace({ exercise, jumpChallenge, returnTo }: ExerciseWorkspaceProps) {
  const { text } = useLocalizedText();
  const [code, setCode] = useState(exercise.starterCode);
  const [assistanceMode, setAssistanceMode] = useState<AssistanceMode>(
    jumpChallenge ? 'HARD' : 'STANDARD'
  );
  const [runningAction, setRunningAction] = useState<'run' | 'submit' | null>(null);
  const [lastEvaluatedAction, setLastEvaluatedAction] = useState<'run' | 'submit' | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [runCount, setRunCount] = useState(exercise.activity.runs);
  const [submissionCount, setSubmissionCount] = useState(exercise.activity.submissions);
  const [revealedHints, setRevealedHints] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'problem' | 'editor'>('problem');
  const [jumpUnlockState, setJumpUnlockState] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );

  const canUseAutocomplete = assistanceMode === 'GUIDED' || assistanceMode === 'STANDARD';
  const canUseDocumentation = assistanceMode !== 'NO_ASSIST';
  const canUseHints = assistanceMode === 'GUIDED';
  const busy = runningAction !== null;
  const examples = useMemo(
    () => exercise.examples.filter((example) => example && typeof example === 'object'),
    [exercise.examples]
  );

  const trackAssistanceEvent = (eventType: 'HINT_OPENED' | 'DOCUMENTATION_OPENED') => {
    void fetch(`/api/exercises/${exercise.id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, assistanceMode }),
    });
  };

  const revealHint = () => {
    if (!canUseHints || revealedHints >= exercise.hints.length) return;
    setRevealedHints((current) => current + 1);
    trackAssistanceEvent('HINT_OPENED');
  };

  const changeAssistanceMode = (mode: AssistanceMode) => {
    if (jumpChallenge) return;
    setAssistanceMode(mode);
    if (mode !== 'GUIDED') setRevealedHints(0);
  };

  const recordJumpUnlock = async () => {
    if (!jumpChallenge) return;
    setJumpUnlockState('saving');

    try {
      const response = await fetch('/api/trails/jump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathSlug: jumpChallenge.pathSlug,
          language: jumpChallenge.language,
          sectionNumber: jumpChallenge.sectionNumber,
          exerciseId: exercise.id,
        }),
      });
      if (!response.ok) throw new Error('Não foi possível salvar o salto.');
      setJumpUnlockState('saved');
    } catch {
      setJumpUnlockState('error');
    }
  };

  const evaluate = async (action: 'run' | 'submit') => {
    if (busy || !code.trim()) return;
    setRunningAction(action);
    setLastEvaluatedAction(action);
    setEvaluation(null);
    if (action === 'submit' && jumpChallenge) setJumpUnlockState('idle');

    try {
      const response = await fetch(`/api/exercises/${exercise.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          assistanceMode,
          ...(action === 'submit' && jumpChallenge ? { challenge: 'SECTION_JUMP' } : {}),
        }),
      });
      const data = (await response.json()) as EvaluationResponse;
      setEvaluation({
        ...data,
        ok: Boolean(data.ok),
        passed: Boolean(data.passed),
        tests: data.tests ?? [],
        consoleOutput: data.consoleOutput ?? '',
        passedTests: data.passedTests ?? 0,
        totalTests: data.totalTests ?? 0,
        executionMs: data.executionMs ?? 0,
        error: data.message ?? data.error,
      });

      if (typeof data.runCount === 'number') setRunCount(data.runCount);
      if (typeof data.submissionCount === 'number') setSubmissionCount(data.submissionCount);
      if (action === 'submit' && data.passed && jumpChallenge) {
        await recordJumpUnlock();
      }
    } catch {
      setEvaluation({
        ok: false,
        passed: false,
        passedTests: 0,
        totalTests: 0,
        tests: [],
        consoleOutput: '',
        error: text(
          'Não foi possível conectar ao serviço de avaliação.',
          'Could not connect to the evaluation service.'
        ),
        executionMs: 0,
      });
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.toolbar}>
          <Link
            href={
              returnTo ??
              (jumpChallenge
                ? `/trails?view=trail&path=${encodeURIComponent(jumpChallenge.pathSlug)}`
                : '/trails')
            }
            aria-label={
              returnTo?.startsWith('/jobs/')
                ? text('Voltar à vaga', 'Back to the job')
                : text('Voltar à trilha', 'Back to the trail')
            }
            className={styles.iconButton}
          >
            <ArrowLeft size={21} aria-hidden="true" />
          </Link>
          <div className={styles.heading}>
            <h1>{exercise.title}</h1>
            <p>{exercise.knowledge.title}</p>
          </div>
          <span className={styles.language}>{exercise.language}</span>
          <div
            className={styles.counts}
            aria-label={text('Sua atividade neste exercício', 'Your activity in this exercise')}
          >
            <span>
              <Play size={15} aria-hidden="true" /> {text('Execuções:', 'Runs:')} {runCount}
            </span>
            <span>
              <Send size={15} aria-hidden="true" /> {text('Envios:', 'Submissions:')}{' '}
              {submissionCount}
            </span>
          </div>
        </div>
      </header>

      <main>
        {jumpChallenge && (
          <section className={styles.challenge}>
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <h2>
                {text('Desafio para pular à Seção', 'Challenge to jump to Section')}{' '}
                {jumpChallenge.sectionNumber}
              </h2>
              <p>
                {text(
                  'O modo Difícil está fixado: sem sugestões no editor e sem dicas. Envie uma solução que passe pelos testes públicos e ocultos para liberar a seção.',
                  'Hard mode is locked: no editor suggestions and no hints. Submit a solution that passes the public and hidden tests to unlock the section.'
                )}
              </p>
            </div>
          </section>
        )}

        <div className={styles.assistance}>
          <AssistanceControls
            value={assistanceMode}
            onChange={changeAssistanceMode}
            disabled={busy || Boolean(jumpChallenge)}
          />
        </div>

        <nav className={styles.panelTabs} aria-label={text('Área do exercício', 'Exercise area')}>
          <button
            type="button"
            aria-pressed={activePanel === 'problem'}
            onClick={() => setActivePanel('problem')}
          >
            <BookOpen size={18} aria-hidden="true" /> {text('Problema', 'Problem')}
          </button>
          <button
            type="button"
            aria-pressed={activePanel === 'editor'}
            onClick={() => setActivePanel('editor')}
          >
            <Code2 size={18} aria-hidden="true" /> Editor
          </button>
        </nav>

        <div className={styles.panels}>
          <section
            className={styles.problemPanel}
            data-active={activePanel === 'problem'}
            aria-label={text('Enunciado do exercício', 'Exercise prompt')}
          >
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls="exercise-problem-details"
              onClick={() => setDetailsOpen((open) => !open)}
              className={styles.panelHeading}
            >
              <span>
                <BookOpen size={18} aria-hidden="true" /> {text('Problema', 'Problem')}
              </span>
              <ChevronDown
                className={cn(styles.disclosure, !detailsOpen && styles.collapsed)}
                size={18}
                aria-hidden="true"
              />
            </button>
            {detailsOpen && (
              <div id="exercise-problem-details" className={styles.problemContent}>
                <p className={styles.problemText}>{exercise.problem}</p>
                <section>
                  <h2>
                    <Gauge size={18} aria-hidden="true" /> {text('Objetivo', 'Goal')}
                  </h2>
                  <p>{exercise.objective}</p>
                </section>
                {exercise.constraints.length > 0 && (
                  <section>
                    <h2>{text('Restrições', 'Constraints')}</h2>
                    <ul className={styles.constraints}>
                      {exercise.constraints.map((constraint) => (
                        <li key={constraint}>
                          <Check size={17} aria-hidden="true" /> {constraint}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {examples.length > 0 && (
                  <section>
                    <h2>{text('Exemplo', 'Example')}</h2>
                    <pre className={styles.example}>{JSON.stringify(examples[0], null, 2)}</pre>
                  </section>
                )}
                {canUseDocumentation && exercise.documentationUrl && (
                  <a
                    href={exercise.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackAssistanceEvent('DOCUMENTATION_OPENED')}
                    className={styles.documentation}
                  >
                    <BookOpen size={18} aria-hidden="true" />
                    {text('Documentação oficial', 'Official documentation')}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}
                {canUseHints && exercise.hints.length > 0 && (
                  <section className={styles.hints}>
                    <h2>
                      <Lightbulb size={18} aria-hidden="true" /> {text('Dicas', 'Hints')}
                    </h2>
                    {revealedHints > 0 && (
                      <ol>
                        {exercise.hints.slice(0, revealedHints).map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ol>
                    )}
                    {revealedHints < exercise.hints.length && (
                      <button type="button" onClick={revealHint} className={styles.secondaryButton}>
                        {revealedHints === 0
                          ? text('Mostrar uma dica', 'Show a hint')
                          : text('Mostrar próxima dica', 'Show next hint')}
                      </button>
                    )}
                  </section>
                )}
              </div>
            )}
          </section>

          <section
            className={styles.editorPanel}
            data-active={activePanel === 'editor'}
            aria-label={text('Sua solução', 'Your solution')}
          >
            <div className={styles.panelHeading}>
              <span>
                <Code2 size={18} aria-hidden="true" /> {text('Sua solução', 'Your solution')}
              </span>
              <button
                type="button"
                onClick={() => setCode(exercise.starterCode)}
                disabled={busy}
                className={styles.restoreButton}
              >
                <RotateCcw size={16} aria-hidden="true" /> {text('Restaurar', 'Reset')}
              </button>
            </div>
            <div className={styles.editorSurface}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={exercise.language}
                height="min(58dvh, 520px)"
                autocompletion={canUseAutocomplete}
                ariaLabel={`${text('Editor de código', 'Code editor')} ${exercise.language}`}
              />
            </div>
            <div className={styles.editorActions}>
              <div className={styles.testInfo}>
                <span>
                  <FlaskConical size={16} aria-hidden="true" /> {exercise.publicTestCount}{' '}
                  {text('testes públicos', 'public tests')}
                </span>
                <span>
                  {exercise.hiddenTestCount} {text('ocultos no envio', 'hidden on submit')}
                </span>
                <span>
                  <Clock3 size={16} aria-hidden="true" /> {exercise.estimatedMinutes ?? 30} min
                </span>
              </div>
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  onClick={() => evaluate('run')}
                  disabled={busy || !code.trim()}
                  className={styles.secondaryButton}
                >
                  {runningAction === 'run' ? (
                    <Loader2 size={17} className={styles.spinner} aria-hidden="true" />
                  ) : (
                    <Play size={17} aria-hidden="true" />
                  )}
                  {runningAction === 'run'
                    ? text('Executando…', 'Running…')
                    : text('Executar', 'Run')}
                </button>
                <button
                  type="button"
                  onClick={() => evaluate('submit')}
                  disabled={busy || !code.trim()}
                  className={styles.primaryButton}
                >
                  {runningAction === 'submit' ? (
                    <Loader2 size={17} className={styles.spinner} aria-hidden="true" />
                  ) : (
                    <Send size={17} aria-hidden="true" />
                  )}
                  {runningAction === 'submit'
                    ? text('Avaliando…', 'Evaluating…')
                    : text('Enviar solução', 'Submit solution')}
                </button>
              </div>
            </div>
          </section>
        </div>

        <section
          className={styles.results}
          aria-label={text('Resultados da execução', 'Run results')}
          aria-busy={busy}
        >
          <div className={styles.resultsHeading}>
            <h2>
              <Terminal size={18} aria-hidden="true" />{' '}
              {text('Console e testes', 'Console and tests')}
            </h2>
            {evaluation && (
              <span>
                {evaluation.totalTests > 0
                  ? `${evaluation.passedTests}/${evaluation.totalTests} ${text('aprovados', 'passed')} · ${evaluation.executionMs} ms`
                  : evaluation.error
                    ? text('Avaliação não concluída', 'Evaluation not completed')
                    : text('Nenhum teste executado', 'No tests run')}
              </span>
            )}
          </div>
          {!evaluation ? (
            <p className={styles.emptyResults}>
              {busy
                ? text('Aguardando o resultado da avaliação…', 'Waiting for the evaluation result…')
                : text(
                    'Execute para conferir os testes públicos. Envie sua solução para avaliar também os testes ocultos e registrar seu progresso.',
                    'Run to check the public tests. Submit your solution to also evaluate the hidden tests and record your progress.'
                  )}
            </p>
          ) : (
            <div className={styles.resultPanels} aria-live="polite">
              <div className={styles.console}>
                <h3>{text('Saída do console', 'Console output')}</h3>
                {evaluation.error ? (
                  <p role="alert" className={styles.error}>
                    {evaluation.error}
                  </p>
                ) : evaluation.consoleOutput ? (
                  <pre>{evaluation.consoleOutput}</pre>
                ) : (
                  <p>
                    {text(
                      'Execução concluída sem saída no console.',
                      'Run finished with no console output.'
                    )}
                  </p>
                )}
              </div>
              <div className={styles.testResults}>
                <h3>{text('Casos de teste', 'Test cases')}</h3>
                {evaluation.tests.length > 0 ? (
                  <ul>
                    {evaluation.tests.map((test) => (
                      <TestResultRow key={test.id} test={test} />
                    ))}
                  </ul>
                ) : (
                  <p className={styles.noTests}>
                    {text(
                      'Os testes não foram executados. Confira a mensagem da avaliação antes de tentar novamente.',
                      'The tests were not run. Check the evaluation message before trying again.'
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
          {evaluation?.passed && evaluation.firstCompletion && (
            <div className={styles.completion}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <p>
                {text('Conhecimento demonstrado:', 'Knowledge demonstrated:')} +
                {evaluation.xpEarned ?? 0} XP, +{evaluation.gemsEarned ?? 0}{' '}
                {text('joias e domínio', 'gems and mastery')}{' '}
                {evaluation.mastery ?? exercise.knowledge.mastery}%
              </p>
            </div>
          )}
          {jumpChallenge && evaluation?.passed && lastEvaluatedAction === 'submit' && (
            <div className={styles.jumpResult}>
              {jumpUnlockState === 'saving' && (
                <p>
                  <Loader2 size={18} className={styles.spinner} aria-hidden="true" />{' '}
                  {text('Salvando a liberação da seção…', 'Saving the section unlock…')}
                </p>
              )}
              {jumpUnlockState === 'error' && (
                <div>
                  <p className={styles.error}>
                    {text(
                      'Você passou, mas não foi possível salvar a liberação. Tente novamente.',
                      'You passed, but the unlock could not be saved. Try again.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => void recordJumpUnlock()}
                    className={styles.secondaryButton}
                  >
                    {text('Salvar novamente', 'Save again')}
                  </button>
                </div>
              )}
              {jumpUnlockState === 'saved' && (
                <div>
                  <p>
                    <ShieldCheck size={20} aria-hidden="true" />{' '}
                    {text('Desafio concluído. A Seção', 'Challenge complete. Section')}{' '}
                    {jumpChallenge.sectionNumber} {text('foi liberada.', 'is unlocked.')}
                  </p>
                  <Link
                    href={`/trails?view=trail&path=${encodeURIComponent(jumpChallenge.pathSlug)}&section=${jumpChallenge.sectionNumber}`}
                    className={styles.primaryButton}
                  >
                    {text('Começar na seção', 'Start in the section')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
