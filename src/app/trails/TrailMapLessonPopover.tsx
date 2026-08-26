'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Check,
  Clock3,
  Gauge,
  Lock,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import type { PlacedNode } from '@/app/trails/TrailMap';
import { cn } from '@/lib/cn';

export interface TrailMapLessonPopoverProps {
  placement: PlacedNode;
  onClose: () => void;
  onStartLesson?: (exerciseSlugOrId: string) => void;
}

export function TrailMapLessonPopover({
  placement,
  onClose,
  onStartLesson,
}: TrailMapLessonPopoverProps) {
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const { node, path, accent, stageLabel, point } = placement;

  const completed = node.status === 'COMPLETED' || node.status === 'MASTERED';
  const missingRequired = node.prerequisites.filter(
    (prerequisite) => prerequisite.relation === 'REQUIRED' && !prerequisite.completed
  );
  const isLocked = node.status === 'NOT_STARTED' || missingRequired.length > 0;
  const firstExercise = node.exercises[0];
  const totalXp = node.xpReward || (firstExercise ? firstExercise.baseXp : 50);
  const estimatedMinutes = node.estimatedMinutes || (firstExercise ? firstExercise.estimatedMinutes : 15);
  const difficulty = node.difficulty || (firstExercise ? firstExercise.difficulty : 1);

  const showBelow = point.y < 230;
  const horizontalAlignment =
    point.x > 260 && point.x < 1140
      ? 'left-1/2 -translate-x-1/2'
      : point.x <= 260
        ? 'left-0'
        : 'right-0';

  const arrowAlignment =
    point.x > 260 && point.x < 1140
      ? 'left-1/2 -translate-x-1/2'
      : point.x <= 260
        ? 'left-6'
        : 'right-6';

  const actionLabel = completed
    ? 'Revisar'
    : isLocked
      ? 'Bloqueado'
      : node.status === 'IN_PROGRESS'
        ? 'Continuar'
        : 'Começar lição';

  const handleStart = () => {
    if (isLocked) return;
    const targetSlug = firstExercise?.slug ?? node.slug;
    if (onStartLesson) {
      onStartLesson(targetSlug);
    } else {
      router.push(`/lesson/${targetSlug}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`skill-popover-title-${node.id}`}
      data-testid="trail-map-lesson-popover"
      className={cn(
        'absolute z-50 w-[min(290px,calc(100vw-32px))] rounded-2xl p-3.5 text-left text-white shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95',
        showBelow ? 'top-[calc(100%+14px)]' : 'bottom-[calc(100%+14px)]',
        horizontalAlignment
      )}
      style={{
        backgroundColor: accent,
        boxShadow: `0 5px 0 color-mix(in srgb, ${accent} 62%, #000), 0 18px 36px rgba(0, 0, 0, 0.4)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow Pointer */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute h-3.5 w-3.5 rotate-45',
          showBelow ? '-top-1.5' : '-bottom-1.5',
          arrowAlignment
        )}
        style={{ backgroundColor: accent }}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Fechar resumo da lição"
        className="dd-focus-ring absolute right-2.5 top-2.5 cursor-pointer rounded-lg p-1 text-white/80 transition hover:bg-black/15 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Track & Stage Badges */}
      <div className="flex items-center gap-1.5 pr-6">
        <span className="inline-flex items-center gap-1 rounded-md bg-black/20 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white/90">
          <BookOpen className="h-2.5 w-2.5" />
          {path.title}
        </span>
        <span className="text-[9.5px] font-bold text-white/80">
          {stageLabel === 'Habilidade' ? 'Principal' : stageLabel}
        </span>
      </div>

      {/* Title & Description */}
      <h2
        id={`skill-popover-title-${node.id}`}
        className="mt-1.5 text-sm font-black leading-snug text-white"
      >
        {node.title}
      </h2>
      <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-white/90 line-clamp-2">
        {node.description}
      </p>

      {/* Stats Pills */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-black uppercase tracking-wide text-white/90">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          +{totalXp} XP
        </span>
        {estimatedMinutes && (
          <span className="flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            ~{estimatedMinutes} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <Gauge className="h-3 w-3" aria-hidden="true" />
          Nível {difficulty}/5
        </span>
      </div>

      {/* Prerequisites status or exercises list */}
      {isLocked ? (
        <div className="mt-2.5 rounded-xl bg-black/20 p-2 text-[10.5px] font-bold text-white/95 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <span>
            {missingRequired.length > 0
              ? `Requisito: ${missingRequired[0]?.title ?? 'Habilidade anterior'}`
              : 'Complete as lições anteriores'}
          </span>
        </div>
      ) : node.exercises.length > 1 ? (
        <div className="mt-2.5 border-t border-white/20 pt-1.5 space-y-1">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/80">
            Exercícios ({node.exercises.length})
          </p>
          <div className="max-h-20 overflow-y-auto space-y-1 pr-1">
            {node.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-black/15 px-1.5 py-0.5 text-[10px] font-semibold text-white/90"
              >
                <span className="truncate">{exercise.title}</span>
                <span className="shrink-0 text-[8.5px] font-black opacity-80">+{exercise.baseXp} XP</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 3D Action Button */}
      <button
        type="button"
        disabled={isLocked}
        onClick={handleStart}
        className={cn(
          'dd-focus-ring mt-3 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-xs font-black uppercase tracking-wide transition active:translate-y-0.5',
          isLocked
            ? 'cursor-not-allowed opacity-60'
            : 'hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0'
        )}
        style={{
          color: accent,
          boxShadow: isLocked ? undefined : '0 3px 0 rgba(0, 0, 0, 0.25)',
        }}
      >
        {completed ? (
          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
        ) : isLocked ? (
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        )}
        {actionLabel} {completed || !isLocked ? `+${totalXp} XP` : ''}
      </button>
    </div>
  );
}
