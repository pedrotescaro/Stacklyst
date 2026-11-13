// Mundinho sprite runtime — executed INSIDE LibreSprite (`libresprite -b blank.png --script`).
// The build script prepends `const PALETTE = [...]` (AAP-64) and appends one asset program.
// Rules enforced here: palette colors only, alpha 0 or 255 (no anti-aliasing),
// light from the top-left, and a consistent 1px outline.

const SPRITE = app.activeSprite;
const IMAGE = SPRITE.layer(0).cel(0).image;
const W = IMAGE.width;
const H = IMAGE.height;
const DATA = IMAGE.getImageData();

function hexToRgb(hex) {
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const PAL_SET = {};
for (const hex of PALETTE) PAL_SET[hex] = hexToRgb(hex);
function c(hex) {
  const rgb = PAL_SET[hex];
  if (!rgb) throw new Error('Color outside the palette: ' + hex);
  return rgb;
}

/** Shared outline color for every sprite. */
const OUTLINE = c('242234');
/** Light direction (top-left, slightly toward the viewer). */
const LIGHT = (function () {
  const v = [-0.55, -0.65, 0.52];
  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

let CLIP = { x0: 0, y0: 0, x1: W, y1: H };
let ORIGIN = { x: 0, y: 0 };

/** Draw inside one sheet cell: coordinates become cell-relative and are clipped. */
function cell(x, y, w, h) {
  ORIGIN = { x: x, y: y };
  CLIP = { x0: x, y0: y, x1: x + w, y1: y + h };
}

function px(x, y, color) {
  x = Math.floor(x) + ORIGIN.x;
  y = Math.floor(y) + ORIGIN.y;
  if (x < CLIP.x0 || y < CLIP.y0 || x >= CLIP.x1 || y >= CLIP.y1) return;
  const i = (y * W + x) * 4;
  if (!color) {
    DATA[i] = DATA[i + 1] = DATA[i + 2] = DATA[i + 3] = 0;
    return;
  }
  DATA[i] = color[0];
  DATA[i + 1] = color[1];
  DATA[i + 2] = color[2];
  DATA[i + 3] = 255;
}

function opaqueAbs(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return false;
  return DATA[(y * W + x) * 4 + 3] > 0;
}

function opaque(x, y) {
  return opaqueAbs(Math.floor(x) + ORIGIN.x, Math.floor(y) + ORIGIN.y);
}

function rect(x, y, w, h, color) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) px(x + xx, y + yy, color);
}

function line(x0, y0, x1, y1, color) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    px(x0, y0, color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function insideEllipse(x, y, cx, cy, rx, ry) {
  const nx = (x + 0.5 - cx) / rx;
  const ny = (y + 0.5 - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

function ellipse(cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (insideEllipse(x, y, cx, cy, rx, ry)) px(x, y, color);
}

/**
 * Ellipsoid lit from the top-left. `ramp` goes dark → light (palette hex).
 * `mask(x, y)` can restrict the area (e.g. a flat bottom).
 */
function shadedEllipse(cx, cy, rx, ry, ramp, mask, bias) {
  const colors = ramp.map(c);
  const b = bias || 0;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!insideEllipse(x, y, cx, cy, rx, ry)) continue;
      if (mask && !mask(x, y)) continue;
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const lit = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2] + b;
      const t = Math.max(0, Math.min(0.999, lit * 0.62 + 0.38));
      px(x, y, colors[Math.floor(t * colors.length)]);
    }
}

/** Shades an arbitrary filled area by height inside it: lit on top, darker below. */
function shadeVertical(x, y, w, h, ramp) {
  const colors = ramp.map(c);
  for (let yy = 0; yy < h; yy++) {
    const t = 1 - yy / Math.max(1, h - 1);
    const color = colors[Math.min(colors.length - 1, Math.floor(t * colors.length))];
    for (let xx = 0; xx < w; xx++) if (opaque(x + xx, y + yy)) px(x + xx, y + yy, color);
  }
}

/** 1px outline around everything opaque inside the current cell (4-neighbourhood). */
function outline(color) {
  const col = color || OUTLINE;
  const marks = [];
  for (let y = CLIP.y0; y < CLIP.y1; y++)
    for (let x = CLIP.x0; x < CLIP.x1; x++) {
      if (opaqueAbs(x, y)) continue;
      const near =
        (x > CLIP.x0 && opaqueAbs(x - 1, y)) ||
        (x < CLIP.x1 - 1 && opaqueAbs(x + 1, y)) ||
        (y > CLIP.y0 && opaqueAbs(x, y - 1)) ||
        (y < CLIP.y1 - 1 && opaqueAbs(x, y + 1));
      if (near) marks.push(x, y);
    }
  for (let i = 0; i < marks.length; i += 2) {
    const k = (marks[i + 1] * W + marks[i]) * 4;
    DATA[k] = col[0];
    DATA[k + 1] = col[1];
    DATA[k + 2] = col[2];
    DATA[k + 3] = 255;
  }
}

/** Deterministic PRNG so every rebuild draws the same pixels. */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function commit() {
  IMAGE.putImageData(DATA);
  console.log('drawn ' + W + 'x' + H);
}
