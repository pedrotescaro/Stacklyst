import { readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { renderCredentialBadgeSvg } from '../badge-art';
import { credentialLanguageLogos } from '../language-logos';

function parse(svg: string) {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  expect(document.querySelector('parsererror')).toBeNull();
  return document;
}

function paths(document: Document) {
  return Array.from(document.querySelectorAll('path')).map((element) => element.getAttribute('d'));
}

describe('shared credential badge SVG', () => {
  it.each(Object.keys(credentialLanguageLogos))(
    'preserves the original %s logo paths and uses only the milestone as visible text',
    (language) => {
      const original = credentialLanguageLogos[language as keyof typeof credentialLanguageLogos];
      const source = readFileSync(
        path.join(process.cwd(), 'node_modules', original.source),
        'utf8'
      );
      const document = parse(renderCredentialBadgeSvg({ language, kind: 'course' }));
      const logo = document.querySelector(`[data-credential-logo="${language}"]`)!;
      expect(logo).not.toBeNull();
      expect(paths(parse(logo.outerHTML))).toEqual(paths(parse(source)));
      expect(Array.from(document.querySelectorAll('text')).map((text) => text.textContent)).toEqual(
        ['CURSO CONCLUÍDO']
      );
      expect(document.querySelector('image, use, script, foreignObject')).toBeNull();
      expect(document.documentElement.getAttribute('viewBox')).toBe('0 0 240 260');
      expect(document.documentElement.getAttribute('width')).toBe('240');
      expect(document.documentElement.getAttribute('height')).toBe('260');
    }
  );

  it('uses the existing Stacklyst vector as the fallback, without a textual logo substitute', () => {
    const source = parse(
      readFileSync(path.join(process.cwd(), 'public/brand/monogram.svg'), 'utf8')
    );
    for (const language of [null, 'unlisted', '__proto__']) {
      const document = parse(renderCredentialBadgeSvg({ language, kind: 'practice' }));
      const logo = document.querySelector('[data-credential-logo="STACKLYST"]')!;
      expect(paths(parse(logo.outerHTML))).toEqual(paths(source));
      expect(document.querySelectorAll('text')).toHaveLength(1);
      expect(document.querySelector('text')?.textContent).toBe('PRÁTICA CONCLUÍDA');
    }
  });

  it('namespaces every gradient and filter ID when several copies share a document', () => {
    const first = renderCredentialBadgeSvg({
      language: 'PYTHON',
      kind: 'first_lesson',
      locked: true,
      idPrefix: 'first-copy',
    });
    const second = renderCredentialBadgeSvg({
      language: 'PYTHON',
      kind: 'first_lesson',
      locked: true,
      idPrefix: 'second-copy',
    });
    const document = parse(`<svg xmlns="http://www.w3.org/2000/svg">${first}${second}</svg>`);
    const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(ids.length);
    const references = Array.from((first + second).matchAll(/url\(#([^)]+)\)/g));
    expect(references).toHaveLength(8);
    for (const [, id] of references) expect(ids).toContain(id);
  });

  it('keeps the locked or earned status outside the central logo', () => {
    const locked = parse(
      renderCredentialBadgeSvg({ language: 'JAVA', kind: 'section', locked: true })
    );
    expect(locked.querySelector('[data-credential-status="locked"] rect')).not.toBeNull();
    expect(locked.querySelector('title')?.textContent).toContain('a conquistar');
    expect(
      locked.querySelector('[data-credential-logo="JAVA"]')?.parentElement?.getAttribute('filter')
    ).toContain('-muted)');
    expect(locked.querySelector('[data-credential-status] circle')?.getAttribute('cy')).toBe('219');
    const earned = parse(renderCredentialBadgeSvg({ language: 'JAVA', kind: 'section' }));
    expect(earned.querySelector('[data-credential-status="earned"] path')).not.toBeNull();
    expect(earned.querySelector('filter')).toBeNull();
  });

  it('escapes caller text and normalizes unsafe prefixes without adding SVG markup', () => {
    const title = 'Ana & João <script onload="bad()">\'certificado\'</script>';
    const svg = renderCredentialBadgeSvg({
      language: 'PYTHON',
      kind: '__proto__',
      title,
      idPrefix: '"/><script>bad()</script>',
    });
    const document = parse(svg);
    expect(document.querySelector('title')?.textContent).toBe(title);
    expect(document.querySelector('text')?.textContent).toBe('CONQUISTA');
    expect(document.querySelector('script, [onload]')).toBeNull();
    expect(svg).toContain('&lt;script onload=&quot;bad()&quot;&gt;');
    expect(svg).not.toContain('<script');
  });

  it('rasterizes the standalone Python badge offline at certificate resolution', async () => {
    const svg = renderCredentialBadgeSvg({ language: 'PYTHON', kind: 'course' });
    const { info } = await sharp(Buffer.from(svg))
      .resize(720, 780)
      .png()
      .toBuffer({ resolveWithObject: true });
    expect(info.width).toBe(720);
    expect(info.height).toBe(780);
    expect(info.format).toBe('png');
  });
});
