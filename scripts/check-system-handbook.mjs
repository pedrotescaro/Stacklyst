/** Checks documentation consistency without executing product flows. */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const base = 'docs/manual/detalhado';
const digest = (text) => createHash('sha256').update(text).digest('hex');
const source = JSON.parse(await fs.readFile(path.join(base, 'fontes-verificadas.json'), 'utf8'));
const cases = JSON.parse(await fs.readFile(path.join(base, 'catalogo-casos.json'), 'utf8'));
const academic = JSON.parse(await fs.readFile(path.join(base, 'catalogo-academico.json'), 'utf8'));
const ruleDoc = await fs.readFile(path.join(base, 'requisitos-e-regras.md'), 'utf8');
const ruleIds = new Set([...ruleDoc.matchAll(/\|\s*(R\d+)\s*\|/g)].map((m) => m[1]));
assert.equal(new Set(cases.map((c) => c.id)).size, cases.length, 'Duplicate use case ID');
assert.equal(cases.length, source.counts.implementationScenarios);
assert.equal(academic.length, source.counts.useCases);
assert.equal(academic.length, 24, 'Consolidated academic scope must match the general diagram');
assert.equal(new Set(academic.map(c => c.id)).size, academic.length);
const nativeAudit = JSON.parse(await fs.readFile('docs/laboratorio-engenharia-software/revisao-seminario-2026-11-03/validacao/astah-native-audit.json', 'utf8'));
assert.ok(nativeAudit.allCatalogCasesInGeneral, 'Every academic case must appear in Astah general view');
for (const c of cases) {
  assert.ok(c.steps.length >= 3, `Missing meaningful steps: ${c.id}`);
  assert.ok(c.preconditions && c.success && c.alternatives, `Incomplete case: ${c.id}`);
  for (const rule of c.rules) assert.ok(ruleIds.has(rule), `Unknown rule ${rule} in ${c.id}`);
  await fs.access(c.source);
}
for (const [file, hash] of Object.entries(source.sources))
  assert.equal(
    digest(await fs.readFile(file, 'utf8')),
    hash,
    `Source changed: ${file}; regenerate handbook`
  );
const render = JSON.parse(
  await fs.readFile(path.join(base, 'diagramas/render-manifest.json'), 'utf8')
);
let diagramCount = 0;
let words = 0;
for (const name of (await fs.readdir(base)).filter((f) => f.endsWith('.md'))) {
  const text = await fs.readFile(path.join(base, name), 'utf8');
  assert.ok(!/^#{1,4}\s+.*\bguild(?:s|a|as|member|role)?\b/im.test(text), `Out-of-scope feature section in ${name}`);
  assert.ok(!/Ã[\u0080-\u00bf]|\ufffd/.test(text), `Encoding problem in ${name}`);
  words += text
    .replace(/```[\s\S]*?```/g, '')
    .split(/\s+/)
    .filter(Boolean).length;
  let index = 0;
  for (const match of text.matchAll(/```mermaid\s*\n([\s\S]*?)```/g)) {
    const key = name.replace('.md', '') + '-' + String(++index).padStart(2, '0');
    assert.equal(render.diagrams[key], digest(match[1]), `Stale diagram: ${key}`);
    const svg = await fs.readFile(path.join(base, 'diagramas', `${key}.svg`), 'utf8');
    assert.ok(svg.startsWith('<svg') && svg.includes('viewBox='), `Invalid SVG ${key}`);
    diagramCount++;
  }
}
assert.equal(diagramCount, render.validated);
const features = [...ruleDoc.matchAll(/\|\s*(F\d+)\s*\|/g)].length;
const quality = [...ruleDoc.matchAll(/\|\s*(Q\d+)\s*\|/g)].length;
console.log(
  JSON.stringify({
    useCases: academic.length,
    implementationScenarios: cases.length,
    businessRules: ruleIds.size,
    functionalRequirements: features,
    qualityRequirements: quality,
    sourceExcerpts: source.counts.excerpts,
    checkedSourceFiles: Object.keys(source.sources).length,
    diagrams: diagramCount,
    proseWordsApprox: words,
  })
);
