'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronRight } from 'lucide-react';
import { FeedEngagementCard } from '@/app/feed/FeedEngagementCard';
import { WhoToFollow } from '@/components/WhoToFollow';
import { LanguageTrailBar } from '@/components/LanguageTrailBar';
import { ExploreSearchField } from '@/components/ExploreSearchField';
import { calculateLevel } from '@/lib/learning/rewards';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { exploreSearchUrl } from '@/lib/explore-search';
import { continueStudyingHref } from '@/lib/learning/continue-studying';
import styles from './FeedStudies.module.css';

function hasStartedTrail(trail: any) {
  return (trail.level ?? 1) > 1 || (trail.xp ?? 0) > 0;
}

interface FeedRightSidebarProps {
  user?: any;
  weeklyActivity?: Map<number, number>;
  currentDate?: string;
  className?: string;
  /** Pages with their own search (Explore) hide the rail search box. */
  hideSearch?: boolean;
  /** Pages that already list follow suggestions hide the rail widget. */
  hideWhoToFollow?: boolean;
}

export function FeedRightSidebar({
  user,
  weeklyActivity: externalWeeklyActivity,
  currentDate: externalCurrentDate,
  className,
  hideSearch = false,
  hideWhoToFollow = false,
}: FeedRightSidebarProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const [searchInput, setSearchInput] = useState('');
  const [internalWeeklyActivity, setInternalWeeklyActivity] = useState<Map<number, number>>(
    new Map()
  );
  const [internalCurrentDate, setInternalCurrentDate] = useState<string | null>(null);

  // Weekly activity state
  const weeklyActivity = externalWeeklyActivity ?? internalWeeklyActivity;
  const currentDate = externalCurrentDate ?? internalCurrentDate;

  useEffect(() => {
    setInternalCurrentDate(new Date().toISOString());
  }, []);

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
      {!hideSearch && (
        <form
          action="/explore"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (searchInput.trim()) router.push(exploreSearchUrl(searchInput));
          }}
        >
          <ExploreSearchField value={searchInput} onChange={setSearchInput} compact />
        </form>
      )}

      {user && (
        <FeedEngagementCard
          streak={currentStreak}
          weeklyActivity={weeklyActivity}
          lastActiveAt={currentLastActiveAt}
          currentDate={currentDate}
        />
      )}

      {user && !hideWhoToFollow && <WhoToFollow viewerId={user.id} />}

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
        <Link href={continueStudyingHref(user?.trails ?? [])} className={styles.continue}>
          {text('Continuar estudando', 'Continue studying')}
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
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
