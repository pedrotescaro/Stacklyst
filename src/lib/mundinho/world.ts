import geometry from './geometry.json';
export const WORLD = { width: geometry.width, height: geometry.height, spawn: geometry.spawn };
export const PROP_GEOMETRY = geometry.props;
export const SCENERY = {
  ...geometry.scenery,
  objects: geometry.scenery.objects.map((object) => {
    const profile = geometry.scenery.profiles[object.id === 'cabin' ? 'cabin' : 'tree'];
    return {
      ...object,
      depth: object.y + profile.anchor.y,
      collision: {
        x: object.x + profile.footprint.x,
        y: object.y + profile.footprint.y,
        w: profile.footprint.w,
        h: profile.footprint.h,
      },
    };
  }),
};

export const WORLD_OBJECTS = [
  { id: 'guide', name: 'Ada (Guia)', x: 680, y: 230 },
  { id: 'sign', name: 'Placa de dicas', x: 470, y: 330 },
  { id: 'chest', name: 'Baú da clareira', x: 350, y: 405 },
  { id: 'boss', name: 'Fenda das Sombras', x: 126, y: 566 },
  { id: 'portal', name: 'Descer para a arena multiplayer', x: 600, y: 430 },
];

export const COLLISIONS = [
  ...geometry.obstacles,
  ...SCENERY.objects.map((object) => object.collision),
  ...WORLD_OBJECTS.flatMap((object) => {
    const profile =
      object.id === 'chest'
        ? PROP_GEOMETRY.chest
        : object.id === 'sign'
          ? PROP_GEOMETRY.signpost
          : undefined;
    if (!profile) return [];
    return [
      {
        x: object.x - profile.anchor.x + profile.footprint.x,
        y: object.y - profile.anchor.y + profile.footprint.y,
        w: profile.footprint.w,
        h: profile.footprint.h,
      },
    ];
  }),
];
export const worldDepth = (feetY: number) => Math.round(feetY * 10);
export function movementDirection(dx: number, dy: number, previous: string) {
  if (Math.hypot(dx, dy) < 0.08) return previous;
  return Math.abs(dy) >= Math.abs(dx) ? (dy > 0 ? 'down' : 'up') : dx > 0 ? 'right' : 'left';
}
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
  if (![x, y, dx, dy].every(Number.isFinite)) return { x, y };
  // Test the whole path so a long frame cannot skip a narrow trunk or sign.
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 4));
  let nx = x;
  let ny = y;
  for (let step = 0; step < steps; step++) {
    if (canWalk(nx + dx / steps, ny)) nx += dx / steps;
    if (canWalk(nx, ny + dy / steps)) ny += dy / steps;
  }
  return { x: nx, y: ny };
}

export function walkablePosition(position: { x: number; y: number }) {
  if (canWalk(position.x, position.y)) return position;
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) return WORLD.spawn;
  // Saved positions can land inside an object after its footprint is corrected.
  for (let radius = 4; radius <= 128; radius += 4) {
    for (let offset = -radius; offset <= radius; offset += 4) {
      for (const point of [
        { x: position.x + offset, y: position.y + radius },
        { x: position.x + offset, y: position.y - radius },
        { x: position.x + radius, y: position.y + offset },
        { x: position.x - radius, y: position.y + offset },
      ]) {
        if (canWalk(point.x, point.y)) return point;
      }
    }
  }
  return WORLD.spawn;
}
