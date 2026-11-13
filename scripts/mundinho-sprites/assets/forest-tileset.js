// forest-tileset.png (reference, 256×160): the 16px tiles the ground is built from.
// Row 1: grass variants and decorations. Row 2: a path blob showing every edge and
// corner transition. Row 3: a pond blob with shore, foam and depth.

const TILE = 16;

function blob(ox, oy, cols, rows, pattern) {
  const tileAt = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return -1;
    return pattern[ty][tx];
  };
  const field = terrainField(cols * TILE, rows * TILE, tileAt, TILE);
  paintTerrain(field, cols * TILE, rows * TILE, ox, oy, 3);
  decorateGrass(field, cols * TILE, rows * TILE, ox, oy, 3, 1.4);
}

const G = T_GRASS;
const P = T_PATH;
const A = T_WATER;
// Grass sampler (4 tiles) + loose decorations.
blob(0, 0, 4, 2, [
  [G, G, G, G],
  [G, G, G, G],
]);
tuft(80, 10);
tuft(90, 22);
flower(104, 12, FLOWERS[0]);
flower(114, 22, FLOWERS[2]);
flower(124, 10, FLOWERS[3]);
rock(140, 16, 3.2);
rock(156, 20, 2.2);
// Path: cross + bend so every transition appears.
blob(0, 40, 8, 4, [
  [G, G, P, G, G, G, G, G],
  [P, P, P, P, P, G, P, G],
  [G, G, P, G, P, P, P, G],
  [G, G, P, G, G, G, G, G],
]);
// Pond with shore.
blob(136, 40, 7, 4, [
  [G, G, G, G, G, G, G],
  [G, A, A, A, A, G, G],
  [G, A, A, A, A, A, G],
  [G, G, A, A, A, G, G],
]);
// Path meeting water (bank + rim side by side).
blob(0, 112, 8, 3, [
  [G, P, P, P, A, A, G, G],
  [G, P, G, A, A, A, A, G],
  [G, G, G, G, A, A, G, G],
]);
