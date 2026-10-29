import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = 'public/assets/mundinho';
const skins = await fs.readdir(`${root}/skins`);
for (let skin = 0; skin < 9; skin++) {
  const file = skins.find((name) => name.startsWith(`skin_${skin}_`));
  const original = await sharp(`${root}/skins/${file}`).ensureAlpha().raw().toBuffer();
  for (const sheet of ['hero-body', 'hero-body-attack']) {
    const base = await sharp(`${root}/${sheet}.png`)
      .extract({ left: 0, top: skin * 128, width: 32, height: 32 })
      .ensureAlpha()
      .raw()
      .toBuffer();
    assert.deepEqual(
      base,
      original,
      `${sheet}: preserve original skin ${skin} without redrawing its anatomy`
    );
  }
  const profile = await sharp(`${root}/hero-body.png`)
    .extract({ left: 0, top: skin * 128 + 32, width: 32, height: 32 })
    .flop()
    .ensureAlpha()
    .raw()
    .toBuffer();
  const left = await sharp(`${root}/hero-body.png`)
    .extract({ left: 0, top: skin * 128 + 96, width: 32, height: 32 })
    .ensureAlpha()
    .raw()
    .toBuffer();
  assert.deepEqual(
    left,
    profile,
    `left and right profiles preserve the same anatomy for skin ${skin}`
  );
}
const bodySheet = await sharp(`${root}/hero-body.png`)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const clothesSheet = await sharp(`${root}/hero-outfit.png`)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const pixel = (sheet, variant, direction, frame, x, y) => {
  const index = (((variant * 4 + direction) * 32 + y) * sheet.info.width + frame * 32 + x) * 4;
  return sheet.data.subarray(index, index + 4);
};
for (let skin = 0; skin < 9; skin++)
  for (let outfit = 0; outfit < 6; outfit++)
    for (let direction = 0; direction < 4; direction++)
      for (let frame = 0; frame < 8; frame++) {
        const step = [0, -1, 0, 1, 0, -1, 0, 1][frame];
        const hands =
          direction === 0 || direction === 2
            ? [
                [7, 20 + step],
                [23, 20 - step],
              ]
            : [[direction === 3 ? 19 : 12, 21 + step]];
        for (const [x, y] of hands) {
          assert.equal(
            pixel(clothesSheet, outfit, direction, frame, x, y)[3],
            0,
            `outfit ${outfit} must expose hand in direction ${direction}, frame ${frame}`
          );
          assert.equal(
            pixel(bodySheet, skin, direction, frame, x, y)[3],
            255,
            `skin ${skin} must provide the exposed hand`
          );
        }
        if (direction === 1 || direction === 3)
          for (let y = 16; y <= 24; y++) {
            const occupied = [];
            for (let x = 0; x < 32; x++)
              if (pixel(bodySheet, skin, direction, frame, x, y)[3]) occupied.push(x);
            assert.ok(occupied.length, `profile torso must stay connected at row ${y}`);
            for (let x = occupied[0]; x <= occupied.at(-1); x++)
              assert.equal(
                pixel(bodySheet, skin, direction, frame, x, y)[3],
                255,
                `profile gap: skin ${skin}, direction ${direction}, frame ${frame}, x ${x}, y ${y}`
              );
          }
      }
console.log(
  'PASS: original bodies preserved; mirrored profiles have continuous torsos; hands stay exposed across 9 skins, 6 outfits, 4 directions and 8 frames.'
);
