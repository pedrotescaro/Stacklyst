import { createRequire } from 'node:module';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';
const mobileRequire = createRequire(path.resolve('apps/mobile/package.json'));
const { build } = mobileRequire('esbuild');

// Export the exact authored runtime geometry, rather than keeping a second hand-drawn copy.
const destination = path.resolve('artifacts/mundinho/sprites');
await mkdir(destination, { recursive: true });
const modulePath = path.join(destination, 'pixel-art.bundle.mjs');
await build({ entryPoints: ['src/components/mundinho/PixelArt.tsx'], outfile: modulePath, bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', external: ['react', 'react/jsx-runtime'] });
const { PixelAvatar, PixelCreature } = await import(pathToFileURL(modulePath));
const directions = ['down', 'left', 'up', 'right'];
const frames = ['idle', 'walk-a', 'walk-b', 'interact', 'attack', 'damage', 'victory'];
const composites = [];
const manifest = { width: frames.length * 24, height: 4 * 32, tileWidth: 24, tileHeight: 32, source: 'src/components/mundinho/PixelArt.tsx', sprites: [] };
for (const [row, direction] of directions.entries()) {
  for (const [column, frame] of frames.entries()) {
    let svg = renderToStaticMarkup(React.createElement(PixelAvatar, { direction }));
    svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" ');
    if (frame === 'walk-a') svg = svg.replace('class="pixel-legs"', 'class="pixel-legs" transform="translate(0 -1)"');
    if (frame === 'walk-b') svg = svg.replace('class="pixel-legs"', 'class="pixel-legs" transform="translate(0 1)"');
    if (frame === 'interact') svg = svg.replace('</svg>', '<path d="M21 14v-4m-2 2h4" stroke="#ffe18b" stroke-width="1"/></svg>');
    if (frame === 'attack') svg = svg.replace('</svg>', '<path d="M21 20L23 10" stroke="#def4ff" stroke-width="2"/><path d="M19 20h5" stroke="#e5ae54" stroke-width="2"/></svg>');
    if (frame === 'damage') svg = svg.replace('</svg>', '<path d="M2 6l3 3M21 3l-3 4" stroke="#ff7d80" stroke-width="1"/></svg>');
    if (frame === 'victory') svg = svg.replace('</svg>', '<path d="M2 4v4M0 6h4M22 1v4M20 3h4" stroke="#ffe070" stroke-width="1"/></svg>');
    composites.push({ input: await sharp(Buffer.from(svg)).png().toBuffer(), left: column * 24, top: row * 32 });
    manifest.sprites.push({ id: `${direction}:${frame}`, x: column * 24, y: row * 32, width: 24, height: 32 });
  }
}
await sharp({ create: { width: manifest.width, height: manifest.height, channels: 4, background: '#00000000' } }).composite(composites).png().toFile(path.join(destination, 'avatar-atlas.png'));
await writeFile(path.join(destination, 'avatar-atlas.json'), JSON.stringify(manifest, null, 2) + '\n');
const creatures = [ ['syntax-slime', '#85cc4b'], ['blue-slime', '#53bce7'], ['ember', '#f39a42'], ['byte-bug', '#b39be8'], ['forest', '#4dbb8b'], ['null-ghost', '#a7b6cc'] ];
const creatureTiles = [];
for (const [i, [kind, color]] of creatures.entries()) {
  const svg = renderToStaticMarkup(React.createElement(PixelCreature, { kind, color })).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ');
  creatureTiles.push({ input: await sharp(Buffer.from(svg)).png().toBuffer(), left: i * 24, top: 0 });
}
await sharp({ create: { width: 144, height: 24, channels: 4, background: '#00000000' } }).composite(creatureTiles).png().toFile(path.join(destination, 'creatures-atlas.png'));
await writeFile(path.join(destination, 'creatures-atlas.json'), JSON.stringify({ width: 144, height: 24, sprites: creatures.map(([id], i) => ({ id, x: i * 24, y: 0, width: 24, height: 24 })) }, null, 2) + '\n');
await rm(modulePath);
console.log(`Exported original sprite atlases to ${destination}`);
