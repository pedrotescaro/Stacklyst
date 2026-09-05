export interface TrailPoint {
  x: number;
  y: number;
}

export interface SmoothTrailPath {
  readonly totalLength: number;
  getPointAtLength(distance: number): TrailPoint;
}

const DEFAULT_SAMPLES_PER_SEGMENT = 24;

function distanceBetween(a: TrailPoint, b: TrailPoint) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function catmullRomPoint(
  p0: TrailPoint,
  p1: TrailPoint,
  p2: TrailPoint,
  p3: TrailPoint,
  progress: number
): TrailPoint {
  const progressSquared = progress * progress;
  const progressCubed = progressSquared * progress;

  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * progress +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * progressSquared +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * progressCubed),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * progress +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * progressSquared +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * progressCubed),
  };
}

function sampleSmoothPoints(points: readonly TrailPoint[], samplesPerSegment: number) {
  if (points.length <= 1) return [...points];
  if (points.length === 2) return [...points];

  const samples: TrailPoint[] = [points[0]!];

  for (let segment = 0; segment < points.length - 1; segment += 1) {
    const p0 = points[Math.max(0, segment - 1)]!;
    const p1 = points[segment]!;
    const p2 = points[segment + 1]!;
    const p3 = points[Math.min(points.length - 1, segment + 2)]!;

    for (let sample = 1; sample <= samplesPerSegment; sample += 1) {
      samples.push(catmullRomPoint(p0, p1, p2, p3, sample / samplesPerSegment));
    }
  }

  return samples;
}

export function createSmoothTrailPath(
  points: readonly TrailPoint[],
  samplesPerSegment = DEFAULT_SAMPLES_PER_SEGMENT
): SmoothTrailPath {
  const safePoints = points.length > 0 ? points : [{ x: 0, y: 0 }];
  const samples = sampleSmoothPoints(safePoints, Math.max(4, samplesPerSegment));
  const cumulativeLengths = [0];

  for (let index = 1; index < samples.length; index += 1) {
    cumulativeLengths.push(
      cumulativeLengths[index - 1]! + distanceBetween(samples[index - 1]!, samples[index]!)
    );
  }

  const totalLength = cumulativeLengths.at(-1) ?? 0;

  return {
    totalLength,
    getPointAtLength(distance) {
      if (samples.length === 1 || totalLength === 0) return { ...samples[0]! };

      const boundedDistance = Math.min(totalLength, Math.max(0, distance));
      let low = 0;
      let high = cumulativeLengths.length - 1;

      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (cumulativeLengths[middle]! < boundedDistance) low = middle + 1;
        else high = middle;
      }

      const upperIndex = Math.max(1, low);
      const lowerIndex = upperIndex - 1;
      const lowerDistance = cumulativeLengths[lowerIndex]!;
      const upperDistance = cumulativeLengths[upperIndex]!;
      const span = upperDistance - lowerDistance;
      const progress = span > 0 ? (boundedDistance - lowerDistance) / span : 0;
      const from = samples[lowerIndex]!;
      const to = samples[upperIndex]!;

      return {
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
      };
    },
  };
}
