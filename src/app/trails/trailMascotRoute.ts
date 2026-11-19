import {
  createPolylineTrailPath,
  createSmoothTrailPath,
  type SmoothTrailPath,
  type TrailPoint,
} from './trailPath';

/**
 * Vertical share of the row gap held by each control point of the dotted map
 * connector (`M 0 0 C 0 b 100 1-b 100 100`). The mascot walks the same curve.
 */
export const JOURNEY_CONNECTOR_BEND = 0.65;

/** The mascot's feet sit at 88% of the sprite height (`translate(-50%, -88%)`). */
export const MASCOT_FOOT_ANCHOR = 0.88;

export interface MascotNodeBox {
  /** Node centre, in container coordinates. */
  cx: number;
  cy: number;
  halfWidth: number;
  halfHeight: number;
  /**
   * Map stops alternate sides and keep their label on the inner side, so the
   * mascot stands on the outer side. `null` for layouts without sides, where
   * the mascot keeps standing on top of the node.
   */
  side: 'left' | 'right' | null;
}

export interface MascotSpriteSize {
  width: number;
  height: number;
  /** Gap above the node for layouts without sides. */
  gap: number;
}

/** Where the mascot's feet rest while it idles at a node. */
export function mascotStandPoint(node: MascotNodeBox, sprite: MascotSpriteSize): TrailPoint {
  if (!node.side) {
    return {
      x: node.cx,
      y: node.cy - node.halfHeight - sprite.gap + sprite.height * MASCOT_FOOT_ANCHOR,
    };
  }
  const outward = node.side === 'left' ? -1 : 1;
  return {
    // Beside the node, slightly tucked in so it reads as standing next to it.
    x: node.cx + outward * (node.halfWidth + sprite.width / 2 - 4),
    y: node.cy + node.halfHeight - 6,
  };
}

function cubic(p0: TrailPoint, p1: TrailPoint, p2: TrailPoint, p3: TrailPoint, t: number) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function quadratic(p0: TrailPoint, control: TrailPoint, p1: TrailPoint, steps: number) {
  const points: TrailPoint[] = [];
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    const u = 1 - t;
    points.push({
      x: u * u * p0.x + 2 * u * t * control.x + t * t * p1.x,
      y: u * u * p0.y + 2 * u * t * control.y + t * t * p1.y,
    });
  }
  return points;
}

/** Points along the dotted connectors joining consecutive node centres. */
function sampleConnectors(boxes: readonly MascotNodeBox[], stepsPerRow: number) {
  const points: TrailPoint[] = [{ x: boxes[0]!.cx, y: boxes[0]!.cy }];
  for (let index = 0; index < boxes.length - 1; index += 1) {
    const from = { x: boxes[index]!.cx, y: boxes[index]!.cy };
    const to = { x: boxes[index + 1]!.cx, y: boxes[index + 1]!.cy };
    const rise = to.y - from.y;
    const c1 = { x: from.x, y: from.y + rise * JOURNEY_CONNECTOR_BEND };
    const c2 = { x: to.x, y: from.y + rise * (1 - JOURNEY_CONNECTOR_BEND) };
    for (let step = 1; step <= stepsPerRow; step += 1) {
      points.push(cubic(from, c1, c2, to, step / stepsPerRow));
    }
  }
  return points;
}

/**
 * Walking route from the first box to the last, through every box between.
 * On the map it steps out from beside the start node, follows the dotted
 * connector between rows and steps around the destination to stand beside
 * it, so the sprite never walks across labels.
 */
export function buildMascotRoute(
  boxes: readonly MascotNodeBox[],
  sprite: MascotSpriteSize
): SmoothTrailPath {
  if (boxes.length === 0) return createPolylineTrailPath([]);
  const first = boxes[0]!;
  const last = boxes.at(-1)!;
  const start = mascotStandPoint(first, sprite);
  const end = mascotStandPoint(last, sprite);
  if (boxes.length === 1) return createPolylineTrailPath([start, end]);

  if (boxes.some((box) => !box.side)) {
    return createSmoothTrailPath(boxes.map((box) => mascotStandPoint(box, sprite)));
  }

  const clearance = 14;
  const leaveY = first.cy + first.halfHeight + clearance;
  const arriveY = last.cy - last.halfHeight - clearance;
  const line = sampleConnectors(boxes, 48);
  const joinIndex = line.findIndex((point) => point.y >= leaveY);
  let exitIndex = -1;
  for (let index = line.length - 1; index >= 0; index -= 1) {
    if (line[index]!.y <= arriveY) {
      exitIndex = index;
      break;
    }
  }
  // Rows too close to have a stretch of connector: walk straight across.
  if (joinIndex < 0 || exitIndex < joinIndex) {
    return createSmoothTrailPath([start, end]);
  }

  const join = line[joinIndex]!;
  const exit = line[exitIndex]!;
  return createPolylineTrailPath([
    start,
    // Step down and in, under the start node, onto the connector.
    ...quadratic(start, { x: start.x, y: join.y }, join, 12),
    ...line.slice(joinIndex + 1, exitIndex + 1),
    // Leave the connector above the destination and come down its outer side.
    ...quadratic(exit, { x: end.x, y: exit.y }, end, 14),
  ]);
}
