import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

const ids = JSON.parse(
  await fs.readFile(new URL('../src/lib/mundinho/equipment-sprites.json', import.meta.url), 'utf8')
);
const frames = ids.map((id) => {
  const c = canvas(32, 32);
  const r = (x, y, w, h, color) => c.rect(x, y, w, h, color);
  const ink = '#22313c',
    gold = '#d6aa55',
    light = '#ffe5a1';
  c.ellipse(16, 29, 10, 2, '#14251e45');
  if (['gear-clover', 'gear-moon', 'gear-star'].includes(id)) {
    c.line(9, 2, 8, 8, gold);
    c.line(8, 8, 14, 12, gold);
    c.line(23, 2, 24, 8, gold);
    c.line(24, 8, 18, 12, gold);
    if (id === 'gear-clover') {
      for (const [x, y] of [
        [11, 14],
        [21, 14],
        [11, 22],
        [21, 22],
      ]) {
        c.ellipse(x, y, 5, 5, ink);
        c.ellipse(x, y - 1, 4, 4, '#3a9f72');
        r(x - 2, y - 3, 2, 2, '#a4e5a4');
      }
      c.line(16, 18, 18, 29, '#3a9f72');
      r(15, 17, 3, 3, light);
    } else if (id === 'gear-moon') {
      c.ellipse(16, 20, 11, 11, ink);
      c.ellipse(16, 19, 10, 10, gold);
      c.ellipse(16, 19, 8, 8, '#284b76');
      c.ellipse(15, 18, 6, 7, light);
      c.ellipse(18, 16, 5, 6, '#284b76');
      r(20, 22, 2, 2, '#b5e8ff');
    } else {
      const star = [
        [16, 9],
        [19, 15],
        [27, 16],
        [21, 21],
        [23, 29],
        [16, 25],
        [9, 29],
        [11, 21],
        [5, 16],
        [13, 15],
      ];
      c.polygon(star, ink);
      c.polygon(
        star.map(([x, y]) => [16 + (x - 16) * 0.82, 19 + (y - 19) * 0.82]),
        gold
      );
      c.line(16, 12, 16, 23, light);
      c.line(10, 18, 22, 18, light);
      r(14, 17, 5, 5, '#8ee0c5');
    }
  } else if (['gear-wood', 'gear-iron', 'gear-crystal'].includes(id)) {
    c.polygon(
      [
        [5, 5],
        [16, 2],
        [27, 5],
        [26, 20],
        [22, 26],
        [16, 31],
        [10, 26],
        [6, 20],
      ],
      ink
    );
    const metal = id === 'gear-wood' ? '#a78650' : id === 'gear-iron' ? '#a7bdca' : '#7ed7e6';
    c.polygon(
      [
        [7, 6],
        [16, 4],
        [25, 6],
        [24, 20],
        [20, 25],
        [16, 28],
        [12, 25],
        [8, 20],
      ],
      metal
    );
    const field = id === 'gear-wood' ? '#775139' : id === 'gear-iron' ? '#42678c' : '#335f88';
    c.polygon(
      [
        [9, 8],
        [16, 6],
        [23, 8],
        [22, 20],
        [16, 25],
        [10, 20],
      ],
      field
    );
    if (id === 'gear-wood') {
      c.line(13, 8, 13, 22, '#ae7b46');
      c.line(18, 8, 18, 22, '#ae7b46');
      r(8, 11, 16, 3, '#c5ad77');
      r(10, 19, 12, 3, '#c5ad77');
    } else if (id === 'gear-iron') {
      r(14, 8, 4, 16, '#c7e0e7');
      r(9, 12, 14, 4, '#c7e0e7');
      r(15, 9, 1, 13, '#f0f8ed');
    } else {
      c.polygon(
        [
          [16, 8],
          [22, 15],
          [16, 24],
          [10, 15],
        ],
        '#82d8e8'
      );
      c.polygon(
        [
          [16, 9],
          [19, 15],
          [16, 21],
          [13, 15],
        ],
        '#e3ffff'
      );
      c.line(9, 8, 11, 15, '#c8f5ff');
    }
  } else if (id === 'gear-heart') {
    c.line(8, 2, 9, 9, gold);
    c.line(24, 2, 23, 9, gold);
    c.polygon(
      [
        [5, 11],
        [9, 7],
        [13, 8],
        [16, 11],
        [19, 8],
        [23, 7],
        [27, 11],
        [27, 18],
        [16, 29],
        [5, 18],
      ],
      ink
    );
    c.polygon(
      [
        [7, 12],
        [10, 9],
        [13, 10],
        [16, 14],
        [19, 10],
        [22, 9],
        [25, 12],
        [25, 17],
        [16, 26],
        [7, 17],
      ],
      '#d96574'
    );
    r(9, 11, 4, 3, '#ffe0ca');
    c.line(11, 20, 16, 24, '#a83d5c');
  } else if (id === 'gear-orb') {
    c.ellipse(16, 15, 11, 12, ink);
    c.ellipse(16, 14, 9, 10, '#4c96cc');
    c.ellipse(14, 12, 6, 6, '#7fded4');
    c.ellipse(12, 9, 3, 3, '#e2fff0');
    c.ellipse(18, 19, 5, 3, '#4664a6');
    r(10, 25, 12, 3, gold);
    r(8, 28, 16, 2, ink);
    r(12, 25, 7, 1, light);
  } else {
    c.polygon(
      [
        [16, 2],
        [21, 10],
        [28, 7],
        [26, 20],
        [20, 27],
        [16, 30],
        [12, 27],
        [6, 20],
        [4, 7],
        [11, 10],
      ],
      ink
    );
    c.polygon(
      [
        [16, 4],
        [20, 13],
        [26, 10],
        [24, 20],
        [18, 26],
        [16, 28],
        [14, 26],
        [8, 20],
        [6, 10],
        [12, 13],
      ],
      '#df8053'
    );
    c.polygon(
      [
        [16, 10],
        [21, 18],
        [16, 25],
        [11, 18],
      ],
      light
    );
    c.polygon(
      [
        [16, 14],
        [18, 19],
        [16, 22],
        [14, 19],
      ],
      '#fff6d1'
    );
    c.line(7, 12, 10, 19, '#f8b96c');
    c.line(25, 12, 22, 19, '#f8b96c');
  }
  return c;
});
const source = 'artifacts/mundinho/libresprite/equipment';
await fs.mkdir(source, { recursive: true });
await fs.writeFile(
  `${source}/equipment.ase`,
  aseDocument({ names: ['Original equipment icons'], frames: frames.map((c) => [c]) })
);
const output = 'public/assets/mundinho/equipment.png';
execFileSync(process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe', [
  '--batch',
  `${source}/equipment.ase`,
  '--sheet',
  output,
  '--sheet-width',
  String(ids.length * 32),
  '--data',
  `${source}/equipment.json`,
  '--format',
  'json-array',
]);
await fs.writeFile(
  `${output}.json`,
  JSON.stringify(
    {
      origin:
        'Original 32 x 32 pixel equipment artwork authored in scripts/build-mundinho-equipment.mjs. Exported from editable equipment.ase by LibreSprite 1.3.',
      frames: ids,
    },
    null,
    2
  ) + '\n'
);
await sharp(output)
  .resize(ids.length * 96, 96, { kernel: 'nearest' })
  .toFile(`${source}/review.png`);
console.log(`LibreSprite exported ${ids.length} original equipment sprites.`);
