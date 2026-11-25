/**
 * Authoring format of the ENADE study library.
 *
 * Articles are Markdown (GFM + `$math$`) with a small set of block directives,
 * so maintainers can write rich pages without touching the interface:
 *
 *   :::tip Título opcional        callouts: tip, trap, enade, example, note,
 *   texto em Markdown              definition, mnemonic, warning, summary
 *   :::
 *   :::details Título              collapsible block
 *   :::quiz                        JSON array of authored questions
 *   ::widget truth-table expr="p -> q"
 *   ::figure{id="modelo-v"}        authored SVG from the figure registry
 *   ::question 2014-objective-24   card linking to an official INEP question
 *
 * Directive lines inside fenced code are ignored, so code samples can contain
 * anything. This module is pure: it is shared by the server loader and tests.
 */

export const CALLOUT_VARIANTS = [
  'tip',
  'trap',
  'enade',
  'example',
  'note',
  'definition',
  'mnemonic',
  'warning',
  'summary',
] as const;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export type QuizItem = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ArticleBlock =
  | { type: 'markdown'; text: string }
  | { type: 'callout'; variant: CalloutVariant; title: string; text: string }
  | { type: 'details'; title: string; text: string }
  | { type: 'quiz'; items: QuizItem[] }
  | { type: 'widget'; name: string; props: Record<string, string> }
  | { type: 'question'; id: string; note: string }
  | { type: 'figure'; id: string };

export type TocEntry = { depth: 2 | 3; text: string; id: string };

export type Frontmatter = Record<string, string | string[] | number>;

export function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return { data: {}, body: text };
  const end = text.indexOf('\n---', 4);
  if (end < 0) throw new Error('Frontmatter sem fechamento.');
  const data: Frontmatter = {};
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!match) throw new Error(`Linha de frontmatter inválida: ${line}`);
    const [, key, value] = match;
    data[key] = parseValue(value.trim());
  }
  return { data, body: text.slice(end + 4).replace(/^\n/, '') };
}

function parseValue(value: string): string | string[] | number {
  if (value.startsWith('[') && value.endsWith(']'))
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => unquote(item.trim()))
      .filter(Boolean);
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return unquote(value);
}

function unquote(value: string) {
  return /^(["']).*\1$/.test(value) ? value.slice(1, -1) : value;
}

/** Attributes in `key=value` or `key="value with spaces"` form. */
export function parseAttributes(source: string): Record<string, string> {
  const props: Record<string, string> = {};
  const pattern = /([A-Za-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) props[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  return props;
}

const FENCE = /^(\s*)(`{3,}|~{3,})/;
const LEGACY_DIAGRAM = /^\s*(?:>\s*)*(?:(?:[-+*]|\d+[.)])\s+)?(?:`{3,}|~{3,})\s*mermaid(?:\s|$)/i;
const FIGURE = /^::figure\{\s*id\s*=\s*"([a-z0-9]+(?:-[a-z0-9]+)*)"\s*\}$/;

function rejectLegacyDiagram(line: string, index: number) {
  if (LEGACY_DIAGRAM.test(line)) {
    throw new Error(`Linha ${index + 1}: bloco Mermaid legado. Use ::figure{id="…"}.`);
  }
}

export function parseBlocks(body: string): ArticleBlock[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const blocks: ArticleBlock[] = [];
  let buffer: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) blocks.push({ type: 'markdown', text });
    buffer = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = FENCE.exec(line);
    if (fence) {
      buffer.push(line);
      if (fenceMatch && fenceMatch[2].startsWith(fence[0]) && fenceMatch[2].length >= fence.length)
        fence = null;
      continue;
    }
    rejectLegacyDiagram(line, i);
    if (fenceMatch) {
      fence = fenceMatch[2];
      buffer.push(line);
      continue;
    }
    const directive = line.trim();
    if (/^::figure(?:\b|\{)/.test(directive)) {
      const figure = FIGURE.exec(directive);
      if (!figure) throw new Error(`Linha ${i + 1}: diretiva ::figure inválida.`);
      flush();
      blocks.push({ type: 'figure', id: figure[1] });
      continue;
    }
    const single = /^::(widget|question)\s+(\S+)\s*(.*)$/.exec(line.trim());
    if (single) {
      flush();
      const [, kind, name, rest] = single;
      if (kind === 'widget') blocks.push({ type: 'widget', name, props: parseAttributes(rest) });
      else blocks.push({ type: 'question', id: name, note: rest.trim() });
      continue;
    }
    const open = /^:::(\w+)\s*(.*)$/.exec(line.trim());
    if (open && open[1] !== '') {
      flush();
      const [, kind, title] = open;
      const inner: string[] = [];
      let innerFence: string | null = null;
      let closed = false;
      for (i = i + 1; i < lines.length; i++) {
        const current = lines[i];
        const currentFence = FENCE.exec(current);
        if (innerFence) {
          if (
            currentFence &&
            currentFence[2].startsWith(innerFence[0]) &&
            currentFence[2].length >= innerFence.length
          )
            innerFence = null;
        } else {
          rejectLegacyDiagram(current, i);
          if (currentFence) innerFence = currentFence[2];
          else if (current.trim() === ':::') {
            closed = true;
            break;
          }
        }
        inner.push(current);
      }
      if (!closed) throw new Error(`Bloco :::${kind} sem fechamento.`);
      const text = inner.join('\n').trim();
      if (kind === 'details') blocks.push({ type: 'details', title: title.trim(), text });
      else if (kind === 'quiz') blocks.push({ type: 'quiz', items: parseQuiz(text) });
      else if ((CALLOUT_VARIANTS as readonly string[]).includes(kind))
        blocks.push({
          type: 'callout',
          variant: kind as CalloutVariant,
          title: title.trim(),
          text,
        });
      else throw new Error(`Bloco desconhecido: :::${kind}`);
      continue;
    }
    buffer.push(line);
  }
  if (fence) throw new Error('Bloco de código sem fechamento.');
  flush();
  return blocks;
}

function parseQuiz(text: string): QuizItem[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed) || !parsed.length) throw new Error('Miniquestionário vazio.');
  return parsed.map((item, index) => {
    const value = item as Partial<QuizItem>;
    if (
      typeof value.question !== 'string' ||
      !Array.isArray(value.options) ||
      value.options.length < 2 ||
      value.options.some((o) => typeof o !== 'string') ||
      typeof value.answer !== 'number' ||
      !Number.isInteger(value.answer) ||
      value.answer < 0 ||
      value.answer >= value.options.length ||
      typeof value.explanation !== 'string'
    )
      throw new Error(`Item ${index + 1} do miniquestionário é inválido.`);
    return value as QuizItem;
  });
}

export function slugify(text: string) {
  return (
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[`*_~[\]()]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'secao'
  );
}

/** Inline Markdown reduced to readable text (links keep their label). */
export function inlineText(text: string) {
  return text
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim();
}

export function tableOfContents(blocks: ArticleBlock[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const block of blocks) {
    if (block.type !== 'markdown') continue;
    let inFence = false;
    for (const line of block.text.split('\n')) {
      if (FENCE.test(line)) inFence = !inFence;
      if (inFence) continue;
      const heading = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
      if (!heading) continue;
      const text = inlineText(heading[2]);
      entries.push({ depth: heading[1].length as 2 | 3, text, id: slugify(text) });
    }
  }
  return entries;
}

/** Searchable, readable text of an article: no code, markup or JSON. */
export function plainText(blocks: ArticleBlock[]): string {
  const parts: string[] = [];
  const fromMarkdown = (text: string) =>
    text
      .replace(/(`{3,}|~{3,})[\s\S]*?\1/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .split('\n')
      .map((line) =>
        inlineText(line.replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/, '').replace(/\|/g, ' '))
      )
      .filter((line) => line && !/^[-:\s]+$/.test(line))
      .join(' ');
  for (const block of blocks) {
    if (block.type === 'markdown' || block.type === 'details') parts.push(fromMarkdown(block.text));
    else if (block.type === 'callout') parts.push(block.title, fromMarkdown(block.text));
    else if (block.type === 'quiz')
      parts.push(...block.items.map((item) => `${item.question} ${item.explanation}`));
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function readingMinutes(blocks: ArticleBlock[]) {
  const words = plainText(blocks).split(' ').filter(Boolean).length;
  const interactive = blocks.filter((b) => b.type === 'widget' || b.type === 'quiz').length;
  return Math.max(1, Math.round(words / 200 + interactive * 1.5));
}

const SUMMARY_CALLOUTS: CalloutVariant[] = ['summary', 'definition', 'mnemonic', 'trap', 'enade'];
const SUMMARY_SECTIONS = ['resumo-para-memorizar', 'diferencas-entre-conceitos-semelhantes'];

/**
 * Summary View: the article reduced to what is worth reviewing the night before
 * the exam: definitions, summaries, mnemonics, traps and comparison sections.
 */
export function summaryBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  const result: ArticleBlock[] = [];
  let section = '';
  for (const block of blocks) {
    if (block.type === 'callout') {
      if (SUMMARY_CALLOUTS.includes(block.variant) || SUMMARY_SECTIONS.includes(section))
        result.push(block);
      continue;
    }
    if (block.type === 'figure' && SUMMARY_SECTIONS.includes(section)) {
      result.push(block);
      continue;
    }
    if (block.type !== 'markdown') continue;
    let buffer: string[] = [];
    let inFence = false;
    const flush = () => {
      const text = buffer.join('\n').trim();
      if (text && SUMMARY_SECTIONS.includes(section)) result.push({ type: 'markdown', text });
      buffer = [];
    };
    for (const line of block.text.split('\n')) {
      if (FENCE.test(line)) inFence = !inFence;
      const heading = !inFence && /^##\s+(.+?)\s*#*$/.exec(line);
      if (heading) {
        flush();
        section = slugify(inlineText(heading[1]));
      }
      buffer.push(line);
    }
    flush();
  }
  return result;
}
