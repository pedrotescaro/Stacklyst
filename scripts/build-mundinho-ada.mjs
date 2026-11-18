// Ada, the clearing's guide, dressed after Ada Lovelace: dark hair gathered in
// a single bun and a high-collared navy Victorian dress.
//
// Both sprites are composed from the shared avatar layers so Ada keeps the
// same proportions, face and idle animation as every other character, then
// her hair and dress are reworked pixel by pixel. No resampling or
// antialiasing: every pixel lands on the original grid.
//
//   node scripts/build-mundinho-ada.mjs
//
// Writes public/assets/mundinho/ada-world.png (six idle frames facing down,
// 48×48 each) and public/assets/mundinho/ada-portrait.png (96×112).
import path from 'node:path';
import sharp from 'sharp';

const ASSETS = 'public/assets/mundinho';
const SKINS = 9; // SKIN_PALETTES.length
const EYES = 5; // EYE_COLORS.length
const OUTFITS = 12; // OUTFIT_SPECS.length
const HAIR_COLORS = 6;
const SKIN = 5; // Marfim pálido
const EYE = 0; // Ônix escuro
const BASE_OUTFIT = 9; // Sobretudo noturno: a fitted, buttoned bodice to recolor
const BASE_HAIR = 7; // Centre part, pulled back
const SILVER = 3; // Neutral hair row, recolored below

const OUTLINE = [12, 12, 12];
const NAVY = {
  deep: [24, 30, 58],
  base: [44, 56, 100],
  mid: [58, 74, 124],
  light: [82, 100, 154],
};
const COLLAR = [244, 240, 232];
const COLLAR_SHADE = [204, 202, 214];
const GOLD = [214, 172, 82];
/** Dark brown-black, close to the reference portrait. */
const HAIR = [44, 30, 26];
const INK = [32, 33, 43];

async function load(file) {
  const { data, info } = await sharp(path.join(ASSETS, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

class Cell {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  static from(sheet, left, top, width, height) {
    const cell = new Cell(width, height);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const from = ((top + y) * sheet.width + left + x) * 4;
        cell.data.set(sheet.data.subarray(from, from + 4), (y * width + x) * 4);
      }
    return cell;
  }
  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
  get(x, y) {
    if (!this.inside(x, y)) return [0, 0, 0, 0];
    const i = (y * this.width + x) * 4;
    return [...this.data.subarray(i, i + 4)];
  }
  alpha(x, y) {
    return this.get(x, y)[3];
  }
  set(x, y, rgb, alpha = 255) {
    if (!this.inside(x, y)) return;
    this.data.set([...rgb, alpha], (y * this.width + x) * 4);
  }
  clear(x, y) {
    this.set(x, y, [0, 0, 0], 0);
  }
  over(top) {
    for (let i = 0; i < this.data.length; i += 4) {
      const a = top.data[i + 3] / 255;
      if (!a) continue;
      for (let k = 0; k < 3; k++)
        this.data[i + k] = top.data[i + k] * a + this.data[i + k] * (1 - a);
      this.data[i + 3] = Math.max(this.data[i + 3], top.data[i + 3]);
    }
    return this;
  }
  map(fn) {
    for (let y = 0; y < this.height; y++)
      for (let x = 0; x < this.width; x++) {
        const pixel = this.get(x, y);
        if (!pixel[3]) continue;
        const next = fn(pixel, x, y);
        if (next === null) this.clear(x, y);
        else if (next) this.set(x, y, next, pixel[3]);
      }
    return this;
  }
}

const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
/** Same transfer the app applies to tinted hair: shading and ink survive. */
const tintHair = (cell) =>
  cell.map(([r, g, b]) =>
    [r, g, b].map((value, k) =>
      value < 96 ? value : Math.max(0, Math.min(255, HAIR[k] + value - [220, 216, 212][k]))
    )
  );

async function worldSprite() {
  const S = 48;
  const [body, outfit, eyes, hair] = await Promise.all(
    ['hero-body-idle', 'hero-outfit-idle', 'hero-eyes-idle', 'hero-hair-idle'].map((name) =>
      load(`${name}.png`)
    )
  );
  // Rows hold four directions per variant; Ada always faces down (direction 0).
  const row = (variant) => variant * 4 * S;
  const out = new Cell(S * 6, S);
  const palette = new Map([
    ['52,62,89', NAVY.base],
    ['25,35,62', NAVY.deep],
    ['117,134,160', NAVY.light],
    ['80,97,123', NAVY.mid],
    ['231,189,117', NAVY.mid],
  ]);
  for (let frame = 0; frame < 6; frame++) {
    const cut = (sheet, variant) => Cell.from(sheet, frame * S, row(variant), S, S);
    const skin = cut(body, SKINS + SKIN);
    // The feminine body carries a small earring on the right; Ada wears none.
    skin.map((pixel, x) => {
      const key = pixel.slice(0, 3).join(',');
      if (key !== '103,40,68' && key !== '255,198,161') return undefined;
      return x <= 28 ? OUTLINE : null;
    });
    const head = skin.get.bind(skin);
    let top = 0;
    while (top < S && ![...Array(S).keys()].some((x) => skin.alpha(x, top))) top++;
    const sprite = new Cell(S, S).over(skin);

    // Bodice: the overcoat's torso in navy, without its trousers and shoes.
    const shirt = [];
    const bodice = cut(outfit, OUTFITS + BASE_OUTFIT).map((pixel, x, y) => {
      if (y >= 35) return null;
      const key = pixel.slice(0, 3).join(',');
      if (key === '180,207,222') {
        shirt.push([x, y]);
        return NAVY.base;
      }
      return palette.get(key) ?? NAVY.deep;
    });
    sprite.over(bodice);
    // High white collar under the chin, with a gold brooch below it.
    const collarRow = Math.min(...shirt.map(([, y]) => y));
    // Where the bodice sits lower in the breathing cycle, the collar rises to
    // cover the bare neck too, so it never flickers between frames.
    const bareNeck = (x, y) => {
      const under = skin.get(x, y);
      return (
        under[3] &&
        !same(under, OUTLINE) &&
        same(sprite.get(x, y), under) &&
        // Only the neck, right under the chin's outline; never the chin itself.
        same(skin.get(x, y - 1), OUTLINE)
      );
    };
    for (const y of [collarRow - 1, collarRow])
      for (let x = 22; x <= 25; x++)
        if (y === collarRow ? sprite.alpha(x, y) : bareNeck(x, y))
          sprite.set(x, y, x === 22 || x === 25 ? COLLAR_SHADE : COLLAR);
    if (shirt.some(([, y]) => y === collarRow + 1)) sprite.set(23, collarRow + 1, GOLD);

    // A floor-length skirt over the legs, flaring past the waist.
    const skirt = [
      [35, 19, [NAVY.deep, NAVY.base, NAVY.light, NAVY.mid, NAVY.mid, NAVY.light, NAVY.base, NAVY.deep]],
      [
        36,
        18,
        [
          NAVY.deep,
          NAVY.base,
          NAVY.mid,
          NAVY.light,
          NAVY.base,
          NAVY.base,
          NAVY.light,
          NAVY.mid,
          NAVY.base,
          NAVY.deep,
        ],
      ],
    ];
    for (const [y, left, cloth] of skirt) {
      sprite.set(left, y, OUTLINE);
      cloth.forEach((rgb, i) => sprite.set(left + 1 + i, y, rgb));
      sprite.set(left + cloth.length + 1, y, OUTLINE);
    }
    for (let x = 19; x <= 28; x++) sprite.set(x, 37, OUTLINE);

    sprite.over(cut(eyes, EYES + EYE));

    // Hair: the centre-parted style, trimmed to the head so its two side buns
    // go, then a single bun on the crown.
    const locks = cut(hair, BASE_HAIR * HAIR_COLORS + SILVER).map((pixel, x, y) => {
      const under = head(x, y);
      return under[3] && !same(under, OUTLINE) ? undefined : null;
    });
    const bun = [
      [top - 3, [[22, 25, OUTLINE]]],
      [
        top - 2,
        [
          [21, 21, OUTLINE],
          [22, 22, [220, 216, 212]],
          [23, 23, [250, 246, 242]],
          [24, 24, [220, 216, 212]],
          [25, 25, [194, 190, 186]],
          [26, 26, OUTLINE],
        ],
      ],
      [
        top - 1,
        [
          [21, 21, OUTLINE],
          [22, 22, [194, 190, 186]],
          [23, 24, [220, 216, 212]],
          [25, 25, [194, 190, 186]],
          [26, 26, OUTLINE],
        ],
      ],
    ];
    for (const [y, runs] of bun)
      for (const [from, to, rgb] of runs) for (let x = from; x <= to; x++) locks.set(x, y, rgb);
    sprite.over(tintHair(locks));

    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const pixel = sprite.get(x, y);
        if (pixel[3]) out.set(frame * S + x, y, pixel.slice(0, 3), pixel[3]);
      }
  }
  return out;
}

/**
 * Pixels of one bun: everything reachable from its centre without crossing
 * the ink line, plus the ink ring that belongs only to it.
 */
function bunPixels(cell, [cx, cy], radius) {
  const ink = (x, y) => cell.alpha(x, y) && same(cell.get(x, y), [32, 33, 43]);
  const within = (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
  const region = new Set();
  const queue = [[cx, cy]];
  while (queue.length) {
    const [x, y] = queue.pop();
    const key = `${x},${y}`;
    if (region.has(key) || !within(x, y) || !cell.alpha(x, y) || ink(x, y)) continue;
    region.add(key);
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  const ring = new Set();
  for (const key of region) {
    const [x, y] = key.split(',').map(Number);
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++)
        if (ink(x + dx, y + dy) && within(x + dx, y + dy)) ring.add(`${x + dx},${y + dy}`);
  }
  return [...region, ...ring].map((key) => key.split(',').map(Number));
}

async function portrait() {
  const W = 96;
  const H = 112;
  const [body, outfit, eyes, hairFront, hairBack] = await Promise.all(
    ['portrait-body', 'portrait-outfit', 'portrait-eyes', 'portrait-hair', 'portrait-hair-back'].map(
      (name) => load(`${name}.png`)
    )
  );
  const cut = (sheet, index) => Cell.from(sheet, index * W, 0, W, H);
  const buns = [
    [15, 21],
    [81, 21],
  ];

  // Back hair: drop the side buns, mend the corners they covered, and set a
  // single bun on the crown, drawn from the original left bun.
  const back = cut(hairBack, BASE_HAIR);
  const original = cut(hairBack, BASE_HAIR);
  const leftBun = bunPixels(original, buns[0], 14);
  for (const centre of buns) for (const [x, y] of bunPixels(back, centre, 14)) back.clear(x, y);
  mendCorners(back);
  dropSpecks(back);
  for (const [x, y] of leftBun)
    back.set(x - buns[0][0] + 48, y - buns[0][1] + 12, original.get(x, y).slice(0, 3));

  const front = cut(hairFront, BASE_HAIR);
  for (const centre of buns) for (const [x, y] of bunPixels(front, centre, 14)) front.clear(x, y);
  dropSpecks(front);

  // Dress: the overcoat becomes a navy bodice; its open front closes up to a
  // high white collar, with a row of gold buttons down the middle.
  const skin = cut(body, SKINS + SKIN);
  const dress = cut(outfit, OUTFITS + BASE_OUTFIT);
  const recolor = new Map([
    ['80,97,123', NAVY.base],
    ['52,62,89', NAVY.deep],
    ['28,38,65', [18, 22, 44]],
    ['103,120,146', NAVY.light],
    ['217,199,155', GOLD],
    ['180,207,222', NAVY.mid],
    ['135,162,177', NAVY.base],
  ]);
  dress.map((pixel) => recolor.get(pixel.slice(0, 3).join(',')));
  const COLLAR_TOP = 77;
  const COLLAR_BOTTOM = 84;
  for (let y = COLLAR_TOP; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (dress.alpha(x, y) || !skin.alpha(x, y)) continue;
      // Bare neck and chest: collar band on top, bodice below it.
      if (y === COLLAR_TOP) dress.set(x, y, INK);
      else if (y < COLLAR_BOTTOM) dress.set(x, y, COLLAR);
      else if (y === COLLAR_BOTTOM) dress.set(x, y, COLLAR_SHADE);
      else dress.set(x, y, NAVY.mid);
    }
  for (let y = COLLAR_BOTTOM + 4; y < H; y += 6) {
    dress.set(47, y, GOLD);
    dress.set(48, y, GOLD);
  }

  const out = tintHair(back);
  out.over(skin);
  out.over(dress);
  out.over(cut(eyes, EYES + EYE));
  out.over(tintHair(front));
  return out;
}

/**
 * The side buns hid the top corners of the back hair. Rebuild each corner by
 * mirroring the hair's rows inwards from the opposite edge of the same row.
 */
function mendCorners(cell) {
  for (let y = 0; y < 40; y++) {
    const filled = [...Array(cell.width).keys()].filter((x) => cell.alpha(x, y));
    if (!filled.length) continue;
    const left = filled[0];
    const right = filled[filled.length - 1];
    const span = (left + right) / 2;
    // Keep the outline symmetric around the head's centre column.
    const half = Math.max(48 - left, right - 47);
    for (let x = 48 - half; x <= 47 + half; x++) {
      const mirror = Math.round(2 * 47.5 - x);
      if (!cell.alpha(x, y) && cell.alpha(mirror, y) && Math.abs(span - 47.5) > 0.5)
        cell.set(x, y, cell.get(mirror, y).slice(0, 3));
    }
  }
}

/** Removes stray ink left where the side buns met the rest of the hair. */
function dropSpecks(cell, minimum = 20) {
  const seen = new Set();
  for (let y = 0; y < cell.height; y++)
    for (let x = 0; x < cell.width; x++) {
      if (!cell.alpha(x, y) || seen.has(`${x},${y}`)) continue;
      const group = [];
      const queue = [[x, y]];
      while (queue.length) {
        const [px, py] = queue.pop();
        const key = `${px},${py}`;
        if (seen.has(key) || !cell.alpha(px, py)) continue;
        seen.add(key);
        group.push([px, py]);
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) if (dx || dy) queue.push([px + dx, py + dy]);
      }
      if (group.length < minimum) for (const [gx, gy] of group) cell.clear(gx, gy);
    }
}

async function write(cell, file) {
  await sharp(Buffer.from(cell.data.buffer), {
    raw: { width: cell.width, height: cell.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(path.join(ASSETS, file));
  console.log(`${file}: ${cell.width}×${cell.height}`);
}

await write(await worldSprite(), 'ada-world.png');
await write(await portrait(), 'ada-portrait.png');
