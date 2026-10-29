'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Language } from '@prisma/client';
import {
  Swords,
  Plus,
  ArrowLeft,
  Trophy,
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
import Image from 'next/image';
import { parseProblemFromJson, type DuelProblem } from '@/lib/duel-problems';
import { getDuelListingExpiryAt, isDuelVisibleInListing } from '@/lib/duels/listing';
import styles from './DuelsContent.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';

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

function formatInvitationTime(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes
    .toString()
    .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function DuelsContent({ user, initialDuels }: DuelsContentProps) {
  const { text } = useLocalizedText();
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
  const [requestTimeLeft, setRequestTimeLeft] = useState<number>(0);
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
  const [recentProblemIds, setRecentProblemIds] = useState<string[]>([]);
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
          excludeIds: recentProblemIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGeneratorError(data.error || 'Erro ao gerar desafio. Tente novamente.');
        return;
      }

      const data = await res.json();
      if (data.problem) {
        setRecentProblemIds((ids) => [...ids.slice(-19), data.problem.id]);
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

      <div className={styles.layout}>
        {/* Coluna Central */}
        <main className={styles.arena}>
          {/* Header Fixo */}
          <div className={styles.header}>
            <div className="flex items-center gap-3">
              <Link
                href="/feed"
                className="p-2 hover:bg-dd-surface rounded-full transition-colors text-dd-text cursor-pointer"
                title="Voltar ao Feed"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-base font-bold text-dd-text flex items-center gap-2">
                  <Swords className="w-5 h-5 text-blue-500" />
                  Duelos
                </h1>
                <p className={styles.headerSubtitle}>
                  {text('Desafios de código, um contra um', 'Coding challenges, one on one')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDuelForm(!showDuelForm)}
              aria-expanded={showDuelForm}
              aria-controls="create-duel"
              className="dd-touch dd-focus-ring flex items-center gap-1.5 rounded-full border border-blue-600 bg-blue-500 hover:bg-blue-400 px-3.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
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

          {/* Direct challenge popup */}
          {incomingRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-h-[85dvh] overflow-y-auto max-w-md p-4 sm:p-6 rounded-3xl bg-dd-surface border border-blue-500/50 shadow-2xl space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 mx-auto flex items-center justify-center animate-pulse">
                  <Swords className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
                    {text('Desafio recebido!', 'Challenge received!')}
                  </span>
                  <h3 className="text-xl font-bold text-dd-text mt-2">
                    @{incomingRequest.sender.username}{' '}
                    {text('desafiou você para um duelo!', 'challenged you to a duel!')}
                  </h3>
                  <p className="text-xs text-dd-muted font-medium mt-1">
                    Linguagem: <strong>{incomingRequest.language}</strong> • Oponente com{' '}
                    {incomingRequest.sender.total_xp} XP
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-dd-bg border border-dd-border/60">
                  <span className="text-xs font-bold text-dd-muted block">
                    Tempo restante para responder:
                  </span>
                  <span className="text-xl sm:text-3xl font-mono font-bold text-blue-400">
                    {formatInvitationTime(requestTimeLeft)}
                  </span>
                  <p className="mt-2 text-[11px] text-dd-muted">
                    Recusar ou deixar expirar não reduz XP e não gera cooldown.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleRespondRequest('ACCEPT')}
                    disabled={respondingToRequest}
                    className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all cursor-pointer"
                  >
                    Aceitar Duelo
                  </button>

                  <button
                    onClick={() => handleRespondRequest('REJECT')}
                    disabled={respondingToRequest}
                    className="py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-sm transition-all cursor-pointer"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick matchmaking */}
          <div className={styles.content}>
            <div className={styles.quickMatch}>
              <div className={styles.quickIntro}>
                <div className={styles.matchIcon} aria-hidden="true">
                  <Swords />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-dd-text">
                    {text('Fila rápida 1v1', 'Quick 1v1 queue')}
                  </h2>
                  <p className={styles.description}>
                    {text(
                      'Escolha sua linguagem e encontre seu próximo oponente.',
                      'Choose your language and find your next opponent.'
                    )}
                  </p>
                </div>
              </div>

              {/* Language Selection for Quick Match */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-dd-text">
                  {text('Linguagem do duelo', 'Duel language')}
                </legend>
                <div className={styles.languages}>
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.key;
                    return (
                      <button
                        key={lang.key}
                        type="button"
                        onClick={() => setSelectedLang(lang.key)}
                        aria-pressed={isSelected}
                        className={cn(
                          'dd-touch dd-focus-ring rounded-full border text-sm font-bold transition-colors',
                          isSelected
                            ? 'border-blue-500  bg-blue-500 text-white   '
                            : 'border-dd-border/80  bg-dd-surface text-dd-muted hover:text-dd-text hover:border-blue-500/40'
                        )}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Matchmaking action */}
              <button
                type="button"
                onClick={handleQuickMatch}
                disabled={isMatchmaking}
                className="dd-touch dd-focus-ring w-full flex items-center justify-center gap-2.5 rounded-2xl border border-blue-600 bg-blue-500 hover:bg-blue-400 py-4 text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-60"
              >
                {isMatchmaking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                {isMatchmaking
                  ? text('Buscando oponente na arena...', 'Searching for an opponent...')
                  : text('Entrar na fila rápida 1v1', 'Join quick 1v1 queue')}
              </button>
            </div>

            {/* Form de Criação de Duelo Personalizado */}
            {showDuelForm && (
              <div id="create-duel" className={styles.createForm}>
                <div className="flex flex-wrap gap-3 items-center justify-between border-b border-dd-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-dd-text">
                      {text('Configurar desafio customizado', 'Configure custom challenge')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedProblem(null);
                      setGeneratorError(null);
                    }}
                    className="dd-focus-ring flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 transition hover:bg-blue-500/15"
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
                        <label
                          htmlFor="duel-language"
                          className="text-sm font-medium text-dd-muted"
                        >
                          Linguagem
                        </label>
                        <select
                          id="duel-language"
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
                        <span id="duel-difficulty" className="text-sm font-medium text-dd-muted">
                          Dificuldade
                        </span>
                        <div
                          role="group"
                          aria-labelledby="duel-difficulty"
                          className="flex gap-1.5"
                        >
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
                              aria-pressed={generatorDifficulty === d.key}
                              className={cn(
                                'dd-touch flex-1 rounded-full border  px-2 py-1.5 text-xs font-bold  transition-all cursor-pointer',
                                generatorDifficulty === d.key
                                  ? d.color === 'emerald'
                                    ? 'border-emerald-500  bg-emerald-500 text-white '
                                    : d.color === 'blue'
                                      ? 'border-blue-500  bg-blue-500 text-white '
                                      : 'border-rose-500  bg-rose-500 text-white '
                                  : 'border-dd-border/80  bg-dd-bg text-dd-muted hover:text-dd-text'
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
                      <label htmlFor="duel-topic" className="text-sm font-medium text-dd-muted">
                        Tema (opcional)
                      </label>
                      <input
                        id="duel-topic"
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
                      className="dd-touch dd-focus-ring w-full flex items-center justify-center gap-2.5 rounded-2xl border border-blue-600 bg-blue-500 hover:bg-blue-400 py-3.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {text('Montando desafio...', 'Building challenge...')}
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          {text('Montar desafio', 'Build challenge')}
                        </>
                      )}
                    </button>

                    {/* Generator error */}
                    {generatorError && (
                      <div
                        role="alert"
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300 font-semibold"
                      >
                        {generatorError}
                      </div>
                    )}

                    {/* Generated Problem Preview */}
                    {generatedProblem && (
                      <div className="space-y-3 animate-fade-in">
                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">
                              Desafio Gerado com Sucesso
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-sm font-bold text-dd-text">
                              {generatedProblem.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  'text-xs font-bold  px-2 py-0.5 rounded-lg border',
                                  generatedProblem.difficulty === 'Fácil'
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                    : generatedProblem.difficulty === 'Médio'
                                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                                      : 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                                )}
                              >
                                {generatedProblem.difficulty}
                              </span>
                              <span className="text-xs font-bold text-dd-muted">
                                {generatedProblem.testCases.length} testes
                              </span>
                              <span className="text-xs font-bold text-dd-muted">
                                fn: {generatedProblem.functionName}()
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-dd-muted leading-relaxed">
                            {generatedProblem.description}
                          </p>

                          {/* Test cases preview */}
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-dd-muted">Casos de Teste:</span>
                            {generatedProblem.testCases.map((tc) => (
                              <div
                                key={tc.id}
                                className="flex flex-wrap items-center gap-2 text-xs text-dd-muted"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                <span className="font-semibold text-dd-text">{tc.description}</span>
                                <span className="text-dd-muted min-w-0 w-full sm:w-auto sm:ml-auto break-all font-mono">
                                  {tc.inputDisplay} → {tc.expectedDisplay}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons for generated problem */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleGenerateProblem}
                            disabled={isGenerating}
                            className="dd-touch dd-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-full border border-slate-600 bg-slate-700 hover:bg-slate-600 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
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
                            className="dd-touch dd-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-full border border-blue-600 bg-blue-500 hover:bg-blue-400 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
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
                        <label className="text-xs font-medium text-dd-muted">
                          {text('Título do problema', 'Problem title')}
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
                        <label className="text-xs font-medium text-dd-muted">Linguagem</label>
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
                      <label className="text-xs font-medium text-dd-muted">
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
                        className="dd-touch dd-focus-ring rounded-full border border-blue-600 bg-blue-500 hover:bg-blue-400 px-6 py-2.5 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        {creating
                          ? text('Criando...', 'Creating...')
                          : text('Publicar desafio', 'Publish challenge')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Filter Tabs by Language */}
            <section aria-labelledby="community-duels" className={styles.communityHeader}>
              <div className="flex items-center justify-between">
                <h3
                  id="community-duels"
                  className="text-lg font-bold text-dd-text flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-blue-500" />
                  Na comunidade
                </h3>
                <span className="text-[11px] font-bold text-dd-muted">
                  {filteredDuels.length} {filteredDuels.length === 1 ? 'duelo' : 'duelos'}
                </span>
              </div>

              <div
                className={styles.filters}
                role="group"
                aria-label="Filtrar duelos por linguagem"
              >
                <button
                  type="button"
                  onClick={() => setFilterLang('ALL')}
                  aria-pressed={filterLang === 'ALL'}
                  className={cn(
                    styles.filter,
                    filterLang === 'ALL'
                      ? 'border-blue-500  bg-blue-500 text-white '
                      : 'border-dd-border/80  bg-dd-surface text-dd-muted hover:text-dd-text'
                  )}
                >
                  Todas
                </button>
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.key}
                    type="button"
                    onClick={() => setFilterLang(lang.key)}
                    aria-pressed={filterLang === lang.key}
                    className={cn(
                      styles.filter,
                      filterLang === lang.key
                        ? 'border-blue-500  bg-blue-500 text-white '
                        : 'border-dd-border/80  bg-dd-surface text-dd-muted hover:text-dd-text'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Community duels */}
            <div className={styles.duelList}>
              {filteredDuels.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className="text-sm font-bold text-dd-text">
                    {text('Nenhum duelo aberto com esse filtro', 'No open duels match this filter')}
                  </p>
                  <p className={styles.description}>
                    {text(
                      'Entre na fila rápida ou crie um desafio para a comunidade.',
                      'Join the quick queue or create a community challenge.'
                    )}
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
                      className={`group ${styles.duelCard}`}
                    >
                      <div
                        className={styles.languageTile}
                        data-language={duel.language}
                        aria-hidden="true"
                      >
                        <Image
                          src={`/languages/${duel.language.toLowerCase()}.svg`}
                          alt=""
                          width={48}
                          height={48}
                          className="h-3/4 w-3/4 object-contain"
                        />
                      </div>
                      {/* Left: Problem info and Language */}
                      <div className={styles.cardBody}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <LanguageTag language={duel.language} size="sm" flat />
                          <span
                            className={cn(
                              'text-xs font-bold  px-2.5 py-0.5 rounded-lg border ',
                              isPending
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30 '
                                : isActive
                                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30 '
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 '
                            )}
                          >
                            {isPending
                              ? 'Vaga aberta'
                              : isActive
                                ? 'Em andamento'
                                : duel.status === 'REVIEW_PENDING'
                                  ? 'Em avaliação'
                                  : 'Finalizado'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-dd-text group-hover:text-blue-500 transition-colors break-words">
                          {duel.problem_title}
                        </h4>

                        <p className={`${styles.description} line-clamp-2`}>
                          {parseProblemFromJson(duel.problem_body)?.description ??
                            duel.problem_body}
                        </p>
                        {/* Right: Combatants & Enter Button */}
                        <div className={styles.cardFooter}>
                          {/* Versus Avatars */}
                          <div className={styles.participants}>
                            <AuthorAvatar
                              username={duel.challenger.username}
                              avatar_url={duel.challenger.avatar_url}
                              avatar_config={duel.challenger.avatar_config}
                              size="md"
                              className="rounded-full"
                            />
                            {duel.opponent ? (
                              <AuthorAvatar
                                username={duel.opponent.username}
                                avatar_url={duel.opponent.avatar_url}
                                avatar_config={duel.opponent.avatar_config}
                                size="md"
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full border border-dashed border-dd-border bg-dd-bg flex items-center justify-center text-xs font-bold text-dd-muted">
                                ?
                              </div>
                            )}
                          </div>

                          {/* Enter duel */}
                          <span className="dd-touch inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-600 bg-blue-500 group-hover:bg-blue-400 px-5 py-2 text-sm font-bold text-white transition-colors">
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
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </main>
        <aside className={styles.guide} aria-label="Sobre os duelos">
          <h2 className="text-lg font-bold">Seu próximo desafio</h2>
          <p className={styles.description}>
            Um problema, dois participantes. Escreva sua solução e coloque suas habilidades à prova.
          </p>
          <ol className={styles.steps}>
            <li>Escolha TypeScript, Python ou JavaScript.</li>
            <li>Entre na fila ou abra um duelo da comunidade.</li>
            <li>Resolva o desafio e confira seus testes.</li>
          </ol>
          <Link href="/ranking" className={styles.rankingLink}>
            <Trophy size={18} /> Ver ranking
          </Link>
        </aside>
      </div>
    </div>
  );
}
