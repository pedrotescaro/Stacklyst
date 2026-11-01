'use client';

import { Code2, Play, Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import type { LessonStep } from '@/lib/lessons/types';

interface CodeEditorStepProps {
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

export function CodeEditorStep({
  step,
  code,
  onChangeCode,
  language,
  onRunCode,
  isRunning = false,
  runOutput = null,
  runError = null,
  disabled = false,
}: CodeEditorStepProps) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      <div className="space-y-2">
        <h2 className="text-xl font-bold leading-snug text-dd-text">{step.title}</h2>
        {step.instruction && (
          <p className="text-base text-dd-text leading-relaxed">{step.instruction}</p>
        )}
      </div>

      {step.testCases && step.testCases.length > 0 && (
        <section
          aria-labelledby={`test-cases-${step.id}`}
          className="rounded-2xl border border-dd-border bg-dd-surface p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 id={`test-cases-${step.id}`} className="text-sm font-semibold text-dd-text">
              Casos de teste
            </h3>
            <span className="text-sm font-medium text-dd-muted">
              {step.testCases.length}{' '}
              {step.testCases.length === 1 ? 'caso visível' : 'casos visíveis'}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {step.testCases.map((testCase) => (
              <div key={testCase.id} className="min-w-0 rounded-xl bg-dd-bg p-3">
                <p className="break-words text-base leading-relaxed text-dd-text">
                  {testCase.description}
                </p>
                {testCase.expectedOutput && (
                  <div className="mt-2 break-words font-mono text-sm text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {testCase.expectedOutput}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Editor Box */}
      <div className="rounded-2xl border border-dd-border bg-dd-bg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-dd-surface border-b border-dd-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-dd-text">{language}</span>
          </div>

          <button
            type="button"
            onClick={onRunCode}
            disabled={isRunning || disabled}
            className="dd-focus-ring flex min-h-11 items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Testar Código</span>
              </>
            )}
          </button>
        </div>

        <div className="p-1 min-h-[220px]">
          <CodeEditor
            value={code}
            onChange={onChangeCode}
            language={language}
            height="240px"
            readOnly={disabled}
          />
        </div>
      </div>

      {/* Console Output */}
      {(runOutput !== null || runError !== null) && (
        <div className="rounded-2xl border border-dd-border bg-dd-bg font-mono text-sm overflow-hidden animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-dd-surface border-b border-dd-border">
            <div className="flex items-center gap-2 text-dd-muted">
              <TerminalIcon className="w-3.5 h-3.5" />
              <span className="font-bold">Console</span>
            </div>
            {step.expectedOutput && (
              <span className="text-xs text-dd-muted">
                Esperado:{' '}
                <code className="text-base font-medium text-dd-text">{step.expectedOutput}</code>
              </span>
            )}
          </div>

          <div className="p-4 space-y-2">
            {runOutput && (
              <div className="text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap break-words leading-relaxed">
                {runOutput}
              </div>
            )}

            {runError && (
              <div className="text-red-700 dark:text-red-400 whitespace-pre-wrap break-words leading-relaxed">
                {runError}
              </div>
            )}

            {!runOutput && !runError && (
              <div className="text-dd-muted italic">
                Clique em &quot;Executar&quot; para compilar e testar sua solução.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
