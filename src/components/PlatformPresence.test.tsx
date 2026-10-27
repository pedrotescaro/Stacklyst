import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  unsubscribe: vi.fn(),
  auth: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: mocks.session, onAuthStateChange: mocks.auth } }),
}));
vi.mock('@/lib/supabase/env', () => ({ isSupabasePublicConfigured: () => true }));
import PlatformPresence from './PlatformPresence';
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.session.mockResolvedValue({ data: { session: { user: { id: 'verified' } } } });
  mocks.auth.mockReturnValue({ data: { subscription: { unsubscribe: mocks.unsubscribe } } });
  mocks.fetch.mockResolvedValue(new Response(null, { status: 204 }));
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe('Visible authenticated presence', () => {
  it('sends immediately, pauses when hidden, resumes and cancels on unmount', async () => {
    const { unmount } = render(<PlatformPresence />);
    await act(async () => {});
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await act(async () => {
      vi.advanceTimersByTime(40000);
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
  it('does not count anonymous visits or continue after logout', async () => {
    mocks.session.mockResolvedValue({ data: { session: null } });
    render(<PlatformPresence />);
    await act(async () => {});
    expect(mocks.fetch).not.toHaveBeenCalled();
    const callback = mocks.auth.mock.calls[0][0];
    await act(async () => {
      callback('SIGNED_IN', { user: { id: 'verified' } });
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    act(() => callback('SIGNED_OUT', null));
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
  });
});
