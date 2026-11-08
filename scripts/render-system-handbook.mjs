// Validates and renders documentation only; no application or database mutations.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import puppeteer from 'puppeteer';
const base = 'docs/manual/detalhado';
const files = (await fs.readdir(base)).filter((f) => f.endsWith('.md'));
const diagrams = [];
for (const file of files) {
  const text = await fs.readFile(path.join(base, file), 'utf8');
  let index = 0;
  for (const match of text.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)) {
    diagrams.push({
      name: file.replace('.md', '') + '-' + String(++index).padStart(2, '0'),
      code: match[1],
    });
  }
}
const response = await fetch('https://cdn.jsdelivr.net/npm/mermaid@11.12.1/dist/mermaid.min.js');
if (!response.ok) throw new Error('Diagram parser unavailable');
await fs.mkdir('.tmp/handbook-qa', { recursive: true });
const browser = await puppeteer.launch({ headless: true });
const rendered = [];
const fingerprints = {};
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });
  await page.setContent(
    '<!doctype html><meta charset="utf-8"><body style="background:white"><main id="drawing"></main>'
  );
  await page.addScriptTag({ content: await response.text() });
  await page.evaluate(() =>
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'neutral',
      maxTextSize: 200000,
    })
  );
  for (const [i, diagram] of diagrams.entries()) {
    const result = await page.evaluate(
      async ({ code, id }) => {
        await mermaid.parse(code);
        const r = await mermaid.render(id, code);
        return r.svg;
      },
      { code: diagram.code, id: 'diagram' + i }
    );
    const box = result
      .match(/viewBox="([^"]+)"/)[1]
      .split(/\s+/)
      .map(Number);
    const svg = result.replace(
      /width="[^"]+"/,
      `width="${Math.ceil(box[2])}" height="${Math.ceil(box[3])}"`
    );
    await fs.writeFile(path.join(base, 'diagramas', diagram.name + '.svg'), svg, 'utf8');
    fingerprints[diagram.name] = createHash('sha256').update(diagram.code).digest('hex');
    rendered.push(diagram.name);
    if (['visao-do-sistema-01', 'modelagem-01', 'sequencias-01'].includes(diagram.name)) {
      await page.$eval(
        '#drawing',
        (el, svg) => {
          el.innerHTML = svg;
        },
        result
      );
      await page.screenshot({ path: '.tmp/handbook-qa/' + diagram.name + '.png', fullPage: true });
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(base, 'diagramas', 'README.md'),
  '# Diagramas renderizados\n\nSVGs para abrir e ampliar. As fontes Mermaid continuam nos capítulos e nos arquivos `.mmd` dos DERs.\n\n' +
    rendered.map((n) => '- [' + n + '](' + n + '.svg)').join('\n') +
    '\n'
);
await fs.writeFile(
  path.join(base, 'diagramas', 'render-manifest.json'),
  JSON.stringify(
    { parser: 'Mermaid 11.12.1', validated: rendered.length, diagrams: fingerprints },
    null,
    2
  ) + '\n'
);
console.log(JSON.stringify({ validated: rendered.length, rendered: rendered.length }));
