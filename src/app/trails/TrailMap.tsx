'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Braces,
  Check,
  Code2,
  Crown,
  Database,
  GitBranch,
  Layers3,
  ListTodo,
  LockKeyhole,
  Minus,
  Network,
  Plus,
  RotateCcw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import {
  TransformWrapper,
  TransformComponent,
  useControls,
  useTransformEffect,
} from 'react-zoom-pan-pinch';
import { TrailMapLessonPopover } from '@/app/trails/TrailMapLessonPopover';
import { cn } from '@/lib/cn';
import { getTrailSectorAccent, getTrailSectorRegionLabel } from '@/app/trails/trailSectorVisuals';
import type {
  KnowledgeMapEdge,
  KnowledgeMapNode,
  KnowledgeNodeType,
  KnowledgeProgressStatus,
  KnowledgeRelation,
  LearningPathSummary,
} from '@/lib/learning/types';

interface TrailMapProps {
  nodes: KnowledgeMapNode[];
  edges: KnowledgeMapEdge[];
  paths: LearningPathSummary[];
  selectedNodeId: string;
  selectedPathId: string;
  onSelectNode: (nodeId: string) => void;
  onSelectPath: (pathId: string) => void;
  onPreviewNode?: (nodeId: string) => void;
  onDismissNodePreview?: () => void;
}

export interface Point {
  x: number;
  y: number;
}

export interface PlacedNode {
  node: KnowledgeMapNode;
  path: LearningPathSummary;
  sectorId: string;
  pathIndex: number;
  nodeIndex: number;
  stageIndex: number;
  primary: boolean;
  stageLabel: string;
  StageIcon: LucideIcon | null;
  rowIndex: number;
  laneIndex: number;
  laneCount: number;
  point: Point;
  accent: string;
}

interface VisualSector {
  id: string;
  path: LearningPathSummary;
  title: string;
  regionLabel: string;
  angle: number;
  accent: string;
  sectorIndex: number;
}

const GRAPH_WIDTH = 1400;
const GRAPH_HEIGHT = 800;
const HUB = { x: 700, y: 400 };
const NODE_RADIUS_START = 96;

const TYPE_ICON: Record<KnowledgeNodeType, LucideIcon> = {
  FOUNDATION: Layers3,
  LANGUAGE: Braces,
  CONCEPT: Code2,
  FRAMEWORK: Network,
  LIBRARY: Layers3,
  TOOL: Wrench,
  DATABASE: Database,
  ARCHITECTURE: GitBranch,
  PROJECT: Route,
  CHALLENGE: ShieldCheck,
};

const MILESTONE_STAGES: Array<{ label: string; Icon: LucideIcon | null }> = [
  { label: 'Habilidade', Icon: null },
  { label: 'Aula', Icon: BookOpen },
  { label: 'Exemplo', Icon: Code2 },
  { label: 'Exercício', Icon: ListTodo },
  { label: 'Prática', Icon: Route },
  { label: 'Checkpoint', Icon: Target },
  { label: 'Desafio', Icon: ShieldCheck },
  { label: 'Revisão', Icon: Sparkles },
];

const STATUS_LABEL: Record<KnowledgeProgressStatus, string> = {
  NOT_STARTED: 'Bloqueado',
  AVAILABLE: 'Disponível',
  RECOMMENDED: 'Recomendado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  MASTERED: 'Dominado',
};

const RELATION_ACCENT: Record<KnowledgeRelation, string> = {
  REQUIRED: '#64748b',
  RECOMMENDED: '#60a5fa',
  RELATED: '#94a3b8',
  BUILDS_ON: '#a855f7',
  COMBINES: '#14b8a6',
};

const ANGLES_BY_COUNT: Record<number, number[]> = {
  1: [-90],
  2: [180, 0],
  3: [180, -90, 0],
  4: [180, -90, 0, 90],
  5: [180, -110, -35, 35, 90],
  6: [180, -120, -60, 0, 60, 120],
};

function getSectorAngle(index: number, count: number) {
  const angles = ANGLES_BY_COUNT[Math.min(6, Math.max(1, count))];
  if (index < angles.length) return angles[index];
  return 100 + (index - angles.length + 1) * 32;
}

function buildVisualSectors(paths: LearningPathSummary[]): VisualSector[] {
  if (paths.length === 4) {
    const frontend = paths[0]!;
    const systems = paths[1]!;
    const algorithms = paths[2]!;
    const backend = paths[3]!;
    return [
      {
        id: `${frontend.id}-west`,
        path: frontend,
        title: frontend.title,
        regionLabel: 'Setor Oeste',
        angle: 180,
        accent: getTrailSectorAccent(0, paths.length, frontend.accentColor),
        sectorIndex: 0,
      },
      {
        id: `${systems.id}-north`,
        path: systems,
        title: systems.title,
        regionLabel: 'Setor Norte',
        angle: -90,
        accent: getTrailSectorAccent(1, paths.length, systems.accentColor),
        sectorIndex: 1,
      },
      {
        id: `${algorithms.id}-east`,
        path: algorithms,
        title: algorithms.title,
        regionLabel: 'Setor Leste',
        angle: 0,
        accent: getTrailSectorAccent(2, paths.length, algorithms.accentColor),
        sectorIndex: 2,
      },
      {
        id: `${backend.id}-south`,
        path: backend,
        title: backend.title,
        regionLabel: 'Setor Sul',
        angle: 90,
        accent: getTrailSectorAccent(3, paths.length, backend.accentColor),
        sectorIndex: 3,
      },
    ];
  }

  return paths.map((path, pathIndex) => ({
    id: `${path.id}-sector-${pathIndex}`,
    path,
    title: path.title,
    regionLabel: getTrailSectorRegionLabel(pathIndex, paths.length),
    angle: getSectorAngle(pathIndex, paths.length),
    accent: getTrailSectorAccent(pathIndex, paths.length, path.accentColor),
    sectorIndex: pathIndex,
  }));
}

function sectorPoint(angle: number, radius: number, crossOffset = 0): Point {
  const radians = (angle * Math.PI) / 180;
  const perpendicular = radians + Math.PI / 2;
  return {
    x: HUB.x + Math.cos(radians) * radius + Math.cos(perpendicular) * crossOffset,
    y: HUB.y + Math.sin(radians) * radius + Math.sin(perpendicular) * crossOffset,
  };
}

function sectorLabelPoint(angle: number): Point {
  const radians = (angle * Math.PI) / 180;
  const horizontal = Math.cos(radians);
  const vertical = Math.sin(radians);

  if (horizontal > 0.92) return { x: 1362, y: HUB.y };
  if (horizontal < -0.92) return { x: 38, y: HUB.y };
  if (vertical < -0.92) return { x: HUB.x, y: 32 };
  if (vertical > 0.92) return { x: HUB.x, y: 764 };
  if (horizontal < 0 && vertical < 0) return { x: 470, y: 142 };
  if (horizontal > 0 && vertical > 0) return { x: 1060, y: 670 };
  return sectorPoint(angle, 350);
}

function sectorRadiusEnd(angle: number) {
  const radians = (angle * Math.PI) / 180;
  const horizontal = Math.cos(radians);
  const vertical = Math.sin(radians);
  if (horizontal > 0.92) return 440;
  if (horizontal < -0.92) return 570;
  if (vertical < -0.92) return 300;
  if (vertical > 0.92) return 290;
  return 500;
}

function buildRowCapacities(totalMilestones: number, maximumRowCapacity = 8) {
  const capacities: number[] = [];
  let remaining = totalMilestones;

  for (const capacity of [1, 3, 5]) {
    if (remaining <= 0) break;
    const rowCapacity = Math.min(capacity, maximumRowCapacity, remaining);
    capacities.push(rowCapacity);
    remaining -= rowCapacity;
  }

  while (remaining > 0) {
    const rowCapacity = Math.min(maximumRowCapacity, remaining);
    capacities.push(rowCapacity);
    remaining -= rowCapacity;
  }

  return capacities;
}

function getRowPlacement(visualIndex: number, rowCapacities: number[]) {
  let offset = visualIndex;

  for (let rowIndex = 0; rowIndex < rowCapacities.length; rowIndex += 1) {
    const laneCount = rowCapacities[rowIndex];
    if (offset < laneCount) return { rowIndex, laneIndex: offset, laneCount };
    offset -= laneCount;
  }

  return { rowIndex: 0, laneIndex: 0, laneCount: 1 };
}

function buildPlacedNodes(nodes: KnowledgeMapNode[], sectors: VisualSector[]) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return sectors.flatMap((sector) => {
    const { path, sectorIndex: pathIndex, angle, accent } = sector;
    const pathNodes = path.nodeIds
      .map((nodeId) => nodesById.get(nodeId))
      .filter((node): node is KnowledgeMapNode => Boolean(node));
    if (pathNodes.length === 0) return [];

    const totalMilestones = 32;
    const radians = (angle * Math.PI) / 180;
    const horizontalSector = Math.abs(Math.cos(radians)) > 0.92;
    const verticalSector = Math.abs(Math.sin(radians)) > 0.92;
    const isSouthSector = verticalSector && Math.sin(radians) > 0.92;
    const diagonalSector = !horizontalSector && !verticalSector;
    const rowCapacities = buildRowCapacities(totalMilestones, diagonalSector ? 3 : 8);
    const rowCount = Math.max(1, rowCapacities.length);
    const radiusEnd = sectorRadiusEnd(angle);
    const crossSpacing = horizontalSector ? 50 : verticalSector ? 56 : 32;
    const radiusStart = diagonalSector ? 140 : isSouthSector ? 125 : NODE_RADIUS_START;

    return Array.from({ length: totalMilestones }, (_, visualIndex) => {
      const nodeIndex = Math.min(
        pathNodes.length - 1,
        Math.floor((visualIndex * pathNodes.length) / totalMilestones)
      );
      const node = pathNodes[nodeIndex]!;
      const previousNodeIndex =
        visualIndex === 0
          ? -1
          : Math.min(
              pathNodes.length - 1,
              Math.floor(((visualIndex - 1) * pathNodes.length) / totalMilestones)
            );
      const stage = MILESTONE_STAGES[visualIndex % MILESTONE_STAGES.length]!;
      const stageIndex = visualIndex;
      const { rowIndex, laneIndex, laneCount } = getRowPlacement(visualIndex, rowCapacities);
      const progress = rowCount === 1 ? 1 : rowIndex / (rowCount - 1);
      const radius = radiusStart + (radiusEnd - radiusStart) * progress;
      const crossOffset = (laneIndex - (laneCount - 1) / 2) * crossSpacing;

      return {
        node,
        path,
        sectorId: sector.id,
        pathIndex,
        nodeIndex,
        stageIndex,
        primary: nodeIndex !== previousNodeIndex,
        stageLabel: stage.label,
        StageIcon: stage.Icon,
        rowIndex,
        laneIndex,
        laneCount,
        point: sectorPoint(angle, radius, crossOffset),
        accent,
      } satisfies PlacedNode;
    });
  });
}

function buildSectorConnections(placements: PlacedNode[]) {
  return placements.map((placement) => {
    if (placement.rowIndex === 0) {
      return { source: HUB, target: placement.point };
    }

    const previousRow = placements.filter(
      (candidate) => candidate.rowIndex === placement.rowIndex - 1
    );
    const normalizedLane =
      placement.laneCount <= 1 ? 0 : placement.laneIndex / (placement.laneCount - 1);
    const parentIndex = Math.round(normalizedLane * Math.max(0, previousRow.length - 1));
    return { source: previousRow[parentIndex]?.point ?? HUB, target: placement.point };
  });
}

function GamifiedSkillNode({
  placement,
  selected,
  onSelect,
  mobile = false,
}: {
  placement: PlacedNode;
  selected: boolean;
  onSelect: () => void;
  mobile?: boolean;
}) {
  const { node, sectorId, point, accent, nodeIndex, stageIndex, primary, stageLabel, StageIcon } =
    placement;
  const Icon = StageIcon ?? TYPE_ICON[node.type];
  const completed = node.status === 'COMPLETED' || node.status === 'MASTERED';
  const unlockedStageLimit = node.status === 'IN_PROGRESS' ? 5 : 3;
  const effectiveStageIndex = stageIndex % MILESTONE_STAGES.length;
  const locked =
    node.status === 'NOT_STARTED' || (!completed && effectiveStageIndex > unlockedStageLimit);
  const taskCount = node.exercises.length;
  const darkerAccent = `color-mix(in srgb, ${accent} 62%, black)`;
  const accessibleStatus = locked ? 'Bloqueado' : STATUS_LABEL[node.status];
  const accessibleLabel = primary
    ? `${node.title}. ${accessibleStatus}. ${taskCount} ${taskCount === 1 ? 'tarefa' : 'tarefas'}.`
    : `${node.title}. ${stageLabel}. ${accessibleStatus}. ${taskCount} ${taskCount === 1 ? 'tarefa' : 'tarefas'}.`;

  return (
    <button
      type="button"
      id={`skill-node-btn-${sectorId}-${node.slug}-${stageIndex}`}
      data-testid={`knowledge-skill-node-${sectorId}-${node.slug}-${stageIndex}`}
      aria-label={accessibleLabel}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        'dd-focus-ring group z-30 flex items-center justify-center rounded-full border text-white shadow-sm transition duration-150 hover:z-50 focus-visible:z-50',
        mobile
          ? 'relative h-[52px] w-[52px] shrink-0 border-b-[6px]'
          : 'absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 border-b-2',
        locked
          ? 'border-slate-300 border-b-slate-400 bg-slate-200 text-slate-400 dark:border-[#33414a] dark:border-b-[#182229] dark:bg-[#222c33] dark:text-[#71808a]'
          : mobile
            ? 'cursor-pointer hover:-translate-y-1 active:translate-y-1 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0'
            : 'cursor-pointer hover:-translate-y-[calc(50%+2px)] active:translate-y-[calc(-50%+2px)] motion-reduce:hover:-translate-y-1/2 motion-reduce:active:-translate-y-1/2',
        selected && 'ring-2 ring-blue-400/80 ring-offset-2 ring-offset-dd-bg'
      )}
      style={
        mobile
          ? {
              borderColor: locked ? undefined : accent,
              borderBottomColor: locked ? undefined : darkerAccent,
              backgroundColor: locked ? undefined : accent,
              boxShadow: locked ? undefined : `0 6px 14px ${accent}24`,
            }
          : {
              left: `${(point.x / GRAPH_WIDTH) * 100}%`,
              top: `${(point.y / GRAPH_HEIGHT) * 100}%`,
              borderColor: locked ? undefined : accent,
              borderBottomColor: locked ? undefined : darkerAccent,
              backgroundColor: locked ? undefined : accent,
              boxShadow: locked ? undefined : `0 6px 14px ${accent}22`,
            }
      }
    >
      {node.status === 'MASTERED' ? (
        <Sparkles
          className={cn('fill-current', mobile ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5')}
          strokeWidth={2.6}
          aria-hidden="true"
        />
      ) : completed ? (
        <Check
          className={mobile ? 'h-5 w-5' : 'h-3.5 w-3.5'}
          strokeWidth={3.4}
          aria-hidden="true"
        />
      ) : locked ? (
        <LockKeyhole
          className={mobile ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5'}
          strokeWidth={2.8}
          aria-hidden="true"
        />
      ) : (
        <Icon
          className={mobile ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5'}
          strokeWidth={2.8}
          aria-hidden="true"
        />
      )}

      {mobile && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center font-semibold text-dd-text top-[calc(100%+7px)] w-[96px] text-[9px] leading-[1.08]"
        >
          {node.title}
        </span>
      )}
    </button>
  );
}

function MobilePath({
  path,
  nodes,
  selectedNodeId,
  selectedPathId,
  onSelectNode,
  onSelectPath,
  pathIndex,
}: {
  path: LearningPathSummary;
  nodes: KnowledgeMapNode[];
  selectedNodeId: string;
  selectedPathId: string;
  onSelectNode: (nodeId: string) => void;
  onSelectPath: (pathId: string) => void;
  pathIndex: number;
}) {
  const accent = getTrailSectorAccent(pathIndex, 4, path.accentColor);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const pathNodes = path.nodeIds
    .map((nodeId) => nodesById.get(nodeId))
    .filter((node): node is KnowledgeMapNode => Boolean(node));

  return (
    <section className="border-b border-dd-border/70 py-6 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelectPath(path.id)}
        aria-pressed={selectedPathId === path.id}
        className="dd-focus-ring flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span
            className="text-[9px] font-black uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            {getTrailSectorRegionLabel(pathIndex, 4)}
          </span>
          <span className="mt-1 block text-sm font-black text-dd-text">{path.title}</span>
        </span>
        <span className="text-xs font-black" style={{ color: accent }}>
          {path.progressPercent}%
        </span>
      </button>

      <div className="relative mt-6 flex flex-wrap items-start justify-center gap-x-10 gap-y-14 pb-5">
        <span
          aria-hidden="true"
          className="absolute left-[8%] right-[8%] top-[24px] h-1 rounded-full opacity-55"
          style={{ backgroundColor: accent }}
        />
        {pathNodes.map((node, nodeIndex) => (
          <GamifiedSkillNode
            key={`${path.id}-${node.id}`}
            placement={{
              node,
              path,
              sectorId: `${path.id}-mobile`,
              pathIndex,
              nodeIndex,
              stageIndex: 0,
              primary: true,
              stageLabel: MILESTONE_STAGES[0].label,
              StageIcon: MILESTONE_STAGES[0].Icon,
              rowIndex: 0,
              laneIndex: 0,
              laneCount: 1,
              point: HUB,
              accent,
            }}
            selected={selectedNodeId === node.id && selectedPathId === path.id}
            onSelect={() => {
              onSelectPath(path.id);
              onSelectNode(node.id);
            }}
            mobile
          />
        ))}
      </div>
    </section>
  );
}

function TrailMapLessonPopoverWrapper({
  placement,
  onClose,
}: {
  placement: PlacedNode;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);

  useTransformEffect(({ state }) => {
    if (state && typeof state.scale === 'number' && Math.abs(state.scale - scale) > 0.005) {
      setScale(state.scale);
    }
  });

  const inverseScale = 1 / Math.max(0.65, Math.min(1.3, scale));

  return (
    <div
      className="absolute pointer-events-auto z-50 transition-transform duration-75"
      style={{
        left: `${(placement.point.x / GRAPH_WIDTH) * 100}%`,
        top: `${(placement.point.y / GRAPH_HEIGHT) * 100}%`,
        transform: `scale(${inverseScale})`,
        transformOrigin: placement.point.y < 230 ? 'top center' : 'bottom center',
      }}
    >
      <TrailMapLessonPopover placement={placement} onClose={onClose} />
    </div>
  );
}

function TrailMapCameraController({
  targetPlacement,
}: {
  targetPlacement?: PlacedNode;
}) {
  const { zoomToElement } = useControls();
  const lastTargetKey = useRef<string | null>(null);

  useEffect(() => {
    if (!targetPlacement) return;
    const key = `${targetPlacement.sectorId}-${targetPlacement.node.id}`;
    if (lastTargetKey.current === key) return;
    lastTargetKey.current = key;

    const elementId = `skill-node-btn-${targetPlacement.sectorId}-${targetPlacement.node.slug}-${targetPlacement.stageIndex}`;
    const el = document.getElementById(elementId);
    if (el) {
      try {
        zoomToElement(el, 1.05, 300, 'easeOut');
      } catch {
        // ignore in environments without layout engines
      }
    }
  }, [targetPlacement, zoomToElement]);

  return null;
}

function TrailMapControls({ activePlacement }: { activePlacement?: PlacedNode }) {
  const { zoomIn, zoomOut, resetTransform, zoomToElement } = useControls();

  const handleFocusActiveNode = () => {
    if (!activePlacement) {
      resetTransform();
      return;
    }
    const elementId = `skill-node-btn-${activePlacement.sectorId}-${activePlacement.node.slug}-${activePlacement.stageIndex}`;
    const el = document.getElementById(elementId);
    if (el) {
      try {
        zoomToElement(el, 1.05, 250, 'easeOut');
      } catch {
        resetTransform();
      }
    } else {
      resetTransform();
    }
  };

  return (
    <div
      data-testid="trail-map-controls"
      className="absolute bottom-4 right-4 z-40 flex items-center gap-1 rounded-2xl border border-dd-border/80 bg-dd-card/95 p-1.5 shadow-lg backdrop-blur-md"
    >
      <button
        type="button"
        onClick={() => zoomIn(0.08)}
        aria-label="Aumentar zoom"
        title="Aumentar zoom"
        className="dd-focus-ring flex h-8 w-8 items-center justify-center rounded-xl text-dd-muted transition hover:bg-dd-surface hover:text-dd-text active:scale-95 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut(0.08)}
        aria-label="Diminuir zoom"
        title="Diminuir zoom"
        className="dd-focus-ring flex h-8 w-8 items-center justify-center rounded-xl text-dd-muted transition hover:bg-dd-surface hover:text-dd-text active:scale-95 cursor-pointer"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="h-4 w-px bg-dd-border mx-0.5" />
      <button
        type="button"
        onClick={handleFocusActiveNode}
        aria-label="Focar na lição atual"
        title="Focar na lição atual"
        className="dd-focus-ring flex h-8 w-8 items-center justify-center rounded-xl text-dd-muted transition hover:bg-dd-surface hover:text-dd-text active:scale-95 cursor-pointer"
      >
        <Target className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => resetTransform()}
        aria-label="Centralizar visualização"
        title="Centralizar visualização"
        className="dd-focus-ring flex h-8 w-8 items-center justify-center rounded-xl text-dd-muted transition hover:bg-dd-surface hover:text-dd-text active:scale-95 cursor-pointer"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
}

export function TrailMap({
  nodes,
  edges,
  paths,
  selectedNodeId,
  selectedPathId,
  onSelectNode,
  onSelectPath,
  onPreviewNode,
  onDismissNodePreview,
}: TrailMapProps) {
  const visualSectors = buildVisualSectors(paths);
  const placements = buildPlacedNodes(nodes, visualSectors);
  const placementsBySector = new Map(
    visualSectors.map((sector) => [
      sector.id,
      placements.filter((placement) => placement.sectorId === sector.id),
    ])
  );
  const firstSectorIndexByPath = new Map<string, number>();
  for (const sector of visualSectors) {
    if (!firstSectorIndexByPath.has(sector.path.id)) {
      firstSectorIndexByPath.set(sector.path.id, sector.sectorIndex);
    }
  }
  const firstPlacementByNode = new Map<string, PlacedNode>();
  for (const placement of placements) {
    if (!firstPlacementByNode.has(placement.node.id)) {
      firstPlacementByNode.set(placement.node.id, placement);
    }
  }
  const selectedPath = paths.find((path) => path.id === selectedPathId) ?? paths[0];
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const activePlacement =
    placements.find(
      (placement) =>
        placement.primary &&
        placement.node.id === selectedNodeId &&
        placement.path.id === selectedPathId
    ) ??
    placements.find((placement) => placement.node.id === selectedNodeId);

  const nextNode =
    nodes.find(
      (node) =>
        selectedPath?.nodeIds.includes(node.id) &&
        (node.status === 'RECOMMENDED' || node.status === 'AVAILABLE')
    ) ?? nodes[0];

  return (
    <section aria-labelledby="knowledge-map-title" className="h-full min-w-0">
      <h2 id="knowledge-map-title" className="sr-only">
        Mapa de Conhecimento por setores
      </h2>

      <div className="md:hidden" data-testid="knowledge-map-mobile-list">
        {paths.map((path, pathIndex) => (
          <MobilePath
            key={path.id}
            path={path}
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            selectedPathId={selectedPathId}
            onSelectNode={onSelectNode}
            onSelectPath={onSelectPath}
            pathIndex={pathIndex}
          />
        ))}
      </div>

      <div
        className="relative hidden h-full min-h-[560px] w-full min-w-0 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.05),transparent_60%)] md:block"
        data-testid="knowledge-map-graph"
      >
        <TransformWrapper
          initialScale={1}
          minScale={0.7}
          maxScale={1.25}
          centerOnInit
          limitToBounds={false}
          smooth={true}
          wheel={{ step: 0.04 }}
          pinch={{ step: 2 }}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: false }}
        >
          <TrailMapCameraController targetPlacement={activePlacement} />
          <TrailMapControls activePlacement={activePlacement} />
          <TransformComponent
            wrapperClass="!w-full !h-full select-none"
            contentClass="!w-[1400px] !h-[800px] relative"
          >
            <div
              className="relative h-[800px] w-[1400px]"
              onClick={() => setIsPopoverOpen(false)}
            >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Árvore de habilidades dividida em setores"
        >
          <g fill="none" opacity="0.2">
            {edges.map((edge) => {
              const source = firstPlacementByNode.get(edge.sourceNodeId);
              const target = firstPlacementByNode.get(edge.targetNodeId);
              if (!source || !target) return null;
              return (
                <path
                  key={edge.id}
                  data-relation={edge.relation}
                  d={`M ${source.point.x} ${source.point.y} Q ${HUB.x} ${HUB.y}, ${target.point.x} ${target.point.y}`}
                  stroke={RELATION_ACCENT[edge.relation]}
                  strokeWidth="1"
                  strokeDasharray="3 9"
                />
              );
            })}
          </g>

          {visualSectors.map((sector) => {
            const { path } = sector;
            const pathPlacements = placementsBySector.get(sector.id) ?? [];
            if (pathPlacements.length === 0) return null;
            const accent = sector.accent;
            const connections = buildSectorConnections(pathPlacements);
            return (
              <g key={sector.id}>
                {connections.map((connection, connectionIndex) => (
                  <path
                    key={`${sector.id}-connection-${connectionIndex}`}
                    d={`M ${connection.source.x} ${connection.source.y} L ${connection.target.x} ${connection.target.y}`}
                    fill="none"
                    stroke={accent}
                    strokeWidth={selectedPathId === path.id ? 2.2 : 1.4}
                    strokeLinecap="round"
                    opacity={selectedPathId === path.id ? 0.85 : 0.45}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {placements.map((placement) => (
          <GamifiedSkillNode
            key={`${placement.sectorId}-${placement.node.id}-${placement.nodeIndex}-${placement.stageIndex}`}
            placement={placement}
            selected={
              placement.primary &&
              selectedNodeId === placement.node.id &&
              selectedPathId === placement.path.id &&
              firstSectorIndexByPath.get(placement.path.id) === placement.pathIndex
            }
            onSelect={() => {
              onSelectPath(placement.path.id);
              onSelectNode(placement.node.id);
              setIsPopoverOpen(true);
            }}
          />
        ))}

        {activePlacement && isPopoverOpen && (
          <TrailMapLessonPopoverWrapper
            placement={activePlacement}
            onClose={() => setIsPopoverOpen(false)}
          />
        )}

        {visualSectors.map((sector) => {
          const { path } = sector;
          const point = sectorLabelPoint(sector.angle);
          const accent = sector.accent;
          const isVertical = Math.abs(Math.cos((sector.angle * Math.PI) / 180)) > 0.92;
          const isWest = sector.angle > 90 && sector.angle < 270;
          const isSelected = selectedPathId === path.id;
          const sectorPlacements = placementsBySector.get(sector.id) ?? [];
          const totalCount = sectorPlacements.length;
          const completedCount = sectorPlacements.filter(
            (placement) =>
              placement.node.status === 'COMPLETED' || placement.node.status === 'MASTERED'
          ).length;
          const progressPercent =
            totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          if (isVertical) {
            return (
              <button
                key={`${sector.id}-label`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectPath(path.id)}
                className={cn(
                  'dd-focus-ring absolute z-[60] -translate-x-1/2 -translate-y-1/2 rounded-2xl transition duration-150 select-none cursor-pointer',
                  'flex flex-col items-center justify-between py-4 px-1.5 min-h-[260px] w-[42px] bg-dd-card/95 hover:bg-dd-surface border border-dd-border/80 text-dd-text shadow-sm',
                  isSelected
                    ? 'shadow-[0_0_20px_-3px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_-3px_rgba(0,0,0,0.6)]'
                    : 'hover:border-dd-border hover:shadow-md'
                )}
                style={{
                  left: `${(point.x / GRAPH_WIDTH) * 100}%`,
                  top: `${(point.y / GRAPH_HEIGHT) * 100}%`,
                  borderColor: isSelected ? `${accent}cc` : undefined,
                  boxShadow: isSelected ? `0 0 20px ${accent}28` : undefined,
                }}
              >
                <div
                  className={cn(
                    'flex [writing-mode:vertical-rl] items-center gap-2.5 my-auto whitespace-nowrap',
                    isWest && 'rotate-180'
                  )}
                >
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    {sector.regionLabel}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-dd-muted/30 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-dd-text">
                    {sector.title}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex [writing-mode:vertical-rl] items-center whitespace-nowrap',
                    isWest && 'rotate-180'
                  )}
                >
                  <span className="text-[9.5px] font-semibold text-dd-muted tabular-nums">
                    {completedCount}/{totalCount} · {progressPercent}%
                  </span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={`${sector.id}-label`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectPath(path.id)}
              className={cn(
                'dd-focus-ring absolute z-[60] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-dd-card/95 hover:bg-dd-surface px-4 py-2 transition border border-dd-border/80 text-dd-text shadow-sm min-w-[270px] max-w-[340px] flex items-center justify-between gap-4 cursor-pointer select-none',
                isSelected
                  ? 'shadow-[0_0_20px_-3px_rgba(0,0,0,0.15)] dark:shadow-[0_0_20px_-3px_rgba(0,0,0,0.6)]'
                  : 'hover:border-dd-border hover:shadow-md'
              )}
              style={{
                left: `${(point.x / GRAPH_WIDTH) * 100}%`,
                top: `${(point.y / GRAPH_HEIGHT) * 100}%`,
                borderColor: isSelected ? `${accent}cc` : undefined,
                boxShadow: isSelected ? `0 0 20px ${accent}28` : undefined,
              }}
            >
              <div className="min-w-0 text-left">
                <span
                  className="block text-[9px] font-black uppercase tracking-[0.14em]"
                  style={{ color: accent }}
                >
                  {sector.regionLabel}
                </span>
                <span className="block text-xs font-bold uppercase tracking-wide text-dd-text truncate">
                  {sector.title}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-dd-muted tabular-nums shrink-0">
                {completedCount}/{totalCount} · {progressPercent}%
              </span>
            </button>
          );
        })}

        <div
          className="absolute z-40 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${(HUB.x / GRAPH_WIDTH) * 100}%`,
            top: `${(HUB.y / GRAPH_HEIGHT) * 100}%`,
          }}
        >
          <button
            type="button"
            aria-label="Início da jornada. Ir para a próxima habilidade disponível"
            onClick={(e) => {
              e.stopPropagation();
              if (nextNode) {
                onSelectNode(nextNode.id);
                setIsPopoverOpen(true);
              }
            }}
            className="dd-focus-ring pointer-events-auto flex h-16 w-16 items-center justify-center rounded-[22px] border-2 border-b-[6px] border-amber-200 border-b-amber-700 bg-amber-400 text-white shadow-[0_12px_28px_-12px_rgba(250,204,21,0.72)] transition hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <Crown
              className="h-8 w-8 fill-white drop-shadow-sm"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </button>
          <div className="mt-2 rounded-full border border-amber-500/40 bg-dd-card/95 px-3 py-1 text-center shadow-lg backdrop-blur-sm">
            <p className="text-xs font-bold leading-tight text-amber-600 dark:text-amber-300">
              Início
            </p>
            <p className="whitespace-nowrap text-[9px] font-medium leading-tight text-dd-muted">
              Jornada de programação
            </p>
          </div>
        </div>
      </div>
    </TransformComponent>
  </TransformWrapper>

  <div className="absolute bottom-3 left-3 z-20 pointer-events-none select-none">
          <div className="relative inline-block">
            {/* Mascot Leaning on top of Legenda */}
            <div className="absolute bottom-[calc(100%-10px)] left-0 z-0 w-24 drop-shadow-md">
              <Image
                src="/assets/trails/devdeck-robot-peeking.png"
                alt="Robô mascote do setor roxo"
                width={120}
                height={97}
                className="h-auto w-full object-contain"
                style={{ filter: 'hue-rotate(52deg) saturate(1.18)' }}
                priority
              />
            </div>

            {/* Legenda Box */}
            <div className="relative z-10 pointer-events-auto rounded-xl border border-dd-border/80 bg-dd-card/95 px-3 py-2.5 text-[9px] font-medium text-dd-muted shadow-sm backdrop-blur-xs">
              <p className="mb-2 text-[11px] font-bold text-dd-text">Legenda</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {visualSectors.slice(0, 6).map((sector) => (
                  <span key={sector.id} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: sector.accent }}
                    />
                    <span className="max-w-[90px] truncate text-dd-text">{sector.title}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
