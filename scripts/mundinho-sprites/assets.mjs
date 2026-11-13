// Sheets the app already loads. Sizes and layouts are fixed by the game code:
// changing them would move collisions, scale and animation offsets.
import fs from 'node:fs';

const hairstyles = JSON.parse(
  fs.readFileSync(new URL('../../src/lib/mundinho/hairstyles.json', import.meta.url), 'utf8')
);
const FOREST = {
  includes: ['lib/terrain.js'],
  data: {
    LAYOUT: 'data/forest-layout.json',
    GEOMETRY: '../../src/lib/mundinho/geometry.json',
  },
};

export const ASSETS = [
  // 8 frames × 6 creature rows of 24×24 (PixelCreature): frames 0–3 idle, 4–7 attack.
  { name: 'creatures', file: 'creatures-animated.png', width: 192, height: 144 },
  // Forest ground, 1024×768 (World map background). Same roads and pond as before.
  { name: 'forest-ground', file: 'forest-ground.png', width: 1024, height: 768, ...FOREST },
  // Trees and cabin, 8 × 11 cells of 176×160 (one per scenery object, same bases).
  { name: 'forest-scenery', file: 'forest-scenery.png', width: 1408, height: 1760, ...FOREST },
  // Tall grass where creatures hide: back and front layers, 3 variants of 72×48.
  {
    name: 'habitats-back',
    file: 'habitats-back.png',
    width: 216,
    height: 48,
    includes: ['lib/habitat.js'],
  },
  {
    name: 'habitats-front',
    file: 'habitats-front.png',
    width: 216,
    height: 48,
    includes: ['lib/habitat.js'],
  },
  // Hero layers, 32×32 frames: 8 columns × [variant × 4 directions].
  ...[
    ['hero-body', 18],
    ['hero-body-attack', 18],
    ['hero-outfit', 12],
    ['hero-outfit-attack', 12],
    ['hero-eyes', 10],
    ['hero-hair', hairstyles.length * 6],
    ['hero-weapon-attack', 9],
    ['hero-accessory', 6],
  ].map(([name, variants]) => ({
    name,
    file: `${name}.png`,
    width: 256,
    height: variants * 4 * 32,
    includes: ['lib/hero.js'],
    data: { AVATAR: 'data/avatar.json' },
  })),
  // Portrait layers (96×112 frames in one row).
  ...[
    ['portrait-hair-back', hairstyles.length],
    ['portrait-body', 18],
    ['portrait-outfit', 24],
    ['portrait-eyes', 10],
    ['portrait-hair', hairstyles.length],
    ['portrait-accessory', 6],
  ].map(([name, frames]) => ({
    name,
    file: `${name}.png`,
    width: frames * 96,
    height: 112,
    includes: ['lib/portrait.js'],
    data: { AVATAR: 'data/avatar.json' },
  })),
  // Tileset reference sheet: grass, path and water tiles with every transition.
  { name: 'forest-tileset', width: 256, height: 160, ...FOREST },
];
