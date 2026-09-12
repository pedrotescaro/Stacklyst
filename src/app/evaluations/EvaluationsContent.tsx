'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  RefreshCw,
  Swords,
  Columns,
  User,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { EvaluatorGuide } from '@/components/evaluators/EvaluatorGuide';
import { parseProblemFromJson } from '@/lib/duel-problems';

interface DuelSolutionItem {
  id: string;
  user_id: string;
  code: string;
  user: { id: string; username: string; avatar_url?: string | null };
}

interface DuelToEvaluate {
  id: string;
  problem_title: string;
  problem_body: string;
  language: string;
  status: string;
  challenger: { id: string; username: string; avatar_url: string | null; total_xp: number };
  opponent: { id: string; username: string; avatar_url: string | null; total_xp: number } | null;
  solutions: DuelSolutionItem[];
  evaluations: Array<{ type: string; score_player1: number; score_player2: number }>;
}

export function EvaluationsContent({ user }: { user: any }) {
  const [duels, setDuels] = useState<DuelToEvaluate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuel, setSelectedDuel] = useState<DuelToEvaluate | null>(null);

  // Review Form state
  const [scoreP1, setScoreP1] = useState(800);
  const [scoreP2, setScoreP2] = useState(800);
  const [winnerId, setWinnerId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Responsive code view mode: 'both' | 'p1' | 'p2'
  const [codeViewMode, setCodeViewMode] = useState<'both' | 'p1' | 'p2'>('both');
  const [copiedPlayer, setCopiedPlayer] = useState<'p1' | 'p2' | null>(null);

  useEffect(() => {
    loadDuels();
  }, []);

  useEffect(() => {
    setWinnerId('');
    setErrorMessage(null);
    const automatic = selectedDuel?.evaluations.find(
      (evaluation) => evaluation.type === 'AUTOMATIC'
    );
    if (!automatic) return;
    setScoreP1(automatic.score_player1);
    setScoreP2(automatic.score_player2);
  }, [selectedDuel]);

  const loadDuels = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/evaluations');
      if (res.ok) {
        const data = await res.json();
        setDuels(data);
        if (data.length > 0) {
          setSelectedDuel((prev) => {
            if (!prev) return data[0];
            const stillExists = data.find((d: DuelToEvaluate) => d.id === prev.id);
            return stillExists || data[0];
          });
        } else {
          setSelectedDuel(null);
        }
      } else {
        setErrorMessage('Não foi possível carregar a fila de avaliações.');
      }
    } catch (err) {
      console.error('Error loading evaluations:', err);
      setErrorMessage('Erro de conexão ao carregar a fila.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code: string, player: 'p1' | 'p2') => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedPlayer(player);
      setTimeout(() => {
        setCopiedPlayer((prev) => (prev === player ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDuel || !winnerId) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duel_id: selectedDuel.id,
          score_player1: Number(scoreP1),
          score_player2: Number(scoreP2),
          winner_id: winnerId,
          human_feedback: feedback,
          strengths: strengths
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          improvements: improvements
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        setSuccessMessage('Avaliação de código homologada com sucesso!');
        loadDuels();
        setFeedback('');
        setStrengths('');
        setImprovements('');
        setWinnerId('');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const errorData = await res.json().catch(() => null);
        setErrorMessage(errorData?.error || 'Erro ao homologar avaliação. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro inesperado ao enviar avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  const p1Solution = selectedDuel?.solutions.find((s) => s.user_id === selectedDuel.challenger.id);
  const p2Solution = selectedDuel?.solutions.find((s) => s.user_id === selectedDuel.opponent?.id);
  const parsedProblem = selectedDuel ? parseProblemFromJson(selectedDuel.problem_body) : null;
  const problemDescription = parsedProblem?.description ?? selectedDuel?.problem_body ?? '';

  return (
    <div className="dd-platform-shell min-h-screen">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 max-w-6xl mx-auto p-3.5 sm:p-6 md:p-8 space-y-6 pb-28 md:pb-12">
        {/* Header with responsive flex layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dd-border pb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                Avaliador de Código
              </span>
              {!loading && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-dd-surface border border-dd-border text-dd-muted">
                  {duels.length} {duels.length === 1 ? 'pendente' : 'pendentes'}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-dd-text mt-2 tracking-tight">
              Central de Avaliação Técnica
            </h1>
            <p className="text-xs sm:text-sm text-dd-muted font-medium mt-1 leading-relaxed max-w-2xl">
              Revise soluções de duelos que aguardam desempate técnico, com critérios objetivos e
              decisão humana fundamentada no código.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              onClick={loadDuels}
              disabled={loading}
              title="Atualizar fila de duelos"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dd-border bg-dd-surface hover:bg-dd-bg active:scale-95 text-xs font-bold text-dd-text transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden xs:inline">
                {loading ? 'Atualizando...' : 'Atualizar Fila'}
              </span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Collapsible Evaluator Guide */}
        <EvaluatorGuide context="evaluation" />

        {/* Loading Skeleton */}
        {loading && (
          <div className="rounded-3xl border border-dd-border bg-dd-surface/50 p-8 sm:p-12 text-center space-y-3 animate-pulse">
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
            <p className="text-xs sm:text-sm font-bold text-dd-muted">
              Carregando duelos pendentes de avaliação...
            </p>
          </div>
        )}

        {/* Empty State when queue is clear */}
        {!loading && duels.length === 0 && (
          <div className="rounded-3xl border border-dd-border bg-dd-surface/80 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5 backdrop-blur-sm shadow-sm animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fila de Avaliações em Dia
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-dd-text">
                Nenhum duelo pendente de homologação
              </h2>
              <p className="text-xs sm:text-sm text-dd-muted font-medium max-w-md mx-auto leading-relaxed">
                Todos os duelos que aguardavam desempate técnico já foram revisados. Novos desafios
                com empate ou contestação aparecerão automaticamente nesta fila.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={loadDuels}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar Fila
              </button>
              <Link
                href="/duels"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-dd-border bg-dd-bg hover:bg-dd-surface active:scale-95 text-dd-text font-bold text-xs sm:text-sm transition-all"
              >
                <Swords className="w-4 h-4 text-purple-400" />
                Ver Duelos na Plataforma
              </Link>
            </div>
          </div>
        )}

        {/* Two-column layout: Duels List & Review Workspace */}
        {!loading && duels.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Duel Queue */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs sm:text-sm font-black text-dd-text uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Fila de Duelos ({duels.length})
                </h2>
              </div>

              <div className="space-y-2">
                {duels.map((d) => {
                  const isSelected = selectedDuel?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDuel(d)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[64px] ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/60 ring-1 ring-blue-500/30 shadow-md'
                          : 'bg-dd-surface border-dd-border/70 hover:border-dd-border hover:bg-dd-surface/90'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-black text-dd-text truncate">
                          {d.problem_title}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 shrink-0">
                          {d.language}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-dd-border/40 text-[11px] sm:text-xs text-dd-muted font-medium">
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          <AuthorAvatar
                            username={d.challenger.username}
                            avatar_url={d.challenger.avatar_url}
                            size="sm"
                            className="!w-5 !h-5 border-dd-surface text-[8px]"
                          />
                          <AuthorAvatar
                            username={d.opponent?.username || 'Oponente'}
                            avatar_url={d.opponent?.avatar_url}
                            size="sm"
                            className="!w-5 !h-5 border-dd-surface text-[8px]"
                          />
                        </div>
                        <span className="truncate">
                          @{d.challenger.username} <span className="text-dd-muted/60">vs</span> @
                          {d.opponent?.username || 'Oponente'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Code Inspection & Review Form */}
            {selectedDuel && (
              <div className="lg:col-span-8 space-y-6 min-w-0">
                {/* Problem Statement Card */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-dd-surface border border-dd-border space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        Enunciado do Duelo
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-dd-text mt-1">
                        {selectedDuel.problem_title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {parsedProblem?.difficulty && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            parsedProblem.difficulty === 'Fácil'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : parsedProblem.difficulty === 'Médio'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {parsedProblem.difficulty}
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {selectedDuel.language}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-dd-muted font-medium whitespace-pre-wrap leading-relaxed">
                    {problemDescription}
                  </p>

                  {parsedProblem?.constraints && parsedProblem.constraints.length > 0 && (
                    <div className="pt-2 border-t border-dd-border/50">
                      <span className="text-[11px] font-bold text-dd-text block mb-1">
                        Restrições:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-dd-muted space-y-0.5">
                        {parsedProblem.constraints.map((constraint, i) => (
                          <li key={i}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Code Inspection Section */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <h4 className="text-xs sm:text-sm font-black text-dd-text uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      Comparação de Códigos
                    </h4>

                    {/* Responsive Segmented View Mode Toggle */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-dd-surface border border-dd-border text-xs font-bold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setCodeViewMode('both')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          codeViewMode === 'both'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-dd-muted hover:text-dd-text'
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Lado a Lado</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodeViewMode('p1')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          codeViewMode === 'p1'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-dd-muted hover:text-dd-text'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-blue-200" />
                        <span>@{selectedDuel.challenger.username}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodeViewMode('p2')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          codeViewMode === 'p2'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-dd-muted hover:text-dd-text'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-orange-200" />
                        <span>@{selectedDuel.opponent?.username || 'Oponente'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Blocks */}
                  <div
                    className={`grid gap-4 ${
                      codeViewMode === 'both' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {/* Player 1 Code */}
                    {(codeViewMode === 'both' || codeViewMode === 'p1') && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-dd-surface border border-dd-border space-y-2.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <AuthorAvatar
                              username={selectedDuel.challenger.username}
                              avatar_url={selectedDuel.challenger.avatar_url}
                              size="sm"
                              className="!w-6 !h-6"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-dd-text truncate block">
                                @{selectedDuel.challenger.username}
                              </span>
                              <span className="text-[10px] text-blue-400 font-semibold block">
                                Jogador 1 (Desafiante)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-dd-muted px-1.5 py-0.5 rounded bg-dd-bg">
                              {p1Solution ? `${p1Solution.code.length} chars` : 'Sem envio'}
                            </span>
                            {p1Solution?.code && (
                              <button
                                type="button"
                                onClick={() => handleCopyCode(p1Solution.code, 'p1')}
                                className="inline-flex items-center gap-1 p-1 sm:px-2 sm:py-1 rounded-lg border border-dd-border bg-dd-bg hover:bg-dd-surface text-[10px] font-bold text-dd-muted hover:text-dd-text transition-all cursor-pointer"
                                title="Copiar código do Jogador 1"
                              >
                                {copiedPlayer === 'p1' ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="hidden sm:inline text-emerald-400">
                                      Copiado
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span className="hidden sm:inline">Copiar</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <pre className="p-3 sm:p-4 rounded-xl bg-dd-bg/90 border border-dd-border/60 text-[11px] sm:text-xs font-mono text-dd-text overflow-x-auto max-h-72 sm:max-h-96 md:max-h-[28rem] leading-relaxed select-text">
                          {p1Solution?.code || '// Nenhum código enviado ainda pelo participante.'}
                        </pre>
                      </div>
                    )}

                    {/* Player 2 Code */}
                    {(codeViewMode === 'both' || codeViewMode === 'p2') && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-dd-surface border border-dd-border space-y-2.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <AuthorAvatar
                              username={selectedDuel.opponent?.username || 'Oponente'}
                              avatar_url={selectedDuel.opponent?.avatar_url}
                              size="sm"
                              className="!w-6 !h-6"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-dd-text truncate block">
                                @{selectedDuel.opponent?.username || 'Oponente'}
                              </span>
                              <span className="text-[10px] text-orange-400 font-semibold block">
                                Jogador 2 (Oponente)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-dd-muted px-1.5 py-0.5 rounded bg-dd-bg">
                              {p2Solution ? `${p2Solution.code.length} chars` : 'Sem envio'}
                            </span>
                            {p2Solution?.code && (
                              <button
                                type="button"
                                onClick={() => handleCopyCode(p2Solution.code, 'p2')}
                                className="inline-flex items-center gap-1 p-1 sm:px-2 sm:py-1 rounded-lg border border-dd-border bg-dd-bg hover:bg-dd-surface text-[10px] font-bold text-dd-muted hover:text-dd-text transition-all cursor-pointer"
                                title="Copiar código do Jogador 2"
                              >
                                {copiedPlayer === 'p2' ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="hidden sm:inline text-emerald-400">
                                      Copiado
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span className="hidden sm:inline">Copiar</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <pre className="p-3 sm:p-4 rounded-xl bg-dd-bg/90 border border-dd-border/60 text-[11px] sm:text-xs font-mono text-dd-text overflow-x-auto max-h-72 sm:max-h-96 md:max-h-[28rem] leading-relaxed select-text">
                          {p2Solution?.code || '// Nenhum código enviado ainda pelo participante.'}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Human Review Form */}
                <form
                  onSubmit={handleSubmitEvaluation}
                  className="p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-dd-surface border border-dd-border space-y-5 shadow-sm"
                >
                  <div className="border-b border-dd-border pb-3.5">
                    <h3 className="text-base sm:text-lg font-black text-dd-text flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      Formulário de Homologação da Avaliação
                    </h3>
                    <p className="text-xs text-dd-muted font-medium mt-1">
                      Defina notas fundamentadas e selecione o participante vencedor do desempate.
                    </p>
                  </div>

                  {/* Winner Selection with touch-friendly cards */}
                  <fieldset className="space-y-2.5">
                    <legend className="text-xs sm:text-sm font-bold text-dd-text">
                      Vencedor do desempate <span className="text-rose-400">*</span>
                    </legend>
                    <p className="text-[11px] sm:text-xs text-dd-muted leading-relaxed">
                      A decisão é explícita e soberana do avaliador humano, fundamentada na análise
                      do código.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all cursor-pointer min-h-[52px] select-none ${
                          winnerId === selectedDuel.challenger.id
                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30 shadow-sm'
                            : 'border-dd-border bg-dd-bg/60 hover:bg-dd-bg hover:border-dd-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="duel-winner"
                          value={selectedDuel.challenger.id}
                          checked={winnerId === selectedDuel.challenger.id}
                          onChange={(event) => setWinnerId(event.target.value)}
                          className="accent-blue-500 w-4 h-4 shrink-0"
                          required
                        />
                        <AuthorAvatar
                          username={selectedDuel.challenger.username}
                          avatar_url={selectedDuel.challenger.avatar_url}
                          size="sm"
                          className="!w-7 !h-7"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs sm:text-sm font-black text-dd-text block truncate">
                            @{selectedDuel.challenger.username}
                          </span>
                          <span className="text-[10px] text-blue-400 font-semibold block">
                            Jogador 1 (Desafiante)
                          </span>
                        </div>
                      </label>

                      {selectedDuel.opponent && (
                        <label
                          className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all cursor-pointer min-h-[52px] select-none ${
                            winnerId === selectedDuel.opponent.id
                              ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30 shadow-sm'
                              : 'border-dd-border bg-dd-bg/60 hover:bg-dd-bg hover:border-dd-border'
                          }`}
                        >
                          <input
                            type="radio"
                            name="duel-winner"
                            value={selectedDuel.opponent.id}
                            checked={winnerId === selectedDuel.opponent.id}
                            onChange={(event) => setWinnerId(event.target.value)}
                            className="accent-orange-500 w-4 h-4 shrink-0"
                            required
                          />
                          <AuthorAvatar
                            username={selectedDuel.opponent.username}
                            avatar_url={selectedDuel.opponent.avatar_url}
                            size="sm"
                            className="!w-7 !h-7"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-black text-dd-text block truncate">
                              @{selectedDuel.opponent.username}
                            </span>
                            <span className="text-[10px] text-orange-400 font-semibold block">
                              Jogador 2 (Oponente)
                            </span>
                          </div>
                        </label>
                      )}
                    </div>
                  </fieldset>

                  {/* Scores Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-dd-text mb-1.5">
                        Nota Jogador 1 (@{selectedDuel.challenger.username}){' '}
                        <span className="text-dd-muted font-normal">[0 - 1000]</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={scoreP1}
                        onChange={(e) => setScoreP1(Number(e.target.value))}
                        className="w-full bg-dd-bg border border-dd-border rounded-xl p-3 text-sm font-bold text-dd-text outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dd-text mb-1.5">
                        Nota Jogador 2 (@{selectedDuel.opponent?.username || 'Oponente'}){' '}
                        <span className="text-dd-muted font-normal">[0 - 1000]</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={scoreP2}
                        onChange={(e) => setScoreP2(Number(e.target.value))}
                        className="w-full bg-dd-bg border border-dd-border rounded-xl p-3 text-sm font-bold text-dd-text outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Technical Feedback Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1.5">
                      Feedback Geral e Critérios Técnicos <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Explique a avaliação de legibilidade, desempenho, casos limite e por que a solução vencedora se destacou..."
                      className="w-full bg-dd-bg border border-dd-border rounded-xl p-3.5 text-sm font-medium text-dd-text outline-none focus:border-blue-500 resize-none leading-relaxed transition-colors"
                    />
                    <p className="text-[11px] text-dd-muted mt-1">
                      Dica: cite funções, variáveis ou trechos de código específicos para
                      fundamentar sua decisão.
                    </p>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-dd-text mb-1.5">
                        Pontos Fortes{' '}
                        <span className="text-dd-muted font-normal">(separados por vírgula)</span>
                      </label>
                      <input
                        type="text"
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        placeholder="Clean code, Tipagem estrita, Performance"
                        className="w-full bg-dd-bg border border-dd-border rounded-xl p-3 text-sm font-medium text-dd-text outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dd-text mb-1.5">
                        Pontos de Melhoria{' '}
                        <span className="text-dd-muted font-normal">(separados por vírgula)</span>
                      </label>
                      <input
                        type="text"
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                        placeholder="Tratamento de erros, Nomenclatura, Edge cases"
                        className="w-full bg-dd-bg border border-dd-border rounded-xl p-3 text-sm font-medium text-dd-text outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !winnerId}
                    className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Homologando Avaliação...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-200" />
                        <span>Homologar Avaliação e Concluir Duelo</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
