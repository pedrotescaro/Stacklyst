'use client';
import { useState } from 'react';
import styles from './widgets.module.css';

const FUNCTIONS = [
  { id: 'O(1)', f: () => 1, example: 'acessar vetor[i]' },
  { id: 'O(log n)', f: (n: number) => Math.log2(Math.max(1, n)), example: 'busca binária' },
  { id: 'O(n)', f: (n: number) => n, example: 'busca sequencial' },
  { id: 'O(n log n)', f: (n: number) => n * Math.log2(Math.max(1, n)), example: 'merge sort' },
  { id: 'O(n²)', f: (n: number) => n * n, example: 'bubble sort, dois laços aninhados' },
  { id: 'O(2ⁿ)', f: (n: number) => 2 ** n, example: 'Fibonacci recursivo ingênuo' },
];

export function BigO({ props }: { props: Record<string, string> }) {
  const [n, setN] = useState(Number(props.n) || 16);
  const [active, setActive] = useState<string>('O(n²)');
  const W = 560;
  const H = 220;
  const maxY = n * n * 1.05;
  const pointsFor = (f: (n: number) => number) =>
    Array.from({ length: 41 }, (_, i) => {
      const x = (i / 40) * n;
      const y = Math.min(f(x), maxY);
      return `${36 + (x / n) * (W - 46)},${H - 24 - (y / maxY) * (H - 40)}`;
    }).join(' ');
  return (
    <div>
      <div className={styles.title}>
        <strong>Crescimento das funções de complexidade</strong>
        <span>Arraste para mudar o tamanho da entrada</span>
      </div>
      <label className={styles.hint} htmlFor="bigo-n">
        n = {n}
      </label>
      <input
        id="bigo-n"
        type="range"
        min={2}
        max={40}
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
        style={{ width: '100%' }}
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        role="img"
        aria-label="Curvas de crescimento"
      >
        <line x1={36} x2={W - 10} y1={H - 24} y2={H - 24} stroke="var(--enade-line)" />
        <line x1={36} x2={36} y1={10} y2={H - 24} stroke="var(--enade-line)" />
        <text x={W - 10} y={H - 8} textAnchor="end" className={styles.muted}>
          n
        </text>
        <text x={8} y={16} className={styles.muted}>
          passos
        </text>
        {FUNCTIONS.map((fn) => (
          <polyline
            key={fn.id}
            points={pointsFor(fn.f)}
            fill="none"
            stroke={fn.id === active ? 'var(--color-dd-accent)' : 'var(--color-dd-muted)'}
            strokeWidth={fn.id === active ? 2.5 : 1}
            opacity={fn.id === active ? 1 : 0.5}
          />
        ))}
      </svg>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Classe</th>
              <th>Passos para n = {n}</th>
              <th>Exemplo</th>
            </tr>
          </thead>
          <tbody>
            {FUNCTIONS.map((fn) => (
              <tr
                key={fn.id}
                onMouseEnter={() => setActive(fn.id)}
                style={{ cursor: 'pointer' }}
                onClick={() => setActive(fn.id)}
              >
                <td style={{ fontWeight: fn.id === active ? 700 : 400 }}>{fn.id}</td>
                <td className={styles.mono}>{Math.round(fn.f(n)).toLocaleString('pt-BR')}</td>
                <td style={{ textAlign: 'left' }}>{fn.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
