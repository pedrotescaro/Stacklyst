import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import sharp from 'sharp';
import ts from 'typescript';
const dir = 'public/assets/mundinho',
  source = 'artifacts/mundinho/libresprite/refined';
const sceneryOnly = process.argv.includes('--scenery-only');
const charactersOnly = process.argv.includes('--characters-only');
const paletteSource = await fs.readFile('src/lib/mundinho/avatar-palettes.ts', 'utf8');
const { outputText } = ts.transpileModule(paletteSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
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
const hairs = ['#17191f', '#684331', '#bd8240', '#dcd8d4', '#805d9e', '#c15e54'];
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
// Original skin pixels own the body anatomy; the face is independently refined below.
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
    const raw = skinPixels[value % 9];
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
      const base = skins[value % 9],
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
  if (layer === 'body') {
    // Clean skin belongs to the body, never a baked fringe, eyebrow or eye.
    // Keep the source silhouette and every body pixel below the chin intact.
    const raw = skinPixels[value % 9],
      p = SKIN_PALETTES[value % 9],
      female = value >= 9;
    for (let y = 3; y <= 15; y++)
      for (let x = 0; x < 32; x++) {
        if (!raw[(y * 32 + x) * 4 + 3]) continue;
        const edge = x >= 21 || y === 15;
        box(x, y, 1, 1, edge ? p.shadow : x <= 10 && y <= 9 ? p.highlight : p.base);
      }
    if (!back) {
      if (!side) {
        box(15, 14, 2, 1, shade(p.deepShadow, 20));
        if (female) {
          box(9, 13, 2, 1, p.blush);
          box(20, 13, 2, 1, p.blush);
        }
      } else {
        box(21, 14, 1, 1, shade(p.deepShadow, 20));
        if (female) box(18, 13, 2, 1, p.blush);
      }
    }
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
      else box(x, 8, 3, 1, '#6b5151');
    }
  }
  if (layer === 'outfit') {
    const p = OUTFIT_SPECS[value],
      jacket = p.jacket,
      shadow = p.shadow,
      light = shade(jacket, 22),
      kind = p.kind;
    if (!side) {
      // Fine coloured seams replace the heavy black blocks at the sleeve and hem.
      box(9, 16, 13, 2, jacket);
      box(8, 18, 15, 1, jacket);
      box(11, 19, 9, 4, jacket);
      box(19, 17, 2, 5, shadow);
      box(11, 22, 9, 1, shadow);
      box(9, 16, 4, 1, light);
      for (const [right, off] of [
        [false, step],
        [true, -step],
      ]) {
        // Shoulder, upper arm and cuff form one sleeve, including the moving poses.
        // The two skin pixels below each cuff stay uncovered.
        box(right ? 19 : 8, 17 + off, 4, 3, jacket);
        box(right ? 21 : 7, 18 + off, 3, 2, jacket);
        box(right ? 24 : 6, 19 + off, 1, 2, shadow);
        box(right ? 22 : 7, 19 + off, 2, 1, light);
        box(right ? 20 : 9, 19 + off, 2, 2, shadow);
      }
      if (!back) {
        if (['jacket', 'bomber', 'denim', 'cardigan', 'overcoat', 'coat'].includes(kind)) {
          box(14, 17, 3, 5, p.shirt);
          box(13, 17, 1, 3, light);
          box(17, 17, 1, 4, shadow);
        }
        if (kind === 'hoodie') {
          box(12, 16, 7, 1, p.shirt);
          box(13, 17, 5, 1, shadow);
          box(13, 18, 1, 2, p.shirt);
          box(17, 18, 1, 2, p.shirt);
          box(13, 21, 5, 1, light);
        }
        if (kind === 'tech') {
          box(15, 17, 1, 5, p.shirt);
          box(11, 19, 3, 1, p.shirt);
        }
        if (kind === 'sweater') {
          box(12, 16, 7, 1, p.shirt);
          box(11, 20, 9, 1, light);
        }
        if (kind === 'ceremonial') {
          box(13, 16, 5, 1, p.shirt);
          box(14, 17, 3, 3, p.shirt);
          box(15, 17, 1, 3, '#6a3942');
          box(11, 21, 9, 1, '#f4dd8e');
        }
        if (kind === 'denim') {
          box(11, 18, 2, 1, light);
          box(18, 18, 2, 1, light);
        }
        if (kind === 'bomber') {
          box(11, 21, 9, 1, p.shirt);
          box(6, 19 + step, 3, 1, p.shirt);
        }
        if (kind === 'sailor') {
          box(12, 16, 7, 1, p.shirt);
          box(13, 17, 5, 1, p.shirt);
          box(14, 18, 3, 1, p.shirt);
          box(15, 18, 1, 3, '#b84d69');
        }
        if (kind === 'tunic') {
          box(12, 16, 7, 1, p.shirt);
          box(15, 17, 1, 3, p.shirt);
          box(11, 21, 9, 1, '#795342');
          box(15, 21, 2, 1, '#dfbf78');
        }
      } else {
        if (kind === 'hoodie') {
          box(12, 16, 7, 2, shadow);
          box(13, 16, 5, 1, light);
        }
        if (kind === 'sailor') {
          box(11, 16, 9, 3, p.shirt);
          box(12, 16, 7, 2, jacket);
        }
        if (kind === 'denim') box(11, 19, 9, 1, light);
        if (kind === 'tech') box(13, 18, 5, 1, p.shirt);
      }
      if (['coat', 'cardigan', 'overcoat', 'tunic'].includes(kind)) {
        box(10, 22, 11, kind === 'overcoat' ? 3 : 2, shadow);
        box(10, 22, 3, 1, jacket);
        box(18, 22, 3, 1, jacket);
        if (!back) box(14, 22, 3, 1, p.pants);
      }
      for (const [x, off] of [
        [11, step],
        [17, -step],
      ]) {
        box(x, 23 + off, 3, 2, p.pants);
        box(x, 24 + off, 1, 1, shade(p.pants, -15));
        box(x - 1, 25 + off, 4, 1, p.shoes);
        box(x, 25 + off, 2, 1, shade(p.shoes, 20));
      }
    } else {
      box(10, 16, 12, 1, shadow);
      box(10, 17, 11, 2, jacket);
      box(11, 19, 10, 3, jacket);
      box(19, 18, 2, 4, shadow);
      box(12, 22, 9, 1, shadow);
      box(11, 17, 2, 1, light);
      box(12, 18 + step, 3, 2, jacket);
      box(15, 18 + step, 1, 3, shadow);
      box(12, 20 + step, 1, 1, light);
      // Keep the near hand exposed in every pose.
      for (let y = 20 + step; y <= 21 + step; y++)
        for (let x = 12; x <= 14; x++) {
          const px = d === 3 ? 31 - x : x;
          c.data.fill(0, (y * 32 + px) * 4, (y * 32 + px) * 4 + 4);
        }
      if (['coat', 'cardigan', 'overcoat', 'tunic'].includes(kind))
        box(11, 22, 10, kind === 'overcoat' ? 3 : 2, shadow);
      if (!back) {
        if (['jacket', 'bomber', 'denim', 'cardigan', 'overcoat', 'coat'].includes(kind))
          box(20, 17, 1, 4, p.shirt);
        if (kind === 'hoodie') {
          box(12, 16, 5, 1, p.shirt);
          box(18, 18, 1, 2, p.shirt);
        }
        if (kind === 'tech') box(18, 18, 2, 1, p.shirt);
        if (kind === 'sweater' || kind === 'bomber') box(16, 21, 4, 1, p.shirt);
        if (kind === 'sailor') {
          box(12, 16, 7, 2, p.shirt);
          box(19, 18, 1, 2, '#b84d69');
        }
        if (kind === 'tunic' || kind === 'ceremonial') box(16, 21, 5, 1, p.shirt);
      }
      box(13, 23, 7, 1, p.pants);
      box(13, 23 + step, 7, 2, p.pants);
      box(12, 25 + step, 9, 1, p.shoes);
      if (step) {
        box(17, 23 - step, 3, 2, p.pants);
        box(17, 25 - step, 4, 1, p.shoes);
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
    // Shared skull coverage stops at the crown; every fringe below it is authored separately.
    box(10, 3, 11, 1, color);
    box(9, 4, 13, 1, color);
    box(8, 5, 15, 2, color);
    box(10, 4, 6, 1, light);
    box(9, 5, 2, 1, light);
    if (back) {
      box(9, 7, 13, style === 0 || style === 3 ? 7 : 9, color);
      box(19, 7, 3, style === 0 || style === 3 ? 7 : 9, dark);
      if ([1, 4, 5].includes(style)) {
        box(9, 14, 13, style === 4 ? 7 : 3, color);
        box(19, 14, 3, style === 4 ? 7 : 3, dark);
      }
    } else if (side) {
      // Continuous scalp coverage down from crown
      box(8, 7, 13, 1, color); // y=7, x=8..20
      box(8, 8, 11, 1, color); // y=8, x=8..18
      box(8, 9, 10, 1, color); // y=9, x=8..17

      // Mid-crown highlight sheen
      box(11, 6, 5, 1, light);

      if (style === 0) {
        // 0: Short cropped / neat taper
        // Airy fringe at brow
        box(19, 7, 2, 1, color);
        box(19, 8, 2, 1, color);
        box(18, 9, 1, 1, color);
        box(19, 8, 1, 1, light);

        // Sideburn in front of ear
        box(16, 9, 2, 2, color);
        box(16, 11, 1, 1, color);

        // Back of skull tapering neatly to nape
        box(8, 10, 6, 1, color);
        box(8, 11, 5, 1, color);
        box(8, 12, 4, 1, color);
        box(9, 13, 3, 1, dark);
        box(9, 14, 2, 1, dark);
      } else if (style === 1) {
        // 1: Bob (Classic curved bob cupping the jaw)
        // Rounded bangs above eye
        box(19, 7, 3, 1, color);
        box(18, 8, 3, 1, color);
        box(19, 8, 1, 1, light);
        box(17, 9, 2, 1, color);

        // Full side covering ear and cheek
        box(15, 9, 3, 1, color);
        box(8, 10, 10, 1, color);
        box(8, 11, 10, 1, color);
        box(8, 12, 9, 1, color);
        box(8, 13, 9, 1, color);

        // Soft curved lower edge cupping jaw & nape
        box(7, 7, 1, 6, color);
        box(7, 10, 1, 3, dark);
        box(8, 14, 8, 1, color);
        box(14, 14, 2, 1, dark);
        box(9, 15, 6, 1, dark);
      } else if (style === 2) {
        // 2: Curls / Wavy (Soft romantic textured curls)
        // Scalloped bangs
        box(19, 7, 3, 1, color);
        box(18, 8, 3, 1, color);
        box(19, 8, 1, 1, light);
        box(17, 9, 2, 1, color);

        // Side curl lock framing cheek
        box(15, 9, 2, 1, color);
        box(16, 10, 2, 3, color);
        box(16, 13, 1, 1, dark);

        // Textured back with curly ridges (solid, continuous)
        box(7, 7, 1, 2, color);
        box(8, 10, 9, 1, color);
        box(7, 11, 10, 1, color);
        box(7, 11, 1, 1, light);
        box(7, 12, 10, 1, color);
        box(8, 13, 8, 1, color);
        box(7, 13, 1, 1, dark);
        box(8, 14, 7, 1, dark);
        box(9, 15, 4, 1, dark);
      } else if (style === 3) {
        // 3: Spiky / Swept Anime
        // Top swept spikes
        box(13, 1, 4, 2, color);
        box(14, 1, 2, 1, light);
        box(10, 2, 3, 1, light);
        box(17, 2, 2, 2, dark);

        // Sharp swept bangs
        box(19, 7, 3, 1, color);
        box(19, 8, 2, 1, color);
        box(20, 8, 1, 1, light);
        box(18, 9, 2, 1, color);

        // Sharp sideburn lock
        box(16, 9, 2, 2, color);
        box(16, 11, 1, 2, color);
        box(16, 13, 1, 1, dark);

        // Swept tufts at back
        box(7, 6, 1, 3, color);
        box(6, 7, 1, 2, dark);
        box(7, 9, 2, 2, color);
        box(8, 10, 6, 1, color);
        box(8, 11, 5, 1, color);
        box(8, 12, 4, 1, dark);
        box(9, 13, 3, 1, dark);
      } else if (style === 4) {
        // 4: Long Hair (Feminine long flowing locks)
        // Elegant center-part fringe framing brow
        box(19, 7, 3, 1, color);
        box(18, 8, 3, 1, color);
        box(19, 8, 1, 1, light);
        box(17, 9, 2, 1, color);

        // Graceful front lock falling over cheek and chest
        box(16, 10, 2, 2, color);
        box(15, 12, 2, 3, color);
        box(15, 15, 2, 3, color);
        box(16, 13, 1, 4, light);
        box(15, 18, 1, 1, dark);

        // Head coverage around ear (solid)
        box(8, 10, 9, 1, color);
        box(8, 11, 8, 1, color);
        box(8, 12, 8, 1, color);
        box(8, 13, 7, 1, color);

        // Volume behind head
        box(7, 7, 1, 6, color);
        box(7, 8, 1, 4, light);

        // Flowing mane down the back along torso
        box(7, 13, 7, 1, color);
        box(7, 14, 7, 1, color);
        box(7, 15, 6, 1, color);
        box(7, 16, 6, 1, color);
        box(7, 17, 5, 1, color);
        box(7, 18, 5, 1, color);
        box(8, 19, 4, 1, color);
        box(8, 20, 3, 1, color);
        box(8, 21, 2, 1, dark);

        // Sheen and shadow down the flowing hair
        box(8, 14, 1, 5, light);
        box(12, 13, 2, 2, dark);
        box(11, 15, 2, 2, dark);
        box(10, 17, 2, 2, dark);
      } else if (style === 5) {
        // 5: Side Ponytail (Lively anime ponytail)
        // Swept asymmetric bangs
        box(19, 7, 3, 1, color);
        box(18, 8, 3, 1, color);
        box(19, 8, 1, 1, light);
        box(17, 9, 2, 1, color);
        box(16, 10, 2, 2, color);

        // Scalp pulled back smoothly
        box(8, 10, 8, 1, color);
        box(8, 11, 7, 1, color);
        box(9, 12, 5, 1, color);
        box(9, 13, 4, 1, dark);
        box(10, 14, 2, 1, dark);

        // Gather point & Hair tie (solidly connected to head)
        box(8, 7, 2, 2, '#e4c473');

        // Ponytail arching back and cascading down
        box(6, 6, 3, 2, color);
        box(6, 6, 2, 1, light);
        box(4, 7, 3, 2, color);
        box(5, 7, 1, 2, light);
        box(4, 9, 3, 2, color);
        box(4, 9, 1, 1, light);
        box(6, 9, 1, 2, dark);
        box(5, 11, 3, 2, color);
        box(7, 11, 1, 2, dark);
        box(5, 13, 3, 2, color);
        box(6, 13, 1, 1, light);
        box(7, 13, 1, 2, dark);
        box(6, 15, 2, 1, color);
        box(7, 15, 1, 1, dark);
        box(6, 16, 1, 1, dark);
      }
    } else {
      box(8, 7, 2, 3, color);
      box(21, 7, 2, 3, dark);
      if (style === 0) {
        // cropped, airy split fringe
        box(10, 7, 3, 1, color);
        box(13, 7, 2, 2, color);
        box(17, 7, 4, 1, color);
        box(19, 8, 2, 1, dark);
      } else if (style === 1) {
        // bob, straight curved fringe
        box(10, 7, 11, 2, color);
        box(11, 9, 3, 1, color);
        box(17, 9, 3, 1, dark);
        box(8, 9, 3, 7, color);
        box(21, 9, 3, 7, dark);
      } else if (style === 2) {
        // curls, scalloped forehead rather than the same bangs
        for (const [x, y] of [
          [9, 7],
          [13, 7],
          [17, 7],
          [20, 6],
        ]) {
          box(x, y, 3, 2, color);
          box(x, y, 1, 1, light);
        }
        box(8, 9, 2, 3, color);
        box(22, 8, 2, 4, dark);
      } else if (style === 3) {
        // pointed swept fringe
        box(10, 7, 5, 1, color);
        box(14, 8, 4, 1, color);
        box(16, 9, 3, 1, color);
        box(18, 10, 2, 1, dark);
      } else if (style === 4) {
        // long hair with a visible centre part
        box(10, 7, 3, 2, color);
        box(11, 9, 2, 1, color);
        box(18, 7, 3, 2, color);
        box(18, 9, 2, 1, dark);
        box(8, 9, 3, 11, color);
        box(21, 9, 3, 11, dark);
      } else {
        // side ponytail, asymmetric fringe
        box(10, 7, 9, 1, color);
        box(10, 8, 6, 1, color);
        box(10, 9, 4, 1, color);
        box(10, 10, 2, 1, dark);
        box(22, 6, 3, 7, color);
        box(23, 12, 2, 3, dark);
      }
    }
    if (style === 3 && !side) {
      box(11, 2, 3, 2, light);
      box(16, 1, 3, 3, color);
      box(20, 2, 3, 3, dark);
    }
    if (style === 5 && back) {
      box(22, 6, 3, 9, color);
      box(23, 14, 2, 2, dark);
    }
    if (!back) {
      // Hair must never crop one iris or lash differently from the other.
      // Reserve the actual eye shapes for both silhouettes in front and profile views.
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
  if (layer === 'outfit' && side) {
    // Long hems must never paint over the animated near hand.
    for (let y = 20 + step; y <= 21 + step; y++)
      for (let x = 12; x <= 14; x++) {
        const px = d === 3 ? 31 - x : x;
        c.data.fill(0, (y * 32 + px) * 4, (y * 32 + px) * 4 + 4);
      }
  }
  return c;
}
for (const [layer, count] of [
  ['body', 18],
  ['eyes', 10],
  ['outfit', OUTFIT_SPECS.length],
  ['hair', 36],
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
if (charactersOnly) {
  for (const name of [
    'hero-body',
    'hero-body-attack',
    'hero-eyes',
    'hero-outfit',
    'hero-outfit-attack',
    'hero-hair',
  ]) {
    execFileSync(
      process.execPath,
      [
        '.agents/skills/impeccable/scripts/embed-prompt.mjs',
        `${dir}/${name}.png`,
        '--prompt',
        'Origin: original 32px character pixel artwork authored in scripts/refine-mundinho-sprites.mjs and exported from native animated ASE sources using LibreSprite 1.3. Twelve garments, independent hairstyle fringes, clean anime-inspired faces; original body anatomy below the face preserved.',
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
