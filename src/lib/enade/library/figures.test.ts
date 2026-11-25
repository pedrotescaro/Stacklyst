import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { figureRegistry, getFigure } from '@/app/trails/enade/biblioteca/figures';
import { bookFigures, getBookFigure } from '@/app/trails/enade/biblioteca/figures/bookFigures';
import { LIBRARY_ROOT, loadLibrary } from './load';
import { parseBlocks, summaryBlocks } from './markdown';

describe('authored ENADE figures', () => {
  it('matches every article directive to one registered figure', () => {
    const ids = loadLibrary().articles.flatMap(({ slug, blocks }) =>
      blocks.flatMap((block) => {
        if (block.type !== 'figure') return [];
        expect(
          getBookFigure(block.id) ?? getFigure(block.id),
          `${slug} → ${block.id}`
        ).toBeDefined();
        return [block.id];
      })
    );
    const registered = new Set([...Object.keys(figureRegistry), ...Object.keys(bookFigures)]);
    expect(ids.sort()).toEqual([...registered].sort());
  });

  it('keeps Mermaid fences out of every Markdown file', () => {
    const directories = readdirSync(LIBRARY_ROOT, { withFileTypes: true }).filter((entry) =>
      entry.isDirectory()
    );
    for (const directory of directories) {
      const folder = path.join(LIBRARY_ROOT, directory.name);
      for (const file of readdirSync(folder).filter((name) => name.endsWith('.md'))) {
        const source = readFileSync(path.join(folder, file), 'utf8');
        expect(source, `${directory.name}/${file}`).not.toMatch(
          /^\s*(?:>\s*)*(?:(?:[-+*]|\d+[.)])\s+)?(?:`{3,}|~{3,})\s*mermaid(?:\s|$)/im
        );
      }
    }
  });

  it.each(Object.entries(figureRegistry))(
    'renders %s as an accessible, themed SVG',
    (id, entry) => {
      const markup = renderToStaticMarkup(createElement(entry.component));
      const template = document.createElement('template');
      template.innerHTML = markup;
      const svg = template.content.firstElementChild;
      const title = svg?.querySelector('title');
      const description = svg?.querySelector('desc');
      const viewBox = svg?.getAttribute('viewBox');

      expect(title?.textContent).toBe(entry.title);
      expect(description?.textContent).toBe(entry.alt);
      expect(svg?.getAttribute('aria-labelledby')).toBe(title?.id);
      expect(svg?.getAttribute('aria-describedby')).toBe(description?.id);
      expect(viewBox).toMatch(/^0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?$/);
      expect(Number(viewBox?.split(' ')[2]), id).toBeLessThanOrEqual(480);
      expect(markup).not.toMatch(/(?:fill|stroke|color)\s*[=:]\s*["']?#[a-f0-9]{3,8}\b/i);
      expect({
        element: svg?.localName,
        role: svg?.getAttribute('role'),
        title: Boolean(title?.textContent),
        description: Boolean(description?.textContent),
        dimensions: svg?.hasAttribute('width') || svg?.hasAttribute('height'),
      }).toMatchInlineSnapshot(`
      {
        "description": true,
        "dimensions": false,
        "element": "svg",
        "role": "img",
        "title": true,
      }
    `);
    }
  );
});

describe('book crops', () => {
  it.each(Object.keys(bookFigures))('serves the referenced image for %s', async (id) => {
    const figure = getBookFigure(id)!;
    const image = await sharp(path.join(process.cwd(), 'public', figure.src)).metadata();
    expect(image).toMatchObject({ format: 'webp', width: figure.width, height: figure.height });
    expect(figure.alt.trim()).not.toBe('');
    expect(figure.source.chapter).toContain(`p. ${figure.page}, fig. ${figure.number}`);
  });
});

describe('figure directives', () => {
  it('parses figures as standalone blocks and retains them in summary sections', () => {
    const blocks = parseBlocks('## Resumo para memorizar\n\n::figure{id="modelo-v"}\n\nTexto.');
    expect(blocks[1]).toEqual({ type: 'figure', id: 'modelo-v' });
    expect(summaryBlocks(blocks)).toContainEqual(blocks[1]);
    expect(getFigure('constructor')).toBeUndefined();
  });

  it('leaves directive examples in fenced code', () => {
    const text = '````md\n::figure{id="modelo-v"}\n```mermaid Example\ngraph TD\n```\n````';
    expect(parseBlocks(text)).toEqual([{ type: 'markdown', text }]);
  });

  it.each([
    '```mermaid Legenda\ngraph TD\n```',
    ':::details Exemplo\n~~~ MERMAID\ngraph TD\n~~~\n:::',
    '> ```mermaid\n> graph TD\n> ```',
  ])('rejects a legacy fence in %s', (text) => {
    expect(() => parseBlocks(text)).toThrow(/bloco Mermaid legado/);
  });

  it('rejects malformed figure IDs', () => {
    expect(() => parseBlocks('::figure{id="../modelo-v"}')).toThrow(/diretiva ::figure inválida/);
  });
});
