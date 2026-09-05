const PENDING_MOVEMENT_KEY = 'stacklyst-trail-mascot-pending';
const MAX_PENDING_AGE_MS = 2 * 60 * 60 * 1000;

export interface PendingMascotMovement {
  progressKey: string;
  fromNodeKey: string;
  startedAt: number;
}

export function rememberTrailMascotDeparture(progressKey: string, fromNodeKey: string) {
  if (typeof window === 'undefined' || !fromNodeKey) return;

  try {
    const movement: PendingMascotMovement = {
      progressKey,
      fromNodeKey,
      startedAt: Date.now(),
    };
    window.sessionStorage.setItem(PENDING_MOVEMENT_KEY, JSON.stringify(movement));
  } catch {
    // Storage may be unavailable in private browsing or embedded contexts.
  }
}

export function readPendingTrailMascotMovement(progressKey: string) {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_MOVEMENT_KEY);
    if (!raw) return null;

    const movement = JSON.parse(raw) as Partial<PendingMascotMovement>;
    const valid =
      movement.progressKey === progressKey &&
      typeof movement.fromNodeKey === 'string' &&
      typeof movement.startedAt === 'number' &&
      Date.now() - movement.startedAt <= MAX_PENDING_AGE_MS;

    if (!valid) {
      window.sessionStorage.removeItem(PENDING_MOVEMENT_KEY);
      return null;
    }

    return movement as PendingMascotMovement;
  } catch {
    return null;
  }
}

export function clearPendingTrailMascotMovement() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(PENDING_MOVEMENT_KEY);
  } catch {
    // Storage may be unavailable in private browsing or embedded contexts.
  }
}
