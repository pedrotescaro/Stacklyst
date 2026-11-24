'use client';
import { useId, useState, type KeyboardEvent } from 'react';
import styles from './Charts.module.css';

/*
 * Small single-series SVG charts in the brand blue. Each one has a hover/focus
 * tooltip, keyboard-reachable marks and a table view, so the data never depends
 * on color or pointer alone.
 */

export type LinePoint = { label: string; value: number; detail?: string };

function onMarkKey(event: KeyboardEvent<SVGRectElement>, activate: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    activate();
  }
}

function tooltipPosition(percent: number) {
  return `clamp(min(110px, 50%), ${percent}%, calc(100% - min(110px, 50%)))`;
}

export function LineChart({
  points,
  title,
  unit = '%',
  max = 100,
  height = 200,
}: {
  points: LinePoint[];
  title: string;
  unit?: string;
  max?: number;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const width = 640;
  const pad = { top: 14, right: 16, bottom: 26, left: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const x = (i: number) =>
    pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (Math.min(v, max) / max) * innerH;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
  const ticks = [0, max / 2, max];
  const shown = active ?? null;
  return (
    <figure className={styles.figure} aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className={styles.srOnly}>
        {title}
      </figcaption>
      <div className={styles.plot}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label={title}
          className={styles.svg}
          onMouseLeave={() => setActive(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y(tick)}
                y2={y(tick)}
                className={styles.grid}
              />
              <text x={pad.left - 8} y={y(tick) + 4} className={styles.axis} textAnchor="end">
                {tick}
                {unit}
              </text>
            </g>
          ))}
          {shown !== null && (
            <line
              x1={x(shown)}
              x2={x(shown)}
              y1={pad.top}
              y2={pad.top + innerH}
              className={styles.crosshair}
            />
          )}
          <path d={path} className={styles.line} />
          {points.map((p, i) => (
            <g key={`${p.label}-${i}`}>
              <circle cx={x(i)} cy={y(p.value)} r={shown === i ? 5.5 : 4} className={styles.dot} />
              <rect
                x={x(i) - Math.max(10, innerW / Math.max(1, points.length) / 2)}
                y={pad.top}
                width={Math.max(20, innerW / Math.max(1, points.length))}
                height={innerH}
                className={styles.hit}
                role="button"
                tabIndex={0}
                aria-label={`${p.label}: ${p.value}${unit}${p.detail ? ` · ${p.detail}` : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(event) => onMarkKey(event, () => setActive(i))}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          ))}
          {points.length > 0 && (
            <>
              <text x={x(0)} y={height - 6} className={styles.axis} textAnchor="start">
                {points[0].label}
              </text>
              {points.length > 1 && (
                <text
                  x={x(points.length - 1)}
                  y={height - 6}
                  className={styles.axis}
                  textAnchor="end"
                >
                  {points[points.length - 1].label}
                </text>
              )}
            </>
          )}
        </svg>
        {shown !== null && points[shown] && (
          <div
            className={styles.tooltip}
            style={{ left: tooltipPosition((x(shown) / width) * 100) }}
            aria-hidden="true"
          >
            <strong>
              {points[shown].value}
              {unit}
            </strong>
            <span>{points[shown].label}</span>
            {points[shown].detail && <span>{points[shown].detail}</span>}
          </div>
        )}
      </div>
      <DataTable
        caption={title}
        rows={points.map((p) => [p.label, `${p.value}${unit}`, p.detail ?? ''])}
        headers={['Quando', 'Valor', 'Detalhe']}
      />
    </figure>
  );
}

export type Bar = { label: string; value: number; display?: string; detail?: string };

export function ColumnChart({
  bars,
  title,
  height = 170,
}: {
  bars: Bar[];
  title: string;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const width = 640;
  const pad = { top: 12, bottom: 24, left: 4, right: 4 };
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const slot = (width - pad.left - pad.right) / Math.max(1, bars.length);
  const barW = Math.max(4, Math.min(36, slot - 4));
  return (
    <figure className={styles.figure}>
      <div className={styles.plot}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label={title}
          className={styles.svg}
          onMouseLeave={() => setActive(null)}
        >
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + innerH}
            y2={pad.top + innerH}
            className={styles.grid}
          />
          {bars.map((bar, i) => {
            const h = (bar.value / max) * innerH;
            const cx = pad.left + slot * i + slot / 2;
            return (
              <g key={`${bar.label}-${i}`}>
                {h > 0 && (
                  <path
                    className={styles.bar}
                    data-active={active === i}
                    d={roundedTop(cx - barW / 2, pad.top + innerH - h, barW, h, Math.min(4, h))}
                  />
                )}
                <rect
                  x={cx - slot / 2}
                  y={pad.top}
                  width={slot}
                  height={innerH}
                  className={styles.hit}
                  role="button"
                  tabIndex={0}
                  aria-label={`${bar.label}: ${bar.display ?? bar.value}${bar.detail ? ` · ${bar.detail}` : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  onKeyDown={(event) => onMarkKey(event, () => setActive(i))}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
                {(bars.length <= 12 || i % Math.ceil(bars.length / 8) === 0) && (
                  <text x={cx} y={height - 6} className={styles.axis} textAnchor="middle">
                    {bar.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {active !== null && bars[active] && (
          <div
            className={styles.tooltip}
            style={{ left: tooltipPosition(((pad.left + slot * active + slot / 2) / width) * 100) }}
            aria-hidden="true"
          >
            <strong>{bars[active].display ?? bars[active].value}</strong>
            <span>{bars[active].label}</span>
            {bars[active].detail && <span>{bars[active].detail}</span>}
          </div>
        )}
      </div>
      <DataTable
        caption={title}
        headers={['Período', 'Valor', 'Detalhe']}
        rows={bars.map((b) => [b.label, String(b.display ?? b.value), b.detail ?? ''])}
      />
    </figure>
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

export function ActivityHeatmap({
  days,
}: {
  days: { day: string; level: number; minutes: number }[];
}) {
  const weeks: (typeof days)[] = [];
  const first = new Date(`${days[0]?.day ?? '2026-01-01'}T12:00:00Z`).getUTCDay();
  const padded = [...Array((first + 6) % 7).fill(null), ...days];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  const date = (key: string) =>
    new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return (
    <div className={styles.heatmap} role="grid" aria-label="Dias de estudo nas últimas 12 semanas">
      {weeks.map((week, w) => (
        <div key={w} role="row" className={styles.heatWeek}>
          {week.map((cell, d) =>
            cell ? (
              <span
                key={cell.day}
                role="gridcell"
                className={styles.heatCell}
                data-level={cell.level}
                title={`${date(cell.day)}: ${cell.level ? `${cell.minutes} min de estudo registrados` : 'sem estudo'}`}
                aria-label={`${date(cell.day)}: ${cell.level ? `${cell.minutes} minutos` : 'sem estudo'}`}
              />
            ) : (
              <span key={`pad-${d}`} className={styles.heatPad} aria-hidden="true" />
            )
          )}
        </div>
      ))}
      <p className={styles.heatLegend} aria-hidden="true">
        Menos <span data-level="1" /> <span data-level="2" /> <span data-level="3" />{' '}
        <span data-level="4" /> Mais
      </p>
    </div>
  );
}

function DataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  if (!rows.length) return null;
  const used = headers.filter((_, i) => rows.some((r) => r[i]));
  return (
    <details className={styles.tableToggle}>
      <summary>Ver dados em tabela</summary>
      <table>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            {used.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {headers.map((h, j) => (used.includes(h) ? <td key={h}>{row[j]}</td> : null))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
