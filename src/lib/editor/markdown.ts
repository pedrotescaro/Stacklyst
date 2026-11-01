import type { JSONContent } from '@tiptap/core';
import type { Root } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import { isPostTextColor } from './text-colors';
import { transformPostFormatting, type RichMarkdownNode } from './safe-inline';

const markdown = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, {
  bullet: '-',
  emphasis: '*',
  strong: '*',
  fences: true,
});

function serializeInline(nodes: JSONContent[] = []): RichMarkdownNode[] {
  return nodes.flatMap((node): RichMarkdownNode[] => {
    if (node.type === 'hardBreak') return [{ type: 'break' }];
    if (node.type !== 'text' || !node.text) return [];
    const marks = node.marks ?? [];
    if (marks.some((mark) => mark.type === 'code'))
      return [{ type: 'inlineCode', value: node.text }];
    let children: RichMarkdownNode[] = [{ type: 'text', value: node.text }];
    for (const [mark, type] of [
      ['bold', 'strong'],
      ['italic', 'emphasis'],
      ['strike', 'delete'],
    ]) {
      if (marks.some((item) => item.type === mark)) children = [{ type, children }];
    }
    if (marks.some((mark) => mark.type === 'underline')) {
      children = [{ type: 'html', value: '<u>' }, ...children, { type: 'html', value: '</u>' }];
    }
    const color = marks.find((mark) => mark.type === 'postColor')?.attrs?.color;
    if (isPostTextColor(color)) {
      children = [
        { type: 'html', value: `<span data-post-color="${color}">` },
        ...children,
        { type: 'html', value: '</span>' },
      ];
    }
    const href = marks.find((mark) => mark.type === 'link')?.attrs?.href;
    if (typeof href === 'string') children = [{ type: 'link', url: href, children }];
    return children;
  });
}

function serializeBlock(node: JSONContent): RichMarkdownNode[] {
  switch (node.type) {
    case 'paragraph':
      return [{ type: 'paragraph', children: serializeInline(node.content) }];
    case 'heading':
      return [
        { type: 'heading', depth: node.attrs?.level ?? 2, children: serializeInline(node.content) },
      ];
    case 'bulletList':
    case 'orderedList':
      return [
        {
          type: 'list',
          ordered: node.type === 'orderedList',
          start: node.attrs?.start ?? 1,
          children: (node.content ?? []).map((item) => ({
            type: 'listItem',
            children: (item.content ?? []).flatMap(serializeBlock),
          })),
        },
      ];
    case 'codeBlock': {
      const language = node.attrs?.language || 'typescript';
      return [
        {
          type: 'code',
          lang: `${language}${node.attrs?.isExecutable === false ? '-static' : ''}`,
          value: (node.content ?? []).map((child) => child.text ?? '').join(''),
        },
      ];
    }
    case 'blockquote':
      return [{ type: 'blockquote', children: (node.content ?? []).flatMap(serializeBlock) }];
    case 'horizontalRule':
      return [{ type: 'thematicBreak' }];
    default:
      return [];
  }
}

export function docToMarkdown(doc: JSONContent): string {
  const tree = { type: 'root', children: (doc.content ?? []).flatMap(serializeBlock) };
  return markdown.stringify(tree as unknown as Root).trim();
}

function parseInline(
  nodes: RichMarkdownNode[] = [],
  marks: NonNullable<JSONContent['marks']> = []
): JSONContent[] {
  return nodes.flatMap((node): JSONContent[] => {
    if (node.type === 'text' || node.type === 'html') {
      return node.value
        ? [{ type: 'text', text: node.value, ...(marks.length ? { marks } : {}) }]
        : [];
    }
    if (node.type === 'break') return [{ type: 'hardBreak' }];
    if (node.type === 'inlineCode')
      return [{ type: 'text', text: node.value ?? '', marks: [{ type: 'code' }] }];
    const mark = {
      strong: 'bold',
      emphasis: 'italic',
      delete: 'strike',
      postUnderline: 'underline',
      postColor: 'postColor',
      link: 'link',
    }[node.type];
    if (!mark) return parseInline(node.children, marks);
    const attrs =
      mark === 'link'
        ? { href: node.url }
        : mark === 'postColor'
          ? { color: node.data?.hProperties?.['data-post-color'] }
          : undefined;
    return parseInline(node.children, [...marks, { type: mark, ...(attrs ? { attrs } : {}) }]);
  });
}

function parseBlock(node: RichMarkdownNode): JSONContent[] {
  switch (node.type) {
    case 'paragraph':
      return [{ type: 'paragraph', content: parseInline(node.children) }];
    case 'heading':
      return [
        {
          type: 'heading',
          attrs: { level: Math.max(2, Math.min(3, node.depth ?? 2)) },
          content: parseInline(node.children),
        },
      ];
    case 'code': {
      const raw = node.lang || 'typescript';
      const isExecutable = !raw.endsWith('-static');
      return [
        {
          type: 'codeBlock',
          attrs: { language: isExecutable ? raw : raw.slice(0, -7), isExecutable },
          content: node.value ? [{ type: 'text', text: node.value }] : [],
        },
      ];
    }
    case 'list':
      return [
        {
          type: node.ordered ? 'orderedList' : 'bulletList',
          ...(node.ordered ? { attrs: { start: node.start ?? 1 } } : {}),
          content: (node.children ?? []).map((child) => ({
            type: 'listItem',
            content: (child.children ?? []).flatMap(parseBlock),
          })),
        },
      ];
    case 'blockquote':
      return [{ type: 'blockquote', content: (node.children ?? []).flatMap(parseBlock) }];
    case 'thematicBreak':
      return [{ type: 'horizontalRule' }];
    case 'html':
      return [{ type: 'paragraph', content: [{ type: 'text', text: node.value ?? '' }] }];
    default:
      return node.children?.flatMap(parseBlock) ?? [];
  }
}

export function markdownToDoc(value: string): JSONContent {
  const tree = markdown.parse(value) as unknown as RichMarkdownNode;
  transformPostFormatting(tree);
  const content = (tree.children ?? []).flatMap(parseBlock);
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}
