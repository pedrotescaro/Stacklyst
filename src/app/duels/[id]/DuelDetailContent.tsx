'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Clock3,
  Code2,
  FlaskConical,
  Gauge,
  Loader2,
  Play,
  Send,
  Swords,
  Terminal,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { CodeEditor } from '@/components/CodeEditor';
import { cn } from '@/lib/cn';
import { DUEL_PROBLEMS, parseProblemFromJson, type DuelProblem } from '@/lib/duel-problems';
import { ACTIVE_DUEL_POLL_INTERVAL_MS, PENDING_DUEL_POLL_INTERVAL_MS } from '@/lib/duels/constants';

type DuelStatus = 'PENDING' | 'ACTIVE' | 'REVIEW_PENDING' | 'CLOSED' | 'EXPIRED';
type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'JUDGE_UNAVAILABLE';

interface Player {
  id: string;
  username: string;
  avatar_url?: string | null;
}

interface Submission {
  id: string;
  status: SubmissionStatus;
  passed_tests: number;
  total_tests: number;
  runtime_ms: number | null;
  complexity: string | null;
  complexity_score?: number;
  score: number;
  created_at: string;
}

interface TestResult {
  id: string;
  passed: boolean;
  error?: string;
}

interface Judgment {
  status: SubmissionStatus;
  passedTests: number;
  totalTests: number;
  publicPassedTests: number;
  publicTotalTests: number;
  runtimeMs: number | null;
  complexity: string;
  complexityConfidence: 'medium' | 'low' | null;
  complexityReason: string | null;
  complexityScore: number;
  score: number;
  publicResult: TestResult[];
  error?: string;
}

interface DuelData {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  winner_id: string | null;
  problem_title: string;
  problem_body: string;
  problem_id: string | null;
  language: string;
  status: DuelStatus;
  time_limit_seconds: number;
  match_deadline: string | null;
  started_at: string | null;
  finished_at: string | null;
  closed_reason: string | null;
  created_at: string;
  challenger: Player;
  opponent: Player | null;
  winner?: { id: string; username: string } | null;
  solutions: Array<{
    id: string;
    user_id: string;
    code: string;
    score: number;
    runtime_ms: number | null;
    complexity: string | null;
    submitted_at: string;
  }>;
  submissions: Submission[];
  evaluations: Array<{
    type: string;
    score_player1: number;
    score_player2: number;
    human_feedback: string | null;
    created_at: string;
  }>;
}

interface DuelDetailContentProps {
  user: Player & { total_xp: number };
  initialDuel: DuelData;
}

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  ACCEPTED: 'Aceita',
  WRONG_ANSWER: 'Resposta incorreta',
  COMPILE_ERROR: 'Erro de compilação',
  RUNTIME_ERROR: 'Erro de execução',
  TIME_LIMIT_EXCEEDED: 'Tempo excedido',
  JUDGE_UNAVAILABLE: 'Juiz indisponível',
};

function secondsUntil(iso: string | null) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function statusTone(status: SubmissionStatus) {
  if (status === 'ACCEPTED') return 'text-emerald-600 dark:text-emerald-400';
  if (status === 'JUDGE_UNAVAILABLE') return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export function DuelDetailContent({ user, initialDuel }: DuelDetailContentProps) {
  const router = useRouter();
  const [duel, setDuel] = useState(initialDuel);
  const [leftTab, setLeftTab] = useState<'problem' | 'submissions'>('problem');
  const [bottomTab, setBottomTab] = useState<'cases' | 'result' | 'console'>('cases');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<'problem' | 'code'>('problem');
  const [runningAction, setRunningAction] = useState<'run' | 'submit' | null>(null);
  const [judgment, setJudgment] = useState<Judgment | null>(null);
  const [consoleOutput, setConsoleOutput] = useState('Execute o código para ver o resultado.');
  const [actionError, setActionError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const refreshInFlight = useRef(false);

  const problem = useMemo<DuelProblem>(() => {
    const parsed = parseProblemFromJson(duel.problem_body);
    if (parsed) return parsed;
    return (
      DUEL_PROBLEMS.find(
        (item) => item.title.toLowerCase() === duel.problem_title.toLowerCase()
      ) ?? {
        id: duel.problem_id ?? 'legacy-duel',
        title: duel.problem_title,
        difficulty: 'Médio',
        description: duel.problem_body,
        functionName: 'solve',
        starters: { TS: '', JS: '', PYTHON: '' },
        testCases: [],
      }
    );
  }, [duel.problem_body, duel.problem_id, duel.problem_title]);

  const language = duel.language.toUpperCase();
  const ownSolution = duel.solutions.find((solution) => solution.user_id === user.id);
  const starter = ownSolution?.code || problem.starters[language] || problem.starters.TS || '';
  const [code, setCode] = useState(starter);
  const isParticipant = duel.challenger_id === user.id || duel.opponent_id === user.id;
  const editable = duel.status === 'ACTIVE' && isParticipant;
  const activeDeadline = duel.started_at
    ? new Date(duel.started_at).getTime() + duel.time_limit_seconds * 1000
    : null;
  const timeLeft = activeDeadline
    ? Math.max(0, Math.ceil((activeDeadline - now) / 1000))
    : secondsUntil(duel.match_deadline);
  const opponent = duel.challenger_id === user.id ? duel.opponent : duel.challenger;
  const selectedTestCase =
    problem.testCases.find((testCase) => testCase.id === selectedTestCaseId) ??
    problem.testCases[0] ??
    null;
  const selectedTestCaseIndex = selectedTestCase
    ? problem.testCases.findIndex((testCase) => testCase.id === selectedTestCase.id)
    : -1;
  const selectedTestResult = selectedTestCase
    ? judgment?.publicResult.find((item) => item.id === selectedTestCase.id)
    : undefined;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!editable) return;
    const saved = window.localStorage.getItem(`stacklyst-duel-draft:${duel.id}:${user.id}`);
    if (saved) setCode(saved);
  }, [duel.id, editable, user.id]);

  useEffect(() => {
    if (!editable) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(`stacklyst-duel-draft:${duel.id}:${user.id}`, code);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [code, duel.id, editable, user.id]);

  const refreshState = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;

    try {
      const response = await fetch(`/api/duels/${duel.id}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) return;
      const data = await response.json();
      setDuel((current) => ({
        ...current,
        ...data,
        started_at: data.started_at ?? current.started_at,
        finished_at: data.finished_at ?? current.finished_at,
        opponent: data.opponent ?? current.opponent,
        submissions: data.submissions ?? current.submissions,
        evaluations: data.evaluations ?? current.evaluations,
      }));
    } catch {
      // A transient polling failure must not interrupt the waiting room. The
      // next interval retries while the local draft and countdown stay intact.
    } finally {
      refreshInFlight.current = false;
    }
  }, [duel.id]);

  useEffect(() => {
    if (!['PENDING', 'ACTIVE', 'REVIEW_PENDING'].includes(duel.status)) return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshState();
    };
    refreshWhenVisible();

    const interval =
      duel.status === 'PENDING' ? PENDING_DUEL_POLL_INTERVAL_MS : ACTIVE_DUEL_POLL_INTERVAL_MS;
    const timer = window.setInterval(refreshWhenVisible, interval);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [duel.status, refreshState]);

  const evaluate = async (action: 'run' | 'submit') => {
    if (!editable || runningAction || !code.trim()) return;
    setRunningAction(action);
    setActionError(null);
    setBottomTab('result');
    try {
      const response = await fetch(
        `/api/duels/${duel.id}/${action === 'run' ? 'run' : 'solution'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setActionError(data.error ?? 'Não foi possível avaliar a solução.');
        setConsoleOutput(data.error ?? 'Falha na avaliação.');
        if (data.duel) setDuel((current) => ({ ...current, ...data.duel }));
        return;
      }

      const result = data.judgment as Judgment;
      setJudgment(result);
      setConsoleOutput(
        result.error ??
          `${result.publicPassedTests}/${result.publicTotalTests} testes públicos concluídos em ${result.runtimeMs ?? 0} ms.`
      );
      if (action === 'submit' && data.submission) {
        setDuel((current) => ({
          ...current,
          submissions: [
            data.submission,
            ...current.submissions.filter((s) => s.id !== data.submission.id),
          ],
          ...(data.duel ?? {}),
        }));
        if (result.status === 'ACCEPTED') {
          window.localStorage.removeItem(`stacklyst-duel-draft:${duel.id}:${user.id}`);
        }
      }
      await refreshState();
    } catch {
      setActionError('Não foi possível conectar ao juiz. Tente novamente.');
      setConsoleOutput(
        'O serviço de avaliação não respondeu. Seu código continua salvo neste dispositivo.'
      );
    } finally {
      setRunningAction(null);
    }
  };

  const joinDuel = async () => {
    setJoining(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/duels/${duel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível entrar no duelo.');
      setDuel((current) => ({ ...current, ...data.duel }));
      setMobilePane('code');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível entrar no duelo.');
    } finally {
      setJoining(false);
    }
  };

  const deleteDuel = async () => {
    if (!window.confirm('Excluir este duelo permanentemente?')) return;
    setDeleting(true);
    const response = await fetch(`/api/duels/${duel.id}`, { method: 'DELETE' });
    if (response.ok) {
      router.push('/duels');
      router.refresh();
      return;
    }
    const data = await response.json().catch(() => ({}));
    setActionError(data.error ?? 'Não foi possível excluir o duelo.');
    setDeleting(false);
  };

  if (duel.status === 'PENDING' || duel.status === 'EXPIRED') {
    const ownPending = duel.challenger_id === user.id;
    return (
      <div className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-blue-500/35 selection:text-white">
        <Sidebar user={user} />
        <main className="flex min-h-screen min-w-0 flex-1 items-center justify-center bg-dd-bg p-4 md:p-8">
          <section className="w-full max-w-2xl rounded-2xl border border-dd-border bg-dd-card p-6 sm:p-8">
            <Link
              href="/duels"
              className="dd-focus-ring inline-flex items-center gap-2 text-sm font-bold text-dd-muted hover:text-dd-text"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar à arena
            </Link>
            <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-balance text-2xl font-black tracking-[-0.025em] text-dd-text sm:text-3xl">
              {duel.status === 'EXPIRED' ? 'Este duelo foi encerrado' : 'Aguardando um oponente'}
            </h1>
            <p className="mt-3 max-w-[65ch] text-sm leading-6 text-dd-muted">
              {duel.status === 'EXPIRED'
                ? 'Nenhum jogador compatível foi encontrado em 24 horas. O duelo não será iniciado.'
                : ownPending
                  ? 'A arena procura um jogador compatível e abrirá o desafio automaticamente assim que alguém entrar. Depois do início, vocês terão 2 horas para responder.'
                  : 'Entre agora para assumir a segunda vaga e iniciar o cronômetro do desafio.'}
            </p>
            {duel.status === 'PENDING' && ownPending && (
              <div
                className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400"
                role="status"
                aria-live="polite"
              >
                <span
                  className="h-2 w-2 rounded-full bg-blue-500 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Sala sincronizada — você não precisa atualizar a página
              </div>
            )}
            {duel.status === 'PENDING' && (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-dd-border bg-dd-surface px-4 py-3">
                <Clock3 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold text-dd-muted">Janela de pareamento</p>
                  <p className="font-mono text-lg font-bold tabular-nums text-dd-text">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            )}
            {actionError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
                {actionError}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              {duel.status === 'PENDING' && !ownPending && (
                <button
                  type="button"
                  onClick={joinDuel}
                  disabled={joining}
                  className="dd-focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-400 disabled:opacity-50"
                >
                  {joining ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Swords className="h-4 w-4" aria-hidden="true" />
                  )}
                  {joining ? 'Entrando…' : 'Aceitar e entrar'}
                </button>
              )}
              {(ownPending || duel.status === 'EXPIRED') && (
                <button
                  type="button"
                  onClick={deleteDuel}
                  disabled={deleting}
                  className="dd-focus-ring inline-flex items-center gap-2 rounded-xl border border-red-500/35 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  Excluir duelo
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  const outcome =
    duel.status === 'REVIEW_PENDING'
      ? 'Empate técnico: avaliação humana solicitada'
      : duel.status === 'CLOSED'
        ? duel.winner_id === user.id
          ? 'Vitória confirmada'
          : duel.winner_id
            ? 'Duelo encerrado'
            : 'Duelo encerrado sem vencedor'
        : null;

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen h-dvh overflow-hidden bg-dd-bg selection:bg-blue-500/35 selection:text-white">
      <Sidebar user={user} />
      <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col text-dd-text">
        <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-dd-border bg-dd-card px-3 sm:px-4">
          <Link
            href="/duels"
            aria-label="Voltar à arena"
            className="dd-focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-dd-muted transition hover:bg-dd-surface hover:text-dd-text"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Swords
            className="hidden h-4 w-4 text-blue-600 dark:text-blue-400 sm:block"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-black tracking-[-0.015em]">{problem.title}</h1>
            <p className="truncate text-[11px] text-dd-muted">
              {user.username} vs. {opponent?.username ?? 'aguardando'}
            </p>
          </div>
          <span className="hidden rounded-md bg-dd-surface px-2 py-1 text-[10px] font-black uppercase text-dd-muted sm:inline">
            {language}
          </span>
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold tabular-nums',
              timeLeft <= 60 && duel.status === 'ACTIVE'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-dd-surface text-dd-text'
            )}
          >
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {formatTime(timeLeft)}
          </div>
          <button
            type="button"
            onClick={() => void evaluate('run')}
            disabled={!editable || Boolean(runningAction) || !code.trim()}
            className="dd-focus-ring hidden items-center gap-2 rounded-lg border border-dd-border bg-dd-card px-3 py-2 text-xs font-bold transition hover:border-blue-500/50 disabled:opacity-45 sm:inline-flex"
          >
            {runningAction === 'run' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
            )}{' '}
            Executar
          </button>
          <button
            type="button"
            onClick={() => void evaluate('submit')}
            disabled={!editable || Boolean(runningAction) || !code.trim()}
            className="dd-focus-ring inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-400 disabled:opacity-45"
          >
            {runningAction === 'submit' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            )}{' '}
            Submit
          </button>
        </header>

        {outcome && (
          <div
            className={cn(
              'flex shrink-0 items-center gap-2 border-b px-4 py-2 text-xs font-bold',
              duel.status === 'REVIEW_PENDING'
                ? 'border-amber-500/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300'
                : 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300'
            )}
            role="status"
          >
            {duel.status === 'REVIEW_PENDING' ? (
              <CircleAlert className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Trophy className="h-4 w-4" aria-hidden="true" />
            )}
            {outcome}
            {duel.winner?.username ? ` — ${duel.winner.username}` : ''}
          </div>
        )}

        <div
          className="flex shrink-0 border-b border-dd-border lg:hidden"
          aria-label="Área da arena"
        >
          {(['problem', 'code'] as const).map((pane) => (
            <button
              key={pane}
              type="button"
              onClick={() => setMobilePane(pane)}
              className={cn(
                'dd-focus-ring flex-1 px-4 py-2.5 text-xs font-black',
                mobilePane === pane
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-dd-muted'
              )}
            >
              {pane === 'problem' ? 'Problema' : 'Código'}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(340px,42%)_minmax(0,58%)]">
          <section
            className={cn(
              'min-h-0 border-r border-dd-border bg-dd-bg',
              mobilePane !== 'problem' && 'hidden lg:block'
            )}
          >
            <div
              className="flex h-11 items-end gap-1 border-b border-dd-border px-3"
              role="tablist"
              aria-label="Detalhes do desafio"
            >
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'problem'}
                onClick={() => setLeftTab('problem')}
                className={cn(
                  'dd-focus-ring h-full border-b-2 px-3 text-xs font-bold',
                  leftTab === 'problem'
                    ? 'border-blue-500 text-dd-text'
                    : 'border-transparent text-dd-muted'
                )}
              >
                Descrição
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'submissions'}
                onClick={() => setLeftTab('submissions')}
                className={cn(
                  'dd-focus-ring h-full border-b-2 px-3 text-xs font-bold',
                  leftTab === 'submissions'
                    ? 'border-blue-500 text-dd-text'
                    : 'border-transparent text-dd-muted'
                )}
              >
                Submissões <span className="ml-1 text-dd-muted">{duel.submissions.length}</span>
              </button>
            </div>
            <div className="h-[calc(100%_-_2.75rem)] overflow-y-auto p-5 sm:p-6">
              {leftTab === 'problem' ? (
                <article className="mx-auto max-w-[72ch]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-black tracking-[-0.025em]">{problem.title}</h2>
                    <span
                      className={cn(
                        'text-xs font-bold',
                        problem.difficulty === 'Fácil'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : problem.difficulty === 'Difícil'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-dd-text/90">
                    {problem.description}
                  </p>
                  {problem.constraints && problem.constraints.length > 0 && (
                    <section className="mt-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
                        Restrições
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-dd-muted">
                        {problem.constraints.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section className="mt-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
                      Exemplos
                    </h3>
                    {problem.testCases.map((testCase, index) => (
                      <div key={testCase.id} className="border-t border-dd-border pt-4">
                        <p className="text-xs font-black text-dd-text">Exemplo {index + 1}</p>
                        <dl className="mt-2 grid gap-2 font-mono text-xs">
                          <div>
                            <dt className="inline font-bold text-dd-muted">Entrada: </dt>
                            <dd className="inline text-dd-text">{testCase.inputDisplay}</dd>
                          </div>
                          <div>
                            <dt className="inline font-bold text-dd-muted">Saída: </dt>
                            <dd className="inline text-dd-text">{testCase.expectedDisplay}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </section>
                  <section className="mt-8 border-t border-dd-border pt-5 text-xs leading-5 text-dd-muted">
                    <p>
                      O Submit avalia casos públicos e ocultos. A correção vale 700 pontos; a
                      estimativa heurística de complexidade vale até 200; o tempo de execução vale
                      até 100.
                    </p>
                    <p className="mt-2">
                      A complexidade é uma estimativa estática, não uma prova formal de Big-O.
                      Empates técnicos seguem para avaliação humana.
                    </p>
                  </section>
                </article>
              ) : duel.submissions.length > 0 ? (
                <ol className="space-y-2">
                  {duel.submissions.map((submission) => (
                    <li
                      key={submission.id}
                      className="rounded-xl border border-dd-border bg-dd-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={cn('text-sm font-black', statusTone(submission.status))}>
                            {STATUS_LABELS[submission.status]}
                          </p>
                          <p className="mt-1 text-[11px] text-dd-muted">
                            {new Date(submission.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold tabular-nums">
                          {submission.score}/1000
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dd-muted">
                        <span>
                          {submission.passed_tests}/{submission.total_tests} testes
                        </span>
                        <span>{submission.runtime_ms ?? '—'} ms</span>
                        <span>{submission.complexity ?? 'Não medida'}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <Send className="h-7 w-7 text-dd-muted" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold">Nenhuma submissão ainda</p>
                  <p className="mt-1 text-xs text-dd-muted">
                    Execute casos públicos e envie quando estiver pronto.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section
            className={cn(
              'grid min-h-0 grid-rows-[minmax(260px,1fr)_minmax(190px,0.46fr)] bg-dd-bg',
              mobilePane !== 'code' && 'hidden lg:grid'
            )}
          >
            <div className="min-h-0 overflow-hidden border-b border-dd-border">
              <div className="flex h-10 items-center justify-between border-b border-dd-border bg-dd-card px-3">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  Código{' '}
                  <span className="rounded bg-dd-surface px-1.5 py-0.5 text-[10px] text-dd-muted">
                    {language}
                  </span>
                </div>
                <span className="text-[11px] text-dd-muted">
                  {editable ? 'Rascunho salvo localmente' : 'Somente leitura'}
                </span>
              </div>
              <div className="h-[calc(100%_-_2.5rem)]">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="100%"
                  readOnly={!editable}
                  ariaLabel={`Editor de solução em ${language}`}
                />
              </div>
            </div>
            <div className="min-h-0 bg-dd-card">
              <div
                className="flex h-10 items-end gap-1 border-b border-dd-border px-3"
                role="tablist"
                aria-label="Resultados da execução"
              >
                {(
                  [
                    ['cases', 'Casos de teste'],
                    ['result', 'Resultado'],
                    ['console', 'Console'],
                  ] as const
                ).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={bottomTab === tab}
                    onClick={() => setBottomTab(tab)}
                    className={cn(
                      'dd-focus-ring flex h-full items-center gap-1.5 border-b-2 px-2.5 text-[11px] font-bold',
                      bottomTab === tab
                        ? 'border-blue-500 text-dd-text'
                        : 'border-transparent text-dd-muted'
                    )}
                  >
                    {tab === 'cases' ? (
                      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : tab === 'console' ? (
                      <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {label}
                  </button>
                ))}
              </div>
              <div className="h-[calc(100%_-_2.5rem)] overflow-y-auto p-4" aria-live="polite">
                {bottomTab === 'cases' && (
                  <div className="flex flex-wrap gap-2">
                    {problem.testCases.map((testCase, index) => {
                      const result = judgment?.publicResult.find((item) => item.id === testCase.id);
                      return (
                        <button
                          key={testCase.id}
                          type="button"
                          aria-pressed={selectedTestCase?.id === testCase.id}
                          onClick={() => {
                            setSelectedTestCaseId(testCase.id);
                            setBottomTab('result');
                          }}
                          className={cn(
                            'dd-focus-ring inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold',
                            selectedTestCase?.id === testCase.id
                              ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-200'
                              : result?.passed
                                ? 'border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-300'
                                : result
                                  ? 'border-red-500/30 bg-red-500/[0.07] text-red-700 dark:text-red-300'
                                  : 'border-dd-border bg-dd-card text-dd-muted'
                          )}
                        >
                          {result?.passed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : result ? (
                            <CircleX className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          Caso {index + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
                {bottomTab === 'result' && (
                  <div className="space-y-4">
                    {selectedTestCase && (
                      <section className="rounded-xl border border-dd-border bg-dd-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xs font-black text-dd-text">
                            Caso {selectedTestCaseIndex + 1}
                          </h3>
                          <span
                            className={cn(
                              'text-[11px] font-bold',
                              selectedTestResult?.passed
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : selectedTestResult
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-dd-muted'
                            )}
                          >
                            {selectedTestResult?.passed
                              ? 'Passou'
                              : selectedTestResult
                                ? 'Não passou'
                                : 'Ainda não executado'}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-dd-muted">
                          {selectedTestCase.description}
                        </p>
                        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                          <div className="rounded-lg border border-dd-border/70 bg-dd-bg p-3">
                            <dt className="font-bold text-dd-muted">Entrada</dt>
                            <dd className="mt-1 whitespace-pre-wrap font-mono text-dd-text">
                              {selectedTestCase.inputDisplay}
                            </dd>
                          </div>
                          <div className="rounded-lg border border-dd-border/70 bg-dd-bg p-3">
                            <dt className="font-bold text-dd-muted">Saída esperada</dt>
                            <dd className="mt-1 whitespace-pre-wrap font-mono text-emerald-700 dark:text-emerald-300">
                              {selectedTestCase.expectedDisplay}
                            </dd>
                          </div>
                        </dl>
                        {selectedTestResult?.error && (
                          <p className="mt-3 text-[11px] leading-5 text-red-700 dark:text-red-300">
                            {selectedTestResult.error}
                          </p>
                        )}
                      </section>
                    )}

                    {judgment ? (
                      <section className="border-t border-dd-border pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className={cn('text-sm font-black', statusTone(judgment.status))}>
                            {STATUS_LABELS[judgment.status]}
                          </p>
                          <span className="font-mono text-sm font-bold tabular-nums">
                            {judgment.score}/1000
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                          <Metric
                            label="Testes"
                            value={`${judgment.passedTests}/${judgment.totalTests}`}
                          />
                          <Metric
                            label="Execução"
                            value={judgment.runtimeMs === null ? '—' : `${judgment.runtimeMs} ms`}
                          />
                          <Metric label="Complexidade" value={judgment.complexity} />
                          <Metric
                            label="Pontos de eficiência"
                            value={`${judgment.complexityScore}/200`}
                          />
                        </div>
                        {judgment.error && (
                          <p className="mt-4 text-xs leading-5 text-red-700 dark:text-red-300">
                            {judgment.error}
                          </p>
                        )}
                        {judgment.complexityReason && (
                          <p className="mt-3 text-[11px] leading-5 text-dd-muted">
                            Estimativa heurística: {judgment.complexityReason}
                          </p>
                        )}
                      </section>
                    ) : !selectedTestCase ? (
                      <EmptyResult />
                    ) : null}
                  </div>
                )}
                {bottomTab === 'console' && (
                  <pre
                    className={cn(
                      'whitespace-pre-wrap font-mono text-xs leading-5',
                      actionError ? 'text-red-700 dark:text-red-300' : 'text-dd-muted'
                    )}
                  >
                    {consoleOutput}
                  </pre>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-dd-border bg-dd-card p-3 sm:hidden">
          <button
            type="button"
            onClick={() => void evaluate('run')}
            disabled={!editable || Boolean(runningAction) || !code.trim()}
            className="dd-focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg border border-dd-border px-3 py-2.5 text-xs font-bold disabled:opacity-45"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Executar
          </button>
          <button
            type="button"
            onClick={() => void evaluate('submit')}
            disabled={!editable || Boolean(runningAction) || !code.trim()}
            className="dd-focus-ring flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-black text-white disabled:opacity-45"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Submit
          </button>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-dd-border pl-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-dd-muted">{label}</p>
      <p className="mt-1 font-mono font-bold tabular-nums text-dd-text">{value}</p>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex h-full min-h-24 flex-col items-center justify-center text-center">
      <FlaskConical className="h-6 w-6 text-dd-muted" aria-hidden="true" />
      <p className="mt-2 text-xs text-dd-muted">Execute o código para avaliar os casos públicos.</p>
    </div>
  );
}
