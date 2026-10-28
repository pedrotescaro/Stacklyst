import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeaderRefreshLogo } from '../HeaderRefreshLogo';
import { MobilePullToRefresh } from '../MobilePullToRefresh';
import { brandGeometry } from '@/lib/brand-geometry';

function touch(x: number, y: number) {
  return { clientX: x, clientY: y };
}
function setup(onRefresh = vi.fn().mockResolvedValue(undefined), disabled = false) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  const view = render(
    <>
      <HeaderRefreshLogo />
      <MobilePullToRefresh refreshing={false} disabled={disabled} onRefresh={onRefresh}>
        <div>Feed</div>
        <pre>code</pre>
      </MobilePullToRefresh>
    </>
  );
  return { ...view, onRefresh, feed: screen.getByText('Feed') };
}
afterEach(() => vi.restoreAllMocks());

describe('mobile pull to refresh', () => {
  it('shows progress with the real brand mark and refreshes once at the threshold', async () => {
    const { feed, container, onRefresh } = setup();
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    const move = new Event('touchmove', { bubbles: true, cancelable: true });
    Object.defineProperty(move, 'touches', { value: [touch(11, 52)] });
    fireEvent(feed, move);
    expect(move.defaultPrevented).toBe(true);
    expect(container.querySelector('clipPath rect')?.getAttribute('height')).toBe(
      String(brandGeometry.height / 2)
    );
    expect(container.querySelector('svg path')?.getAttribute('d')).toBe(brandGeometry.path);
    fireEvent.touchMove(feed, { touches: [touch(10, 100)] });
    fireEvent.touchEnd(feed, { touches: [] });
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
  });

  it('does not intercept horizontal scrolling, code or gestures away from the top', async () => {
    const { feed, onRefresh } = setup();
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    const move = new Event('touchmove', { bubbles: true, cancelable: true });
    Object.defineProperty(move, 'touches', { value: [touch(100, 30)] });
    fireEvent(feed, move);
    expect(move.defaultPrevented).toBe(false);
    fireEvent.touchEnd(feed, { touches: [] });
    const code = screen.getByText('code');
    fireEvent.touchStart(code, { touches: [touch(10, 10)] });
    fireEvent.touchMove(code, { touches: [touch(10, 110)] });
    fireEvent.touchEnd(code, { touches: [] });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 40 });
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 110)] });
    fireEvent.touchEnd(feed, { touches: [] });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('cancels short, multitouch and cancelled gestures and stays inactive on desktop', () => {
    const { feed, onRefresh } = setup();
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 40)] });
    fireEvent.touchEnd(feed, { touches: [] });
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 110), touch(20, 110)] });
    fireEvent.touchEnd(feed, { touches: [] });
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 110)] });
    fireEvent.touchCancel(feed);
    fireEvent.touchEnd(feed, { touches: [] });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 900 });
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 110)] });
    fireEvent.touchEnd(feed, { touches: [] });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('releases the gesture after a rejected refresh', async () => {
    const onRefresh = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    const { feed } = setup(onRefresh);
    const pull = () => {
      fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
      fireEvent.touchMove(feed, { touches: [touch(10, 110)] });
      fireEvent.touchEnd(feed, { touches: [] });
    };
    pull();
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('status')).toBeEmptyDOMElement());
    pull();
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(2));
  });

  it('does not refresh while disabled or while another refresh is in flight', async () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => {}));
    const { feed, rerender } = setup(onRefresh, true);
    const pull = () => {
      fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
      fireEvent.touchMove(feed, { touches: [touch(10, 110)] });
      fireEvent.touchEnd(feed, { touches: [] });
    };
    pull();
    expect(onRefresh).not.toHaveBeenCalled();
    rerender(
      <MobilePullToRefresh refreshing={false} onRefresh={onRefresh}>
        <div>Feed</div>
        <pre>code</pre>
      </MobilePullToRefresh>
    );
    const fresh = screen.getByText('Feed');
    fireEvent.touchStart(fresh, { touches: [touch(10, 10)] });
    fireEvent.touchMove(fresh, { touches: [touch(10, 110)] });
    fireEvent.touchEnd(fresh, { touches: [] });
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    pull();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('abandons a gesture that the browser can no longer cancel', async () => {
    const { feed, onRefresh } = setup();
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 40)] });
    const nativeMove = new Event('touchmove', { bubbles: true, cancelable: false });
    Object.defineProperty(nativeMove, 'touches', { value: [touch(10, 110)] });
    fireEvent(feed, nativeMove);
    fireEvent.touchEnd(feed, { touches: [] });
    expect(onRefresh).not.toHaveBeenCalled();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: -10 });
    fireEvent.touchStart(feed, { touches: [touch(10, 10)] });
    fireEvent.touchMove(feed, { touches: [touch(10, 110)] });
    fireEvent.touchEnd(feed, { touches: [] });
    await waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
  });
});
