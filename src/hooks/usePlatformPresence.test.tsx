import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePlatformPresence } from './usePlatformPresence';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe('Public online count', () => {
  it('preserves a genuine zero, then clears it when the refresh is unavailable', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          activeCount: 0,
          avatars: [],
          observedAt: new Date().toISOString(),
          activeWindowSeconds: 60,
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetch);
    const { result } = renderHook(() => usePlatformPresence());
    await waitFor(() => expect(result.current.summary?.activeCount).toBe(0));
    act(() => window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(result.current.unavailable).toBe(true));
    expect(result.current.summary).toBeNull();
  });
  it('aborts an in-flight request on unmount', async () => {
    const fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetch);
    const { unmount } = renderHook(() => usePlatformPresence());
    const signal = fetch.mock.calls[0][1].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
