import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';
import sharp from 'sharp';
import { chestArtwork } from './lib/mundinho-chest-art.mjs';

const libreSprite = process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe';
const sources = 'artifacts/mundinho/libresprite/props';
const output = 'public/assets/mundinho';
const scratch = '.tmp/mundinho-props';
await Promise.all([sources, output, scratch].map((dir) => fs.mkdir(dir, { recursive: true })));

// Original, deliberately pixel-aligned artwork. No SVG rasterization or antialiasing.

function signpost() {
  const shadow = canvas(48, 48),
    wood = canvas(48, 48),
    detail = canvas(48, 48);
  shadow.ellipse(25, 41, 15, 3, '#17382d38');
  shadow.ellipse(25, 41, 8, 2, '#17382d60');
  wood.polygon(
    [
      [22, 15],
      [27, 15],
      [28, 41],
      [26, 43],
      [21, 42],
    ],
    '#3e3529'
  );
  wood.rect(23, 24, 3, 17, '#976c42');
  wood.line(23, 25, 23, 40, '#c69a5c');
  wood.line(26, 25, 26, 39, '#674b31');
  wood.pixel(24, 36, '#513b2b');
  wood.polygon(
    [
      [5, 9],
      [32, 8],
      [32, 10],
      [38, 10],
      [44, 18],
      [38, 26],
      [8, 27],
      [8, 25],
      [4, 24],
    ],
    '#382f26'
  );
  wood.polygon(
    [
      [7, 11],
      [31, 10],
      [31, 12],
      [37, 12],
      [41, 18],
      [36, 24],
      [9, 25],
      [9, 23],
      [6, 23],
    ],
    '#b0834b'
  );
  wood.line(8, 11, 29, 11, '#e0b77a');
  wood.line(8, 12, 29, 12, '#c89d60');
  wood.line(7, 17, 39, 17, '#694b30');
  wood.line(7, 18, 39, 18, '#d2a568');
  wood.line(10, 24, 35, 23, '#d3a264');
  wood.line(11, 21, 17, 21, '#926738');
  wood.line(27, 14, 33, 14, '#966c3e');
  wood.pixel(18, 13, '#916638');
  // Carved book motif identifies a hint sign without baked-in interface text.
  detail.polygon(
    [
      [16, 13],
      [22, 14],
      [25, 13],
      [29, 13],
      [29, 22],
      [25, 22],
      [22, 23],
      [16, 22],
    ],
    '#67472d'
  );
  detail.line(17, 14, 21, 15, '#ead19a');
  detail.line(17, 15, 17, 20, '#d3ae70');
  detail.line(18, 21, 21, 22, '#e1bf83');
  detail.line(23, 15, 27, 14, '#ead19a');
  detail.line(28, 14, 28, 21, '#cda468');
  detail.line(24, 21, 27, 21, '#e1bf83');
  detail.line(22, 16, 22, 21, '#483b2b');
  for (const [x, y] of [
    [9, 14],
    [35, 15],
    [11, 22],
    [35, 22],
  ]) {
    detail.rect(x, y, 2, 2, '#594c37');
    detail.pixel(x, y, '#c1c09a');
  }
  detail.line(8, 25, 15, 25, '#48713e');
  detail.line(9, 24, 13, 24, '#6d9148');
  detail.pixel(11, 23, '#9aae58');
  detail.line(19, 42, 17, 38, '#31583a');
  detail.line(20, 42, 22, 39, '#6f944b');
  detail.line(28, 42, 31, 38, '#406e40');
  return { names: ['Sombra', 'Madeira', 'Entalhes e musgo'], frames: [[shadow, wood, detail]] };
}

const green = ['#254b36', '#365f3c', '#477642', '#61934d', '#81aa59', '#abc578'];
function leaf(c, x, y, dx, dy, width, light = false) {
  const length = Math.hypot(dx, dy),
    nx = -dy / length,
    ny = dx / length;
  const shape = (inset) => [
    [x, y],
    [x + dx * 0.35 + nx * (width - inset), y + dy * 0.35 + ny * (width - inset)],
    [x + dx * 0.72 + nx * (width - inset) * 0.6, y + dy * 0.72 + ny * (width - inset) * 0.6],
    [x + dx, y + dy],
    [x + dx * 0.6 - nx * (width - inset) * 0.7, y + dy * 0.6 - ny * (width - inset) * 0.7],
    [x + dx * 0.2 - nx * (width - inset) * 0.5, y + dy * 0.2 - ny * (width - inset) * 0.5],
  ];
  c.polygon(shape(0), green[0]);
  c.polygon(shape(1), green[light ? 3 : 2]);
  c.line(x + dx * 0.25, y + dy * 0.25, x + dx * 0.85, y + dy * 0.85, green[light ? 4 : 3]);
  if (light) c.pixel(x + dx * 0.7 - 1, y + dy * 0.7 - 1, green[5]);
}

function habitats() {
  const frames = [];
  for (let variant = 0; variant < 3; variant++) {
    const back = canvas(72, 48),
      front = canvas(72, 48);
    back.ellipse(36, 39, 30, 6, '#183c2f26');
    back.ellipse(36, 38, 25, 5, '#183c2f40');
    // Staggered fans of individually shaded, pointed leaves make an organic edge.
    const fans =
      variant === 1
        ? [
            [17, 35, -2],
            [32, 33, 0],
            [49, 35, 2],
          ]
        : variant === 2
          ? [
              [18, 35, -1],
              [36, 31, 0],
              [53, 35, 1],
            ]
          : [
              [19, 34, -1],
              [35, 31, 0],
              [51, 35, 1],
            ];
    for (let f = 0; f < fans.length; f++) {
      const [x, y, tilt] = fans[f];
      back.line(x, y + 4, x + tilt, y - 10, green[1]);
      const spread = variant === 1 ? 14 : 12;
      for (let i = 0; i < 7; i++) {
        const angle = ((-165 + i * 25 + tilt * 4) * Math.PI) / 180;
        const length = (i % 2 ? 12 : 16) + (f === 1 ? 2 : 0);
        leaf(
          back,
          x + ((i % 3) - 1) * 2,
          y - (i % 2) * 4,
          Math.cos(angle) * spread + tilt,
          Math.sin(angle) * length - 2,
          variant === 1 ? 3 : 4,
          i > 1 && i < 5
        );
      }
    }
    // Foreground is shallow in the center, so it hides only the creature's feet.
    for (const [x, y, dx, dy, w] of [
      [12, 40, -6, -8, 3],
      [16, 41, 1, -10, 3],
      [23, 41, -7, -7, 4],
      [27, 42, -2, -8, 3],
      [34, 42, -7, -4, 3],
      [39, 42, 6, -5, 3],
      [47, 41, 6, -9, 4],
      [54, 41, -1, -10, 3],
      [58, 40, 7, -6, 3],
    ]) {
      leaf(front, x, y, dx + (variant - 1), dy - (variant === 1 ? 2 : 0), w, x < 36);
    }
    if (variant === 2) {
      for (const [x, y] of [
        [17, 25],
        [50, 27],
        [58, 34],
      ]) {
        back.line(x, y + 5, x, y, green[2]);
        back.pixel(x - 1, y, '#f0dfb0');
        back.pixel(x + 1, y, '#dfc58e');
        back.pixel(x, y - 1, '#fff0c4');
        back.pixel(x, y + 1, '#dfc58e');
        back.pixel(x, y, '#d4a75b');
      }
    }
    frames.push([back, front]);
  }
  return { names: ['Traseira', 'Frente'], frames };
}

// Native ASE structure: https://github.com/aseprite/aseprite/blob/main/docs/ase-file-specs.md
// LibreSprite opens and saves the authored layers, then performs every production PNG export.

const manifest = [];
for (const [name, document] of [
  ['chest', chestArtwork()],
  ['signpost', signpost()],
  ['habitats', habitats()],
]) {
  const draft = `${scratch}/${name}.ase`,
    native = `${sources}/${name}.ase`;
  await fs.writeFile(draft, aseDocument(document));
  execFileSync(libreSprite, ['--batch', draft, '--save-as', native], { stdio: 'pipe' });
  for (const layer of name === 'habitats' ? document.names : [null]) {
    const file = layer ? `habitats-${layer === 'Traseira' ? 'back' : 'front'}` : name;
    const png = `${output}/${file}.png`,
      json = `${sources}/${file}.json`;
    execFileSync(
      libreSprite,
      [
        '--batch',
        ...(layer ? ['--layer', layer] : []),
        native,
        '--sheet',
        png,
        '--sheet-width',
        String(document.frames[0][0].width * document.frames.length),
        '--data',
        json,
        '--format',
        'json-array',
      ],
      { stdio: 'pipe' }
    );
    if (name === 'chest') {
      for (const [state, frame] of [
        ['closed', 0],
        ['open', 7],
      ]) {
        await sharp(png)
          .extract({ left: frame * 48, top: 0, width: 48, height: 48 })
          .toFile(`${output}/chest-${state}.png`);
      }
    }
    const metadata = await sharp(png).metadata();
    if (
      metadata.width !== document.frames[0][0].width * document.frames.length ||
      metadata.height !== document.frames[0][0].height ||
      !metadata.hasAlpha
    ) {
      throw new Error(`Unexpected LibreSprite export: ${png}`);
    }
    manifest.push({
      file: png,
      source: native,
      layer,
      width: metadata.width,
      height: metadata.height,
      frames: document.frames.length,
      layers: document.names,
      exporter: path.basename(libreSprite),
    });
  }
}
await fs.writeFile(`${sources}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');

// A small, nearest-neighbor contact sheet for review outside the editor.
const samples = [];
for (const item of manifest.filter((item) => !item.layer)) {
  samples.push(
    await sharp(item.file)
      .extract({ left: 0, top: 0, width: item.width / item.frames, height: item.height })
      .extend({ top: 8, bottom: 8, left: 12, right: 12, background: '#40764f' })
      .png()
      .toBuffer()
  );
}
const foliage = await sharp(`${output}/habitats-back.png`)
  .composite([{ input: `${output}/habitats-front.png` }])
  .png()
  .toBuffer();
samples.push(
  await sharp(foliage)
    .extend({ top: 8, bottom: 8, left: 0, right: 0, background: '#40764f' })
    .png()
    .toBuffer()
);
const review = await sharp({
  create: { width: 360, height: 64, channels: 4, background: '#40764f' },
})
  .composite(samples.map((input, index) => ({ input, left: index < 2 ? index * 72 : 144, top: 0 })))
  .png()
  .toBuffer();
await sharp(review)
  .resize(1440, 256, { kernel: 'nearest' })
  .png()
  .toFile('artifacts/mundinho/props-review.png');
console.log(
  `LibreSprite exported ${manifest.length} transparent sprite sheets and 3 layered ASE documents.`
);
