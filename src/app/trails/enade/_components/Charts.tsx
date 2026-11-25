'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
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

function usePlotWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);

  useEffect(() => {
    const plot = ref.current;
    if (!plot || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(140, Math.round(entry.contentRect.width)));
    });
    observer.observe(plot);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
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
  const { ref, width } = usePlotWidth();
  const pad = { top: 14, right: 12, bottom: 26, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const x = (i: number) =>
    pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (Math.min(v, max) / max) * innerH;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
  const ticks = [0, max / 2, max];
  const shown = active !== null && points[active] ? active : null;
  return (
    <figure className={styles.figure} aria-labelledby={`${id}-title`}>
      <figcaption id={`${id}-title`} className={styles.srOnly}>
        {title}
      </figcaption>
      <div className={styles.plot} ref={ref}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          height={height}
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
          {points.map((p, i) => {
            const start = i === 0 ? pad.left : (x(i - 1) + x(i)) / 2;
            const end = i === points.length - 1 ? width - pad.right : (x(i) + x(i + 1)) / 2;
            return (
              <g key={`${p.label}-${i}`}>
                <circle
                  cx={x(i)}
                  cy={y(p.value)}
                  r={shown === i ? 5.5 : 4}
                  className={styles.dot}
                />
                <rect
                  x={start}
                  y={pad.top - 5}
                  width={end - start}
                  height={innerH + 10}
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
            );
          })}
          {points.length > 0 && (
            <>
              <text
                x={x(0)}
                y={height - 6}
                className={styles.axis}
                textAnchor={points.length === 1 ? 'middle' : 'start'}
              >
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
  emptyMessage,
}: {
  bars: Bar[];
  title: string;
  height?: number;
  emptyMessage?: string;
}) {
  return (
    <figure className={styles.figure}>
      {emptyMessage ? (
        <p className={styles.empty}>{emptyMessage}</p>
      ) : (
        <ColumnPlot bars={bars} title={title} height={height} />
      )}
      <DataTable
        caption={title}
        headers={['Período', 'Valor', 'Detalhe']}
        rows={bars.map((b) => [b.label, String(b.display ?? b.value), b.detail ?? ''])}
      />
    </figure>
  );
}

function ColumnPlot({ bars, title, height }: { bars: Bar[]; title: string; height: number }) {
  const [active, setActive] = useState<number | null>(null);
  const { ref, width } = usePlotWidth();
  const pad = { top: 12, bottom: 24, left: 4, right: 4 };
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const slot = (width - pad.left - pad.right) / Math.max(1, bars.length);
  const barW = Math.max(2, Math.min(36, slot - 4));
  const labelStep = Math.max(1, Math.ceil(36 / slot));
  return (
    <div className={styles.plot} ref={ref}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        height={height}
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
              {i % labelStep === 0 && (
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
  );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
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
