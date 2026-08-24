import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MOBILE_TRAIL_ONLY_QUERY,
  resolveTrailViewMode,
  useResponsiveTrailViewMode,
} from '@/app/trails/useResponsiveTrailViewMode';

function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();

  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: MOBILE_TRAIL_ONLY_QUERY,
    onchange: null,
    addEventListener: vi.fn((_event: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: () => void) =>
      listeners.delete(listener)
    ),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery)
  );

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      listeners.forEach((listener) => listener());
    },
  };
}

describe('useResponsiveTrailViewMode', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('always resolves the mobile experience to the trail', () => {
    expect(resolveTrailViewMode('map', true)).toBe('trail');
    expect(resolveTrailViewMode('trail', true)).toBe('trail');
  });

  it('preserves the chosen mode on desktop and adapts when the viewport changes', async () => {
    const viewport = installMatchMedia(false);
    const { result } = renderHook(() => useResponsiveTrailViewMode('map'));

    expect(result.current).toBe('map');

    act(() => viewport.setMatches(true));
    await waitFor(() => expect(result.current).toBe('trail'));

    act(() => viewport.setMatches(false));
    await waitFor(() => expect(result.current).toBe('map'));
  });
});
