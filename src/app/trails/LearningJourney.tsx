'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Crown,
  LockKeyhole,
  RotateCcw,
  Star,
} from 'lucide-react';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';
import { isKnowledgeCompleted } from '@/lib/learning/progress';
import { TrailMascot } from './TrailMascot';
import styles from './LearningJourney.module.css';
import { JourneyOverview } from './JourneyOverview';
import { useLocalizedText } from '@/i18n/useLocalizedText';
import { learningBossId } from '@/lib/learning/boss-ids';

export function getJourneyItems(path: LearningPathSummary, nodes: KnowledgeMapNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return path.nodeIds.flatMap((id) => {
    const node = byId.get(id);
    return node ? [node] : [];
  });
}
function nodeHref(node: KnowledgeMapNode, returnTo: string) {
  const exercise = node.exercises.find((e) => !e.completed) ?? node.exercises[0];
  return node.lessonId
    ? `/lesson/${node.lessonId}?returnTo=${encodeURIComponent(returnTo)}`
    : exercise
      ? `/lesson/${exercise.slug}?mode=workspace&returnTo=${encodeURIComponent(returnTo)}`
      : undefined;
}
function NodeStars({ stars }: { stars: number }) {
  const { text } = useLocalizedText();
  return (
    <span
      role="img"
      aria-label={text(`${stars} de 3 estrelas`, `${stars} of 3 stars`)}
      className={styles.stars}
    >
      {[1, 2, 3].map((index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={index <= stars ? styles.starOn : styles.starOff}
        />
      ))}
    </span>
  );
}

export function LearningJourney({
  nodes,
  path,
  mode,
  language,
  userId,
  stars = {},
  completedBossIds = [],
}: {
  nodes: KnowledgeMapNode[];
  path: LearningPathSummary;
  mode: 'map' | 'trail';
  language: string;
  userId: string;
  /** Best star rating per lesson id (1–3). */
  stars?: Readonly<Record<string, number>>;
  /** Unit bosses already defeated. */
  completedBossIds?: readonly string[];
}) {
  const { text } = useLocalizedText();
  const labels = {
    lesson: text('Lição', 'Lesson'),
    review: text('Revisão', 'Review'),
    project: text('Projeto', 'Project'),
  };
  const items = useMemo(() => getJourneyItems(path, nodes), [path, nodes]);
  const mapRef = useRef<HTMLDivElement>(null);
  const next = items.find(
    (node) => !isKnowledgeCompleted(node.status) && node.status !== 'NOT_STARTED'
  );
  const currentKey = next?.id ?? items.at(-1)?.id ?? '';
  const units = useMemo(() => [...new Set(items.map((n) => n.category))], [items]);
  const exerciseCount = items.reduce((n, item) => n + item.exercises.length, 0);
  const completedCount = items.reduce((n, item) => n + item.completedExercises, 0);
  const returnTo = `/trails?view=${mode}&path=${path.slug}&language=${language}`;
  const defeatedBosses = useMemo(() => new Set(completedBossIds), [completedBossIds]);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`learning-scroll:${userId}:${path.id}`);
      if (stored) document.getElementById(stored)?.scrollIntoView({ block: 'center' });
    } catch {
      /* Optional position restore. */
    }
  }, [path.id, userId]);
  const remember = (id: string) => {
    try {
      sessionStorage.setItem(`learning-scroll:${userId}:${path.id}`, id);
    } catch {
      /* Navigation works without storage. */
    }
  };
  return (
    <section
      aria-labelledby="journey-title"
      className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-8"
    >
      <JourneyOverview
        title={path.title}
        description={path.description}
        completedLessons={path.completedNodes}
        totalLessons={items.length}
        completedExercises={completedCount}
        totalExercises={exerciseCount}
        units={units}
        pathId={path.id}
        action={
          <>
            {next && (
              <Link onClick={() => remember(next.id)} href={nodeHref(next, returnTo) ?? '#'}>
                <span>
                  {next.status === 'IN_PROGRESS'
                    ? text('Continuar', 'Continue')
                    : text('Começar', 'Start')}
                  : {next.title}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            )}
            {!next && path.completedNodes === items.length && (
              <p role="status" className="mt-4 font-semibold text-emerald-500">
                {text(
                  'Caminho concluído. Você pode revisar qualquer lição.',
                  'Path completed. You can review any lesson.'
                )}
              </p>
            )}
          </>
        }
      />
      <div
        ref={mapRef}
        className="relative isolate pb-24"
        data-testid="learning-journey"
        data-view={mode}
      >
        {units.map((unit, unitIndex) => {
          const unitItems = items.filter((n) => n.category === unit);
          const unitCompleted = unitItems.filter((n) => isKnowledgeCompleted(n.status)).length;
          return (
            <section
              key={unit}
              id={`unit-${path.id}-${unitIndex}`}
              className="scroll-mt-24"
              aria-labelledby={`unit-heading-${unitIndex}`}
            >
              <header className="relative z-10 mb-4 rounded-2xl border-b-[6px] border-blue-700 bg-blue-500 px-5 py-5 text-white sm:px-7">
                <h2 id={`unit-heading-${unitIndex}`} className="text-xl font-extrabold">
                  {text('Unidade', 'Unit')} {unitIndex + 1} · {unit}
                </h2>
                <p className="mt-1 text-sm text-white">
                  {unitCompleted}/{unitItems.length} {text('lições', 'lessons')} ·{' '}
                  {unitItems.reduce((n, l) => n + l.completedExercises, 0)}/
                  {unitItems.reduce((n, l) => n + l.exercises.length, 0)}{' '}
                  {text('exercícios', 'exercises')}
                </p>
              </header>
              <ol className={mode === 'map' ? styles.path : 'mb-8 divide-y divide-dd-border'}>
                {unitItems.map((node, index) => {
                  const completed = isKnowledgeCompleted(node.status),
                    locked = node.status === 'NOT_STARTED';
                  const active = node.id === currentKey;
                  const href = nodeHref(node, returnTo);
                  const missing = node.prerequisites.filter(
                    (p) => p.relation === 'REQUIRED' && !p.completed
                  );
                  const Icon = completed
                    ? Check
                    : locked
                      ? LockKeyhole
                      : node.activityKind === 'project'
                        ? Code2
                        : node.activityKind === 'review'
                          ? RotateCcw
                          : Star;
                  const icon = (
                    <Icon
                      aria-hidden="true"
                      className={mode === 'map' ? 'h-9 w-9' : 'h-7 w-7'}
                      fill={!locked && !completed && Icon === Star ? 'currentColor' : 'none'}
                    />
                  );
                  const actionClass = `dd-focus-ring relative z-10 flex shrink-0 items-center justify-center rounded-full transition-transform motion-reduce:transition-none ${mode === 'map' ? styles.node : 'h-16 w-16 border-b-4'} ${locked ? 'border-slate-600 bg-slate-700 text-slate-200' : completed ? 'border-emerald-700 bg-emerald-500 text-white' : 'border-blue-700 bg-blue-500 text-white hover:-translate-y-0.5'}`;
                  const positions = [50, 34, 50, 66];
                  const x = positions[index % positions.length],
                    nextX = positions[(index + 1) % positions.length];
                  return (
                    <li
                      key={node.id}
                      id={node.id}
                      data-learning-item={node.id}
                      data-progress-state={node.status}
                      className={`relative scroll-mt-28 ${mode === 'map' ? styles.stop : 'py-5'}`}
                    >
                      {mode === 'map' && unitItems.length > 0 && (
                        <svg
                          aria-hidden="true"
                          className={styles.connector}
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
                      <div
                        className={
                          mode === 'map' ? styles.station : 'relative flex items-start gap-4'
                        }
                        style={mode === 'map' ? { left: `${x}%` } : undefined}
                      >
                        {mode === 'map' && active && !completed && (
                          <span className={styles.nextLabel}>
                            {text('SUA PRÓXIMA LIÇÃO', 'YOUR NEXT LESSON')}
                          </span>
                        )}
                        {locked || !href ? (
                          <button
                            className={actionClass}
                            type="button"
                            aria-disabled="true"
                            aria-label={`${node.title}: bloqueado`}
                            aria-describedby={`requirements-${node.id}`}
                          >
                            {icon}
                          </button>
                        ) : (
                          <Link
                            href={href}
                            onClick={() => remember(node.id)}
                            aria-label={`${node.title}: ${completed ? text('revisar', 'review') : active ? text('próxima lição', 'next lesson') : text('abrir', 'open')}`}
                            className={actionClass}
                            data-trail-waypoint="true"
                            data-trail-mascot-node={node.id}
                            data-trail-mascot-completed={completed ? 'true' : 'false'}
                          >
                            {icon}
                          </Link>
                        )}
                        <div className={mode === 'map' ? styles.caption : 'min-w-0 flex-1 pt-1'}>
                          <h3 className="text-base font-bold leading-6 text-dd-text">
                            {node.title}
                          </h3>
                          {completed && stars[node.id] ? (
                            <NodeStars stars={stars[node.id]!} />
                          ) : null}
                          <p className="mt-1 text-xs font-medium text-dd-muted">
                            {labels[node.activityKind ?? 'lesson']} · {node.completedExercises}/
                            {node.exercises.length} {text('exercícios', 'exercises')}
                            {completed
                              ? text(' · Concluída', ' · Completed')
                              : active
                                ? text(' · Você está aqui', ' · You are here')
                                : ''}
                          </p>
                          {locked ? (
                            <p
                              id={`requirements-${node.id}`}
                              className={
                                mode === 'map' ? 'sr-only' : 'mt-2 text-sm leading-5 text-dd-muted'
                              }
                            >
                              {text('Conclua primeiro:', 'Complete first:')}{' '}
                              {missing.map((p) => p.title).join(', ') ||
                                text('a lição anterior', 'the previous lesson')}
                              .
                            </p>
                          ) : (
                            mode === 'trail' && (
                              <p className="mt-2 text-sm leading-5 text-dd-muted">
                                {node.description}
                              </p>
                            )
                          )}
                          {mode === 'map' && locked && (
                            <details className={styles.requirements}>
                              <summary className="dd-focus-ring">
                                {text('Como desbloquear', 'How to unlock')}
                              </summary>
                              <p>
                                {text('Conclua:', 'Complete:')}{' '}
                                {missing.map((p) => p.title).join(', ') ||
                                  text('a lição anterior', 'the previous lesson')}
                                .
                              </p>
                            </details>
                          )}
                          {mode === 'trail' && (
                            <details className="mt-3 text-sm text-dd-text">
                              <summary className="dd-focus-ring min-h-11 cursor-pointer py-2">
                                {text('Ver', 'View')} {node.exercises.length}{' '}
                                {text('exercícios', 'exercises')}
                              </summary>
                              <ul className="space-y-2 pb-2">
                                {node.exercises.map((exercise) => (
                                  <li key={exercise.id} className="flex items-start gap-2">
                                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                      {exercise.title}
                                      {exercise.completed
                                        ? ` · ${text('Concluído', 'Completed')}`
                                        : ''}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
                {unitItems.length > 0 &&
                  (() => {
                    const bossId = learningBossId(unitItems[0]!.id);
                    const unlocked = unitCompleted === unitItems.length;
                    const defeated = defeatedBosses.has(bossId);
                    const positions = [50, 34, 50, 66];
                    const x = positions[unitItems.length % positions.length];
                    const bossClass = `dd-focus-ring relative z-10 flex shrink-0 items-center justify-center rounded-full transition-transform motion-reduce:transition-none ${mode === 'map' ? `${styles.node} ${styles.bossNode}` : 'h-16 w-16 border-b-4'} ${!unlocked ? 'border-slate-600 bg-slate-700 text-slate-200' : defeated ? 'border-amber-700 bg-amber-400 text-amber-950' : 'border-rose-800 bg-rose-500 text-white hover:-translate-y-0.5'}`;
                    const icon = (
                      <Crown
                        aria-hidden="true"
                        className={mode === 'map' ? 'h-10 w-10' : 'h-7 w-7'}
                        fill={defeated ? 'currentColor' : 'none'}
                      />
                    );
                    const label = `${text('Chefão da unidade', 'Unit boss')}: ${unit}`;
                    return (
                      <li
                        key={bossId}
                        id={bossId}
                        data-learning-boss={bossId}
                        className={`relative scroll-mt-28 ${mode === 'map' ? styles.stop : 'py-5'}`}
                      >
                        <div
                          className={
                            mode === 'map' ? styles.station : 'relative flex items-start gap-4'
                          }
                          style={mode === 'map' ? { left: `${x}%` } : undefined}
                        >
                          {unlocked ? (
                            <Link
                              href={`/lesson/${bossId}?returnTo=${encodeURIComponent(returnTo)}`}
                              onClick={() => remember(bossId)}
                              aria-label={`${label}${defeated ? `: ${text('derrotado', 'defeated')}` : ''}`}
                              className={bossClass}
                            >
                              {icon}
                            </Link>
                          ) : (
                            <button
                              className={bossClass}
                              type="button"
                              aria-disabled="true"
                              aria-label={`${label}: ${text('bloqueado', 'locked')}`}
                            >
                              <LockKeyhole aria-hidden="true" className="h-8 w-8" />
                            </button>
                          )}
                          <div className={mode === 'map' ? styles.caption : 'min-w-0 flex-1 pt-1'}>
                            <h3 className="text-base font-bold leading-6 text-dd-text">
                              {text('Chefão', 'Boss')} · {unit}
                            </h3>
                            {defeated && stars[bossId] ? (
                              <NodeStars stars={stars[bossId]!} />
                            ) : null}
                            <p className="mt-1 text-xs font-medium text-dd-muted">
                              {defeated
                                ? text(
                                    'Derrotado · desafio opcional',
                                    'Defeated · optional challenge'
                                  )
                                : unlocked
                                  ? text(
                                      'Opcional · 7 etapas cronometradas',
                                      'Optional · 7 timed steps'
                                    )
                                  : text(
                                      'Conclua a unidade para enfrentar',
                                      'Finish the unit to face it'
                                    )}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })()}
              </ol>
            </section>
          );
        })}
        {mode === 'map' && currentKey && (
          <TrailMascot
            containerRef={mapRef}
            currentNodeKey={currentKey}
            progressKey={`learning:${userId}:${language}:${path.id}`}
          />
        )}
      </div>
    </section>
  );
}
