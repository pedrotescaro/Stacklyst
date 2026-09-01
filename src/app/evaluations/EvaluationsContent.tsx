'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, ShieldCheck, FileCode } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { parseProblemFromJson } from '@/lib/duel-problems';

interface DuelSolutionItem {
  id: string;
  user_id: string;
  code: string;
  user: { id: string; username: string };
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

  useEffect(() => {
    loadDuels();
  }, []);

  useEffect(() => {
    setWinnerId('');
    const automatic = selectedDuel?.evaluations.find(
      (evaluation) => evaluation.type === 'AUTOMATIC'
    );
    if (!automatic) return;
    setScoreP1(automatic.score_player1);
    setScoreP2(automatic.score_player2);
  }, [selectedDuel]);

  const loadDuels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evaluations');
      if (res.ok) {
        const data = await res.json();
        setDuels(data);
        if (data.length > 0) setSelectedDuel(data[0]);
      }
    } catch (err) {
      console.error('Error loading evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDuel || !winnerId) return;

    setSubmitting(true);
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const p1Solution = selectedDuel?.solutions.find((s) => s.user_id === selectedDuel.challenger.id);
  const p2Solution = selectedDuel?.solutions.find((s) => s.user_id === selectedDuel.opponent?.id);

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dd-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                Avaliador de Código
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-dd-text mt-2">
              Central de Avaliação Técnica
            </h1>
            <p className="text-sm text-dd-muted font-medium mt-1">
              Revise o código de participantes em duelos e processos seletivos com critérios
              objetivos e decisão humana.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Two-column layout: Duels List & Review Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Duel Queue */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-dd-text uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Fila de Duelos ({duels.length})
            </h2>

            {loading ? (
              <div className="p-6 text-center text-xs text-dd-muted font-bold">
                Carregando fila...
              </div>
            ) : duels.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-dd-surface border border-dd-border text-xs text-dd-muted font-bold">
                Nenhum duelo pendente de avaliação.
              </div>
            ) : (
              <div className="space-y-2">
                {duels.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDuel(d)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedDuel?.id === d.id
                        ? 'bg-blue-500/10 border-blue-500/50 shadow-md'
                        : 'bg-dd-surface border-dd-border/70 hover:border-dd-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-dd-text truncate">
                        {d.problem_title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        {d.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-dd-muted mt-1 font-medium">
                      @{d.challenger.username} vs @{d.opponent?.username || 'Oponente'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Code Inspection & Review Form */}
          {selectedDuel && (
            <div className="lg:col-span-2 space-y-6">
              {/* Problem Statement */}
              <div className="p-5 rounded-2xl bg-dd-surface border border-dd-border space-y-2">
                <h3 className="text-base font-black text-dd-text">{selectedDuel.problem_title}</h3>
                <p className="text-xs text-dd-muted font-medium whitespace-pre-wrap">
                  {parseProblemFromJson(selectedDuel.problem_body)?.description ??
                    selectedDuel.problem_body}
                </p>
              </div>

              {/* Code comparison side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Player 1 Code */}
                <div className="p-4 rounded-2xl bg-dd-surface border border-dd-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-dd-text flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-blue-400" />@
                      {selectedDuel.challenger.username} (Jogador 1)
                    </span>
                    <span className="text-[10px] font-mono text-dd-muted">
                      {p1Solution ? `${p1Solution.code.length} chars` : 'Sem envio'}
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-dd-bg border border-dd-border/50 text-[11px] font-mono text-dd-text overflow-x-auto max-h-60">
                    {p1Solution?.code || '// Nenhum código enviado ainda'}
                  </pre>
                </div>

                {/* Player 2 Code */}
                <div className="p-4 rounded-2xl bg-dd-surface border border-dd-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-dd-text flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-orange-400" />@
                      {selectedDuel.opponent?.username || 'Oponente'} (Jogador 2)
                    </span>
                    <span className="text-[10px] font-mono text-dd-muted">
                      {p2Solution ? `${p2Solution.code.length} chars` : 'Sem envio'}
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-dd-bg border border-dd-border/50 text-[11px] font-mono text-dd-text overflow-x-auto max-h-60">
                    {p2Solution?.code || '// Nenhum código enviado ainda'}
                  </pre>
                </div>
              </div>

              {/* Human Review Form */}
              <form
                onSubmit={handleSubmitEvaluation}
                className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4"
              >
                <h3 className="text-base font-black text-dd-text flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Formulário de Homologação da Avaliação
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1">
                      Nota Jogador 1 (@{selectedDuel.challenger.username}) [0 - 1000]
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={scoreP1}
                      onChange={(e) => setScoreP1(Number(e.target.value))}
                      className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1">
                      Nota Jogador 2 (@{selectedDuel.opponent?.username || 'Oponente'}) [0 - 1000]
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={scoreP2}
                      onChange={(e) => setScoreP2(Number(e.target.value))}
                      className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-bold text-dd-text outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold text-dd-text mb-1">
                    Vencedor do desempate
                  </legend>
                  <p className="text-[11px] text-dd-muted">
                    A decisão é explícita e não será inferida automaticamente pelas notas.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 rounded-xl border border-dd-border bg-dd-bg p-3 text-xs font-bold text-dd-text cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10">
                      <input
                        type="radio"
                        name="duel-winner"
                        value={selectedDuel.challenger.id}
                        checked={winnerId === selectedDuel.challenger.id}
                        onChange={(event) => setWinnerId(event.target.value)}
                        className="accent-blue-500"
                        required
                      />
                      @{selectedDuel.challenger.username}
                    </label>
                    {selectedDuel.opponent && (
                      <label className="flex items-center gap-3 rounded-xl border border-dd-border bg-dd-bg p-3 text-xs font-bold text-dd-text cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                        <input
                          type="radio"
                          name="duel-winner"
                          value={selectedDuel.opponent.id}
                          checked={winnerId === selectedDuel.opponent.id}
                          onChange={(event) => setWinnerId(event.target.value)}
                          className="accent-orange-500"
                          required
                        />
                        @{selectedDuel.opponent.username}
                      </label>
                    )}
                  </div>
                </fieldset>

                <div>
                  <label className="block text-xs font-bold text-dd-text mb-1">
                    Feedback Geral e Critérios Técnicos
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Explique a avaliação de legibilidade, desempenho e aderência aos requisitos..."
                    className="w-full bg-dd-bg border border-dd-border rounded-xl p-3 text-xs font-medium text-dd-text outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1">
                      Pontos Fortes (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="Clean code, Tipagem estrita, Performance"
                      className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-medium text-dd-text outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dd-text mb-1">
                      Pontos de Melhoria (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={improvements}
                      onChange={(e) => setImprovements(e.target.value)}
                      placeholder="Tratamento de erros, Nomenclatura"
                      className="w-full bg-dd-bg border border-dd-border rounded-xl p-2.5 text-xs font-medium text-dd-text outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !winnerId}
                  className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
                >
                  {submitting ? 'Homologando Avaliação...' : 'Homologar Avaliação e Concluir Duelo'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
