const PENDING_MOVEMENT_KEY = 'stacklyst-trail-mascot-pending';
const MAX_PENDING_AGE_MS = 2 * 60 * 60 * 1000;

export interface PendingMascotMovement {
  progressKey: string;
  fromNodeKey: string;
  startedAt: number;
}

export function getTrailMascotProgressKey(returnHref: string | undefined) {
  if (!returnHref) return null;

  try {
    const url = new URL(returnHref, 'https://stacklyst.local');
    const path = url.searchParams.get('path');
    const language = url.searchParams.get('language');

    if (
      url.origin !== 'https://stacklyst.local' ||
      url.pathname !== '/trails' ||
      !path ||
      !/^[a-z0-9-]+$/.test(path) ||
      !language ||
      !/^(JS|TS|PYTHON|RUST|GO|JAVA)$/.test(language)
    ) {
      return null;
    }

    return `${language.toLowerCase()}:${path}`;
  } catch {
    return null;
  }
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

export function rememberTrailMascotReturn(returnHref: string | undefined, fromNodeKey: string) {
  const progressKey = getTrailMascotProgressKey(returnHref);
  if (progressKey) rememberTrailMascotDeparture(progressKey, fromNodeKey);
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
