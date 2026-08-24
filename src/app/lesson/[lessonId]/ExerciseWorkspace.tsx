'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
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

interface ExerciseWorkspaceProps {
  exercise: ExerciseWorkspaceData;
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
    <li className="rounded-xl border border-dd-border bg-dd-card p-3">
      <div className="flex items-start gap-2">
        {test.passed ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
        ) : (
          <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-black text-dd-text">{test.label}</p>
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-[0.1em]',
                test.passed ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {test.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          {test.error && <p className="mt-1 text-xs text-red-500">{test.error}</p>}
          {!test.hidden &&
            !test.passed &&
            (test.actual !== undefined || test.expected !== undefined) && (
              <div className="mt-2 grid gap-2 text-[11px] sm:grid-cols-2">
                <div className="rounded-lg bg-dd-surface p-2">
                  <span className="font-black text-dd-muted">Recebido</span>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-dd-text">
                    {displayValue(test.actual)}
                  </pre>
                </div>
                <div className="rounded-lg bg-dd-surface p-2">
                  <span className="font-black text-dd-muted">Esperado</span>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-dd-text">
                    {displayValue(test.expected)}
                  </pre>
                </div>
              </div>
            )}
        </div>
      </div>
    </li>
  );
}

export function ExerciseWorkspace({ exercise, jumpChallenge }: ExerciseWorkspaceProps) {
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
        error: data.error ?? data.message,
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
    <div className="min-h-screen bg-dd-bg text-dd-text">
      <header className="sticky top-0 z-30 border-b border-dd-border bg-dd-bg/95 backdrop-blur-md">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
          <Link
            href={
              jumpChallenge
                ? `/trails?view=trail&path=${encodeURIComponent(jumpChallenge.pathSlug)}`
                : '/trails'
            }
            aria-label="Voltar ao mapa de conhecimento"
            className="dd-focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-dd-border bg-dd-card text-dd-muted transition hover:text-dd-text"
          >
            <ArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
              {exercise.knowledge.title}
            </p>
            <h1 className="truncate text-sm font-black sm:text-base">{exercise.title}</h1>
          </div>
          <div className="hidden items-center gap-4 text-xs font-bold text-dd-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Runs: {runCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              Submissions: {submissionCount}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1680px] p-3 sm:p-5">
        <div className="mb-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-xs text-dd-muted lg:hidden">
          <div className="flex gap-2">
            <CircleAlert className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            <p>
              O ambiente funciona nesta tela, mas a experiência de programação é otimizada para
              desktop.
            </p>
          </div>
        </div>

        {jumpChallenge && (
          <section className="mb-4 rounded-2xl border border-blue-500/30 bg-blue-500/[0.07] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-black text-dd-text">
                  Desafio para pular à Seção {jumpChallenge.sectionNumber}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-dd-muted">
                  O modo Difícil está fixado: sem autocomplete e sem dicas. Para liberar a seção,
                  sua solução precisa passar também pelos testes ocultos do Submit.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-4 rounded-2xl border border-dd-border bg-dd-card p-4">
          <AssistanceControls
            value={assistanceMode}
            onChange={changeAssistanceMode}
            disabled={busy || Boolean(jumpChallenge)}
          />
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.72fr)_minmax(520px,1.28fr)]">
          <section className="overflow-hidden rounded-2xl border border-dd-border bg-dd-card">
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="dd-focus-ring flex w-full items-center justify-between gap-3 border-b border-dd-border px-5 py-4 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-black">
                <Code2 className="h-4 w-4 text-blue-500" aria-hidden="true" />
                Problema
              </span>
              <ChevronDown
                className={cn('h-4 w-4 text-dd-muted transition', !detailsOpen && '-rotate-90')}
                aria-hidden="true"
              />
            </button>

            {detailsOpen && (
              <div className="max-h-[720px] space-y-6 overflow-y-auto p-5">
                <div>
                  <p className="text-sm leading-7 text-dd-text">{exercise.problem}</p>
                </div>
                <div>
                  <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
                    <Gauge className="h-4 w-4" aria-hidden="true" /> Objetivo
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-dd-muted">{exercise.objective}</p>
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
                    Restrições
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {exercise.constraints.map((constraint) => (
                      <li key={constraint} className="flex gap-2 text-sm text-dd-muted">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                          aria-hidden="true"
                        />
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
                {examples.length > 0 && (
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
                      Exemplo
                    </h2>
                    <pre className="mt-2 overflow-x-auto rounded-xl bg-[#0d1117] p-4 text-xs leading-6 text-slate-200">
                      {JSON.stringify(examples[0], null, 2)}
                    </pre>
                  </div>
                )}

                {canUseDocumentation && exercise.documentationUrl && (
                  <a
                    href={exercise.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackAssistanceEvent('DOCUMENTATION_OPENED')}
                    className="dd-focus-ring flex items-center justify-between gap-3 rounded-xl border border-dd-border p-3 text-sm font-bold text-dd-text transition hover:border-blue-500/50"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" aria-hidden="true" />
                      Documentação oficial
                    </span>
                    <ExternalLink className="h-4 w-4 text-dd-muted" aria-hidden="true" />
                  </a>
                )}

                {canUseHints && exercise.hints.length > 0 && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
                    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-blue-500">
                      <Lightbulb className="h-4 w-4" aria-hidden="true" /> Dicas
                    </h2>
                    {revealedHints > 0 && (
                      <ol className="mt-3 space-y-2 text-sm text-dd-muted">
                        {exercise.hints.slice(0, revealedHints).map((hint, index) => (
                          <li key={hint}>
                            <span className="font-black text-dd-text">{index + 1}.</span> {hint}
                          </li>
                        ))}
                      </ol>
                    )}
                    {revealedHints < exercise.hints.length && (
                      <button
                        type="button"
                        onClick={revealHint}
                        className="dd-focus-ring mt-3 rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-black text-blue-500 transition hover:bg-blue-500/10"
                      >
                        {revealedHints === 0 ? 'Mostrar uma dica' : 'Mostrar próxima dica'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-dd-border bg-dd-card">
            <div className="flex items-center justify-between gap-3 border-b border-dd-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-500" aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-[0.12em]">Editor</span>
                <span className="rounded-md bg-dd-surface px-2 py-1 text-[10px] font-black text-dd-muted">
                  {exercise.language}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCode(exercise.starterCode)}
                disabled={busy}
                className="dd-focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-dd-muted transition hover:bg-dd-surface hover:text-dd-text disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Restaurar
              </button>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={exercise.language}
              height="460px"
              autocompletion={canUseAutocomplete}
            />

            <div className="border-t border-dd-border bg-dd-surface/60 p-4">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-dd-muted">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                    {exercise.publicTestCount} públicos
                  </span>
                  <span>{exercise.hiddenTestCount} ocultos no Submit</span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {exercise.estimatedMinutes ?? 30} min
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => evaluate('run')}
                    disabled={busy || !code.trim()}
                    className="dd-focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl border border-dd-border bg-dd-card px-4 py-2.5 text-xs font-black transition hover:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    {runningAction === 'run' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4" aria-hidden="true" />
                    )}
                    {runningAction === 'run' ? 'Running' : 'Run'}
                  </button>
                  <button
                    type="button"
                    onClick={() => evaluate('submit')}
                    disabled={busy || !code.trim()}
                    className="dd-focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-black text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    {runningAction === 'submit' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                    {runningAction === 'submit' ? 'Evaluating' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-dd-border bg-dd-card">
          <div className="flex items-center justify-between gap-3 border-b border-dd-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
              <Terminal className="h-4 w-4 text-blue-500" aria-hidden="true" />
              Console e testes
            </h2>
            {evaluation && (
              <span className="text-[11px] font-bold text-dd-muted">
                {evaluation.passedTests}/{evaluation.totalTests} passed · {evaluation.executionMs}{' '}
                ms
              </span>
            )}
          </div>

          {!evaluation ? (
            <div className="p-6 text-sm text-dd-muted">
              Use Run para testar livremente. Somente Submit registra uma submissão avaliada.
            </div>
          ) : (
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(240px,0.6fr)_minmax(0,1.4fr)]">
              <div className="rounded-xl bg-[#0d1117] p-4 font-mono text-xs leading-6 text-slate-200">
                {evaluation.error ? (
                  <p className="text-red-300">{evaluation.error}</p>
                ) : evaluation.consoleOutput ? (
                  <pre className="whitespace-pre-wrap">{evaluation.consoleOutput}</pre>
                ) : (
                  <p className="text-slate-400">Execução concluída sem saída no console.</p>
                )}
              </div>
              <div>
                {evaluation.tests.length > 0 ? (
                  <ul className="grid gap-2 md:grid-cols-2">
                    {evaluation.tests.map((test) => (
                      <TestResultRow key={test.id} test={test} />
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-dd-border p-4 text-sm text-dd-muted">
                    A execução terminou antes de produzir resultados de teste.
                  </div>
                )}
              </div>
            </div>
          )}

          {evaluation?.passed && evaluation.firstCompletion && (
            <div className="border-t border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Conhecimento demonstrado: +{evaluation.xpEarned ?? 0} XP, +
                {evaluation.gemsEarned ?? 0} joias e domínio{' '}
                {evaluation.mastery ?? exercise.knowledge.mastery}%
              </p>
            </div>
          )}

          {jumpChallenge && evaluation?.passed && lastEvaluatedAction === 'submit' && (
            <div className="border-t border-blue-500/20 bg-blue-500/[0.06] px-4 py-4">
              {jumpUnlockState === 'saving' && (
                <p className="flex items-center gap-2 text-sm font-black text-blue-500">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Salvando a liberação da seção…
                </p>
              )}

              {jumpUnlockState === 'error' && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-red-500">
                    Você passou, mas não foi possível salvar a liberação. Tente novamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => void recordJumpUnlock()}
                    className="dd-focus-ring shrink-0 rounded-xl border border-red-500/30 px-4 py-2.5 text-xs font-black text-red-500 transition hover:bg-red-500/10"
                  >
                    Salvar novamente
                  </button>
                </div>
              )}

              {jumpUnlockState === 'saved' && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Desafio concluído. A Seção {jumpChallenge.sectionNumber} foi liberada.
                  </p>
                  <Link
                    href={`/trails?view=trail&path=${encodeURIComponent(jumpChallenge.pathSlug)}&section=${jumpChallenge.sectionNumber}`}
                    className="dd-focus-ring shrink-0 rounded-xl bg-blue-500 px-4 py-2.5 text-center text-xs font-black text-white transition hover:bg-blue-600"
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
