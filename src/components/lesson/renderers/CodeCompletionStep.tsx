'use client';

import { Edit3 } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface CodeCompletionStepProps {
  step: LessonStep;
  blankValues: Record<string, string>;
  onUpdateBlank: (blankId: string, value: string) => void;
  disabled?: boolean;
}

export function CodeCompletionStep({
  step,
  blankValues,
  onUpdateBlank,
  disabled = false,
}: CodeCompletionStepProps) {
  const { text } = useLocalizedText();
  const blanks = step.blanks || [];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
          <Edit3 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold leading-snug text-dd-text">
            {step.title || text('Complete o Código', 'Complete the Code')}
          </h2>
          <p className="text-base text-dd-muted leading-relaxed">
            {step.instruction ||
              text(
                'Preencha o trecho faltante para tornar o código válido',
                'Fill in the missing part to make the code valid'
              )}
          </p>
        </div>
      </div>

      {step.codeSnippet && (
        <pre className="overflow-x-auto rounded-2xl border border-dd-border bg-dd-bg p-4 font-mono text-base leading-relaxed text-dd-muted">
          <code>{step.codeSnippet}</code>
        </pre>
      )}

      <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg p-5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-base leading-loose text-dd-text">
          {step.completionPrefix && (
            <span className="whitespace-pre text-base font-medium text-dd-text">
              {step.completionPrefix}
            </span>
          )}

          {blanks.map((blank) => (
            <input
              key={blank.id}
              type="text"
              disabled={disabled}
              placeholder={blank.placeholder}
              value={blankValues[blank.id] || ''}
              onChange={(e) => onUpdateBlank(blank.id, e.target.value)}
              className="dd-focus-ring inline-block min-h-11 min-w-[120px] max-w-[200px] rounded-xl border border-blue-500/60 bg-dd-surface px-3 py-1 text-center font-mono font-semibold text-dd-text placeholder:text-dd-muted focus:border-blue-500"
            />
          ))}

          {step.completionSuffix && (
            <span className="text-dd-text whitespace-pre-wrap break-words">
              {step.completionSuffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
