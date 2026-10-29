export const WORLD = { width: 800, height: 512, spawn: { x: 240, y: 260 } };

// Scenery collision rectangles matching the LibreSprite pixel-art forest
export const COLLISIONS = [
  // Boundaries
  { x: 0, y: 0, w: 24, h: 512 }, // Left void border
  { x: 0, y: 0, w: 800, h: 20 }, // Top boundary
  { x: 0, y: 495, w: 800, h: 20 }, // Bottom boundary
  { x: 785, y: 0, w: 20, h: 512 }, // Right boundary

  // Wooden Cabin (x: 560, y: 40, w: 160, h: 110)
  { x: 555, y: 35, w: 170, h: 115 },

  // Pond / Lake (centered at x: 580, y: 420)
  { x: 470, y: 365, w: 220, h: 105 },

  // Dense border trees & stumps
  { x: 115, y: 115, w: 40, h: 45 },
  { x: 150, y: 40, w: 45, h: 45 },
  { x: 290, y: 30, w: 45, h: 45 },
  { x: 400, y: 40, w: 45, h: 45 },
  { x: 720, y: 160, w: 45, h: 45 },
  { x: 740, y: 270, w: 45, h: 45 },
  { x: 710, y: 400, w: 45, h: 45 },
  { x: 360, y: 420, w: 45, h: 45 },
  { x: 200, y: 430, w: 45, h: 45 },
  { x: 110, y: 350, w: 40, h: 45 },
  { x: 105, y: 460, w: 40, h: 45 },

  // Fences
  { x: 130, y: 74, w: 120, h: 12 },
  { x: 126, y: 80, w: 10, h: 70 },
  { x: 480, y: 134, w: 70, h: 12 },

  // Tree Stumps
  { x: 284, y: 316, w: 16, h: 12 },
  { x: 474, y: 266, w: 16, h: 12 },
];

export function canWalk(x: number, y: number) {
  return (
    x >= 28 &&
    y >= 24 &&
    x <= WORLD.width - 20 &&
    y <= WORLD.height - 24 &&
    !COLLISIONS.some((r) => x + 8 > r.x && x - 8 < r.x + r.w && y + 6 > r.y && y - 4 < r.y + r.h)
  );
}

export function movePlayer(x: number, y: number, dx: number, dy: number) {
  const nx = canWalk(x + dx, y) ? x + dx : x;
  const ny = canWalk(nx, y + dy) ? y + dy : y;
  return { x: nx, y: ny };
}

export const WORLD_OBJECTS = [
  { id: 'guide', name: 'Ada (Guia)', x: 535, y: 120 },
  { id: 'sign', name: 'Placa de dicas', x: 238, y: 226 },
  { id: 'chest', name: 'Baú da clareira', x: 448, y: 180 },
];
