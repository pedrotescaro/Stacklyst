import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

// Original underground sparring ring: basalt, cut sandstone, cold teal runes and
// warm braziers. No baked UI; the two live avatars own the center of the scene.
const source = 'artifacts/mundinho/libresprite/arena';
const scratch = '.tmp/mundinho-arena';
const output = 'public/assets/mundinho';
await Promise.all([source, scratch, output].map((p) => fs.mkdir(p, { recursive: true })));
const bin = process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe';
const floor = canvas(384, 256),
  architecture = canvas(384, 256),
  details = canvas(384, 256);
floor.rect(0, 0, 384, 256, '#17272d');
// Tall stepped cavern silhouette and staggered masonry retain a pixel silhouette.
for (let y = 0; y < 256; y += 12) {
  for (let x = -12; x < 384; x += 24) {
    const xx = x + (y % 24 ? 12 : 0);
    const colors = y < 80 ? ['#23373b', '#293d40', '#1d3036'] : ['#495352', '#4d5855', '#45514f'];
    floor.rect(xx, y, 23, 11, colors[(Math.abs(x) + y * 3) % 3]);
    floor.line(xx + 1, y + 1, xx + 21, y + 1, y < 80 ? '#344a4a' : '#5b6560');
    if ((x + y) % 5 === 0) floor.line(xx + 5, y + 7, xx + 9, y + 7, '#35443f');
  }
}
architecture.ellipse(192, 166, 177, 98, '#14282c');
architecture.ellipse(192, 158, 169, 94, '#213b3e');
architecture.ellipse(192, 155, 160, 86, '#64706a');
architecture.ellipse(192, 151, 158, 84, '#9d9476');
architecture.ellipse(192, 150, 152, 79, '#574f42');
architecture.ellipse(192, 149, 149, 77, '#c0ae84');
architecture.ellipse(192, 148, 143, 73, '#8c886e');
architecture.ellipse(192, 148, 138, 69, '#5d6c64');
// Floor stones are clipped to the oval instead of repeating over the cave walls.
for (let y = 82; y < 220; y += 13)
  for (let x = 48; x < 338; x++) {
    if (((x - 192) / 136) ** 2 + ((y - 148) / 67) ** 2 < 1) {
      details.pixel(x, y, '#455a55');
      if ((x + y) % 37 === 0) details.line(x, y + 1, x + 2, y + 7, '#4c6058');
    }
  }
details.ellipse(192, 147, 90, 47, '#8f9c81');
details.ellipse(192, 147, 88, 45, '#5d6c64');
details.ellipse(192, 147, 37, 20, '#799787');
details.ellipse(192, 147, 34, 18, '#5d6c64');
// Four inlaid directional marks, deliberately small so players remain the focus.
for (const [x, y] of [
  [192, 91],
  [192, 204],
  [84, 148],
  [300, 148],
]) {
  details.polygon(
    [
      [x, y - 4],
      [x + 3, y],
      [x, y + 4],
      [x - 3, y],
    ],
    '#314f50'
  );
  details.line(x, y - 2, x, y + 2, '#81d6c3');
  details.pixel(x, y, '#d4ead3');
}
function pillar(x, y) {
  architecture.ellipse(x + 3, y + 3, 15, 5, '#13262c70');
  architecture.rect(x - 11, y - 4, 22, 7, '#303e40');
  architecture.rect(x - 9, y - 7, 18, 6, '#9b987f');
  architecture.rect(x - 7, y - 42, 14, 36, '#6c766c');
  architecture.rect(x - 6, y - 42, 3, 35, '#a5aa8a');
  architecture.rect(x + 3, y - 42, 3, 35, '#455451');
  architecture.rect(x - 10, y - 46, 20, 6, '#959a7f');
  architecture.line(x - 9, y - 46, x + 9, y - 46, '#c5bd94');
  architecture.line(x - 2, y - 35, x + 2, y - 31, '#3d514d');
  architecture.line(x + 2, y - 31, x, y - 24, '#3d514d');
}
for (const [x, y] of [
  [49, 100],
  [335, 100],
  [40, 226],
  [344, 226],
])
  pillar(x, y);
for (const x of [104, 280]) {
  architecture.rect(x - 10, 30, 20, 29, '#14292e');
  architecture.polygon(
    [
      [x - 8, 31],
      [x + 8, 31],
      [x + 8, 54],
      [x, 61],
      [x - 8, 54],
    ],
    '#346e74'
  );
  architecture.line(x - 6, 31, x - 6, 52, '#6ea7a0');
  architecture.polygon(
    [
      [x, 36],
      [x + 4, 42],
      [x, 48],
      [x - 4, 42],
    ],
    '#b5c8a3'
  );
  architecture.line(x - 12, 29, x + 12, 29, '#b7aa79');
}
for (const [x, y] of [
  [77, 76],
  [307, 76],
  [58, 185],
  [326, 185],
]) {
  details.ellipse(x, y + 3, 8, 3, '#243b3a');
  details.rect(x - 3, y - 8, 6, 10, '#3e4541');
  details.line(x - 5, y - 8, x + 5, y - 8, '#b7a079');
  details.polygon(
    [
      [x - 4, y - 9],
      [x - 3, y - 17],
      [x, y - 24],
      [x + 1, y - 16],
      [x + 4, y - 18],
      [x + 4, y - 10],
    ],
    '#cf742f'
  );
  details.polygon(
    [
      [x - 2, y - 10],
      [x, y - 20],
      [x + 2, y - 11],
    ],
    '#ffd487'
  );
  details.pixel(x, y - 13, '#fff1bf');
}
// Exit stairwell: the same hole motif anchors the way back to the forest.
architecture.ellipse(192, 226, 21, 10, '#273a3d');
architecture.ellipse(192, 224, 20, 9, '#b3a384');
architecture.ellipse(192, 223, 16, 7, '#101b28');
for (let i = 0; i < 4; i++) architecture.rect(181 + i * 2, 219 + i * 2, 15 - i * 3, 1, '#45566a');

function portal(frame) {
  const shadow = canvas(64, 48),
    stone = canvas(64, 48),
    depth = canvas(64, 48);
  shadow.ellipse(32, 35, 29, 10, '#12252645');
  stone.ellipse(32, 29, 27, 13, '#393a37');
  stone.ellipse(32, 27, 26, 12, '#b6ab85');
  stone.ellipse(32, 26, 22, 9, '#5c655a');
  depth.ellipse(32, 26, 20, 8, '#1b2633');
  depth.ellipse(32, 27, 16, 6, '#0d1423');
  depth.ellipse(32, 28, 10, 4, '#080e17');
  for (const [x, y] of [
    [10, 22],
    [22, 16],
    [40, 16],
    [53, 24],
    [43, 36],
    [21, 36],
  ]) {
    stone.line(x, y, x + 3, y + 3, '#535c50');
    stone.pixel(x + 1, y, '#ddd0a1');
  }
  for (let i = 0; i < 4; i++)
    depth.line(
      19 + i * 2,
      22 + i * 2,
      30 + i,
      22 + i * 2,
      ['#858a78', '#5e6d6e', '#3e4d5c', '#273341'][i]
    );
  for (let i = 0; i < 3; i++) {
    const angle = (frame / 6 + i / 3) * Math.PI * 2;
    const x = Math.round(32 + Math.cos(angle) * 24),
      y = Math.round(25 + Math.sin(angle) * 11);
    depth.pixel(x, y, '#b7e2ce');
    depth.pixel(x, y - 1, '#67b6af');
  }
  return [shadow, stone, depth];
}
for (const [name, document, scale] of [
  [
    'arena',
    {
      names: ['Caverna', 'Arquibancada e pilares', 'Runas e braseiros'],
      frames: [[floor, architecture, details]],
    },
    2,
  ],
  [
    'portal-hole',
    {
      names: ['Sombra', 'Pedra', 'Escada e profundidade'],
      frames: Array.from({ length: 6 }, (_, i) => portal(i)),
    },
    1,
  ],
]) {
  const draft = `${scratch}/${name}.ase`,
    native = `${source}/${name}.ase`;
  await fs.writeFile(draft, aseDocument(document));
  execFileSync(bin, ['--batch', draft, '--save-as', native], { stdio: 'pipe' });
  execFileSync(
    bin,
    [
      '--batch',
      native,
      '--scale',
      String(scale),
      '--sheet',
      `${output}/${name}.png`,
      '--sheet-width',
      String(document.frames[0][0].width * document.frames.length * scale),
      '--data',
      `${source}/${name}.json`,
      '--format',
      'json-array',
    ],
    { stdio: 'pipe' }
  );
}
await sharp(`${output}/arena.png`).toFile(`${source}/review.png`);
await fs.writeFile(
  `${source}/manifest.json`,
  JSON.stringify(
    {
      origin:
        'Original pixel art authored in scripts/build-mundinho-arena.mjs and exported from layered ASE documents by LibreSprite.',
      arena: { width: 768, height: 512 },
      portal: { frames: 6, frameWidth: 64, frameHeight: 48 },
    },
    null,
    2
  ) + '\n'
);
console.log('LibreSprite exported the underground arena and animated stairwell portal.');
