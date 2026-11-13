// Builds the Mundinho sprites with LibreSprite.
//
//   node scripts/mundinho-sprites/build.mjs [asset ...]
//
// Scenery, creatures and hero accessories use the AAP-64 LibreSprite programs.
// The coherent hero/portrait families use their authored layered generators and
// saved avatar palettes. --dry-run prints routing without writing any files.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ASSETS } from './assets.mjs';
import { prepareAvatar } from './prepare-avatar.mjs';

const LIBRESPRITE = process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HERE = path.join(ROOT, 'scripts/mundinho-sprites');
const SOURCE_DIR = path.join(ROOT, 'artifacts/mundinho/libresprite-v2');
const PUBLIC_DIR = path.join(ROOT, 'public/assets/mundinho');
const HERO_NAMES = new Set([
  'hero-body',
  'hero-body-attack',
  'hero-outfit',
  'hero-outfit-attack',
  'hero-eyes',
  'hero-hair',
]);
const PORTRAIT_NAMES = new Set(
  ASSETS.filter((asset) => asset.name.startsWith('portrait-')).map((asset) => asset.name)
);
const AUTHORED = {
  hero: {
    names: HERO_NAMES,
    command: ['scripts/refine-mundinho-sprites.mjs', '--characters-only'],
    source: 'artifacts/mundinho/libresprite/refined',
  },
  portraits: {
    names: PORTRAIT_NAMES,
    command: ['scripts/build-mundinho-portraits.mjs'],
    source: 'artifacts/mundinho/libresprite/portraits',
  },
};

/** Selecting one authored layer rebuilds its aligned family; hero accessories stay v2. */
export function createBuildPlan(wanted = []) {
  const valid = new Set([...ASSETS.map((asset) => asset.name), ...Object.keys(AUTHORED)]);
  const unknown = wanted.filter((name) => !valid.has(name));
  if (unknown.length) throw new Error(`Unknown sprite asset: ${unknown.join(', ')}`);
  const selected = new Set(wanted.length ? wanted : ASSETS.map((asset) => asset.name));
  for (const [family, { names }] of Object.entries(AUTHORED)) {
    if (selected.has(family) || [...names].some((name) => selected.has(name)))
      for (const name of names) selected.add(name);
  }
  const plan = [],
    scheduled = new Set();
  for (const asset of ASSETS.filter((item) => selected.has(item.name))) {
    const family = Object.keys(AUTHORED).find((key) => AUTHORED[key].names.has(asset.name));
    if (!family) {
      plan.push({ pipeline: 'v2', assets: [asset] });
    } else if (!scheduled.has(family)) {
      scheduled.add(family);
      plan.push({
        pipeline: family,
        command: AUTHORED[family].command,
        assets: ASSETS.filter((item) => AUTHORED[family].names.has(item.name)),
      });
    }
  }
  return plan;
}

function assetSource(asset) {
  const family = Object.keys(AUTHORED).find((key) => AUTHORED[key].names.has(asset.name));
  return {
    name: asset.name,
    output: asset.file
      ? `public/assets/mundinho/${asset.file}`
      : `artifacts/mundinho/libresprite-v2/${asset.name}.png`,
    width: asset.width,
    height: asset.height,
    builder: family ? AUTHORED[family].command.join(' ') : 'scripts/mundinho-sprites/build.mjs',
    source: `${family ? AUTHORED[family].source : 'artifacts/mundinho/libresprite-v2'}/${asset.name}.ase`,
    palette: family
      ? 'src/lib/mundinho/avatar-palettes.ts (authored shading and neutral hair ramp)'
      : 'AAP-64',
  };
}

function readPalette() {
  const gpl = path.join(path.dirname(LIBRESPRITE), 'data/palettes/aap-64.gpl');
  const text = fs.existsSync(gpl)
    ? fs.readFileSync(gpl, 'utf8')
    : fs.readFileSync(path.join(HERE, 'aap-64.gpl'), 'utf8');
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).at(-1))
    .filter((token) => /^[0-9a-f]{6}$/i.test(token ?? ''))
    .map((hex) => hex.toLowerCase());
}

function run(args, env) {
  const out = execFileSync(LIBRESPRITE, args, {
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const relevant = out
    .split(/\r?\n/)
    .filter(
      (line) => line && !/^Loading file|^Using loader|^Invalid default|^Reading file/.test(line)
    );
  if (relevant.some((line) => /Error|error:/.test(line))) {
    throw new Error(`LibreSprite failed:\n${relevant.join('\n')}`);
  }
  return relevant;
}

async function verify(file, palette) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const allowed = palette ? new Set(palette) : null;
  const used = new Set();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    if (a !== 255) throw new Error(`${path.basename(file)}: semi-transparent pixel (alpha ${a})`);
    const hex = [data[i], data[i + 1], data[i + 2]]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('');
    if (allowed && !allowed.has(hex))
      throw new Error(`${path.basename(file)}: color #${hex} is outside AAP-64`);
    used.add(hex);
  }
  return { width: info.width, height: info.height, colors: used.size };
}

async function build(asset, palette, scratch, env) {
  const blank = path.join(scratch, `${asset.name}-blank.png`);
  await sharp({
    create: {
      width: asset.width,
      height: asset.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
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
  run(['-b', blank, '--script', script, '--save-as', ase], env);
  // Reference sheets (e.g. the tileset) are exported next to their source only.
  const png = asset.file
    ? path.join(PUBLIC_DIR, asset.file)
    : path.join(SOURCE_DIR, `${asset.name}.png`);
  run(['-b', ase, '--save-as', png], env);
  const report = await verify(png, palette);
  const label = asset.file ?? `${asset.name}.png (reference)`;
  if (report.width !== asset.width || report.height !== asset.height) {
    throw new Error(
      `${label}: expected ${asset.width}x${asset.height}, got ${report.width}x${report.height}`
    );
  }
  console.log(
    `✓ ${label} ${report.width}x${report.height} · ${report.colors} colors · ${path.relative(ROOT, ase)}`
  );
}

async function main(args) {
  if (args.includes('--help')) {
    console.log(
      'Usage: node scripts/mundinho-sprites/build.mjs [--dry-run] [asset ... | hero | portraits]\nNo selection builds all assets. One hero/portrait layer rebuilds its aligned family.\nAssets: ' +
        ASSETS.map((asset) => asset.name).join(', ')
    );
    return;
  }
  const plan = createBuildPlan(args.filter((arg) => arg !== '--dry-run'));
  if (args.includes('--dry-run')) {
    console.log(
      JSON.stringify(
        plan.map((job) => ({
          pipeline: job.pipeline,
          command: job.command ?? ['scripts/mundinho-sprites/build.mjs', job.assets[0].name],
          assets: job.assets.map(assetSource),
        })),
        null,
        2
      )
    );
    return;
  }
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'mundinho-sprites-'));
  const profile = path.join(scratch, 'profile');
  fs.mkdirSync(profile, { recursive: true });
  const env = { ...process.env, APPDATA: profile };
  let palette = null;
  if (plan.some((job) => job.pipeline === 'v2')) {
    palette = readPalette();
    if (palette.length !== 64)
      throw new Error(`AAP-64 palette not found (got ${palette.length} colors)`);
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(SOURCE_DIR, 'palette-aap-64.json'),
      JSON.stringify(palette, null, 2)
    );
    // Only the AAP-64 accessory renderer consumes the quantized avatar snapshot.
    if (plan.some((job) => job.assets.some((asset) => asset.name === 'hero-accessory')))
      await prepareAvatar(ROOT, palette);
  }
  for (const job of plan) {
    if (job.pipeline === 'v2') {
      await build(job.assets[0], palette, scratch, env);
      continue;
    }
    execFileSync(process.execPath, job.command, { cwd: ROOT, env, stdio: 'inherit' });
    for (const asset of job.assets) {
      const report = await verify(path.join(PUBLIC_DIR, asset.file), null);
      if (report.width !== asset.width || report.height !== asset.height)
        throw new Error(
          `${asset.file}: expected ${asset.width}x${asset.height}, got ${report.width}x${report.height}`
        );
      console.log(
        `✓ ${asset.file} ${report.width}x${report.height} · ${assetSource(asset).source}`
      );
    }
  }
  // Source contract names the actual editable ASEs rather than stale v2 counterparts.
  fs.mkdirSync(path.join(ROOT, 'artifacts/mundinho'), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, 'artifacts/mundinho/sprite-build-manifest.json'),
    JSON.stringify(
      {
        schemaVersion: 1,
        assets: ASSETS.map(assetSource),
      },
      null,
      2
    ) + '\n'
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main(process.argv.slice(2));
