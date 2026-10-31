/** Original 96 × 112 pixel portraits, authored in layers and exported by LibreSprite.
 * Palette indices match the existing world avatar. No generated approximations of
 * a 32px walking sprite: these are separately drawn faces, clothes and accessories.
 */
import fs from 'node:fs/promises';
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
    for (const x of [29, 52]) {
      c.rect(x, 42, 16, 2, ink);
      c.rect(x, 44, 2, 10, ink);
      c.rect(x + 14, 44, 2, 10, ink);
      c.rect(x + 2, 54, 12, 2, ink);
      c.rect(x + 2, 44, 6, 1, '#a9c8d0');
      c.pixel(x + 2, 53, '#a9c8d0');
    }
    c.rect(45, 45, 7, 2, ink);
    c.line(25, 44, 29, 45, ink);
    c.line(68, 45, 72, 43, ink);
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
        [11, 34],
        [11, 29],
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
    c.rect(14, 29, 68, 3, '#edcc88');
    c.rect(19, 32, 57, 1, '#aa7b45');
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
    for (const x of [19, 69]) {
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
        [33, 73],
        [44, 78],
        [59, 73],
        [65, 78],
        [60, 87],
        [55, 89],
        [58, 107],
        [49, 111],
        [43, 88],
        [34, 86],
        [29, 79],
      ],
      ink
    );
    poly(
      c,
      [
        [34, 76],
        [45, 81],
        [59, 76],
        [61, 80],
        [57, 84],
        [44, 85],
        [35, 83],
        [32, 79],
      ],
      '#d6654c'
    );
    poly(
      c,
      [
        [45, 86],
        [53, 87],
        [55, 105],
        [50, 107],
      ],
      '#a9433e'
    );
    c.line(35, 78, 44, 83, '#ef9c65');
    c.line(47, 89, 50, 104, '#e77a50');
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
  ['portrait-hair-back', Array.from({ length: 6 }, (_, i) => hair(i, true))],
  ['portrait-hair', Array.from({ length: 6 }, (_, i) => hair(i))],
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
    { stdio: 'pipe' }
  );
  // Re-save through LibreSprite so the editable source follows its native format.
  execFileSync(
    'C:/Program Files/LibreSprite/libresprite.exe',
    ['--batch', native, '--save-as', native],
    { stdio: 'pipe' }
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
// Review every accessory and both silhouettes against a dark dialogue background.
const previews = [];
for (let i = 0; i < OUTFIT_SPECS.length * 2; i++) {
  const female = i >= OUTFIT_SPECS.length;
  const layers = [
    hair(i % 6, true),
    body(i % 9, female),
    clothes(i % OUTFIT_SPECS.length, female),
    eyes(i % 5, female),
    hair(i % 6),
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
    hair(i % 6, true),
    body(5, female),
    clothes(i % OUTFIT_SPECS.length, female),
    eyes(2, female),
    hair(i % 6),
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
console.log(
  `LibreSprite exported refined anime portraits: two silhouettes, 9 skins, ${OUTFIT_SPECS.length} distinct outfits, 5 eye colors, 6 independent fringes and 6 accessories. Hair colors are transferred at runtime.`
);
