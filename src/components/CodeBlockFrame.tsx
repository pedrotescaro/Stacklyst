'use client';

import type { MouseEvent, ReactNode } from 'react';
import { Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocalizedText } from '@/i18n/useLocalizedText';

export interface CodeBlockFrameProps {
  language: string;
  /** Highlighted code nodes rendered inside the `<code>` element. */
  children: ReactNode;
  canRun: boolean;
  running?: boolean;
  copied?: boolean;
  collapsed?: boolean;
  output?: string | null;
  error?: string | null;
  onRun?: (event: MouseEvent<HTMLButtonElement>) => void;
  onCopy?: (event: MouseEvent<HTMLButtonElement>) => void;
  onExpand?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/**
 * Presentational executable code block shared by the markdown renderer and
 * any read-only projection of a post. State, clipboard and the sandbox stay
 * with the caller; this component only draws the real block.
 */
export function CodeBlockFrame({
  language,
  children,
  canRun,
  running = false,
  copied = false,
  collapsed = false,
  output = null,
  error = null,
  onRun,
  onCopy,
  onExpand,
  className,
}: CodeBlockFrameProps) {
  const { text } = useLocalizedText();

  return (
    <div
      className={cn('my-3 overflow-hidden rounded-lg border border-dd-border bg-dd-bg', className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-dd-border bg-dd-surface px-3 py-2">
        <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-dd-muted">
          {language}
        </span>
        <div className="flex items-center gap-2">
          {canRun && (
            <button
              type="button"
              onClick={onRun}
              disabled={running}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-500 hover:bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white transition-all shadow-md shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              {text('Executar', 'Run')}
            </button>
          )}
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 rounded-full border border-dd-border bg-dd-surface/80 hover:bg-dd-surface px-3.5 py-1.5 text-xs font-bold text-dd-muted transition-colors hover:border-blue-500/40 hover:text-dd-text cursor-pointer"
          >
            {copied ? text('Copiado', 'Copied') : text('Copiar', 'Copy')}
          </button>
        </div>
      </div>

      <div className="relative">
        <pre
          className={cn(
            'm-0 overflow-x-auto bg-dd-bg p-4 font-mono text-xs leading-relaxed text-dd-text',
            collapsed && 'max-h-24 overflow-x-auto overflow-y-hidden'
          )}
        >
          <code className={cn('hljs', `language-${language}`)}>{children}</code>
        </pre>

        {collapsed && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-dd-bg via-dd-bg/95 to-transparent px-3 pb-2 pt-8">
            <button
              type="button"
              onClick={onExpand}
              className="rounded-md border border-dd-border bg-dd-surface px-2.5 py-1 text-[10px] font-bold text-dd-text shadow-sm transition-colors hover:border-dd-accent hover:text-dd-accent cursor-pointer"
            >
              {text('Ver código completo', 'View full code')}
            </button>
          </div>
        )}
      </div>

      {(output || error) && (
        <div className="border-t border-dd-border bg-dd-surface/40 px-3 py-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-dd-muted">
            Output
          </p>
          {error ? (
            <pre className="whitespace-pre-wrap font-mono text-xs text-red-400">{error}</pre>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs text-dd-text">{output}</pre>
          )}
        </div>
      )}
    </div>
  );
}
