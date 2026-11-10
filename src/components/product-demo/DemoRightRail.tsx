'use client';

import { BookOpen, ChevronRight, Search } from 'lucide-react';
import { FeedEngagementCard } from '@/app/feed/FeedEngagementCard';
import { LanguageTrailBar } from '@/components/LanguageTrailBar';
import { calculateLevel } from '@/lib/learning/rewards';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import styles from '@/components/FeedStudies.module.css';
import { DEMO_NOW, DEMO_USER, DEMO_WEEKLY_ACTIVITY } from './demo-data';

/**
 * Projection of `FeedRightSidebar` (search, streak card, study progress and
 * footer links) with fixed data. The real rail fetches weekly activity and
 * follow suggestions; the suggestions block is omitted here because it has
 * no presentational variant.
 */
export function DemoRightRail({ trailXp }: { trailXp: number }) {
  const { text } = useLocalizedText();
  const progress = calculateLevel(trailXp);
  return (
    <aside
      data-testid="secondary-column"
      className="sticky top-0 flex h-full w-[380px] shrink-0 flex-col gap-6 overflow-hidden p-5"
    >
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-4 w-4 text-dd-muted" />
        </div>
        <input
          type="text"
          readOnly
          tabIndex={-1}
          placeholder={text('Buscar', 'Search')}
          aria-label={text('Buscar', 'Search')}
          className="w-full rounded-full border border-dd-search-border bg-dd-search-bg py-2.5 pl-11 pr-4 text-sm text-dd-text placeholder-dd-muted"
        />
      </div>

      <FeedEngagementCard
        streak={DEMO_USER.streak}
        weeklyActivity={DEMO_WEEKLY_ACTIVITY}
        lastActiveAt={DEMO_USER.last_active_at}
        currentDate={DEMO_NOW}
      />

      <section className={styles.widget} aria-labelledby="demo-rail-studies-title">
        <header className={styles.header}>
          <h3 id="demo-rail-studies-title">
            <BookOpen size={20} aria-hidden="true" />
            {text('Meus estudos', 'My studies')}
          </h3>
          <p>{text('Seu progresso por linguagem', 'Your progress by language')}</p>
        </header>
        <div className={styles.list}>
          <div className={styles.row}>
            <LanguageTrailBar
              language="JS"
              xp={trailXp}
              level={progress.level}
              maxXp={progress.nextLevelXp}
              compact
            />
          </div>
        </div>
        <span className={styles.continue}>
          {text('Continuar estudando', 'Continue studying')}
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </section>

      <footer className="px-3 py-2 text-[11px] font-medium leading-relaxed text-dd-muted/70">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          <span>{text('Termos de Serviço', 'Terms of Service')}</span>
          <span>{text('Privacidade', 'Privacy')}</span>
          <span>{text('Diretrizes', 'Guidelines')}</span>
          <span>{text('Sobre', 'About')}</span>
          <span>© 2026 Stacklyst</span>
        </div>
      </footer>
    </aside>
  );
}
