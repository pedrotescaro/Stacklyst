import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const LIBRESPRITE_BIN = 'C:\\Program Files\\LibreSprite\\libresprite.exe';
const ARTIFACTS_DIR = path.resolve('artifacts/mundinho/libresprite');
const PUBLIC_DIR = path.resolve('public/assets/mundinho');
const SKINS_ARTIFACTS_DIR = path.join(ARTIFACTS_DIR, 'skins');
const SKINS_PUBLIC_DIR = path.join(PUBLIC_DIR, 'skins');

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(SKINS_ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(SKINS_PUBLIC_DIR, { recursive: true });

// --- Color Helpers ---
function hexToRgba(hex, alpha = 255) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (clean.length === 6) {
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255, alpha];
  } else if (clean.length === 8) {
    return [(num >> 24) & 255, (num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return [0, 0, 0, alpha];
}

class PixelCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4, 0);
  }

  setPixel(x, y, color) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const rgba = Array.isArray(color) ? color : hexToRgba(color);
    if (rgba[3] === 0) return;
    const idx = (y * this.width + x) * 4;
    if (rgba[3] === 255 || this.data[idx + 3] === 0) {
      this.data[idx] = rgba[0];
      this.data[idx + 1] = rgba[1];
      this.data[idx + 2] = rgba[2];
      this.data[idx + 3] = rgba[3];
    } else {
      // Alpha blend
      const a = rgba[3] / 255;
      const invA = 1 - a;
      this.data[idx] = Math.round(rgba[0] * a + this.data[idx] * invA);
      this.data[idx + 1] = Math.round(rgba[1] * a + this.data[idx + 1] * invA);
      this.data[idx + 2] = Math.round(rgba[2] * a + this.data[idx + 2] * invA);
      this.data[idx + 3] = 255;
    }
  }

  fillRect(x, y, w, h, color) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.setPixel(px, py, color);
      }
    }
  }

  drawCircle(cx, cy, radius, color) {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x * x + y * y <= radius * radius) {
          this.setPixel(cx + x, cy + y, color);
        }
      }
    }
  }

  drawOutlineRect(x, y, w, h, strokeColor, fillColor) {
    if (fillColor) this.fillRect(x + 1, y + 1, w - 2, h - 2, fillColor);
    for (let i = 0; i < w; i++) {
      this.setPixel(x + i, y, strokeColor);
      this.setPixel(x + i, y + h - 1, strokeColor);
    }
    for (let j = 0; j < h; j++) {
      this.setPixel(x, y + j, strokeColor);
      this.setPixel(x + w - 1, y + j, strokeColor);
    }
  }

  async toPngFile(filepath) {
    await sharp(this.data, {
      raw: { width: this.width, height: this.height, channels: 4 }
    }).png().toFile(filepath);
  }
}

// -------------------------------------------------------------
// 1. GENERATE SCENERY MAP (800 x 512, Top-Down Pixel Art Forest)
// -------------------------------------------------------------
console.log('Crafting Pixel Art Scenery Map...');
const map = new PixelCanvas(800, 512);

const C_DARK_BG = '#1a1c23';
const C_STONE_DARK = '#3d444f';
const C_STONE_LIGHT = '#6b7280';
const C_STONE_BORDER = '#2c313a';
const C_GRASS_BASE = '#2c5e3b';
const C_GRASS_MID = '#357147';
const C_GRASS_LIGHT = '#478f5c';
const C_PATH_DIRT = '#8b5a2b';
const C_PATH_LIGHT = '#a46e38';
const C_PATH_EDGE = '#6d431d';
const C_WATER_DEEP = '#1d4ed8';
const C_WATER_MID = '#3b82f6';
const C_WATER_FOAM = '#93c5fd';
const C_WOOD_DARK = '#452613';
const C_WOOD = '#6e3c1b';
const C_WOOD_LIGHT = '#965a2d';

let seed = 42;
function rand() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Left dark boundary (the void edge)
map.fillRect(0, 0, 80, 512, C_DARK_BG);

// Paved Sidewalk / Pathway on the left (x: 80 to 110)
map.fillRect(80, 0, 30, 512, C_STONE_LIGHT);
map.fillRect(108, 0, 2, 512, C_STONE_DARK);
for (let y = 0; y < 512; y += 32) {
  map.fillRect(80, y, 28, 1, C_STONE_BORDER);
}

// Lush Green Lawn (x: 110 to 800)
for (let y = 0; y < 512; y++) {
  for (let x = 110; x < 800; x++) {
    const n = Math.sin(x * 0.04) + Math.cos(y * 0.04) + (rand() - 0.5) * 0.4;
    const col = n > 0.4 ? C_GRASS_LIGHT : n > -0.2 ? C_GRASS_MID : C_GRASS_BASE;
    map.setPixel(x, y, col);
  }
}

// Dirt paths linking the sidewalk to the forest clearing and house
function drawDirtCircle(cx, cy, radius) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d <= radius) {
        const px = cx + x;
        const py = cy + y;
        const jitter = rand() * 2;
        if (d > radius - 2 - jitter) {
          map.setPixel(px, py, C_PATH_EDGE);
        } else if (d < radius * 0.6) {
          map.setPixel(px, py, C_PATH_LIGHT);
        } else {
          map.setPixel(px, py, C_PATH_DIRT);
        }
      }
    }
  }
}

// Interconnected dirt patches
drawDirtCircle(220, 260, 48);
drawDirtCircle(330, 250, 54);
drawDirtCircle(470, 240, 60);
drawDirtCircle(370, 160, 42);

// Small Scenic Pond / Stream at top right (x: 580..760, y: 340..490)
for (let y = 350; y < 490; y++) {
  for (let x = 580; x < 760; x++) {
    const dx = (x - 670) / 80;
    const dy = (y - 420) / 50;
    const dist = dx * dx + dy * dy;
    if (dist <= 1.0) {
      if (dist > 0.85) {
        map.setPixel(x, y, C_WATER_FOAM);
      } else if (dist > 0.45) {
        map.setPixel(x, y, C_WATER_MID);
      } else {
        map.setPixel(x, y, C_WATER_DEEP);
      }
    }
  }
}

// Cozy Wooden Cabin at top center (x: 480..640, y: 30..150)
const hx = 490;
const hy = 40;
// Cabin walls
map.fillRect(hx, hy + 30, 140, 75, C_WOOD);
map.drawOutlineRect(hx, hy + 30, 140, 75, C_WOOD_DARK);
for (let y = hy + 38; y < hy + 105; y += 12) {
  map.fillRect(hx + 1, y, 138, 1, C_WOOD_DARK);
}
// Door
map.fillRect(hx + 56, hy + 65, 28, 40, C_WOOD_LIGHT);
map.drawOutlineRect(hx + 56, hy + 65, 28, 40, C_WOOD_DARK);
map.setPixel(hx + 80, hy + 86, '#ffd700'); // Brass handle
// Windows
function drawWindow(wx, wy) {
  map.fillRect(wx, wy, 20, 22, '#93c5fd');
  map.drawOutlineRect(wx, wy, 20, 22, C_WOOD_DARK);
  map.fillRect(wx + 9, wy, 2, 22, C_WOOD_DARK);
  map.fillRect(wx, wy + 10, 20, 2, C_WOOD_DARK);
}
drawWindow(hx + 18, hy + 50);
drawWindow(hx + 102, hy + 50);
// Overhanging Roof
for (let i = 0; i < 35; i++) {
  map.fillRect(hx - 12 + i * 2, hy + i, 164 - i * 4, 2, '#8b2500');
  map.fillRect(hx - 12 + i * 2, hy + i + 1, 164 - i * 4, 1, '#611a00');
}

// Pixel Art Tree function
function drawPixelTree(tx, ty, radius = 38) {
  map.drawCircle(tx, ty + radius * 0.7, radius * 0.85, '#1b3b24'); // Drop shadow
  // Trunk
  map.fillRect(tx - 6, ty + radius * 0.3, 12, radius * 0.8, C_WOOD);
  map.drawOutlineRect(tx - 6, ty + radius * 0.3, 12, radius * 0.8, C_WOOD_DARK);
  // Foliage clusters
  const clusters = [
    { dx: 0, dy: -radius * 0.5, r: radius * 0.65 },
    { dx: -radius * 0.45, dy: -radius * 0.1, r: radius * 0.55 },
    { dx: radius * 0.45, dy: -radius * 0.1, r: radius * 0.55 },
    { dx: -radius * 0.3, dy: radius * 0.25, r: radius * 0.5 },
    { dx: radius * 0.3, dy: radius * 0.25, r: radius * 0.5 },
    { dx: 0, dy: 0, r: radius * 0.7 }
  ];
  for (const c of clusters) map.drawCircle(tx + c.dx, ty + c.dy, c.r, '#22482f');
  for (const c of clusters) map.drawCircle(tx + c.dx, ty + c.dy - 3, c.r - 2, '#346f47');
  for (const c of clusters) {
    map.drawCircle(tx + c.dx - 4, ty + c.dy - 6, c.r * 0.5, '#569b6a');
    map.drawCircle(tx + c.dx - 6, ty + c.dy - 8, c.r * 0.25, '#7bc48f');
  }
}

// Tree stump
function drawTreeStump(sx, sy) {
  map.drawCircle(sx, sy + 6, 12, '#203929');
  map.fillRect(sx - 8, sy, 16, 10, C_WOOD_DARK);
  map.fillRect(sx - 6, sy + 1, 12, 8, C_WOOD);
  map.fillRect(sx - 7, sy - 4, 14, 6, C_WOOD_LIGHT);
  map.setPixel(sx, sy - 2, C_WOOD_DARK);
  map.setPixel(sx + 1, sy - 2, C_WOOD_DARK);
}

// Trees placement
drawPixelTree(135, 140, 36);
drawPixelTree(170, 60, 42);
drawPixelTree(310, 50, 40);
drawPixelTree(420, 60, 38);
drawPixelTree(740, 180, 40);
drawPixelTree(760, 290, 42);
drawPixelTree(730, 420, 38);
drawPixelTree(380, 440, 44);
drawPixelTree(220, 450, 40);
drawPixelTree(130, 370, 36);
drawPixelTree(125, 480, 34);

drawTreeStump(290, 320);
drawTreeStump(480, 270);

// Wooden Signpost
function drawSignpost(sx, sy) {
  map.fillRect(sx + 6, sy + 10, 4, 12, C_WOOD_DARK);
  map.fillRect(sx, sy, 16, 11, C_WOOD_LIGHT);
  map.drawOutlineRect(sx, sy, 16, 11, C_WOOD_DARK);
  map.fillRect(sx + 3, sy + 3, 10, 1, C_WOOD_DARK);
  map.fillRect(sx + 3, sy + 6, 7, 1, C_WOOD_DARK);
}
drawSignpost(230, 220);

// Treasure Chest
function drawChest(cx, cy) {
  map.drawCircle(cx + 8, cy + 12, 8, '#203929');
  map.fillRect(cx, cy + 5, 18, 11, '#9b5e2b');
  map.drawOutlineRect(cx, cy + 5, 18, 11, '#44250e');
  map.fillRect(cx + 1, cy, 16, 6, '#b7763c');
  map.drawOutlineRect(cx + 1, cy, 16, 6, '#44250e');
  map.fillRect(cx + 3, cy, 2, 16, '#f3cb48');
  map.fillRect(cx + 13, cy, 2, 16, '#f3cb48');
  map.fillRect(cx + 8, cy + 6, 2, 3, '#2a1708');
}
drawChest(440, 175);

// Flowers scattered in grass
function drawFlower(fx, fy, color) {
  map.setPixel(fx, fy, '#fed433');
  map.setPixel(fx - 1, fy, color);
  map.setPixel(fx + 1, fy, color);
  map.setPixel(fx, fy - 1, color);
  map.setPixel(fx, fy + 1, color);
  map.setPixel(fx, fy + 2, '#2d5e38');
}
for (let i = 0; i < 40; i++) {
  const fx = 120 + Math.floor(rand() * 620);
  const fy = 40 + Math.floor(rand() * 440);
  const col = rand() > 0.6 ? '#ffffff' : rand() > 0.3 ? '#62b0f4' : '#fed433';
  drawFlower(fx, fy, col);
}

// -------------------------------------------------------------
// 2. 9 SHADED SKIN TONES & 32x32 CHIBI SPRITESHEET
// -------------------------------------------------------------
console.log('Crafting 9 Shaded Skin Tones and Character Spritesheets...');

export const SKIN_PALETTES = [
  { id: 'peach_fair', name: 'Pêssego Claro', highlight: '#fff3ea', base: '#fcd4b8', shadow: '#eab090', deepShadow: '#ca8968', blush: '#fcaaa0' },
  { id: 'lilac_fantasy', name: 'Lilás Fantasia', highlight: '#f8ecfa', base: '#e8d3e8', shadow: '#c5a5c5', deepShadow: '#9b769b', blush: '#e2b3e8' },
  { id: 'warm_tan', name: 'Morena Âmbar', highlight: '#e2ba93', base: '#c89b70', shadow: '#a8784d', deepShadow: '#81542e', blush: '#b86d48' },
  { id: 'rosy_peach', name: 'Bege Rosado', highlight: '#fde3d2', base: '#f6be9d', shadow: '#db9874', deepShadow: '#b4714f', blush: '#f0907d' },
  { id: 'slate_fantasy', name: 'Azul Névoa', highlight: '#e4e8f7', base: '#c7cbe3', shadow: '#9fa5c7', deepShadow: '#737ba0', blush: '#a2aae0' },
  { id: 'pale_ivory', name: 'Marfim Pálido', highlight: '#fff8f0', base: '#fde5d0', shadow: '#e8c4a9', deepShadow: '#c49c7f', blush: '#f9bfa8' },
  { id: 'warm_wheat', name: 'Dourado Trigo', highlight: '#f5e7b8', base: '#e2cb8b', shadow: '#bea462', deepShadow: '#927a3c', blush: '#d8ab5b' },
  { id: 'almond_sand', name: 'Areia Suave', highlight: '#fbf6ee', base: '#e7ded0', shadow: '#c4b7a4', deepShadow: '#998b76', blush: '#d2af9c' },
  { id: 'deep_cocoa', name: 'Cacau Profundo', highlight: '#d8a998', base: '#ba8b7a', shadow: '#926352', deepShadow: '#6a3f30', blush: '#844238' },
];

const SPRITE_W = 32;
const SPRITE_H = 32;

function drawChibiToCanvas(dest, ox, oy, pal, direction, pose, clothed = true) {
  const isUp = direction === 'up';
  const flip = direction === 'left';

  function p(x, y, col) {
    const rx = flip ? 31 - x : x;
    dest.setPixel(ox + rx, oy + y, col);
  }
  function r(x, y, w, h, col) {
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        p(x + px, y + py, col);
      }
    }
  }

  const OUTLINE = '#000000';
  const H = pal.highlight;
  const B = pal.base;
  const S = pal.shadow;
  const D = pal.deepShadow;
  const BL = pal.blush;

  // Outfit & Hair colors
  const cHair = '#273047';
  const cHairH = '#425175';
  const cHairS = '#151c2e';
  const cJacket = '#c04f57';
  const cJacketS = '#8e2d34';
  const cShirt = '#dae4ec';
  const cPants = '#293346';
  const cBoots = '#171e2d';

  // Walk cycle leg offsets
  let legL = 0;
  let legR = 0;
  let armL = 0;
  let armR = 0;
  if (pose === 'walk1') { legL = -1; legR = 1; armL = 1; armR = -1; }
  if (pose === 'walk2') { legL = 1; legR = -1; armL = -1; armR = 1; }

  // Legs & Feet
  if (clothed) {
    r(10, 23 + legL, 1, 2, OUTLINE);
    r(14, 23 + legL, 1, 2, OUTLINE);
    r(11, 23 + legL, 3, 1, cPants);
    r(11, 24 + legL, 3, 1, cBoots);
    r(11, 25 + legL, 3, 1, OUTLINE);

    r(16, 23 + legR, 1, 2, OUTLINE);
    r(20, 23 + legR, 1, 2, OUTLINE);
    r(17, 23 + legR, 3, 1, cPants);
    r(17, 24 + legR, 3, 1, cBoots);
    r(17, 25 + legR, 3, 1, OUTLINE);

    r(14, 23, 3, 1, OUTLINE);
  } else {
    // Naked legs
    r(10, 23 + legL, 1, 2, OUTLINE);
    r(14, 23 + legL, 1, 2, OUTLINE);
    r(11, 23 + legL, 2, 1, B);
    r(13, 23 + legL, 1, 1, S);
    r(11, 24 + legL, 2, 1, S);
    r(13, 24 + legL, 1, 1, D);
    r(11, 25 + legL, 3, 1, OUTLINE);

    r(16, 23 + legR, 1, 2, OUTLINE);
    r(20, 23 + legR, 1, 2, OUTLINE);
    r(17, 23 + legR, 2, 1, S);
    r(19, 23 + legR, 1, 1, D);
    r(17, 24 + legR, 1, 1, S);
    r(18, 24 + legR, 2, 1, D);
    r(17, 25 + legR, 3, 1, OUTLINE);

    r(14, 23, 3, 1, OUTLINE);
  }

  // Torso
  r(8, 16, 1, 2, OUTLINE);
  r(22, 16, 1, 2, OUTLINE);
  r(7, 18, 1, 1, OUTLINE);
  r(23, 18, 1, 1, OUTLINE);
  r(10, 19, 1, 4, OUTLINE);
  r(20, 19, 1, 4, OUTLINE);

  // Neck drop shadow
  r(9, 16, 13, 1, D);

  if (clothed) {
    r(9, 17, 9, 1, cJacket);
    r(18, 17, 4, 1, cJacketS);
    if (!isUp) r(14, 17, 3, 1, cShirt);

    r(8, 18, 1, 1, cJacket);
    r(9, 18, 9, 1, cJacket);
    r(18, 18, 5, 1, cJacketS);
    if (!isUp) r(14, 18, 3, 1, cShirt);

    r(11, 19, 7, 3, cJacket);
    r(18, 19, 2, 3, cJacketS);
    if (!isUp) r(14, 19, 3, 3, cShirt);

    r(11, 22, 9, 1, cJacketS);

    // Arms
    if (pose === 'attack') {
      // Swing forward
      r(21, 16, 6, 2, cJacket);
      r(27, 16, 2, 2, B);
      // Sword blade
      r(27, 8, 2, 8, '#e2f0fd');
      r(26, 16, 4, 1, '#f1c84b');
    } else if (pose === 'victory') {
      // Arms raised
      r(5, 13, 2, 6, cJacket);
      r(5, 11, 2, 2, B);
      r(23, 13, 2, 6, cJacketS);
      r(23, 11, 2, 2, S);
    } else {
      // Left arm
      r(6, 19 + armL, 1, 3, OUTLINE);
      r(9, 19 + armL, 1, 3, OUTLINE);
      r(7, 19 + armL, 2, 2, cJacket);
      r(7, 21 + armL, 1, 1, B);
      r(8, 21 + armL, 1, 1, S);
      r(6, 22 + armL, 3, 1, OUTLINE);

      // Right arm
      r(21, 19 + armR, 1, 3, OUTLINE);
      r(24, 19 + armR, 1, 3, OUTLINE);
      r(22, 19 + armR, 2, 2, cJacketS);
      r(22, 21 + armR, 1, 1, S);
      r(23, 21 + armR, 1, 1, D);
      r(22, 22 + armR, 3, 1, OUTLINE);
    }
  } else {
    // Naked torso
    r(9, 17, 5, 1, H);
    r(14, 17, 5, 1, B);
    r(19, 17, 3, 1, S);

    r(8, 18, 1, 1, S);
    r(9, 18, 10, 1, B);
    r(19, 18, 4, 1, S);

    r(11, 19, 6, 2, B);
    r(17, 19, 3, 2, S);
    r(11, 21, 5, 1, B);
    r(16, 21, 4, 1, S);
    r(11, 22, 5, 1, S);
    r(16, 22, 4, 1, D);

    // Left arm
    r(6, 19 + armL, 1, 2, OUTLINE);
    r(9, 19 + armL, 1, 2, OUTLINE);
    r(7, 19 + armL, 1, 1, H);
    r(8, 19 + armL, 1, 1, B);
    r(7, 20 + armL, 1, 1, B);
    r(8, 20 + armL, 1, 1, S);
    r(6, 21 + armL, 3, 1, OUTLINE);

    // Right arm
    r(21, 19 + armR, 1, 2, OUTLINE);
    r(24, 19 + armR, 1, 2, OUTLINE);
    r(22, 19 + armR, 2, 1, S);
    r(22, 20 + armR, 1, 1, S);
    r(23, 20 + armR, 1, 1, D);
    r(22, 21 + armR, 3, 1, OUTLINE);
  }

  // Head Outlines
  r(13, 3, 3, 1, OUTLINE);
  r(9, 4, 13, 1, OUTLINE);
  r(8, 5, 1, 10, OUTLINE);
  r(22, 5, 1, 10, OUTLINE);
  r(9, 15, 13, 1, OUTLINE);

  // Shaded Head Volume Fill
  r(9, 5, 5, 1, H);
  r(14, 5, 6, 1, B);
  r(20, 5, 2, 1, S);

  r(9, 6, 4, 1, H);
  r(13, 6, 7, 1, B);
  r(20, 6, 2, 1, S);

  r(9, 7, 2, 1, H);
  r(11, 7, 9, 1, B);
  r(20, 7, 2, 1, S);

  r(9, 8, 11, 6, B);
  r(20, 8, 2, 6, S);

  r(9, 14, 9, 1, B);
  r(18, 14, 4, 1, S);

  // Face Features
  if (!isUp) {
    if (pose === 'damage') {
      // Squint hurt eyes
      r(10, 12, 2, 1, OUTLINE);
      r(19, 12, 2, 1, OUTLINE);
      r(14, 14, 3, 1, D);
    } else {
      // Eyebrows
      r(10, 10, 2, 1, OUTLINE);
      r(19, 10, 2, 1, OUTLINE);

      // Eyes with catchlight
      r(10, 12, 2, 2, OUTLINE);
      p(10, 12, '#ffffff');

      r(19, 12, 2, 2, OUTLINE);
      p(19, 12, '#ffffff');

      // Mouth
      r(14, 13, 3, 1, D);

      // Blush
      r(10, 14, 2, 1, BL);
      r(19, 14, 2, 1, BL);
    }
  }

  // Hair
  if (clothed) {
    if (isUp) {
      r(10, 3, 11, 1, cHairH);
      r(9, 4, 13, 1, cHairH);
      r(9, 5, 13, 2, cHair);
      r(9, 7, 13, 7, cHair);
      r(18, 5, 4, 9, cHairS);
      r(9, 14, 13, 1, cHairS);
    } else {
      r(9, 4, 6, 1, cHairH);
      r(15, 4, 4, 1, cHair);
      r(19, 4, 3, 1, cHairS);

      r(8, 5, 6, 1, cHairH);
      r(14, 5, 5, 1, cHair);
      r(19, 5, 3, 1, cHairS);

      r(8, 6, 5, 1, cHairH);
      r(13, 6, 6, 1, cHair);
      r(19, 6, 4, 1, cHairS);

      r(8, 7, 2, 2, cHair);
      r(13, 7, 2, 2, cHair);
      r(21, 7, 2, 2, cHairS);

      r(8, 9, 1, 2, cHair);
      r(22, 9, 1, 2, cHairS);
    }
  }
}

// Generate Primary Character Spritesheet (32 x 32 tiles, 4 rows x 6 cols)
const charCanvas = new PixelCanvas(SPRITE_W * 6, SPRITE_H * 4);
const DIRECTIONS = ['down', 'left', 'up', 'right'];
const POSES = ['idle', 'walk1', 'walk2', 'attack', 'damage', 'victory'];

for (let r = 0; r < DIRECTIONS.length; r++) {
  for (let c = 0; c < POSES.length; c++) {
    drawChibiToCanvas(charCanvas, c * SPRITE_W, r * SPRITE_H, SKIN_PALETTES[5], DIRECTIONS[r], POSES[c], true);
  }
}

// -------------------------------------------------------------
// 3. GENERATE CREATURES ATLAS (24 x 24 per creature)
// -------------------------------------------------------------
console.log('Crafting Pixel Art Creatures Atlas...');
const creatureCanvas = new PixelCanvas(24 * 6, 24);
const CREATURE_SPECS = [
  { name: 'syntax-slime', color: '#85cc4b', accent: '#a6e866', eye: '#193246' },
  { name: 'blue-slime', color: '#53bce7', accent: '#8ee0ff', eye: '#193246' },
  { name: 'ember', color: '#f39a42', accent: '#ffd269', eye: '#40180a' },
  { name: 'byte-bug', color: '#b39be8', accent: '#d9cbff', eye: '#1e143b' },
  { name: 'forest', color: '#4dbb8b', accent: '#7be3b6', eye: '#123927' },
  { name: 'null-ghost', color: '#a7b6cc', accent: '#d3e0f4', eye: '#273347' },
];

CREATURE_SPECS.forEach((c, idx) => {
  const ox = idx * 24;
  creatureCanvas.drawCircle(ox + 12, 20, 8, '#0f242040');
  creatureCanvas.drawCircle(ox + 12, 14, 8, c.color);
  creatureCanvas.fillRect(ox + 5, 14, 14, 7, c.color);
  creatureCanvas.drawCircle(ox + 9, 10, 3, c.accent);
  creatureCanvas.fillRect(ox + 8, 12, 2, 3, c.eye);
  creatureCanvas.fillRect(ox + 14, 12, 2, 3, c.eye);
  creatureCanvas.setPixel(ox + 8, 12, '#ffffff');
  creatureCanvas.setPixel(ox + 14, 12, '#ffffff');

  if (c.name === 'ember') {
    creatureCanvas.fillRect(ox + 11, 4, 2, 4, '#ffdd55');
  } else if (c.name === 'byte-bug') {
    creatureCanvas.setPixel(ox + 7, 5, c.accent);
    creatureCanvas.setPixel(ox + 8, 6, c.accent);
    creatureCanvas.setPixel(ox + 16, 5, c.accent);
    creatureCanvas.setPixel(ox + 15, 6, c.accent);
  } else if (c.name === 'forest') {
    creatureCanvas.fillRect(ox + 11, 3, 2, 4, '#64c852');
    creatureCanvas.fillRect(ox + 13, 2, 3, 2, '#88e477');
  }
});

// -------------------------------------------------------------
// 4. GENERATE GOLD COIN (32 x 32 with Cat Emblem)
// -------------------------------------------------------------
console.log('Crafting Pixel Art Gold Coin with Cat Silhouette...');
const coinCanvas = new PixelCanvas(32, 32);
coinCanvas.drawCircle(16, 17, 13, '#8e5917'); // Drop shadow
coinCanvas.drawCircle(16, 15, 13, '#cf8a1e'); // Dark rim
coinCanvas.drawCircle(16, 15, 12, '#f6ba28'); // Gold face
coinCanvas.drawCircle(16, 15, 9, '#ffe169');  // Inner embossed circle

// Cat Emblem inside coin (matching reference photos!)
coinCanvas.drawCircle(16, 16, 5, '#cf8a1e');
// Left cat ear
coinCanvas.setPixel(12, 11, '#cf8a1e');
coinCanvas.setPixel(13, 12, '#cf8a1e');
coinCanvas.setPixel(14, 13, '#cf8a1e');
// Right cat ear
coinCanvas.setPixel(20, 11, '#cf8a1e');
coinCanvas.setPixel(19, 12, '#cf8a1e');
coinCanvas.setPixel(18, 13, '#cf8a1e');
// Cat eyes
coinCanvas.setPixel(14, 15, '#ffe169');
coinCanvas.setPixel(18, 15, '#ffe169');
// Cat nose
coinCanvas.setPixel(16, 17, '#ffe169');

// Shine highlight
coinCanvas.setPixel(10, 8, '#ffffff');
coinCanvas.setPixel(11, 8, '#ffffff');
coinCanvas.setPixel(10, 9, '#ffffff');

// Save raw intermediate PNGs
const sceneryPng = path.join(ARTIFACTS_DIR, 'scenery_source.png');
const charPng = path.join(ARTIFACTS_DIR, 'character_source.png');
const creaturesPng = path.join(ARTIFACTS_DIR, 'creatures_source.png');
const coinPng = path.join(ARTIFACTS_DIR, 'coin_source.png');

await map.toPngFile(sceneryPng);
await charCanvas.toPngFile(charPng);
await creatureCanvas.toPngFile(creaturesPng);
await coinCanvas.toPngFile(coinPng);

// -------------------------------------------------------------
// 5. GENERATE 9 DEDICATED SKIN ASE & PNG ASSETS
// -------------------------------------------------------------
console.log('Generating 9 standalone skin variation sprites (.ase + .png)...');
for (let i = 0; i < SKIN_PALETTES.length; i++) {
  const pal = SKIN_PALETTES[i];
  const skinCanvas = new PixelCanvas(32, 32);
  drawChibiToCanvas(skinCanvas, 0, 0, pal, 'down', 'idle', false);
  
  const skinRawPng = path.join(SKINS_ARTIFACTS_DIR, `skin_${i}_${pal.id}_source.png`);
  const skinAse = path.join(SKINS_ARTIFACTS_DIR, `skin_${i}_${pal.id}.ase`);
  const skinOutPng = path.join(SKINS_PUBLIC_DIR, `skin_${i}_${pal.id}.png`);

  await skinCanvas.toPngFile(skinRawPng);
  execFileSync(LIBRESPRITE_BIN, ['--batch', skinRawPng, '--save-as', skinAse]);
  execFileSync(LIBRESPRITE_BIN, ['--batch', skinAse, '--save-as', skinOutPng]);
  console.log(`Exported skin [${i}] ${pal.name} -> ${skinAse}`);
}

// -------------------------------------------------------------
// 6. PROCESS & COMPILE MAIN ASSETS THROUGH LIBRESPRITE CLI
// -------------------------------------------------------------
console.log(`Running LibreSprite (${LIBRESPRITE_BIN})...`);

const tasks = [
  {
    name: 'forest',
    srcPng: sceneryPng,
    aseFile: path.join(ARTIFACTS_DIR, 'mundinho-forest.ase'),
    outPng: path.join(PUBLIC_DIR, 'forest.png')
  },
  {
    name: 'character',
    srcPng: charPng,
    aseFile: path.join(ARTIFACTS_DIR, 'mundinho-character.ase'),
    outPng: path.join(PUBLIC_DIR, 'character-atlas.png')
  },
  {
    name: 'creatures',
    srcPng: creaturesPng,
    aseFile: path.join(ARTIFACTS_DIR, 'mundinho-creatures.ase'),
    outPng: path.join(PUBLIC_DIR, 'creatures-atlas.png')
  },
  {
    name: 'coin',
    srcPng: coinPng,
    aseFile: path.join(ARTIFACTS_DIR, 'mundinho-coin.ase'),
    outPng: path.join(PUBLIC_DIR, 'coin.png')
  }
];

for (const t of tasks) {
  console.log(`Converting ${t.name} to LibreSprite .ase project...`);
  execFileSync(LIBRESPRITE_BIN, ['--batch', t.srcPng, '--save-as', t.aseFile], { stdio: 'inherit' });

  console.log(`Exporting ${t.name} from LibreSprite .ase to production PNG...`);
  execFileSync(LIBRESPRITE_BIN, ['--batch', t.aseFile, '--save-as', t.outPng], { stdio: 'inherit' });
}

console.log('ALL SPRITES, SKINS, AND SCENARIOS SUCCESSFULLY GENERATED AND EXPORTED VIA LIBRESPRITE!');
