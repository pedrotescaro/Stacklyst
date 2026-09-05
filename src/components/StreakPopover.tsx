'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Check, Flame, X } from 'lucide-react';
import { getRecentStreakDayIndexes } from '@/lib/streak';
import { useLocalizedText } from '@/i18n/useLocalizedText';

const WEEK_DAYS = [
  { index: 0, label: 'D', name: 'domingo' },
  { index: 1, label: 'S', name: 'segunda-feira' },
  { index: 2, label: 'T', name: 'terça-feira' },
  { index: 3, label: 'Q', name: 'quarta-feira' },
  { index: 4, label: 'Q', name: 'quinta-feira' },
  { index: 5, label: 'S', name: 'sexta-feira' },
  { index: 6, label: 'S', name: 'sábado' },
] as const;

interface StreakPopoverProps {
  streak: number;
  children: ReactNode;
  triggerClassName: string;
  weeklyActivity?: ReadonlyMap<number, number>;
  lastActiveAt?: string | null;
  currentDate?: string | null;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

function safeDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function StreakPopover({
  streak,
  children,
  triggerClassName,
  weeklyActivity,
  lastActiveAt,
  currentDate,
  side = 'bottom',
  align = 'end',
}: StreakPopoverProps) {
  const { isEnglish, text } = useLocalizedText();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (process.env.NODE_ENV === 'test') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (process.env.NODE_ENV === 'test') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const normalizedStreak = Math.max(0, streak);
  const now = safeDate(currentDate, new Date());
  const lastActivity = safeDate(lastActiveAt, now);
  const todayIndex = now.getUTCDay();
  const streakDayIndexes = getRecentStreakDayIndexes(normalizedStreak, lastActivity, now);
  const hasActivityToday =
    (weeklyActivity?.get(todayIndex) ?? 0) > 0 || streakDayIndexes.has(todayIndex);
  const dayLabel = isEnglish
    ? normalizedStreak === 1
      ? 'day'
      : 'days'
    : normalizedStreak === 1
      ? 'dia'
      : 'dias';

  return (
    <div className="relative inline-block">
      <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
        <Popover.Trigger
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={text(
            `Abrir detalhes da ofensiva: ${normalizedStreak} ${dayLabel}`,
            `Open streak details: ${normalizedStreak} ${dayLabel}`
          )}
          className={triggerClassName}
        >
          {children}
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            side={side}
            align={align}
            sideOffset={10}
            collisionPadding={12}
            className="z-[120] outline-none"
          >
            <Popover.Popup className="w-[min(360px,calc(100vw-24px))] origin-[var(--transform-origin)] overflow-hidden rounded-[22px] border-2 border-dd-border bg-dd-sidebar-bg text-dd-text shadow-[0_26px_80px_-28px_rgba(0,0,0,0.95)] outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-lg bg-blue-500 px-3 py-2 text-[10px] font-black uppercase leading-4 tracking-wide text-white">
                      Ritmo Stacklyst
                    </span>
                    <Popover.Title className="mt-5 text-[24px] font-black leading-tight text-dd-text">
                      {normalizedStreak} {dayLabel} {text('de ofensiva', 'streak')}
                    </Popover.Title>
                  </div>

                  <div
                    aria-hidden="true"
                    className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${
                      hasActivityToday
                        ? 'bg-orange-500/15 text-orange-400'
                        : 'bg-dd-surface text-dd-muted'
                    }`}
                  >
                    <Flame className="h-14 w-14 fill-current" strokeWidth={2.4} />
                  </div>

                  <Popover.Close
                    aria-label={text('Fechar detalhes da ofensiva', 'Close streak details')}
                    className="dd-focus-ring absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-dd-muted transition-colors hover:bg-dd-surface hover:text-dd-text"
                  >
                    <X className="h-4 w-4" />
                  </Popover.Close>
                </div>

                <Popover.Description className="mt-4 max-w-[280px] text-sm font-bold leading-6 text-dd-text">
                  {hasActivityToday
                    ? 'Ofensiva garantida por hoje. Continue assim!'
                    : text(
                        'Faça uma atividade hoje pra aumentar a sua ofensiva!',
                        'Complete an activity today to extend your streak!'
                      )}
                </Popover.Description>

                <div className="mt-5 rounded-2xl bg-dd-surface p-3.5">
                  <div className="grid grid-cols-7 gap-2" aria-label="Atividade semanal">
                    {WEEK_DAYS.map((day) => {
                      const dayName = isEnglish
                        ? [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                          ][day.index]
                        : day.name;
                      const activityCount = weeklyActivity?.get(day.index) ?? 0;
                      const isStreakDay = streakDayIndexes.has(day.index);
                      const isActive = activityCount > 0 || isStreakDay;
                      const isToday = todayIndex === day.index;
                      const activityLabel =
                        activityCount > 0
                          ? `${activityCount} ${activityCount === 1 ? text('atividade concluída', 'activity completed') : text('atividades concluídas', 'activities completed')}`
                          : isStreakDay
                            ? text('dia da ofensiva', 'streak day')
                            : 'sem atividade';

                      return (
                        <div key={day.index} className="flex min-w-0 flex-col items-center gap-2">
                          <span
                            className={`text-[11px] font-black uppercase ${
                              isToday ? 'text-blue-400' : 'text-dd-muted'
                            }`}
                          >
                            {day.label}
                          </span>

                          <div
                            role="img"
                            aria-label={`${dayName}: ${activityLabel}${isToday ? `, ${text('hoje', 'today')}` : ''}`}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                              isActive
                                ? 'border-blue-300 bg-blue-500 text-white shadow-[0_3px_0_#0866c9]'
                                : isToday
                                  ? 'border-blue-500 bg-dd-border text-blue-400'
                                  : 'border-dd-border bg-dd-border text-dd-muted'
                            }`}
                          >
                            {isActive && <Check className="h-4 w-4" strokeWidth={4} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
