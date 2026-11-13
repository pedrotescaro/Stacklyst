import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

// Original stepped pixel sequences: the owner's six-pose sword reference pins
// the crescent silhouette. Flashes, projectiles and particles are drawn per frame.
const cell = 64,
  frames = 6;
const kinds = ['strike', 'focus', 'burst', 'slime', 'ice', 'fire', 'electric', 'plant', 'shadow'];
const stages = ['cast', 'impact', 'heal'];
const palettes = {
  strike: ['#687ca4', '#b4c8e7', '#edf2ff', '#ffffff'],
  focus: ['#29695b', '#55b994', '#a2efbd', '#f0ffe4'],
  burst: ['#7f3c86', '#d18ad8', '#ffd67f', '#fff8cf'],
  slime: ['#3c6c35', '#71ba47', '#b6eb79', '#f1ffc1'],
  ice: ['#456ba6', '#75b9e0', '#b1eeff', '#f6ffff'],
  fire: ['#a43d36', '#ed733b', '#ffc45b', '#fff5bd'],
  electric: ['#8d526b', '#d99056', '#ffda64', '#ffffda'],
  plant: ['#346b4c', '#63ac60', '#abd976', '#edffba'],
  shadow: ['#382442', '#67508e', '#a394ce', '#e8ddff'],
};
const source = 'artifacts/mundinho/libresprite/combat-effects';
const output = 'public/assets/mundinho/combat-effects.png';
const star = (c, x, y, size, color) => {
  c.line(x - size, y, x + size, y, color);
  c.line(x, y - size, x, y + size, color);
  if (size > 2) c.rect(x - 1, y - 1, 3, 3, color);
};
function arc(c, cx, cy, radius, thickness, start, sweep, color) {
  for (let y = 2; y < 62; y++)
    for (let x = 2; x < 62; x++) {
      const dx = x - cx,
        dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const a = ((((Math.atan2(dy, dx) * 180) / Math.PI - start) % 360) + 360) % 360;
      const taper = Math.min(1, a / 16, (sweep - a) / 23);
      if (a <= sweep && r <= radius && r >= radius - thickness * Math.max(0.12, taper))
        c.pixel(x, y, color);
    }
}
function shards(c, f, p, count = 7) {
  for (let n = 0; n < count; n++) {
    const a = (((n * 360) / count - 35) * Math.PI) / 180,
      r = 5 + f * 4;
    const x = Math.round(32 + Math.cos(a) * r),
      y = Math.round(32 + Math.sin(a) * r);
    const ex = Math.round(32 + Math.cos(a) * (r + 7 - f / 2));
    const ey = Math.round(32 + Math.sin(a) * (r + 7 - f / 2));
    c.line(x, y, ex, ey, p[1]);
    c.line(x + 1, y, ex + 1, ey, p[2]);
    c.pixel(ex, ey, p[3]);
  }
}
function slash(c, f, stage, p) {
  if (stage === 'impact') {
    const a = f * 2,
      w = [2, 5, 7, 5, 3, 1][f];
    c.polygon(
      [
        [10 + a, 50 - a],
        [48 + a / 2, 9],
        [53, 10 + w],
        [17 + a, 51],
      ],
      p[1]
    );
    c.line(13 + a, 48 - a, 50, 10, p[3]);
    if (f > 0) shards(c, f - 1, p, 6);
    return;
  }
  const sweep = [35, 190, 180, 160, 90, 40][f],
    thick = [2, 6, 10, 9, 5, 2][f];
  const radius = [21, 25, 28, 28, 27, 24][f];
  const start = [210, 80, 0, 340, 10, 30][f];
  arc(c, 32, 28, radius, thick + 2, start, sweep, p[0]);
  arc(c, 32, 28, radius - 1, thick, start + 3, sweep - 5, p[1]);
  arc(c, 32, 28, radius - 2, Math.max(1, thick - 1), start + 6, sweep - 10, p[2]);
  arc(c, 32, 28, radius - 3, Math.max(1, thick - 3), start + 8, sweep - 15, p[3]);
  if (f === 2 || f === 3) star(c, 51, 16, 3, p[3]);
}
function heal(c, f, p) {
  for (const [n, [x, y]] of [
    [22, 43],
    [42, 36],
    [31, 28],
  ].entries()) {
    const size = [1, 2, 3, 3, 2, 1][(f + n) % 6],
      yy = y - f * 3 + n * 2;
    star(c, x, yy, size + 1, p[0]);
    star(c, x, yy, size, p[2]);
    c.pixel(x, yy, p[3]);
  }
  arc(c, 32, 43 - f, 12 + f * 2, 1, 0, 360, p[1]);
}
function draw(kind, stage, f) {
  const c = canvas(cell, cell),
    p = palettes[kind];
  if (stage === 'heal') {
    heal(c, f, palettes.focus);
    return c;
  }
  if (kind === 'strike') {
    slash(c, f, stage, p);
    return c;
  }
  if (kind === 'focus') {
    heal(c, f, p);
    if (stage === 'impact') shards(c, f, p, 6);
    return c;
  }
  if (stage === 'impact') {
    shards(c, f, p);
    const r = [3, 8, 11, 8, 4, 1][f];
    c.ellipse(32, 32, r, Math.max(1, r - 2), p[1]);
    c.ellipse(31, 30, Math.max(1, r - 3), Math.max(1, r - 4), p[3]);
    if (kind === 'ice')
      for (const [x, y] of [
        [17, 25],
        [43, 17],
        [48, 45],
      ])
        c.polygon(
          [
            [x, y - 5 - f],
            [x + 3, y],
            [x, y + 6],
            [x - 3, y],
          ],
          p[2]
        );
    if (kind === 'plant' || kind === 'slime')
      for (let n = 0; n < 3; n++) {
        const x = 18 + n * 14,
          y = 24 + ((n + f) % 3) * 8;
        c.ellipse(x, y, 3, 4, p[1]);
        c.pixel(x - 1, y - 2, p[3]);
      }
    return c;
  }
  const x = 21 + f * 4,
    y = 34 - Math.round(Math.sin((f / 5) * Math.PI) * 9);
  if (kind === 'fire') {
    c.polygon(
      [
        [x - 15, y + 7],
        [x - 8, y],
        [x - 13, y - 9],
        [x - 4, y - 4],
        [x + 1, y - 12],
        [x + 7, y - 4],
        [x + 10, y + 1],
        [x + 7, y + 10],
        [x - 2, y + 12],
      ],
      p[0]
    );
    c.ellipse(x, y + 1, 8, 10, p[1]);
    c.polygon(
      [
        [x - 7, y + 5],
        [x - 2, y - 7],
        [x + 5, y - 1],
        [x + 4, y + 8],
      ],
      p[2]
    );
    c.ellipse(x + 1, y + 3, 3, 5, p[3]);
    c.rect(x - 17, y + 7, 4, 2, p[1]);
  } else if (kind === 'electric' || kind === 'burst') {
    c.polygon(
      [
        [x + 4, y - 17],
        [x - 10, y + 1],
        [x - 1, y],
        [x - 7, y + 17],
        [x + 12, y - 5],
        [x + 3, y - 3],
      ],
      p[0]
    );
    c.line(x + 3, y - 13, x - 6, y, p[3]);
    c.line(x - 6, y, x + 5, y - 2, p[2]);
    c.line(x + 5, y - 2, x - 4, y + 12, p[2]);
    star(c, x + 15, y - 11 + (f % 2) * 5, 3, p[2]);
    star(c, x - 15, y + 9, 2, p[3]);
  } else if (kind === 'ice') {
    c.polygon(
      [
        [x, y - 15],
        [x + 10, y],
        [x, y + 15],
        [x - 10, y],
      ],
      p[0]
    );
    c.polygon(
      [
        [x, y - 12],
        [x + 7, y],
        [x, y + 12],
        [x - 7, y],
      ],
      p[2]
    );
    c.line(x, y - 11, x - 3, y, p[3]);
    c.line(x - 3, y, x, y + 10, p[1]);
    c.line(x, y - 11, x + 5, y, p[3]);
    star(c, x - 15, y + 4, 3, p[2]);
    star(c, x + 10, y - 14, 2, p[3]);
  } else if (kind === 'plant') {
    arc(c, 30, 33, 12 + f, 2, 70 + f * 14, 220, p[0]);
    for (let n = 0; n < 3; n++) {
      const a = ((n * 110 + f * 18) * Math.PI) / 180,
        lx = 31 + Math.cos(a) * 15,
        ly = 31 + Math.sin(a) * 15;
      c.polygon(
        [
          [lx - 5, ly + 4],
          [lx - 6, ly - 3],
          [lx + 6, ly - 6],
          [lx + 4, ly + 2],
        ],
        p[1]
      );
      c.line(lx - 3, ly + 1, lx + 3, ly - 3, p[3]);
    }
  } else if (kind === 'shadow') {
    c.ellipse(x, y, 11, 12, p[0]);
    arc(c, x, y, 12, 4, 115 + f * 22, 240, p[1]);
    arc(c, x, y, 12, 1, 135 + f * 22, 190, p[2]);
    star(c, x - 15, y - 13, 2, p[3]);
    c.rect(x - 3, y - 2, 2, 3, p[2]);
    c.rect(x + 3, y - 2, 2, 3, p[2]);
  } else {
    c.ellipse(x, y + 4, 9, 9, p[0]);
    c.ellipse(x, y + 2, 8, 8, p[1]);
    c.ellipse(x - 2, y - 1, 4, 5, p[2]);
    c.rect(x - 4, y - 4, 4, 2, p[3]);
    for (let n = 0; n < 3; n++) c.ellipse(x - 12 - n * 4, y + (n % 2 ? 7 : -3), 2, 2, p[2]);
  }
  return c;
}
await fs.mkdir(source, { recursive: true });
const rows = kinds.length * stages.length;
const aseFrames = Array.from({ length: frames }, () => canvas(cell, cell * rows));
for (const [k, kind] of kinds.entries())
  for (const [s, stage] of stages.entries())
    for (let f = 0; f < frames; f++) {
      const art = draw(kind, stage, f),
        row = k * stages.length + s;
      for (let y = 0; y < cell; y++)
        art.data.copy(
          aseFrames[f].data,
          (row * cell + y) * cell * 4,
          y * cell * 4,
          (y + 1) * cell * 4
        );
    }
const native = `${source}/combat-effects.ase`;
await fs.writeFile(
  native,
  aseDocument({ names: ['Original combat sprite sequences'], frames: aseFrames.map((f) => [f]) })
);
const tempRoot = path.resolve(os.tmpdir());
const profile = await fs.mkdtemp(path.join(tempRoot, 'stacklyst-fx-'));
try {
  execFileSync(
    process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe',
    ['--batch', native, '--sheet', output, '--sheet-type', 'horizontal'],
    { stdio: 'pipe', env: { ...process.env, APPDATA: profile } }
  );
} finally {
  if (
    path.dirname(path.resolve(profile)) === tempRoot &&
    path.basename(profile).startsWith('stacklyst-fx-')
  )
    await fs.rm(profile, { recursive: true, force: true });
}
const metadata = await sharp(output).metadata();
if (metadata.width !== cell * frames || metadata.height !== cell * rows)
  throw new Error('Combat atlas export dimensions changed.');
const manifest = {
  file: 'combat-effects.png',
  cell,
  frames,
  rows,
  kinds,
  stages,
  durations: { cast: 350, impact: 450, heal: 450 },
  reducedMotionFrame: 2,
  origin:
    'Original pixel artwork authored in scripts/build-mundinho-combat-effects.mjs; the owner’s six-pose sword-swing reference informed the stepped crescent. Exported from editable combat-effects.ase by LibreSprite.',
};
await fs.writeFile(
  'src/lib/mundinho/combat-effects.json',
  JSON.stringify(manifest, null, 2) + '\n'
);
await fs.writeFile(`${source}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile(`${output}.json`, JSON.stringify({ prompt: manifest.origin }, null, 2) + '\n');
await sharp(output)
  .extract({ left: 0, top: 0, width: cell * frames, height: cell * 6 })
  .flatten({ background: '#252631' })
  .resize(cell * frames * 2, cell * 6 * 2, { kernel: 'nearest' })
  .toFile(`${source}/sword-and-heal-review.png`);
console.log(
  `Combat sprites exported: ${frames} frames × ${rows} sequences, ${cell * frames}×${cell * rows}, transparent PNG + editable ASE.`
);
