import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SiteEntryLoader, {
  SITE_ENTRY_DURATION_MS as ENTRY,
  SITE_ENTRY_EXIT_FALLBACK_MS as EXIT,
} from './SiteEntryLoader';

function advance(milliseconds: number) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

function transitionEnd(element: Element, propertyName = 'opacity') {
  fireEvent(
    element,
    Object.assign(new Event('transitionend', { bubbles: true }), { propertyName })
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false }))
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Site entry completion', () => {
  it('waits for the exiting root opacity transition, ignoring earlier and child events', () => {
    const onComplete = vi.fn();
    render(<SiteEntryLoader onComplete={onComplete} />);
    const loader = screen.getByTestId('site-entry-loader');

    transitionEnd(loader);
    expect(onComplete).not.toHaveBeenCalled();
    advance(ENTRY);
    transitionEnd(screen.getByRole('status'));
    transitionEnd(loader, 'transform');
    advance(EXIT - 80);
    expect(onComplete).not.toHaveBeenCalled();

    transitionEnd(loader);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('completes once even if the fallback and another transition follow', () => {
    const onComplete = vi.fn();
    render(<SiteEntryLoader onComplete={onComplete} />);
    advance(ENTRY);
    transitionEnd(screen.getByTestId('site-entry-loader'));
    advance(EXIT);
    transitionEnd(screen.getByTestId('site-entry-loader'));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('recovers when the exit transition is interrupted and emits no event', () => {
    const onComplete = vi.fn();
    render(<SiteEntryLoader onComplete={onComplete} />);
    advance(ENTRY);
    advance(EXIT - 1);
    expect(onComplete).not.toHaveBeenCalled();
    advance(1);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it.each([0, ENTRY])('cancels pending completion when unmounted at %ims', (elapsed) => {
    const onComplete = vi.fn();
    const { unmount } = render(<SiteEntryLoader onComplete={onComplete} />);
    advance(elapsed);
    unmount();
    act(() => vi.runAllTimers());
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('uses the short fallback for reduced motion without waiting through the formation', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true }))
    );
    const onComplete = vi.fn();
    render(<SiteEntryLoader onComplete={onComplete} />);
    advance(0);
    advance(159);
    expect(onComplete).not.toHaveBeenCalled();
    advance(1);
    transitionEnd(screen.getByTestId('site-entry-loader'));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
