// Builds the Mundinho sprites with LibreSprite.
//
//   node scripts/mundinho-sprites/build.mjs [asset ...]
//
// For each asset the drawing program (assets/<name>.js) runs INSIDE LibreSprite
// together with runtime.js. LibreSprite saves the editable source
// (artifacts/mundinho/libresprite-v2/<name>.ase) and exports the PNG the app loads
// (public/assets/mundinho/<file>). Every exported pixel is then checked against the
// AAP-64 palette and for hard (0/255) alpha.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { ASSETS } from './assets.mjs';
import { prepareAvatar } from './prepare-avatar.mjs';

const LIBRESPRITE = process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '../..');
const HERE = path.join(ROOT, 'scripts/mundinho-sprites');
const SOURCE_DIR = path.join(ROOT, 'artifacts/mundinho/libresprite-v2');
const PUBLIC_DIR = path.join(ROOT, 'public/assets/mundinho');

function readPalette() {
  const gpl = path.join(path.dirname(LIBRESPRITE), 'data/palettes/aap-64.gpl');
  const text = fs.existsSync(gpl) ? fs.readFileSync(gpl, 'utf8') : fs.readFileSync(path.join(HERE, 'aap-64.gpl'), 'utf8');
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).at(-1))
    .filter((token) => /^[0-9a-f]{6}$/i.test(token ?? ''))
    .map((hex) => hex.toLowerCase());
}

function run(args) {
  const out = execFileSync(LIBRESPRITE, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const relevant = out
    .split(/\r?\n/)
    .filter((line) => line && !/^Loading file|^Using loader|^Invalid default|^Reading file/.test(line));
  if (relevant.some((line) => /Error|error:/.test(line))) {
    throw new Error(`LibreSprite failed:\n${relevant.join('\n')}`);
  }
  return relevant;
}

async function verify(file, palette) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const allowed = new Set(palette);
  const used = new Set();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    if (a !== 255) throw new Error(`${path.basename(file)}: semi-transparent pixel (alpha ${a})`);
    const hex = [data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    if (!allowed.has(hex)) throw new Error(`${path.basename(file)}: color #${hex} is outside AAP-64`);
    used.add(hex);
  }
  return { width: info.width, height: info.height, colors: used.size };
}

async function build(asset, palette, scratch) {
  const blank = path.join(scratch, `${asset.name}-blank.png`);
  await sharp({
    create: { width: asset.width, height: asset.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toFile(blank);
  const data = Object.entries(asset.data ?? {}).map(
    ([key, file]) => `const ${key} = ${fs.readFileSync(path.join(HERE, file), 'utf8')};`
  );
  const program = [
    `const PALETTE = ${JSON.stringify(palette)};`,
    ...data,
    fs.readFileSync(path.join(HERE, 'runtime.js'), 'utf8'),
    ...(asset.includes ?? []).map((file) => fs.readFileSync(path.join(HERE, file), 'utf8')),
    fs.readFileSync(path.join(HERE, 'assets', `${asset.name}.js`), 'utf8'),
    'commit();',
  ].join('\n');
  const script = path.join(scratch, `${asset.name}.js`);
  fs.writeFileSync(script, program);
  const ase = path.join(SOURCE_DIR, `${asset.name}.ase`);
  run(['-b', blank, '--script', script, '--save-as', ase]);
  // Reference sheets (e.g. the tileset) are exported next to their source only.
  const png = asset.file
    ? path.join(PUBLIC_DIR, asset.file)
    : path.join(SOURCE_DIR, `${asset.name}.png`);
  run(['-b', ase, '--save-as', png]);
  const report = await verify(png, palette);
  const label = asset.file ?? `${asset.name}.png (reference)`;
  if (report.width !== asset.width || report.height !== asset.height) {
    throw new Error(`${label}: expected ${asset.width}x${asset.height}, got ${report.width}x${report.height}`);
  }
  console.log(`✓ ${label} ${report.width}x${report.height} · ${report.colors} colors · ${path.relative(ROOT, ase)}`);
}

const palette = readPalette();
if (palette.length !== 64) throw new Error(`AAP-64 palette not found (got ${palette.length} colors)`);
fs.mkdirSync(SOURCE_DIR, { recursive: true });
fs.writeFileSync(path.join(SOURCE_DIR, 'palette-aap-64.json'), JSON.stringify(palette, null, 2));
// Character sprites draw from the editor's colors quantized to the palette.
await prepareAvatar(ROOT, palette);
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'mundinho-sprites-'));
const wanted = process.argv.slice(2);
for (const asset of ASSETS.filter((a) => !wanted.length || wanted.includes(a.name))) {
  await build(asset, palette, scratch);
}
