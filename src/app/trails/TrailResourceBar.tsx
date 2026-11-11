'use client';

import Image from 'next/image';
import { Coin } from '@/components/mundinho/PixelArt';
import { TrailCourseSelector } from '@/app/trails/TrailCourseSelector';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import type { TrailCourseCode } from '@/app/trails/TrailLanguageLogo';
import { StreakPopover } from '@/components/StreakPopover';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface TrailResourceBarProps {
  activeLanguage: TrailCourseCode;
  courses: TrailCourseOption[];
  onSelectCourse: (language: TrailCourseCode) => void;
  streak: number;
  lastActiveAt?: string | null;
  totalXp: number;
  gems: number;
}

function formatMetric(value: number) {
  return Math.max(0, value).toLocaleString('pt-BR');
}

export function TrailResourceBar({
  activeLanguage,
  courses,
  onSelectCourse,
  streak,
  lastActiveAt,
  totalXp,
  gems,
}: TrailResourceBarProps) {
  const { text } = useLocalizedText();
  return (
    <div
      data-testid="trail-resource-bar"
      aria-label={text('Recursos da trilha', 'Trail resources')}
      className="flex max-w-full items-center justify-center gap-2 overflow-x-auto scrollbar-none md:justify-end sm:gap-3"
    >
      <TrailCourseSelector
        activeLanguage={activeLanguage}
        courses={courses}
        onSelectCourse={onSelectCourse}
        variant="compact"
      />

      <StreakPopover
        streak={streak}
        lastActiveAt={lastActiveAt}
        triggerClassName="dd-focus-ring flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5 transition hover:bg-orange-500/[0.08]"
      >
        <Image
          data-testid="trail-resource-flame"
          src="/assets/trails/streak-flame.png"
          alt=""
          width={28}
          height={28}
          className="h-6 w-6 object-contain"
        />
        <span className="text-xs font-bold tabular-nums text-dd-text">{formatMetric(streak)}</span>
      </StreakPopover>

      <div
        data-testid="trail-energy"
        title={text(`${formatMetric(totalXp)} XP total`, `${formatMetric(totalXp)} total XP`)}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5"
      >
        <Image
          src="/assets/trails/trail-lightning.png"
          alt=""
          width={26}
          height={26}
          className="h-5 w-5 object-contain"
        />
        <span className="text-xs font-bold tabular-nums text-dd-text">{formatMetric(totalXp)}</span>
        <span className="sr-only">{text('XP total', 'total XP')}</span>
      </div>

      <div
        data-testid="trail-gems"
        title={text(
          `${formatMetric(gems)} moedas. Ganhe 5 na primeira conclusão de cada exercício.`,
          `${formatMetric(gems)} coins. Earn 5 on the first completion of each exercise.`
        )}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5"
      >
        <Coin className="h-5 w-5 shrink-0 drop-shadow-[0_2px_6px_rgba(250,204,21,0.4)]" />
        <span className="text-xs font-bold tabular-nums text-dd-text">{formatMetric(gems)}</span>
        <span className="sr-only">{text('moedas', 'coins')}</span>
      </div>
    </div>
  );
}
