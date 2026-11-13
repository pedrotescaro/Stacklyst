// forest-ground.png — 1024×768 ground of the forest area, painted from the 16px
// tile layout frozen in data/forest-layout.json (same roads and pond as before).

const TILE = LAYOUT.tile;
const KIND = { g: T_GRASS, p: T_PATH, w: T_WATER };
function tileAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= LAYOUT.cols || ty >= LAYOUT.rows) return -1;
  return KIND[LAYOUT.terrain[ty][tx]];
}

const field = terrainField(W, H, tileAt, TILE);
paintTerrain(field, W, H, 0, 0, 7);
decorateGrass(field, W, H, 0, 0, 7, 1);

// Contact shadows under every tree and the cabin (lit from the top-left, so they
// fall a little to the right).
const SCENERY = GEOMETRY.scenery;
for (const object of SCENERY.objects) {
  const anchor = LAYOUT.anchors[object.frame];
  if (!anchor) continue;
  const x = object.x + anchor.x;
  const y = object.y + anchor.y;
  const cabin = LAYOUT.kinds[object.frame] === 'cabin';
  const rx = cabin ? 64 : 17;
  const ry = cabin ? 7 : 5;
  for (let yy = Math.floor(y - ry); yy <= y + ry; yy++)
    for (let xx = Math.floor(x + 3 - rx); xx <= x + 3 + rx; xx++) {
      if (!insideEllipse(xx, yy, x + 3, y, rx, ry)) continue;
      const t = fieldAt(field, W, H, xx, yy);
      if (t === T_WATER || t < 0) continue;
      const inner = insideEllipse(xx, yy, x + 3, y, rx * 0.7, ry * 0.6);
      px(xx, yy, t === T_PATH ? DIRT.dark : inner ? GRASS.deep : GRASS.dark);
    }
}
