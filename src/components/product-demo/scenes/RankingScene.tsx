import Link from 'next/link';
import Image from 'next/image';
import { LeaderboardMedal } from '@/components/LeaderboardMedal';
import { Check, LockKeyhole, Shield } from 'lucide-react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { AuthorAvatar } from '@/components/AuthorAvatar';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { smooth } from '../timeline';
interface LeaderboardRow {
  rank: number;
  username: string;
  avatar_url?: string | null;
  xp: number;
  level: number;
}
// Read-only projection of LeaderboardClient: same milestones, medals and rows.
const XP_MILESTONES = [100, 500, 1_000, 2_500, 5_000] as const;

function formatXp(value: number, locale = 'pt-BR') {
  return Math.max(0, value).toLocaleString(locale);
}

function XpMilestoneStrip({ totalXp }: { totalXp: number }) {
  const { locale, text } = useLocalizedText();
  const activeIndex = XP_MILESTONES.reduce<number>(
    (current, milestone, index) => (totalXp >= milestone ? index : current),
    0
  );

  return (
    <div
      aria-label={text('Marcos de XP', 'XP milestones')}
      className="flex min-h-[104px] items-end justify-center gap-3 sm:gap-4"
    >
      {XP_MILESTONES.map((milestone, index) => {
        const isCurrent = index === activeIndex;
        const isReached = totalXp >= milestone;

        return (
          <div
            key={milestone}
            className={`flex flex-col items-center gap-2 transition-transform ${
              isCurrent ? '-translate-y-1' : ''
            }`}
          >
            <div
              role="img"
              aria-label={
                isCurrent
                  ? `${isReached ? text('Marco atual', 'Current milestone') : text('Próximo marco', 'Next milestone')}: ${formatXp(milestone, locale)} XP`
                  : `${formatXp(milestone, locale)} XP ${isReached ? text('alcançado', 'reached') : text('bloqueado', 'locked')}`
              }
              className={`relative flex items-center justify-center border-2 border-b-[6px] shadow-lg ${
                isCurrent
                  ? 'h-[82px] w-[72px] rounded-[24px] border-blue-300 bg-blue-500 text-white shadow-blue-500/20'
                  : isReached
                    ? 'h-[64px] w-[58px] rounded-[20px] border-blue-500/45 bg-blue-500/20 text-blue-300 shadow-blue-500/10'
                    : 'h-[64px] w-[58px] rounded-[20px] border-dd-border bg-dd-surface text-dd-muted shadow-black/10'
              }`}
            >
              <Shield
                aria-hidden="true"
                className={isCurrent ? 'h-11 w-11 fill-white/10' : 'h-8 w-8 fill-current/10'}
                strokeWidth={2.2}
              />
              {isCurrent && isReached ? (
                <Check
                  aria-hidden="true"
                  className="absolute h-6 w-6 text-white"
                  strokeWidth={3.5}
                />
              ) : !isReached ? (
                <LockKeyhole aria-hidden="true" className="absolute h-4 w-4" />
              ) : null}
            </div>
            <span
              className={`hidden font-mono text-[9px] font-black sm:block ${
                isCurrent ? 'text-blue-400' : 'text-dd-muted'
              }`}
            >
              {formatXp(milestone, locale)} XP
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RankingRow({ row, isViewer }: { row: LeaderboardRow; isViewer: boolean }) {
  const { locale, text } = useLocalizedText();
  const isPodium = row.rank <= 3;

  return (
    <Link
      href={`/profile/${encodeURIComponent(row.username)}`}
      aria-label={text(
        `${row.rank}º lugar, ${row.username}, ${formatXp(row.xp, locale)} XP`,
        `Rank ${row.rank}, ${row.username}, ${formatXp(row.xp, locale)} XP`
      )}
      className={`group grid min-h-[72px] grid-cols-[42px_48px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 sm:grid-cols-[48px_52px_minmax(0,1fr)_110px] sm:px-4 ${
        isViewer ? 'bg-blue-500/10 ring-1 ring-inset ring-blue-500/20' : 'hover:bg-dd-surface/70'
      }`}
    >
      <div className="flex items-center justify-center">
        {isPodium ? (
          <LeaderboardMedal
            rank={row.rank}
            className="h-9 w-9 transition-transform group-hover:scale-110"
          />
        ) : (
          <span className="font-mono text-sm font-black text-blue-400">{row.rank}</span>
        )}
      </div>

      <AuthorAvatar
        username={row.username}
        avatar_url={row.avatar_url}
        size="lg"
        className="!h-11 !w-11 border-2 border-dd-border transition-transform group-hover:scale-105 sm:!h-12 sm:!w-12"
      />

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={`truncate text-sm font-black sm:text-[15px] ${
              isViewer ? 'text-blue-400' : 'text-dd-text'
            }`}
          >
            {row.username}
          </p>
          {isViewer && (
            <span className="shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
              {text('Você', 'You')}
            </span>
          )}
        </div>
        <p className="mt-1 text-[10px] font-bold text-dd-muted">
          {text('Nível', 'Level')} {row.level}
        </p>
      </div>

      <span
        className={`flex items-center justify-end gap-1.5 text-right font-mono text-xs font-black sm:text-sm ${
          isViewer ? 'text-blue-400' : 'text-dd-text'
        }`}
      >
        <Image
          src="/assets/trails/trail-lightning.png"
          alt=""
          width={18}
          height={18}
          className="h-4 w-4 shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(250,204,21,0.4)]"
        />
        <span>{formatXp(row.xp, locale)} XP</span>
      </span>
    </Link>
  );
}

export function RankingScene({ time }: { time: MotionValue<number> }) {
  const opacity = useTransform(time, (t) => smooth(19.4, 19.8, t) * (1 - smooth(20.5, 20.9, t)));
  const y = useTransform(time, (t) => -12 * smooth(19.4, 20.9, t));
  return (
    <div className="px-7 py-8">
      <XpMilestoneStrip totalXp={4250} />
      <h2 className="mt-5 text-center text-[28px] font-black">Ranking de XP</h2>
      <p className="mt-2 text-center text-sm font-bold">
        Veja os desenvolvedores com mais experiência no Stacklyst.
      </p>
      <p className="mt-2 text-center text-xs font-black text-yellow-400">Próximo marco: 5.000 XP</p>
      <div className="mt-6 border-t border-dd-border pt-4 space-y-1">
        {[
          { rank: 1, username: 'user', xp: 4250, level: 9 },
          { rank: 2, username: 'user_02', xp: 3100, level: 7 },
          { rank: 3, username: 'user_03', xp: 2800, level: 7 },
        ].map((row) => (
          <RankingRow key={row.username} row={row} isViewer={row.rank === 1} />
        ))}
      </div>
      <motion.p className="mt-5 text-right text-sm font-bold text-blue-400" style={{ opacity, y }}>
        +40 XP
      </motion.p>
    </div>
  );
}
