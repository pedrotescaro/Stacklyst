'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Check,
  Clock3,
  Code2,
  FastForward,
  Gauge,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import type { TrailLevel } from '@/lib/trailsData';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';
import { getHighestJumpedSection } from '@/lib/trails/jump';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import {
  buildTrailCodeLessonId,
  buildTrailLessonId,
  CURRICULUM_BY_SLUG,
  getTrailCurriculum,
  type TrailActivityKind,
} from './trailCurriculum';
import { getSectionTheme, type TrailSectionTheme } from './trailTheme';
import { TrailMascot } from './TrailMascot';
import { rememberTrailMascotDeparture } from './trailMascotProgress';
import { TrailSectionNavigation, type TrailSectionView } from './TrailSectionNavigation';

/** Topo do primeiro nó de nível de cada unidade (abaixo da linha divisória). */
const FIRST_LEVEL_TOP = 96;
/** Espaçamento vertical entre os nós de nível. */
const LEVEL_SPACING = 360;
/** Distância entre cada atividade visual dentro de uma unidade. */
const INTERMEDIATE_NODE_OFFSET = 120;
/** Distância do último nível até o checkpoint. */
const CHECKPOINT_GAP = 260;
/** Altura do botão do checkpoint. */
const CHECKPOINT_BTN_H = 78;
/** Respiro abaixo do checkpoint até a próxima unidade. */
const UNIT_BOTTOM_PAD = 170;
const ACTIVITIES_PER_ROUTE = 32;
const EMPTY_COMPLETED_LESSON_IDS: readonly string[] = [];
const INCOMPLETE_NODE_CLASS = 'border-b-[6px] border-[#202b33] bg-[#37464f] text-[#77858d]';
const INCOMPLETE_CHEST_FILTER = 'grayscale(1) saturate(0) brightness(0.72)';

interface TrailMilestone extends TrailLevel {
  nodeId: string;
  completed: boolean;
  accessible: boolean;
  sectionUnitNumber: number;
  activityKind: TrailActivityKind;
  sectionDescription: string;
  baseXp: number;
  difficulty: number;
  estimatedMinutes: number | null;
  challengeExerciseId?: string;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function chestTintFilter(targetHex: string): string {
  const source = hexToHsl('#3b82f6');
  const target = hexToHsl(targetHex);

  const hue = target.h - source.h;
  const sat = source.s > 0 ? target.s / source.s : 1;
  const light = source.l > 0 ? target.l / source.l : 1;

  return `hue-rotate(${hue.toFixed(1)}deg) saturate(${sat.toFixed(3)}) brightness(${light.toFixed(3)})`;
}

interface UnitBlock {
  unitNumber: number;
  levels: TrailMilestone[];
  theme: TrailSectionTheme;
  height: number;
  checkpointTop: number;
}

interface ActiveActivityAnchor {
  anchorId: string;
}

function LessonStars({ level }: { level?: TrailMilestone }) {
  const count = 3;

  return (
    <div
      role="img"
      aria-label={
        level?.completed ? '3 de 3 estrelas conquistadas' : '0 de 3 estrelas conquistadas'
      }
      data-testid="trail-lesson-stars"
      className="mb-1.5 flex h-6 items-end justify-center gap-1"
    >
      {Array.from({ length: count }).map((_, index) => {
        const earned = level?.completed === true;
        const middle = index === 1;

        return (
          <Star
            key={index}
            aria-hidden="true"
            className={`${
              middle ? 'h-5 w-5 -translate-y-1' : 'h-4 w-4'
            } transition-all duration-200 ${
              earned
                ? 'fill-[#ffc800] text-[#ffc800] drop-shadow-[0_1px_6px_rgba(255,200,0,0.65)]'
                : 'fill-[#4b5563] text-[#4b5563]'
            }`}
          />
        );
      })}
    </div>
  );
}

function TrailActivityPopup({
  level,
  theme,
  onClose,
  onStart,
  align = 'center',
}: {
  level: TrailMilestone;
  theme: TrailSectionTheme;
  onClose: () => void;
  onStart: () => void;
  align?: 'center' | 'start' | 'end';
}) {
  const { text } = useLocalizedText();
  const actionLabel = level.completed ? text('Revisar', 'Review') : text('Praticar', 'Practice');
  const popupPositionClass =
    align === 'start'
      ? '-left-2 sm:left-0'
      : align === 'end'
        ? '-right-2 sm:right-0'
        : 'left-1/2 -translate-x-1/2';
  const arrowPositionClass =
    align === 'start'
      ? 'left-[38px] sm:left-[30px]'
      : align === 'end'
        ? 'right-[38px] sm:right-[30px]'
        : 'left-1/2 -translate-x-1/2';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`trail-activity-title-${level.levelNumber}`}
      data-testid="trail-activity-popup"
      className={`absolute top-[calc(100%+18px)] z-50 w-[min(344px,calc(100vw-32px))] rounded-2xl p-4 text-left text-white animate-in fade-in zoom-in-95 duration-150 ${popupPositionClass}`}
      style={{
        backgroundColor: theme.borderHex,
        boxShadow: `0 5px 0 color-mix(in srgb, ${theme.borderHex} 72%, #000), 0 20px 48px rgba(0, 0, 0, 0.42)`,
      }}
    >
      <span
        aria-hidden="true"
        className={`absolute -top-2 h-4 w-4 rotate-45 ${arrowPositionClass}`}
        style={{ backgroundColor: theme.borderHex }}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar atividade"
        className="dd-focus-ring absolute right-3 top-3 cursor-pointer rounded-lg p-1 text-white/75 transition hover:bg-black/15 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <h2
        id={`trail-activity-title-${level.levelNumber}`}
        className="max-w-[calc(100%-32px)] text-lg font-black leading-tight text-white"
      >
        {level.title}
      </h2>
      <p className="mt-2 text-sm font-bold leading-relaxed text-white/90">{level.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-wide text-white/90">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {level.baseXp} XP
        </span>
        {level.estimatedMinutes && (
          <span className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            {level.estimatedMinutes} min
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          {text('Nível', 'Level')} {level.difficulty}/5
        </span>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="dd-focus-ring mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wide transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
        style={{ color: theme.borderHex, boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2)' }}
      >
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        {actionLabel} +{level.baseXp} XP
      </button>
    </div>
  );
}

function TrailJumpPopup({
  section,
  theme,
  onClose,
  onStart,
}: {
  section: TrailSectionView;
  theme: TrailSectionTheme;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={`trail-jump-title-${section.number}`}
        data-testid="trail-jump-popup"
        className="absolute left-1/2 top-[calc(100%+18px)] z-50 w-[min(356px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl p-4 text-left text-white animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: theme.borderHex,
          boxShadow: `0 5px 0 color-mix(in srgb, ${theme.borderHex} 72%, #000), 0 20px 48px rgba(0, 0, 0, 0.42)`,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
          style={{ backgroundColor: theme.borderHex }}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar desafio de salto"
          className="dd-focus-ring absolute right-3 top-3 cursor-pointer rounded-lg p-1 text-white/75 transition hover:bg-black/15 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
          <h2
            id={`trail-jump-title-${section.number}`}
            className="pr-6 text-lg font-black leading-tight text-white"
          >
            Pular para a Seção {section.number}?
          </h2>
        </div>
        <p className="mt-1 text-xs font-bold text-white/95">{section.title}</p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-white/90">
          Para começar aqui, conclua o primeiro exercício desta seção em modo Difícil. O desafio não
          oferece autocomplete nem dicas e mantém os testes ocultos do Submit.
        </p>

        <div className="mt-3 border-y border-white/20 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/80">
            O que esta seção cobre
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {section.levels.map((level) => (
              <li
                key={level.levelNumber}
                className="flex items-center gap-1.5 text-xs font-bold text-white truncate"
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-white/85" aria-hidden="true" />
                <span className="truncate">{level.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-2.5 text-[11px] font-medium leading-relaxed text-white/85">
          Passar no desafio libera esta seção, mas não marca as anteriores como concluídas. Você
          poderá voltar para revisá-las quando quiser.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="dd-focus-ring flex-1 cursor-pointer rounded-xl bg-black/15 px-3 py-2.5 text-center text-xs font-black text-white transition hover:bg-black/25 active:translate-y-0"
          >
            Continuar de onde estou
          </button>
          <button
            type="button"
            onClick={onStart}
            className="dd-focus-ring flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0"
            style={{
              color: theme.borderHex,
              boxShadow: '0 4px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            Fazer desafio de entrada
            <FastForward className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
          </button>
        </div>
      </div>
    </>
  );
}

interface TrailPathViewProps {
  activeLanguage: string;
  nodes: KnowledgeMapNode[];
  paths: LearningPathSummary[];
  selectedNodeId: string;
  selectedPathId: string;
  onSelectNode: (nodeId: string) => void;
  onSelectPath: (pathId: string) => void;
  onSelectExercise?: (lessonId: string, returnTo: string) => void;
  initialSectionNumber?: number;
  jumpUnlockIds?: readonly string[];
  completedLessonIds?: readonly string[];
}

function isCompleted(node: KnowledgeMapNode) {
  return node.status === 'COMPLETED' || node.status === 'MASTERED';
}

function isAccessible(node: KnowledgeMapNode) {
  const hasRequiredBlocker = node.prerequisites.some(
    (prerequisite) => prerequisite.relation === 'REQUIRED' && !prerequisite.completed
  );
  return !hasRequiredBlocker && node.exercises.length > 0;
}

function buildRouteMilestones(
  path: LearningPathSummary,
  nodes: KnowledgeMapNode[],
  activeLanguage = 'js',
  completedLessons: Set<string> = new Set()
) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const pathNodes = path.nodeIds
    .map((nodeId) => nodesById.get(nodeId))
    .filter((node): node is KnowledgeMapNode => Boolean(node));

  if (pathNodes.length === 0) return [];

  const curriculum = getTrailCurriculum(path);
  const hasDedicatedCurriculum = Boolean(CURRICULUM_BY_SLUG[path.slug]);

  return Array.from({ length: ACTIVITIES_PER_ROUTE }, (_, index) => {
    const nodeIndex = Math.min(
      pathNodes.length - 1,
      Math.floor((index * pathNodes.length) / ACTIVITIES_PER_ROUTE)
    );
    const node = pathNodes[nodeIndex]!;
    const sectionIndex = Math.floor(index / 4);
    const unitIndex = index % 4;
    const section = curriculum.sections[sectionIndex]!;
    const curriculumUnit = section.units[unitIndex]!;
    const exercise = node.exercises[index % Math.max(1, node.exercises.length)];
    const sectionNumber = sectionIndex + 1;
    const unitNumber = unitIndex + 1;
    const lessonId = buildTrailLessonId(activeLanguage, path.slug, sectionNumber, unitNumber);

    const isLessonFinished =
      completedLessons.has(lessonId) ||
      (!hasDedicatedCurriculum &&
        (completedLessons.has(`${activeLanguage.toLowerCase()}-l${index + 1}`) ||
          completedLessons.has(node.id) ||
          completedLessons.has(curriculumUnit.title) ||
          isCompleted(node)));

    const prevLessonId =
      index > 0
        ? `${activeLanguage.toLowerCase()}-${path.slug}-s${Math.floor((index - 1) / 4) + 1}-u${((index - 1) % 4) + 1}`
        : '';
    const prevFinished =
      index === 0 ||
      completedLessons.has(prevLessonId) ||
      (!hasDedicatedCurriculum &&
        (completedLessons.has(`${activeLanguage.toLowerCase()}-l${index}`) ||
          completedLessons.has(`level-${index}`)));

    const accessible = index === 0 || prevFinished || isAccessible(node);

    return {
      levelNumber: index + 1,
      title: curriculumUnit.title,
      description: curriculumUnit.description,
      unitNumber: sectionNumber,
      unitTitle: section.title,
      sectionName: curriculum.title,
      sectionDescription: section.goal,
      activityKind: curriculumUnit.kind,
      baseXp: exercise?.baseXp ?? node.xpReward,
      difficulty: exercise?.difficulty ?? node.difficulty,
      estimatedMinutes: exercise?.estimatedMinutes ?? node.estimatedMinutes,
      challengeExerciseId: exercise?.slug,
      nodeId: node.id,
      completed: isLessonFinished,
      accessible,
      sectionUnitNumber: unitNumber,
      questions: [
        {
          id: lessonId,
          question: curriculumUnit.title,
          options: [],
          correctIndex: 0,
        },
      ],
    } satisfies TrailMilestone;
  });
}

function buildCodingMilestone(
  sourceLevel: TrailMilestone,
  pathSlug: string,
  activeLanguage: string,
  challengeSlot: 1 | 2,
  completedLessons: Set<string>
): TrailMilestone {
  const curriculumUnitNumber = ((sourceLevel.levelNumber - 1) % 4) + 1;
  const lessonId = buildTrailCodeLessonId(
    activeLanguage,
    pathSlug,
    sourceLevel.unitNumber,
    curriculumUnitNumber,
    challengeSlot
  );

  return {
    ...sourceLevel,
    levelNumber: 1000 + sourceLevel.levelNumber * 2 + challengeSlot,
    title: `Código: ${sourceLevel.title} · ${challengeSlot}`,
    description: `Resolva um desafio de programação exclusivo sobre ${sourceLevel.title}, com entrada, saída e casos de teste próprios.`,
    activityKind: 'Prática',
    baseXp: 35,
    difficulty: Math.min(5, sourceLevel.difficulty + 1),
    estimatedMinutes: 12,
    completed: completedLessons.has(lessonId),
    accessible: sourceLevel.accessible || sourceLevel.completed,
    questions: [
      {
        id: lessonId,
        question: `Desafio de programação: ${sourceLevel.title}`,
        options: [],
        correctIndex: 0,
      },
    ],
  };
}

function buildRouteSections(levels: TrailMilestone[]): TrailSectionView[] {
  return Array.from({ length: 8 }, (_, index) => {
    const number = index + 1;
    const sectionLevels = levels.filter((level) => level.unitNumber === number);
    const completedUnits = sectionLevels.filter((level) => level.completed).length;

    return {
      number,
      name: sectionLevels[0]?.sectionName ?? `Seção ${number}`,
      title: sectionLevels[0]?.unitTitle ?? `Seção ${number}`,
      description: sectionLevels[0]?.sectionDescription,
      levels: sectionLevels,
      completedUnits,
      completed: sectionLevels.length > 0 && completedUnits === sectionLevels.length,
      unlocked: sectionLevels.some((level) => level.accessible || level.completed),
    };
  });
}

export function TrailPathView({
  activeLanguage,
  nodes,
  paths,
  selectedNodeId,
  selectedPathId,
  onSelectNode,
  onSelectPath,
  onSelectExercise,
  initialSectionNumber = 1,
  jumpUnlockIds = [],
  completedLessonIds = EMPTY_COMPLETED_LESSON_IDS,
}: TrailPathViewProps) {
  const router = useRouter();
  const { text } = useLocalizedText();
  const rootRef = useRef<HTMLDivElement>(null);
  const trailMapRef = useRef<HTMLDivElement>(null);
  const initialSection = Math.min(8, Math.max(1, Math.trunc(initialSectionNumber)));
  const previousPathIdRef = useRef(selectedPathId);
  const [activeSectionView, setActiveSectionView] = useState<'trail' | 'sections'>('trail');
  const [selectedSectionNumber, setSelectedSectionNumber] = useState<number>(initialSection);
  const [selectedUnitNumber, setSelectedUnitNumber] = useState<number>(1);
  const [activeActivity, setActiveActivity] = useState<ActiveActivityAnchor | null>(null);
  const [jumpTargetSectionNumber, setJumpTargetSectionNumber] = useState<number | null>(null);
  const [claimedChestIds, setClaimedChestIds] = useState<Set<string>>(() => new Set());
  const [claimingChestId, setClaimingChestId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    () => new Set(completedLessonIds)
  );

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('stacklyst-completed-lessons') || '[]');
      if (Array.isArray(saved)) {
        setCompletedLessons(new Set([...completedLessonIds, ...saved]));
      }
    } catch {
      setCompletedLessons(new Set(completedLessonIds));
    }
  }, [completedLessonIds]);

  const [rewardModal, setRewardModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    xp: number;
    unlocked: boolean;
    theme: TrailSectionTheme;
  }>({
    open: false,
    title: '',
    description: '',
    xp: 0,
    unlocked: false,
    theme: getSectionTheme(1),
  });

  const [infoModal, setInfoModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    level?: TrailMilestone;
  }>({
    open: false,
    title: '',
    description: '',
  });

  const activePath = paths.find((path) => path.id === selectedPathId) ?? paths[0];

  const allLevels = useMemo(
    () =>
      activePath ? buildRouteMilestones(activePath, nodes, activeLanguage, completedLessons) : [],
    [activeLanguage, activePath, completedLessons, nodes]
  );

  const baseSections: TrailSectionView[] = useMemo(() => {
    return buildRouteSections(allLevels);
  }, [allLevels]);

  const progressSectionNumber =
    baseSections.find((section) => !section.completed)?.number ?? baseSections.at(-1)?.number ?? 1;
  const persistedJumpSectionNumber = activePath
    ? getHighestJumpedSection(jumpUnlockIds, activeLanguage, activePath.slug)
    : 1;
  const unlockedThroughSection = Math.max(progressSectionNumber, persistedJumpSectionNumber);
  const sections = useMemo(
    () =>
      baseSections.map((section) => ({
        ...section,
        unlocked: section.number <= unlockedThroughSection,
      })),
    [baseSections, unlockedThroughSection]
  );

  const routeOptions = useMemo(
    () =>
      paths.map((path) => {
        const milestones = buildRouteMilestones(path, nodes, activeLanguage, completedLessons);
        return {
          id: path.id,
          title: path.title,
          description: path.description,
          accentColor: path.accentColor,
          completedUnits: milestones.filter((milestone) => milestone.completed).length,
          totalUnits: ACTIVITIES_PER_ROUTE,
        };
      }),
    [activeLanguage, completedLessons, nodes, paths]
  );

  useEffect(() => {
    if (previousPathIdRef.current === selectedPathId) return;
    previousPathIdRef.current = selectedPathId;
    setSelectedSectionNumber(1);
    setSelectedUnitNumber(1);
    setActiveActivity(null);
  }, [selectedPathId]);

  useEffect(() => {
    if (initialSection <= 1 || activeSectionView !== 'trail') return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`trail-section-${initialSection}`)?.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeSectionView, initialSection]);

  useEffect(() => {
    if (activeSectionView !== 'trail' || typeof IntersectionObserver === 'undefined') return;

    const markers = Array.from(
      document.querySelectorAll<HTMLElement>('[data-trail-progress-marker="true"]')
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const nearest = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - 190) - Math.abs(b.boundingClientRect.top - 190)
          )[0];
        const marker = nearest?.target as HTMLElement | undefined;
        const sectionNumber = Number(marker?.dataset.sectionNumber);
        const unitNumber = Number(marker?.dataset.unitNumber);

        if (Number.isInteger(sectionNumber) && sectionNumber > 0) {
          setSelectedSectionNumber(sectionNumber);
        }
        if (Number.isInteger(unitNumber) && unitNumber > 0) {
          setSelectedUnitNumber(unitNumber);
        }
      },
      { rootMargin: '-180px 0px -55% 0px', threshold: 0 }
    );

    markers.forEach((marker) => observer.observe(marker));
    return () => observer.disconnect();
  }, [activePath.id, activeSectionView]);

  const isLevelAccessible = (level: TrailMilestone) => level.accessible || level.completed;

  const units = useMemo<UnitBlock[]>(() => {
    const groups = new Map<number, TrailMilestone[]>();
    for (const level of allLevels) {
      const list = groups.get(level.unitNumber) ?? [];
      list.push(level);
      groups.set(level.unitNumber, list);
    }

    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([unitNumber, unitLevels]) => {
        const levelCount = unitLevels.length;
        const checkpointTop =
          FIRST_LEVEL_TOP + Math.max(0, levelCount - 1) * LEVEL_SPACING + CHECKPOINT_GAP;
        const height = checkpointTop + CHECKPOINT_BTN_H + UNIT_BOTTOM_PAD;
        return {
          unitNumber,
          levels: unitLevels,
          theme: getSectionTheme(unitNumber),
          height,
          checkpointTop,
        };
      });
  }, [allLevels]);

  const firstUnitNumber = units[0]?.unitNumber ?? 1;
  const currentMascotNodeKey =
    allLevels.find((level) => !level.completed)?.questions[0]?.id ??
    allLevels.at(-1)?.questions[0]?.id ??
    '';
  const mascotProgressKey = `${activeLanguage.toLowerCase()}:${activePath.slug}`;
  const currentSection = sections.find((s) => s.number === selectedSectionNumber) ?? sections[0];
  const currentUnit = currentSection?.levels[selectedUnitNumber - 1];
  const jumpTargetSection = sections.find((section) => section.number === jumpTargetSectionNumber);

  const handleRequestJump = (sectionNumber: number) => {
    setActiveActivity(null);
    if (sectionNumber <= unlockedThroughSection) {
      setSelectedSectionNumber(sectionNumber);
      setSelectedUnitNumber(1);
      setActiveSectionView('trail');
      requestAnimationFrame(() => {
        document.getElementById(`trail-section-${sectionNumber}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
      return;
    }

    setJumpTargetSectionNumber(sectionNumber);
  };

  const startJumpChallenge = () => {
    const targetSection = jumpTargetSection;
    const targetLevel = targetSection?.levels[0] as TrailMilestone | undefined;
    const exerciseId = targetLevel?.challengeExerciseId;

    if (!activePath || !targetSection || !targetLevel || !exerciseId) {
      setJumpTargetSectionNumber(null);
      setInfoModal({
        open: true,
        title: 'Desafio ainda indisponível',
        description:
          'Esta seção ainda não possui um exercício avaliável para comprovar o salto. Continue pela seção atual.',
      });
      return;
    }

    const search = new URLSearchParams({
      challenge: 'jump',
      path: activePath.slug,
      section: String(targetSection.number),
      language: activeLanguage,
    });
    router.push(`/lesson/${exerciseId}?${search.toString()}`);
  };

  const showActivityPreview = (level: TrailMilestone, accessible: boolean, anchorId: string) => {
    if (accessible && level.unitNumber <= unlockedThroughSection && level.questions.length > 0) {
      setActiveActivity({ anchorId });
    }
  };

  const hideActivityPreview = (anchorId: string) => {
    setActiveActivity((current) => (current?.anchorId === anchorId ? null : current));
  };

  const handleLevelClick = (
    level: TrailMilestone,
    accessible: boolean,
    anchorId = `trail-level-${level.levelNumber}`
  ) => {
    if (level.unitNumber > unlockedThroughSection) {
      handleRequestJump(level.unitNumber);
      return;
    }

    onSelectPath(activePath?.id ?? selectedPathId);
    onSelectNode(level.nodeId);
    setSelectedSectionNumber(level.unitNumber);
    setSelectedUnitNumber(level.sectionUnitNumber);

    if (!accessible) {
      setActiveActivity(null);
      setInfoModal({
        open: true,
        title: 'Unidade Bloqueada',
        description:
          'Complete as lições anteriores para liberar esta unidade e avançar na sua trilha!',
      });
      return;
    }

    const firstQuestion = level.questions[0];
    if (firstQuestion) {
      setActiveActivity({ anchorId });
    } else {
      setInfoModal({
        open: true,
        title: level.title,
        description: level.description || 'Lição pronta para praticar.',
        level,
      });
    }
  };

  const startActivity = (level: TrailMilestone) => {
    const firstQuestion = level.questions[0];
    if (!firstQuestion) return;

    setActiveActivity(null);
    rememberTrailMascotDeparture(mascotProgressKey, firstQuestion.id);
    const returnParams = new URLSearchParams({
      view: 'trail',
      path: activePath.slug,
      section: String(level.unitNumber),
      language: activeLanguage,
    });
    const returnTo = `/trails?${returnParams.toString()}`;
    if (onSelectExercise) {
      onSelectExercise(firstQuestion.id, returnTo);
    } else {
      router.push(`/lesson/${firstQuestion.id}?returnTo=${encodeURIComponent(returnTo)}`);
    }
  };

  const handleCheckpointClick = (unitNumber: number) => {
    const section = sections.find((candidate) => candidate.number === unitNumber);
    setInfoModal({
      open: true,
      title: section?.completed ? `Checkpoint da Seção ${unitNumber}` : 'Checkpoint bloqueado',
      description: section?.completed
        ? 'Seção concluída. O checkpoint está pronto para sua revisão final de código.'
        : 'Conclua as quatro unidades desta seção para liberar o checkpoint.',
    });
  };

  const handleOpenChestReward = async (
    chestId: string,
    unlocked: boolean,
    unitTheme: TrailSectionTheme,
    unitNumber: number
  ) => {
    if (!unlocked) {
      setRewardModal({
        open: true,
        title: 'Baú Bloqueado',
        description:
          'Complete as lições anteriores da trilha para desbloquear e abrir este baú de bônus!',
        xp: 50,
        unlocked: false,
        theme: unitTheme,
      });
      return;
    }

    if (claimingChestId) return;
    setClaimingChestId(chestId);

    try {
      const response = await fetch('/api/trails/chest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathId: activePath?.id,
          language: activeLanguage,
          unitNumber,
        }),
      });

      if (!response.ok) throw new Error('Não foi possível resgatar o baú.');
      const result = (await response.json()) as { xpEarned: number };
      setClaimedChestIds((current) => new Set(current).add(chestId));
      setRewardModal({
        open: true,
        title: result.xpEarned > 0 ? 'Baú de recompensa resgatado!' : 'Baú já resgatado',
        description:
          result.xpEarned > 0
            ? 'Seu progresso foi salvo e o XP bônus já foi adicionado ao perfil.'
            : 'A recompensa desta seção já tinha sido adicionada ao seu perfil.',
        xp: result.xpEarned,
        unlocked: true,
        theme: unitTheme,
      });
      router.refresh();
    } catch {
      setInfoModal({
        open: true,
        title: 'Não foi possível abrir o baú',
        description: 'Tente novamente em alguns instantes. Seu progresso continua salvo.',
      });
    } finally {
      setClaimingChestId(null);
    }
  };

  if (!activePath || allLevels.length === 0) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-dashed border-dd-border bg-dd-card p-8 text-center">
        <Trophy className="mx-auto h-8 w-8 text-dd-muted" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-black text-dd-text">
          {text('Trilha em preparação', 'Trail in preparation')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-dd-muted">
          O curso de {activeLanguage} ainda não possui um rumo publicado.
        </p>
      </section>
    );
  }

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[680px] px-2 py-4 sm:px-4">
      {/* Top Section Navigation */}
      {currentSection && (
        <div data-testid="trail-section-sticky-header" className="sticky top-0 z-30 mb-6 md:top-2">
          <TrailSectionNavigation
            view={activeSectionView}
            sectionNumber={currentSection.number}
            unitNumber={selectedUnitNumber}
            title={currentUnit?.title ?? currentSection.title}
            sections={sections}
            routes={routeOptions}
            selectedRouteId={activePath.id}
            onSelectRoute={onSelectPath}
            onOpenSections={() => {
              setActiveSectionView('sections');
              requestAnimationFrame(() => {
                rootRef.current?.parentElement?.scrollTo?.({ top: 0, behavior: 'smooth' });
              });
            }}
            onBack={() => setActiveSectionView('trail')}
            onRequestJump={handleRequestJump}
            onSelectSection={(secNum) => {
              setSelectedSectionNumber(secNum);
              setSelectedUnitNumber(1);
              setActiveSectionView('trail');
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (secNum === 1) {
                    rootRef.current?.parentElement?.scrollTo?.({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  document.getElementById(`trail-section-${secNum}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                });
              });
            }}
          />
        </div>
      )}

      {activeSectionView === 'trail' && (
        <div ref={trailMapRef} data-testid="trail-path-map" className="relative w-full">
          {units.map((unit) => {
            const { unitNumber, theme, levels, height, checkpointTop } = unit;
            const levelCount = levels.length;
            const checkpointCompleted =
              levels.length > 0 && levels.every((level) => level.completed);
            const chestId = `trail-chest-${activeLanguage.toLowerCase()}-${activePath.slug}-s${unitNumber}`;
            const chestClaimed = claimedChestIds.has(chestId);
            const lastLevel = levels[levelCount - 1];
            const lastLevelTop = checkpointTop - CHECKPOINT_GAP;
            const finalCodeChallenge = lastLevel
              ? buildCodingMilestone(
                  lastLevel,
                  activePath.slug,
                  activeLanguage,
                  1,
                  completedLessons
                )
              : undefined;
            const finalCodeAccessible = finalCodeChallenge
              ? isLevelAccessible(finalCodeChallenge)
              : false;
            const finalCodeAnchorId = finalCodeChallenge
              ? `trail-code-${finalCodeChallenge.questions[0]?.id}`
              : '';
            const secondLevel = levels[1];
            const chestUnlocked = Boolean(secondLevel && secondLevel.completed);
            const chestTop = Math.min(
              FIRST_LEVEL_TOP + LEVEL_SPACING + INTERMEDIATE_NODE_OFFSET,
              checkpointTop - 240
            );

            return (
              <div
                key={unitNumber}
                id={`trail-section-${unitNumber}`}
                className="relative scroll-mt-40"
                style={{ height }}
              >
                {/* Linha divisória com o texto da unidade */}
                <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1] flex items-center gap-3">
                  <span aria-hidden="true" className="h-px flex-1 bg-dd-border" />
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-dd-text sm:text-xs">
                    {levels[0]?.unitTitle ?? `Seção ${unitNumber}`}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-dd-border" />
                </div>

                {/* Robot Mascot 1 (Top Right) */}
                <div
                  data-testid="trail-robot"
                  className="pointer-events-none absolute right-0 top-[35px] z-[3] h-[92px] w-[92px] select-none transition-all sm:-right-4 sm:h-28 sm:w-28 md:-right-8 md:h-[115px] md:w-[115px] lg:-right-12"
                >
                  <Image
                    src="/assets/trails/blue-devdeck-robot.png"
                    alt="Robô mascote digitando"
                    fill
                    sizes="(min-width: 768px) 115px, (min-width: 640px) 112px, 92px"
                    className="object-contain drop-shadow-md"
                    style={{ filter: chestTintFilter(theme.primaryHex) }}
                    priority={unitNumber === firstUnitNumber}
                  />
                </div>

                {/* Robot Mascot 2 (Middle Left - Gaming/Typing pose) */}
                <div
                  data-testid="trail-robot-gaming"
                  className="pointer-events-none absolute left-0 top-[37%] z-[3] h-20 w-20 select-none transition-all sm:-left-4 sm:h-28 sm:w-28 md:-left-8 md:h-[115px] md:w-[115px] lg:-left-12"
                >
                  <Image
                    src="/assets/trails/blue-devdeck-robot-gaming.png"
                    alt="Robô mascote com headset"
                    fill
                    sizes="(min-width: 768px) 115px, (min-width: 640px) 112px, 80px"
                    className="object-contain drop-shadow-md"
                    style={{ filter: chestTintFilter(theme.primaryHex) }}
                  />
                </div>

                {/* Nós de nível + passos */}
                {levels.map((level, i) => {
                  const top = FIRST_LEVEL_TOP + i * LEVEL_SPACING;
                  const isFirstTrailLevel = unitNumber === firstUnitNumber && i === 0;
                  const accessible = isLevelAccessible(level);
                  const completed = level.completed;
                  const started = completed || selectedNodeId === level.nodeId;
                  const nextLevel = levels[i + 1];
                  const codeChallengeOne = buildCodingMilestone(
                    level,
                    activePath.slug,
                    activeLanguage,
                    1,
                    completedLessons
                  );
                  const codeChallengeTwo = buildCodingMilestone(
                    level,
                    activePath.slug,
                    activeLanguage,
                    2,
                    completedLessons
                  );
                  const codeOneAccessible = isLevelAccessible(codeChallengeOne);
                  const codeTwoAccessible = isLevelAccessible(codeChallengeTwo);
                  const leftSide = i % 2 === 0;
                  const isJumpTarget = unitNumber > unlockedThroughSection;
                  const usesSectionColor = completed || i === 0;
                  const mainAnchorId = `trail-level-${level.levelNumber}`;
                  const firstStepAnchorId = nextLevel
                    ? `trail-code-${codeChallengeOne.questions[0]?.id}`
                    : '';
                  const secondStepAnchorId = nextLevel
                    ? `trail-code-${codeChallengeTwo.questions[0]?.id}`
                    : '';
                  const isJumpPopupOpen =
                    isJumpTarget && jumpTargetSectionNumber === unitNumber && i === 0;
                  const activityPopupOpen = activeActivity?.anchorId === mainAnchorId;
                  const firstStepPopupOpen = activeActivity?.anchorId === firstStepAnchorId;
                  const secondStepPopupOpen = activeActivity?.anchorId === secondStepAnchorId;

                  return (
                    <Fragment key={level.levelNumber}>
                      {/* Nó de nível */}
                      <div
                        id={mainAnchorId}
                        data-trail-progress-marker="true"
                        data-section-number={unitNumber}
                        data-unit-number={i + 1}
                        className={`absolute flex -translate-x-1/2 flex-col items-center text-center ${
                          activityPopupOpen || isJumpPopupOpen ? 'z-20' : 'z-10'
                        }`}
                        style={{ left: '50%', top }}
                        onMouseEnter={() => showActivityPreview(level, accessible, mainAnchorId)}
                        onMouseLeave={() => hideActivityPreview(mainAnchorId)}
                      >
                        {/* Ação de início ou salto no primeiro nó da seção */}
                        {i === 0 && !completed && (
                          <button
                            type="button"
                            onClick={() =>
                              isJumpTarget
                                ? handleRequestJump(unitNumber)
                                : handleLevelClick(level, accessible, mainAnchorId)
                            }
                            aria-label={
                              isJumpTarget
                                ? `Pular para a seção ${unitNumber}: ${level.unitTitle}`
                                : `Começar a seção ${unitNumber}: ${level.unitTitle}`
                            }
                            className="dd-focus-ring absolute -top-10 left-1/2 z-20 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded-lg border border-dd-border bg-dd-surface px-2.5 py-2 text-[10px] font-black uppercase leading-none shadow-md transition hover:-translate-y-0.5 hover:bg-dd-card"
                            style={{ color: theme.primaryHex }}
                          >
                            {isJumpTarget ? 'Pular para cá' : 'Começar aqui'}
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-dd-border bg-dd-surface"
                            />
                          </button>
                        )}
                        <LessonStars level={level} />
                        <button
                          type="button"
                          data-testid="trail-main-node"
                          data-trail-waypoint="true"
                          data-trail-mascot-node={level.questions[0]?.id}
                          data-trail-mascot-completed={completed ? 'true' : 'false'}
                          disabled={!accessible}
                          onClick={() => handleLevelClick(level, accessible, mainAnchorId)}
                          aria-label={`Seção ${unitNumber}, unidade ${i + 1}: ${level.activityKind}: ${level.title}`}
                          data-progress-appearance={usesSectionColor ? 'section' : 'incomplete'}
                          className={`group dd-focus-ring relative flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-md transition-all duration-150 enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:active:translate-y-[4px] ${
                            usesSectionColor ? theme.nodeButtonClass : INCOMPLETE_NODE_CLASS
                          }`}
                        >
                          {i === 0 && isFirstTrailLevel ? (
                            started ? (
                              <Check className="h-7 w-7" strokeWidth={3.2} />
                            ) : (
                              <FastForward
                                className="h-7 w-7"
                                fill="currentColor"
                                strokeWidth={0}
                              />
                            )
                          ) : completed ? (
                            <Check className="h-7 w-7" strokeWidth={3.2} />
                          ) : !accessible ? (
                            <Lock className="h-6 w-6" strokeWidth={2.6} />
                          ) : (
                            <BookOpen
                              data-testid="trail-book-icon"
                              aria-hidden="true"
                              className="h-7 w-7"
                              strokeWidth={2.7}
                            />
                          )}
                        </button>

                        {activityPopupOpen && (
                          <TrailActivityPopup
                            level={level}
                            theme={theme}
                            onClose={() => setActiveActivity(null)}
                            onStart={() => startActivity(level)}
                          />
                        )}

                        {isJumpPopupOpen && jumpTargetSection && (
                          <TrailJumpPopup
                            section={jumpTargetSection}
                            theme={theme}
                            onClose={() => setJumpTargetSectionNumber(null)}
                            onStart={startJumpChallenge}
                          />
                        )}
                      </div>

                      {/* Passos decorativos até o próximo nível */}
                      {nextLevel && (
                        <>
                          {/* O baú é um nó do caminho: ocupa o 1º espaço de passo após a 2ª unidade */}
                          {levelCount >= 3 && i === 1 ? (
                            <div
                              className="absolute z-10 flex -translate-x-1/2 items-center justify-center"
                              style={{
                                left: leftSide ? '28%' : '72%',
                                top: top + INTERMEDIATE_NODE_OFFSET,
                              }}
                            >
                              <button
                                type="button"
                                data-trail-waypoint="true"
                                disabled={claimingChestId === chestId}
                                onClick={() =>
                                  void handleOpenChestReward(
                                    chestId,
                                    chestUnlocked,
                                    theme,
                                    unitNumber
                                  )
                                }
                                aria-label={`Baú da trilha, ${chestClaimed ? 'recompensa resgatada' : chestUnlocked ? '50 XP disponíveis' : 'bloqueado'}`}
                                className="dd-focus-ring group relative flex h-[80px] w-[80px] cursor-pointer items-center justify-center transition-transform duration-150 hover:-translate-y-1 active:scale-95"
                              >
                                <Image
                                  src={
                                    chestClaimed
                                      ? '/assets/trails/trail-chest-open.png'
                                      : '/assets/trails/trail-chest.png'
                                  }
                                  alt="Baú da trilha"
                                  width={78}
                                  height={78}
                                  className="relative z-10 h-[78px] w-[78px] object-contain transition-transform group-hover:scale-105"
                                  data-progress-appearance={chestClaimed ? 'section' : 'incomplete'}
                                  style={{
                                    filter: chestClaimed
                                      ? chestTintFilter(theme.primaryHex)
                                      : INCOMPLETE_CHEST_FILTER,
                                  }}
                                />
                              </button>
                            </div>
                          ) : (
                            <div
                              id={firstStepAnchorId}
                              className={`absolute flex -translate-x-1/2 flex-col items-center text-center ${
                                firstStepPopupOpen ? 'z-20' : 'z-10'
                              }`}
                              style={{
                                left: leftSide ? '28%' : '72%',
                                top: top + INTERMEDIATE_NODE_OFFSET,
                              }}
                              onMouseEnter={() =>
                                showActivityPreview(
                                  codeChallengeOne,
                                  codeOneAccessible,
                                  firstStepAnchorId
                                )
                              }
                              onMouseLeave={() => hideActivityPreview(firstStepAnchorId)}
                            >
                              <LessonStars level={codeChallengeOne} />
                              <button
                                type="button"
                                data-testid="trail-intermediate-node"
                                data-trail-waypoint="true"
                                disabled={!codeOneAccessible}
                                onClick={() =>
                                  handleLevelClick(
                                    codeChallengeOne,
                                    codeOneAccessible,
                                    firstStepAnchorId
                                  )
                                }
                                aria-label={`Desafio de programação: ${codeChallengeOne.title}`}
                                data-progress-appearance={
                                  codeChallengeOne.completed ? 'section' : 'incomplete'
                                }
                                className={`dd-focus-ring flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-md transition-all duration-150 ${
                                  codeChallengeOne.completed
                                    ? theme.nodeButtonClass
                                    : INCOMPLETE_NODE_CLASS
                                } ${codeOneAccessible ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-[4px]' : ''}`}
                              >
                                <Code2
                                  data-testid="trail-code-icon"
                                  aria-hidden="true"
                                  className="h-7 w-7"
                                  strokeWidth={2.7}
                                />
                              </button>

                              {firstStepPopupOpen && (
                                <TrailActivityPopup
                                  level={codeChallengeOne}
                                  theme={theme}
                                  onClose={() => setActiveActivity(null)}
                                  onStart={() => startActivity(codeChallengeOne)}
                                  align={leftSide ? 'start' : 'end'}
                                />
                              )}
                            </div>
                          )}
                          <div
                            id={secondStepAnchorId}
                            className={`absolute flex -translate-x-1/2 flex-col items-center text-center ${
                              secondStepPopupOpen ? 'z-20' : 'z-10'
                            }`}
                            style={{
                              left: leftSide ? '72%' : '28%',
                              top: top + INTERMEDIATE_NODE_OFFSET * 2,
                            }}
                            onMouseEnter={() =>
                              showActivityPreview(
                                codeChallengeTwo,
                                codeTwoAccessible,
                                secondStepAnchorId
                              )
                            }
                            onMouseLeave={() => hideActivityPreview(secondStepAnchorId)}
                          >
                            <LessonStars level={codeChallengeTwo} />
                            <button
                              type="button"
                              data-testid="trail-intermediate-node"
                              data-trail-waypoint="true"
                              disabled={!codeTwoAccessible}
                              onClick={() =>
                                handleLevelClick(
                                  codeChallengeTwo,
                                  codeTwoAccessible,
                                  secondStepAnchorId
                                )
                              }
                              aria-label={`Desafio de programação: ${codeChallengeTwo.title}`}
                              data-progress-appearance={
                                codeChallengeTwo.completed ? 'section' : 'incomplete'
                              }
                              className={`dd-focus-ring flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-md transition-all duration-150 ${
                                codeChallengeTwo.completed
                                  ? theme.nodeButtonClass
                                  : INCOMPLETE_NODE_CLASS
                              } ${codeTwoAccessible ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-[4px]' : ''}`}
                            >
                              <Code2
                                data-testid="trail-code-icon"
                                aria-hidden="true"
                                className="h-7 w-7"
                                strokeWidth={2.7}
                              />
                            </button>

                            {secondStepPopupOpen && (
                              <TrailActivityPopup
                                level={codeChallengeTwo}
                                theme={theme}
                                onClose={() => setActiveActivity(null)}
                                onStart={() => startActivity(codeChallengeTwo)}
                                align={leftSide ? 'end' : 'start'}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </Fragment>
                  );
                })}

                {/* Baú (fallback para unidades com menos de 3 níveis) */}
                {levelCount < 3 && (
                  <div
                    className="absolute z-10 flex -translate-x-1/2 items-center justify-center"
                    style={{ left: '74%', top: chestTop }}
                  >
                    <button
                      type="button"
                      data-trail-waypoint="true"
                      disabled={claimingChestId === chestId}
                      onClick={() =>
                        void handleOpenChestReward(chestId, chestUnlocked, theme, unitNumber)
                      }
                      aria-label={`Baú da trilha, ${chestClaimed ? 'recompensa resgatada' : chestUnlocked ? '50 XP disponíveis' : 'bloqueado'}`}
                      className="dd-focus-ring group relative flex h-[80px] w-[80px] cursor-pointer items-center justify-center transition-transform duration-150 hover:-translate-y-1 active:scale-95"
                    >
                      <Image
                        src={
                          chestClaimed
                            ? '/assets/trails/trail-chest-open.png'
                            : '/assets/trails/trail-chest.png'
                        }
                        alt="Baú da trilha"
                        width={78}
                        height={78}
                        className="relative z-10 h-[78px] w-[78px] object-contain transition-transform group-hover:scale-105"
                        data-progress-appearance={chestClaimed ? 'section' : 'incomplete'}
                        style={{
                          filter: chestClaimed
                            ? chestTintFilter(theme.primaryHex)
                            : INCOMPLETE_CHEST_FILTER,
                        }}
                      />
                    </button>
                  </div>
                )}

                {/* Desafio de código exclusivo antes do checkpoint */}
                {levelCount > 1 && lastLevel && finalCodeChallenge && (
                  <div
                    id={finalCodeAnchorId}
                    className={`absolute flex -translate-x-1/2 flex-col items-center text-center ${
                      activeActivity?.anchorId === finalCodeAnchorId ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      left: (levelCount - 1) % 2 === 0 ? '28%' : '72%',
                      top: lastLevelTop + INTERMEDIATE_NODE_OFFSET,
                    }}
                    onMouseEnter={() =>
                      showActivityPreview(
                        finalCodeChallenge,
                        finalCodeAccessible,
                        finalCodeAnchorId
                      )
                    }
                    onMouseLeave={() => hideActivityPreview(finalCodeAnchorId)}
                  >
                    <LessonStars level={finalCodeChallenge} />
                    <button
                      type="button"
                      data-testid="trail-intermediate-node"
                      data-trail-waypoint="true"
                      disabled={!finalCodeAccessible}
                      onClick={() =>
                        handleLevelClick(finalCodeChallenge, finalCodeAccessible, finalCodeAnchorId)
                      }
                      aria-label={`Desafio de programação: ${finalCodeChallenge.title}`}
                      data-progress-appearance={
                        finalCodeChallenge.completed ? 'section' : 'incomplete'
                      }
                      className={`dd-focus-ring flex h-[76px] w-[76px] items-center justify-center rounded-full shadow-md transition-all duration-150 ${
                        finalCodeChallenge.completed ? theme.nodeButtonClass : INCOMPLETE_NODE_CLASS
                      } ${finalCodeAccessible ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-[4px]' : ''}`}
                    >
                      <Code2
                        data-testid="trail-code-icon"
                        aria-hidden="true"
                        className="h-7 w-7"
                        strokeWidth={2.7}
                      />
                    </button>

                    {activeActivity?.anchorId === finalCodeAnchorId && (
                      <TrailActivityPopup
                        level={finalCodeChallenge}
                        theme={theme}
                        onClose={() => setActiveActivity(null)}
                        onStart={() => startActivity(finalCodeChallenge)}
                        align={(levelCount - 1) % 2 === 0 ? 'start' : 'end'}
                      />
                    )}
                  </div>
                )}

                {/* Checkpoint da unidade */}
                <div
                  className="absolute z-10 flex -translate-x-1/2 flex-col items-center text-center"
                  style={{ left: '50%', top: checkpointTop }}
                >
                  <LessonStars level={lastLevel} />
                  <button
                    type="button"
                    data-trail-waypoint="true"
                    disabled={!checkpointCompleted}
                    onClick={() => handleCheckpointClick(unitNumber)}
                    aria-label={`Checkpoint da seção ${unitNumber}`}
                    className={`dd-focus-ring relative flex h-[78px] w-[78px] items-center justify-center rounded-full shadow-md transition-all duration-150 enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:active:translate-y-[4px] ${
                      checkpointCompleted
                        ? theme.checkpointButtonClass
                        : 'border-b-[6px] border-[#202b33] bg-[#37464f] text-[#77858d]'
                    }`}
                  >
                    <Trophy className="h-8 w-8" strokeWidth={2.4} />
                  </button>
                  <p className="mt-2 text-xs font-black uppercase tracking-wide text-dd-text">
                    Desafio
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-dd-muted">Checkpoint de Código</p>
                </div>
              </div>
            );
          })}
          <TrailMascot
            containerRef={trailMapRef}
            progressKey={mascotProgressKey}
            currentNodeKey={currentMascotNodeKey}
          />
        </div>
      )}

      {/* Info / Level Modal */}
      {infoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-dd-border bg-dd-surface p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setInfoModal((prev) => ({ ...prev, open: false }))}
              aria-label="Fechar"
              className="absolute right-4 top-4 rounded-full p-1 text-dd-muted hover:bg-dd-border/40 hover:text-dd-text transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black text-dd-text mt-2">{infoModal.title}</h3>
            <p className="mt-2 text-xs font-semibold text-dd-muted leading-relaxed">
              {infoModal.description}
            </p>

            <button
              type="button"
              onClick={() => setInfoModal((prev) => ({ ...prev, open: false }))}
              className="mt-6 w-full cursor-pointer rounded-xl bg-blue-500 hover:bg-blue-600 py-3 text-xs font-black uppercase tracking-wide text-white transition-all active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Reward Modal */}
      {rewardModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-dd-border bg-dd-surface p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setRewardModal((prev) => ({ ...prev, open: false }))}
              aria-label="Fechar modal de recompensa"
              className="absolute right-4 top-4 rounded-full p-1 text-dd-muted hover:bg-dd-border/40 hover:text-dd-text transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center"
              style={{ filter: chestTintFilter(rewardModal.theme.primaryHex) }}
            >
              <Image
                src={
                  rewardModal.unlocked
                    ? '/assets/trails/trail-chest-open.png'
                    : '/assets/trails/trail-chest.png'
                }
                alt="Baú de Recompensa"
                width={80}
                height={80}
                className="h-20 w-20 object-contain drop-shadow-xl animate-bounce"
              />
            </div>

            <h3 className="text-lg font-black text-dd-text">{rewardModal.title}</h3>
            <p className="mt-2 text-xs font-semibold text-dd-muted leading-relaxed">
              {rewardModal.description}
            </p>

            {rewardModal.unlocked && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 px-4 py-2 text-sm font-black text-yellow-400">
                <Sparkles className="h-4 w-4" />+{rewardModal.xp} XP Bônus
              </div>
            )}

            <button
              type="button"
              onClick={() => setRewardModal((prev) => ({ ...prev, open: false }))}
              className={`mt-6 w-full cursor-pointer rounded-xl py-3 text-xs font-black uppercase tracking-wide text-white transition-all hover:brightness-110 active:translate-y-1 active:border-b-0 ${rewardModal.theme.nodeButtonClass}`}
            >
              {rewardModal.unlocked ? 'Pegar Recompensa' : 'Entendido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
