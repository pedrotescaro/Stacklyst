import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BadgeCheck, ChevronRight, Gem, Shield, Target, Zap } from 'lucide-react';
import { TrailCourseSelector } from '@/app/trails/TrailCourseSelector';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import { StreakPopover } from '@/components/StreakPopover';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export interface TrailDailyProgress {
  xpEarned: number;
  correctAnswers: number;
  trailActivities: number;
}

interface TrailsProgressSidebarProps {
  activeLanguage: TrailLanguageCode;
  courses: TrailCourseOption[];
  onSelectCourse: (language: TrailLanguageCode) => void;
  totalXp: number;
  gems?: number;
  streak: number;
  globalRank: number;
  totalParticipants: number;
  username: string;
  avatarUrl?: string | null;
  dailyProgress: TrailDailyProgress;
  weeklyActivity?: ReadonlyMap<number, number>;
  variant?: 'trails' | 'profile';
  allowAddingCourses?: boolean;
}

function formatMetric(value: number, locale = 'pt-BR') {
  return Math.max(0, value).toLocaleString(locale);
}

function clampProgress(value: number, goal: number) {
  return Math.min(Math.max(0, value), goal);
}

function MissionProgress({
  label,
  progress,
  goal,
  icon,
  barClass,
}: {
  label: string;
  progress: number;
  goal: number;
  icon: ReactNode;
  barClass: string;
}) {
  const current = clampProgress(progress, goal);
  const completed = current >= goal;
  const percentage = goal > 0 ? (current / goal) * 100 : 0;

  return (
    <div className="flex gap-3.5 py-4 first:pt-2 last:pb-1">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center"
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-xs font-extrabold leading-5 text-dd-text">{label}</p>
          {completed && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-400" />}
        </div>

        <div className="flex items-center gap-2.5">
          <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={current}
            className="h-2 flex-1 overflow-hidden rounded-full bg-dd-border/60"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${barClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="min-w-[38px] text-right font-mono text-[10px] font-black text-dd-muted">
            {current} / {goal}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TrailsProgressSidebar({
  activeLanguage,
  courses,
  onSelectCourse,
  totalXp,
  gems = 0,
  streak,
  globalRank,
  totalParticipants,
  username,
  avatarUrl,
  dailyProgress,
  weeklyActivity,
  variant = 'trails',
  allowAddingCourses = true,
}: TrailsProgressSidebarProps) {
  const { locale, text } = useLocalizedText();
  const initials = username.slice(0, 2).toUpperCase();
  const rankMessage =
    globalRank <= 3
      ? text('Continue assim para ficar no pódio!', 'Keep it up to reach the podium!')
      : text(
          `Faltam ${globalRank - 3} ${globalRank - 3 === 1 ? 'posição' : 'posições'} para o pódio.`,
          `${globalRank - 3} ${globalRank - 3 === 1 ? 'place' : 'places'} away from the podium.`
        );

  return (
    <aside
      data-testid={variant === 'profile' ? 'profile-progress-sidebar' : 'trails-progress-sidebar'}
      aria-label={
        variant === 'profile'
          ? text('Progresso e missões do perfil', 'Profile progress and missions')
          : text('Progresso e missões da trilha', 'Trail progress and missions')
      }
      className={[
        'sticky top-0 hidden h-screen w-[380px] shrink-0 flex-col gap-4 overflow-y-auto p-5 scrollbar-none xl:flex',
      ].join(' ')}
    >
      <div className="grid grid-cols-[96px_54px_70px_54px_40px] items-center gap-1 pb-4">
        <TrailCourseSelector
          activeLanguage={activeLanguage}
          courses={courses}
          onSelectCourse={onSelectCourse}
          variant="rail"
          allowAddingCourses={allowAddingCourses}
        />

        <StreakPopover
          streak={streak}
          weeklyActivity={weeklyActivity}
          triggerClassName="dd-focus-ring flex min-w-0 items-center justify-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-blue-500/10"
        >
          <Image
            data-testid="glossy-streak-flame"
            src="/assets/trails/streak-flame.png"
            alt=""
            width={30}
            height={30}
            className="h-7 w-7 shrink-0 object-contain"
          />
          <span className="truncate text-xs font-black text-dd-text">{formatMetric(streak)}</span>
        </StreakPopover>

        <div
          title={`${formatMetric(totalXp, locale)} ${text('XP total', 'total XP')}`}
          className="flex min-w-0 items-center justify-center gap-1.5"
        >
          <Image
            src="/assets/trails/trail-lightning.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(250,204,21,0.4)]"
          />
          <span className="truncate text-xs font-black text-dd-text">{formatMetric(totalXp)}</span>
        </div>

        <div
          title={`${formatMetric(gems, locale)} ${text('gemas', 'gems')}`}
          className="flex min-w-0 items-center justify-center gap-1"
        >
          <Gem
            aria-hidden="true"
            className="h-5 w-5 shrink-0 fill-violet-500 text-violet-300 drop-shadow-[0_2px_7px_rgba(168,85,247,0.55)]"
            strokeWidth={2.4}
          />
          <span className="truncate text-xs font-black text-dd-text">{formatMetric(gems)}</span>
        </div>

        <div
          title={text(`Perfil de @${username}`, `@${username}'s profile`)}
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-blue-500/25 bg-blue-500/10 text-[10px] font-black text-blue-300"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>

      {/* Classificação global – Ritmo Stacklyst style */}
      <section
        aria-labelledby="trail-ranking-title"
        className="shrink-0 overflow-hidden rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-5"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 pt-1">
            <span className="inline-flex rounded-lg bg-blue-500 px-3 py-2 text-[10px] font-black uppercase leading-4 tracking-wide text-white">
              {text('Classificação', 'Ranking')}
            </span>

            <h2
              id="trail-ranking-title"
              className="mt-5 text-[22px] font-black leading-tight text-dd-text"
            >
              {text(`${globalRank}º lugar`, `Rank ${globalRank}`)}
            </h2>
          </div>

          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-dd-surface text-dd-muted"
          >
            <Shield className="h-14 w-14 fill-current/15" strokeWidth={1.8} />
          </div>
        </div>

        <p className="mt-4 max-w-[260px] text-sm font-bold leading-6 text-dd-text">{rankMessage}</p>

        <div className="mt-5 rounded-2xl bg-dd-surface p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black text-dd-text">
                {text('Sua posição:', 'Your position:')}{' '}
                <span className="text-blue-400">{globalRank}º</span>
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-dd-muted">
                {globalRank} {text('de', 'of')} {Math.max(totalParticipants, globalRank)}{' '}
                {text('desenvolvedores', 'developers')}
              </p>
            </div>
            <Link
              href="/ranking"
              aria-label={text('Ver ranking', 'View ranking')}
              className="flex items-center gap-0.5 text-[10px] font-black uppercase tracking-wide text-blue-400 transition-colors hover:text-blue-300"
            >
              {text('Ver ranking', 'View ranking')}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Missões do dia – Ritmo Stacklyst style */}
      <section
        aria-labelledby="daily-missions-title"
        className="shrink-0 overflow-hidden rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-5"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 pt-1">
            <span className="inline-flex rounded-lg bg-blue-500 px-3 py-2 text-[10px] font-black uppercase leading-4 tracking-wide text-white">
              {text('Missões do dia', 'Daily missions')}
            </span>

            <h2
              id="daily-missions-title"
              className="mt-5 text-[22px] font-black leading-tight text-dd-text"
            >
              {text('Desafios diários', 'Daily challenges')}
            </h2>
          </div>

          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-dd-surface text-dd-muted"
          >
            <Target className="h-14 w-14" strokeWidth={1.5} />
          </div>
        </div>

        <p className="mt-4 max-w-[260px] text-sm font-bold leading-6 text-dd-text">
          {text(
            'Complete as missões abaixo para ganhar XP bônus!',
            'Complete the missions below to earn bonus XP!'
          )}
        </p>

        <div className="mt-5 rounded-2xl bg-dd-surface p-3.5">
          <div className="divide-y divide-dd-border/50">
            <MissionProgress
              label={text('Ganhe 30 XP em trilhas', 'Earn 30 XP in trails')}
              progress={dailyProgress.xpEarned}
              goal={30}
              icon={
                <Zap className="h-9 w-9 text-[#ffc800]" fill="currentColor" strokeWidth={2.5} />
              }
              barClass="bg-yellow-400"
            />
            <MissionProgress
              label={text('Acerte 3 exercícios', 'Get 3 exercises right')}
              progress={dailyProgress.correctAnswers}
              goal={3}
              icon={<Target className="h-8 w-8 text-emerald-400" strokeWidth={2.5} />}
              barClass="bg-emerald-400"
            />
            <MissionProgress
              label={text('Responda 1 exercício da trilha', 'Complete 1 trail exercise')}
              progress={dailyProgress.trailActivities}
              goal={1}
              icon={
                <Zap className="h-9 w-9 text-[#ffc800]" fill="currentColor" strokeWidth={2.5} />
              }
              barClass="bg-yellow-400"
            />
          </div>
        </div>
      </section>
    </aside>
  );
}
