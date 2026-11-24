'use client';
import { useEffect, useMemo, useState } from 'react';
import styles from './widgets.module.css';

type Node = { value: number; left: Node | null; right: Node | null };

function insert(node: Node | null, value: number): Node {
  if (!node) return { value, left: null, right: null };
  if (value < node.value) return { ...node, left: insert(node.left, value) };
  if (value > node.value) return { ...node, right: insert(node.right, value) };
  return node;
}
function remove(node: Node | null, value: number): Node | null {
  if (!node) return null;
  if (value < node.value) return { ...node, left: remove(node.left, value) };
  if (value > node.value) return { ...node, right: remove(node.right, value) };
  if (!node.left) return node.right;
  if (!node.right) return node.left;
  let successor = node.right;
  while (successor.left) successor = successor.left;
  return { ...node, value: successor.value, right: remove(node.right, successor.value) };
}
function path(
  node: Node | null,
  value: number,
  acc: number[] = []
): { visited: number[]; found: boolean } {
  if (!node) return { visited: acc, found: false };
  const visited = [...acc, node.value];
  if (value === node.value) return { visited, found: true };
  return path(value < node.value ? node.left : node.right, value, visited);
}
const orders = {
  'pré-ordem (raiz, esq, dir)': (n: Node | null): number[] =>
    n
      ? [
          n.value,
          ...orders['pré-ordem (raiz, esq, dir)'](n.left),
          ...orders['pré-ordem (raiz, esq, dir)'](n.right),
        ]
      : [],
  'em ordem (esq, raiz, dir)': (n: Node | null): number[] =>
    n
      ? [
          ...orders['em ordem (esq, raiz, dir)'](n.left),
          n.value,
          ...orders['em ordem (esq, raiz, dir)'](n.right),
        ]
      : [],
  'pós-ordem (esq, dir, raiz)': (n: Node | null): number[] =>
    n
      ? [
          ...orders['pós-ordem (esq, dir, raiz)'](n.left),
          ...orders['pós-ordem (esq, dir, raiz)'](n.right),
          n.value,
        ]
      : [],
  'em nível (largura)': (n: Node | null): number[] => {
    const out: number[] = [];
    const queue = n ? [n] : [];
    while (queue.length) {
      const current = queue.shift()!;
      out.push(current.value);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
    return out;
  },
};
type Order = keyof typeof orders;
function height(n: Node | null): number {
  return n ? 1 + Math.max(height(n.left), height(n.right)) : 0;
}
function layout(
  n: Node | null,
  depth = 0,
  lo = 0,
  hi = 1,
  out: { value: number; x: number; y: number; px?: number; py?: number }[] = [],
  parent?: { x: number; y: number }
) {
  if (!n) return out;
  const x = (lo + hi) / 2;
  const y = depth;
  out.push({ value: n.value, x, y, px: parent?.x, py: parent?.y });
  layout(n.left, depth + 1, lo, x, out, { x, y });
  layout(n.right, depth + 1, x, hi, out, { x, y });
  return out;
}

export function BinarySearchTree({ props }: { props: Record<string, string> }) {
  const initial = (props.values || '50 30 70 20 40 60 80')
    .split(/[\s,]+/)
    .map(Number)
    .filter(Number.isFinite);
  const [root, setRoot] = useState<Node | null>(() =>
    initial.reduce<Node | null>((r, v) => insert(r, v), null)
  );
  const [value, setValue] = useState('45');
  const [highlight, setHighlight] = useState<number[]>([]);
  const [step, setStep] = useState(-1);
  const [message, setMessage] = useState('');
  const nodes = useMemo(() => layout(root), [root]);
  const depth = Math.max(1, height(root));
  const W = 640;
  const H = depth * 64 + 20;
  const n = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(n);
  useEffect(() => {
    if (step < 0 || step >= highlight.length - 1) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 650);
    return () => clearTimeout(timer);
  }, [step, highlight]);
  const animate = (sequence: number[], text: string) => {
    setHighlight(sequence);
    setStep(0);
    setMessage(text);
  };
  const shown = new Set(highlight.slice(0, step + 1));
  const current = highlight[step];
  return (
    <div>
      <div className={styles.title}>
        <strong>Árvore binária de busca</strong>
        <span>Menores à esquerda, maiores à direita</span>
      </div>
      <div className={styles.controls}>
        <input
          aria-label="Valor"
          className={styles.input}
          style={{ width: 70 }}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          disabled={!valid}
          onClick={() => {
            const p = path(root, n);
            setRoot(insert(root, n));
            animate(
              [...p.visited, n],
              p.found
                ? `${n} já existe; ABB não guarda duplicatas.`
                : `Inserir ${n}: compara com ${p.visited.join(' → ') || 'nada (árvore vazia)'} e vira folha.`
            );
          }}
        >
          Inserir
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!valid}
          onClick={() => {
            const p = path(root, n);
            animate(
              p.visited,
              p.found
                ? `Encontrado com ${p.visited.length} comparação(ões): ${p.visited.join(' → ')}.`
                : `Não encontrado após ${p.visited.length} comparação(ões).`
            );
          }}
        >
          Buscar
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!valid}
          onClick={() => {
            const p = path(root, n);
            if (!p.found) return setMessage(`${n} não está na árvore.`);
            setRoot(remove(root, n));
            setHighlight([]);
            setStep(-1);
            setMessage(
              `Removido ${n}. Com dois filhos, o nó é substituído pelo sucessor em ordem (menor da subárvore direita).`
            );
          }}
        >
          Remover
        </button>
      </div>
      <div className={styles.controls}>
        {(Object.keys(orders) as Order[]).map((order) => (
          <button
            key={order}
            type="button"
            className={styles.button}
            onClick={() => {
              const sequence = orders[order](root);
              animate(sequence, `Percurso ${order}: ${sequence.join(', ')}`);
            }}
          >
            {order}
          </button>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        role="img"
        aria-label="Desenho da árvore"
      >
        {nodes.map((node) =>
          node.px !== undefined ? (
            <line
              key={`e-${node.value}`}
              x1={node.px * W}
              y1={node.py! * 64 + 24}
              x2={node.x * W}
              y2={node.y * 64 + 24}
              stroke="var(--color-dd-muted)"
            />
          ) : null
        )}
        {nodes.map((node) => (
          <g key={node.value}>
            <circle
              cx={node.x * W}
              cy={node.y * 64 + 24}
              r={17}
              fill={
                current === node.value
                  ? 'var(--color-dd-accent)'
                  : shown.has(node.value)
                    ? 'color-mix(in srgb, var(--color-dd-accent) 30%, var(--color-dd-bg))'
                    : 'var(--color-dd-bg)'
              }
              stroke="var(--color-dd-accent)"
              strokeWidth={1.5}
            />
            <text
              x={node.x * W}
              y={node.y * 64 + 28}
              textAnchor="middle"
              style={{ fontWeight: 650, fill: current === node.value ? '#fff' : undefined }}
            >
              {node.value}
            </text>
          </g>
        ))}
      </svg>
      <p className={styles.status} aria-live="polite">
        {message ||
          `Altura: ${depth}. Busca, inserção e remoção custam O(h): O(log n) se balanceada, O(n) se degenerar em lista.`}
      </p>
    </div>
  );
}
