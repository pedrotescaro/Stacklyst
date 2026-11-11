'use client';

import { Bug, Play, Loader2, Terminal as TerminalIcon } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import type { LessonStep } from '@/lib/lessons/types';
import { useLocalizedText } from '@/i18n/useLocalizedText';

interface DebugStepProps {
  step: LessonStep;
  code: string;
  onChangeCode: (code: string) => void;
  language: string;
  onRunCode: () => Promise<void>;
  isRunning?: boolean;
  runOutput?: string | null;
  runError?: string | null;
  disabled?: boolean;
}

export function DebugStep({
  step,
  code,
  onChangeCode,
  language,
  onRunCode,
  isRunning = false,
  runOutput = null,
  runError = null,
  disabled = false,
}: DebugStepProps) {
  const { text } = useLocalizedText();
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-fade-in font-sans">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-snug text-dd-text">
              {step.title || text('Desafio de Debug', 'Debug Challenge')}
            </h2>
            <p className="text-base text-dd-muted leading-relaxed">
              {step.instruction ||
                text(
                  'Encontre os erros no código e faça os testes passarem',
                  'Find the bugs in the code and make the tests pass'
                )}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || isRunning}
          onClick={onRunCode}
          className="dd-focus-ring flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{text('Depurando...', 'Debugging...')}</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{text('Testar Correção', 'Test Fix')}</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dd-border bg-dd-surface px-4 py-2 text-sm text-dd-text">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            {text('Código com Bug (Corrija abaixo)', 'Buggy Code (Fix below)')}
          </span>
          <span className="text-xs font-medium text-dd-muted">{language}</span>
        </div>

        <CodeEditor
          value={code}
          onChange={onChangeCode}
          language={language}
          height="220px"
          readOnly={disabled}
        />
      </div>

      {(runOutput !== null || runError !== null) && (
        <div className="overflow-hidden rounded-2xl border border-dd-border bg-dd-bg font-mono text-sm">
          <div className="flex items-center justify-between border-b border-dd-border bg-dd-surface px-4 py-2 text-dd-muted">
            <span className="flex items-center gap-2 font-semibold">
              <TerminalIcon className="h-3.5 w-3.5 text-dd-muted" />
              {text('Resultado dos Testes', 'Test Results')}
            </span>
          </div>

          <div className="p-4 space-y-2">
            {runOutput && (
              <div className="text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap break-words leading-relaxed">
                {runOutput}
              </div>
            )}
            {runError && (
              <div className="text-rose-700 dark:text-rose-400 whitespace-pre-wrap break-words leading-relaxed">
                {runError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
