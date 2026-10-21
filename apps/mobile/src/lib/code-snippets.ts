export interface FencedSnippet {
  start: number;
  end: number;
  code: string;
  language: string;
}

export type EditableSnippet = FencedSnippet & { format: 'markdown' | 'html' };
export type SnippetBodySection =
  | { kind: 'text'; start: number; end: number; text: string }
  | { kind: 'code'; snippet: EditableSnippet };

/** Read complete Markdown fences, including longer fences used to quote backticks. */
export function fencedSnippets(body: string): FencedSnippet[] {
  const lines = body.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const htmlRanges = [...body.matchAll(/<pre\b[^>]*>[\s\S]*?<\/pre\s*>/gi)].map((match) => ({
    start: match.index!,
    end: match.index! + match[0].length,
  }));
  const result: FencedSnippet[] = [];
  let offset = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].replace(/\r?\n$/, '').match(/^ {0,3}(`{3,}|~{3,})([^\r\n]*)$/);
    if (
      !opening ||
      (opening[1][0] === '`' && opening[2].includes('`')) ||
      htmlRanges.some((range) => offset >= range.start && offset < range.end)
    ) {
      offset += lines[index].length;
      continue;
    }
    const start = offset;
    const marker = opening[1];
    let code = '';
    offset += lines[index].length;
    for (index += 1; index < lines.length; index += 1) {
      const line = lines[index];
      const closing = line.replace(/\r?\n$/, '').match(/^ {0,3}(`+|~+)\s*$/);
      offset += line.length;
      if (closing && closing[1][0] === marker[0] && closing[1].length >= marker.length) break;
      code += line;
    }
    result.push({
      start,
      end: offset,
      code: code.replace(/\r?\n$/, ''),
      language: opening[2].trim().split(/\s+/)[0] ?? '',
    });
  }
  return result;
}

export function createCodeFence(code: string, language = ''): string {
  const longest = Math.max(0, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  const fence = '`'.repeat(Math.max(3, longest + 1));
  const label = language.replace(/[^a-zA-Z0-9_+#.-]/g, '').toLowerCase();
  return `${fence}${label}\n${code.replace(/\r\n/g, '\n')}\n${fence}`;
}

function decodeHtmlCode(value: string) {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, name: string) => {
    if (name[0] !== '#') return entities[name.toLowerCase()] ?? entity;
    const point =
      name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

export function editableSnippets(body: string): EditableSnippet[] {
  const fences = fencedSnippets(body);
  const blocks: EditableSnippet[] = fences.map((block) => ({ ...block, format: 'markdown' }));
  for (const match of body.matchAll(/<pre\b([^>]*)>([\s\S]*?)<\/pre\s*>/gi)) {
    const start = match.index!;
    if (fences.some((block) => start >= block.start && start < block.end)) continue;
    const language =
      match[1].match(/data-language=["']([^"']*)["']/i)?.[1] ||
      match[2].match(/class=["'][^"']*(?:language|lang)-([^\s"']+)/i)?.[1] ||
      '';
    const code = decodeHtmlCode(match[2].replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, ''));
    blocks.push({ start, end: start + match[0].length, code, language, format: 'html' });
  }
  return blocks.sort((left, right) => left.start - right.start);
}

export function snippetBodySections(body: string): SnippetBodySection[] {
  const sections: SnippetBodySection[] = [];
  let cursor = 0;
  for (const snippet of editableSnippets(body)) {
    sections.push({
      kind: 'text',
      start: cursor,
      end: snippet.start,
      text: body.slice(cursor, snippet.start),
    });
    sections.push({ kind: 'code', snippet });
    cursor = snippet.end;
  }
  sections.push({ kind: 'text', start: cursor, end: body.length, text: body.slice(cursor) });
  return sections;
}

const escapeHtmlCode = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Edit a numbered code field without moving the surrounding prose or other blocks. */
export function replaceSnippet(
  body: string,
  index: number,
  code: string,
  language?: string
): string {
  const snippet = editableSnippets(body)[index];
  if (!snippet) return body;
  const label = language ?? snippet.language;
  const replacement =
    snippet.format === 'html'
      ? `<pre data-language="${escapeHtmlCode(label)}"><code>${escapeHtmlCode(code)}</code></pre>`
      : createCodeFence(code, label) +
        (body.slice(snippet.start, snippet.end).endsWith('\n') ? '\n' : '');
  return body.slice(0, snippet.start) + replacement + body.slice(snippet.end);
}

/** Exact normalized matching prevents rendering legacy metadata twice. */
export function hasCodeBlock(body: string, code?: string): boolean {
  const blocks = editableSnippets(body).map((block) => block.code);
  if (code === undefined) return blocks.length > 0;
  const normalized = code.replace(/\r\n/g, '\n').trim();
  return blocks.some((block) => block.replace(/\r\n/g, '\n').trim() === normalized);
}

export function appendCodeBlock(body: string, code: string, language = ''): string {
  if (!code.trim() || hasCodeBlock(body, code)) return body;
  return [body.trimEnd(), createCodeFence(code, language)].filter(Boolean).join('\n\n');
}

/** HTML-looking source inside a code fence must remain literal source code. */
export function hasHtmlContent(body: string): boolean {
  let prose = '';
  let cursor = 0;
  for (const block of fencedSnippets(body)) {
    prose += body.slice(cursor, block.start);
    cursor = block.end;
  }
  prose += body.slice(cursor);
  prose = prose.replace(/(`+)[\s\S]*?\1/g, '').replace(/^(?: {4}|\t).*$/gm, '');
  return /<\/?(?:p|div|h[1-6]|pre|ul|ol|blockquote)\b/i.test(prose);
}

/** Keep fenced snippets renderable when the surrounding body came from the HTML editor. */
export function htmlWithCodeFences(body: string): string {
  let result = '';
  let cursor = 0;
  for (const block of fencedSnippets(body)) {
    result += body.slice(cursor, block.start);
    result += `<pre data-language="${escapeHtmlCode(block.language)}"><code>${escapeHtmlCode(block.code)}</code></pre>`;
    cursor = block.end;
  }
  return result + body.slice(cursor);
}
