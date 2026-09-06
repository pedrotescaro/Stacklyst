'use client';

import { BookOpen, CircleHelp, Code2, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { AssistanceMode } from '@/lib/exercises/types';

interface AssistanceControlsProps {
  value: AssistanceMode;
  onChange: (mode: AssistanceMode) => void;
  disabled?: boolean;
}

const MODES: Array<{
  id: AssistanceMode;
  title: string;
  description: string;
  xp: string;
  icon: typeof Sparkles;
}> = [
  {
    id: 'GUIDED',
    title: 'Guided',
    description: 'Dicas, documentação e autocomplete',
    xp: '100%',
    icon: Sparkles,
  },
  {
    id: 'STANDARD',
    title: 'Standard',
    description: 'Documentação e autocomplete',
    xp: '100%',
    icon: Code2,
  },
  {
    id: 'HARD',
    title: 'Hard',
    description: 'Documentação, sem sugestões',
    xp: '100%',
    icon: Shield,
  },
  {
    id: 'NO_ASSIST',
    title: 'No Assist',
    description: 'Somente enunciado, editor e testes',
    xp: '100%',
    icon: CircleHelp,
  },
];

export function AssistanceControls({ value, onChange, disabled = false }: AssistanceControlsProps) {
  return (
    <fieldset disabled={disabled}>
      <div className="flex items-center justify-between gap-3">
        <legend className="text-xs font-black uppercase tracking-[0.12em] text-dd-muted">
          Modo de assistência
        </legend>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-dd-muted">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Documentação não reduz XP
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const active = value === mode.id;

          return (
            <label
              key={mode.id}
              className={cn(
                'dd-focus-ring cursor-pointer rounded-xl border p-3 transition',
                active
                  ? 'border-blue-500 bg-blue-500/[0.07]'
                  : 'border-dd-border bg-dd-card hover:border-blue-400/60',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <input
                type="radio"
                name="assistance-mode"
                value={mode.id}
                checked={active}
                onChange={() => onChange(mode.id)}
                className="sr-only"
              />
              <span className="flex items-start gap-2">
                <Icon
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    active ? 'text-blue-500' : 'text-dd-muted'
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-dd-text">{mode.title}</span>
                    <span className="text-[10px] font-black text-blue-500">{mode.xp} XP</span>
                  </span>
                  <span className="mt-1 block text-[10px] leading-relaxed text-dd-muted">
                    {mode.description}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
