import fs from 'node:fs/promises';
import sharp from 'sharp';
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const mark = await fs.readFile('public/brand/monogram.svg', 'utf8');
// Square viewBox with transparent breathing room; never flatten or add black letterboxing.
const square = mark.replace('viewBox="0 0 868 801"', 'viewBox="-40 -73.5 948 948"');
await fs.writeFile('src/app/icon.svg', square);
for (const [file, size] of [
  ['src/app/icon.png', 512],
  ['apps/mobile/assets/favicon.png', 48],
]) {
  await sharp(Buffer.from(square))
    .resize(size, size, { fit: 'contain', background: transparent })
    .png()
    .toFile(file);
}
const sizes = [16, 32, 48, 64];
const pngs = await Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(square))
      .resize(size, size, { fit: 'contain', background: transparent })
      .png()
      .toBuffer()
  )
);
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const p = 6 + i * 16;
  header[p] = size;
  header[p + 1] = size;
  header.writeUInt16LE(1, p + 4);
  header.writeUInt16LE(32, p + 6);
  header.writeUInt32LE(pngs[i].length, p + 8);
  header.writeUInt32LE(offset, p + 12);
  offset += pngs[i].length;
});
for (const file of ['src/app/favicon.ico', 'public/favicon.ico'])
  await fs.writeFile(file, Buffer.concat([header, ...pngs]));
const path = mark.match(/<path d="([^"]+)"/)[1];
const coin = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="21" r="17" fill="#8e5917"/><circle cx="20" cy="19" r="17" fill="#edaf25"/><circle cx="20" cy="19" r="13" fill="#ffda58" stroke="#ffe895" stroke-width="2"/><g transform="translate(12.2 11.8) scale(0.018)"><path d="${path}" fill="#b77b1b"/></g></svg>`;
await fs.writeFile('public/assets/mundinho/coin.svg', coin);
await sharp(Buffer.from(coin)).resize(32, 32).png().toFile('public/assets/mundinho/coin.png');
console.log('Transparent favicons (16/32/48/64px) and gold S coin generated.');
