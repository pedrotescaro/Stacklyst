/**
 * A discursive answer is stored as one string (max 10 000 chars, see
 * simulator-schema). Plain text stays plain; when the student also draws a
 * diagram, both are kept in a small JSON envelope so older answers and the
 * server never need to change.
 */

export const NOTEBOOK_LINES = 15;
export const ANSWER_MAX_LENGTH = 10_000;

export type DiagramType = 'class' | 'usecase';
export type DiagramNodeKind = 'class' | 'actor' | 'usecase' | 'system';
export type DiagramNode = {
  id: string;
  /** Missing on boxes saved before use cases existed: a class. */
  kind?: DiagramNodeKind;
  x: number;
  y: number;
  /** Only the system boundary is resizable. */
  w?: number;
  h?: number;
  title: string;
  /** Class attributes, one per line. */
  body: string;
  /** Class methods, one per line. */
  methods?: string;
};
export type DiagramEdgeKind = 'association' | 'inheritance' | 'include' | 'extend';
export type DiagramEdge = {
  id: string;
  from: string;
  to: string;
  kind: DiagramEdgeKind;
  /** Multiplicity at the target end (associations). */
  label: string;
  /** Multiplicity at the source end (associations). */
  fromLabel?: string;
};
export type Diagram = { type?: DiagramType; nodes: DiagramNode[]; edges: DiagramEdge[] };
export type DiscursiveAnswer = { text: string; diagram: Diagram | null };

export const DIAGRAM_LIMITS = { nodes: 16, edges: 30, title: 40, body: 400, label: 20 };

const TAG = 'stacklyst/discursive@1';

export const nodeKind = (node: DiagramNode): DiagramNodeKind => node.kind ?? 'class';

function isDiagram(value: unknown): value is Diagram {
  if (!value || typeof value !== 'object') return false;
  const d = value as Diagram;
  return Array.isArray(d.nodes) && Array.isArray(d.edges);
}

export function parseDiscursive(raw: string | null | undefined): DiscursiveAnswer {
  if (!raw) return { text: '', diagram: null };
  if (raw.startsWith('{') && raw.includes(TAG)) {
    try {
      const data = JSON.parse(raw) as { tag?: string; text?: unknown; diagram?: unknown };
      if (data.tag === TAG) {
        return {
          text: typeof data.text === 'string' ? data.text : '',
          diagram: isDiagram(data.diagram) && data.diagram.nodes.length ? data.diagram : null,
        };
      }
    } catch {
      /* Not our envelope: treat it as text. */
    }
  }
  return { text: raw, diagram: null };
}

export function serializeDiscursive({ text, diagram }: DiscursiveAnswer): string {
  if (!diagram || !diagram.nodes.length) return text;
  return JSON.stringify({ tag: TAG, text, diagram });
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Human-readable answer for lists and results. */
export function discursiveSummary(raw: string | null | undefined): string {
  const { text, diagram } = parseDiscursive(raw);
  if (!diagram) return text;
  const of = (kind: DiagramNodeKind) => diagram.nodes.filter((n) => nodeKind(n) === kind).length;
  const parts = [
    of('class') && count(of('class'), 'classe', 'classes'),
    of('actor') && count(of('actor'), 'ator', 'atores'),
    of('usecase') && count(of('usecase'), 'caso de uso', 'casos de uso'),
  ].filter(Boolean);
  const note = `[Diagrama: ${parts.join(', ')}]`;
  return text.trim() ? `${text}\n${note}` : note;
}

/** Diagram questions open the drawing board by default. */
export function asksForDiagram(statement: string) {
  return /\bdiagrama\b/i.test(statement);
}

/** Which palette the board starts with for this statement. */
export function diagramTypeFor(statement: string): DiagramType {
  return /\bcasos? de uso\b/i.test(statement) ? 'usecase' : 'class';
}
