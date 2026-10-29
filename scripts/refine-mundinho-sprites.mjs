import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import sharp from 'sharp';
const dir = 'public/assets/mundinho',
  source = 'artifacts/mundinho/libresprite/refined';
await fs.mkdir(source, { recursive: true });
const skins = [
  '#fcd4b8',
  '#e8d3e8',
  '#c89b70',
  '#f6be9d',
  '#c7cbe3',
  '#fde5d0',
  '#e2cb8b',
  '#e7ded0',
  '#ba8b7a',
];
const hairs = ['#273047', '#684331', '#bd8240', '#dcd8d4', '#805d9e', '#c15e54'];
const coats = ['#b94f57', '#498faa', '#344a5c', '#4e785d', '#934153', '#c59a45'];
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
// The original skin pixels own the anatomy. Never redraw or stretch the front body.
const skinNames = [
  'peach_fair',
  'lilac_fantasy',
  'warm_tan',
  'rosy_peach',
  'slate_fantasy',
  'pale_ivory',
  'warm_wheat',
  'almond_sand',
  'deep_cocoa',
];
const skinPixels = await Promise.all(
  skinNames.map(async (name, i) =>
    sharp(`${dir}/skins/skin_${i}_${name}.png`).ensureAlpha().raw().toBuffer()
  )
);
function draw(layer, value, d, f, motion = 'walk') {
  const c = canvas(),
    side = d === 1 || d === 3,
    back = d === 2;
  const step = [0, -1, 0, 1, 0, -1, 0, 1][f];
  const box = (x, y, w, h, col) => c.r(d === 3 ? 32 - x - w : x, y, w, h, col);
  const copyPixel = (raw, sx, sy, x, y) => {
    if (x < 0 || x >= 32 || y < 0 || y >= 32) return;
    const source = (sy * 32 + sx) * 4,
      target = (y * 32 + (d === 3 ? 31 - x : x)) * 4;
    c.data.set(raw.subarray(source, source + 4), target);
  };
  if (layer === 'body') {
    const raw = skinPixels[value];
    if (!side) {
      for (let y = 0; y < 32; y++)
        for (let x = 0; x < 32; x++) {
          const offset =
            y >= 23
              ? x < 16
                ? step
                : -step
              : y >= 19 && y <= 21 && (x <= 9 || x >= 21)
                ? x < 16
                  ? step
                  : -step
                : 0;
          copyPixel(raw, x, y, x, y + offset);
        }
      if (back) {
        // Back of the same head: remove facial marks without changing its contour.
        for (let y = 10; y <= 14; y++) for (let x = 9; x <= 21; x++) copyPixel(raw, x, 9, x, y);
      }
    } else {
      // Approved profile: retain the full original head width; only turn the features.
      for (let y = 3; y <= 15; y++) for (let x = 8; x <= 22; x++) copyPixel(raw, x, y, x, y);
      for (let y = 10; y <= 14; y++) for (let x = 9; x <= 21; x++) copyPixel(raw, x, 9, x, y);
      // A single eye at the leading edge, with the original eyebrow and catchlight.
      for (let y = 10; y <= 14; y++) for (let x = 19; x <= 20; x++) copyPixel(raw, x, y, x, y);
      const base = skins[value],
        shadow = shade(base, -24),
        light = shade(base, 17),
        ink = '#000000';
      // One connected silhouette: neck, shoulder, torso and hips have a continuous outline.
      box(10, 16, 12, 1, shadow);
      box(10, 17, 11, 2, ink);
      box(11, 17, 9, 1, light);
      box(11, 18, 9, 1, base);
      box(11, 19, 10, 3, ink);
      box(12, 19, 8, 3, base);
      box(19, 19, 1, 3, shadow);
      box(12, 22, 9, 1, ink);
      box(13, 22, 7, 1, shadow);
      // The near arm is filled skin, with an outline along the elbow and hand.
      box(12, 18 + step, 4, 5, ink);
      box(12, 18 + step, 3, 4, base);
      box(12, 18 + step, 1, 2, light);
      box(13, 23, 7, 1, shadow); // hips stay filled while the feet alternate
      box(13, 23 + step, 7, 2, base);
      box(13, 24 + step, 7, 1, shadow);
      box(12, 25 + step, 9, 1, ink);
      if (step) {
        box(17, 23 - step, 3, 2, base);
        box(17, 25 - step, 4, 1, ink);
      }
    }
  }
  if (layer === 'eyes' && !back) {
    const color = ['#000000', '#2f855a', '#2b6cb0', '#b7791f', '#805ad5'][value];
    for (const x of side ? [19] : [10, 19]) {
      box(x, 10, 2, 1, '#000000');
      box(x, 12, 2, 2, color);
      box(x, 13, 1, 1, '#000000');
      box(x, 12, 1, 1, '#ffffff');
    }
  }
  if (layer === 'outfit') {
    const jacket = coats[value],
      shadow = shade(jacket, -28),
      ink = '#20232b';
    // Clothing traces the original 16..22 torso and 23..25 legs. No elongated torso.
    if (!side) {
      box(9, 16, 13, 1, jacket);
      box(9, 17, 13, 2, jacket);
      box(8, 18, 15, 1, jacket);
      box(11, 19, 9, 4, jacket);
      box(18, 17, 4, 2, shadow);
      box(18, 19, 2, 4, shadow);
      if (!back) {
        box(14, 17, 3, 5, '#dae4ec');
        box(13, 17, 1, 2, shade(jacket, 18));
        box(17, 17, 1, 2, shadow);
      }
      box(11, 22, 9, 1, shadow);
      box(6, 19 + step, 1, 3, ink);
      box(7, 18 + step, 2, 1, jacket);
      box(6, 21 + step, 3, 1, ink);
      box(22, 18 - step, 2, 1, shadow);
      box(24, 19 - step, 1, 3, ink);
      box(22, 21 - step, 3, 1, ink);
      for (const [x, off] of [
        [11, step],
        [17, -step],
      ]) {
        box(x, 23 + off, 3, 1, '#293346');
        box(x, 24 + off, 3, 1, '#171e2d');
        box(x, 25 + off, 3, 1, ink);
      }
    } else {
      box(10, 16, 12, 1, shadow);
      box(10, 17, 11, 2, ink);
      box(11, 17, 9, 2, jacket);
      box(11, 19, 10, 3, ink);
      box(12, 19, 8, 3, jacket);
      box(19, 19, 1, 3, shadow);
      box(12, 22, 9, 1, ink);
      box(13, 22, 7, 1, shadow);
      box(19, 18, 1, 3, '#dae4ec');
      // Sleeve stops above the hand. Transparent pixels expose the selected skin layer.
      box(15, 18 + step, 1, 4, ink);
      box(12, 22 + step, 4, 1, ink);
      box(12, 18 + step, 3, 2, jacket);
      for (let y = 20 + step; y <= 21 + step; y++)
        for (let x = 12; x <= 14; x++) {
          const px = d === 3 ? 31 - x : x;
          c.data.fill(0, (y * 32 + px) * 4, (y * 32 + px) * 4 + 4);
        }
      box(13, 23, 7, 1, '#293346');
      box(13, 23 + step, 7, 1, '#293346');
      box(13, 24 + step, 7, 1, '#171e2d');
      box(12, 25 + step, 9, 1, ink);
      if (step) {
        box(17, 23 - step, 3, 1, '#293346');
        box(17, 24 - step, 4, 1, '#171e2d');
        box(17, 25 - step, 4, 1, ink);
      }
    }
    if (motion === 'attack') {
      const reach = [0, 1, 2, 3, 5, 4, 2, 0][f];
      box(20, 18, 3 + reach, 2, jacket);
      box(23 + reach, 12, 1, 6, '#e0edf0');
      box(22 + reach, 18, 3, 1, '#e4c473');
    }
  }
  if (layer === 'hair') {
    const style = Math.floor(value / 6),
      color = hairs[value % 6],
      light = shade(color, 25),
      dark = shade(color, -20);
    // Fill the crown and corner pixels too; no floating fragments or missing head edges.
    box(13, 3, 3, 1, color);
    box(9, 4, 13, 1, color);
    box(8, 5, 15, 2, color);
    box(9, 4, 6, 1, light);
    if (back) {
      box(9, 7, 13, 8, color);
      box(18, 7, 4, 8, dark);
    } else if (side) {
      box(8, 7, 6, 7, color);
      box(14, 7, 3, 6, color);
      box(8, 13, 6, 2, dark);
      box(14, 13, 2, 1, dark);
      box(21, 7, 2, 2, dark);
    } else {
      box(8, 7, 2, 2, color);
      box(13, 7, 2, 2, color);
      box(21, 7, 2, 2, dark);
      box(8, 9, 1, 2, color);
      box(22, 9, 1, 2, dark);
    }
    if (style === 1) {
      box(8, 7, 3, 10, color);
      if (!side) box(21, 7, 3, 10, dark);
    }
    if (style === 2) {
      for (let x = 8; x < 23; x += 4) box(x, 5 + (x % 2), 3, 4, color);
    }
    if (style === 3) {
      box(11, 2, 3, 3, light);
      box(16, 1, 3, 4, color);
      box(20, 2, 3, 3, dark);
    }
    if (style === 4) {
      box(8, 7, 3, 14, color);
      box(side ? 11 : 9, 20, 2, 2, dark);
    }
    if (style === 5) {
      box(side ? 9 : 22, 6, 3, 7, color);
      box(10, 6, 12, 2, color);
    }
  }
  if (layer === 'accessory') {
    if (value === 1 && !back) {
      for (const x of side ? [19] : [9, 18]) {
        box(x, 11, 4, 1, '#182e42');
        box(x, 12, 1, 1, '#182e42');
        box(x + 3, 12, 1, 1, '#182e42');
        box(x, 13, 4, 1, '#182e42');
      }
      if (!side) box(13, 12, 5, 1, '#182e42');
    }
    if (value === 2) {
      box(back ? 10 : side ? 10 : 9, 18, back ? 11 : 3, 5, '#a97c4a');
    }
    if (value === 3) {
      box(8, 2, 15, 3, '#bc945b');
      box(6, 5, 19, 2, '#dfa958');
    }
    if (value === 4) {
      box(side ? 10 : 8, 10, 2, 4, '#6995af');
      if (!side) box(22, 10, 2, 4, '#6995af');
      box(10, 3, 12, 1, '#293c50');
    }
    if (value === 5) {
      box(12, 16, 9, 1, '#d49054');
      box(18, 17, 2, 4, '#c37943');
    }
  }
  return c;
}
for (const [layer, count] of [
  ['body', 9],
  ['eyes', 5],
  ['outfit', 6],
  ['hair', 36],
  ['accessory', 6],
]) {
  const frames = [];
  for (let v = 0; v < count; v++)
    for (let d = 0; d < 4; d++) for (let f = 0; f < 8; f++) frames.push(draw(layer, v, d, f));
  await exportAnimation(`hero-${layer}`, frames);
}
for (const [layer, count] of [
  ['outfit', 6],
  ['body', 9],
]) {
  const frames = [];
  for (let v = 0; v < count; v++)
    for (let d = 0; d < 4; d++)
      for (let f = 0; f < 8; f++) frames.push(draw(layer, v, d, f, 'attack'));
  await exportAnimation(`hero-${layer}-attack`, frames);
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
  'LibreSprite: layered four-direction character sheets and animated creature sheets exported.'
);
// One shared scenery/collision description: an expanded forest with connected clearings.
const map = canvas(1024, 768),
  obstacles = [];
const scenery = [],
  sceneryFrames = [];
function sceneryObject(id, x, y, depth) {
  const frame = canvas(176, 160);
  scenery.push({ id, x, y, depth, frame: sceneryFrames.length });
  sceneryFrames.push(frame);
  return { r: (xx, yy, w, h, color) => frame.r(xx - x, yy - y, w, h, color) };
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
  const paint = sceneryObject(`tree-${scenery.length}`, x - 88, y - 154, y);
  obstacles.push({ x: x - 9, y: y - 12, w: 18, h: 18 });
  paint.r(x - 5, y - 25, 10, 27, '#624a38');
  paint.r(x - 3, y - 25, 3, 23, '#967047');
  const colors = ['#203f3a', '#28503f', '#326446', '#468051', '#639351'];
  for (let k = 0; k < 5; k++) {
    const radius = 32 - k * 4,
      cy = y - 38 - k * 4;
    for (let yy = -radius; yy <= radius; yy += 2) {
      const width = Math.floor(Math.sqrt(radius * radius - yy * yy));
      paint.r(x - width + (k % 2) * 3, cy + yy, width * 2, 2, colors[k]);
    }
  }
  for (let i = 0; i < 22; i++) {
    paint.r(x - 20 + Math.floor(rand() * 38), y - 70 + Math.floor(rand() * 32), 3, 2, '#729b59');
  }
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
// Pond, bank and reflected ripples.
for (let y = 485; y < 660; y++)
  for (let x = 790; x < 960; x++) {
    const d = ((x - 875) / 80) ** 2 + ((y - 574) / 78) ** 2;
    if (d < 1.1)
      map.r(x, y, 1, 1, d > 1 ? '#a8ac77' : d > 0.85 ? '#489b99' : d > 0.5 ? '#357e8c' : '#2b657b');
  }
obstacles.push({ x: 795, y: 500, w: 160, h: 145 });
for (let i = 0; i < 38; i++) {
  const x = 820 + Math.floor(rand() * 110),
    y = 530 + Math.floor(rand() * 80);
  map.r(x, y, 6, 1, '#75b6b1');
}
// Cabin in the north clearing; access road connects at its door.
const cabin = sceneryObject('cabin', 594, 44, 204);
cabin.r(620, 105, 125, 93, '#694b38');
for (let y = 110; y < 198; y += 7) cabin.r(623, y, 119, 2, '#886448');
cabin.r(668, 148, 27, 50, '#3e3733');
cabin.r(671, 152, 21, 46, '#936a45');
cabin.r(687, 172, 2, 2, '#edc975');
for (const x of [635, 711]) {
  cabin.r(x, 143, 19, 23, '#282f35');
  cabin.r(x + 2, 145, 15, 18, '#efc779');
  cabin.r(x + 8, 145, 2, 18, '#79583e');
  cabin.r(x + 2, 154, 15, 2, '#79583e');
}
for (let y = 55; y < 120; y++) {
  const half = Math.floor((y - 55) * 1.25);
  cabin.r(682 - half, y, half * 2, 1, y % 7 === 0 ? '#513c39' : '#9c6150');
}
cabin.r(599, 118, 166, 6, '#413833');
cabin.r(665, 199, 34, 5, '#a2a18a');
obstacles.push({ x: 620, y: 105, w: 125, h: 99 });
// Species habitats: low bushes leave their approach tiles walkable.
for (const [x, y] of [
  [300, 270],
  [680, 450],
  [820, 350],
  [290, 510],
  [420, 180],
  [580, 620],
]) {
  for (let i = 0; i < 8; i++) {
    const xx = x - 25 + Math.floor(rand() * 50),
      yy = y + Math.floor(rand() * 12);
    map.r(xx, yy, 12, 8, '#284e3b');
    map.r(xx + 1, yy - 3, 9, 5, '#598450');
  }
}
for (let i = 0; i < 260; i++) {
  const x = 65 + Math.floor(rand() * 890),
    y = 90 + Math.floor(rand() * 615);
  if (rand() > 0.5) {
    map.r(x, y, 1, 4, '#6f9c58');
    map.r(x - 1, y, 3, 2, i % 3 ? '#dbc78d' : '#c68d9b');
  }
}
await exportAnimation('forest-ground', [map], 1);
await exportAnimation('forest-scenery', sceneryFrames, 8);
// Retain the composed illustration for battle backgrounds.
for (const object of [...scenery].sort((a, b) => a.depth - b.depth)) {
  const frame = sceneryFrames[object.frame];
  for (let yy = 0; yy < frame.h; yy++)
    for (let xx = 0; xx < frame.w; xx++) {
      const x = object.x + xx,
        y = object.y + yy,
        p = (yy * frame.w + xx) * 4;
      if (x >= 0 && y >= 0 && x < map.w && y < map.h && frame.data[p + 3])
        map.data.set(frame.data.subarray(p, p + 4), (y * map.w + x) * 4);
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
  )
);

for (const file of (await fs.readdir(dir)).filter(
  (f) => f.startsWith('hero-') || f === 'forest-v2.png' || f === 'creatures-animated.png'
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
