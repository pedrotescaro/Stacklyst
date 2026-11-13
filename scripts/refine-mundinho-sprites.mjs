import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import sharp from 'sharp';
import ts from 'typescript';
import { drawWorldHair } from './lib/mundinho-world-hero-art.mjs';
import { drawCompactHero } from './lib/mundinho-world-body-art.mjs';
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
const hairs = ['#17191f', '#684331', '#bd8240', '#dcd8d4', '#805d9e', '#c15e54'];
const hairstyles = JSON.parse(await fs.readFile('src/lib/mundinho/hairstyles.json', 'utf8'));
const shade = (c, n) =>
  '#' +
  [1, 3, 5]
    .map((i) =>
      Math.max(0, Math.min(255, parseInt(c.slice(i, i + 2), 16) + n))
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
function canvas(w = 32, h = 32) {
  const data = Buffer.alloc(w * h * 4);
  return {
    data,
    w,
    h,
    r(x, y, ww, hh, c) {
      const v = c.match(/\w\w/g).map((v) => parseInt(v, 16));
      for (let yy = Math.max(0, y); yy < Math.min(h, y + hh); yy++)
        for (let xx = Math.max(0, x); xx < Math.min(w, x + ww); xx++) {
          const p = (yy * w + xx) * 4;
          data.set([...v, 255], p);
        }
    },
  };
}
// Write actual animated Aseprite documents; LibreSprite is the final exporter.
async function exportAnimation(name, frames, columns = 8) {
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
    'C:/Program Files/LibreSprite/libresprite.exe',
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
function draw(layer, value, d, f, motion = 'walk') {
  const c = canvas(),
    side = d === 1 || d === 3,
    back = d === 2;
  const box = (x, y, w, h, col) => c.r(d === 3 ? 32 - x - w : x, y, w, h, col);
  if (layer === 'body' || layer === 'outfit') {
    c.data.set(
      drawCompactHero({
        layer,
        palette: layer === 'body' ? SKIN_PALETTES[value % 9] : OUTFIT_SPECS[value],
        female: layer === 'body' && value >= 9,
        direction: d,
        frame: f,
        motion,
        shade,
      })
    );
    return c;
  }
  if (layer === 'eyes' && !back) {
    const female = value >= 5,
      color = EYE_COLORS[value % 5],
      ink = '#38303e';
    for (const x of side ? [19] : [10, 19]) {
      // One-pixel upper lash, open whites and a small catchlight rather than a black box.
      box(x - (female ? 1 : 0), 10, female ? 4 : 3, 1, ink);
      box(x, 11, 3, 2, '#fff8ee');
      box(x + 1, 11, 2, 2, color);
      box(x + 2, 12, 1, 1, shade(color, -28));
      box(x + 1, 11, 1, 1, '#ffffff');
      if (female) box(x + (side ? 2 : x < 15 ? -1 : 3), 9, 1, 1, ink);
    }
  }
  if (layer === 'hair') {
    c.data.set(
      drawWorldHair({
        style: Math.floor(value / hairs.length),
        color: hairs[value % hairs.length],
        side,
        back,
        left: d === 3,
        shade,
      })
    );
    if (!back) {
      // Reserve both silhouette variants' complete eye footprint under every fringe.
      const eyes = draw('eyes', 5, d, f);
      for (let i = 0; i < c.data.length; i += 4) if (eyes.data[i + 3]) c.data.fill(0, i, i + 4);
    }
  }
  if (layer === 'accessory') {
    if (value === 1 && !back) {
      // Open lenses surround the two eye rows instead of painting over the pupils.
      const frame = '#34323a';
      for (const x of side ? [18] : [9, 18]) {
        box(x, 11, 4, 1, frame);
        box(x, 12, 1, 2, frame);
        box(x + 3, 12, 1, 2, frame);
        box(x + 1, 14, 2, 1, frame);
      }
      if (!side) {
        box(13, 12, 5, 1, frame);
        box(8, 11, 1, 1, frame);
        box(22, 11, 1, 1, frame);
      } else box(15, 11, 3, 1, frame);
    }
    if (value === 2) {
      const ink = '#382c2b',
        leather = '#9f7048',
        light = '#d2a269',
        shade = '#674533';
      if (back) {
        box(14, 15, 5, 2, ink); // Carry handle above the rounded flap.
        box(15, 15, 3, 1, light);
        box(11, 17, 11, 7, ink);
        box(12, 16, 9, 9, ink);
        box(12, 18, 9, 5, leather);
        box(13, 17, 7, 7, leather);
        box(12, 18, 1, 5, light);
        box(20, 18, 1, 5, shade);
        box(13, 17, 7, 2, light); // Top flap, central fastener and front pocket.
        box(13, 19, 7, 1, shade);
        box(16, 18, 2, 3, shade);
        box(16, 19, 2, 1, '#ead19a');
        box(14, 21, 5, 3, shade);
        box(14, 21, 5, 1, light);
        box(15, 22, 3, 1, leather);
        box(10, 19, 1, 3, shade);
        box(22, 19, 1, 3, shade);
      } else if (side) {
        box(8, 17, 5, 7, ink);
        box(9, 16, 3, 1, ink);
        box(9, 18, 3, 5, leather);
        box(9, 17, 3, 2, light);
        box(8, 19, 2, 3, shade);
        box(9, 20, 1, 1, light);
        box(13, 17, 2, 5, shade); // Strap follows the near shoulder, not the face.
        box(14, 18, 1, 3, light);
      } else {
        for (const x of [10, 20]) {
          box(x, 17, 2, 5, ink);
          box(x, 17, 1, 4, leather);
          box(x, 20, 2, 1, '#d5bd88');
        }
      }
    }
    if (value === 3) {
      const ink = '#57402e',
        straw = '#cba363',
        light = '#edcc88';
      box(side ? 10 : 11, 1, 10, 1, ink);
      box(9, 2, 14, 4, ink);
      box(10, 2, 12, 3, straw);
      box(11, 2, 8, 1, light);
      box(21, 3, 1, 2, '#aa7b45');
      box(10, 5, 12, 1, '#793e36'); // Fitted woven crown with a cloth band.
      box(side ? 7 : 6, 6, 20, 1, ink);
      box(side ? 8 : 7, 6, 18, 1, light);
      box(side ? 8 : 7, 7, 18, 1, ink);
      if (!back) box(side ? 22 : 19, 5, 2, 1, '#d18160');
    }
    if (value === 4) {
      const ink = '#111a27',
        shell = '#476780',
        light = '#91b7cd';
      box(10, 3, 12, 1, ink);
      box(9, 4, 14, 1, shell);
      box(11, 4, 9, 1, light);
      box(8, 5, 2, 5, ink);
      box(22, 5, 2, 5, ink);
      if (side) {
        // One visible cup sits over the ear; the far cup stays behind the head.
        box(9, 10, 4, 5, ink);
        box(9, 11, 3, 3, shell);
        box(9, 11, 1, 2, light);
        box(10, 12, 1, 1, '#66bdd1');
      } else {
        for (const x of [7, 23]) {
          box(x, 10, 2, 5, ink);
          box(x, 11, 2, 3, shell);
          box(x, 11, 1, 2, light);
        }
      }
    }
    if (value === 5) {
      const ink = '#703c31',
        cloth = '#cd7950',
        light = '#efb57b';
      box(side ? 11 : 10, 16, side ? 10 : 12, 3, ink);
      box(side ? 12 : 11, 16, side ? 8 : 10, 1, light);
      box(side ? 12 : 11, 17, side ? 8 : 10, 1, cloth);
      const tailX = back ? 11 : side ? 12 : 18;
      box(tailX, 18, 3, 5, ink);
      box(tailX, 18, 2, 4, cloth);
      box(tailX, 20, 2, 1, light);
      box(tailX, 23, 1, 1, cloth);
      box(tailX + 2, 23, 1, 1, cloth);
      box(tailX - 1, 17, 4, 2, ink); // Visible knot and a short, finished tail.
      box(tailX, 17, 2, 1, light);
    }
  }
  return c;
}
for (const [layer, count] of [
  ['body', 18],
  ['eyes', 10],
  ['outfit', OUTFIT_SPECS.length],
  ['hair', hairstyles.length * hairs.length],
  // Accessories are exported separately from the character refinements.
  ...(!charactersOnly ? [['accessory', 6]] : []),
]) {
  const frames = [];
  for (let v = 0; v < count; v++)
    for (let d = 0; d < 4; d++) for (let f = 0; f < 8; f++) frames.push(draw(layer, v, d, f));
  await exportAnimation(`hero-${layer}`, frames);
}
for (const [layer, count] of [
  ['outfit', OUTFIT_SPECS.length],
  ['body', 18],
]) {
  const frames = [];
  for (let v = 0; v < count; v++)
    for (let d = 0; d < 4; d++)
      for (let f = 0; f < 8; f++) frames.push(draw(layer, v, d, f, 'attack'));
  await exportAnimation(`hero-${layer}-attack`, frames);
}
// The blade and near fist render after hair, so long/voluminous styles cannot
// hide the sword or require their silhouettes to be cut away during a swing.
const weaponFrames = [];
for (let skin = 0; skin < SKIN_PALETTES.length; skin++)
  for (let direction = 0; direction < 4; direction++)
    for (let frame = 0; frame < 8; frame++)
      weaponFrames.push({
        w: 32,
        h: 32,
        data: drawCompactHero({
          layer: 'weapon',
          palette: SKIN_PALETTES[skin],
          direction,
          frame,
          motion: 'attack',
          shade,
        }),
      });
await exportAnimation('hero-weapon-attack', weaponFrames);
if (charactersOnly) {
  for (const name of [
    'hero-body',
    'hero-body-attack',
    'hero-eyes',
    'hero-outfit',
    'hero-outfit-attack',
    'hero-hair',
    'hero-weapon-attack',
  ]) {
    execFileSync(
      process.execPath,
      [
        '.agents/skills/impeccable/scripts/embed-prompt.mjs',
        `${dir}/${name}.png`,
        '--prompt',
        'Origin: original 32px character pixel artwork authored in scripts/refine-mundinho-sprites.mjs and scripts/lib/mundinho-world-hero-art.mjs and scripts/lib/mundinho-world-body-art.mjs, exported from native animated ASE sources using LibreSprite 1.3. Rounded chibi silhouettes, stepped swept hair, twelve garments and clean anime-inspired faces; compact chibi bodies with short legs and eight authored sword-swing poses. User-supplied character references informed proportions only.',
      ],
      { stdio: 'pipe' }
    );
  }
  console.log('LibreSprite: refined character layers exported; scenery and creatures unchanged.');
  process.exit(0);
}
// Preserve the user's creature drawings, add eight frames per species from those exact pixels.
const { data: raw, info } = await sharp(`${dir}/creatures-atlas.png`)
  .raw()
  .ensureAlpha()
  .toBuffer({ resolveWithObject: true });
const frames = [];
for (let species = 0; species < 6; species++)
  for (let f = 0; f < 8; f++) {
    const c = canvas(24, 24);
    const sourceX = species * 24;
    for (let y = 0; y < 24; y++)
      for (let x = 0; x < 24; x++) {
        const sy = Math.min(23, Math.floor(y / (f === 2 || f === 3 ? 0.94 : 1)));
        const p = (sy * info.width + sourceX + x) * 4;
        const yy = y + (f === 2 || f === 3 ? 1 : 0);
        if (yy < 24 && !(sy >= 21 && raw[p + 3] < 200))
          c.data.set(raw.subarray(p, p + 4), (yy * 24 + x) * 4);
      }
    frames.push(c);
  }
await exportAnimation('creatures-animated', frames);
console.log(
  sceneryOnly
    ? 'LibreSprite: rebuilding scenery only; character and creature sheets are unchanged.'
    : 'LibreSprite: layered four-direction character sheets and animated creature sheets exported.'
);
// One shared scenery/collision description: an expanded forest with connected clearings.
const map = canvas(1024, 768),
  obstacles = [];
const scenery = [],
  sceneryFrames = [];
const [cabinSprite, pondSprite, flowerSheet] = await Promise.all(
  ['cabin', 'pond', 'flowers'].map(async (name) => {
    const { data, info } = await sharp(`${dir}/${name}.png`)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data, w: info.width, h: info.height };
  })
);
const treeFrames = await Promise.all(
  [0, 1, 2].map(async (variant) =>
    sharp(`${dir}/trees.png`)
      .extract({ left: variant * 176, top: 0, width: 176, height: 160 })
      .ensureAlpha()
      .raw()
      .toBuffer()
  )
);
function sceneryObject(id, x, y, depth, pixels) {
  const frame = canvas(176, 160);
  frame.data.set(pixels);
  scenery.push({ id, x, y, depth, frame: sceneryFrames.length });
  sceneryFrames.push(frame);
}
function stamp(target, sprite, x, y, sourceX = 0, width = sprite.w) {
  for (let yy = 0; yy < sprite.h; yy++)
    for (let xx = 0; xx < width; xx++) {
      const tx = x + xx,
        ty = y + yy;
      if (tx < 0 || ty < 0 || tx >= target.w || ty >= target.h) continue;
      const from = (yy * sprite.w + sourceX + xx) * 4,
        to = (ty * target.w + tx) * 4;
      const alpha = sprite.data[from + 3] / 255;
      if (!alpha) continue;
      for (let channel = 0; channel < 3; channel++)
        target.data[to + channel] = Math.round(
          sprite.data[from + channel] * alpha + target.data[to + channel] * (1 - alpha)
        );
    }
}

let seed = 71;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
map.r(0, 0, 1024, 768, '#40764f');
for (let i = 0; i < 16000; i++) {
  const x = Math.floor(rand() * 1024),
    y = Math.floor(rand() * 768);
  map.r(x, y, 2, 1, rand() > 0.5 ? '#477d54' : '#3b704a');
}
for (let y = 30; y < 740; y++)
  for (let x = 30; x < 994; x++) {
    const path =
      Math.abs(x - (490 + Math.sin(y / 140) * 95)) < 24 ||
      Math.abs(y - (360 + Math.sin(x / 130) * 35)) < 22;
    if (path) map.r(x, y, 1, 1, rand() > 0.95 ? '#a58c62' : '#bd9f71');
  }
function tree(x, y) {
  sceneryObject(`tree-${scenery.length}`, x - 88, y - 154, y, treeFrames[scenery.length % 3]);
  obstacles.push({ x: x - 9, y: y - 12, w: 18, h: 18 });
}

for (let x = 15; x < 1024; x += 42) {
  tree(x, 70);
  tree(x, 773);
}
for (let y = 110; y < 745; y += 50) {
  tree(20, y);
  tree(1008, y);
}
for (const [x, y] of [
  [140, 190],
  [180, 220],
  [820, 200],
  [860, 250],
  [160, 570],
  [205, 605],
  [740, 550],
  [785, 580],
  [290, 130],
  [340, 135],
  [710, 680],
])
  tree(x, y);
// Ground-level sprites stay under the independently depth-sorted tree and cabin sprites.
stamp(map, pondSprite, 771, 474);
obstacles.push({ x: 795, y: 500, w: 160, h: 145 });
sceneryObject('cabin', 594, 44, 204, cabinSprite.data);
obstacles.push({ x: 620, y: 105, w: 125, h: 99 });
// Habitat foliage is exported separately by build-mundinho-props.mjs.
// Keeping it out of the ground allows depth sorting around creatures and players.
let flowersPlaced = 0;
for (let attempt = 0; attempt < 900 && flowersPlaced < 72; attempt++) {
  const x = 65 + Math.floor(rand() * 890),
    y = 90 + Math.floor(rand() * 615);
  const nearPath =
    Math.abs(x - (490 + Math.sin(y / 140) * 95)) < 42 ||
    Math.abs(y - (360 + Math.sin(x / 130) * 35)) < 40;
  if (
    nearPath ||
    obstacles.some((r) => x > r.x - 20 && x < r.x + r.w + 20 && y > r.y - 10 && y < r.y + r.h + 25)
  )
    continue;
  stamp(map, flowerSheet, x - 16, y - 28, (flowersPlaced % 6) * 32, 32);
  flowersPlaced++;
}
await exportAnimation('forest-ground', [map], 1);
await exportAnimation('forest-scenery', sceneryFrames, 8);
// Retain the composed illustration for battle backgrounds.
const illustration = scenery.map((object) => ({ ...object, pixels: sceneryFrames[object.frame] }));
for (const [index, [x, y]] of [
  [300, 270],
  [680, 450],
  [820, 350],
  [290, 510],
  [420, 180],
  [580, 620],
].entries()) {
  const tile = { left: (index % 3) * 72, top: 0, width: 72, height: 48 };
  const foreground = await sharp(`${dir}/habitats-front.png`).extract(tile).png().toBuffer();
  const data = await sharp(`${dir}/habitats-back.png`)
    .extract(tile)
    .composite([{ input: foreground }])
    .ensureAlpha()
    .raw()
    .toBuffer();
  illustration.push({ x: x - 36, y: y - 38, depth: y, pixels: { w: 72, h: 48, data } });
}
for (const object of illustration.sort((a, b) => a.depth - b.depth)) {
  const frame = object.pixels;
  for (let yy = 0; yy < frame.h; yy++)
    for (let xx = 0; xx < frame.w; xx++) {
      const x = object.x + xx,
        y = object.y + yy,
        p = (yy * frame.w + xx) * 4;
      if (x >= 0 && y >= 0 && x < map.w && y < map.h && frame.data[p + 3]) {
        const target = (y * map.w + x) * 4;
        const alpha = frame.data[p + 3] / 255;
        for (let channel = 0; channel < 3; channel++)
          map.data[target + channel] = Math.round(
            frame.data[p + channel] * alpha + map.data[target + channel] * (1 - alpha)
          );
      }
    }
}
await exportAnimation('forest-v2', [map], 1);
await fs.writeFile(
  'src/lib/mundinho/geometry.json',
  JSON.stringify(
    {
      width: 1024,
      height: 768,
      spawn: { x: 485, y: 390 },
      obstacles,
      scenery: {
        width: 176,
        height: 160,
        columns: 8,
        rows: Math.ceil(scenery.length / 8),
        objects: scenery,
      },
    },
    null,
    2
  ) + '\n'
);

for (const file of (await fs.readdir(dir)).filter(
  (f) =>
    f === 'forest-v2.png' ||
    (!sceneryOnly && (f.startsWith('hero-') || f === 'creatures-animated.png'))
)) {
  execFileSync(
    process.execPath,
    [
      '.agents/skills/impeccable/scripts/embed-prompt.mjs',
      `${dir}/${file}`,
      '--prompt',
      'Origin: original pixel artwork from scripts/refine-mundinho-sprites.mjs, animated ASE documents exported by LibreSprite 1.3. Creature pixels derive from the user supplied creatures-atlas.png, preserved unchanged.',
    ],
    { stdio: 'pipe' }
  );
}
