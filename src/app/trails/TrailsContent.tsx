'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Code2,
  GitBranch,
  LockKeyhole,
  MapPinned,
  Network,
  Route,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import type { TrailCourseOption } from '@/app/trails/TrailCourseSelector';
import { getTrailLanguageMetadata, type TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import { TrailMap } from '@/app/trails/TrailMap';
import { TrailPathView } from '@/app/trails/TrailPathView';
import { TrailResourceBar } from '@/app/trails/TrailResourceBar';
import { TrailsProgressSidebar, type TrailDailyProgress } from '@/app/trails/TrailsProgressSidebar';
import { getCourseKnowledgeNodes, getCourseLearningPaths } from '@/app/trails/trailCourseKnowledge';
import { useResponsiveTrailViewMode } from '@/app/trails/useResponsiveTrailViewMode';
import { cn } from '@/lib/cn';
import type {
  KnowledgeMapData,
  KnowledgeMapNode,
  KnowledgeProgressStatus,
  KnowledgeRelation,
  LearningPathSummary,
} from '@/lib/learning/types';

interface TrailsContentProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    total_xp: number;
    streak: number;
  };
  knowledgeMap: KnowledgeMapData;
  initialCourses: TrailCourseOption[];
  initialActiveLanguage: TrailLanguageCode;
  gems: number;
  globalRank: number;
  totalParticipants: number;
  dailyProgress: TrailDailyProgress;
  initialViewMode?: 'map' | 'trail';
  initialPathSlug?: string;
  initialSectionNumber?: number;
  jumpUnlockIds?: readonly string[];
  completedLessonIds?: readonly string[];
}

const STATUS_LABEL: Record<KnowledgeProgressStatus, string> = {
  NOT_STARTED: 'Requisito pendente',
  AVAILABLE: 'Disponível',
  RECOMMENDED: 'Recomendado agora',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  MASTERED: 'Dominado',
};

const RELATION_LABEL: Record<KnowledgeRelation, string> = {
  REQUIRED: 'Obrigatório',
  RECOMMENDED: 'Recomendado',
  RELATED: 'Relacionado',
  BUILDS_ON: 'Aprofunda',
  COMBINES: 'Combina',
};

function CourseOverviewCard({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'map' | 'trail';
  onViewModeChange: (mode: 'map' | 'trail') => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(14,165,233,0.25)]">
        <Image
          src="/assets/trails/devdeck-mascot-card.png"
          alt="Mascote da Stacklyst"
          width={56}
          height={56}
          priority
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <h1 id="overall-progress-title" className="text-base font-bold text-dd-text tracking-tight">
          {viewMode === 'map' ? 'Mapa de Conhecimento' : 'Trilha'}
        </h1>
        <div className="mt-1 flex items-center rounded-xl bg-dd-surface/90 p-0.5 border border-dd-border shadow-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer select-none',
              viewMode === 'map'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-dd-muted hover:text-dd-text'
            )}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Mapa</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('trail')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black transition-all cursor-pointer select-none',
              viewMode === 'trail'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-dd-muted hover:text-dd-text'
            )}
          >
            <Route className="h-3.5 w-3.5" />
            <span>Trilha</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function NodeDetail({
  node,
  onSelectNode,
}: {
  node: KnowledgeMapNode;
  onSelectNode: (nodeId: string) => void;
}) {
  const missingRequired = node.prerequisites.filter(
    (prerequisite) => prerequisite.relation === 'REQUIRED' && !prerequisite.completed
  );
  const missingRecommended = node.prerequisites.filter(
    (prerequisite) => prerequisite.relation !== 'REQUIRED' && !prerequisite.completed
  );
  const firstExercise = node.exercises[0];

  return (
    <aside
      aria-labelledby="selected-knowledge-title"
      className="rounded-3xl border border-dd-border bg-dd-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-500">
          {node.category}
        </span>
        <span className="text-xs font-bold text-dd-muted">{STATUS_LABEL[node.status]}</span>
      </div>

      <h2 id="selected-knowledge-title" className="mt-4 text-xl font-black text-dd-text">
        {node.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dd-muted">{node.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-dd-surface p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-dd-muted">
            Domínio
          </p>
          <p className="mt-1 text-lg font-black text-dd-text">{node.mastery}%</p>
        </div>
        <div className="rounded-xl bg-dd-surface p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-dd-muted">
            Dificuldade
          </p>
          <p className="mt-1 text-lg font-black text-dd-text">{node.difficulty}/5</p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
          Conexões anteriores
        </h3>
        {node.prerequisites.length === 0 ? (
          <p className="mt-2 text-sm text-dd-muted">Este conhecimento inicia o mapa.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {node.prerequisites.map((prerequisite) => (
              <li key={`${prerequisite.nodeId}-${prerequisite.relation}`}>
                <button
                  type="button"
                  onClick={() => onSelectNode(prerequisite.nodeId)}
                  className="dd-focus-ring flex w-full items-center gap-2 rounded-xl bg-dd-surface px-3 py-2 text-left transition hover:bg-blue-500/10"
                >
                  {prerequisite.completed ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  ) : prerequisite.relation === 'REQUIRED' ? (
                    <LockKeyhole className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  ) : (
                    <GitBranch className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-dd-text">
                    {prerequisite.title}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wide text-dd-muted">
                    {RELATION_LABEL[prerequisite.relation]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {missingRequired.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-400/30 bg-slate-500/[0.06] p-4">
          <div className="flex gap-2">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <div>
              <p className="text-xs font-black text-dd-text">Conhecimento necessário</p>
              <p className="mt-1 text-xs leading-relaxed text-dd-muted">
                Este é um dos poucos vínculos obrigatórios porque o exercício usa esse contrato
                diretamente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectNode(missingRequired[0].nodeId)}
            className="dd-focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-dd-text px-3 py-2.5 text-xs font-black text-dd-bg"
          >
            Estudar requisito
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {missingRequired.length === 0 && missingRecommended.length > 0 && (
        <div className="mt-5 rounded-2xl border border-blue-500/25 bg-blue-500/[0.06] p-4">
          <div className="flex gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
            <div>
              <p className="text-xs font-black text-dd-text">Recomendação, não bloqueio</p>
              <p className="mt-1 text-xs leading-relaxed text-dd-muted">
                {missingRecommended.map((item) => item.title).join(', ')} pode facilitar este
                conhecimento, mas você decide o caminho.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectNode(missingRecommended[0].nodeId)}
            className="dd-focus-ring mt-3 w-full rounded-xl border border-blue-500/30 px-3 py-2.5 text-xs font-black text-blue-500 transition hover:bg-blue-500/10"
          >
            Estudar conhecimento recomendado
          </button>
        </div>
      )}

      <div className="mt-5 border-t border-dd-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
            Exercícios práticos
          </h3>
          <span className="text-xs font-bold text-dd-muted">{node.exercises.length}</span>
        </div>

        {node.exercises.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-dd-border p-4 text-sm text-dd-muted">
            Este conhecimento ainda não foi publicado porque não possui exercício avaliável.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {node.exercises.map((exercise, index) => (
              <li key={exercise.id}>
                <Link
                  href={missingRequired.length > 0 ? '#' : `/lesson/${exercise.slug}`}
                  aria-disabled={missingRequired.length > 0}
                  onClick={(event) => {
                    if (missingRequired.length > 0) event.preventDefault();
                  }}
                  className={cn(
                    'dd-focus-ring flex items-center gap-3 rounded-2xl border border-dd-border p-3 transition',
                    missingRequired.length > 0
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:border-blue-500/50 hover:bg-blue-500/[0.04]'
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-dd-text">
                      {exercise.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-dd-muted">
                      Dificuldade {exercise.difficulty}/5 · {exercise.baseXp} XP base
                    </span>
                  </span>
                  {index === 0 && missingRequired.length === 0 && (
                    <ChevronRight className="h-4 w-4 text-blue-500" aria-hidden="true" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {firstExercise && missingRequired.length === 0 && (
          <Link
            href={`/lesson/${firstExercise.slug}`}
            className="dd-focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-black text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-600"
          >
            {missingRecommended.length > 0 ? 'Começar mesmo assim' : 'Começar exercício'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </aside>
  );
}

function FloatingNodeDetail({
  node,
  onMouseEnter,
  onMouseLeave,
}: {
  node: KnowledgeMapNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const missingRequired = node.prerequisites.some(
    (prerequisite) => prerequisite.relation === 'REQUIRED' && !prerequisite.completed
  );
  const firstExercise = node.exercises[0];

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="floating-knowledge-title"
      data-testid="trail-node-popover"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onMouseLeave();
      }}
      className="absolute right-4 top-[51%] z-[70] hidden w-[232px] -translate-y-1/2 rounded-xl border border-dd-border bg-dd-card p-4 text-dd-text shadow-[0_18px_42px_-18px_rgba(0,0,0,0.5)] 2xl:block"
    >
      <h2 id="floating-knowledge-title" className="text-sm font-bold leading-tight text-dd-text">
        {node.title}
      </h2>
      <p className="mt-2 line-clamp-4 text-[10px] leading-relaxed text-dd-muted">
        {node.description}
      </p>

      <div className="mt-3 border-t border-dd-border pt-3">
        <p className="text-[9px] font-semibold text-dd-muted">Exercício prático</p>
        {firstExercise ? (
          <div className="mt-2 flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <div>
              <p className="text-[10px] font-semibold leading-snug text-dd-text">
                {firstExercise.title}
              </p>
              <p className="mt-0.5 text-[9px] text-dd-muted">
                {firstExercise.baseXp} XP · Dificuldade {firstExercise.difficulty}/5
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-dd-muted">Exercício em preparação.</p>
        )}
      </div>

      {firstExercise && !missingRequired ? (
        <Link
          href={`/lesson/${firstExercise.slug}`}
          className="dd-focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-[11px] font-semibold text-white transition hover:bg-blue-500"
        >
          Aprender habilidade
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <div className="mt-4 rounded-lg bg-dd-surface px-3 py-2.5 text-center text-[10px] font-semibold text-dd-muted">
          {missingRequired ? 'Conclua os requisitos anteriores' : 'Em preparação'}
        </div>
      )}
    </aside>
  );
}

export function TrailsContent({
  user,
  knowledgeMap,
  initialCourses,
  initialActiveLanguage,
  gems,
  globalRank,
  totalParticipants,
  dailyProgress,
  initialViewMode = 'map',
  initialPathSlug,
  initialSectionNumber = 1,
  jumpUnlockIds = [],
  completedLessonIds = [],
}: TrailsContentProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'map' | 'trail'>(initialViewMode);
  const responsiveViewMode = useResponsiveTrailViewMode(viewMode);

  const handleViewModeChange = (mode: 'map' | 'trail') => {
    setViewMode(mode);
    try {
      localStorage.setItem('stacklyst-trail-view-mode', mode);
      document.cookie = `stacklyst_trail_view_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  const [activeLanguage, setActiveLanguage] = useState(initialActiveLanguage);
  const [courses, setCourses] = useState(initialCourses);
  const initialCourseNodes = getCourseKnowledgeNodes(knowledgeMap.nodes, initialActiveLanguage);
  const initialCoursePaths = getCourseLearningPaths(knowledgeMap.paths, initialCourseNodes);
  const initialPath =
    initialCoursePaths.find(
      (path) => path.slug === initialPathSlug || path.id === initialPathSlug
    ) ??
    initialCoursePaths.find((path) => path.featured) ??
    initialCoursePaths[0];
  const [selectedPathId, setSelectedPathId] = useState(initialPath?.id ?? '');
  const initialNodeId =
    initialPath?.nextRecommendedNodeId ??
    initialPath?.nodeIds[0] ??
    initialCourseNodes[0]?.id ??
    '';
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId);
  const [previewedNodeId, setPreviewedNodeId] = useState<string | null>(null);
  const previewDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPreviewDismiss = () => {
    if (!previewDismissTimer.current) return;
    clearTimeout(previewDismissTimer.current);
    previewDismissTimer.current = null;
  };

  const showNodePreview = (nodeId: string) => {
    cancelPreviewDismiss();
    setPreviewedNodeId(nodeId);
  };

  const schedulePreviewDismiss = (delay = 850) => {
    cancelPreviewDismiss();
    previewDismissTimer.current = setTimeout(() => {
      setPreviewedNodeId(null);
      previewDismissTimer.current = null;
    }, delay);
  };

  useEffect(
    () => () => {
      if (previewDismissTimer.current) clearTimeout(previewDismissTimer.current);
    },
    []
  );

  const courseNodes = useMemo(
    () => getCourseKnowledgeNodes(knowledgeMap.nodes, activeLanguage),
    [activeLanguage, knowledgeMap.nodes]
  );
  const coursePaths = useMemo(
    () => getCourseLearningPaths(knowledgeMap.paths, courseNodes),
    [courseNodes, knowledgeMap.paths]
  );
  const selectedPath =
    coursePaths.find((path) => path.id === selectedPathId) ??
    coursePaths.find((path) => path.featured) ??
    coursePaths[0];
  const selectedNode = courseNodes.find((node) => node.id === selectedNodeId) ?? courseNodes[0];
  const previewedNode = previewedNodeId
    ? (courseNodes.find((node) => node.id === previewedNodeId) ?? null)
    : null;

  const courseNodeIds = useMemo(() => new Set(courseNodes.map((node) => node.id)), [courseNodes]);
  const courseEdges = useMemo(
    () =>
      knowledgeMap.edges.filter(
        (edge) => courseNodeIds.has(edge.sourceNodeId) && courseNodeIds.has(edge.targetNodeId)
      ),
    [courseNodeIds, knowledgeMap.edges]
  );

  const selectPath = (path: LearningPathSummary) => {
    setSelectedPathId(path.id);
    const nextNodeId =
      (path.nextRecommendedNodeId && courseNodeIds.has(path.nextRecommendedNodeId)
        ? path.nextRecommendedNodeId
        : path.nodeIds.find((nodeId) => courseNodeIds.has(nodeId))) ?? selectedNodeId;
    setSelectedNodeId(nextNodeId);
  };

  const selectCourse = (language: TrailLanguageCode) => {
    const nextCourseNodes = getCourseKnowledgeNodes(knowledgeMap.nodes, language);
    const nextCoursePaths = getCourseLearningPaths(knowledgeMap.paths, nextCourseNodes);
    const nextPath = nextCoursePaths.find((path) => path.featured) ?? nextCoursePaths[0];
    const nextNodeIds = new Set(nextCourseNodes.map((node) => node.id));
    const nextNodeId =
      (nextPath?.nextRecommendedNodeId && nextNodeIds.has(nextPath.nextRecommendedNodeId)
        ? nextPath.nextRecommendedNodeId
        : nextPath?.nodeIds.find((nodeId) => nextNodeIds.has(nodeId))) ??
      nextCourseNodes[0]?.id ??
      '';
    const startedLanguages = Array.from(
      new Set([
        ...courses.filter((course) => course.started).map((course) => course.language),
        language,
      ])
    );

    setActiveLanguage(language);
    setSelectedPathId(nextPath?.id ?? '');
    setSelectedNodeId(nextNodeId);
    setPreviewedNodeId(null);
    setCourses((currentCourses) =>
      currentCourses.map((course) =>
        course.language === language ? { ...course, started: true } : course
      )
    );

    void fetch('/api/trails/course-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeLanguage: language, startedLanguages }),
    }).catch((error) => console.error('Erro ao salvar preferência da trilha:', error));
  };

  const renderTrailMap = () => (
    <TrailMap
      nodes={courseNodes}
      edges={courseEdges}
      paths={coursePaths}
      selectedNodeId={selectedNode?.id ?? ''}
      selectedPathId={selectedPath?.id ?? ''}
      onSelectNode={setSelectedNodeId}
      onSelectPath={(pathId) => {
        const path = coursePaths.find((candidate) => candidate.id === pathId);
        if (path) selectPath(path);
      }}
      onPreviewNode={showNodePreview}
      onDismissNodePreview={() => schedulePreviewDismiss()}
    />
  );

  return (
    <div className="dd-platform-shell dd-platform-shell--fullscreen relative min-h-screen overflow-x-clip bg-dd-bg md:h-screen md:min-h-0 md:overflow-hidden">
      <Sidebar user={user} />

      <div className="mx-auto flex w-full min-w-0 flex-grow xl:max-w-[1660px] xl:justify-start">
        <main className="relative min-h-screen min-w-0 flex-1 pb-24 md:h-screen md:min-h-0 md:pb-0">
          <header className="relative z-[80] flex flex-col justify-between gap-2 p-3 md:pointer-events-none md:absolute md:inset-x-0 md:top-0 lg:flex-row lg:items-start">
            <div className="pointer-events-auto hidden md:block">
              <CourseOverviewCard viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            </div>

            <div className="pointer-events-auto flex w-full flex-col items-stretch gap-2 lg:w-auto lg:items-end">
              <div className="w-full xl:hidden">
                <TrailResourceBar
                  activeLanguage={activeLanguage}
                  courses={courses}
                  onSelectCourse={selectCourse}
                  streak={user.streak}
                  totalXp={user.total_xp}
                  gems={gems}
                />
              </div>

              {responsiveViewMode === 'map' && selectedPath && (
                <div className="flex min-w-[240px] items-center gap-3 px-1 py-0.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-dd-muted">
                      Setor ativo
                    </p>
                    <p className="mt-0.5 truncate text-xs font-bold text-dd-text">
                      {selectedPath.title}
                    </p>
                  </div>
                  <div className="w-20">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                        style={{
                          width: `${selectedPath.progressPercent}%`,
                          backgroundColor: selectedPath.accentColor,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold tabular-nums text-dd-muted">
                    {selectedPath.progressPercent}%
                  </span>
                </div>
              )}
            </div>
          </header>

          {responsiveViewMode === 'trail' ? (
            <div
              data-testid="trail-scroll-container"
              className="scrollbar-none relative z-10 w-full overflow-y-visible px-2 pb-20 pt-4 sm:px-4 md:h-full md:overflow-y-auto md:pt-28 lg:pt-24"
            >
              <TrailPathView
                activeLanguage={activeLanguage}
                nodes={courseNodes}
                paths={coursePaths}
                selectedNodeId={selectedNode?.id ?? ''}
                selectedPathId={selectedPath?.id ?? ''}
                onSelectNode={setSelectedNodeId}
                onSelectPath={(pathId) => {
                  const path = coursePaths.find((candidate) => candidate.id === pathId);
                  if (path) selectPath(path);
                }}
                onSelectExercise={(lessonId, returnTo) =>
                  router.push(`/lesson/${lessonId}?returnTo=${encodeURIComponent(returnTo)}`)
                }
                initialSectionNumber={initialSectionNumber}
                jumpUnlockIds={jumpUnlockIds}
                completedLessonIds={completedLessonIds}
              />
            </div>
          ) : courseNodes.length === 0 ? (
            <section className="relative z-20 mx-3 mt-3 rounded-3xl border border-dashed border-dd-border bg-dd-card p-10 text-center md:absolute md:left-1/2 md:top-1/2 md:m-0 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2">
              <MapPinned className="mx-auto h-8 w-8 text-dd-muted" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-black text-dd-text">
                Curso de {getTrailLanguageMetadata(activeLanguage).label} em preparação
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-dd-muted">
                Este curso já foi adicionado aos seus cursos, mas ainda não possui conhecimentos
                publicados neste mapa. Você pode trocar de linguagem no seletor acima.
              </p>
            </section>
          ) : (
            <>
              <div className="absolute inset-0 hidden md:block">{renderTrailMap()}</div>

              <div className="relative z-20 space-y-4 px-3 md:hidden">
                {renderTrailMap()}
                {selectedNode && (
                  <NodeDetail node={selectedNode} onSelectNode={setSelectedNodeId} />
                )}
              </div>

              {previewedNode && (
                <FloatingNodeDetail
                  node={previewedNode}
                  onMouseEnter={cancelPreviewDismiss}
                  onMouseLeave={() => schedulePreviewDismiss(140)}
                />
              )}
            </>
          )}
        </main>

        <TrailsProgressSidebar
          activeLanguage={activeLanguage}
          courses={courses}
          onSelectCourse={selectCourse}
          totalXp={user.total_xp}
          gems={gems}
          streak={user.streak}
          globalRank={globalRank}
          totalParticipants={totalParticipants}
          username={user.username}
          avatarUrl={user.avatar_url}
          dailyProgress={dailyProgress}
        />
      </div>
    </div>
  );
}
