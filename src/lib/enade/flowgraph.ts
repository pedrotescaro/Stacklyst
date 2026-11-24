/** Control-flow graphs for McCabe's cyclomatic complexity and basis paths. */
export type FlowNode = { id: string; label: string; x: number; y: number };
export type FlowGraph = {
  nodes: FlowNode[];
  edges: [string, string][];
  start: string;
  end: string;
};

export function cyclomatic(graph: FlowGraph, components = 1) {
  const out = new Map<string, number>();
  for (const [from] of graph.edges) out.set(from, (out.get(from) ?? 0) + 1);
  const predicates = [...out.values()].reduce((sum, degree) => sum + Math.max(0, degree - 1), 0);
  const e = graph.edges.length;
  const n = graph.nodes.length;
  return {
    edges: e,
    nodes: n,
    components,
    byFormula: e - n + 2 * components,
    predicates,
    byPredicates: predicates + 1,
    decisionNodes: [...out.entries()].filter(([, d]) => d > 1).map(([id]) => id),
  };
}

/** Paths from start to end that never repeat an edge (so each loop runs at most once more). */
export function enumeratePaths(graph: FlowGraph, limit = 400): string[][] {
  const adjacency = new Map<string, string[]>();
  for (const [from, to] of graph.edges) adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
  const paths: string[][] = [];
  const walk = (node: string, path: string[], used: Set<string>) => {
    if (paths.length >= limit) return;
    if (node === graph.end) {
      paths.push(path);
      return;
    }
    for (const next of adjacency.get(node) ?? []) {
      const key = `${node}>${next}`;
      if (used.has(key)) continue;
      used.add(key);
      walk(next, [...path, next], used);
      used.delete(key);
    }
  };
  walk(graph.start, [graph.start], new Set());
  return paths.sort((a, b) => a.length - b.length);
}

/** A set of linearly independent paths (edge-incidence vectors), as many as V(G). */
export function basisPaths(graph: FlowGraph): string[][] {
  const index = new Map(graph.edges.map(([a, b], i) => [`${a}>${b}`, i]));
  const target = cyclomatic(graph).byFormula;
  const rows: number[][] = [];
  const chosen: string[][] = [];
  for (const path of enumeratePaths(graph)) {
    const vector = new Array(graph.edges.length).fill(0);
    for (let i = 1; i < path.length; i++) vector[index.get(`${path[i - 1]}>${path[i]}`)!] += 1;
    if (independent(rows, vector)) {
      rows.push(vector);
      chosen.push(path);
      if (chosen.length === target) break;
    }
  }
  return chosen;
}

function independent(rows: number[][], vector: number[]) {
  const matrix = [...rows.map((r) => [...r]), [...vector]];
  let rank = 0;
  const cols = vector.length;
  for (let c = 0; c < cols && rank < matrix.length; c++) {
    let pivot = -1;
    for (let r = rank; r < matrix.length; r++) if (Math.abs(matrix[r][c]) > 1e-9) pivot = r;
    if (pivot < 0) continue;
    [matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]];
    for (let r = 0; r < matrix.length; r++) {
      if (r === rank) continue;
      const factor = matrix[r][c] / matrix[rank][c];
      for (let k = c; k < cols; k++) matrix[r][k] -= factor * matrix[rank][k];
    }
    rank++;
  }
  return rank === matrix.length;
}

/** V(G) from source code: decision points + 1 (if, laços, case, operadores lógicos). */
export function complexityFromCode(code: string) {
  const clean = code
    .replace(/\/\/.*$/gm, '')
    .replace(/#.*$/gm, '')
    // Block terminators of Portuguese pseudocode are not decisions.
    .replace(/\bfim\s*(se|enquanto|para|escolha|caso)\b/gi, '')
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  const patterns: [string, RegExp][] = [
    ['if / se', /\b(if|se|elif|senao\s+se|else\s+if)\b/gi],
    ['while / enquanto', /\b(while|enquanto)\b/gi],
    ['for / para', /\b(for|para|foreach)\b/gi],
    ['case / caso', /\b(case|caso)\b/gi],
    ['catch', /\b(catch|except)\b/gi],
    ['&& / e', /&&|\band\b/gi],
    ['|| / ou', /\|\||\bor\b/gi],
    ['?: ternário', /\?[^?.:]*:/g],
  ];
  const found = patterns
    .map(([label, pattern]) => ({ label, count: clean.match(pattern)?.length ?? 0 }))
    .filter((p) => p.count);
  // "else if" / "senao se" match once, as a single decision.
  const decisions = found.reduce((sum, p) => sum + p.count, 0);
  return { decisions, complexity: decisions + 1, found };
}
