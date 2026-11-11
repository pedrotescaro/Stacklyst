'use client';

import { Terminal as TerminalIcon, CornerDownLeft } from 'lucide-react';
import type { LessonStep } from '@/lib/lessons/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface TerminalStepProps {
  step: LessonStep;
  command: string;
  onChangeCommand: (cmd: string) => void;
  onSubmitCommand: () => void;
  disabled?: boolean;
}

export function TerminalStep({
  step,
  command,
  onChangeCommand,
  onSubmitCommand,
  disabled = false,
}: TerminalStepProps) {
  const { text } = useLocalizedText();
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in font-sans">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          <TerminalIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold leading-snug text-dd-text">
            {step.title || 'Terminal Interativo'}
          </h2>
          <p className="text-base text-dd-muted leading-relaxed">
            {step.instruction ||
              text(
                'Digite o comando apropriado no terminal abaixo',
                'Type the appropriate command in the terminal below'
              )}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg p-5 font-mono">
        <div className="flex items-center gap-2 text-xs text-dd-muted mb-4 border-b border-dd-border pb-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 font-bold text-dd-text">bash — stacklyst@cloud-runner</span>
        </div>

        <div className="flex items-center gap-2 text-base">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold select-none">
            $
          </span>
          <input
            type="text"
            disabled={disabled}
            autoFocus
            value={command}
            onChange={(e) => onChangeCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmitCommand();
              }
            }}
            placeholder={text('digite o comando...', 'type the command...')}
            className="dd-focus-ring min-h-11 min-w-0 flex-1 rounded bg-transparent font-mono text-dd-text placeholder:text-dd-muted"
          />
          <button
            type="button"
            disabled={disabled || !command.trim()}
            onClick={onSubmitCommand}
            aria-label={text('Executar comando', 'Run command')}
            className="dd-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
