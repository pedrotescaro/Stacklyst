import { isPostTextColor } from './text-colors';

export interface RichMarkdownNode {
  type: string;
  value?: string;
  url?: string;
  title?: string | null;
  depth?: number;
  lang?: string | null;
  ordered?: boolean | null;
  start?: number | null;
  children?: RichMarkdownNode[];
  data?: { hName?: string; hProperties?: Record<string, string> };
}

function openingTag(node: RichMarkdownNode) {
  if (node.type !== 'html') return null;
  if (node.value === '<u>') return { name: 'u', color: null };
  const color = /^<span data-post-color="([a-z]+)">$/.exec(node.value ?? '')?.[1];
  return isPostTextColor(color) ? { name: 'span', color } : null;
}

/** Recognize only our exact inline tags. Arbitrary HTML remains disabled. */
export function transformPostFormatting(node: RichMarkdownNode): void {
  if (!node.children || ['code', 'inlineCode'].includes(node.type)) return;
  const result: RichMarkdownNode[] = [];
  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    const opening = openingTag(child);
    if (opening) {
      let depth = 1;
      let end = index + 1;
      for (; end < node.children.length; end += 1) {
        const candidate = node.children[end];
        if (openingTag(candidate)?.name === opening.name) depth += 1;
        if (candidate.type === 'html' && candidate.value === `</${opening.name}>`) depth -= 1;
        if (depth === 0) break;
      }
      if (depth === 0) {
        const formatted: RichMarkdownNode = {
          type: opening.color ? 'postColor' : 'postUnderline',
          children: node.children.slice(index + 1, end),
          data: {
            hName: opening.name,
            ...(opening.color ? { hProperties: { 'data-post-color': opening.color } } : {}),
          },
        };
        transformPostFormatting(formatted);
        result.push(formatted);
        index = end;
        continue;
      }
    }
    transformPostFormatting(child);
    result.push(child);
  }
  node.children = result;
}

export function remarkPostFormatting() {
  return (tree: RichMarkdownNode) => transformPostFormatting(tree);
}
