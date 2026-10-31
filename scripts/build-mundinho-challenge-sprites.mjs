import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

const names = [
  'Caminho',
  'Cristal',
  'Flor',
  'Lanterna',
  'Alavanca',
  'Rocha',
  'Baú',
  'Canteiro',
  'Bichinho',
  'Máquina',
  'Gaiola',
  'Fruto',
  'Muda',
  'Altar',
  'Concluído',
];
const frames = names.map((name) => {
  const c = canvas(24, 24),
    ink = '#293c38';
  const r = (x, y, w, h, col) => c.rect(x, y, w, h, col);
  c.ellipse(12, 21, 9, 2, '#17382d55');
  if (name === 'Caminho') {
    c.polygon(
      [
        [7, 4],
        [17, 4],
        [20, 22],
        [3, 22],
      ],
      '#bd9f71'
    );
    for (const [x, y] of [
      [9, 6],
      [14, 10],
      [7, 15],
      [15, 19],
    ])
      r(x, y, 3, 1, '#e1c795');
  } else if (name === 'Cristal') {
    c.polygon(
      [
        [12, 2],
        [19, 9],
        [16, 19],
        [10, 22],
        [5, 10],
      ],
      '#367f91'
    );
    c.polygon(
      [
        [12, 3],
        [17, 9],
        [12, 18],
        [7, 10],
      ],
      '#8ce2de'
    );
    c.line(12, 4, 12, 17, '#dcfff2');
    c.line(17, 10, 14, 18, '#54b8c9');
  } else if (name === 'Flor' || name === 'Muda') {
    r(11, 10, 2, 11, '#426a3f');
    c.line(11, 17, 6, 14, '#83b66c');
    c.line(13, 16, 18, 12, '#a5cf79');
    if (name === 'Flor') {
      for (const [x, y] of [
        [8, 4],
        [13, 4],
        [6, 8],
        [15, 8],
        [10, 11],
      ])
        c.ellipse(x + 1, y + 1, 3, 3, '#e69fa9');
      c.ellipse(12, 8, 3, 3, '#f9d580');
      r(11, 6, 2, 1, '#fff3bb');
    } else {
      c.ellipse(8, 8, 4, 2, '#83b66c');
      c.ellipse(16, 5, 4, 3, '#b6d887');
    }
  } else if (name === 'Lanterna') {
    r(9, 2, 6, 2, ink);
    r(8, 4, 8, 2, '#8b6946');
    r(6, 6, 12, 12, ink);
    r(8, 7, 8, 9, '#f4be59');
    r(10, 8, 3, 6, '#fff2a7');
    r(6, 18, 12, 3, '#8b6946');
    r(11, 6, 2, 12, '#b58549');
  } else if (name === 'Alavanca') {
    r(4, 17, 16, 5, '#52666a');
    r(6, 18, 12, 2, '#95aba0');
    c.line(12, 17, 17, 6, ink);
    c.line(13, 17, 18, 6, '#c3b58b');
    r(15, 3, 6, 4, '#cb7460');
    r(16, 3, 3, 1, '#ffc59a');
  } else if (name === 'Rocha') {
    c.polygon(
      [
        [5, 10],
        [10, 5],
        [17, 7],
        [21, 16],
        [18, 21],
        [4, 21],
        [2, 16],
      ],
      '#4e6263'
    );
    c.polygon(
      [
        [6, 10],
        [11, 7],
        [16, 9],
        [18, 16],
        [5, 17],
      ],
      '#97a7a0'
    );
    c.line(7, 10, 11, 8, '#d0d5be');
    c.line(13, 12, 10, 16, '#667e7a');
  } else if (name === 'Baú') {
    r(3, 9, 18, 12, ink);
    c.ellipse(12, 9, 9, 5, '#b8834b');
    r(4, 10, 16, 10, '#a2673f');
    r(5, 12, 14, 1, '#e2ae68');
    r(7, 7, 2, 13, '#e1bf73');
    r(16, 7, 2, 13, '#e1bf73');
    r(3, 13, 18, 2, '#67462f');
    r(10, 13, 4, 4, '#f0ce7c');
    r(11, 14, 2, 2, ink);
  } else if (name === 'Canteiro') {
    r(3, 11, 18, 10, '#634b39');
    r(4, 12, 16, 2, '#b18a58');
    for (let y = 16; y < 22; y += 3) c.line(5, y, 19, y, '#866240');
    r(11, 7, 2, 6, '#729853');
    c.line(12, 9, 7, 6, '#a5cc77');
    c.line(12, 9, 17, 5, '#b8da87');
  } else if (name === 'Bichinho') {
    c.ellipse(12, 15, 8, 6, '#bc8d68');
    c.ellipse(7, 5, 2, 5, '#bc8d68');
    c.ellipse(16, 5, 2, 5, '#bc8d68');
    r(7, 2, 1, 5, '#e9baa0');
    r(16, 2, 1, 5, '#e9baa0');
    c.ellipse(12, 12, 7, 6, '#e6c29a');
    r(8, 10, 2, 3, ink);
    r(15, 10, 2, 3, ink);
    r(8, 10, 1, 1, '#fff6e5');
    r(15, 10, 1, 1, '#fff6e5');
    r(11, 14, 2, 1, '#a6666a');
    r(6, 19, 4, 2, '#e6c29a');
    r(15, 19, 4, 2, '#e6c29a');
  } else if (name === 'Máquina') {
    r(3, 6, 18, 15, ink);
    r(4, 7, 16, 12, '#648e9c');
    r(6, 8, 9, 6, '#263f50');
    r(7, 9, 6, 2, '#8fd8c4');
    r(17, 9, 2, 2, '#e8ba6c');
    r(17, 13, 2, 2, '#d88c83');
    r(6, 17, 11, 1, '#a4bdba');
    r(7, 3, 10, 3, '#94b2b7');
  } else if (name === 'Gaiola') {
    c.ellipse(12, 10, 8, 7, '#b59d74');
    r(4, 10, 16, 11, '#7e735c');
    r(6, 10, 12, 9, '#314f49');
    c.ellipse(12, 15, 4, 3, '#83bfd1');
    r(14, 13, 1, 1, ink);
    r(16, 15, 2, 1, '#e2c78a');
    for (const x of [5, 9, 14, 18]) r(x, 8, 1, 13, '#d1c69f');
    r(3, 21, 18, 1, '#b59d74');
    r(10, 2, 4, 2, '#e4d4a5');
  } else if (name === 'Fruto') {
    c.ellipse(9, 14, 6, 7, '#b95355');
    c.ellipse(15, 14, 6, 7, '#d97b69');
    r(11, 4, 2, 6, '#806246');
    c.ellipse(16, 5, 4, 2, '#9bc87a');
    r(6, 11, 2, 4, '#f4b38b');
  } else if (name === 'Altar') {
    r(3, 19, 18, 3, '#718b82');
    r(6, 12, 12, 7, '#526f69');
    r(4, 10, 16, 3, '#adc0a3');
    c.polygon(
      [
        [12, 1],
        [16, 5],
        [12, 10],
        [8, 5],
      ],
      '#8adad4'
    );
    r(11, 3, 1, 3, '#e0fff0');
    c.line(8, 15, 15, 15, '#9eaf92');
  } else {
    c.ellipse(12, 12, 9, 9, '#315d44');
    c.line(6, 12, 10, 16, '#cbe89d');
    c.line(10, 16, 18, 7, '#cbe89d');
    c.line(6, 13, 10, 17, '#cbe89d');
    c.line(10, 17, 18, 8, '#cbe89d');
  }
  return c;
});
const source = 'artifacts/mundinho/libresprite/challenges';
await fs.mkdir(source, { recursive: true });
await fs.writeFile(
  `${source}/objects.ase`,
  aseDocument({ names: ['challenge objects'], frames: frames.map((c) => [c]) })
);
execFileSync(process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe', [
  '--batch',
  `${source}/objects.ase`,
  '--sheet',
  'public/assets/mundinho/challenge-objects.png',
  '--sheet-width',
  '360',
  '--data',
  `${source}/objects.json`,
  '--format',
  'json-array',
]);
await fs.writeFile(
  `${source}/manifest.json`,
  JSON.stringify({ exporter: 'LibreSprite 1.3', size: 24, frames: names }, null, 2) + '\n'
);
await fs.writeFile(
  'public/assets/mundinho/challenge-objects.png.json',
  JSON.stringify(
    {
      origin:
        'Original pixel artwork authored in scripts/build-mundinho-challenge-sprites.mjs. Exported from objects.ase by LibreSprite 1.3. Transparent 24 x 24 frames.',
      frames: names,
    },
    null,
    2
  ) + '\n'
);
await sharp('public/assets/mundinho/challenge-objects.png')
  .resize(1080, 72, { kernel: 'nearest' })
  .png()
  .toFile(`${source}/review.png`);
console.log('LibreSprite exported 15 original challenge object sprites.');
