'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, BookOpen, Check, Code2, LockKeyhole, RotateCcw, Star } from 'lucide-react';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';
import { isKnowledgeCompleted } from '@/lib/learning/progress';
import { TrailMascot } from './TrailMascot';
import styles from './LearningJourney.module.css';

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
const labels = { lesson: 'Lição', review: 'Revisão', project: 'Projeto' };
export function LearningJourney({
  nodes,
  path,
  mode,
  language,
  userId,
}: {
  nodes: KnowledgeMapNode[];
  path: LearningPathSummary;
  mode: 'map' | 'trail';
  language: string;
  userId: string;
}) {
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
      <div className="py-6 sm:py-8">
        <h1
          id="journey-title"
          className="text-2xl font-bold tracking-tight text-dd-text sm:text-3xl"
        >
          {path.title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-dd-muted">{path.description}</p>
        <p className="mt-4 text-sm text-dd-text">
          {path.completedNodes}/{items.length} lições · {completedCount}/{exerciseCount} exercícios
          · {units.length} unidades
        </p>
        <progress
          className="mt-3 h-2 w-full accent-blue-500"
          max={Math.max(1, exerciseCount)}
          value={completedCount}
          aria-label="Exercícios concluídos"
        />
        {next && (
          <Link
            onClick={() => remember(next.id)}
            href={nodeHref(next, returnTo) ?? '#'}
            className="dd-focus-ring mt-5 inline-flex min-h-12 items-center gap-3 rounded-xl bg-blue-500 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-600"
          >
            {next.status === 'IN_PROGRESS' ? 'Continuar' : 'Começar'}: {next.title}
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        )}
        {!next && path.completedNodes === items.length && (
          <p role="status" className="mt-4 font-semibold text-emerald-500">
            Caminho concluído. Você pode revisar qualquer lição.
          </p>
        )}
      </div>
      <nav aria-label="Unidades da trilha" className="mb-6 flex gap-2 overflow-x-auto pb-3">
        {units.map((unit, index) => (
          <a
            key={unit}
            href={`#unit-${path.id}-${index}`}
            className="dd-focus-ring flex min-h-11 shrink-0 items-center rounded-lg border border-dd-border px-3 text-sm font-medium text-dd-text hover:bg-dd-surface"
          >
            {index + 1}. {unit}
          </a>
        ))}
      </nav>
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
                  Unidade {unitIndex + 1} · {unit}
                </h2>
                <p className="mt-1 text-sm text-white">
                  {unitCompleted}/{unitItems.length} lições ·{' '}
                  {unitItems.reduce((n, l) => n + l.completedExercises, 0)}/
                  {unitItems.reduce((n, l) => n + l.exercises.length, 0)} exercícios
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
                      {mode === 'map' && index < unitItems.length - 1 && (
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
                          <span className={styles.nextLabel}>SUA PRÓXIMA LIÇÃO</span>
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
                            aria-label={`${node.title}: ${completed ? 'revisar' : active ? 'próxima lição' : 'abrir'}`}
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
                          <p className="mt-1 text-xs font-medium text-dd-muted">
                            {labels[node.activityKind ?? 'lesson']} · {node.completedExercises}/
                            {node.exercises.length} exercícios
                            {completed ? ' · Concluída' : active ? ' · Você está aqui' : ''}
                          </p>
                          {locked ? (
                            <p
                              id={`requirements-${node.id}`}
                              className={
                                mode === 'map' ? 'sr-only' : 'mt-2 text-sm leading-5 text-dd-muted'
                              }
                            >
                              Conclua primeiro:{' '}
                              {missing.map((p) => p.title).join(', ') || 'a lição anterior'}.
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
                              <summary className="dd-focus-ring">Como desbloquear</summary>
                              <p>
                                Conclua:{' '}
                                {missing.map((p) => p.title).join(', ') || 'a lição anterior'}.
                              </p>
                            </details>
                          )}
                          {mode === 'trail' && (
                            <details className="mt-3 text-sm text-dd-text">
                              <summary className="dd-focus-ring min-h-11 cursor-pointer py-2">
                                Ver {node.exercises.length} exercícios
                              </summary>
                              <ul className="space-y-2 pb-2">
                                {node.exercises.map((exercise) => (
                                  <li key={exercise.id} className="flex items-start gap-2">
                                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                      {exercise.title}
                                      {exercise.completed ? ' · Concluído' : ''}
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
