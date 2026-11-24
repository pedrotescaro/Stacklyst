import {
  parseBlocks,
  parseFrontmatter,
  plainText,
  readingMinutes,
  tableOfContents,
  type ArticleBlock,
  type TocEntry,
} from './markdown';

export type LibraryCategory = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

export type ArticleLevel = 'básico' | 'intermediário' | 'avançado';

export type ArticleMeta = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  order: number;
  level: ArticleLevel;
  parent: string | null;
  tags: string[];
  related: string[];
  version: number;
  updated: string;
  readingMinutes: number;
  toc: TocEntry[];
};

export type Article = ArticleMeta & { blocks: ArticleBlock[]; text: string };

export type Library = {
  categories: LibraryCategory[];
  articles: Article[];
  bySlug: Map<string, Article>;
};

const LEVELS: ArticleLevel[] = ['básico', 'intermediário', 'avançado'];

function text(value: unknown, field: string, file: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${file}: "${field}" ausente.`);
  return value.trim();
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

/** Builds one article from its Markdown source. Throws on any authoring error. */
export function compileArticle(file: string, category: string, raw: string): Article {
  const slug = file.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file}: slug inválido.`);
  const { data, body } = parseFrontmatter(raw);
  const blocks = parseBlocks(body);
  const level = (data.level ?? 'básico') as ArticleLevel;
  if (!LEVELS.includes(level)) throw new Error(`${file}: nível inválido.`);
  const version = Number(data.version ?? 1);
  const updated = text(data.updated, 'updated', file);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(updated)) throw new Error(`${file}: data "updated" inválida.`);
  return {
    slug,
    category,
    title: text(data.title, 'title', file),
    summary: text(data.summary, 'summary', file),
    order: Number(data.order ?? 100),
    level,
    parent: typeof data.parent === 'string' && data.parent ? data.parent : null,
    tags: list(data.tags),
    related: list(data.related),
    version: Number.isInteger(version) && version > 0 ? version : 1,
    updated,
    readingMinutes: readingMinutes(blocks),
    toc: tableOfContents(blocks),
    blocks,
    text: plainText(blocks),
  };
}

export function buildLibrary(
  categories: LibraryCategory[],
  sources: { category: string; file: string; raw: string }[]
): Library {
  const known = new Set(categories.map((c) => c.slug));
  const articles = sources.map((source) => {
    if (!known.has(source.category))
      throw new Error(`${source.file}: categoria desconhecida ${source.category}.`);
    return compileArticle(source.file, source.category, source.raw);
  });
  const bySlug = new Map<string, Article>();
  for (const article of articles) {
    if (bySlug.has(article.slug)) throw new Error(`Artigo duplicado: ${article.slug}.`);
    bySlug.set(article.slug, article);
  }
  const order = new Map(categories.map((c) => [c.slug, c.order]));
  articles.sort(
    (a, b) =>
      (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0) ||
      a.order - b.order ||
      a.title.localeCompare(b.title, 'pt-BR')
  );
  return {
    categories: [...categories].sort((a, b) => a.order - b.order),
    articles,
    bySlug,
  };
}

/** Light projection sent to client components (no article bodies). */
export function articleMeta(article: Article): ArticleMeta {
  const { blocks: _blocks, text: _text, ...meta } = article;
  void _blocks;
  void _text;
  return meta;
}

export type SearchHit = {
  slug: string;
  title: string;
  category: string;
  heading: string | null;
  headingId: string | null;
  snippet: string;
  score: number;
};

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Ranked full-text search over titles, headings, tags and body text. */
export function searchLibrary(library: Library, query: string, limit = 12): SearchHit[] {
  const terms = normalize(query)
    .split(/[^a-z0-9+#]+/)
    .filter((term) => term.length > 1);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  for (const article of library.articles) {
    const title = normalize(article.title);
    const tags = normalize(article.tags.join(' '));
    const summary = normalize(article.summary);
    const body = normalize(article.text);
    let score = 0;
    let matched = 0;
    for (const term of terms) {
      const inTitle = title.includes(term);
      const inTags = tags.includes(term);
      const inSummary = summary.includes(term);
      const count = body.split(term).length - 1;
      if (inTitle || inTags || inSummary || count) matched++;
      score += (inTitle ? 12 : 0) + (inTags ? 8 : 0) + (inSummary ? 4 : 0) + Math.min(count, 8);
    }
    if (matched < terms.length) continue;
    const heading =
      article.toc.find((entry) => terms.some((term) => normalize(entry.text).includes(term))) ||
      null;
    if (heading) score += 5;
    const position = body.indexOf(terms[0]);
    const start = Math.max(0, position - 70);
    const snippet =
      position < 0
        ? article.summary
        : `${start ? '…' : ''}${article.text.slice(start, start + 180).trim()}…`;
    hits.push({
      slug: article.slug,
      title: article.title,
      category: article.category,
      heading: heading?.text ?? null,
      headingId: heading?.id ?? null,
      snippet,
      score,
    });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
