/** Original 96 × 112 pixel portraits, authored in layers and exported by LibreSprite.
 * Palette indices match the existing world avatar. No generated approximations of
 * a 32px walking sprite: these are separately drawn faces, clothes and accessories.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';
import { createPortraitArt } from './lib/mundinho-portrait-art.mjs';

const paletteSource = await fs.readFile('src/lib/mundinho/avatar-palettes.ts', 'utf8');
const { outputText } = ts.transpileModule(paletteSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const source = 'artifacts/mundinho/libresprite/portraits';
const output = 'public/assets/mundinho';
const hairstyles = JSON.parse(await fs.readFile('src/lib/mundinho/hairstyles.json', 'utf8'));
// Batch exports must not modify the artist's desktop profile (or need profile permissions).
const exportProfile = await fs.mkdtemp(path.join(os.tmpdir(), 'stacklyst-portraits-'));
const exportEnv = { ...process.env, APPDATA: exportProfile };
await fs.mkdir(source, { recursive: true });
const W = 96,
  H = 112,
  ink = '#24212c';
const make = () => canvas(W, H);
const poly = (c, points, color) => c.polygon(points, color);

const { body, clothes, eyes, hair } = createPortraitArt({
  SKIN_PALETTES,
  OUTFIT_SPECS,
  EYE_COLORS,
});

function accessory(index) {
  const c = make();
  if (index === 1) {
    for (const x of [24, 53]) {
      c.line(x + 2, 42, x + 16, 42, ink);
      c.line(x, 44, x + 2, 42, ink);
      c.line(x, 44, x, 56, ink);
      c.line(x, 56, x + 3, 59, ink);
      c.line(x + 3, 59, x + 15, 59, ink);
      c.line(x + 15, 59, x + 18, 56, ink);
      c.line(x + 18, 44, x + 18, 56, ink);
      c.line(x + 16, 42, x + 18, 44, ink);
      c.line(x + 3, 43, x + 9, 43, '#a9c8d0');
      c.pixel(x + 2, 56, '#a9c8d0');
    }
    c.line(42, 47, 53, 47, ink);
    c.line(19, 45, 24, 47, ink);
    c.line(71, 47, 76, 45, ink);
  }
  if (index === 2) {
    for (const x of [26, 63]) {
      c.rect(x, 83, 7, 29, ink);
      c.rect(x + 1, 83, 4, 29, '#9f7048');
      c.line(x + 1, 85, x + 1, 109, '#d2a269');
      c.rect(x - 1, 101, 9, 6, '#ead19a');
      c.rect(x + 1, 103, 5, 2, '#674533');
    }
  }
  if (index === 3) {
    poly(
      c,
      [
        [23, 25],
        [27, 10],
        [36, 5],
        [59, 5],
        [68, 11],
        [73, 25],
        [85, 29],
        [85, 34],
        [6, 34],
        [6, 29],
      ],
      '#57402e'
    );
    poly(
      c,
      [
        [26, 25],
        [30, 12],
        [37, 8],
        [58, 8],
        [65, 13],
        [70, 26],
      ],
      '#cba363'
    );
    poly(
      c,
      [
        [31, 12],
        [38, 9],
        [56, 9],
        [62, 12],
        [33, 14],
      ],
      '#edcc88'
    );
    c.rect(25, 23, 47, 5, '#793e36');
    c.rect(9, 29, 78, 3, '#edcc88');
    c.rect(14, 32, 65, 1, '#aa7b45');
    for (let x = 33; x < 63; x += 5) c.line(x, 16, x - 2, 21, '#aa7b45');
    c.rect(60, 24, 7, 3, '#d18160');
  }
  if (index === 4) {
    // headphones
    poly(
      c,
      [
        [20, 48],
        [20, 25],
        [27, 15],
        [38, 10],
        [58, 10],
        [69, 15],
        [76, 26],
        [76, 48],
        [71, 48],
        [71, 28],
        [65, 19],
        [57, 16],
        [38, 16],
        [29, 20],
        [25, 28],
        [25, 48],
      ],
      ink
    );
    c.line(28, 17, 38, 13, '#9bafd0');
    c.line(38, 13, 56, 13, '#9bafd0');
    for (const x of [14, 72]) {
      c.rect(x, 40, 9, 21, ink);
      c.rect(x + 2, 42, 5, 17, '#566a90');
      c.rect(x + 2, 44, 2, 12, '#8aa5c5');
      c.rect(x + 3, 48, 3, 5, '#66bdd1');
    }
  }
  if (index === 5) {
    // warm scarf, same accessory as the world sprite
    poly(
      c,
      [
        [33, 79],
        [44, 84],
        [59, 79],
        [65, 84],
        [60, 91],
        [55, 93],
        [58, 107],
        [49, 111],
        [43, 94],
        [34, 92],
        [29, 85],
      ],
      ink
    );
    poly(
      c,
      [
        [34, 82],
        [45, 87],
        [59, 82],
        [61, 86],
        [57, 90],
        [44, 91],
        [35, 89],
        [32, 85],
      ],
      '#d6654c'
    );
    poly(
      c,
      [
        [45, 92],
        [53, 93],
        [55, 105],
        [50, 107],
      ],
      '#a9433e'
    );
    c.line(35, 84, 44, 89, '#ef9c65');
    c.line(47, 95, 50, 104, '#e77a50');
    c.rect(49, 106, 7, 2, '#ef9c65');
  }
  return c;
}

const sheets = [
  ['portrait-body', Array.from({ length: 18 }, (_, i) => body(i % 9, i >= 9))],
  [
    'portrait-outfit',
    Array.from({ length: OUTFIT_SPECS.length * 2 }, (_, i) =>
      clothes(i % OUTFIT_SPECS.length, i >= OUTFIT_SPECS.length)
    ),
  ],
  ['portrait-eyes', Array.from({ length: 10 }, (_, i) => eyes(i % 5, i >= 5))],
  ['portrait-hair-back', Array.from({ length: hairstyles.length }, (_, i) => hair(i, true))],
  ['portrait-hair', Array.from({ length: hairstyles.length }, (_, i) => hair(i))],
  ['portrait-accessory', Array.from({ length: 6 }, (_, i) => accessory(i))],
];
const manifest = [];
for (const [name, frames] of sheets) {
  const native = `${source}/${name}.ase`;
  await fs.writeFile(native, aseDocument({ names: [name], frames: frames.map((f) => [f]) }));
  execFileSync(
    'C:/Program Files/LibreSprite/libresprite.exe',
    [
      '--batch',
      native,
      '--sheet',
      `${output}/${name}.png`,
      '--sheet-width',
      String(W * frames.length),
      '--data',
      `${source}/${name}.json`,
      '--format',
      'json-array',
    ],
    { stdio: 'pipe', env: exportEnv }
  );
  // Re-save through LibreSprite so the editable source follows its native format.
  execFileSync(
    'C:/Program Files/LibreSprite/libresprite.exe',
    ['--batch', native, '--save-as', native],
    { stdio: 'pipe', env: exportEnv }
  );
  manifest.push({
    name,
    width: W,
    height: H,
    frames: frames.length,
    source: native,
    exporter: 'LibreSprite 1.3',
    provenance: 'Original layered pixel art; scripts/build-mundinho-portraits.mjs',
  });
  await fs.writeFile(
    `${output}/${name}.png.json`,
    JSON.stringify(
      {
        prompt: `Origin: original pixel art authored in scripts/build-mundinho-portraits.mjs; exported from ${native} using LibreSprite 1.3. Layer: ${name}. No external image or AI image generator used.`,
      },
      null,
      2
    ) + '\n'
  );
}
await fs.writeFile(`${source}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
// Review exactly the runtime transfer, including the preserved dark hair contours.
function reviewHair(layer, color) {
  const data = Buffer.from(layer.data);
  const target = color
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16));
  const sourceColor = [220, 216, 212];
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    for (let ch = 0; ch < 3; ch++)
      if (data[i + ch] >= 96)
        data[i + ch] = Math.max(0, Math.min(255, target[ch] + data[i + ch] - sourceColor[ch]));
  }
  return { ...layer, data };
}
const reviewColors = ['#17191f', '#684331', '#bd8240', '#c15e54', '#805d9e', '#684331'];
// Review every accessory and both silhouettes against a dark dialogue background.
const previews = [];
for (let i = 0; i < OUTFIT_SPECS.length * 2; i++) {
  const female = i >= OUTFIT_SPECS.length;
  const layers = [
    reviewHair(hair(i % 6, true), reviewColors[i % 6]),
    body(i % 9, female),
    clothes(i % OUTFIT_SPECS.length, female),
    eyes(i % 5, female),
    reviewHair(hair(i % 6), reviewColors[i % 6]),
    accessory(0),
  ];
  const bytes = await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
    .composite(layers.map((c) => ({ input: c.data, raw: { width: W, height: H, channels: 4 } })))
    .png()
    .toBuffer();
  previews.push({ input: bytes, left: (i % 6) * W, top: Math.floor(i / 6) * H });
}
await sharp({
  create: {
    width: W * 6,
    height: H * Math.ceil((OUTFIT_SPECS.length * 2) / 6),
    channels: 4,
    background: '#000000',
  },
})
  .composite(previews)
  .png()
  .toFile(`${source}/catalog.png`);
// Keep accessories in their own review: wardrobe and forehead shapes remain unobscured above.
const accessories = [];
for (let i = 0; i < 12; i++) {
  const female = i >= 6;
  const layers = [
    reviewHair(hair(i % 6, true), reviewColors[i % 6]),
    body(5, female),
    clothes(i % OUTFIT_SPECS.length, female),
    eyes(2, female),
    reviewHair(hair(i % 6), reviewColors[i % 6]),
    accessory(i % 6),
  ];
  const bytes = await sharp({ create: { width: W, height: H, channels: 4, background: '#16151c' } })
    .composite(layers.map((c) => ({ input: c.data, raw: { width: W, height: H, channels: 4 } })))
    .png()
    .toBuffer();
  accessories.push({ input: bytes, left: (i % 6) * W, top: Math.floor(i / 6) * H });
}
await sharp({ create: { width: W * 6, height: H * 2, channels: 4, background: '#16151c' } })
  .composite(accessories)
  .png()
  .toFile(`${source}/accessories-review.png`);
await fs.mkdir('artifacts/mundinho/portrait-refinement', { recursive: true });
await sharp(`${source}/catalog.png`)
  .resize(W * 12, H * 8, { kernel: 'nearest' })
  .png()
  .toFile('artifacts/mundinho/portrait-refinement/after.png');
// Player/default, fair skin, brown-haired reference, Ada and two wardrobe combinations.
const showcaseAvatars = [
  [2, 0, 0, '#17191f', 0, 0, false],
  [5, 0, 0, '#17191f', 0, 0, false],
  [0, 0, 0, '#34231c', 0, 0, false],
  [5, 2, 1, '#dcd8d4', 1, 0, true],
  [3, 3, 5, '#c15e54', 5, 5, true],
  [5, 1, 1, '#684331', 7, 1, true],
];
const showcase = [];
for (const [i, [skin, eye, cut, color, outfit, item, female]] of showcaseAvatars.entries()) {
  const layers = [
    reviewHair(hair(cut, true), color),
    body(skin, female),
    clothes(outfit, female),
    eyes(eye, female),
    reviewHair(hair(cut), color),
    accessory(item),
  ];
  const input = await sharp({ create: { width: W, height: H, channels: 4, background: '#1b1c27' } })
    .composite(layers.map((c) => ({ input: c.data, raw: { width: W, height: H, channels: 4 } })))
    .png()
    .toBuffer();
  showcase.push({ input, left: i * W, top: 0 });
}
const showcaseImage = await sharp({
  create: { width: W * 6, height: H, channels: 4, background: '#1b1c27' },
})
  .composite(showcase)
  .png()
  .toBuffer();
await sharp(showcaseImage)
  .resize(W * 12, H * 2, { kernel: 'nearest' })
  .png()
  .toFile('artifacts/mundinho/portrait-refinement/reference-showcase.png');
console.log(
  `LibreSprite exported refined anime portraits: two silhouettes, 9 skins, ${OUTFIT_SPECS.length} distinct outfits, 5 eye colors, ${hairstyles.length} independent fringes and 6 accessories. Hair colors are transferred at runtime.`
);
