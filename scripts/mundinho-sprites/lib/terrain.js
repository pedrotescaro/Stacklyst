// Terrain painting shared by the forest ground, the tileset reference and habitats.
// Terrain is laid out on a 16px tile grid; borders are jittered per 4px block so
// transitions look organic while staying tile-aligned at a distance.

const T_GRASS = 0;
const T_PATH = 1;
const T_WATER = 2;

// BlueStar look: a sunny meadow green, warm dirt roads with a dark brown lip on the
// shadow side (light from the top-left), and bright tufts.
const GRASS = {
  deep: c('1a7a3e'),
  dark: c('14a02e'),
  base: c('59c135'),
  light: c('9cdb43'),
  bright: c('d6f264'),
};
const DIRT = {
  rim: c('71413b'),
  pebble: c('a08662'),
  dark: c('bb7547'),
  base: c('dba463'),
  light: c('f4d29c'),
};
const WATER = {
  dark: c('143464'),
  deep: c('285cc4'),
  base: c('249fde'),
  shallow: c('20d6c7'),
  foam: c('a6fcdb'),
};
const FLOWERS = ['fef3c0', 'ffd541', 'e86a73', '849be4', 'f5a097'].map(c);

/** Stable hash noise in [0, 1). */
function hash2(x, y, seed) {
  let h =
    Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 982451653);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Smooth value noise in [0, 1): bilinear between hashed lattice points. */
function smoothNoise(x, y, scale, seed) {
  const fx = x / scale;
  const fy = y / scale;
  const i = Math.floor(fx);
  const j = Math.floor(fy);
  const u = fx - i;
  const v = fy - j;
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  const a = hash2(i, j, seed);
  const b = hash2(i + 1, j, seed);
  const c2 = hash2(i, j + 1, seed);
  const d = hash2(i + 1, j + 1, seed);
  return a + (b - a) * su + (c2 - a) * sv + (a - b - c2 + d) * su * sv;
}

/**
 * Pixel terrain field from a tile lookup. `tileAt(tx, ty)` returns T_* (or -1 outside).
 * Each terrain mask is interpolated between tile centers and perturbed by noise, so
 * banks and road edges come out rounded and organic instead of stair-stepped.
 */
function terrainField(width, height, tileAt, tile) {
  const field = new Uint8Array(width * height);
  function mask(tx, ty, kind) {
    let t = tileAt(tx, ty);
    if (t < 0) {
      // Outside the grid, reuse the nearest edge tile.
      const cols = Math.ceil(width / tile);
      const rows = Math.ceil(height / tile);
      t = tileAt(Math.max(0, Math.min(cols - 1, tx)), Math.max(0, Math.min(rows - 1, ty)));
    }
    return t === kind ? 1 : 0;
  }
  function level(x, y, kind) {
    const fx = (x + 0.5) / tile - 0.5;
    const fy = (y + 0.5) / tile - 0.5;
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const u = fx - i;
    const v = fy - j;
    const a = mask(i, j, kind);
    const b = mask(i + 1, j, kind);
    const c2 = mask(i, j + 1, kind);
    const d = mask(i + 1, j + 1, kind);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c2 * (1 - u) * v + d * u * v;
  }
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const wobble =
        (smoothNoise(x, y, 7, 31) - 0.5) * 0.34 + (smoothNoise(x, y, 3, 37) - 0.5) * 0.12;
      let t = T_GRASS;
      if (level(x, y, T_PATH) + wobble > 0.5) t = T_PATH;
      if (level(x, y, T_WATER) + wobble * 0.8 > 0.5) t = T_WATER;
      field[y * width + x] = t;
    }
  return field;
}

function fieldAt(field, width, height, x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return -1;
  return field[y * width + x];
}

/** Chebyshev distance (1..max) to the nearest pixel of another terrain kind, or 0. */
function distanceTo(field, width, height, x, y, kind, max) {
  for (let d = 1; d <= max; d++) {
    for (let k = -d; k <= d; k++) {
      if (
        fieldAt(field, width, height, x + k, y - d) === kind ||
        fieldAt(field, width, height, x + k, y + d) === kind ||
        fieldAt(field, width, height, x - d, y + k) === kind ||
        fieldAt(field, width, height, x + d, y + k) === kind
      )
        return d;
    }
  }
  return 0;
}

function distanceToOther(field, width, height, x, y, self, max) {
  for (let d = 1; d <= max; d++) {
    for (let k = -d; k <= d; k++) {
      const probes = [
        fieldAt(field, width, height, x + k, y - d),
        fieldAt(field, width, height, x + k, y + d),
        fieldAt(field, width, height, x - d, y + k),
        fieldAt(field, width, height, x + d, y + k),
      ];
      for (const p of probes) if (p >= 0 && p !== self) return d;
    }
  }
  return 0;
}

/** Paints the terrain field (offset ox, oy) and returns nothing. */
function paintTerrain(field, width, height, ox, oy, seed) {
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const t = field[y * width + x];
      let color;
      if (t === T_WATER) {
        const d = distanceToOther(field, width, height, x, y, T_WATER, 6);
        if (d === 1) color = WATER.foam;
        else if (d === 2) color = WATER.shallow;
        else if (d >= 3 && d <= 4) color = WATER.base;
        else color = WATER.deep;
        if (d === 0 || d >= 5) {
          // Sparse ripple dashes and a lighter band toward the lit (top-left) bank.
          if (hash2(x >> 2, y, seed + 5) < 0.007 && x % 4 !== 3) color = WATER.foam;
          else if (smoothNoise(x, y, 14, seed + 6) > 0.8) color = WATER.base;
          else if (smoothNoise(x, y, 18, seed + 8) < 0.12) color = WATER.dark;
        }
      } else if (t === T_PATH) {
        const g = distanceTo(field, width, height, x, y, T_GRASS, 2);
        const r = hash2(x, y, seed + 1);
        // Grass below or to the right is the shadow side: the road edge drops there.
        const shadowSide =
          fieldAt(field, width, height, x, y + 1) === T_GRASS ||
          fieldAt(field, width, height, x + 1, y) === T_GRASS;
        const shadowNear =
          fieldAt(field, width, height, x, y + 2) === T_GRASS ||
          fieldAt(field, width, height, x + 2, y) === T_GRASS;
        if (g === 1 && shadowSide) color = DIRT.rim;
        else if (g === 1) color = DIRT.dark;
        else if (g === 2 && shadowNear) color = DIRT.dark;
        else if (r < 0.012) color = DIRT.dark;
        else if (r < 0.03) color = DIRT.light;
        else if (r < 0.033) color = DIRT.pebble;
        else color = DIRT.base;
      } else {
        const w = distanceTo(field, width, height, x, y, T_WATER, 2);
        const p = distanceTo(field, width, height, x, y, T_PATH, 1);
        if (w === 1) color = DIRT.light;
        else if (w === 2) color = DIRT.base;
        else if (p === 1) {
          // Lit grass lip on the road's top-left edges, dark on the others.
          const litEdge =
            fieldAt(field, width, height, x, y + 1) === T_PATH ||
            fieldAt(field, width, height, x + 1, y) === T_PATH;
          color = litEdge ? GRASS.light : GRASS.dark;
        } else {
          // Soft organic patches (with a checker dither on their border) keep the
          // lawn from looking flat without turning into a tile checkerboard.
          const n = smoothNoise(x, y, 64, seed + 2) * 0.8 + smoothNoise(x, y, 18, seed + 3) * 0.2;
          const checker = (x + y) % 2 === 0;
          if (n < 0.17 || (n < 0.19 && checker)) color = GRASS.dark;
          else if (n > 0.8 || (n > 0.77 && checker)) color = GRASS.light;
          else color = GRASS.base;
        }
      }
      px(ox + x, oy + y, color);
    }
}

function isOpenGrass(field, width, height, x, y, margin) {
  if (fieldAt(field, width, height, x, y) !== T_GRASS) return false;
  return distanceToOther(field, width, height, x, y, T_GRASS, margin) === 0;
}

/** Grass tufts lit from the top-left: a light "v" with a dark root. */
function tuft(x, y) {
  px(x, y, GRASS.light);
  px(x - 1, y - 1, GRASS.bright);
  px(x + 1, y - 2, GRASS.light);
  px(x, y + 1, GRASS.dark);
  px(x + 1, y, GRASS.dark);
}

function flower(x, y, color) {
  px(x, y, color);
  px(x - 1, y, color);
  px(x + 1, y, color);
  px(x, y - 1, color);
  px(x, y, c('ffd541'));
  px(x, y + 1, GRASS.deep);
}

function rock(x, y, size) {
  shadedEllipse(x, y, size, size * 0.7, ['333941', '4a5462', '6d758d', '8b93af']);
}

function decorateGrass(field, width, height, ox, oy, seed, density) {
  const k = density || 1;
  for (let by = 0; by < height; by += 8)
    for (let bx = 0; bx < width; bx += 8) {
      const r = hash2(bx, by, seed + 9);
      const x = bx + Math.floor(hash2(bx, by, seed + 10) * 6) + 1;
      const y = by + Math.floor(hash2(bx, by, seed + 11) * 6) + 2;
      if (!isOpenGrass(field, width, height, x, y, 2)) continue;
      if (r < 0.32 * k) tuft(ox + x, oy + y);
      else if (r < 0.345 * k)
        flower(ox + x, oy + y, FLOWERS[Math.floor(hash2(x, y, seed) * FLOWERS.length)]);
      else if (r < 0.351 * k && isOpenGrass(field, width, height, x, y, 4))
        rock(ox + x, oy + y, 2.2);
    }
}
