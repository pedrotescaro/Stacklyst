import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

// Original pixel artwork follows the supplied handheld battle composition.
// Keep the sky, scanlines and the two oval stages separately editable in LibreSprite.
const width = 480;
const height = 200;
const sky = canvas(width, height);
const lines = canvas(width, height);
const stages = canvas(width, height);
sky.rect(0, 0, width, height, '#f8faf4');
sky.rect(0, 0, width, 3, '#d4dfaa');
sky.rect(0, 3, width, 3, '#e7edc8');
sky.rect(0, 6, width, 5, '#f0f3df');
sky.rect(0, 11, width, 23, '#f8faf0');
sky.rect(0, 34, width, height - 34, '#f4f7f5');
for (let y = 39; y < height; y += 5) lines.rect(0, y, width, 1, '#e8ede8');
lines.rect(0, 195, width, 5, '#dde4d8');

function platform(x, y, rx, ry) {
  stages.ellipse(x, y + 2, rx, ry, '#b9c7bf');
  stages.ellipse(x, y, rx, ry, '#d0d9d2');
  stages.ellipse(x, y - 2, rx - 7, ry - 3, '#edf2e9');
  stages.ellipse(x, y - 2, rx - 16, Math.max(3, ry - 6), '#e3ebdf');
  stages.line(x - rx + 16, y - 7, x + rx - 16, y - 7, '#f8faf4');
}
platform(364, 72, 83, 17);
platform(112, 164, 106, 23);

const source = 'artifacts/mundinho/libresprite/battle';
await fs.mkdir(source, { recursive: true });
await fs.writeFile(
  `${source}/battle-background.ase`,
  aseDocument({
    names: ['Pale battlefield', 'Horizontal pixel bands', 'Enemy and player stages'],
    frames: [[sky, lines, stages]],
  })
);
const output = 'public/assets/mundinho/battle-background.png';
execFileSync(process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe', [
  '--batch',
  `${source}/battle-background.ase`,
  '--save-as',
  output,
]);
await fs.writeFile(
  `${output}.json`,
  JSON.stringify(
    {
      origin:
        'Original pixel artwork authored in scripts/build-mundinho-battle-background.mjs, using the handheld battle composition supplied by the project owner. Exported from editable layered battle-background.ase by LibreSprite 1.3.',
      width,
      height,
      layers: ['Pale battlefield', 'Horizontal pixel bands', 'Enemy and player stages'],
    },
    null,
    2
  ) + '\n'
);
await sharp(output)
  .resize(width * 2, height * 2, { kernel: 'nearest' })
  .toFile(`${source}/review.png`);
console.log('LibreSprite exported the layered 480 x 200 battle background.');
