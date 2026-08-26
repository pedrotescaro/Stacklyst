'use client';

import Image from 'next/image';
import { Gem } from 'lucide-react';
import { TrailCourseSelector } from '@/app/trails/TrailCourseSelector';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import { StreakPopover } from '@/components/StreakPopover';

interface TrailResourceBarProps {
  activeLanguage: TrailLanguageCode;
  courses: TrailCourseOption[];
  onSelectCourse: (language: TrailLanguageCode) => void;
  streak: number;
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
  totalXp,
  gems,
}: TrailResourceBarProps) {
  return (
    <div
      data-testid="trail-resource-bar"
      aria-label="Recursos da trilha"
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
        title={`${formatMetric(totalXp)} XP total`}
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
        <span className="sr-only">XP total</span>
      </div>

      <div
        data-testid="trail-gems"
        title={`${formatMetric(gems)} joias. Ganhe 5 na primeira conclusão de cada exercício.`}
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-1.5"
      >
        <Gem
          className="h-5 w-5 shrink-0 fill-violet-300 text-violet-300"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className="text-xs font-bold tabular-nums text-dd-text">{formatMetric(gems)}</span>
        <span className="sr-only">joias</span>
      </div>
    </div>
  );
}
