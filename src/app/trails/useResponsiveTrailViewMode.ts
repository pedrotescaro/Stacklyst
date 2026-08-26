import { useEffect, useState } from 'react';

export type TrailViewMode = 'map' | 'trail';

export const MOBILE_TRAIL_ONLY_QUERY = '(max-width: 767px)';

export function resolveTrailViewMode(viewMode: TrailViewMode, mobileTrailOnly: boolean) {
  return mobileTrailOnly ? 'trail' : viewMode;
}

export function useResponsiveTrailViewMode(viewMode: TrailViewMode) {
  const [mobileTrailOnly, setMobileTrailOnly] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_TRAIL_ONLY_QUERY);
    const syncViewportMode = () => setMobileTrailOnly(mediaQuery.matches);

    syncViewportMode();
    mediaQuery.addEventListener('change', syncViewportMode);
    return () => mediaQuery.removeEventListener('change', syncViewportMode);
  }, []);

  return resolveTrailViewMode(viewMode, mobileTrailOnly);
}
