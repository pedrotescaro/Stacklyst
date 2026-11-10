'use client';

import type { MotionValue } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { RankingPlayer } from '@/app/leaderboard/MobileRankingBoard';
import { FeedRankingSwitcher, feedRankingSurfaceClassName } from '@/components/FeedRankingSwitcher';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import boardStyles from '@/app/leaderboard/MobileRankingBoard.module.css';
import { DemoShell } from '../DemoShell';
import { DemoRightRail } from '../DemoRightRail';
import { DEMO_USER, demoRanking } from '../demo-data';
import { usePhase } from '../timeline';

/** Beats: XP counter reaches the next level, then the rows reorder. */
export const RANKING_MARKS = [2.4, 3.8] as const;
export const RANKING_START_XP = DEMO_USER.total_xp + DEMO_USER.lesson_xp;
export const RANKING_END_XP = 1500;

export function RankingScene({ clock, mobile }: { clock: MotionValue<number>; mobile: boolean }) {
  const { text } = useLocalizedText();
  const phase = usePhase(clock, RANKING_MARKS);
  const userXp = phase >= 1 ? RANKING_END_XP : RANKING_START_XP;
  const ranked = demoRanking(userXp);
  // Until the server re-ranks, the row keeps its place with the fresh XP.
  const rows =
    phase >= 2
      ? ranked
      : demoRanking(RANKING_START_XP).map((row) =>
          row.username === DEMO_USER.username ? { ...row, xp: userXp } : row
        );
  const podium = [2, 1, 3].map((rank) => rows.find((row) => row.rank === rank));
  const rest = rows.filter((row) => row.rank > 3);

  return (
    <DemoShell route="ranking" mobile={mobile} rail={<DemoRightRail trailXp={userXp} />}>
      <h1 className="sr-only">{text('Ranking de XP', 'XP ranking')}</h1>
      <section
        className={`${boardStyles.board} ${feedRankingSurfaceClassName}`}
        aria-label={text('Ranking', 'Ranking')}
      >
        <FeedRankingSwitcher active="ranking" />
        <div
          className="my-2 flex items-center gap-2"
          role="group"
          aria-label={text('Período do ranking', 'Ranking period')}
        >
          {[text('Diário', 'Daily'), text('Semanal', 'Weekly'), text('Mensal', 'Monthly')].map(
            (label) => (
              <span
                key={label}
                aria-pressed="false"
                className="inline-flex min-h-11 items-center rounded-full border border-dd-border px-3 text-xs font-bold text-dd-muted"
              >
                {label}
              </span>
            )
          )}
          <span
            aria-label={text('Escolher linguagem do ranking', 'Choose ranking language')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dd-border"
          >
            <Pencil size={16} />
          </span>
        </div>
        <p className="mb-4 text-xs text-dd-muted">
          Global ·{' '}
          {text(
            'XP acumulado desde o início da plataforma.',
            'All-time XP accumulated across the platform.'
          )}
        </p>
        <div className={boardStyles.results} data-testid="demo-ranking-results">
          <div className={boardStyles.podium} aria-label={text('Pódio', 'Podium')}>
            {podium.map((row, index) => (
              <div
                key={[2, 1, 3][index]}
                className={boardStyles.podiumSlot}
                data-rank={[2, 1, 3][index]}
              >
                {row && <RankingPlayer row={row} featured />}
              </div>
            ))}
          </div>
          <div className={boardStyles.list}>
            {rest.map((row) => (
              <div key={row.username} data-demo-rank={row.rank}>
                <RankingPlayer row={row} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </DemoShell>
  );
}
