'use client';
import { useId, useState } from 'react';
import styles from './widgets.module.css';

// Regions of a three-set diagram as membership bits (A, B, C).
const OPERATIONS: {
  id: string;
  label: string;
  test: (a: boolean, b: boolean, c: boolean) => boolean;
  explain: string;
}[] = [
  {
    id: 'union',
    label: 'A ∪ B',
    test: (a, b) => a || b,
    explain: 'União: tudo que está em A, em B ou nos dois.',
  },
  {
    id: 'inter',
    label: 'A ∩ B',
    test: (a, b) => a && b,
    explain: 'Interseção: só o que está nos dois ao mesmo tempo.',
  },
  {
    id: 'diff',
    label: 'A − B',
    test: (a, b) => a && !b,
    explain: 'Diferença: o que está em A e não está em B.',
  },
  {
    id: 'sym',
    label: 'A Δ B',
    test: (a, b) => a !== b,
    explain: 'Diferença simétrica: em exatamente um dos dois (equivale ao "ou exclusivo").',
  },
  {
    id: 'comp',
    label: "A'",
    test: (a) => !a,
    explain: 'Complementar: tudo do universo que não está em A.',
  },
  {
    id: 'abc',
    label: 'A ∩ B ∩ C',
    test: (a, b, c) => a && b && c,
    explain: 'Interseção tripla: elementos comuns aos três conjuntos.',
  },
  {
    id: 'onlyc',
    label: 'só C',
    test: (a, b, c) => c && !a && !b,
    explain: 'Somente C: está em C mas em nenhum dos outros.',
  },
  {
    id: 'morgan',
    label: "(A ∪ B)'",
    test: (a, b) => !(a || b),
    explain: "De Morgan: (A ∪ B)' = A' ∩ B' — fora de A e fora de B.",
  },
];

const CIRCLES = [
  { name: 'A', cx: 130, cy: 110 },
  { name: 'B', cx: 210, cy: 110 },
  { name: 'C', cx: 170, cy: 180 },
];

export function Venn({ props }: { props: Record<string, string> }) {
  const [operation, setOperation] = useState(props.op || 'inter');
  const id = useId().replace(/:/g, '');
  const op = OPERATIONS.find((o) => o.id === operation) ?? OPERATIONS[1];
  // Grid sampling keeps the shading exact without clip-path algebra.
  const cells: { x: number; y: number }[] = [];
  for (let x = 12; x < 330; x += 4)
    for (let y = 12; y < 268; y += 4) {
      const [a, b, c] = CIRCLES.map(
        (circle) => (x - circle.cx) ** 2 + (y - circle.cy) ** 2 <= 70 ** 2
      );
      if (op.test(a, b, c)) cells.push({ x, y });
    }
  return (
    <div>
      <div className={styles.title}>
        <strong>Diagrama de Venn interativo</strong>
        <span>O retângulo é o universo U</span>
      </div>
      <div className={styles.controls}>
        {OPERATIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={styles.button}
            aria-pressed={o.id === operation}
            onClick={() => setOperation(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <svg
        viewBox="0 0 340 280"
        className={styles.svg}
        style={{ maxWidth: 420 }}
        role="img"
        aria-label={`${op.label}: ${op.explain}`}
      >
        <defs>
          <clipPath id={`venn-${id}`}>
            <rect x={10} y={10} width={320} height={260} />
          </clipPath>
        </defs>
        <g clipPath={`url(#venn-${id})`}>
          {cells.map((cell) => (
            <rect
              key={`${cell.x}-${cell.y}`}
              x={cell.x - 2}
              y={cell.y - 2}
              width={4.2}
              height={4.2}
              fill="var(--color-dd-accent)"
              opacity={0.45}
            />
          ))}
        </g>
        <rect
          x={10}
          y={10}
          width={320}
          height={260}
          fill="none"
          stroke="var(--color-dd-muted)"
          rx={6}
        />
        <text x={18} y={28} className={styles.muted}>
          U
        </text>
        {CIRCLES.map((circle) => (
          <g key={circle.name}>
            <circle
              cx={circle.cx}
              cy={circle.cy}
              r={70}
              fill="none"
              stroke="var(--color-dd-text)"
              strokeWidth={1.4}
            />
            <text
              x={circle.cx + (circle.name === 'A' ? -52 : circle.name === 'B' ? 46 : 0)}
              y={circle.cy + (circle.name === 'C' ? 58 : -48)}
              style={{ fontWeight: 700 }}
            >
              {circle.name}
            </text>
          </g>
        ))}
      </svg>
      <p className={styles.status} aria-live="polite">
        <strong>{op.label}</strong> — {op.explain}
      </p>
      <p className={styles.hint}>
        Contagem: n(A ∪ B) = n(A) + n(B) − n(A ∩ B). Com três conjuntos: n(A ∪ B ∪ C) = n(A) + n(B)
        + n(C) − n(A∩B) − n(A∩C) − n(B∩C) + n(A∩B∩C).
      </p>
    </div>
  );
}
