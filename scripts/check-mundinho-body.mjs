import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = 'public/assets/mundinho';
const skins = await fs.readdir(`${root}/skins`);
for (let skin = 0; skin < 18; skin++) {
  const file = skins.find((name) => name.startsWith(`skin_${skin % 9}_`));
  const original = await sharp(`${root}/skins/${file}`).ensureAlpha().raw().toBuffer();
  for (const sheet of ['hero-body', 'hero-body-attack']) {
    const base = await sharp(`${root}/${sheet}.png`)
      .extract({ left: 0, top: skin * 128, width: 32, height: 32 })
      .ensureAlpha()
      .raw()
      .toBuffer();
    assert.deepEqual(
      base.subarray(16 * 32 * 4),
      original.subarray(16 * 32 * 4),
      `${sheet}: preserve original body anatomy below the face for variant ${skin}`
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
const hairSheet = await sharp(`${root}/hero-hair.png`)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const eyesSheet = await sharp(`${root}/hero-eyes.png`)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const pixel = (sheet, variant, direction, frame, x, y) => {
  const index = (((variant * 4 + direction) * 32 + y) * sheet.info.width + frame * 32 + x) * 4;
  return sheet.data.subarray(index, index + 4);
};
// Compare the complete eye footprint, including lashes, against every hair colour/style across front and profile views.
for (let hair = 0; hair < 36; hair++)
  for (let eyes = 0; eyes < 10; eyes++)
    for (const direction of [0, 1, 3])
      for (let frame = 0; frame < 8; frame++)
        for (let y = 9; y <= 12; y++)
          for (let x = 0; x < 32; x++)
            if (pixel(eyesSheet, eyes, direction, frame, x, y)[3])
              assert.equal(
                pixel(hairSheet, hair, direction, frame, x, y)[3],
                0,
                `hair ${hair} must not cover eye ${eyes} in direction ${direction} at ${x},${y}, frame ${frame}`
              );
for (const name of ['hero-outfit', 'hero-outfit-attack']) {
  const sheet = await sharp(`${root}/${name}.png`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let outfit = 0; outfit < 12; outfit++)
    for (const direction of [0, 2])
      for (let frame = 0; frame < 8; frame++) {
        const step = [0, -1, 0, 1, 0, -1, 0, 1][frame];
        for (const [right, off] of [
          [false, step],
          [true, -step],
        ]) {
          const shoulderX = right ? 21 : 9;
          assert.equal(
            pixel(sheet, outfit, direction, frame, shoulderX, 17 + off)[3],
            255,
            `${name} ${outfit}: upper sleeve must join the shoulder`
          );
          for (const x of right ? [22, 23] : [7, 8]) {
            assert.equal(
              pixel(sheet, outfit, direction, frame, x, 19 + off)[3],
              255,
              `${name} ${outfit}: cuff must remain present`
            );
            // The weapon arm has its own extended pose during an attack.
            if (name !== 'hero-outfit-attack' || !right)
              assert.equal(
                pixel(sheet, outfit, direction, frame, x, 20 + off)[3],
                0,
                `${name} ${outfit}: both hand pixels must remain visible`
              );
          }
        }
      }
}
for (let skin = 0; skin < 18; skin++)
  for (let outfit = 0; outfit < 12; outfit++)
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
// Validate shipped files directly: CI does not need a LibreSprite installation.
const dimensions = {
  'hero-body': [256, 18 * 128],
  'hero-body-attack': [256, 18 * 128],
  'hero-eyes': [256, 10 * 128],
  'hero-outfit': [256, 12 * 128],
  'hero-outfit-attack': [256, 12 * 128],
  'hero-hair': [256, 36 * 128],
  'hero-accessory': [256, 6 * 128],
  'portrait-body': [96 * 18, 112],
  'portrait-outfit': [96 * 24, 112],
  'portrait-eyes': [96 * 10, 112],
  'portrait-hair': [96 * 6, 112],
  'portrait-hair-back': [96 * 6, 112],
  'portrait-accessory': [96 * 6, 112],
};
for (const [name, [width, height]] of Object.entries(dimensions)) {
  const metadata = await sharp(`${root}/${name}.png`).metadata();
  assert.equal(metadata.width, width, `${name} atlas width`);
  assert.equal(metadata.height, height, `${name} atlas height`);
  assert.ok(metadata.hasAlpha, `${name} must preserve transparency`);
}
const crop = async (name, left, top, width, height) =>
  sharp(`${root}/${name}.png`).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer();
const worldFringes = [],
  portraitFringes = [],
  worldBacks = [];
for (let style = 0; style < 6; style++) {
  worldFringes.push((await crop('hero-hair', 9, (style * 6 + 3) * 128 + 7, 13, 4)).toString('hex'));
  portraitFringes.push((await crop('portrait-hair', style * 96 + 28, 24, 40, 17)).toString('hex'));
  worldBacks.push((await crop('hero-hair', 0, (style * 6 + 3) * 128 + 64, 32, 32)).toString('hex'));
}
assert.equal(
  new Set(worldBacks).size,
  6,
  'all six hairstyles must have independent rear silhouettes'
);
assert.equal(
  new Set(worldFringes).size,
  6,
  'all six world fringes must have different forehead pixels'
);
assert.equal(
  new Set(portraitFringes).size,
  6,
  'all six portrait fringes must have different forehead pixels'
);
for (let skin = 0; skin < 9; skin++) {
  assert.notDeepEqual(
    await crop('hero-body', 0, skin * 128, 32, 16),
    await crop('hero-body', 0, (skin + 9) * 128, 32, 16),
    'world faces must reflect the selected silhouette'
  );
  assert.notDeepEqual(
    await crop('portrait-body', skin * 96, 0, 96, 112),
    await crop('portrait-body', (skin + 9) * 96, 0, 96, 112),
    'portrait silhouettes must differ'
  );
}
for (let eyes = 0; eyes < 5; eyes++) {
  assert.notDeepEqual(
    await crop('hero-eyes', 0, eyes * 128, 32, 32),
    await crop('hero-eyes', 0, (eyes + 5) * 128, 32, 32),
    'world eye shapes must reflect the selected silhouette'
  );
  assert.notDeepEqual(
    await crop('portrait-eyes', eyes * 96, 0, 96, 112),
    await crop('portrait-eyes', (eyes + 5) * 96, 0, 96, 112),
    'portrait eye shapes must differ'
  );
}
const wardrobe = [];
for (let outfit = 0; outfit < 12; outfit++)
  wardrobe.push((await crop('hero-outfit', 0, outfit * 128, 32, 32)).toString('hex'));
assert.equal(new Set(wardrobe).size, 12, 'all twelve outfits must have different front sprites');
console.log(
  'PASS: original body anatomy preserved below the face; mirrored profiles stay connected; hands remain exposed across 18 bodies � 12 outfits � 4 directions � 8 frames; atlas dimensions, gender variants and six independent fringes verified.'
);
