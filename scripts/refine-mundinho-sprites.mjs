import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';

import ts from 'typescript';
import { directions, readPose, paintLayer } from './lib/tutorial-player.mjs';

const dir = 'public/assets/mundinho',
  source = 'artifacts/mundinho/libresprite/refined';
const sceneryOnly = process.argv.includes('--scenery-only');

const charactersOnly = process.argv.includes('--characters-only');
if (!charactersOnly) {
  // The current scenery/creature authoring lives in v2. The legacy entry point
  // must never re-export its older environment pixels over the latest assets.
  execFileSync(
    process.execPath,
    [
      'scripts/mundinho-sprites/build.mjs',
      ...(sceneryOnly ? ['forest-ground', 'forest-scenery'] : []),
    ],
    { stdio: 'inherit' }
  );
  process.exit(0);
}
const paletteSource = await fs.readFile('src/lib/mundinho/avatar-palettes.ts', 'utf8');
const { outputText } = ts.transpileModule(paletteSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
await fs.mkdir(source, { recursive: true });
const hairstyles = JSON.parse(await fs.readFile('src/lib/mundinho/hairstyles.json', 'utf8'));
// Write actual animated Aseprite documents; LibreSprite is the final exporter.
async function exportAnimation(name, frames, columns) {
  if (sceneryOnly && !name.startsWith('forest-')) return;
  const chunks = frames.map((c) => {
    const compressed = deflateSync(c.data);
    const cel = Buffer.alloc(26);
    cel.writeUInt32LE(26 + compressed.length, 0);
    cel.writeUInt16LE(0x2004, 4);
    cel.writeUInt16LE(0, 6);
    cel.writeUInt8(255, 12);
    cel.writeUInt16LE(2, 13);
    cel.writeUInt16LE(c.w, 22);
    cel.writeUInt16LE(c.h, 24);
    const parts = [];
    if (c === frames[0]) {
      const label = Buffer.from(name);
      const l = Buffer.alloc(24 + label.length);
      l.writeUInt32LE(l.length, 0);
      l.writeUInt16LE(0x2004, 4);
      l.writeUInt16LE(1, 6);
      l.writeUInt8(255, 16);
      l.writeUInt16LE(label.length, 22);
      label.copy(l, 24);
      parts.push(l);
    }
    cel.writeUInt16LE(0x2005, 4);
    parts.push(cel, compressed);
    const header = Buffer.alloc(16);
    header.writeUInt32LE(16 + parts.reduce((s, p) => s + p.length, 0), 0);
    header.writeUInt16LE(0xf1fa, 4);
    header.writeUInt16LE(c === frames[0] ? 2 : 1, 6);
    header.writeUInt16LE(120, 8);
    return Buffer.concat([header, ...parts]);
  });
  const header = Buffer.alloc(128);
  header.writeUInt32LE(128 + chunks.reduce((s, p) => s + p.length, 0), 0);
  header.writeUInt16LE(0xa5e0, 4);
  header.writeUInt16LE(frames.length, 6);
  header.writeUInt16LE(frames[0].w, 8);
  header.writeUInt16LE(frames[0].h, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(1, 14);
  header.writeUInt16LE(120, 18);
  header.writeUInt8(1, 34);
  header.writeUInt8(1, 35);
  const ase = `${source}/${name}.ase`;
  await fs.writeFile(ase, Buffer.concat([header, ...chunks]));
  execFileSync(
    process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe',
    [
      '--batch',
      ase,
      '--sheet',
      `${dir}/${name}.png`,
      '--sheet-width',
      String(columns * frames[0].w),
      '--data',
      `${source}/${name}.json`,
      '--format',
      'json-array',
    ],
    { stdio: 'pipe' }
  );
}

for (const [motion, suffix] of [
  ['idle', '-idle'],
  ['walk', ''],
  ['attack', '-attack'],
  ['bow', '-bow'],
]) {
  const strips = await Promise.all(directions.map((_, d) => readPose(motion, d)));
  for (const [layer, count] of Object.entries({
    body: 18,
    outfit: 24,
    eyes: 10,
    hair: hairstyles.length * 6,
    accessory: 6,
    ...(['attack', 'bow'].includes(motion) ? { weapon: 9 } : {}),
  })) {
    const frames = [];
    for (let v = 0; v < count; v++)
      for (const strip of strips)
        for (const pose of strip)
          frames.push({
            w: 48,
            h: 48,
            data: paintLayer(layer, v, pose, { SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS }),
          });
    await exportAnimation('hero-' + layer + suffix, frames, 6);
  }
}
