'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type MotionValue } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, LockKeyhole, Star } from 'lucide-react';
import { JourneyOverview } from '@/app/trails/JourneyOverview';
import { TrailResourceBar } from '@/app/trails/TrailResourceBar';
import { TrailViewSwitcher } from '@/app/trails/TrailViewSwitcher';
import journey from '@/app/trails/LearningJourney.module.css';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { Cascade, CascadeItem } from '../../demo-motion';
import { DEMO_COURSES, DEMO_USER, demoCopy } from '../../demo-data';
import { TrailMascotWalker } from './TrailMascotWalker';

const noop = () => {};

export interface TrailJourneyProps {
  /** Whether the third lesson of unit 1 is already completed. */
  thirdCompleted: boolean;
  totalXp: number;
  gems: number;
  /** Brings the current lesson node into view (the real page scrolls to it). */
  focusNode: boolean;
  /** Mascot travel from the completed lesson to the next one. */
  mascotProgress: MotionValue<number>;
  mascotWalking: boolean;
}

interface JourneyNode {
  id: string;
  title: string;
  state: 'completed' | 'active' | 'locked';
  exercises: number;
  completedExercises: number;
}

/** Node geometry of `LearningJourney` (map mode), shared with the mascot walker. */
export const JOURNEY_POSITIONS = [50, 34, 50, 66] as const;
export const CURRENT_NODE_ID = 'learn-js-variables';
export const NEXT_NODE_ID = 'learn-js-booleans';

/**
 * Projection of `TrailsContent` (header, view switcher, path selector) and
 * `LearningJourney` in map mode, using the real `JourneyOverview`, CSS module
 * and node markup. The live mascot (storage-driven) is replaced by a
 * clock-driven walker with the same sprites.
 */
export function TrailJourney({
  thirdCompleted,
  totalXp,
  gems,
  focusNode,
  mascotProgress,
  mascotWalking,
}: TrailJourneyProps) {
  const { text } = useLocalizedText();
  const reduced = useReducedMotion();
  const copy = demoCopy(text);
  const { course, lessons, nextUnit } = copy.trails;
  const content = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // Mirrors `scrollIntoView` on the real page: translate the column so the
  // current node sits in the upper third of the viewport.
  useEffect(() => {
    const element = content.current;
    const node = element?.querySelector(`#${CURRENT_NODE_ID}`);
    if (!element || !node || !focusNode) {
      setOffset(0);
      return;
    }
    const contentRect = element.getBoundingClientRect();
    const scale = element.offsetWidth ? contentRect.width / element.offsetWidth : 1;
    const nodeTop = (node.getBoundingClientRect().top - contentRect.top) / scale;
    const viewport = element.parentElement?.clientHeight ?? 800;
    setOffset(Math.min(0, -(nodeTop - viewport * 0.3)));
  }, [focusNode]);

  const unitOne: JourneyNode[] = lessons.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    state: index < 2 || thirdCompleted ? 'completed' : 'active',
    exercises: 2,
    completedExercises: index < 2 || thirdCompleted ? 2 : 1,
  }));
  const unitTwo: JourneyNode[] = nextUnit.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    state: thirdCompleted && index === 0 ? 'active' : 'locked',
    exercises: 2,
    completedExercises: 0,
  }));
  const completedLessons = unitOne.filter((node) => node.state === 'completed').length;
  const completedExercises = unitOne.reduce((sum, node) => sum + node.completedExercises, 0);
  const next = [...unitOne, ...unitTwo].find((node) => node.state === 'active');
  const labels = { lesson: text('Lição', 'Lesson') };

  const renderUnit = (nodes: JourneyNode[], unitIndex: number) => {
    const unitCompleted = nodes.filter((node) => node.state === 'completed').length;
    return (
      <CascadeItem
        as="section"
        key={unitIndex}
        id={`demo-unit-${unitIndex}`}
        className="scroll-mt-24"
        aria-labelledby={`demo-unit-heading-${unitIndex}`}
      >
        <header className="relative z-10 mb-4 rounded-2xl border-b-[6px] border-blue-700 bg-blue-500 px-5 py-5 text-white sm:px-7">
          <h2 id={`demo-unit-heading-${unitIndex}`} className="text-xl font-extrabold">
            {text('Unidade', 'Unit')} {unitIndex + 1} · {course.unitTitles[unitIndex]}
          </h2>
          <p className="mt-1 text-sm text-white">
            {unitCompleted}/{nodes.length} {text('lições', 'lessons')} ·{' '}
            {nodes.reduce((sum, node) => sum + node.completedExercises, 0)}/
            {nodes.reduce((sum, node) => sum + node.exercises, 0)} {text('exercícios', 'exercises')}
          </p>
        </header>
        <ol className={journey.path}>
          {nodes.map((node, index) => {
            const completed = node.state === 'completed';
            const locked = node.state === 'locked';
            const active = node.state === 'active';
            const Icon = completed ? Check : locked ? LockKeyhole : Star;
            const x = JOURNEY_POSITIONS[index % JOURNEY_POSITIONS.length];
            const nextX = JOURNEY_POSITIONS[(index + 1) % JOURNEY_POSITIONS.length];
            const actionClass = `dd-focus-ring relative z-10 flex shrink-0 items-center justify-center rounded-full transition-transform motion-reduce:transition-none ${journey.node} ${
              locked
                ? 'border-slate-600 bg-slate-700 text-slate-200'
                : completed
                  ? 'border-emerald-700 bg-emerald-500 text-white'
                  : 'border-blue-700 bg-blue-500 text-white'
            }`;
            return (
              <li
                key={node.id}
                id={node.id}
                data-learning-item={node.id}
                data-progress-state={
                  completed ? 'COMPLETED' : locked ? 'NOT_STARTED' : 'IN_PROGRESS'
                }
                className={`relative scroll-mt-28 ${journey.stop}`}
              >
                {index < nodes.length - 1 && (
                  <svg
                    aria-hidden="true"
                    className={journey.connector}
                    viewBox="0 0 100 248"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={`M ${x} 0 C ${x} 125 ${nextX} 123 ${nextX} 248`}
                      stroke="currentColor"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="3 9"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <div className={journey.station} style={{ left: `${x}%` }}>
                  {active && (
                    <span className={journey.nextLabel}>
                      {text('SUA PRÓXIMA LIÇÃO', 'YOUR NEXT LESSON')}
                    </span>
                  )}
                  <span
                    className={actionClass}
                    aria-label={`${node.title}: ${
                      completed
                        ? text('revisar', 'review')
                        : active
                          ? text('próxima lição', 'next lesson')
                          : text('bloqueado', 'locked')
                    }`}
                    data-trail-waypoint="true"
                    data-trail-mascot-node={node.id}
                    data-trail-mascot-completed={completed ? 'true' : 'false'}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-9 w-9"
                      fill={active && Icon === Star ? 'currentColor' : 'none'}
                    />
                  </span>
                  <div className={journey.caption}>
                    <h3 className="text-base font-bold leading-6 text-dd-text">{node.title}</h3>
                    <p className="mt-1 text-xs font-medium text-dd-muted">
                      {labels.lesson} · {node.completedExercises}/{node.exercises}{' '}
                      {text('exercícios', 'exercises')}
                      {completed
                        ? text(' · Concluída', ' · Completed')
                        : active
                          ? text(' · Você está aqui', ' · You are here')
                          : ''}
                    </p>
                    {locked && (
                      <details className={journey.requirements}>
                        <summary className="dd-focus-ring">
                          {text('Como desbloquear', 'How to unlock')}
                        </summary>
                        <p>
                          {text('Conclua:', 'Complete:')}{' '}
                          {text('a lição anterior', 'the previous lesson')}.
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CascadeItem>
    );
  };

  return (
    <motion.div
      ref={content}
      animate={{ y: offset }}
      // The column slides on its own layer instead of repainting the scene.
      style={{ willChange: 'transform' }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      data-testid="demo-journey"
    >
      <Cascade>
        <CascadeItem
          as="header"
          className="sticky top-0 z-30 border-b border-dd-border bg-dd-bg px-4 py-3"
        >
          <span className="mb-2 inline-flex min-h-10 items-center text-sm font-semibold text-dd-accent">
            {text('← Meu Mundinho e recompensas', '← My World & rewards')}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TrailViewSwitcher active="map" onChange={noop} />
            <div className="xl:hidden">
              <TrailResourceBar
                activeLanguage="JS"
                courses={[...DEMO_COURSES]}
                onSelectCourse={noop}
                streak={DEMO_USER.streak}
                lastActiveAt={DEMO_USER.last_active_at}
                totalXp={totalXp}
                gems={gems}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm text-dd-muted">
            <span className="shrink-0 font-medium text-dd-muted">{text('Caminho', 'Path')}</span>
            <div className="min-w-0 flex-1">
              <div
                aria-label={text('Caminho de aprendizado', 'Learning path')}
                className="group flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-dd-border bg-dd-bg px-3.5 py-2 text-sm text-dd-text"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="min-w-0 truncate font-semibold text-dd-text">
                    {course.title}
                  </span>
                  <span className="shrink-0 text-xs text-dd-muted">
                    · {completedLessons}/{course.totalLessons} {text('lições', 'lessons')}
                  </span>
                </div>
                <ChevronDown className="pointer-events-none size-4 shrink-0 text-dd-muted" />
              </div>
            </div>
          </div>
        </CascadeItem>

        <section
          aria-labelledby="journey-title"
          className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-8"
        >
          <CascadeItem>
            <JourneyOverview
              title={course.title}
              description={course.description}
              completedLessons={completedLessons}
              totalLessons={course.totalLessons}
              completedExercises={completedExercises}
              totalExercises={course.totalExercises}
              units={course.unitTitles}
              pathId="demo-foundations-js"
              action={
                next && (
                  <a>
                    <span>
                      {thirdCompleted ? text('Começar', 'Start') : text('Continuar', 'Continue')}:{' '}
                      {next.title}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </a>
                )
              }
            />
          </CascadeItem>
          <div
            ref={map}
            className="relative isolate pb-24"
            data-testid="learning-journey"
            data-view="map"
          >
            {renderUnit(unitOne, 0)}
            {renderUnit(unitTwo, 1)}
            <TrailMascotWalker
              containerRef={map}
              fromId={CURRENT_NODE_ID}
              toId={NEXT_NODE_ID}
              progress={mascotProgress}
              walking={mascotWalking}
            />
          </div>
        </section>
      </Cascade>
    </motion.div>
  );
}
