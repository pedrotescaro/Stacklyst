'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { CircleUser, Plus, Square, Trash2 } from 'lucide-react';
import {
  DIAGRAM_LIMITS,
  nodeKind,
  type Diagram,
  type DiagramEdge,
  type DiagramEdgeKind,
  type DiagramNode,
  type DiagramNodeKind,
  type DiagramType,
} from '@/lib/enade/discursive';
import styles from './DiagramBoard.module.css';

const BOARD_HEIGHT = 460;
const WIDTH: Record<DiagramNodeKind, number> = { class: 180, actor: 96, usecase: 168, system: 300 };
const FALLBACK_HEIGHT: Record<DiagramNodeKind, number> = {
  class: 90,
  actor: 92,
  usecase: 64,
  system: 320,
};
const NEW_ATTRIBUTE = '- atributo: tipo';
const NEW_METHOD = '+ metodo()';
const DRAG_THRESHOLD = 3;

type Field = 'title' | 'body' | 'methods';
type Selection = { type: 'node' | 'edge'; id: string } | null;
type Menu = { id: string; x: number; y: number } | null;
type Size = { w: number; h: number };
type Point = { x: number; y: number };
type Gesture =
  | {
      kind: 'move';
      id: string;
      dx: number;
      dy: number;
      x0: number;
      y0: number;
      moved: boolean;
      field?: Field;
    }
  | { kind: 'resize'; id: string; x0: number; y0: number; w0: number; h0: number }
  | { kind: 'link'; from: string; x0: number; y0: number; moved: boolean };

const uid = () => Math.random().toString(36).slice(2, 9);

/** Keeps drags working past the shape's edge; harmless if the pointer is gone. */
function capture(el: HTMLElement, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    /* No active pointer (e.g. synthetic events): moves still reach the board. */
  }
}

/** Where the line from a shape's centre toward `target` leaves the shape. */
function edgePoint(center: Point, size: Size, target: Point, ellipse: boolean): Point {
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (!dx && !dy) return center;
  const rx = size.w / 2;
  const ry = size.h / 2;
  const scale = ellipse
    ? 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
    : Math.min(dx ? rx / Math.abs(dx) : Infinity, dy ? ry / Math.abs(dy) : Infinity);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

/** A point near one end of a line, nudged aside so a multiplicity can sit there. */
function endLabel(end: Point, other: Point): Point {
  const dx = other.x - end.x;
  const dy = other.y - end.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x: end.x + ux * 18 - uy * 10, y: end.y + uy * 18 + ux * 10 + 4 };
}

const LINK_TOOLS: Record<DiagramType, { kind: DiagramEdgeKind; label: string; hint: string }[]> = {
  class: [
    { kind: 'association', label: 'Associação', hint: 'Ligue as duas classes.' },
    { kind: 'inheritance', label: 'Herança', hint: 'Ligue da classe filha para a classe mãe.' },
  ],
  usecase: [
    { kind: 'association', label: 'Associação', hint: 'Ligue o ator ao caso de uso.' },
    { kind: 'include', label: '«include»', hint: 'Ligue do caso de uso base para o incluído.' },
    { kind: 'extend', label: '«extend»', hint: 'Ligue do caso de uso que estende para o base.' },
    { kind: 'inheritance', label: 'Generalização', hint: 'Ligue do elemento filho para o pai.' },
  ],
};

/**
 * UML drawing board for discursive answers, drawn the way textbooks do:
 * class diagrams (square boxes with name, attribute and method compartments)
 * and use case diagrams (actors, ellipses and a system boundary). Shapes drag
 * from anywhere, a click on any text edits it, and the round handle that shows
 * on hover links two shapes. Right-click a shape for its actions.
 */
export function DiagramBoard({
  value,
  readOnly,
  onChange,
}: {
  value: Diagram;
  readOnly?: boolean;
  onChange: (diagram: Diagram) => void;
}) {
  const [diagram, setDiagram] = useState(value);
  const [linkKind, setLinkKind] = useState<DiagramEdgeKind>('association');
  const [pending, setPending] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ from: string; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const [editing, setEditing] = useState<{ id: string; field: Field } | null>(null);
  const [menu, setMenu] = useState<Menu>(null);
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  const board = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const type: DiagramType = diagram.type ?? 'class';

  const commit = (next: Diagram) => {
    setDiagram(next);
    onChange(next);
  };

  // Shape sizes, so lines stop at the shape outline instead of the centre.
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    observer.current = new ResizeObserver((entries) => {
      setSizes((current) => {
        let changed = false;
        const next = { ...current };
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset.node;
          if (!id) continue;
          const size = { w: el.offsetWidth, h: el.offsetHeight };
          if (current[id]?.w !== size.w || current[id]?.h !== size.h) {
            next[id] = size;
            changed = true;
          }
        }
        return changed ? next : current;
      });
    });
    board.current
      ?.querySelectorAll<HTMLElement>('[data-node]')
      .forEach((el) => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, []);
  const observe = useCallback((el: HTMLElement | null) => {
    if (el && observer.current) observer.current.observe(el);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.closest('input, textarea');
      if (event.key === 'Escape') {
        setPending(null);
        setMenu(null);
      }
      if (!typing && selected && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        remove(selected);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!(event.target as HTMLElement | null)?.closest('[data-diagram-menu]')) setMenu(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  });

  const sizeOf = (node: DiagramNode): Size =>
    nodeKind(node) === 'system'
      ? { w: node.w ?? WIDTH.system, h: node.h ?? FALLBACK_HEIGHT.system }
      : (sizes[node.id] ?? { w: WIDTH[nodeKind(node)], h: FALLBACK_HEIGHT[nodeKind(node)] });
  const centre = (node: DiagramNode): Point => {
    const size = sizeOf(node);
    return { x: node.x + size.w / 2, y: node.y + size.h / 2 };
  };
  const local = (clientX: number, clientY: number): Point => {
    const rect = board.current!.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const addNode = (kind: DiagramNodeKind) => {
    if (diagram.nodes.length >= DIAGRAM_LIMITS.nodes) return;
    const width = board.current?.clientWidth ?? 640;
    const same = diagram.nodes.filter((n) => nodeKind(n) === kind).length;
    let x: number;
    let y: number;
    if (kind === 'actor') {
      // Actors stand outside the system, on the left.
      x = 24 + Math.floor(same / 3) * 104;
      y = 24 + (same % 3) * 130;
    } else if (kind === 'system') {
      x = 170;
      y = 12;
    } else if (kind === 'usecase') {
      // Use cases stack in columns inside the system boundary.
      x = 236 + Math.floor(same / 4) * (WIDTH.usecase + 72);
      y = 52 + (same % 4) * 104;
    } else {
      const step = WIDTH.class + 40;
      const perRow = Math.max(1, Math.floor((width - 24) / step));
      x = 24 + (same % perRow) * step;
      y = 24 + Math.floor(same / perRow) * 170;
    }
    const node: DiagramNode = {
      id: uid(),
      kind,
      x: Math.max(0, Math.min(x, width - WIDTH[kind] - 4)),
      y: Math.max(0, Math.min(y, BOARD_HEIGHT - FALLBACK_HEIGHT[kind] - 4)),
      title: kind === 'system' ? 'Sistema' : '',
      body: '',
      ...(kind === 'class' ? { methods: '' } : {}),
      ...(kind === 'system'
        ? { w: Math.min(WIDTH.system + 120, width - 190), h: BOARD_HEIGHT - 28 }
        : {}),
    };
    // The boundary goes first so it is drawn behind everything else.
    const nodes = kind === 'system' ? [node, ...diagram.nodes] : [...diagram.nodes, node];
    commit({ ...diagram, nodes });
    setSelected({ type: 'node', id: node.id });
    setEditing({ id: node.id, field: 'title' });
  };

  const remove = (target: NonNullable<Selection>) => {
    commit(
      target.type === 'node'
        ? {
            ...diagram,
            nodes: diagram.nodes.filter((n) => n.id !== target.id),
            edges: diagram.edges.filter((e) => e.from !== target.id && e.to !== target.id),
          }
        : { ...diagram, edges: diagram.edges.filter((e) => e.id !== target.id) }
    );
    setSelected(null);
    setMenu(null);
    setEditing(null);
  };

  const updateNode = (id: string, patch: Partial<DiagramNode>) =>
    commit({ ...diagram, nodes: diagram.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) });
  const updateEdge = (id: string, patch: Partial<DiagramEdge>) =>
    commit({ ...diagram, edges: diagram.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  /** Right-click actions: add a line and open it for editing, name selected. */
  const addLine = (node: DiagramNode, field: 'body' | 'methods') => {
    const line = field === 'body' ? NEW_ATTRIBUTE : NEW_METHOD;
    const current = (field === 'body' ? node.body : node.methods) ?? '';
    const next = current ? `${current}\n${line}` : line;
    setMenu(null);
    if (next.length > DIAGRAM_LIMITS.body) return;
    updateNode(node.id, { [field]: next });
    setEditing({ id: node.id, field });
    requestAnimationFrame(() => {
      const el = board.current?.querySelector<HTMLTextAreaElement>(
        `[data-node="${node.id}"] [data-field="${field}"]`
      );
      const start = next.length - line.length + 2;
      el?.setSelectionRange(start, start + (field === 'body' ? 8 : 6));
    });
  };

  const link = (from: string, to: string) => {
    const target = diagram.nodes.find((n) => n.id === to);
    if (from === to || !target || nodeKind(target) === 'system') return;
    if (diagram.edges.length >= DIAGRAM_LIMITS.edges) return;
    const edge: DiagramEdge = { id: uid(), from, to, kind: linkKind, label: '' };
    commit({ ...diagram, edges: [...diagram.edges, edge] });
    setSelected({ type: 'edge', id: edge.id });
  };

  // One pointer pipeline for moving shapes, resizing the boundary and linking.
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || !board.current) return;
    const p = local(event.clientX, event.clientY);
    if (g.kind === 'link') {
      if (Math.hypot(p.x - g.x0, p.y - g.y0) > DRAG_THRESHOLD) g.moved = true;
      setPreview({ from: g.from, x: p.x, y: p.y });
      return;
    }
    const node = diagram.nodes.find((n) => n.id === g.id);
    if (!node) return;
    if (g.kind === 'resize') {
      const w = Math.round(
        Math.max(160, Math.min(board.current.clientWidth - node.x - 2, g.w0 + p.x - g.x0))
      );
      const h = Math.round(Math.max(120, Math.min(BOARD_HEIGHT - node.y - 2, g.h0 + p.y - g.y0)));
      setDiagram((d) => ({
        ...d,
        nodes: d.nodes.map((n) => (n.id === g.id ? { ...n, w, h } : n)),
      }));
      return;
    }
    if (!g.moved && Math.hypot(p.x - g.x0, p.y - g.y0) <= DRAG_THRESHOLD) return;
    g.moved = true;
    const size = sizeOf(node);
    // Whole pixels keep the saved answer small.
    const x = Math.round(Math.max(0, Math.min(board.current.clientWidth - size.w - 2, p.x - g.dx)));
    const y = Math.round(Math.max(0, Math.min(BOARD_HEIGHT - size.h - 2, p.y - g.dy)));
    setDiagram((d) => ({ ...d, nodes: d.nodes.map((n) => (n.id === g.id ? { ...n, x, y } : n)) }));
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.kind === 'link') {
      setPreview(null);
      const target = (
        document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null
      )?.closest<HTMLElement>('[data-node]')?.dataset.node;
      if (g.moved && target && target !== g.from) link(g.from, target);
      // A plain click on the handle: the next click on a shape finishes the link.
      else if (!g.moved) setPending(g.from);
      return;
    }
    if (g.kind === 'resize') return onChange(diagram);
    if (g.moved) onChange(diagram);
    else if (g.field) setEditing({ id: g.id, field: g.field });
  };

  const onNodePointerDown = (event: ReactPointerEvent<HTMLDivElement>, node: DiagramNode) => {
    if (readOnly || event.button !== 0 || !board.current) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, [data-handle], [data-resize]')) return;
    if (pending) {
      event.preventDefault();
      link(pending, node.id);
      setPending(null);
      return;
    }
    setSelected({ type: 'node', id: node.id });
    const p = local(event.clientX, event.clientY);
    gesture.current = {
      kind: 'move',
      id: node.id,
      dx: p.x - node.x,
      dy: p.y - node.y,
      x0: p.x,
      y0: p.y,
      moved: false,
      field: target.closest<HTMLElement>('[data-view]')?.dataset.view as Field | undefined,
    };
    capture(board.current, event.pointerId);
  };
  const startLink = (event: ReactPointerEvent, node: DiagramNode) => {
    if (event.button !== 0 || !board.current) return;
    event.stopPropagation();
    event.preventDefault();
    const p = local(event.clientX, event.clientY);
    gesture.current = { kind: 'link', from: node.id, x0: p.x, y0: p.y, moved: false };
    setPending(null);
    capture(board.current, event.pointerId);
  };
  const startResize = (event: ReactPointerEvent, node: DiagramNode) => {
    if (event.button !== 0 || !board.current) return;
    event.stopPropagation();
    const p = local(event.clientX, event.clientY);
    const size = sizeOf(node);
    gesture.current = { kind: 'resize', id: node.id, x0: p.x, y0: p.y, w0: size.w, h0: size.h };
    capture(board.current, event.pointerId);
  };
  const onNodeContextMenu = (event: ReactMouseEvent<HTMLDivElement>, node: DiagramNode) => {
    if (readOnly || !board.current) return;
    event.preventDefault();
    event.stopPropagation();
    const p = local(event.clientX, event.clientY);
    setSelected({ type: 'node', id: node.id });
    setMenu({
      id: node.id,
      x: Math.min(p.x, board.current.clientWidth - 200),
      y: Math.min(p.y, BOARD_HEIGHT - 170),
    });
  };

  const switchType = (next: DiagramType) => {
    if (next === type) return;
    commit({ ...diagram, type: next });
    setLinkKind('association');
    setPending(null);
  };

  const selectedEdge =
    selected?.type === 'edge' ? diagram.edges.find((e) => e.id === selected.id) : null;
  const menuNode = menu ? diagram.nodes.find((n) => n.id === menu.id) : null;
  const tools = LINK_TOOLS[type];
  const full = diagram.nodes.length >= DIAGRAM_LIMITS.nodes;
  const hasSystem = diagram.nodes.some((n) => nodeKind(n) === 'system');
  const previewFrom = preview ? diagram.nodes.find((n) => n.id === preview.from) : null;

  return (
    <div className={styles.wrap}>
      {!readOnly && (
        <>
          <div className={styles.kinds} role="radiogroup" aria-label="Tipo de diagrama">
            <button
              type="button"
              role="radio"
              aria-checked={type === 'class'}
              onClick={() => switchType('class')}
            >
              Classes
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={type === 'usecase'}
              onClick={() => switchType('usecase')}
            >
              Casos de uso
            </button>
          </div>
          <div className={styles.toolbar} role="toolbar" aria-label="Ferramentas do diagrama">
            {type === 'class' ? (
              <button type="button" onClick={() => addNode('class')} disabled={full}>
                <Plus size={15} aria-hidden="true" /> Classe
              </button>
            ) : (
              <>
                <button type="button" onClick={() => addNode('actor')} disabled={full}>
                  <CircleUser size={15} aria-hidden="true" /> Ator
                </button>
                <button type="button" onClick={() => addNode('usecase')} disabled={full}>
                  <Plus size={15} aria-hidden="true" /> Caso de uso
                </button>
                <button
                  type="button"
                  onClick={() => addNode('system')}
                  disabled={full || hasSystem}
                >
                  <Square size={14} aria-hidden="true" /> Sistema
                </button>
              </>
            )}
            <span className={styles.divider} aria-hidden="true" />
            <span className={styles.linkLabel}>Ligação:</span>
            {tools.map((tool) => (
              <button
                key={tool.kind}
                type="button"
                className={styles.linkKind}
                aria-pressed={linkKind === tool.kind}
                onClick={() => setLinkKind(tool.kind)}
              >
                {tool.label}
              </button>
            ))}
            <button
              type="button"
              className={styles.remove}
              onClick={() => selected && remove(selected)}
              disabled={!selected}
              aria-label="Excluir item selecionado"
              title="Excluir (Delete)"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
          {selectedEdge?.kind === 'association' && type === 'class' && (
            <div className={styles.multiplicity}>
              <span>Multiplicidade</span>
              <label>
                origem
                <input
                  value={selectedEdge.fromLabel ?? ''}
                  maxLength={DIAGRAM_LIMITS.label}
                  placeholder="1"
                  onChange={(event) =>
                    updateEdge(selectedEdge.id, { fromLabel: event.target.value })
                  }
                />
              </label>
              <label>
                destino
                <input
                  value={selectedEdge.label}
                  maxLength={DIAGRAM_LIMITS.label}
                  placeholder="0..*"
                  onChange={(event) => updateEdge(selectedEdge.id, { label: event.target.value })}
                />
              </label>
            </div>
          )}
          <p className={styles.hint} aria-live="polite">
            {pending
              ? 'Agora clique na forma de destino.'
              : `Arraste a bolinha que aparece na lateral de uma forma até a outra. ${
                  tools.find((t) => t.kind === linkKind)?.hint ?? ''
                } Clique num texto para editar; botão direito mostra mais opções.`}
          </p>
        </>
      )}
      <div
        ref={board}
        className={styles.board}
        data-linking={pending || preview ? true : undefined}
        style={{ height: BOARD_HEIGHT }}
        aria-label="Área de desenho do diagrama"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            setSelected(null);
            setPending(null);
            setEditing(null);
          }
        }}
        onContextMenu={(event) => {
          if (event.target === event.currentTarget) event.preventDefault();
        }}
      >
        <svg className={styles.edges} aria-hidden="true">
          <defs>
            <marker
              id="diagram-hollow"
              viewBox="0 0 14 14"
              refX="13"
              refY="7"
              markerWidth="16"
              markerHeight="16"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M1 1 L13 7 L1 13 Z" className={styles.arrowHead} />
            </marker>
            <marker
              id="diagram-open"
              viewBox="0 0 12 12"
              refX="11"
              refY="6"
              markerWidth="12"
              markerHeight="12"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M1 1 L11 6 L1 11" className={styles.arrowOpen} />
            </marker>
          </defs>
          {diagram.edges.map((edge) => {
            const a = diagram.nodes.find((n) => n.id === edge.from);
            const b = diagram.nodes.find((n) => n.id === edge.to);
            if (!a || !b) return null;
            const ca = centre(a);
            const cb = centre(b);
            const p1 = edgePoint(ca, sizeOf(a), cb, nodeKind(a) === 'usecase');
            const p2 = edgePoint(cb, sizeOf(b), ca, nodeKind(b) === 'usecase');
            const active = selected?.type === 'edge' && selected.id === edge.id;
            const dependency = edge.kind === 'include' || edge.kind === 'extend';
            const l1 = endLabel(p1, p2);
            const l2 = endLabel(p2, p1);
            return (
              <g key={edge.id} data-active={active || undefined}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={styles.edge}
                  data-dashed={dependency || undefined}
                  markerEnd={
                    edge.kind === 'inheritance'
                      ? 'url(#diagram-hollow)'
                      : dependency
                        ? 'url(#diagram-open)'
                        : undefined
                  }
                />
                {!readOnly && (
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    className={styles.edgeHit}
                    onPointerDown={() => setSelected({ type: 'edge', id: edge.id })}
                  />
                )}
                {dependency && (
                  <text
                    x={(p1.x + p2.x) / 2}
                    y={(p1.y + p2.y) / 2 - 7}
                    textAnchor="middle"
                    className={styles.edgeLabel}
                  >
                    {`«${edge.kind}»`}
                  </text>
                )}
                {edge.kind === 'association' && edge.fromLabel && (
                  <text x={l1.x} y={l1.y} textAnchor="middle" className={styles.edgeLabel}>
                    {edge.fromLabel}
                  </text>
                )}
                {edge.kind === 'association' && edge.label && (
                  <text x={l2.x} y={l2.y} textAnchor="middle" className={styles.edgeLabel}>
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
          {preview && previewFrom && (
            <line
              x1={centre(previewFrom).x}
              y1={centre(previewFrom).y}
              x2={preview.x}
              y2={preview.y}
              className={styles.previewLine}
            />
          )}
        </svg>
        {diagram.nodes.map((node) => {
          const kind = nodeKind(node);
          const size = kind === 'system' ? sizeOf(node) : null;
          return (
            <div
              key={node.id}
              ref={observe}
              data-node={node.id}
              data-kind={kind}
              className={styles.node}
              data-selected={(selected?.type === 'node' && selected.id === node.id) || undefined}
              data-source={pending === node.id || preview?.from === node.id || undefined}
              style={{
                left: node.x,
                top: node.y,
                width: size ? size.w : WIDTH[kind],
                height: size ? size.h : undefined,
              }}
              onPointerDown={(event) => onNodePointerDown(event, node)}
              onContextMenu={(event) => onNodeContextMenu(event, node)}
            >
              {kind === 'actor' && (
                <svg className={styles.actor} viewBox="0 0 40 60" aria-hidden="true">
                  <circle cx="20" cy="9" r="7.5" />
                  <path d="M20 16.5 V38 M5 25 H35 M20 38 L7 57 M20 38 L33 57" />
                </svg>
              )}
              <NodeFields
                node={node}
                kind={kind}
                readOnly={readOnly}
                editing={editing?.id === node.id ? editing.field : null}
                onChange={(patch) => updateNode(node.id, patch)}
                onDone={() => setEditing(null)}
              />
              {!readOnly && kind !== 'system' && (
                <span
                  className={styles.handle}
                  data-handle
                  role="button"
                  aria-label="Ligar a outra forma"
                  title="Arraste até outra forma para ligar"
                  onPointerDown={(event) => startLink(event, node)}
                />
              )}
              {!readOnly && kind === 'system' && (
                <span
                  className={styles.resize}
                  data-resize
                  aria-hidden="true"
                  onPointerDown={(event) => startResize(event, node)}
                />
              )}
            </div>
          );
        })}
        {menu && menuNode && (
          <div
            className={styles.menu}
            role="menu"
            data-diagram-menu
            style={{ left: menu.x, top: menu.y }}
          >
            {nodeKind(menuNode) === 'class' && (
              <>
                <button type="button" role="menuitem" onClick={() => addLine(menuNode, 'body')}>
                  Adicionar atributo
                </button>
                <button type="button" role="menuitem" onClick={() => addLine(menuNode, 'methods')}>
                  Adicionar método
                </button>
                <span className={styles.menuDivider} aria-hidden="true" />
              </>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenu(null);
                setEditing({ id: menuNode.id, field: 'title' });
              }}
            >
              Renomear
            </button>
            <button
              type="button"
              role="menuitem"
              data-danger
              onClick={() => remove({ type: 'node', id: menuNode.id })}
            >
              Excluir
            </button>
          </div>
        )}
        {!diagram.nodes.length && (
          <p className={styles.empty}>
            {readOnly
              ? 'Nenhum diagrama desenhado.'
              : type === 'class'
                ? 'Clique em “Classe” para começar o diagrama.'
                : 'Adicione o sistema, os atores e os casos de uso.'}
          </p>
        )}
      </div>
    </div>
  );
}

const PLACEHOLDER: Record<DiagramNodeKind, string> = {
  class: 'NomeDaClasse',
  actor: 'Ator',
  usecase: 'Caso de uso',
  system: 'Sistema',
};

/**
 * The texts of one shape. They read as plain text, like a textbook diagram;
 * a click (without dragging) turns one into a field, and leaving it saves.
 */
function NodeFields({
  node,
  kind,
  readOnly,
  editing,
  onChange,
  onDone,
}: {
  node: DiagramNode;
  kind: DiagramNodeKind;
  readOnly?: boolean;
  editing: Field | null;
  onChange: (patch: Partial<DiagramNode>) => void;
  onDone: () => void;
}) {
  const rows = (text: string | undefined) => Math.max(1, (text ?? '').split('\n').length);
  const finish = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const multiline = event.currentTarget.tagName === 'TEXTAREA' && editing !== 'title';
    if (event.key === 'Escape' || (event.key === 'Enter' && !multiline)) {
      event.preventDefault();
      onDone();
    }
  };
  const title =
    editing === 'title' && !readOnly ? (
      kind === 'usecase' ? (
        <textarea
          autoFocus
          data-field="title"
          className={styles.title}
          value={node.title}
          maxLength={DIAGRAM_LIMITS.title}
          rows={2}
          placeholder={PLACEHOLDER[kind]}
          aria-label="Nome do caso de uso"
          onChange={(event) => onChange({ title: event.target.value.replace(/\n/g, ' ') })}
          onKeyDown={finish}
          onBlur={onDone}
        />
      ) : (
        <input
          autoFocus
          data-field="title"
          className={styles.title}
          value={node.title}
          maxLength={DIAGRAM_LIMITS.title}
          placeholder={PLACEHOLDER[kind]}
          aria-label={`Nome ${kind === 'actor' ? 'do ator' : kind === 'system' ? 'do sistema' : 'da classe'}`}
          onChange={(event) => onChange({ title: event.target.value })}
          onKeyDown={finish}
          onBlur={onDone}
        />
      )
    ) : (
      <div className={styles.title} data-view="title" data-empty={!node.title || undefined}>
        {node.title || PLACEHOLDER[kind]}
      </div>
    );
  if (kind !== 'class') return title;
  const compartment = (field: 'body' | 'methods', label: string) => {
    const text = (field === 'body' ? node.body : node.methods) ?? '';
    return editing === field && !readOnly ? (
      <textarea
        autoFocus
        data-field={field}
        className={styles.compartment}
        value={text}
        maxLength={DIAGRAM_LIMITS.body}
        rows={rows(text)}
        placeholder={field === 'body' ? NEW_ATTRIBUTE : NEW_METHOD}
        aria-label={label}
        onChange={(event) => onChange({ [field]: event.target.value })}
        onKeyDown={finish}
        onBlur={onDone}
      />
    ) : (
      <div className={styles.compartment} data-view={field} aria-label={label}>
        {text}
      </div>
    );
  };
  return (
    <>
      {title}
      {compartment('body', 'Atributos')}
      {compartment('methods', 'Métodos')}
    </>
  );
}
