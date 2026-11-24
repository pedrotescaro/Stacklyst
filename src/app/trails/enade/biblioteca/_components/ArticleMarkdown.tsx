import Link from 'next/link';
import type { ReactNode } from 'react';
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { inlineText, slugify } from '@/lib/enade/library/markdown';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node)
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  return '';
}

/** `lib:slug#secao` links to a library article, `q:id` to an official question. */
function resolveHref(href: string) {
  if (href.startsWith('lib:')) return `/trails/enade/biblioteca/${href.slice(4)}`;
  if (href.startsWith('q:')) return `/trails/enade/questoes/${href.slice(2)}`;
  return href;
}

const components: Components = {
  h2: ({ children }) => {
    const id = slugify(inlineText(textOf(children)));
    return (
      <h2 id={id}>
        <a href={`#${id}`} className="anchor" aria-hidden="true" tabIndex={-1}>
          #
        </a>
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(inlineText(textOf(children)));
    return (
      <h3 id={id}>
        <a href={`#${id}`} className="anchor" aria-hidden="true" tabIndex={-1}>
          #
        </a>
        {children}
      </h3>
    );
  },
  a: ({ href = '', children }) => {
    const target = resolveHref(href);
    if (target.startsWith('/') || target.startsWith('#'))
      return <Link href={target}>{children}</Link>;
    return (
      <a href={target} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="table-wrap" role="region" aria-label="Tabela" tabIndex={0}>
      <table>{children}</table>
    </div>
  ),
  img: ({ src, alt }) => (
    // Library images live in /public/enade/library and are authored with alt text.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} loading="lazy" />
  ),
};

export function ArticleMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { throwOnError: false, strict: 'ignore' }],
        [rehypeHighlight, { plainText: ['text', 'txt', 'pseudocodigo', 'portugol'] }],
      ]}
      components={components}
      urlTransform={(url) =>
        url.startsWith('lib:') || url.startsWith('q:') ? url : defaultUrlTransform(url)
      }
    >
      {text}
    </ReactMarkdown>
  );
}
