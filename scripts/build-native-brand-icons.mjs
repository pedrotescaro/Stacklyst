import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Use the exact website favicon geometry; do not retrace or approximate the S.
const svg = await fs.readFile('public/brand/monogram.svg', 'utf8');
const assets = 'apps/mobile/assets';
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

for (const [file, size] of [
  ['logo.png', 512],
  ['favicon.png', 48],
]) {
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: 'contain', background: transparent })
    .png()
    .toFile(path.join(assets, file));
}

for (const [file, mark, background, monochrome] of [
  ['app-icon.png', 700, '#000000', false],
  ['android-icon-foreground.png', 600, transparent, false],
  ['android-icon-monochrome.png', 600, transparent, true],
  ['splash-icon.png', 800, transparent, false],
]) {
  const icon = await sharp(Buffer.from(monochrome ? svg.replace('#0083fe', '#ffffff') : svg))
    .resize(mark, mark, { fit: 'contain', background: transparent })
    .png()
    .toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background } })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(path.join(assets, file));
}

// Keep Expo template aliases aligned too, so older tooling cannot restore an old mark.
await fs.copyFile(path.join(assets, 'app-icon.png'), path.join(assets, 'icon.png'));
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#000000' } })
  .png()
  .toFile(path.join(assets, 'android-icon-background.png'));

console.log('Native launcher, adaptive, monochrome, splash and favicon assets use the supplied S.');
