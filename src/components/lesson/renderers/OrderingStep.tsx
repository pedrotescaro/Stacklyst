'use client';

import { ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';
import type { LessonStep, OrderItem } from '@/lib/lessons/types';

interface OrderingStepProps {
  step: LessonStep;
  currentOrder: OrderItem[];
  onReorder: (newOrder: OrderItem[]) => void;
  disabled?: boolean;
}

export function OrderingStep({
  step,
  currentOrder,
  onReorder,
  disabled = false,
}: OrderingStepProps) {
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (disabled) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const next = [...currentOrder];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <ListOrdered className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold leading-snug text-dd-text">
            {step.title || 'Ordene o Código'}
          </h2>
          <p className="text-base text-dd-muted leading-relaxed">
            {step.instruction || 'Reorganize as linhas na sequência correta de execução'}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        {currentOrder.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === currentOrder.length - 1;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-dd-border bg-dd-bg p-3.5 transition-all hover:border-amber-500/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-dd-border/80 text-sm font-semibold text-dd-muted">
                  {index + 1}
                </span>
                <code className="font-mono text-base font-medium text-dd-text whitespace-pre-wrap break-words">
                  {item.text}
                </code>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={disabled || isFirst}
                  onClick={() => moveItem(index, 'up')}
                  aria-label="Mover para cima"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-dd-surface hover:bg-dd-border text-dd-text disabled:opacity-30 dd-focus-ring cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={disabled || isLast}
                  onClick={() => moveItem(index, 'down')}
                  aria-label="Mover para baixo"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-dd-surface hover:bg-dd-border text-dd-text disabled:opacity-30 dd-focus-ring cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
