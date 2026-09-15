'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Flame, Globe2, LockKeyhole, Shield, Sparkles, Trophy } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { StreakPopover } from '@/components/StreakPopover';
import { LeaderboardMedal } from '@/components/LeaderboardMedal';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { TrailCourseSelector, type TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import { getTrailLanguageMetadata, type TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';

export interface LeaderboardRow {
  rank: number;
  username: string;
  avatar_url?: string | null;
  xp: number;
  level: number;
  streak?: number;
  created_at?: string | null;
  status_emoji?: string | null;
}

interface LeaderboardClientProps {
  initialUser: {
    id: string;
    username: string;
    avatar_url?: string | null;
    total_xp: number;
    streak?: number;
    last_active_at?: string | null;
  } | null;
  initialLeaderboard: LeaderboardRow[];
  initialLanguage?: TrailLanguageCode;
  courses?: TrailCourseOption[];
}

const STATUS_EMOJIS = [
  { emoji: '😎', label: 'Estiloso' },
  { emoji: '🎉', label: 'Festa' },
  { emoji: '💪', label: 'Focado' },
  { emoji: '👀', label: 'Observando' },
  { emoji: '🍿', label: 'Pipoca' },
  { emoji: '⚡', label: 'Elétrico' },
  { emoji: '🚀', label: 'Decolando' },
  { emoji: '💯', label: 'Perfeito' },
  { emoji: '☕', label: 'Café' },
  { emoji: '🏆', label: 'Campeão' },
  { emoji: '💻', label: 'Codando' },
  { emoji: '🐱', label: 'Gato dev' },
];

interface Division {
  id: string;
  name: string;
  labelPt: string;
  labelEn: string;
  accent: string;
  isUnlocked: boolean;
  type: 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'diamond';
}

const DIVISIONS: Division[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    labelPt: 'Divisão Bronze',
    labelEn: 'Bronze Division',
    accent: '#d97706',
    isUnlocked: true,
    type: 'bronze',
  },
  {
    id: 'prata',
    name: 'Prata',
    labelPt: 'Divisão Prata',
    labelEn: 'Silver Division',
    accent: '#94a3b8',
    isUnlocked: true,
    type: 'silver',
  },
  {
    id: 'ouro',
    name: 'Ouro',
    labelPt: 'Divisão Ouro',
    labelEn: 'Gold Division',
    accent: '#facc15',
    isUnlocked: true,
    type: 'gold',
  },
  {
    id: 'safira',
    name: 'Safira',
    labelPt: 'Divisão Safira',
    labelEn: 'Sapphire Division',
    accent: '#38bdf8',
    isUnlocked: false,
    type: 'sapphire',
  },
  {
    id: 'rubi',
    name: 'Rubi',
    labelPt: 'Divisão Rubi',
    labelEn: 'Ruby Division',
    accent: '#ef4444',
    isUnlocked: false,
    type: 'ruby',
  },
  {
    id: 'diamante',
    name: 'Diamante',
    labelPt: 'Divisão Diamante',
    labelEn: 'Diamond Division',
    accent: '#06b6d4',
    isUnlocked: false,
    type: 'diamond',
  },
];

function formatXp(value: number, locale = 'pt-BR') {
  return Math.max(0, value).toLocaleString(locale);
}

function formatSeniority(createdAtStr?: string | null, streak?: number) {
  if (streak && streak > 0) {
    if (streak >= 365) return `Mais de 1 ano`;
    return `${streak} ${streak === 1 ? 'dia' : 'dias'} de ofensiva`;
  }
  if (!createdAtStr) return null;
  const created = new Date(createdAtStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 730) return 'Mais de 2 anos';
  if (diffDays >= 365) return 'Mais de 1 ano';
  if (diffDays >= 30) return `${Math.floor(diffDays / 30)} meses no Stacklyst`;
  return null;
}

/** Balão de status em estilo speech-bubble do Duolingo */
function StatusBubble({
  emoji,
  size = 'md',
  className = '',
}: {
  emoji?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!emoji) return null;

  const sizeClasses = {
    sm: 'h-5 w-5 text-[10px] -top-1.5 -right-1.5',
    md: 'h-6 w-6 text-xs -top-2 -right-2',
    lg: 'h-8 w-8 text-base -top-2.5 -right-2.5',
  };

  return (
    <div
      aria-label={`Status: ${emoji}`}
      className={`absolute z-20 flex select-none items-center justify-center rounded-full border-2 border-slate-200 dark:border-[#131b2e] bg-white shadow-md transition-transform duration-200 animate-in zoom-in-75 ${sizeClasses[size]} ${className}`}
    >
      <span className="leading-none select-none">{emoji}</span>
      <span className="absolute -bottom-1 left-1.5 h-1.5 w-1.5 rotate-45 border-b border-r border-slate-200 dark:border-[#131b2e] bg-white" />
    </div>
  );
}

/** Escudo de divisão 3D tátil inspirado no Duolingo */
function DivisionShield({
  division,
  isActive,
  onClick,
}: {
  division: Division;
  isActive: boolean;
  onClick: () => void;
}) {
  const isGold = division.type === 'gold';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!division.isUnlocked && !isActive}
      title={division.labelPt}
      className={`group relative flex flex-col items-center justify-center transition-all duration-200 focus-visible:outline-none ${
        isActive
          ? '-translate-y-2 scale-110 z-10'
          : division.isUnlocked
            ? 'hover:-translate-y-1 hover:brightness-110 cursor-pointer'
            : 'opacity-45 cursor-not-allowed'
      }`}
    >
      <div
        className={`relative flex items-center justify-center rounded-2xl border-2 transition-all ${
          isGold && isActive
            ? 'h-[76px] w-[66px] sm:h-[84px] sm:w-[72px] rounded-[22px] border-amber-300 border-b-[6px] bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 text-amber-950 shadow-[0_10px_25px_rgba(245,158,11,0.4)]'
            : division.type === 'bronze'
              ? 'h-[58px] w-[50px] sm:h-[64px] sm:w-[54px] rounded-[18px] border-amber-700 border-b-[5px] bg-gradient-to-b from-amber-600 to-amber-800 text-amber-100 shadow-md shadow-amber-950/30'
              : division.type === 'silver'
                ? 'h-[58px] w-[50px] sm:h-[64px] sm:w-[54px] rounded-[18px] border-slate-300 border-b-[5px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-md shadow-slate-900/20'
                : 'h-[58px] w-[50px] sm:h-[64px] sm:w-[54px] rounded-[18px] border-slate-300 dark:border-slate-800 border-b-[5px] bg-slate-200/80 dark:bg-[#1a2333] text-slate-400 dark:text-slate-500 shadow-inner'
        }`}
      >
        {isGold ? (
          <div className="flex flex-col items-center justify-center">
            {/* Ícone de Pena/Espada central dourada estilizada */}
            <svg
              className="h-8 w-8 fill-amber-900/20 text-amber-900"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
              <line x1="16" y1="8" x2="2" y2="22" />
              <line x1="17.5" y1="15" x2="9" y2="15" />
            </svg>
          </div>
        ) : !division.isUnlocked ? (
          <LockKeyhole className="h-5 w-5 text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
        ) : (
          <Shield className="h-6 w-6 fill-current/15 text-current" strokeWidth={2.2} />
        )}

        {/* Brilho superior característico do Duolingo */}
        <div className="pointer-events-none absolute top-1 inset-x-2 h-2 rounded-full bg-white/30 blur-[0.5px]" />
      </div>

      {isActive && (
        <span className="mt-2 hidden text-[11px] font-black text-amber-600 dark:text-amber-400 drop-shadow-sm sm:block">
          {division.name}
        </span>
      )}
    </button>
  );
}

/** Linha do ranking no formato clássico do Duolingo */
function DuolingoRow({
  row,
  isViewer,
  activeStatusEmoji,
}: {
  row: LeaderboardRow;
  isViewer: boolean;
  activeStatusEmoji?: string;
}) {
  const { locale, text } = useLocalizedText();
  const isPodium = row.rank <= 3;
  const isPromotionZone = row.rank >= 4 && row.rank <= 10;
  const seniority = formatSeniority(row.created_at, row.streak);

  // Status emoji: usa o status escolhido localmente se for o usuário autenticado, ou o do banco
  const displayStatus = isViewer ? activeStatusEmoji || row.status_emoji : row.status_emoji;

  return (
    <Link
      href={`/profile/${encodeURIComponent(row.username)}`}
      aria-label={text(
        `${row.rank}º lugar, ${row.username}, ${formatXp(row.xp, locale)} XP`,
        `Rank ${row.rank}, ${row.username}, ${formatXp(row.xp, locale)} XP`
      )}
      className={`group relative grid min-h-[68px] grid-cols-[44px_48px_minmax(0,1fr)_auto] sm:grid-cols-[48px_56px_minmax(0,1fr)_120px] items-center gap-3 rounded-2xl px-3 sm:px-4 py-2.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isViewer
          ? 'border-2 border-blue-500/40 dark:border-blue-500/50 bg-blue-500/[0.08] dark:bg-[#121c2e] shadow-[0_4px_20px_rgba(0,131,254,0.12)] dark:shadow-[0_4px_24px_rgba(0,131,254,0.18)] ring-1 ring-blue-400/25 dark:ring-blue-400/30'
          : 'border border-transparent hover:bg-dd-surface/60'
      }`}
    >
      {/* Coluna 1: Medalha ou Número da Posição */}
      <div className="flex items-center justify-center">
        {isPodium ? (
          <LeaderboardMedal
            rank={row.rank}
            className="h-9 w-9 transition-transform duration-200 group-hover:scale-110"
          />
        ) : (
          <span
            className={`font-mono text-base sm:text-lg font-black ${
              isPromotionZone
                ? 'text-blue-600 dark:text-blue-400 drop-shadow-[0_1px_4px_rgba(96,165,250,0.35)]'
                : 'text-dd-muted'
            }`}
          >
            {row.rank}
          </span>
        )}
      </div>

      {/* Coluna 2: Avatar com Balão de Status do Duolingo e ponto online */}
      <div className="relative flex items-center justify-center">
        <div className="relative">
          <AuthorAvatar
            username={row.username}
            avatar_url={row.avatar_url}
            size="md"
            className="!h-11 !w-11 sm:!h-12 sm:!w-12 border-2 border-dd-border transition-transform group-hover:scale-105"
          />

          {/* Balão de Status (Duolingo style) */}
          {displayStatus && <StatusBubble emoji={displayStatus} size="sm" />}

          {/* Ponto de status online */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#0b0f17] bg-emerald-500" />
        </div>
      </div>

      {/* Coluna 3: Nome do Desenvolvedor e Subtítulo (Streak / Tempo de casa) */}
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm sm:text-[15px] font-black tracking-tight ${
              isViewer
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-dd-text group-hover:text-blue-500 dark:group-hover:text-blue-400'
            }`}
          >
            {row.username}
          </p>
          {isViewer && (
            <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm shadow-blue-500/40">
              {text('Você', 'You')}
            </span>
          )}
        </div>

        {/* Subtítulo informativo estilo Duolingo */}
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-dd-muted">
          {seniority ? (
            <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400/95">
              <Image
                src="/assets/trails/streak-flame.png"
                alt=""
                width={16}
                height={16}
                className="h-3.5 w-3.5 shrink-0 object-contain inline-block"
              />
              <span>{seniority}</span>
            </span>
          ) : (
            <span className="font-semibold text-dd-muted">
              {text('Nível', 'Level')} {row.level}
            </span>
          )}
        </div>
      </div>

      {/* Coluna 4: Pontuação de XP */}
      <div className="text-right font-mono text-sm sm:text-base font-black">
        <span
          className={`flex items-center justify-end gap-1.5 ${
            isViewer
              ? 'text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]'
              : 'text-dd-text'
          }`}
        >
          <span>{formatXp(row.xp, locale)} XP</span>
        </span>
      </div>
    </Link>
  );
}

function ArrowUpIcon({ className = 'h-3.5 w-3.5 shrink-0' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2L13.5 7.5H10V14H6V7.5H2.5L8 2Z" />
    </svg>
  );
}

function ArrowDownIcon({ className = 'h-3.5 w-3.5 shrink-0' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.6"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 14L2.5 8.5H6V2H10V8.5H13.5L8 14Z" />
    </svg>
  );
}

export function LeaderboardClient({
  initialUser,
  initialLeaderboard,
  initialLanguage = 'JS',
  courses,
}: LeaderboardClientProps) {
  const { locale, text } = useLocalizedText();
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(initialLeaderboard);
  const [activeLanguage, setActiveLanguage] = useState<TrailLanguageCode>(initialLanguage);
  const [loading, setLoading] = useState(false);
  const [activeDivision, setActiveDivision] = useState<string>('ouro');
  const [userStatusEmoji, setUserStatusEmoji] = useState<string>('👀');
  const isFirstMount = useRef(true);

  // Carregar status do usuário do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('stacklyst_user_status_emoji');
      if (saved) {
        setUserStatusEmoji(saved);
      }
    } catch {
      // Ignora erro de storage desabilitado
    }
  }, []);

  const handleSelectStatus = useCallback((emoji: string) => {
    setUserStatusEmoji(emoji);
    try {
      localStorage.setItem('stacklyst_user_status_emoji', emoji);
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleClearStatus = useCallback(() => {
    setUserStatusEmoji('');
    try {
      localStorage.removeItem('stacklyst_user_status_emoji');
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const controller = new AbortController();

    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?language=${activeLanguage}`, {
          signal: controller.signal,
        });

        if (!response.ok)
          throw new Error(
            text('Não foi possível carregar o ranking.', 'Could not load the ranking.')
          );
        const data = await response.json().catch(() => []);
        if (!controller.signal.aborted) {
          setLeaderboard(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching leaderboard:', error);
          setLeaderboard([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchLeaderboard();
    return () => controller.abort();
  }, [activeLanguage, text]);

  const activeMetadata = getTrailLanguageMetadata(activeLanguage);
  const languageLabel = activeMetadata.label;
  const viewerRow = initialUser
    ? leaderboard.find((row) => row.username === initialUser.username)
    : undefined;

  const currentDivision = DIVISIONS.find((d) => d.id === activeDivision) ?? DIVISIONS[2];

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen selection:bg-blue-500/35 selection:text-white">
      <Sidebar user={initialUser} />

      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center bg-dd-bg xl:max-w-[1320px] xl:justify-start">
        {/* Coluna Central do Ranking */}
        <main className="flex min-h-screen w-full min-w-0 max-w-[760px] flex-grow flex-col bg-dd-bg pb-24 md:pb-12">
          {/* Header com os Escudos de Divisão estilo Duolingo */}
          <header className="px-4 pb-4 pt-6 sm:px-8 sm:pt-8">
            {/* Título com acessibilidade para testes */}
            <h1 className="sr-only">{text('Ranking de XP', 'XP Ranking')}</h1>

            {/* Trilha de Escudos de Divisão (Bronze, Prata, Ouro, Safira, Rubi, Diamante) */}
            <div
              aria-label={text('Divisões de XP', 'XP Divisions')}
              className="flex min-h-[96px] items-end justify-center gap-2.5 sm:gap-4 py-2"
            >
              {DIVISIONS.map((division) => (
                <DivisionShield
                  key={division.id}
                  division={division}
                  isActive={division.id === activeDivision}
                  onClick={() => {
                    if (division.isUnlocked) {
                      setActiveDivision(division.id);
                    }
                  }}
                />
              ))}
            </div>

            {/* Título da Divisão Ativa & Regra de Promoção */}
            <div className="mt-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-dd-text">
                {currentDivision.labelPt}
              </h2>
              <p className="mt-1 text-sm font-semibold text-dd-muted">
                {text(
                  `Os 10 primeiros na trilha de ${languageLabel} avançam pra próxima divisão.`,
                  `The top 10 in the ${languageLabel} trail advance to the next division.`
                )}
              </p>
              <div className="mt-2 flex w-full items-center justify-center text-center">
                <p className="text-center text-[11px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400">
                  {text('6 dias restantes', '6 days remaining')}
                </p>
              </div>
            </div>

            {/* Linha separadora sutil */}
            <div className="mt-6 border-b border-dd-border/80" />
          </header>

          {/* Tabela do Ranking (Leaderboard Rows) */}
          <section
            aria-label={text(`Classificação ${languageLabel}`, `${languageLabel} ranking`)}
            aria-busy={loading}
            className="px-3 sm:px-6"
          >
            {loading ? (
              <div className="space-y-2 py-2" aria-live="polite">
                <p className="sr-only">
                  {text('Carregando classificação...', 'Loading ranking...')}
                </p>
                {Array.from({ length: 10 }, (_, index) => (
                  <div
                    key={index}
                    className="dd-skeleton h-[68px] w-full rounded-2xl"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-1">
                {leaderboard.map((row) => {
                  const isViewer = initialUser?.username === row.username;
                  const isTenth = row.rank === 10;
                  const isRelegationBoundary =
                    leaderboard.length > 20 &&
                    row.rank === (leaderboard.length >= 30 ? 25 : leaderboard.length - 5);
                  const showBothAtTenth =
                    isTenth && leaderboard.length > 10 && leaderboard.length <= 20;
                  const showPromotionOnlyAtTenth = isTenth && leaderboard.length > 20;

                  return (
                    <div key={row.username}>
                      <DuolingoRow
                        row={row}
                        isViewer={isViewer}
                        activeStatusEmoji={isViewer ? userStatusEmoji : undefined}
                      />

                      {/* Exibição quando a liga tem entre 11 e 20 participantes (exatamente como na referência) */}
                      {showBothAtTenth && (
                        <div className="my-5 flex flex-col items-center justify-center gap-3.5 py-1 select-none">
                          <div className="flex items-center justify-center gap-2.5 text-[11px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400">
                            <ArrowUpIcon />
                            <span>{text('ZONA DE PROMOÇÃO', 'PROMOTION ZONE')}</span>
                            <ArrowUpIcon />
                          </div>
                          <div className="flex items-center justify-center gap-2.5 text-[11px] font-black uppercase tracking-wider text-red-500 dark:text-red-400">
                            <ArrowDownIcon />
                            <span>{text('ZONA DE REBAIXAMENTO', 'RELEGATION ZONE')}</span>
                            <ArrowDownIcon />
                          </div>
                        </div>
                      )}

                      {/* Divisor da Zona de Promoção (quando há mais de 20 participantes) */}
                      {showPromotionOnlyAtTenth && (
                        <div className="my-4 flex items-center justify-center gap-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-blue-500 dark:text-blue-400 select-none">
                          <ArrowUpIcon />
                          <span>{text('ZONA DE PROMOÇÃO', 'PROMOTION ZONE')}</span>
                          <ArrowUpIcon />
                        </div>
                      )}

                      {/* Divisor da Zona de Rebaixamento (quando há mais de 20 participantes) */}
                      {isRelegationBoundary && (
                        <div className="my-4 flex items-center justify-center gap-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 select-none">
                          <ArrowDownIcon />
                          <span>{text('ZONA DE REBAIXAMENTO', 'RELEGATION ZONE')}</span>
                          <ArrowDownIcon />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-dd-border px-6 py-14 text-center">
                <Trophy aria-hidden="true" className="mx-auto h-10 w-10 text-dd-muted" />
                <p className="mt-3 text-base font-black text-dd-text">
                  {text(
                    'Ainda não há perfis neste ranking.',
                    'There are no profiles in this ranking yet.'
                  )}
                </p>
                <p className="mt-1 text-xs font-semibold text-dd-muted">
                  {text(
                    `Inicie a trilha de ${languageLabel} para conquistar XP e entrar na liga!`,
                    `Start the ${languageLabel} trail to gain XP and join the league!`
                  )}
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Barra Lateral Direita (Widgets Duolingo) */}
        <aside className="sticky top-0 hidden h-screen w-[380px] shrink-0 overflow-y-auto bg-dd-bg p-5 scrollbar-none xl:block">
          {/* Barra Superior de Stats Rápidos (Bandeira da Linguagem, Foguinho, Raio, Prêmio Azul) */}
          <div className="flex items-center justify-between gap-2 pb-5 px-2 select-none">
            {/* Bandeira e seletor da linguagem das trilhas */}
            <TrailCourseSelector
              activeLanguage={activeLanguage}
              courses={
                courses ?? [
                  {
                    language: activeLanguage,
                    xp: viewerRow?.xp ?? initialUser?.total_xp ?? 0,
                    started: true,
                  },
                ]
              }
              onSelectCourse={setActiveLanguage}
              variant="rail"
              allowAddingCourses={false}
            />

            {/* Foguinho bonito do perfil */}
            <StreakPopover
              streak={initialUser?.streak ?? 0}
              lastActiveAt={initialUser?.last_active_at}
              triggerClassName="group flex items-center gap-1.5 rounded-xl p-1 text-orange-500 dark:text-orange-400 hover:opacity-85 transition-opacity cursor-pointer select-none"
            >
              <Image
                data-testid="glossy-streak-flame"
                src="/assets/trails/streak-flame.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 object-contain transition-transform group-hover:scale-110"
              />
              <span className="font-mono text-sm font-black text-dd-text">
                {initialUser?.streak ?? 0}
              </span>
            </StreakPopover>

            {/* Raio de XP do perfil */}
            <div
              className="group flex items-center gap-1.5 rounded-xl p-1 select-none"
              title={`${formatXp(viewerRow?.xp ?? initialUser?.total_xp ?? 0)} XP`}
            >
              <Image
                src="/assets/trails/trail-lightning.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 object-contain drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)] transition-transform group-hover:scale-110"
              />
              <span className="font-mono text-sm font-black text-dd-text">
                {formatXp(viewerRow?.xp ?? initialUser?.total_xp ?? 0)}
              </span>
            </div>

            {/* Prêmio azul do perfil que mostra a colocação */}
            {viewerRow && (
              <div
                className="group flex items-center gap-1.5 rounded-xl p-1 select-none"
                title={text('Posição no Ranking', 'Rank Position')}
              >
                <Trophy
                  className="h-5 w-5 shrink-0 text-blue-500 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-transform group-hover:scale-110"
                  fill="currentColor"
                  strokeWidth={2.5}
                />
                <span className="font-mono text-sm font-black text-dd-text">#{viewerRow.rank}</span>
              </div>
            )}
          </div>

          {/* Widget 1: Escolha o seu status (Duolingo Iconic Status Widget) */}
          <section
            aria-labelledby="status-picker-title"
            className="rounded-[24px] border border-slate-200/80 dark:border-white/[0.12] bg-white dark:bg-black p-5 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/80"
          >
            <div className="flex items-center justify-between">
              <h2 id="status-picker-title" className="text-sm font-black text-dd-text">
                {text('Escolha o seu status', 'Choose your status')}
              </h2>
              {userStatusEmoji && (
                <button
                  type="button"
                  onClick={handleClearStatus}
                  className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  {text('LIMPAR', 'CLEAR')}
                </button>
              )}
            </div>

            {/* Visualizador do Avatar com o Balão de Status */}
            {initialUser && (
              <div className="my-5 flex flex-col items-center justify-center">
                <div className="relative">
                  <AuthorAvatar
                    username={initialUser.username}
                    avatar_url={initialUser.avatar_url}
                    size="lg"
                    className="!h-[84px] !w-[84px] border-[3px] border-blue-500/50 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20"
                  />

                  {/* Balão com o emoji ativo */}
                  {userStatusEmoji ? (
                    <StatusBubble emoji={userStatusEmoji} size="lg" />
                  ) : (
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-black bg-slate-100 dark:bg-[#141414] text-xs text-slate-500 dark:text-slate-400 shadow">
                      💬
                    </div>
                  )}

                  {/* Ponto online */}
                  <span className="absolute bottom-0 right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-black bg-emerald-500" />
                </div>

                <p className="mt-3 text-sm font-black text-dd-text">{initialUser.username}</p>
                <p className="text-xs text-dd-muted">
                  {userStatusEmoji
                    ? (STATUS_EMOJIS.find((s) => s.emoji === userStatusEmoji)?.label ?? 'Ativo')
                    : text('Nenhum status selecionado', 'No status selected')}
                </p>
              </div>
            )}

            {/* Grade com os 12 stickers/emojis interativos estilo Duolingo */}
            <div className="grid grid-cols-6 gap-2">
              {STATUS_EMOJIS.map((item) => {
                const isSelected = userStatusEmoji === item.emoji;

                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => handleSelectStatus(item.emoji)}
                    title={item.label}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-b-[4px] text-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 dark:border-blue-400 dark:bg-blue-500/30 ring-2 ring-blue-500/50 scale-105 shadow-md shadow-blue-500/20 dark:shadow-blue-500/30'
                        : 'border-slate-200 dark:border-white/[0.08] bg-slate-100/90 dark:bg-[#0c0c0c] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200/80 dark:hover:bg-[#181818] hover:scale-105 active:border-b-2 active:translate-y-0.5'
                    }`}
                  >
                    <span className="select-none leading-none">{item.emoji}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Links de Rodapé estilo Duolingo */}
          <footer className="mt-8 px-4 text-center">
            <nav
              aria-label={text('Links úteis', 'Useful links')}
              className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500"
            >
              <Link
                href="/feed"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Sobre
              </Link>
              <Link
                href="/trails"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Trilhas
              </Link>
              <Link
                href="/duels"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Duelos
              </Link>
              <Link
                href="/guilds"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Comunidades
              </Link>
              <Link
                href="/settings"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/settings"
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                Privacidade
              </Link>
            </nav>
            <p className="mt-4 text-[10px] font-bold text-slate-500 dark:text-slate-600">
              © {new Date().getFullYear()} Stacklyst. Todos os direitos reservados.
            </p>
          </footer>
        </aside>
      </div>
    </div>
  );
}
