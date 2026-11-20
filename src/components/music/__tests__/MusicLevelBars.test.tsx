import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MusicLevelBars } from '../MusicLevelBars';

const scales = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('span > span')].map((bar) =>
    Number(bar.style.transform.match(/scaleY\(([\d.]+)\)/)?.[1])
  );

afterEach(() => vi.unstubAllGlobals());

describe('MusicLevelBars', () => {
  it('rests low while paused', () => {
    const { container } = render(<MusicLevelBars playing={false} />);
    expect(scales(container)).toHaveLength(5);
    expect(scales(container).every((value) => value < 0.2)).toBe(true);
  });

  it('keeps moving while playing and stops the loop when paused', () => {
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback)
    );
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const { container, rerender } = render(<MusicLevelBars playing />);
    const seen = new Set<string>();
    act(() => {
      for (let step = 0; step < 40; step += 1) {
        now += 50;
        frames.shift()?.(now);
        seen.add(scales(container).join());
      }
    });
    expect(seen.size).toBeGreaterThan(10);
    expect(scales(container).every((value) => value >= 0.06 && value <= 1)).toBe(true);
    rerender(<MusicLevelBars playing={false} />);
    expect(cancel).toHaveBeenCalled();
    expect(scales(container).every((value) => value < 0.2)).toBe(true);
  });
});
