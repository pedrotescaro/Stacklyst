'use client';

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import './MarkdownRenderer.css';
import { cn } from '@/lib/cn';
import { Play, Loader2 } from 'lucide-react';
import { runCodeInSandbox } from '@/lib/code-runner';
import { isRunnableLanguage } from '@/lib/editor/languages';

interface MarkdownRendererProps {
  content: string;
  compact?: boolean;
}

interface MarkdownNode {
  type: string;
  value?: string;
  url?: string;
  title?: string | null;
  children?: MarkdownNode[];
}

const mentionPattern = /(?<![\w.-])@([A-Za-z0-9_]{1,20})/g;

function splitMentions(value: string): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(mentionPattern)) {
    const matchText = match[0];
    const username = match[1];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push({ type: 'text', value: value.slice(lastIndex, index) });
    }

    nodes.push({
      type: 'link',
      url: `/profile/${username}`,
      title: null,
      children: [{ type: 'text', value: matchText }],
    });

    lastIndex = index + matchText.length;
  }

  if (lastIndex < value.length) {
    nodes.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', value }];
}

function transformMentions(node: MarkdownNode) {
  if (!node.children) return;

  const nextChildren: MarkdownNode[] = [];

  for (const child of node.children) {
    if (child.type === 'text' && child.value) {
      nextChildren.push(...splitMentions(child.value));
      continue;
    }

    if (!['link', 'linkReference', 'inlineCode', 'code'].includes(child.type)) {
      transformMentions(child);
    }

    nextChildren.push(child);
  }

  node.children = nextChildren;
}

function remarkMentions() {
  return (tree: MarkdownNode) => {
    transformMentions(tree);
  };
}

function isSafeHref(href?: string) {
  if (!href) return false;
  const trimmed = href.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return false;
  }

  return (
    lower.startsWith('https://') ||
    lower.startsWith('http://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('//'))
  );
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function extractText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return extractText(child.props.children);
      }

      return '';
    })
    .join('');
}

function SafeLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!isSafeHref(href)) {
    return <span>{children}</span>;
  }

  const safeHref = href ?? '#';
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation();

  if (safeHref.startsWith('/')) {
    return (
      <Link
        href={safeHref}
        onClick={handleClick}
        className="font-semibold text-dd-accent hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={safeHref}
      target={isExternalHref(safeHref) ? '_blank' : undefined}
      rel={isExternalHref(safeHref) ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      className="font-semibold text-dd-accent hover:underline"
    >
      {children}
    </a>
  );
}

function SafeImage({ src, alt }: { src?: string; alt?: string }) {
  const [hidden, setHidden] = useState(false);

  if (!src || hidden || !src.trim().toLowerCase().startsWith('https://')) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={800}
      height={400}
      className="my-3 max-w-full rounded-lg border border-dd-border"
      onError={() => setHidden(true)}
    />
  );
}

function renderStaticCode(code: string) {
  if (!code) return null;
  const lines = code.split('\n');
  return (
    <pre className="font-mono text-[11px] leading-relaxed text-dd-text">
      <code>
        {lines.map((line, idx) => {
          let html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

          // Highlight keywords
          const keywords =
            /\b(const|let|var|function|return|fn|impl|pub|use|import|from|def|class|async|await|struct|enum|if|else|for|while|match)\b/g;
          html = html.replace(keywords, '<span class="text-blue-400 font-semibold">$1</span>');

          // Highlight types
          const types =
            /\b(string|number|boolean|any|void|User|Post|Language|int|float|str|char)\b/g;
          html = html.replace(types, '<span class="text-cyan-400 font-medium">$1</span>');

          // Highlight comments
          if (html.includes('//')) {
            const parts = html.split('//');
            html =
              parts[0] +
              '<span class="text-dd-muted italic">//' +
              parts.slice(1).join('//') +
              '</span>';
          } else if (html.startsWith('#') || html.includes(' #')) {
            const parts = html.split('#');
            html =
              parts[0] +
              '<span class="text-dd-muted italic">#' +
              parts.slice(1).join('#') +
              '</span>';
          }

          return (
            <div key={idx} className="table-row">
              <span className="table-cell text-right pr-4 select-none opacity-20 text-[9px] w-6">
                {idx + 1}
              </span>
              <span className="table-cell" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          );
        })}
      </code>
    </pre>
  );
}

function CodeBlock({
  children,
  className,
  compact,
  onRunStart,
}: {
  children: ReactNode;
  className?: string;
  compact: boolean;
  onRunStart?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const code = extractText(children).replace(/\n$/, '');
  const rawLanguage = className?.match(/language-([^\s]+)/)?.[1] ?? 'text';
  const isStatic = rawLanguage.endsWith('-static');
  const language = isStatic ? rawLanguage.slice(0, -7) : rawLanguage;
  const lineCount = code.split('\n').length;
  const collapsed = compact && lineCount > 3 && !expanded;
  const canRun = !isStatic && isRunnableLanguage(language);

  if (isStatic) {
    return (
      <div className="my-3 overflow-x-auto rounded-lg border border-dd-border bg-dd-bg p-4 shadow-inner max-h-60">
        {renderStaticCode(code)}
      </div>
    );
  }

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setExpanded(true);
    onRunStart?.();
    setRunning(true);
    setOutput(null);
    setError(null);
    const result = await runCodeInSandbox(code, language);
    setOutput(result.output || null);
    setError(result.error || null);
    setRunning(false);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-dd-border bg-dd-bg">
      <div className="flex items-center justify-between gap-3 border-b border-dd-border bg-dd-surface px-3 py-2">
        <span className="truncate font-mono text-[10px] font-bold uppercase tracking-wider text-dd-muted">
          {language}
        </span>
        <div className="flex items-center gap-2">
          {canRun && (
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-500 hover:bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white transition-all shadow-md shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              Executar
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-full border border-dd-border bg-dd-surface/80 hover:bg-dd-surface px-3.5 py-1.5 text-xs font-bold text-dd-muted transition-colors hover:border-blue-500/40 hover:text-dd-text cursor-pointer"
          >
            {copied ? 'Copiado' : 'Copiar'}
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
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(true);
              }}
              className="rounded-md border border-dd-border bg-dd-surface px-2.5 py-1 text-[10px] font-bold text-dd-text shadow-sm transition-colors hover:border-dd-accent hover:text-dd-accent cursor-pointer"
            >
              Ver código completo
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

export function MarkdownRenderer({ content, compact = false }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [content, compact]);

  useEffect(() => {
    if (!compact || expanded) {
      setCanExpand(false);
      return;
    }

    const element = contentRef.current;
    if (!element) return;

    const updateOverflow = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 4);
    };

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(element);

    return () => observer.disconnect();
  }, [compact, content, expanded]);

  const components = useMemo<Components>(
    () => ({
      h1: ({ children }) => (
        <h1 className="mb-3 border-b border-dd-border pb-2 text-xl font-bold text-dd-text">
          {children}
        </h1>
      ),
      h2: ({ children }) => <h2 className="mb-2 text-lg font-bold text-dd-text">{children}</h2>,
      h3: ({ children }) => (
        <h3 className="mb-2 text-base font-semibold text-dd-text">{children}</h3>
      ),
      p: ({ children }) => <p className="my-2 text-sm leading-relaxed text-dd-text">{children}</p>,
      a: ({ href, children }) => <SafeLink href={href}>{children}</SafeLink>,
      blockquote: ({ children }) => (
        <blockquote className="my-3 border-l-4 border-dd-accent bg-dd-accent/5 py-2 pl-4 text-sm italic text-dd-muted">
          {children}
        </blockquote>
      ),
      code: ({ children }) => (
        <code className="rounded bg-dd-surface px-1.5 py-0.5 font-mono text-xs text-dd-accent">
          {children}
        </code>
      ),
      pre: ({ children }) => {
        const child = Children.only(children);

        if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
          return (
            <CodeBlock
              className={child.props.className}
              compact={compact}
              onRunStart={() => setExpanded(true)}
            >
              {child.props.children}
            </CodeBlock>
          );
        }

        return <pre className="overflow-x-auto rounded-lg bg-dd-bg p-4">{children}</pre>;
      },
      ul: ({ children }) => (
        <ul className="my-2 list-inside list-disc space-y-1 text-sm text-dd-text">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="my-2 list-inside list-decimal space-y-1 text-sm text-dd-text">{children}</ol>
      ),
      li: ({ children }) => <li className="text-sm leading-relaxed text-dd-text">{children}</li>,
      input: ({ type, checked }) => {
        if (type === 'checkbox') {
          return (
            <input
              type="checkbox"
              checked={Boolean(checked)}
              disabled
              readOnly
              className="accent-dd-accent cursor-default align-middle"
            />
          );
        }

        return <input type={type} disabled />;
      },
      table: ({ children }) => (
        <div className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-left">{children}</table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-dd-surface">{children}</thead>,
      th: ({ children }) => (
        <th className="border border-dd-border bg-dd-surface px-3 py-2 text-xs font-semibold text-dd-text">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border border-dd-border px-3 py-2 text-sm text-dd-text">{children}</td>
      ),
      tr: ({ children }) => (
        <tr className="transition-colors hover:bg-dd-surface/50">{children}</tr>
      ),
      hr: () => <hr className="my-4 border-dd-border" />,
      img: ({ src, alt }) => (
        <SafeImage src={typeof src === 'string' ? src : undefined} alt={alt} />
      ),
    }),
    [compact]
  );

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          'dd-markdown text-sm leading-relaxed text-dd-text',
          compact &&
            !expanded &&
            (content.includes('```') ? 'max-h-72 overflow-hidden' : 'max-h-36 overflow-hidden')
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMentions]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>

      {compact && !expanded && canExpand && (
        <div className="absolute inset-x-0 bottom-0 flex justify-start bg-gradient-to-t from-dd-card via-dd-card/95 to-transparent px-0 pb-0 pt-10">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(true);
            }}
            className="rounded-md border border-dd-border bg-dd-surface px-2.5 py-1 text-[10px] font-bold text-dd-text shadow-sm transition-colors hover:border-dd-accent hover:text-dd-accent cursor-pointer"
          >
            Ver mais
          </button>
        </div>
      )}
    </div>
  );
}
