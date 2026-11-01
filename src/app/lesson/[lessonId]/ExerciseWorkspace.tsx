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
            <span data-passed={test.passed}>{test.passed ? 'Aprovado' : 'Não passou'}</span>
          </div>
          {test.error && <p className={styles.error}>{test.error}</p>}
          {!test.hidden &&
            !test.passed &&
            (test.actual !== undefined || test.expected !== undefined) && (
              <div className={styles.testValues}>
                <div>
                  <span>Recebido</span>
                  <pre>{displayValue(test.actual)}</pre>
                </div>
                <div>
                  <span>Esperado</span>
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
        error: 'Não foi possível conectar ao serviço de avaliação.',
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
            aria-label="Voltar à trilha"
            className={styles.iconButton}
          >
            <ArrowLeft size={21} aria-hidden="true" />
          </Link>
          <div className={styles.heading}>
            <h1>{exercise.title}</h1>
            <p>{exercise.knowledge.title}</p>
          </div>
          <span className={styles.language}>{exercise.language}</span>
          <div className={styles.counts} aria-label="Sua atividade neste exercício">
            <span>
              <Play size={15} aria-hidden="true" /> Execuções: {runCount}
            </span>
            <span>
              <Send size={15} aria-hidden="true" /> Envios: {submissionCount}
            </span>
          </div>
        </div>
      </header>

      <main>
        {jumpChallenge && (
          <section className={styles.challenge}>
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <h2>Desafio para pular à Seção {jumpChallenge.sectionNumber}</h2>
              <p>
                O modo Difícil está fixado: sem sugestões no editor e sem dicas. Envie uma solução
                que passe pelos testes públicos e ocultos para liberar a seção.
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

        <nav className={styles.panelTabs} aria-label="Área do exercício">
          <button
            type="button"
            aria-pressed={activePanel === 'problem'}
            onClick={() => setActivePanel('problem')}
          >
            <BookOpen size={18} aria-hidden="true" /> Problema
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
            aria-label="Enunciado do exercício"
          >
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls="exercise-problem-details"
              onClick={() => setDetailsOpen((open) => !open)}
              className={styles.panelHeading}
            >
              <span>
                <BookOpen size={18} aria-hidden="true" /> Problema
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
                    <Gauge size={18} aria-hidden="true" /> Objetivo
                  </h2>
                  <p>{exercise.objective}</p>
                </section>
                {exercise.constraints.length > 0 && (
                  <section>
                    <h2>Restrições</h2>
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
                    <h2>Exemplo</h2>
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
                    Documentação oficial
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}
                {canUseHints && exercise.hints.length > 0 && (
                  <section className={styles.hints}>
                    <h2>
                      <Lightbulb size={18} aria-hidden="true" /> Dicas
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
                        {revealedHints === 0 ? 'Mostrar uma dica' : 'Mostrar próxima dica'}
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
            aria-label="Sua solução"
          >
            <div className={styles.panelHeading}>
              <span>
                <Code2 size={18} aria-hidden="true" /> Sua solução
              </span>
              <button
                type="button"
                onClick={() => setCode(exercise.starterCode)}
                disabled={busy}
                className={styles.restoreButton}
              >
                <RotateCcw size={16} aria-hidden="true" /> Restaurar
              </button>
            </div>
            <div className={styles.editorSurface}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={exercise.language}
                height="min(58dvh, 520px)"
                autocompletion={canUseAutocomplete}
                ariaLabel={`Editor de código ${exercise.language}`}
              />
            </div>
            <div className={styles.editorActions}>
              <div className={styles.testInfo}>
                <span>
                  <FlaskConical size={16} aria-hidden="true" /> {exercise.publicTestCount} testes
                  públicos
                </span>
                <span>{exercise.hiddenTestCount} ocultos no envio</span>
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
                  {runningAction === 'run' ? 'Executando…' : 'Executar'}
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
                  {runningAction === 'submit' ? 'Avaliando…' : 'Enviar solução'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className={styles.results} aria-label="Resultados da execução" aria-busy={busy}>
          <div className={styles.resultsHeading}>
            <h2>
              <Terminal size={18} aria-hidden="true" /> Console e testes
            </h2>
            {evaluation && (
              <span>
                {evaluation.totalTests > 0
                  ? `${evaluation.passedTests}/${evaluation.totalTests} aprovados · ${evaluation.executionMs} ms`
                  : evaluation.error
                    ? 'Avaliação não concluída'
                    : 'Nenhum teste executado'}
              </span>
            )}
          </div>
          {!evaluation ? (
            <p className={styles.emptyResults}>
              {busy
                ? 'Aguardando o resultado da avaliação…'
                : 'Execute para conferir os testes públicos. Envie sua solução para avaliar também os testes ocultos e registrar seu progresso.'}
            </p>
          ) : (
            <div className={styles.resultPanels} aria-live="polite">
              <div className={styles.console}>
                <h3>Saída do console</h3>
                {evaluation.error ? (
                  <p role="alert" className={styles.error}>
                    {evaluation.error}
                  </p>
                ) : evaluation.consoleOutput ? (
                  <pre>{evaluation.consoleOutput}</pre>
                ) : (
                  <p>Execução concluída sem saída no console.</p>
                )}
              </div>
              <div className={styles.testResults}>
                <h3>Casos de teste</h3>
                {evaluation.tests.length > 0 ? (
                  <ul>
                    {evaluation.tests.map((test) => (
                      <TestResultRow key={test.id} test={test} />
                    ))}
                  </ul>
                ) : (
                  <p className={styles.noTests}>
                    Os testes não foram executados. Confira a mensagem da avaliação antes de tentar
                    novamente.
                  </p>
                )}
              </div>
            </div>
          )}
          {evaluation?.passed && evaluation.firstCompletion && (
            <div className={styles.completion}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <p>
                Conhecimento demonstrado: +{evaluation.xpEarned ?? 0} XP, +
                {evaluation.gemsEarned ?? 0} joias e domínio{' '}
                {evaluation.mastery ?? exercise.knowledge.mastery}%
              </p>
            </div>
          )}
          {jumpChallenge && evaluation?.passed && lastEvaluatedAction === 'submit' && (
            <div className={styles.jumpResult}>
              {jumpUnlockState === 'saving' && (
                <p>
                  <Loader2 size={18} className={styles.spinner} aria-hidden="true" /> Salvando a
                  liberação da seção…
                </p>
              )}
              {jumpUnlockState === 'error' && (
                <div>
                  <p className={styles.error}>
                    Você passou, mas não foi possível salvar a liberação. Tente novamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => void recordJumpUnlock()}
                    className={styles.secondaryButton}
                  >
                    Salvar novamente
                  </button>
                </div>
              )}
              {jumpUnlockState === 'saved' && (
                <div>
                  <p>
                    <ShieldCheck size={20} aria-hidden="true" /> Desafio concluído. A Seção{' '}
                    {jumpChallenge.sectionNumber} foi liberada.
                  </p>
                  <Link
                    href={`/trails?view=trail&path=${encodeURIComponent(jumpChallenge.pathSlug)}&section=${jumpChallenge.sectionNumber}`}
                    className={styles.primaryButton}
                  >
                    Começar na seção
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
