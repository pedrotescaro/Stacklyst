'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight, ShieldCheck, BookOpen, Zap } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { EvaluatorGuide } from '@/components/evaluators/EvaluatorGuide';

interface EligibilityData {
  eligible: boolean;
  totalXp: number;
  completedTrails: string[];
  isAlreadyEvaluator: boolean;
  hasPendingApplication: boolean;
  requirements: {
    hasCompletedTrail: boolean;
    hasSufficientXp: boolean;
  };
  latestApplication?: any;
}

export function EvaluatorApplyContent({ user }: { user: any }) {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [motivation, setMotivation] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['TypeScript', 'JavaScript']);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const ALL_TECHS = [
    'TypeScript',
    'JavaScript',
    'Python',
    'Rust',
    'Go',
    'Java',
    'React',
    'Node.js',
  ];

  useEffect(() => {
    loadEligibility();
  }, []);

  const loadEligibility = async () => {
    try {
      const res = await fetch('/api/evaluators/eligibility');
      if (res.ok) {
        setEligibility(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility?.eligible) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/evaluators/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivation,
          tech_stack: selectedTechs,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          message:
            'Sua candidatura foi submetida com sucesso! O time administrativo irá analisá-la.',
        });
        loadEligibility();
      } else {
        setFeedbackMsg({ type: 'error', message: data.error || 'Erro ao submeter candidatura.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.message || 'Erro de conexão.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <main className="flex-1 min-w-0 max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="border-b border-dd-border pb-5">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
              Carreira & Comunidade
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-dd-text mt-2">
            Torne-se um Avaliador de Código
          </h1>
          <p className="text-sm text-dd-muted font-medium mt-1">
            Ajude a comunidade avaliando soluções técnicas em duelos. Sua
            expertise e critérios objetivos garantem a validação humana.
          </p>
        </div>

        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl border font-bold text-sm flex items-center gap-3 animate-fade-in ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedbackMsg.message}</span>
          </div>
        )}

        <EvaluatorGuide context="application" />

        {/* Eligibility Requirements Box */}
        {eligibility && (
          <div className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4">
            <h2 className="text-base font-black text-dd-text flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Critérios Mínimos de Elegibilidade
            </h2>
            <p className="text-xs text-dd-muted font-medium leading-relaxed">
              Para se candidatar, basta cumprir uma das condições: concluir uma trilha completa{' '}
              <strong className="text-dd-text">OU</strong> possuir pelo menos 1.000 XP. A atuação
              como avaliador depende da aprovação administrativa da candidatura.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  eligibility.requirements.hasCompletedTrail
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-dd-bg border-dd-border/60 text-dd-muted'
                }`}
              >
                {eligibility.requirements.hasCompletedTrail ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <BookOpen className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-dd-text">1 Trilha Completa (8 unidades)</p>
                  <p className="text-[11px] text-dd-muted">
                    {eligibility.completedTrails.length > 0
                      ? `Concluída (${eligibility.completedTrails.join(', ')})`
                      : 'Nenhuma trilha 100% finalizada'}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  eligibility.requirements.hasSufficientXp
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-dd-bg border-dd-border/60 text-dd-muted'
                }`}
              >
                {eligibility.requirements.hasSufficientXp ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <Zap className="w-5 h-5 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-dd-text">Mínimo de 1.000 XP</p>
                  <p className="text-[11px] text-dd-muted">
                    Você possui: {eligibility.totalXp.toLocaleString('pt-BR')} XP
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-dd-border/60 flex items-center justify-between text-xs">
              <span className="text-dd-muted font-medium">Status de Elegibilidade:</span>
              <span
                className={`font-black uppercase px-2.5 py-0.5 rounded-full ${
                  eligibility.eligible
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-orange-500/15 text-orange-400'
                }`}
              >
                {eligibility.eligible ? 'Elegível para Candidatura' : 'Requisitos Pendentes'}
              </span>
            </div>
          </div>
        )}

        {/* Application Form */}
        {eligibility?.eligible &&
          !eligibility.isAlreadyEvaluator &&
          !eligibility.hasPendingApplication && (
            <form
              onSubmit={handleApply}
              className="p-6 rounded-3xl bg-dd-surface border border-dd-border space-y-4"
            >
              <h2 className="text-base font-black text-dd-text">Formulário de Candidatura</h2>

              <div>
                <label className="block text-xs font-bold text-dd-text mb-1.5">
                  Por que você deseja se tornar um avaliador de código?
                </label>
                <textarea
                  rows={4}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Conte um pouco sobre sua experiência técnica, seus pontos fortes e por que deseja revisar soluções de outros desenvolvedores..."
                  className="w-full bg-dd-bg border border-dd-border rounded-xl p-3 text-xs font-medium text-dd-text outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dd-text mb-2">
                  Selecione as tecnologias que você domina:
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TECHS.map((tech) => {
                    const selected = selectedTechs.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTech(tech)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selected
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-dd-bg border border-dd-border text-dd-muted hover:text-dd-text'
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || selectedTechs.length === 0}
                className="w-full py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {submitting ? 'Enviando candidatura...' : 'Enviar Candidatura para Análise'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        {eligibility?.hasPendingApplication && (
          <div className="p-6 rounded-3xl bg-orange-500/10 border border-orange-500/30 text-center space-y-2">
            <Clock className="w-8 h-8 text-orange-400 mx-auto" />
            <h3 className="text-base font-black text-dd-text">Candidatura em Análise</h3>
            <p className="text-xs text-dd-muted font-medium max-w-md mx-auto">
              Sua solicitação foi enviada aos administradores do Stacklyst. Você receberá uma
              notificação assim que for avaliada.
            </p>
          </div>
        )}

        {eligibility?.isAlreadyEvaluator && (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-base font-black text-dd-text">Você já é um Avaliador de Código!</h3>
            <p className="text-xs text-dd-muted font-medium max-w-md mx-auto">
              Acesse a{' '}
              <a href="/evaluations" className="text-blue-400 underline font-bold">
                Central de Avaliações
              </a>{' '}
              para revisar soluções pendentes.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
