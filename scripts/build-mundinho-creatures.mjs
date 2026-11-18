// Hand-placed pixel art for the clearing's creatures: the ember, the byte bug,
// the sprout and the null ghost. The two slimes (rows 0–1) come from the
// original artwork and are kept as they are.
//
//   node scripts/build-mundinho-creatures.mjs
//
// public/assets/mundinho/blue-creatures.png is 8 frames × 6 rows of 24×24
// cells: frames 0–3 idle, 4–7 attack. Every creature faces left, towards the
// hero in battle, and stands with its lowest pixel on row 21.
import path from 'node:path';
import sharp from 'sharp';

const FILE = path.join('public/assets/mundinho', 'blue-creatures.png');
const CELL = 24;

/** Rows are written as the left half (12 columns) and mirrored. */
const mirror = (rows) => rows.map((half) => half + [...half].reverse().join(''));

const creatures = {
  // Row 2 — Faísca recursiva: a round flame spirit with flickering tips.
  ember: {
    palette: {
      O: '#3a1410',
      D: '#b8321f',
      M: '#f0642a',
      L: '#ffae3b',
      H: '#fff2a8',
      K: '#2a1418',
      W: '#ffffff',
      B: '#ff8f6b',
    },
    top: 3,
    body: [
      '...........O',
      '..........OL',
      '.....O....OL',
      '....OLO..OML',
      '....OMLO.OML',
      '...OMMLOOMLL',
      '...OMMMLMMLL',
      '..ODMMMMMLLH',
      '..ODMMMMLLHH',
      '.ODDMMMMLLHH',
      '.ODMMMMMLLHH',
      '.ODMMMMMMLLH',
      '.ODDMMMMMMLL',
      '.ODDMMMMMMML',
      '..ODDMMMMMMM',
      '..ODDDMMMMMM',
      '...ODDDMMMMM',
      '....OODDDDDD',
      '......OOOOOO',
    ],
    // The tips lick upwards on alternate frames.
    flicker: [
      '..........O.',
      '..........OL',
      '....O.....OL',
      '...OLO...OML',
      '...OMLO.OMMH',
      '...OMMLOMMLL',
    ],
    face: [
      // eyes, looking left, with a highlight
      [7, 13, 'K'],
      [8, 13, 'K'],
      [7, 14, 'W'],
      [8, 14, 'K'],
      [7, 15, 'K'],
      [8, 15, 'K'],
      [13, 13, 'K'],
      [14, 13, 'K'],
      [13, 14, 'W'],
      [14, 14, 'K'],
      [13, 15, 'K'],
      [14, 15, 'K'],
      [5, 16, 'B'],
      [6, 16, 'B'],
      [15, 16, 'B'],
      [16, 16, 'B'],
      [10, 17, 'K'],
      [11, 17, 'K'],
      [12, 17, 'K'],
      [11, 18, 'D'],
    ],
  },
  // Row 3 — Besouro de bits: a violet beetle with glowing bit spots.
  'byte-bug': {
    palette: {
      O: '#1d1230',
      D: '#4a2a6b',
      M: '#7a4fb0',
      L: '#a77fe0',
      H: '#dcc8ff',
      C: '#7ff4ff',
      Y: '#ffe066',
      G: '#2f1d47',
    },
    top: 5,
    body: [
      '......O.....',
      '.......O....',
      '........O...',
      '.........OOO',
      '........ODMM',
      '........OMYM',
      '......OOODMM',
      '....OODLLHMO',
      '...ODMLLHHMO',
      '.G.ODMLCHLMO',
      '..GODMMLLLMO',
      '.G.ODMMMLMMO',
      '..GODMCMMMMO',
      '.G.ODDMMMMDO',
      '...ODDDMMDDO',
      '....ODDDDDDO',
      '.....OOOOOOO',
      '............',
    ],
    // Legs step on alternate frames.
    flicker: null,
    legs: [
      ['.G.', '..G'],
      ['..G', '.G.'],
    ],
    face: [],
  },
  // Row 4 — Broto booleano: a seed with two leaves on a little stem.
  forest: {
    palette: {
      O: '#1d3a1c',
      D: '#3c7d32',
      M: '#6cbf4a',
      L: '#a6e06b',
      H: '#e2f7a3',
      S: '#7a5a34',
      K: '#1c2416',
      W: '#ffffff',
      B: '#f2a0a0',
    },
    top: 3,
    body: [
      '......OO....',
      '.....OLLO...',
      '....OLHLLO..',
      '....OLLLLLO.',
      '.....OMLLLOO',
      '......OOMMOS',
      '.........OOS',
      '.......OOOOO',
      '.....OODMMMM',
      '....ODMMMLLL',
      '...ODMMMLLHH',
      '...ODMMMLLLH',
      '..ODMMMMMLLL',
      '..ODMMMMMMLL',
      '..ODDMMMMMMM',
      '...ODDMMMMMM',
      '....ODDDMMMM',
      '.....OODDDDD',
      '.......OOOOO',
    ],
    flicker: [
      '.....OO.....',
      '....OLLO....',
      '...OLHLLO...',
      '...OLLLLLO..',
      '....OMLLLLOO',
      '.....OOOMMOS',
    ],
    face: [
      [8, 15, 'K'],
      [8, 16, 'K'],
      [9, 15, 'W'],
      [9, 16, 'K'],
      [14, 15, 'W'],
      [14, 16, 'K'],
      [15, 15, 'K'],
      [15, 16, 'K'],
      [6, 17, 'B'],
      [17, 17, 'B'],
      [11, 18, 'K'],
      [12, 18, 'K'],
    ],
  },
  // Row 5 — Sombra do nulo: a floating shade with glowing eyes and a wavy hem.
  'null-ghost': {
    palette: {
      O: '#1a1430',
      D: '#3d3163',
      M: '#6a5aa0',
      L: '#9b8cd2',
      H: '#c9bff0',
      E: '#8ff7ff',
      K: '#120d22',
    },
    top: 4,
    body: [
      '........OOOO',
      '......OOLLLL',
      '.....OLLHHLL',
      '....OLLHHLLL',
      '....OMLLLLLL',
      '...OMMLLLLLL',
      '...OMMMLLLLL',
      '..OMMMMLLLLL',
      '..OMMMMMLLLL',
      '..OMMMMMMLLL',
      '..OMMMMMMMLL',
      '..ODMMMMMMML',
      '..ODMMMMMMMM',
      '..ODDMMMMMMM',
      '..ODDMMMMMMM',
      '..ODDDMMMDMM',
      '..ODDOODDDOD',
      '..OO..OO.OO.',
      '............',
    ],
    // The hem ripples on alternate frames.
    flicker: null,
    hem: [
      ['..ODDODDDODD', '..OO..OO..OO'],
      ['...ODDODDDOD', '...OO..OO..O'],
    ],
    face: [
      [7, 12, 'E'],
      [8, 12, 'E'],
      [7, 13, 'E'],
      [8, 13, 'H'],
      [14, 12, 'E'],
      [15, 12, 'E'],
      [14, 13, 'E'],
      [15, 13, 'H'],
      [11, 16, 'K'],
      [12, 16, 'K'],
      [11, 17, 'K'],
      [12, 17, 'K'],
    ],
  },
};

const ROWS = ['ember', 'byte-bug', 'forest', 'null-ghost'];

function hex(color) {
  return [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
}

/** One 24×24 frame: the mirrored body, its per-frame variant and the face. */
function frame(spec, variant) {
  const rows = mirror(spec.body);
  if (variant && spec.flicker) mirror(spec.flicker).forEach((row, i) => (rows[i] = row));
  if (spec.legs) {
    const [up, down] = spec.legs[variant];
    for (let i = 9; i <= 13; i++) {
      const pattern = (i - 9) % 2 ? down : up;
      rows[i] = pattern + rows[i].slice(3, 21) + [...pattern].reverse().join('');
    }
  }
  if (spec.hem) {
    const [a, b] = spec.hem[variant];
    rows[16] = mirror([a])[0];
    rows[17] = mirror([b])[0];
  }
  const grid = rows.map((row) => [...row]);
  for (const [x, y, key] of spec.face) grid[y - spec.top][x] = key;
  return grid;
}

const { data, info } = await sharp(FILE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.from(data);
const put = (x, y, rgba) => {
  if (x < 0 || y < 0 || x >= info.width || y >= info.height) return;
  out.set(rgba, (y * info.width + x) * 4);
};

// Idle: a gentle bob with the variant on alternate frames. Attack: wind up,
// lunge left, hold, recover.
const idle = [
  { dx: 0, dy: 0, variant: 0 },
  { dx: 0, dy: -1, variant: 1 },
  { dx: 0, dy: -1, variant: 0 },
  { dx: 0, dy: 0, variant: 1 },
];
// The battle lunge itself is a CSS move; the frames only wind up and push.
const attack = [
  { dx: 1, dy: 1, variant: 0 },
  { dx: 0, dy: -1, variant: 1 },
  { dx: -1, dy: -2, variant: 0 },
  { dx: 0, dy: 0, variant: 1 },
];

ROWS.forEach((name, index) => {
  const spec = creatures[name];
  const row = index + 2;
  [...idle, ...attack].forEach(({ dx, dy, variant }, f) => {
    for (let y = 0; y < CELL; y++)
      for (let x = 0; x < CELL; x++) put(f * CELL + x, row * CELL + y, [0, 0, 0, 0]);
    frame(spec, variant).forEach((cells, r) =>
      cells.forEach((key, x) => {
        if (key === '.') return;
        const color = spec.palette[key];
        if (!color) throw new Error(`${name}: no colour for "${key}"`);
        const y = spec.top + r + dy;
        if (y > 21 + Math.max(0, dy)) throw new Error(`${name}: pixel below the feet line`);
        put(f * CELL + x + dx, row * CELL + y, [...hex(color), 255]);
      })
    );
  });
});

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(FILE);
console.log(`${FILE}: redrew ${ROWS.join(', ')}`);
