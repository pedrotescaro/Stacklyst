'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Network, List, MapPinned } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { TrailResourceBar } from './TrailResourceBar';
import { TrailsProgressSidebar, type TrailDailyProgress } from './TrailsProgressSidebar';
import type { TrailCourseOption } from './TrailCourseSelector';
import type { TrailLanguageCode } from './TrailLanguageLogo';
import { getCourseKnowledgeNodes, getCourseLearningPaths } from './trailCourseKnowledge';
import type { KnowledgeMapData } from '@/lib/learning/types';
import { LearningJourney } from './LearningJourney';

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
}: TrailsContentProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [activeLanguage, setActiveLanguage] = useState(initialActiveLanguage);
  const [pathId, setPathId] = useState(initialPathSlug ?? '');
  const nodes = useMemo(
    () => getCourseKnowledgeNodes(knowledgeMap.nodes, activeLanguage),
    [knowledgeMap.nodes, activeLanguage]
  );
  const paths = useMemo(
    () => getCourseLearningPaths(knowledgeMap.paths, nodes),
    [knowledgeMap.paths, nodes]
  );
  const path =
    paths.find((p) => p.id === pathId || p.slug === pathId) ??
    paths.find((p) => p.id === `foundations-${activeLanguage.toLowerCase()}`) ??
    paths[0];
  // Fresh server state on return and when another device has changed progress.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [router]);
  function changeMode(mode: 'map' | 'trail') {
    setViewMode(mode);
    document.cookie = `stacklyst_trail_view_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('stacklyst-trail-view-mode', mode);
  }
  function selectCourse(language: TrailLanguageCode) {
    setActiveLanguage(language);
    setPathId(`foundations-${language.toLowerCase()}`);
    void fetch('/api/trails/course-preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activeLanguage: language,
        startedLanguages: [
          ...new Set(
            initialCourses
              .filter((c) => c.started)
              .map((c) => c.language)
              .concat(language)
          ),
        ],
      }),
    });
  }
  return (
    <div className="dd-platform-shell relative min-h-screen bg-dd-bg">
      <Sidebar user={user} />
      <div className="mx-auto flex w-full min-w-0 flex-grow xl:max-w-[1660px]">
        <main className="min-w-0 flex-1 pb-20">
          <header className="sticky top-0 z-30 border-b border-dd-border bg-dd-bg px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Visualização do aprendizado"
                className="flex rounded-xl border border-dd-border p-1"
              >
                {(
                  [
                    { id: 'map', label: 'Mapa', Icon: Network },
                    { id: 'trail', label: 'Trilha', Icon: List },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={viewMode === id}
                    onClick={() => changeMode(id)}
                    className={`dd-focus-ring flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${viewMode === id ? 'bg-blue-500 text-white' : 'text-dd-muted hover:text-dd-text'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="xl:hidden">
                <TrailResourceBar
                  activeLanguage={activeLanguage}
                  courses={initialCourses}
                  onSelectCourse={selectCourse}
                  streak={user.streak}
                  totalXp={user.total_xp}
                  gems={gems}
                />
              </div>
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm text-dd-muted">
              Caminho
              <select
                aria-label="Caminho de aprendizado"
                value={path?.id ?? ''}
                onChange={(event) => setPathId(event.target.value)}
                className="dd-focus-ring min-h-11 min-w-0 flex-1 rounded-lg border border-dd-border bg-dd-bg px-3 text-dd-text"
              >
                {paths.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.completedNodes}/{p.totalNodes} lições
                  </option>
                ))}
              </select>
            </label>
          </header>
          {path ? (
            <LearningJourney
              key={`${user.id}:${path.id}`}
              userId={user.id}
              nodes={nodes}
              path={path}
              language={activeLanguage}
              mode={viewMode}
            />
          ) : (
            <div className="p-8 text-dd-muted">
              <MapPinned className="mb-3" />
              <p>Nenhum conteúdo publicado nesta linguagem.</p>
            </div>
          )}
        </main>
        <TrailsProgressSidebar
          activeLanguage={activeLanguage}
          courses={initialCourses}
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
