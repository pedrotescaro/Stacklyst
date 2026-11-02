'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Swords, ChevronRight, type LucideIcon } from 'lucide-react';
import { FeedEngagementCard } from '@/app/feed/FeedEngagementCard';
import { WhoToFollow } from '@/components/WhoToFollow';
import { LanguageTrailBar } from '@/components/LanguageTrailBar';
import { calculateLevel } from '@/lib/learning/rewards';
import { LanguageTag } from '@/components/LanguageTag';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from './FeedStudies.module.css';

function RailSectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-black leading-tight text-dd-text">{title}</h3>
        <p className="mt-1 text-[11px] font-bold leading-4 text-dd-muted">{description}</p>
      </div>
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-400"
      >
        <Icon className="h-6 w-6" strokeWidth={2.6} />
      </div>
    </div>
  );
}

function hasStartedTrail(trail: any) {
  return (trail.level ?? 1) > 1 || (trail.xp ?? 0) > 0;
}

interface FeedRightSidebarProps {
  user?: any;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  loadingSearch?: boolean;
  duels?: any[];
  duelsLoading?: boolean;
  weeklyActivity?: Map<number, number>;
  currentDate?: string;
  className?: string;
}

export function FeedRightSidebar({
  user,
  searchQuery: externalSearchQuery,
  onSearchChange,
  loadingSearch = false,
  duels: externalDuels,
  duelsLoading: externalDuelsLoading,
  weeklyActivity: externalWeeklyActivity,
  currentDate: externalCurrentDate,
  className,
}: FeedRightSidebarProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalDuels, setInternalDuels] = useState<any[]>([]);
  const [internalDuelsLoading, setInternalDuelsLoading] = useState(false);
  const [internalWeeklyActivity, setInternalWeeklyActivity] = useState<Map<number, number>>(
    new Map()
  );
  const [internalCurrentDate, setInternalCurrentDate] = useState<string>(new Date().toISOString());

  const isControlledSearch = externalSearchQuery !== undefined && onSearchChange !== undefined;
  const currentSearchQuery = isControlledSearch ? externalSearchQuery : internalSearchQuery;

  // Duels state
  const duels = externalDuels ?? internalDuels;
  const duelsLoading = externalDuelsLoading ?? internalDuelsLoading;

  // Weekly activity state
  const weeklyActivity = externalWeeklyActivity ?? internalWeeklyActivity;
  const currentDate = externalCurrentDate ?? internalCurrentDate;

  // Fetch duels if not passed externally
  useEffect(() => {
    if (externalDuels !== undefined) return;
    let active = true;
    const fetchDuels = async () => {
      setInternalDuelsLoading(true);
      try {
        const res = await fetch('/api/duels');
        if (res.ok && active) {
          const data = await res.json();
          setInternalDuels(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error loading duels in sidebar:', err);
      } finally {
        if (active) setInternalDuelsLoading(false);
      }
    };
    fetchDuels();
    return () => {
      active = false;
    };
  }, [externalDuels]);

  // Fetch weekly activity if not passed externally
  useEffect(() => {
    if (externalWeeklyActivity !== undefined) return;
    let active = true;
    const fetchWeekly = async () => {
      try {
        const res = await fetch('/api/quiz/weekly-activity');
        if (res.ok && active) {
          const data = await res.json();
          const counts = new Map<number, number>();
          (data.weekDays as Array<{ index: number; count: number }> | undefined)?.forEach((d) => {
            counts.set(d.index, d.count);
          });
          setInternalWeeklyActivity(counts);
          if (typeof data.today === 'string') {
            setInternalCurrentDate(data.today);
          }
        }
      } catch (err) {
        console.error('Error loading weekly activity in sidebar:', err);
      }
    };
    fetchWeekly();
    return () => {
      active = false;
    };
  }, [externalWeeklyActivity]);

  const handleSearchChange = (val: string) => {
    if (isControlledSearch) {
      onSearchChange(val);
    } else {
      setInternalSearchQuery(val);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isControlledSearch && internalSearchQuery.trim()) {
      router.push(`/feed?q=${encodeURIComponent(internalSearchQuery.trim())}`);
    }
  };

  const activeDuels = duels.filter((d) => d.status === 'ACTIVE').slice(0, 2);
  const startedTrails = (user?.trails ?? []).filter(hasStartedTrail);
  const currentStreak = user?.streak_days ?? user?.streak ?? 0;
  const currentLastActiveAt = user?.last_active_at ?? user?.lastActiveAt ?? null;

  return (
    <aside
      data-testid="secondary-column"
      className={cn(
        'sticky top-0 hidden h-screen w-[360px] xl:w-[380px] shrink-0 space-y-6 overflow-y-auto p-5 scrollbar-none xl:block',
        className
      )}
    >
      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-dd-muted" />
        </div>
        <input
          type="text"
          placeholder={text('Buscar', 'Search')}
          aria-label={text('Buscar', 'Search')}
          value={currentSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-11 pr-4 py-2.5 bg-dd-search-bg hover:bg-dd-search-bg/80 focus:bg-dd-bg border border-dd-search-border focus:border-blue-500/50 text-sm rounded-full text-dd-text placeholder-dd-muted focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-200"
        />
      </div>
      {currentSearchQuery.trim() && (
        <div className="rounded-xl border border-dd-border bg-dd-surface/70 p-3 text-xs text-dd-muted">
          {loadingSearch
            ? text('Filtrando o feed em tempo real...', 'Filtering the feed in real time...')
            : text(
                `Termo ativo: "${currentSearchQuery}".`,
                `Active search: "${currentSearchQuery}".`
              )}
        </div>
      )}

      {user && (
        <FeedEngagementCard
          streak={currentStreak}
          weeklyActivity={weeklyActivity}
          lastActiveAt={currentLastActiveAt}
          currentDate={currentDate}
        />
      )}

      {user && <WhoToFollow viewerId={user.id} />}

      {/* Study progress uses the same bar as the profile. */}
      <section className={styles.widget} aria-labelledby="rail-studies-title">
        <header className={styles.header}>
          <h3 id="rail-studies-title">
            <BookOpen size={20} aria-hidden="true" />
            {text('Meus estudos', 'My studies')}
          </h3>
          <p>{text('Seu progresso por linguagem', 'Your progress by language')}</p>
        </header>
        {startedTrails.length === 0 ? (
          <p className={styles.empty}>
            {text(
              'Comece uma trilha para acompanhar seus estudos aqui.',
              'Start a trail to follow your studies here.'
            )}
          </p>
        ) : (
          <div className={styles.list}>
            {startedTrails.map((trail: { id?: string; language: string; xp: number }) => {
              const progress = calculateLevel(trail.xp);
              return (
                <div key={trail.id || trail.language} className={styles.row}>
                  <LanguageTrailBar
                    language={trail.language}
                    xp={trail.xp}
                    level={progress.level}
                    maxXp={progress.nextLevelXp}
                    compact
                  />
                </div>
              );
            })}
          </div>
        )}
        <Link href="/trails" className={styles.continue}>
          {text('Continuar estudando', 'Continue studying')}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {/* Featured Duels (votar em resoluções) */}
      <section className="space-y-5 rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-5">
        <RailSectionHeading
          title={text('Duelos em Destaque', 'Featured Duels')}
          description={text(
            'Resolva, vote e suba no ranking',
            'Solve, vote, and climb the ranking'
          )}
          icon={Swords}
        />

        {duelsLoading ? (
          <div
            className="space-y-3"
            aria-label={text('Carregando duelos em destaque', 'Loading featured duels')}
          >
            <div className="dd-skeleton-post dd-skeleton h-20 rounded-lg" />
            <div className="dd-skeleton-post dd-skeleton h-20 rounded-lg" />
          </div>
        ) : activeDuels.length === 0 ? (
          <p className="rounded-2xl bg-dd-surface p-4 text-xs font-bold text-dd-muted">
            {text('Nenhum duelo ativo no momento.', 'No active duels right now.')}
          </p>
        ) : (
          <div className="space-y-3.5">
            {activeDuels.map((duel: any) => (
              <div
                key={duel.id}
                className="space-y-3 rounded-2xl border-2 border-blue-500/25 bg-gradient-to-br from-blue-500/[0.12] to-dd-surface p-4 transition-colors hover:border-blue-500/50"
              >
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="rounded-lg bg-blue-500/15 px-2 py-1 font-black tracking-wide text-blue-400">
                    {text('DUELO DE CÓDIGO', 'CODE DUEL')}
                  </span>
                  {duel.language && <LanguageTag language={duel.language} size="sm" />}
                </div>
                <h4 className="line-clamp-2 text-sm font-black leading-snug text-dd-text">
                  {duel.problem_title}
                </h4>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[10px] font-bold text-dd-muted">
                    @{duel.challenger.username} vs @{duel.opponent?.username || 'match...'}
                  </span>
                  <Link
                    href={`/duels/${duel.id}`}
                    className="flex shrink-0 items-center rounded-xl border-b-[3px] border-blue-700 bg-blue-500 px-3 py-2 text-[11px] font-black text-white transition-transform hover:-translate-y-0.5 hover:bg-blue-400"
                  >
                    {text('Votar', 'Vote')}
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sidebar Footer Info */}
      <footer className="px-3 py-2 text-[11px] font-medium text-dd-muted/70 leading-relaxed">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          <Link href="/terms" className="hover:text-dd-text hover:underline transition-colors">
            {text('Termos de Serviço', 'Terms of Service')}
          </Link>
          <Link href="/privacy" className="hover:text-dd-text hover:underline transition-colors">
            {text('Privacidade', 'Privacy')}
          </Link>
          <Link href="/guidelines" className="hover:text-dd-text hover:underline transition-colors">
            {text('Diretrizes', 'Guidelines')}
          </Link>
          <Link href="/about" className="hover:text-dd-text hover:underline transition-colors">
            {text('Sobre', 'About')}
          </Link>
          <span>© 2026 Stacklyst</span>
        </div>
      </footer>
    </aside>
  );
}
