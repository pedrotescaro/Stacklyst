// forest-scenery.png — 8 × 11 cells of 176×160. Frame N is the art for scenery
// object N in geometry.json (87 trees + the cabin). Every piece keeps the base
// position of the old art (data/forest-layout.json anchors), so collisions, depth
// sorting and the baked ground shadows stay aligned.

const CW = 176;
const CH = 160;
const COLS = 8;

const LEAF = ['122020', '24523b', '1a7a3e', '14a02e', '59c135', '9cdb43'];
const NEEDLE = ['122020', '23674e', '328464', '5daf8d', '92dcba'];
const BARK = ['322b28', '5a4e44', '796755', 'a08662'];

function trunk(ax, ay, width, height, seed) {
  const r = rng(seed);
  const left = ax - Math.floor(width / 2);
  for (let y = ay - height; y <= ay; y++) {
    // Roots flare out over the last rows.
    const flare = y > ay - 4 ? (ay - y < 2 ? 3 : 2) : 0;
    for (let x = left - flare; x < left + width + flare; x++) {
      const t = (x - (left - flare)) / (width + flare * 2);
      const tone = t < 0.25 ? 3 : t < 0.6 ? 2 : t < 0.85 ? 1 : 0;
      px(x, y, c(BARK[tone]));
    }
  }
  // Bark grain.
  for (let i = 0; i < height / 3; i++) {
    const x = left + 2 + Math.floor(r() * (width - 4));
    const y = ay - height + Math.floor(r() * height);
    px(x, y, c(BARK[0]));
    px(x, y + 1, c(BARK[1]));
  }
}

/** Leaf texture: light leaves on the lit side, dark notches in the shade. */
function foliageTexture(x0, y0, x1, y1, ramp, seed, density) {
  const r = rng(seed);
  const light = c(ramp[ramp.length - 1]);
  const dark = c(ramp[0]);
  const mid = c(ramp[Math.floor(ramp.length / 2)]);
  for (let y = y0; y < y1; y += 3)
    for (let x = x0; x < x1; x += 3) {
      if (!opaque(x, y) || r() > (density || 0.32)) continue;
      const lit = x - x0 < (x1 - x0) * 0.55 && y - y0 < (y1 - y0) * 0.6;
      if (lit) {
        px(x, y, light);
        px(x + 1, y, mid);
      } else {
        px(x, y, dark);
        px(x, y + 1, mid);
      }
    }
}

function oak(ax, ay, seed, fruit) {
  const r = rng(seed);
  trunk(ax, ay, 12, 46, seed + 1);
  const cy = ay - 78;
  const s = 0.9 + r() * 0.15;
  const blobs = [
    [0, 26, 30, 16],
    [-28, 10, 22, 18],
    [28, 10, 22, 18],
    [0, 4, 36, 26],
    [-16, -16, 24, 20],
    [16, -20, 24, 20],
    [-2, -30, 20, 14],
  ];
  for (const [dx, dy, rx, ry] of blobs) {
    const jx = Math.round((r() - 0.5) * 6);
    const jy = Math.round((r() - 0.5) * 4);
    shadedEllipse(
      ax + dx * s + jx,
      cy + dy * s + jy,
      rx * s,
      ry * s,
      LEAF,
      null,
      dy > 10 ? -0.25 : 0
    );
  }
  foliageTexture(ax - 56, cy - 50, ax + 56, cy + 46, LEAF, seed + 7);
  if (fruit) {
    for (let i = 0; i < 9; i++) {
      const x = ax - 34 + Math.floor(r() * 68);
      const y = cy - 24 + Math.floor(r() * 46);
      if (!opaque(x, y)) continue;
      px(x, y, c('b4202a'));
      px(x + 1, y, c('e86a73'));
      px(x, y + 1, c('73172d'));
      px(x + 1, y + 1, c('b4202a'));
    }
  }
}

function pine(ax, ay, seed) {
  const r = rng(seed);
  trunk(ax, ay, 8, 22, seed + 1);
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const bottom = ay - 14 - i * 25;
    const height = 38 - i * 3;
    const half = 44 - i * 9;
    const shift = Math.round((r() - 0.5) * 3);
    for (let yy = 0; yy < height; yy++) {
      const t = (yy + 1) / height;
      const w = Math.round(half * t);
      const y = bottom - height + yy;
      // Jagged hem at the bottom of each tier.
      const hem = yy >= height - 3 ? 1 : 0;
      for (let x = -w; x <= w; x++) {
        if (hem && (x + i) % 5 === 0 && yy === height - 1) continue;
        const across = (x + w) / Math.max(1, 2 * w);
        const shade = 1 - across * 0.85 - t * 0.25 + (yy < 3 ? 0.2 : 0);
        const tone = Math.max(0, Math.min(NEEDLE.length - 1, Math.floor(shade * NEEDLE.length)));
        px(ax + shift + x, y, c(NEEDLE[tone]));
      }
    }
  }
  foliageTexture(ax - 44, ay - 130, ax + 44, ay - 14, NEEDLE, seed + 9, 0.12);
}

function cabin(ax, ay) {
  const left = ax - 64;
  const right = ax + 58;
  const wallTop = ay - 66;
  // Stone foundation.
  for (let x = left; x < right; x++)
    for (let y = ay - 8; y <= ay; y++) {
      const brick = (Math.floor(x / 7) + (y > ay - 4 ? 1 : 0)) % 2 === 0;
      px(x, y, c(y === ay - 8 ? '8b93af' : brick ? '6d758d' : '4a5462'));
    }
  // Plank walls, lit from the left.
  for (let y = wallTop; y < ay - 8; y++)
    for (let x = left + 2; x < right - 2; x++) {
      const t = (x - left) / (right - left);
      const seam = (y - wallTop) % 6 === 5;
      const tone = seam ? '5a4e44' : t < 0.15 ? 'c7b08b' : t < 0.8 ? 'a08662' : '796755';
      px(x, y, c(tone));
    }
  // Door.
  rect(ax - 9, ay - 44, 18, 36, c('5b3138'));
  rect(ax - 7, ay - 42, 14, 34, c('8e5252'));
  line(ax, ay - 42, ax, ay - 9, c('5b3138'));
  px(ax + 4, ay - 26, c('ffd541'));
  // Windows with warm light, plus flower boxes.
  for (const wx of [left + 14, right - 38]) {
    rect(wx - 2, ay - 52, 26, 22, c('5a4e44'));
    rect(wx, ay - 50, 22, 18, c('f9a31b'));
    rect(wx, ay - 50, 10, 8, c('ffd541'));
    line(wx + 11, ay - 50, wx + 11, ay - 33, c('5a4e44'));
    line(wx, ay - 41, wx + 21, ay - 41, c('5a4e44'));
    rect(wx - 2, ay - 30, 26, 4, c('71413b'));
    for (let i = 0; i < 6; i++) px(wx + i * 4, ay - 31, c(i % 2 ? 'e86a73' : 'fef3c0'));
  }
  // Chimney.
  rect(right - 30, wallTop - 52, 14, 30, c('4a5462'));
  rect(right - 30, wallTop - 52, 5, 30, c('8b93af'));
  rect(right - 32, wallTop - 56, 18, 5, c('333941'));
  // Roof: shingle rows, lighter near the top and on the left.
  const roofTop = wallTop - 46;
  for (let y = roofTop; y <= wallTop + 4; y++) {
    const t = (y - roofTop) / (wallTop + 4 - roofTop);
    const inset = Math.round((1 - t) * 26);
    for (let x = left - 8 + inset; x < right + 8 - inset; x++) {
      const row = Math.floor((y - roofTop) / 5);
      const offset = row % 2 ? 4 : 0;
      const edge = (y - roofTop) % 5 === 4 || (x + offset) % 9 === 0;
      const across = (x - (left - 8)) / (right - left + 16);
      let tone = across < 0.3 ? 'df3e23' : across < 0.75 ? 'b4202a' : '73172d';
      if (t > 0.9) tone = '73172d';
      px(x, y, c(edge ? '3b1725' : tone));
    }
  }
  // Ridge cap.
  line(left + 18, roofTop, right - 18, roofTop, c('e86a73'));
}

for (let frame = 0; frame < LAYOUT.anchors.length; frame++) {
  const anchor = LAYOUT.anchors[frame];
  const kind = LAYOUT.kinds[frame];
  cell((frame % COLS) * CW, Math.floor(frame / COLS) * CH, CW, CH);
  if (!anchor) continue;
  if (kind === 'cabin') cabin(anchor.x, anchor.y);
  else {
    const pick = rng(frame * 977 + 13)();
    if (pick < 0.32) pine(anchor.x, anchor.y, frame * 31 + 5);
    else oak(anchor.x, anchor.y, frame * 31 + 5, pick > 0.9);
  }
  outline();
}
