import { Check, Flame } from 'lucide-react';
import { getRecentStreakDayIndexes } from '@/lib/streak';

const WEEK_DAYS = [
  { index: 0, label: 'D', name: 'domingo' },
  { index: 1, label: 'S', name: 'segunda-feira' },
  { index: 2, label: 'T', name: 'terça-feira' },
  { index: 3, label: 'Q', name: 'quarta-feira' },
  { index: 4, label: 'Q', name: 'quinta-feira' },
  { index: 5, label: 'S', name: 'sexta-feira' },
  { index: 6, label: 'S', name: 'sábado' },
] as const;

interface FeedEngagementCardProps {
  streak: number;
  weeklyActivity: ReadonlyMap<number, number>;
  lastActiveAt: string | null;
  currentDate: string | null;
}

export function FeedEngagementCard({
  streak,
  weeklyActivity,
  lastActiveAt,
  currentDate,
}: FeedEngagementCardProps) {
  const now = currentDate ? new Date(currentDate) : null;
  const lastActivity = lastActiveAt ? new Date(lastActiveAt) : null;
  const todayIndex = now?.getUTCDay() ?? null;
  // O streak entregue pelo servidor ja foi validado contra a ultima atividade.
  // A sessao resumida do cliente pode omitir last_active_at, entao usamos hoje
  // como ancora visual sem apagar uma ofensiva valida durante a hidratacao.
  const streakDayIndexes = getRecentStreakDayIndexes(streak, lastActivity ?? now, now);
  const hasActivityToday = todayIndex !== null && streakDayIndexes.has(todayIndex);

  return (
    <section
      aria-labelledby="feed-streak-title"
      className="overflow-hidden rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-sidebar-bg p-5"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0 pt-1">
          <span className="inline-flex rounded-lg bg-blue-500 px-3 py-2 text-[10px] font-black uppercase leading-4 tracking-wide text-white">
            Ritmo Stacklyst
          </span>

          <h2
            id="feed-streak-title"
            className="mt-5 text-[22px] font-black leading-tight text-dd-text"
          >
            {streak} {streak === 1 ? 'dia' : 'dias'} de ofensiva
          </h2>
        </div>

        <div
          data-testid="feed-streak-flame"
          aria-hidden="true"
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ${
            hasActivityToday ? 'bg-orange-500/15 text-orange-400' : 'bg-dd-surface text-dd-muted'
          }`}
        >
          <Flame className="h-14 w-14 fill-current" strokeWidth={2.4} />
        </div>
      </div>

      <p className="mt-4 max-w-[280px] text-sm font-bold leading-6 text-dd-text">
        {hasActivityToday ? (
          <>
            <span>Ofensiva garantida por hoje. </span>
            <span className="block whitespace-nowrap">Continue assim!</span>
          </>
        ) : (
          'Faça uma atividade hoje pra aumentar a sua ofensiva!'
        )}
      </p>

      <div className="mt-5 rounded-2xl bg-dd-surface p-3.5">
        <div className="grid grid-cols-7 gap-2" aria-label="Atividade semanal">
          {WEEK_DAYS.map((day) => {
            const activityCount = weeklyActivity.get(day.index) ?? 0;
            const isStreakDay = streakDayIndexes.has(day.index);
            const isActive = activityCount > 0 || isStreakDay;
            const isToday = todayIndex === day.index;
            const activityLabel =
              activityCount > 0
                ? `${activityCount} ${activityCount === 1 ? 'atividade concluída' : 'atividades concluídas'}`
                : isStreakDay
                  ? 'dia da ofensiva'
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
                  aria-label={`${day.name}: ${activityLabel}${isToday ? ', hoje' : ''}`}
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
    </section>
  );
}
