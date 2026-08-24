'use client';

import { Play, Send, CheckCircle2, XCircle, Terminal, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DuelTestCase } from '@/lib/duel-problems';

export interface TestResultItem {
  id: string;
  passed: boolean;
  desc: string;
  error?: string;
}

interface DuelTestRunnerProps {
  testCases: DuelTestCase[];
  testResults: TestResultItem[];
  isRunning: boolean;
  isSubmitting: boolean;
  consoleOutput: string;
  onRunTests: () => void;
  onSubmitSolution: () => void;
  allPassed: boolean;
}

export function DuelTestRunner({
  testCases,
  testResults,
  isRunning,
  isSubmitting,
  consoleOutput,
  onRunTests,
  onSubmitSolution,
  allPassed,
}: DuelTestRunnerProps) {
  return (
    <div className="space-y-4">
      {/* Test Cases Panel */}
      <div className="rounded-[22px] border-2 border-b-4 border-dd-border bg-dd-surface/80 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between border-b border-dd-border/60 pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-dd-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Casos de Teste
          </h3>
          <span className="text-[11px] font-bold text-dd-muted">
            {testResults.filter((r) => r.passed).length}/{testCases.length} aprovados
          </span>
        </div>

        {/* Test Cards List */}
        <div className="space-y-2.5">
          {testCases.map((tc, index) => {
            const result = testResults.find((r) => r.id === tc.id);
            const isEvaluated = result !== undefined;
            const passed = result?.passed === true;

            return (
              <div
                key={tc.id}
                className={cn(
                  'rounded-2xl border-2 border-b-[3px] p-3.5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs',
                  !isEvaluated
                    ? 'border-dd-border/60 bg-dd-bg/60 text-dd-muted'
                    : passed
                      ? 'border-emerald-500/40 border-b-emerald-600 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/40 border-b-rose-600 bg-rose-500/10 text-rose-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-xl border-2 border-b-[3px] flex items-center justify-center font-black text-xs shrink-0',
                      !isEvaluated
                        ? 'border-dd-border border-b-dd-border bg-dd-surface text-dd-muted'
                        : passed
                          ? 'border-emerald-600 border-b-emerald-700 bg-emerald-500 text-white shadow-sm'
                          : 'border-rose-600 border-b-rose-700 bg-rose-500 text-white shadow-sm'
                    )}
                  >
                    {!isEvaluated ? index + 1 : passed ? '✓' : '✕'}
                  </div>
                  <div>
                    <p className="font-bold text-dd-text">{tc.description}</p>
                    <p className="text-[10px] text-dd-muted font-mono mt-0.5">
                      Entrada: <span className="text-dd-text font-semibold">{tc.inputDisplay}</span>{' '}
                      → Esperado:{' '}
                      <span className="text-dd-text font-semibold">{tc.expectedDisplay}</span>
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="shrink-0">
                  {!isEvaluated ? (
                    <span className="text-[10px] font-bold text-dd-muted uppercase tracking-wider">
                      Não executado
                    </span>
                  ) : passed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passou
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" /> Falhou
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons: 3D Duolingo Style (Blue 3D Primary) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Run Tests Button */}
          <button
            type="button"
            onClick={onRunTests}
            disabled={isRunning || isSubmitting}
            className="dd-touch dd-focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-700 border-b-slate-900 bg-slate-800 hover:bg-slate-750 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className={cn('w-4 h-4 fill-current', isRunning && 'animate-spin')} />
            {isRunning ? 'Executando...' : 'Testar Código'}
          </button>

          {/* Submit Solution Button (Blue 3D) */}
          <button
            type="button"
            onClick={onSubmitSolution}
            disabled={isSubmitting || isRunning}
            className="dd-touch dd-focus-ring flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-blue-600 border-b-blue-800 bg-blue-500 hover:bg-blue-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 disabled:opacity-50 cursor-pointer"
          >
            {allPassed ? (
              <>
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? 'Submetendo...' : 'Enviar Vitória!'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submetendo...' : 'Submeter Solução'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal / Output Console */}
      {consoleOutput && (
        <div className="rounded-2xl border border-dd-border bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-dd-muted text-[10px] font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
            <Terminal className="w-3.5 h-3.5" /> Saída do Console
          </div>
          <pre className="whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed text-emerald-400">
            {consoleOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
