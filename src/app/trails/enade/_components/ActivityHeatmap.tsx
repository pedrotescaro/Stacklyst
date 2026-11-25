'use client';

import { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { plural, studyTime } from '@/lib/enade/format';
import type { StudyCalendarDay } from '@/lib/enade/stats';
import styles from './ActivityHeatmap.module.css';

const WEEK_DAYS = 7;
const WEEK_LABELS = ['', 'Seg', '', 'Qua', '', 'Sex', ''];
const LEVEL_LABELS = [
  'Sem estudo registrado',
  'Atividade registrada, com menos de 10 min de estudo',
  'De 10 a menos de 30 min de estudo',
  'De 30 a menos de 60 min de estudo',
  '1 h ou mais de estudo',
];

const fullDate = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const rangeDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const monthDate = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });

function studyDetail(day: StudyCalendarDay) {
  if (!day.level) return 'Sem estudo registrado';
  const parts: string[] = [];
  if (day.durationMs) {
    const time = day.durationMs < 60_000 ? 'Menos de 1 min' : studyTime(day.durationMs);
    parts.push(`${time} de estudo`);
  }
  if (day.answers) parts.push(plural(day.answers, 'resposta registrada', 'respostas registradas'));
  if (day.articles) parts.push(plural(day.articles, 'artigo estudado', 'artigos estudados'));
  return parts.join(' · ') || 'Atividade de estudo registrada';
}

export function ActivityHeatmap({ days }: { days: StudyCalendarDay[] }) {
  const grid = useRef<HTMLDivElement>(null);
  const helpId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const { cells, firstWeekday, weeks, months } = useMemo(() => {
    const cells = days.map((day) => {
      const date = new Date(`${day.day}T12:00:00Z`);
      return { ...day, date, label: fullDate.format(date), detail: studyDetail(day) };
    });
    const firstWeekday = cells[0]?.date.getUTCDay() ?? 0;
    const weeks = Math.ceil((cells.length + firstWeekday) / WEEK_DAYS);
    const monthStarts = cells.flatMap((cell, index) =>
      index === 0 || cell.date.getUTCDate() === 1
        ? [
            {
              key: cell.day,
              column: 1 + Math.floor((firstWeekday + index) / WEEK_DAYS),
              label: monthDate.format(cell.date).replace(/\.$/, ''),
            },
          ]
        : []
    );
    // Two tightly spaced labels can overlap at either end of the period.
    const months = monthStarts.filter((month, index) => {
      const next = monthStarts[index + 1];
      return !next || next.column - month.column >= 2;
    });
    return { cells, firstWeekday, weeks, months };
  }, [days]);

  const today = cells.at(-1);
  if (!today) return null;
  const focusedDay = cells.find((cell) => cell.day === selected) ?? today;
  const visibleDay = cells.find((cell) => cell.day === hovered) ?? focusedDay;

  function selectDay(day: string) {
    setSelected(day);
    setHovered(null);
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const row = (firstWeekday + index) % WEEK_DAYS;
    let next: number;
    switch (event.key) {
      case 'ArrowLeft':
        next = index - WEEK_DAYS;
        break;
      case 'ArrowRight':
        next = index + WEEK_DAYS;
        break;
      case 'ArrowUp':
        next = row > 0 ? index - 1 : index;
        break;
      case 'ArrowDown':
        next = row < WEEK_DAYS - 1 ? index + 1 : index;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = cells.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const nextDay = cells[next]?.day;
    if (nextDay) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${nextDay}"]`)?.focus();
  }

  return (
    <figure className={styles.figure}>
      <figcaption id={helpId} className={styles.srOnly}>
        Use as setas para navegar entre os dias do calendário e consultar o estudo registrado.
      </figcaption>
      <div className={styles.plot} style={{ '--weeks': weeks } as CSSProperties}>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEK_LABELS.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        <div className={styles.viewport} onPointerLeave={() => setHovered(null)}>
          <div className={styles.calendar}>
            <div className={styles.months} aria-hidden="true">
              {months.map((month) => (
                <span key={month.key} style={{ gridColumn: month.column }}>
                  {month.label}
                </span>
              ))}
            </div>
            <div
              ref={grid}
              className={styles.grid}
              role="grid"
              aria-label="Calendário de estudos"
              aria-describedby={helpId}
              aria-colcount={weeks}
            >
              {WEEK_LABELS.map((_, row) => (
                <div key={row} className={styles.row} role="row">
                  {Array.from({ length: weeks }, (_, column) => {
                    const index = column * WEEK_DAYS + row - firstWeekday;
                    const day = cells[index];
                    return day ? (
                      <div
                        key={day.day}
                        role="gridcell"
                        aria-colindex={column + 1}
                        aria-selected={day.day === focusedDay.day}
                      >
                        <button
                          type="button"
                          className={styles.cell}
                          data-day={day.day}
                          data-level={day.level}
                          aria-label={`${day.label}, ${day.detail}`}
                          aria-current={day.day === today.day ? 'date' : undefined}
                          tabIndex={day.day === focusedDay.day ? 0 : -1}
                          onFocus={() => selectDay(day.day)}
                          onClick={() => selectDay(day.day)}
                          onKeyDown={(event) => moveFocus(event, index)}
                          onPointerEnter={(event) => {
                            if (event.pointerType === 'mouse') setHovered(day.day);
                          }}
                          onPointerLeave={() => setHovered(null)}
                        />
                      </div>
                    ) : (
                      <span key={column} aria-hidden="true" />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <span>{rangeDate.formatRange(cells[0].date, today.date)}</span>
        <div
          className={styles.legend}
          role="img"
          aria-label={`Tempo de estudo. ${LEVEL_LABELS.join('. ')}.`}
        >
          <span className={styles.legendTitle}>Tempo de estudo</span>
          <span>Menos</span>
          {LEVEL_LABELS.map((label, level) => (
            <span key={label} className={styles.swatch} data-level={level} title={label} />
          ))}
          <span>Mais</span>
        </div>
      </div>
      <div className={styles.detail}>
        <time dateTime={visibleDay.day}>{visibleDay.label}</time>
        <span>{visibleDay.detail}</span>
      </div>
    </figure>
  );
}
