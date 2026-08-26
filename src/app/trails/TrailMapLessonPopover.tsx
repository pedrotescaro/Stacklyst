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
        'absolute z-50 w-[230px] rounded-xl p-3 text-left text-white shadow-xl transition-all duration-150 animate-in fade-in zoom-in-95',
        showBelow ? 'top-[calc(100%+12px)]' : 'bottom-[calc(100%+12px)]',
        horizontalAlignment
      )}
      style={{
        backgroundColor: accent,
        boxShadow: `0 4px 0 color-mix(in srgb, ${accent} 62%, #000), 0 12px 28px rgba(0, 0, 0, 0.35)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow Pointer */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute h-3 w-3 rotate-45',
          showBelow ? '-top-1' : '-bottom-1',
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
        className="dd-focus-ring absolute right-2 top-2 cursor-pointer rounded-md p-0.5 text-white/80 transition hover:bg-black/15 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Track & Stage Header */}
      <div className="flex items-center gap-1 pr-5">
        <span className="inline-flex items-center gap-0.5 rounded bg-black/20 px-1 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/90">
          <BookOpen className="h-2.5 w-2.5" />
          {path.title}
        </span>
        <span className="text-[8.5px] font-bold text-white/80">
          {stageLabel === 'Habilidade' ? 'Principal' : stageLabel}
        </span>
      </div>

      {/* Title */}
      <h2
        id={`skill-popover-title-${node.id}`}
        className="mt-1 text-xs font-black leading-snug text-white"
      >
        {node.title}
      </h2>

      {/* Stats Line */}
      <div className="mt-1.5 flex items-center gap-2 text-[9.5px] font-black uppercase tracking-wide text-white/90">
        <span className="flex items-center gap-0.5">
          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
          +{totalXp} XP
        </span>
        {estimatedMinutes && (
          <span className="flex items-center gap-0.5">
            <Clock3 className="h-2.5 w-2.5" aria-hidden="true" />
            ~{estimatedMinutes}m
          </span>
        )}
      </div>

      {/* Locked state warning */}
      {isLocked && (
        <div className="mt-2 rounded-lg bg-black/20 p-1.5 text-[9.5px] font-bold text-white/95 flex items-center gap-1">
          <Lock className="h-3 w-3 shrink-0 text-amber-300" />
          <span className="truncate">
            {missingRequired.length > 0
              ? `Requisito: ${missingRequired[0]?.title ?? 'Anterior'}`
              : 'Lição bloqueada'}
          </span>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        disabled={isLocked}
        onClick={handleStart}
        className={cn(
          'dd-focus-ring mt-2.5 flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-white px-2.5 text-[11px] font-black uppercase tracking-wide transition active:translate-y-0.5',
          isLocked
            ? 'cursor-not-allowed opacity-60'
            : 'hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0'
        )}
        style={{
          color: accent,
          boxShadow: isLocked ? undefined : '0 2.5px 0 rgba(0, 0, 0, 0.25)',
        }}
      >
        {completed ? (
          <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
        ) : isLocked ? (
          <Lock className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Play className="h-3 w-3 fill-current" aria-hidden="true" />
        )}
        {actionLabel} {completed || !isLocked ? `+${totalXp} XP` : ''}
      </button>
    </div>
  );
}
