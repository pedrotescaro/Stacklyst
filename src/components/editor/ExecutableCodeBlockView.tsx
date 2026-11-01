'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useCallback, useState } from 'react';
import { Play, Loader2, Copy, Check, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import { CODE_LANGUAGES, codemirrorLanguageId, isRunnableLanguage } from '@/lib/editor/languages';
import { runCodeInSandbox } from '@/lib/code-runner';
import { cn } from '@/lib/cn';

export function ExecutableCodeBlockView({
  node,
  updateAttributes,
  selected,
  editor,
  getPos,
  deleteNode,
}: NodeViewProps) {
  const language = (node.attrs.language as string) || 'typescript';
  const isExecutable = node.attrs.isExecutable !== false && isRunnableLanguage(language);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const code = node.textContent;

  const handleCodeChange = useCallback(
    (nextCode: string) => {
      if (typeof getPos !== 'function') return;
      const pos = getPos();
      if (pos === undefined) return;

      editor
        .chain()
        .command(({ tr }) => {
          const from = pos + 1;
          const to = pos + node.nodeSize - 1;
          if (from > to) return false;
          tr.insertText(nextCode, from, to);
          return true;
        })
        .run();
    },
    [editor, getPos, node.nodeSize]
  );

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    setError(null);
    const result = await runCodeInSandbox(code, language);
    setOutput(result.output || null);
    setError(result.error || null);
    setRunning(false);
  }, [code, language]);

  return (
    <NodeViewWrapper
      className={cn(
        'notion-code-block my-3 overflow-hidden rounded-xl border bg-dd-bg transition-colors',
        selected ? 'border-dd-accent/60' : 'border-dd-border'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dd-border bg-dd-surface/80 px-3 py-2">
        <select
          aria-label="Linguagem do código"
          value={language}
          onChange={(event) => updateAttributes({ language: event.target.value })}
          className="w-32 max-w-full shrink-0 whitespace-nowrap rounded-md border border-dd-border bg-dd-bg px-2 py-1 text-[10px] font-bold text-dd-text focus:border-dd-accent/60 focus:outline-none cursor-pointer"
          contentEditable={false}
        >
          {CODE_LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex shrink-0 items-center gap-1" contentEditable={false}>
          <button
            type="button"
            title="Copiar código"
            aria-label="Copiar código"
            className="rounded-md p-1.5 text-dd-muted hover:text-dd-text"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                setError('Não foi possível copiar. Selecione o código e copie manualmente.');
              }
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            title={expanded ? 'Recolher código' : 'Expandir código'}
            aria-label={expanded ? 'Recolher código' : 'Expandir código'}
            className="hidden rounded-md p-1.5 text-dd-muted hover:text-dd-text md:block"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            title="Remover código"
            aria-label="Remover bloco de código"
            className="rounded-md p-1.5 text-dd-muted hover:text-red-500"
            onClick={deleteNode}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {isExecutable ? (
            <button
              type="button"
              onClick={handleRun}
              disabled={running || !code.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-dd-accent px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-dd-accent/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              contentEditable={false}
            >
              {running ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              Executar
            </button>
          ) : (
            <span
              className="rounded-md border border-dd-border bg-dd-bg/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-dd-muted select-none"
              contentEditable={false}
            >
              Estático
            </span>
          )}
        </div>
      </div>

      <div className="notion-code-editor" contentEditable={false}>
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language={codemirrorLanguageId(language)}
          height={expanded ? '360px' : '180px'}
        />
      </div>

      <pre className="sr-only">
        <NodeViewContent />
      </pre>

      {(output || error) && (
        <div
          className="border-t border-dd-border bg-dd-surface/40 px-3 py-2"
          contentEditable={false}
        >
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
    </NodeViewWrapper>
  );
}
