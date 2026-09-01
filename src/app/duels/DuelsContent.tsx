'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Language } from '@prisma/client';
import {
  Swords,
  Plus,
  ArrowLeft,
  Zap,
  Sparkles,
  Play,
  Flame,
  Wand2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { LanguageTag } from '@/components/LanguageTag';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { cn } from '@/lib/cn';
import Link from 'next/link';
import { parseProblemFromJson, type DuelProblem } from '@/lib/duel-problems';
import { getDuelListingExpiryAt, isDuelVisibleInListing } from '@/lib/duels/listing';

interface DuelsContentProps {
  user: {
    id: string;
    username: string;
    avatar_url?: string | null;
    total_xp: number;
    streak?: number;
  };
  initialDuels: any[];
}

const AVAILABLE_LANGUAGES: { key: Language; label: string }[] = [
  { key: 'TS', label: 'TypeScript' },
  { key: 'PYTHON', label: 'Python' },
  { key: 'JS', label: 'JavaScript' },
];

export function DuelsContent({ user, initialDuels }: DuelsContentProps) {
  const router = useRouter();
  const [duels, setDuels] = useState<any[]>(initialDuels);
  const [listingNow, setListingNow] = useState(() => Date.now());
  const [selectedLang, setSelectedLang] = useState<Language>('TS');
  const [filterLang, setFilterLang] = useState<string>('ALL');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [showDuelForm, setShowDuelForm] = useState(false);
  const [duelTitle, setDuelTitle] = useState('');
  const [duelBody, setDuelBody] = useState('');
  const [duelLanguage, setDuelLanguage] = useState<Language>('TS');
  const [creating, setCreating] = useState(false);

  // Incoming duel challenge state
  const [incomingRequest, setIncomingRequest] = useState<any | null>(null);
  const [requestTimeLeft, setRequestTimeLeft] = useState<number>(30);
  const [respondingToRequest, setRespondingToRequest] = useState(false);
  const [cooldownAlert, setCooldownAlert] = useState<string | null>(null);

  // Procedural challenge generator state
  const [showGeneratorConfig, setShowGeneratorConfig] = useState(true);
  const [generatorDifficulty, setGeneratorDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium'
  );
  const [generatorTopic, setGeneratorTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProblem, setGeneratedProblem] = useState<DuelProblem | null>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Poll for incoming duel requests
  useEffect(() => {
    const checkRequests = async () => {
      try {
        const res = await fetch('/api/duels/pending-requests');
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            const req = list[0];
            setIncomingRequest(req);
            const remaining = Math.max(
              0,
              Math.floor((new Date(req.expires_at).getTime() - Date.now()) / 1000)
            );
            setRequestTimeLeft(remaining);
          } else {
            setIncomingRequest(null);
          }
        }
      } catch {
        // ignore
      }
    };

    checkRequests();
    const interval = setInterval(checkRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for incoming request
  useEffect(() => {
    if (!incomingRequest) return;
    const timer = setInterval(() => {
      setRequestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIncomingRequest(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingRequest]);

  const handleRespondRequest = async (action: 'ACCEPT' | 'REJECT') => {
    if (!incomingRequest || respondingToRequest) return;
    setRespondingToRequest(true);

    try {
      const res = await fetch('/api/duels/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: incomingRequest.id,
          action,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIncomingRequest(null);
        if (action === 'ACCEPT' && data.duel?.id) {
          router.push(`/duels/${data.duel.id}`);
        } else if (action === 'REJECT') {
          if (data.cooldownApplied) {
            setCooldownAlert(
              'Você atingiu 3 rejeições consecutivas. Cooldown de 5 minutos ativado.'
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRespondingToRequest(false);
    }
  };

  const refreshDuels = async () => {
    try {
      const res = await fetch('/api/duels');
      if (res.ok) {
        const data = await res.json();
        setDuels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const nextExpiry = duels.reduce<number | null>((nearest, duel) => {
      const expiry = getDuelListingExpiryAt(duel);
      if (expiry === null || expiry <= Date.now()) return nearest;
      return nearest === null ? expiry : Math.min(nearest, expiry);
    }, null);
    if (nextExpiry === null) return;

    const timer = window.setTimeout(() => setListingNow(Date.now()), nextExpiry - Date.now());
    return () => window.clearTimeout(timer);
  }, [duels, listingNow]);

  const handleQuickMatch = async () => {
    setIsMatchmaking(true);
    setCooldownAlert(null);

    try {
      const res = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isQuickMatch: true,
          language: selectedLang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.duel?.id) router.push(`/duels/${data.duel.id}`);
      } else {
        setCooldownAlert(data.error || 'Erro ao iniciar matchmaking.');
      }
    } catch (err: any) {
      setCooldownAlert(err.message || 'Erro durante o matchmaking.');
    } finally {
      setIsMatchmaking(false);
    }
  };

  const handleCreateCustomDuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedProblem) {
      setGeneratorError('Monte um desafio verificável antes de publicar.');
      return;
    }
    setCreating(true);

    try {
      const res = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: generatedProblem.id,
          problem_title: generatedProblem.title,
          problem_body: generatedProblem.description,
          language: duelLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDuelTitle('');
        setDuelBody('');
        setGeneratedProblem(null);
        setShowDuelForm(false);
        setShowGeneratorConfig(true);
        if (data.duel?.id) {
          router.push(`/duels/${data.duel.id}`);
          return;
        }
        await refreshDuels();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateProblem = async () => {
    setIsGenerating(true);
    setGeneratorError(null);
    setGeneratedProblem(null);

    try {
      const res = await fetch('/api/duels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: duelLanguage,
          difficulty: generatorDifficulty,
          topic: generatorTopic.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGeneratorError(data.error || 'Erro ao gerar desafio. Tente novamente.');
        return;
      }

      const data = await res.json();
      if (data.problem) {
        setGeneratedProblem(data.problem);
        setDuelTitle(data.problem.title);
        setDuelBody(data.problem.description);
      }
    } catch (err) {
      console.error('Challenge generation error:', err);
      setGeneratorError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredDuels = duels.filter((d) => {
    if (!isDuelVisibleInListing(d, listingNow)) return false;
    if (filterLang === 'ALL') return true;
    return d.language === filterLang;
  });

  return (
    <div className="dd-platform-shell">
      <Sidebar user={user} />

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        {/* Coluna Central */}
        <main className="flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8">
          {/* Header Fixo */}
          <div className="sticky top-0 z-30 bg-dd-bg/95 backdrop-blur-md border-b border-dd-border/60 p-4 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <Link
                href="/feed"
                className="p-2 hover:bg-dd-surface rounded-full transition-colors text-dd-text cursor-pointer"
                title="Voltar ao Feed"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-base font-black text-dd-text flex items-center gap-2">
                  <Swords className="w-5 h-5 text-blue-500" />
                  Arena de Duelos 1v1
                </h1>
                <p className="text-[11px] text-dd-muted font-bold">
                  Batalhas de código em tempo real estilo arcade
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDuelForm(!showDuelForm)}
              className="dd-touch dd-focus-ring flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {showDuelForm ? 'Fechar' : 'Criar Duelo'}
            </button>
          </div>

          {/* Cooldown Alert Banner */}
          {cooldownAlert && (
            <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{cooldownAlert}</span>
            </div>
          )}

          {/* 30-Second Challenge Popup Modal */}
          {incomingRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-md p-6 rounded-3xl bg-dd-surface border-2 border-blue-500/50 shadow-2xl space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 mx-auto flex items-center justify-center animate-pulse">
                  <Swords className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                    Desafio Recebido!
                  </span>
                  <h3 className="text-xl font-black text-dd-text mt-2">
                    @{incomingRequest.sender.username} desafiou você para um duelo!
                  </h3>
                  <p className="text-xs text-dd-muted font-medium mt-1">
                    Linguagem: <strong>{incomingRequest.language}</strong> • Oponente com{' '}
                    {incomingRequest.sender.total_xp} XP
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-dd-bg border border-dd-border/60">
                  <span className="text-[10px] font-bold text-dd-muted uppercase tracking-wider block">
                    Tempo restante para responder:
                  </span>
                  <span className="text-3xl font-mono font-black text-blue-400">
                    00:{requestTimeLeft.toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleRespondRequest('ACCEPT')}
                    disabled={respondingToRequest}
                    className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Aceitar Duelo
                  </button>

                  <button
                    onClick={() => handleRespondRequest('REJECT')}
                    disabled={respondingToRequest}
                    className="py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-black text-sm transition-all active:scale-95 cursor-pointer"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Matchmaking Hero Banner (Duolingo 3D Style - Blue Primary) */}
          <div className="p-4 sm:p-6 space-y-6">
            <div className="rounded-[26px] border-2 border-b-4 border-blue-500/30 border-b-blue-600/80 bg-gradient-to-b from-blue-500/10 via-dd-surface/80 to-dd-surface p-6 shadow-xl relative overflow-hidden space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400 bg-blue-500/15 px-2.5 py-1 rounded-xl border border-blue-500/30">
                    <Zap className="w-3 h-3 fill-current" /> Fila Rápida 1v1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-dd-text">
                    Enfrente um Desenvolvedor Agora
                  </h2>
                  <p className="text-xs text-dd-muted max-w-md">
                    Resolva algoritmos sob pressão em tempo real, passe nos testes e conquiste +50
                    XP e posições no ranking!
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-3xl border-2 border-b-4 border-blue-500/50 border-b-blue-600 bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-bounce">
                    <Swords className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Language Selection for Quick Match */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-dd-muted">
                  Escolha a Linguagem do Duelo:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.key;
                    return (
                      <button
                        key={lang.key}
                        type="button"
                        onClick={() => setSelectedLang(lang.key)}
                        className={cn(
                          'dd-touch dd-focus-ring px-3.5 py-1.5 rounded-xl border-2 border-b-[3px] text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer',
                          isSelected
                            ? 'border-blue-500 border-b-blue-700 bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                            : 'border-dd-border/80 border-b-dd-border bg-dd-surface text-dd-muted hover:text-dd-text hover:border-blue-500/40'
                        )}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matchmaking Action Button - Blue 3D */}
              <button
                type="button"
                onClick={handleQuickMatch}
                disabled={isMatchmaking}
                className="dd-touch dd-focus-ring w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer disabled:opacity-60"
              >
                <Play className={cn('w-5 h-5 fill-current', isMatchmaking && 'animate-spin')} />
                {isMatchmaking ? 'Buscando Oponente na Arena...' : 'Entrar na Fila Rápida 1v1'}
              </button>
            </div>

            {/* Form de Criação de Duelo Personalizado */}
            {showDuelForm && (
              <div className="rounded-[24px] border-2 border-b-4 border-blue-500/30 border-b-blue-600 bg-dd-surface p-5 sm:p-6 space-y-4 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-dd-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-dd-text">
                      Configurar Desafio Customizado
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedProblem(null);
                      setGeneratorError(null);
                    }}
                    className="dd-focus-ring flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400 transition hover:bg-blue-500/15"
                  >
                    <Wand2 className="w-3 h-3" />
                    Novo desafio
                  </button>
                </div>

                {/* Procedural generation config panel */}
                {showGeneratorConfig ? (
                  <div className="space-y-4">
                    {/* Language + Difficulty Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-dd-muted uppercase">
                          Linguagem
                        </label>
                        <select
                          value={duelLanguage}
                          onChange={(e) => setDuelLanguage(e.target.value as Language)}
                          className="w-full text-xs rounded-xl border border-dd-border bg-dd-bg px-3 py-2.5 text-dd-text focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="TS">TypeScript</option>
                          <option value="JS">JavaScript</option>
                          <option value="PYTHON">Python</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-dd-muted uppercase">
                          Dificuldade
                        </label>
                        <div className="flex gap-1.5">
                          {(
                            [
                              { key: 'easy', label: 'Fácil', color: 'emerald' },
                              { key: 'medium', label: 'Médio', color: 'blue' },
                              { key: 'hard', label: 'Difícil', color: 'rose' },
                            ] as const
                          ).map((d) => (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => setGeneratorDifficulty(d.key)}
                              className={cn(
                                'dd-touch flex-1 rounded-xl border-2 border-b-[3px] px-2 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer',
                                generatorDifficulty === d.key
                                  ? d.color === 'emerald'
                                    ? 'border-emerald-500 border-b-emerald-700 bg-emerald-500 text-white shadow-md'
                                    : d.color === 'blue'
                                      ? 'border-blue-500 border-b-blue-700 bg-blue-500 text-white shadow-md'
                                      : 'border-rose-500 border-b-rose-700 bg-rose-500 text-white shadow-md'
                                  : 'border-dd-border/80 border-b-dd-border bg-dd-bg text-dd-muted hover:text-dd-text'
                              )}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Topic */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-dd-muted uppercase">
                        Tema (opcional)
                      </label>
                      <input
                        type="text"
                        value={generatorTopic}
                        onChange={(e) => setGeneratorTopic(e.target.value)}
                        placeholder="Ex: Árvores binárias, Strings, Recursão, Matrizes..."
                        className="w-full text-xs rounded-xl border border-dd-border bg-dd-bg px-3.5 py-2.5 text-dd-text placeholder:text-dd-muted focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Generate Button */}
                    <button
                      type="button"
                      onClick={handleGenerateProblem}
                      disabled={isGenerating}
                      className="dd-touch dd-focus-ring w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Montando Desafio...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Montar Desafio
                        </>
                      )}
                    </button>

                    {/* Generator error */}
                    {generatorError && (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300 font-semibold">
                        {generatorError}
                      </div>
                    )}

                    {/* Generated Problem Preview */}
                    {generatedProblem && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="rounded-[18px] border-2 border-b-4 border-emerald-500/30 border-b-emerald-600 bg-emerald-500/5 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                              Desafio Gerado com Sucesso
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-sm font-black text-dd-text">
                              {generatedProblem.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border',
                                  generatedProblem.difficulty === 'Fácil'
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                    : generatedProblem.difficulty === 'Médio'
                                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                                      : 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                                )}
                              >
                                {generatedProblem.difficulty}
                              </span>
                              <span className="text-[9px] font-bold text-dd-muted">
                                {generatedProblem.testCases.length} testes
                              </span>
                              <span className="text-[9px] font-bold text-dd-muted">
                                fn: {generatedProblem.functionName}()
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-dd-muted leading-relaxed">
                            {generatedProblem.description}
                          </p>

                          {/* Test cases preview */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-dd-muted">
                              Casos de Teste:
                            </span>
                            {generatedProblem.testCases.map((tc) => (
                              <div
                                key={tc.id}
                                className="flex items-center gap-2 text-[10px] text-dd-muted"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                <span className="font-semibold text-dd-text">{tc.description}</span>
                                <span className="text-dd-muted ml-auto shrink-0 font-mono">
                                  {tc.inputDisplay} → {tc.expectedDisplay}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons for generated problem */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleGenerateProblem}
                            disabled={isGenerating}
                            className="dd-touch dd-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-b-[3px] border-slate-600 border-b-slate-800 bg-slate-700 hover:bg-slate-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            Gerar Outro
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCreateCustomDuel({
                                preventDefault: () => {},
                              } as React.FormEvent);
                            }}
                            disabled={creating}
                            className="dd-touch dd-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-b-[3px] border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            {creating ? 'Publicando...' : 'Publicar Desafio'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Manual Form */
                  <form onSubmit={handleCreateCustomDuel} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-dd-muted uppercase">
                          Título do Problema
                        </label>
                        <input
                          type="text"
                          value={duelTitle}
                          onChange={(e) => setDuelTitle(e.target.value)}
                          required
                          placeholder="Ex: Validador de Parênteses Balanceados"
                          className="w-full text-xs rounded-xl border border-dd-border bg-dd-bg px-3.5 py-2.5 text-dd-text placeholder:text-dd-muted focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-dd-muted uppercase">
                          Linguagem
                        </label>
                        <select
                          value={duelLanguage}
                          onChange={(e) => setDuelLanguage(e.target.value as Language)}
                          className="w-full text-xs rounded-xl border border-dd-border bg-dd-bg px-3 py-2.5 text-dd-text focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="TS">TypeScript</option>
                          <option value="JS">JavaScript</option>
                          <option value="PYTHON">Python</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-dd-muted uppercase">
                        Enunciado e Casos de Teste
                      </label>
                      <textarea
                        value={duelBody}
                        onChange={(e) => setDuelBody(e.target.value)}
                        required
                        rows={4}
                        placeholder="Descreva o problema, entradas e saídas esperadas..."
                        className="w-full text-xs rounded-xl border border-dd-border bg-dd-bg px-3.5 py-2.5 text-dd-text placeholder:text-dd-muted focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={creating}
                        className="dd-touch dd-focus-ring rounded-xl border-2 border-b-[3px] border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 cursor-pointer disabled:opacity-50"
                      >
                        {creating ? 'Criando...' : 'Publicar Desafio'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Filter Tabs by Language */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-dd-text flex items-center gap-2">
                  <Flame className="w-4 h-4 text-blue-500" />
                  Duelos Abertos da Comunidade
                </h3>
                <span className="text-[11px] font-bold text-dd-muted">
                  {filteredDuels.length} {filteredDuels.length === 1 ? 'duelo' : 'duelos'}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilterLang('ALL')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl border-2 border-b-[3px] text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer',
                    filterLang === 'ALL'
                      ? 'border-blue-500 border-b-blue-700 bg-blue-500 text-white shadow-sm'
                      : 'border-dd-border/80 border-b-dd-border bg-dd-surface text-dd-muted hover:text-dd-text'
                  )}
                >
                  Todas
                </button>
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => setFilterLang(lang.key)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl border-2 border-b-[3px] text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer',
                      filterLang === lang.key
                        ? 'border-blue-500 border-b-blue-700 bg-blue-500 text-white shadow-sm'
                        : 'border-dd-border/80 border-b-dd-border bg-dd-surface text-dd-muted hover:text-dd-text'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Duelos Estilo Cartas 3D */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredDuels.length === 0 ? (
                <div className="rounded-[22px] border-2 border-dashed border-dd-border bg-dd-surface/30 p-12 text-center text-dd-muted space-y-2">
                  <p className="text-sm font-bold text-dd-text">
                    Nenhum duelo aberto com esse filtro
                  </p>
                  <p className="text-xs">
                    Clique em &quot;Entrar na Fila Rápida&quot; acima para iniciar um duelo
                    instantâneo!
                  </p>
                </div>
              ) : (
                filteredDuels.map((duel) => {
                  const isPending = duel.status === 'PENDING';
                  const isActive = duel.status === 'ACTIVE';

                  return (
                    <Link
                      key={duel.id}
                      href={`/duels/${duel.id}`}
                      className="group rounded-[22px] border-2 border-b-4 border-dd-border/80 bg-dd-surface p-4 sm:p-5 shadow-md transition-all duration-150 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                    >
                      {/* Left: Problem info and Language */}
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <LanguageTag language={duel.language} size="sm" />
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border-2 border-b-[2.5px]',
                              isPending
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30 border-b-blue-600'
                                : isActive
                                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30 border-b-sky-600'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 border-b-emerald-600'
                            )}
                          >
                            {isPending
                              ? 'Aguardando Oponente'
                              : isActive
                                ? 'Batalha Ativa'
                                : 'Finalizado'}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-dd-text group-hover:text-blue-500 transition-colors truncate">
                          {duel.problem_title}
                        </h4>

                        <p className="text-xs text-dd-muted line-clamp-1">
                          {parseProblemFromJson(duel.problem_body)?.description ??
                            duel.problem_body}
                        </p>
                      </div>

                      {/* Right: Combatants & Enter Button */}
                      <div className="flex items-center gap-4 shrink-0 sm:self-center">
                        {/* Versus Avatars */}
                        <div className="flex items-center -space-x-3">
                          <AuthorAvatar
                            username={duel.challenger.username}
                            avatar_url={duel.challenger.avatar_url}
                            size="md"
                            className="ring-2 ring-blue-500 ring-offset-2 ring-offset-dd-surface"
                          />
                          {duel.opponent ? (
                            <AuthorAvatar
                              username={duel.opponent.username}
                              avatar_url={duel.opponent.avatar_url}
                              size="md"
                              className="ring-2 ring-blue-400 ring-offset-2 ring-offset-dd-surface"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-dd-border bg-dd-bg flex items-center justify-center text-[10px] font-black text-dd-muted">
                              ?
                            </div>
                          )}
                        </div>

                        {/* Duolingo 3D Blue Action Button with real SVG icon */}
                        <span className="dd-touch inline-flex items-center gap-1.5 rounded-xl border-2 border-b-[3px] border-blue-600 border-b-blue-800 bg-blue-500 group-hover:bg-blue-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
                          {isPending ? (
                            <>
                              <span>Entrar</span>
                              <Swords className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <span>Ver Duelo</span>
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
