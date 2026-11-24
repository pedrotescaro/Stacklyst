'use client';
import { useEffect, useMemo, useState } from 'react';
import styles from './widgets.module.css';

const NODES = [
  { id: 'A', x: 60, y: 60 },
  { id: 'B', x: 180, y: 30 },
  { id: 'C', x: 180, y: 130 },
  { id: 'D', x: 300, y: 40 },
  { id: 'E', x: 300, y: 140 },
  { id: 'F', x: 420, y: 90 },
];
const EDGES: [string, string][] = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['C', 'D'],
  ['C', 'E'],
  ['D', 'F'],
  ['E', 'F'],
];

function neighbors(id: string) {
  return EDGES.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : [])).sort();
}
function bfs(start: string) {
  const order: string[] = [];
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);
    for (const next of neighbors(node))
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
  }
  return order;
}
function dfs(start: string, seen = new Set<string>(), order: string[] = []) {
  seen.add(start);
  order.push(start);
  for (const next of neighbors(start)) if (!seen.has(next)) dfs(next, seen, order);
  return order;
}

export function GraphTraversal({ props }: { props: Record<string, string> }) {
  void props;
  const [kind, setKind] = useState<'bfs' | 'dfs'>('bfs');
  const [start, setStart] = useState('A');
  const order = useMemo(() => (kind === 'bfs' ? bfs(start) : dfs(start)), [kind, start]);
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [order]);
  useEffect(() => {
    if (step >= order.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [step, order.length]);
  const visited = new Set(order.slice(0, step));
  const pos = new Map(NODES.map((n) => [n.id, n]));
  return (
    <div>
      <div className={styles.title}>
        <strong>Percurso em grafos</strong>
        <span>
          {kind === 'bfs'
            ? 'Largura: usa fila, visita por níveis'
            : 'Profundidade: usa pilha (recursão), vai fundo antes de voltar'}
        </span>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          aria-pressed={kind === 'bfs'}
          onClick={() => setKind('bfs')}
        >
          Busca em largura (BFS)
        </button>
        <button
          type="button"
          className={styles.button}
          aria-pressed={kind === 'dfs'}
          onClick={() => setKind('dfs')}
        >
          Busca em profundidade (DFS)
        </button>
        <label className={styles.hint}>
          Início{' '}
          <select className={styles.input} value={start} onChange={(e) => setStart(e.target.value)}>
            {NODES.map((n) => (
              <option key={n.id}>{n.id}</option>
            ))}
          </select>
        </label>
        <button type="button" className={styles.button} onClick={() => setStep(0)}>
          Repetir
        </button>
      </div>
      <svg
        viewBox="0 0 480 170"
        className={styles.svg}
        role="img"
        aria-label={`Ordem de visita: ${order.join(', ')}`}
      >
        {EDGES.map(([a, b]) => (
          <line
            key={a + b}
            x1={pos.get(a)!.x}
            y1={pos.get(a)!.y}
            x2={pos.get(b)!.x}
            y2={pos.get(b)!.y}
            stroke="var(--color-dd-muted)"
          />
        ))}
        {NODES.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={18}
              fill={visited.has(n.id) ? 'var(--color-dd-accent)' : 'var(--color-dd-bg)'}
              stroke="var(--color-dd-accent)"
              strokeWidth={1.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              style={{ fontWeight: 700, fill: visited.has(n.id) ? '#fff' : undefined }}
            >
              {n.id}
            </text>
          </g>
        ))}
      </svg>
      <p className={styles.status} aria-live="polite">
        Ordem de visita:{' '}
        <strong className={styles.mono}>{order.slice(0, step).join(' → ') || '…'}</strong> (vizinhos
        em ordem alfabética). Grafo com {NODES.length} vértices e {EDGES.length} arestas, não
        direcionado.
      </p>
    </div>
  );
}
