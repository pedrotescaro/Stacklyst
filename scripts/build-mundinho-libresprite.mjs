import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const LIBRESPRITE_BIN = 'C:\\Program Files\\LibreSprite\\libresprite.exe';
const ARTIFACTS_DIR = path.resolve('artifacts/mundinho/libresprite');
const PUBLIC_DIR = path.resolve('public/assets/mundinho');

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

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
// Inspired by Image 3: Left sidewalk/path, lush lawn, trees, house, stump, flowers
// -------------------------------------------------------------
console.log('Crafting Pixel Art Scenery Map...');
const map = new PixelCanvas(800, 512);

// Palettes
const C_DARK_BG = '#1a1c23';
const C_SIDEWALK = '#9ba3a9';
const C_SIDEWALK_SHADOW = '#71787f';
const C_SIDEWALK_BORDER = '#4f555c';
const C_SIDEWALK_LINE = '#889097';
const C_GRASS_BASE = '#3d6c4e';
const C_GRASS_LIGHT = '#4c815d';
const C_GRASS_DARK = '#2f553e';
const C_GRASS_HIGHLIGHT = '#5ea274';

const C_DIRT = '#a07753';
const C_DIRT_LIGHT = '#b78c66';
const C_DIRT_DARK = '#7c583a';

const C_WATER = '#3d7bb0';
const C_WATER_LIGHT = '#5898d0';
const C_WATER_DARK = '#2b577e';
const C_WATER_SHORE = '#85a491';

const C_WOOD = '#8a5833';
const C_WOOD_LIGHT = '#a76f44';
const C_WOOD_DARK = '#59381e';
const C_ROOF_RED = '#8f3b3b';
const C_ROOF_LIGHT = '#b24c4c';
const C_ROOF_DARK = '#632828';

// Fill whole map with grass base
map.fillRect(0, 0, 800, 512, C_GRASS_BASE);

// Procedural grass texture & flowers (seeded)
let seed = 12345;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

// Grass tufts
for (let y = 0; y < 512; y += 4) {
  for (let x = 0; x < 800; x += 4) {
    const r = rand();
    if (r > 0.85) {
      map.setPixel(x, y, C_GRASS_LIGHT);
      map.setPixel(x + 1, y - 1, C_GRASS_HIGHLIGHT);
    } else if (r < 0.15) {
      map.setPixel(x, y, C_GRASS_DARK);
    }
  }
}

// Left Sidewalk / Road (Width: 100px)
const SIDEWALK_W = 100;
map.fillRect(0, 0, SIDEWALK_W, 512, C_SIDEWALK);
// Left dark void / road border
map.fillRect(0, 0, 24, 512, C_DARK_BG);
// Sidewalk paving slabs lines
for (let y = 0; y < 512; y += 32) {
  map.fillRect(24, y, SIDEWALK_W - 24, 1, C_SIDEWALK_LINE);
  map.fillRect(24, y + 1, SIDEWALK_W - 24, 1, C_SIDEWALK_SHADOW);
}
// Sidewalk right curb border
map.fillRect(SIDEWALK_W - 3, 0, 3, 512, C_SIDEWALK_BORDER);
map.fillRect(SIDEWALK_W, 0, 2, 512, '#18241c'); // Drop shadow onto grass

// Dirt clearing / path leading from sidewalk across the map
function drawDirtBlob(cx, cy, rx, ry) {
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (d <= 1.0) {
        const px = cx + x;
        const py = cy + y;
        const edge = d > 0.85;
        const c = edge ? (rand() > 0.5 ? C_DIRT_DARK : C_GRASS_DARK) : (rand() > 0.8 ? C_DIRT_LIGHT : rand() < 0.2 ? C_DIRT_DARK : C_DIRT);
        map.setPixel(px, py, c);
      }
    }
  }
}

// Dirt paths
drawDirtBlob(220, 260, 110, 40);
drawDirtBlob(360, 230, 90, 50);
drawDirtBlob(510, 190, 120, 45);
drawDirtBlob(620, 210, 70, 40);

// Pond / Small Lake at bottom right (x: 520, y: 410, rx: 110, ry: 60)
for (let y = -70; y <= 70; y++) {
  for (let x = -130; x <= 130; x++) {
    const d = (x * x) / (120 * 120) + (y * y) / (55 * 55);
    const px = 580 + x;
    const py = 420 + y;
    if (d <= 1.0) {
      if (d > 0.85) {
        map.setPixel(px, py, C_WATER_SHORE);
      } else if (d > 0.6) {
        map.setPixel(px, py, C_WATER_LIGHT);
      } else {
        const wave = (px + py * 2) % 18 < 3 ? '#6db4eb' : C_WATER;
        map.setPixel(px, py, wave);
      }
    }
  }
}
// Lily pads in the pond
map.drawCircle(550, 410, 5, '#418255');
map.setPixel(550, 410, '#295436');
map.drawCircle(610, 435, 4, '#418255');
map.setPixel(612, 434, '#f8e085'); // Small water lily flower

// Wooden House at top right (x: 560, y: 40, w: 160, h: 120)
const hx = 560;
const hy = 40;
const hw = 160;
const hh = 110;

// Chimney
map.fillRect(hx + 120, hy - 15, 18, 25, '#696f77');
map.fillRect(hx + 118, hy - 18, 22, 5, '#4f545a');

// Roof (slanted pixel triangle)
for (let r = 0; r < 40; r++) {
  const rw = hw + 16 - r * 3;
  const rx = hx - 8 + Math.floor((r * 3) / 2);
  const ry = hy + 40 - r;
  const col = r % 4 === 0 ? C_ROOF_DARK : r % 2 === 0 ? C_ROOF_LIGHT : C_ROOF_RED;
  map.fillRect(rx, ry, rw, 1, col);
}

// House walls (timber planks)
map.fillRect(hx, hy + 40, hw, hh - 40, C_WOOD);
for (let y = hy + 40; y < hy + hh; y += 8) {
  map.fillRect(hx, y, hw, 1, C_WOOD_DARK);
}
// Corner beams
map.fillRect(hx, hy + 40, 8, hh - 40, C_WOOD_DARK);
map.fillRect(hx + hw - 8, hy + 40, 8, hh - 40, C_WOOD_DARK);

// Front Door (centered)
const doorX = hx + 64;
const doorY = hy + 66;
map.fillRect(doorX, doorY, 32, 44, '#4a2c16');
map.drawOutlineRect(doorX, doorY, 32, 44, '#2d180b');
map.fillRect(doorX + 4, doorY + 6, 10, 14, '#6b4324');
map.fillRect(doorX + 18, doorY + 6, 10, 14, '#6b4324');
map.fillRect(doorX + 4, doorY + 24, 10, 14, '#6b4324');
map.fillRect(doorX + 18, doorY + 24, 10, 14, '#6b4324');
map.setPixel(doorX + 26, doorY + 22, '#f6c747'); // Gold knob

// Windows with cozy warm glow
function drawWindow(wx, wy) {
  map.fillRect(wx, wy, 24, 24, '#ffe78c');
  map.drawOutlineRect(wx, wy, 24, 24, '#301c10');
  map.fillRect(wx + 11, wy, 2, 24, '#301c10'); // Cross frame
  map.fillRect(wx, wy + 11, 24, 2, '#301c10');
  // Glass highlight
  map.setPixel(wx + 2, wy + 2, '#ffffff');
  map.setPixel(wx + 3, wy + 2, '#ffffff');
  map.setPixel(wx + 2, wy + 3, '#ffffff');
}
drawWindow(hx + 18, hy + 60);
drawWindow(hx + 118, hy + 60);

// Wooden Fences
function drawFence(fx, fy, len, horizontal = true) {
  if (horizontal) {
    for (let x = 0; x < len; x += 18) {
      // Post
      map.fillRect(fx + x, fy - 6, 4, 16, C_WOOD_LIGHT);
      map.drawOutlineRect(fx + x, fy - 6, 4, 16, C_WOOD_DARK);
      // Rails
      if (x + 18 <= len) {
        map.fillRect(fx + x + 4, fy - 2, 14, 3, C_WOOD);
        map.fillRect(fx + x + 4, fy + 4, 14, 3, C_WOOD);
      }
    }
  } else {
    for (let y = 0; y < len; y += 18) {
      map.fillRect(fx, fy + y, 4, 16, C_WOOD_LIGHT);
      map.drawOutlineRect(fx, fy + y, 4, 16, C_WOOD_DARK);
    }
  }
}
drawFence(130, 80, 120, true);
drawFence(130, 80, 70, false);
drawFence(480, 140, 70, true);

// Tree drawing helper (Lush pixel tree matching Image 3)
function drawPixelTree(tx, ty, radius = 32) {
  // Shadow on ground
  map.drawCircle(tx, ty + radius * 0.7, radius * 0.85, '#203929');

  // Trunk
  const tw = Math.max(10, Math.floor(radius * 0.35));
  const th = Math.floor(radius * 0.9);
  map.fillRect(tx - Math.floor(tw / 2), ty + 5, tw, th, C_WOOD_DARK);
  map.fillRect(tx - Math.floor(tw / 2) + 2, ty + 5, tw - 4, th, C_WOOD);
  // Root flares
  map.setPixel(tx - Math.floor(tw / 2) - 2, ty + 5 + th - 2, C_WOOD_DARK);
  map.setPixel(tx + Math.floor(tw / 2) + 1, ty + 5 + th - 2, C_WOOD_DARK);

  // Foliage clusters
  const clusters = [
    { dx: 0, dy: -radius * 0.5, r: radius * 0.65 },
    { dx: -radius * 0.45, dy: -radius * 0.1, r: radius * 0.55 },
    { dx: radius * 0.45, dy: -radius * 0.1, r: radius * 0.55 },
    { dx: -radius * 0.3, dy: radius * 0.25, r: radius * 0.5 },
    { dx: radius * 0.3, dy: radius * 0.25, r: radius * 0.5 },
    { dx: 0, dy: 0, r: radius * 0.7 }
  ];

  // Base dark foliage
  for (const c of clusters) {
    map.drawCircle(tx + c.dx, ty + c.dy, c.r, '#22482f');
  }
  // Mid-tone foliage
  for (const c of clusters) {
    map.drawCircle(tx + c.dx, ty + c.dy - 3, c.r - 2, '#346f47');
  }
  // Highlight clusters (top-left light source)
  for (const c of clusters) {
    map.drawCircle(tx + c.dx - 4, ty + c.dy - 6, c.r * 0.5, '#569b6a');
    map.drawCircle(tx + c.dx - 6, ty + c.dy - 8, c.r * 0.25, '#7bc48f');
  }
}

// Tree stump (matching Image 3)
function drawTreeStump(sx, sy) {
  map.drawCircle(sx, sy + 6, 12, '#203929'); // Shadow
  map.fillRect(sx - 8, sy, 16, 10, C_WOOD_DARK);
  map.fillRect(sx - 6, sy + 1, 12, 8, C_WOOD);
  // Top cut surface
  map.fillRect(sx - 7, sy - 4, 14, 6, C_WOOD_LIGHT);
  map.setPixel(sx, sy - 2, C_WOOD_DARK); // Heart ring
  map.setPixel(sx + 1, sy - 2, C_WOOD_DARK);
}

// Place trees around edges and scenic points
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

// Place Tree Stump (at right of path, like Image 3!)
drawTreeStump(290, 320);
drawTreeStump(480, 270);

// Wooden Signpost (x: 230, y: 220)
function drawSignpost(sx, sy) {
  map.fillRect(sx + 6, sy + 10, 4, 12, C_WOOD_DARK);
  map.fillRect(sx, sy, 16, 11, C_WOOD_LIGHT);
  map.drawOutlineRect(sx, sy, 16, 11, C_WOOD_DARK);
  // Carved lines on sign
  map.fillRect(sx + 3, sy + 3, 10, 1, C_WOOD_DARK);
  map.fillRect(sx + 3, sy + 6, 7, 1, C_WOOD_DARK);
}
drawSignpost(230, 220);

// Treasure Chest (x: 430, y: 170)
function drawChest(cx, cy) {
  map.drawCircle(cx + 8, cy + 12, 8, '#203929'); // Shadow
  // Box base
  map.fillRect(cx, cy + 5, 18, 11, '#9b5e2b');
  map.drawOutlineRect(cx, cy + 5, 18, 11, '#44250e');
  // Rounded Lid
  map.fillRect(cx + 1, cy, 16, 6, '#b7763c');
  map.drawOutlineRect(cx + 1, cy, 16, 6, '#44250e');
  // Gold bands
  map.fillRect(cx + 3, cy, 2, 16, '#f3cb48');
  map.fillRect(cx + 13, cy, 2, 16, '#f3cb48');
  // Keyhole
  map.fillRect(cx + 8, cy + 6, 2, 3, '#2a1708');
}
drawChest(440, 175);

// Flowers scattered in grass (white, gold, blue)
function drawFlower(fx, fy, color) {
  map.setPixel(fx, fy, '#fed433');
  map.setPixel(fx - 1, fy, color);
  map.setPixel(fx + 1, fy, color);
  map.setPixel(fx, fy - 1, color);
  map.setPixel(fx, fy + 1, color);
  map.setPixel(fx, fy + 2, '#2d5e38'); // Stem
}
for (let i = 0; i < 40; i++) {
  const fx = 120 + Math.floor(rand() * 620);
  const fy = 40 + Math.floor(rand() * 440);
  const col = rand() > 0.6 ? '#ffffff' : rand() > 0.3 ? '#62b0f4' : '#fed433';
  drawFlower(fx, fy, col);
}

// -------------------------------------------------------------
// 2. GENERATE CHARACTER SPRITESHEET (Original Pixel Hero)
// -------------------------------------------------------------
console.log('Crafting Pixel Art Character Spritesheet...');
// Frames: 4 rows (Down, Left, Up, Right) x 6 cols (Idle, Walk1, Walk2, Attack, Damage, Victory)
const SPRITE_W = 24;
const SPRITE_H = 32;
const charCanvas = new PixelCanvas(SPRITE_W * 6, SPRITE_H * 4);

function drawAvatarToCanvas(dest, ox, oy, direction, pose) {
  // Palettes (matching Image 3 & 4 hero: dark hair, skin, red jacket, gray pants)
  const cSkin = '#e5aa7b';
  const cSkinShadow = '#c88b64';
  const cHair = '#273047';
  const cHairHighlight = '#425175';
  const cEyes = '#2d464d';
  const cJacket = '#c04f57'; // Red adventure jacket
  const cJacketDark = '#8e2d34';
  const cShirt = '#dae4ec'; // White inner shirt
  const cPants = '#293346'; // Gray/blue pants
  const cBoots = '#171e2d';

  const isUp = direction === 'up';
  const isSide = direction === 'left' || direction === 'right';
  const flip = direction === 'left';

  // Local helper to draw with flipping
  function p(x, y, col) {
    const rx = flip ? 23 - x : x;
    dest.setPixel(ox + rx, oy + y, col);
  }
  function r(x, y, w, h, col) {
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        p(x + px, y + py, col);
      }
    }
  }

  // Leg offsets for walk cycles
  let legL = 0;
  let legR = 0;
  if (pose === 'walk1') { legL = -1; legR = 1; }
  if (pose === 'walk2') { legL = 1; legR = -1; }

  // Legs & Boots
  r(6, 25 + legL, 5, 5, cPants);
  r(13, 25 + legR, 5, 5, cPants);
  r(5, 29 + legL, 6, 2, cBoots);
  r(13, 29 + legR, 7, 2, cBoots);

  // Torso / Jacket
  r(5, 17, 14, 8, cJacket);
  r(5, 24, 14, 2, cJacketDark); // Hem
  if (!isUp) {
    r(10, 18, 4, 7, cShirt); // Inner shirt visible from front/side
  }

  // Arms
  if (pose === 'attack') {
    // Sword swing forward
    r(18, 15, 5, 3, cJacket);
    r(22, 16, 2, 2, cSkin);
    // Sword blade
    r(22, 10, 2, 7, '#e4eff7');
    r(21, 17, 4, 1, '#f1c84b'); // Guard
  } else if (pose === 'victory') {
    // Both hands raised!
    r(3, 13, 3, 6, cJacket);
    r(3, 11, 3, 2, cSkin);
    r(18, 13, 3, 6, cJacket);
    r(18, 11, 3, 2, cSkin);
  } else {
    // Normal arms
    r(3, 18, 3, 6, cJacket);
    r(3, 24, 3, 2, cSkin);
    r(18, 18, 3, 6, cJacket);
    r(18, 24, 3, 2, cSkin);
  }

  // Head & Neck
  r(6, 6, 12, 11, cSkin);
  r(6, 15, 12, 2, cSkinShadow); // Neck shadow
  // Ears
  p(5, 11, cSkin);
  p(18, 11, cSkin);

  // Eyes & Expression
  if (!isUp) {
    if (pose === 'damage') {
      // Hurt squint eyes
      p(isSide ? 14 : 8, 11, cEyes);
      p(isSide ? 15 : 9, 10, cEyes);
      if (!isSide) {
        p(14, 10, cEyes);
        p(15, 11, cEyes);
      }
    } else {
      // Normal cute eyes
      r(isSide ? 14 : 8, 10, 2, 3, cEyes);
      p(isSide ? 14 : 8, 10, '#ffffff'); // Catchlight
      if (!isSide) {
        r(14, 10, 2, 3, cEyes);
        p(14, 10, '#ffffff');
      }
      // Mouth
      p(11, 15, '#b06555');
      p(12, 15, '#b06555');
    }
  }

  // Hair (styled modern cut matching Image 3 & 4)
  if (isUp) {
    // Back of head covered in hair
    r(5, 3, 14, 13, cHair);
    r(7, 2, 10, 2, cHair);
    r(8, 4, 8, 2, cHairHighlight);
  } else {
    // Front bangs & hair volume
    r(5, 3, 14, 6, cHair);
    r(7, 1, 10, 3, cHair);
    r(4, 7, 3, 7, cHair);
    r(17, 7, 3, 7, cHair);
    // Fringe / Bangs
    r(7, 6, 2, 3, cHair);
    r(11, 6, 2, 2, cHair);
    r(15, 6, 2, 3, cHair);
    r(8, 3, 7, 2, cHairHighlight); // Hair highlight
  }
}

const DIRECTIONS = ['down', 'left', 'up', 'right'];
const POSES = ['idle', 'walk1', 'walk2', 'attack', 'damage', 'victory'];

for (let r = 0; r < DIRECTIONS.length; r++) {
  for (let c = 0; c < POSES.length; c++) {
    drawAvatarToCanvas(charCanvas, c * SPRITE_W, r * SPRITE_H, DIRECTIONS[r], POSES[c]);
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
  // Shadow
  creatureCanvas.drawCircle(ox + 12, 20, 8, '#0f242040');
  // Body blob
  creatureCanvas.drawCircle(ox + 12, 14, 8, c.color);
  creatureCanvas.fillRect(ox + 5, 14, 14, 7, c.color);
  // Highlight
  creatureCanvas.drawCircle(ox + 9, 10, 3, c.accent);
  // Eyes
  creatureCanvas.fillRect(ox + 8, 12, 2, 3, c.eye);
  creatureCanvas.fillRect(ox + 14, 12, 2, 3, c.eye);
  creatureCanvas.setPixel(ox + 8, 12, '#ffffff');
  creatureCanvas.setPixel(ox + 14, 12, '#ffffff');

  // Specific features
  if (c.name === 'ember') {
    // Flame tip
    creatureCanvas.fillRect(ox + 11, 4, 2, 4, '#ffdd55');
  } else if (c.name === 'byte-bug') {
    // Antennae
    creatureCanvas.setPixel(ox + 7, 5, c.accent);
    creatureCanvas.setPixel(ox + 8, 6, c.accent);
    creatureCanvas.setPixel(ox + 16, 5, c.accent);
    creatureCanvas.setPixel(ox + 15, 6, c.accent);
  } else if (c.name === 'forest') {
    // Leaf sprout
    creatureCanvas.fillRect(ox + 11, 3, 2, 4, '#64c852');
    creatureCanvas.fillRect(ox + 13, 2, 3, 2, '#88e477');
  }
});

// -------------------------------------------------------------
// 4. GENERATE GOLD COIN (32 x 32)
// -------------------------------------------------------------
console.log('Crafting Pixel Art Gold Coin...');
const coinCanvas = new PixelCanvas(32, 32);
coinCanvas.drawCircle(16, 17, 13, '#8e5917'); // Shadow
coinCanvas.drawCircle(16, 15, 13, '#cf8a1e'); // Dark rim
coinCanvas.drawCircle(16, 15, 12, '#f6ba28'); // Gold face
coinCanvas.drawCircle(16, 15, 9, '#ffe169'); // Inner embossed circle
// Center stylized code bracket '<>'
coinCanvas.fillRect(11, 14, 3, 2, '#b37719');
coinCanvas.fillRect(13, 12, 2, 2, '#b37719');
coinCanvas.fillRect(13, 16, 2, 2, '#b37719');

coinCanvas.fillRect(18, 14, 3, 2, '#b37719');
coinCanvas.fillRect(17, 12, 2, 2, '#b37719');
coinCanvas.fillRect(17, 16, 2, 2, '#b37719');

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

console.log('Original pixel art raw buffers exported.');

// -------------------------------------------------------------
// 5. PROCESS & COMPILE THROUGH LIBRESPRITE CLI
// Convert each to native .ase (LibreSprite project) and export to public!
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
  // Step A: LibreSprite creates .ase
  execFileSync(LIBRESPRITE_BIN, ['--batch', t.srcPng, '--save-as', t.aseFile], { stdio: 'inherit' });

  console.log(`Exporting ${t.name} from LibreSprite .ase to production PNG...`);
  // Step B: LibreSprite compiles .ase to game PNG
  execFileSync(LIBRESPRITE_BIN, ['--batch', t.aseFile, '--save-as', t.outPng], { stdio: 'inherit' });
}

console.log('ALL SPRITES AND SCENARIO SUCCESSFULLY GENERATED AND EXPORTED VIA LIBRESPRITE!');
