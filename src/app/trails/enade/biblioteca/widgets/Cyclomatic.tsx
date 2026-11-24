'use client';
import { useMemo, useState } from 'react';
import {
  basisPaths,
  complexityFromCode,
  cyclomatic,
  enumeratePaths,
  type FlowGraph,
} from '@/lib/enade/flowgraph';
import styles from './widgets.module.css';

const PRESETS: { id: string; title: string; code: string; graph: FlowGraph }[] = [
  {
    id: 'if-else',
    title: 'if / else',
    code: 'ler(x)\nse (x > 0) entao\n  imprimir("positivo")\nsenao\n  imprimir("não positivo")\nfim se\nimprimir("fim")',
    graph: {
      start: '1',
      end: '4',
      nodes: [
        { id: '1', label: 'ler x; x > 0?', x: 160, y: 30 },
        { id: '2', label: 'positivo', x: 70, y: 110 },
        { id: '3', label: 'não positivo', x: 250, y: 110 },
        { id: '4', label: 'fim', x: 160, y: 190 },
      ],
      edges: [
        ['1', '2'],
        ['1', '3'],
        ['2', '4'],
        ['3', '4'],
      ],
    },
  },
  {
    id: 'while-if',
    title: 'while com if dentro',
    code: 'i = 0\nenquanto (i < n) faca\n  i = i + 1\n  se (calc(i) <= n) entao\n    f1(i)\n  senao\n    f2(i)\n  fim se\nfim enquanto\nimprimir("ok")',
    graph: {
      start: '1',
      end: '6',
      nodes: [
        { id: '1', label: 'i = 0', x: 160, y: 24 },
        { id: '2', label: 'i < n?', x: 160, y: 84 },
        { id: '3', label: 'i++; calc(i) <= n?', x: 160, y: 144 },
        { id: '4', label: 'f1(i)', x: 70, y: 204 },
        { id: '5', label: 'f2(i)', x: 250, y: 204 },
        { id: '6', label: 'imprimir("ok")', x: 300, y: 84 },
      ],
      edges: [
        ['1', '2'],
        ['2', '3'],
        ['2', '6'],
        ['3', '4'],
        ['3', '5'],
        ['4', '2'],
        ['5', '2'],
      ],
    },
  },
  {
    id: 'two-ifs',
    title: 'dois ifs em sequência',
    code: 'se (a) entao\n  x()\nfim se\nse (b) entao\n  y()\nfim se\nretornar',
    graph: {
      start: '1',
      end: '5',
      nodes: [
        { id: '1', label: 'a?', x: 160, y: 24 },
        { id: '2', label: 'x()', x: 80, y: 84 },
        { id: '3', label: 'b?', x: 160, y: 144 },
        { id: '4', label: 'y()', x: 80, y: 204 },
        { id: '5', label: 'retornar', x: 160, y: 264 },
      ],
      edges: [
        ['1', '2'],
        ['1', '3'],
        ['2', '3'],
        ['3', '4'],
        ['3', '5'],
        ['4', '5'],
      ],
    },
  },
  {
    id: 'switch',
    title: 'escolha (switch) com 3 casos',
    code: 'escolha (op)\n  caso 1: somar()\n  caso 2: subtrair()\n  caso 3: multiplicar()\nfim escolha\nmostrar()',
    graph: {
      start: '1',
      end: '5',
      nodes: [
        { id: '1', label: 'op?', x: 160, y: 30 },
        { id: '2', label: 'somar', x: 50, y: 110 },
        { id: '3', label: 'subtrair', x: 160, y: 110 },
        { id: '4', label: 'multiplicar', x: 270, y: 110 },
        { id: '5', label: 'mostrar', x: 160, y: 190 },
      ],
      edges: [
        ['1', '2'],
        ['1', '3'],
        ['1', '4'],
        ['1', '5'],
        ['2', '5'],
        ['3', '5'],
        ['4', '5'],
      ],
    },
  },
];

export function Cyclomatic({ props }: { props: Record<string, string> }) {
  const [presetId, setPresetId] = useState(props.preset || 'while-if');
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [code, setCode] = useState(preset.code);
  const [selected, setSelected] = useState(0);
  const metrics = useMemo(() => cyclomatic(preset.graph), [preset]);
  const basis = useMemo(() => basisPaths(preset.graph), [preset]);
  const allPaths = useMemo(() => enumeratePaths(preset.graph).length, [preset]);
  const fromCode = useMemo(() => complexityFromCode(code), [code]);
  const path = basis[selected] ?? [];
  const pathEdges = new Set(path.slice(1).map((id, i) => `${path[i]}>${id}`));
  const pos = new Map(preset.graph.nodes.map((n) => [n.id, n]));
  const height = Math.max(...preset.graph.nodes.map((n) => n.y)) + 40;
  return (
    <div>
      <div className={styles.title}>
        <strong>Complexidade ciclomática de McCabe</strong>
        <span>Escolha um trecho e selecione os caminhos independentes</span>
      </div>
      <div className={styles.controls} role="group" aria-label="Exemplos">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={styles.button}
            aria-pressed={p.id === presetId}
            onClick={() => {
              setPresetId(p.id);
              setCode(p.code);
              setSelected(0);
            }}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div className={styles.grid2}>
        <svg
          viewBox={`0 0 360 ${height}`}
          className={styles.svg}
          role="img"
          aria-label="Grafo de fluxo de controle"
        >
          <defs>
            <marker
              id="cfg-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          {preset.graph.edges.map(([from, to]) => {
            const a = pos.get(from)!;
            const b = pos.get(to)!;
            const back = b.y <= a.y && from !== to;
            const active = pathEdges.has(`${from}>${to}`);
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const r = 15;
            const x1 = a.x + (dx / len) * r;
            const y1 = a.y + (dy / len) * r;
            const x2 = b.x - (dx / len) * (r + 2);
            const y2 = b.y - (dy / len) * (r + 2);
            const bend = back
              ? `Q${Math.min(a.x, b.x) - 70},${(a.y + b.y) / 2} ${x2},${y2}`
              : `L${x2},${y2}`;
            return (
              <path
                key={`${from}-${to}`}
                d={`M${x1},${y1} ${bend}`}
                fill="none"
                stroke={active ? 'var(--color-dd-accent)' : 'var(--color-dd-muted)'}
                strokeWidth={active ? 2.5 : 1.3}
                style={{ color: active ? 'var(--color-dd-accent)' : 'var(--color-dd-muted)' }}
                markerEnd="url(#cfg-arrow)"
              />
            );
          })}
          {preset.graph.nodes.map((n) => {
            const decision = metrics.decisionNodes.includes(n.id);
            const onPath = path.includes(n.id);
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={15}
                  fill={onPath ? 'var(--color-dd-accent)' : 'var(--color-dd-bg)'}
                  stroke={decision ? 'var(--enade-warning)' : 'var(--color-dd-accent)'}
                  strokeWidth={decision ? 2.5 : 1.5}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  style={{ fontWeight: 650, fill: onPath ? '#fff' : undefined }}
                >
                  {n.id}
                </text>
                <text x={n.x + 20} y={n.y + 4} className={styles.muted} style={{ fontSize: 10.5 }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div>
          <table className={styles.table}>
            <tbody>
              <tr>
                <th scope="row">Arestas (E)</th>
                <td>{metrics.edges}</td>
              </tr>
              <tr>
                <th scope="row">Nós (N)</th>
                <td>{metrics.nodes}</td>
              </tr>
              <tr>
                <th scope="row">V(G) = E − N + 2P</th>
                <td>
                  {metrics.edges} − {metrics.nodes} + 2 = <strong>{metrics.byFormula}</strong>
                </td>
              </tr>
              <tr>
                <th scope="row">V(G) = predicados + 1</th>
                <td>
                  {metrics.predicates} + 1 = <strong>{metrics.byPredicates}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p className={styles.hint} style={{ marginTop: 8 }}>
            Nós com borda laranja são de decisão. Há {allPaths} caminhos possíveis sem repetir
            aresta, mas só {basis.length} são linearmente independentes — é o mínimo de casos de
            teste para cobrir todos os caminhos básicos.
          </p>
          <ol className={styles.log} aria-label="Caminhos independentes">
            {basis.map((p, i) => (
              <li key={p.join('-')}>
                <button
                  type="button"
                  className={styles.button}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Caminho {i + 1}: <span className={styles.mono}>{p.join(' → ')}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <label
        className={styles.hint}
        htmlFor="cyclomatic-code"
        style={{ display: 'block', marginTop: 14 }}
      >
        Calculadora pelo código: edite o trecho (pseudocódigo, Java, Python…) e conte os pontos de
        decisão
      </label>
      <textarea
        id="cyclomatic-code"
        className={`${styles.input} ${styles.mono}`}
        style={{ width: '100%', minHeight: 130, padding: 10, marginTop: 6 }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <p className={styles.status} role="status">
        {fromCode.found.length
          ? fromCode.found.map((f) => `${f.count}× ${f.label}`).join(' + ')
          : 'Nenhuma decisão'}{' '}
        → V(G) = {fromCode.decisions} + 1 = <strong>{fromCode.complexity}</strong>
      </p>
    </div>
  );
}
