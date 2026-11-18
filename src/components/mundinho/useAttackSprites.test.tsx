import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PixelAvatar } from './PixelArt';

class PendingImage {
  static images: PendingImage[] = [];
  onload?: () => Promise<void>;
  onerror?: () => void;
  src = '';
  decode = vi.fn().mockResolvedValue(undefined);
  constructor() {
    PendingImage.images.push(this);
  }
}

let revision = 0;
beforeEach(() => {
  PendingImage.images = [];
  vi.stubGlobal('Image', PendingImage);
  vi.stubGlobal(
    '__MUNDINHO_ASSETS__',
    Object.fromEntries(
      ['body', 'outfit', 'eyes', 'hair', 'accessory', 'weapon'].map((layer) => [
        `hero-${layer}-attack.png`,
        `/test-${++revision}/${layer}.png`,
      ])
    )
  );
});
afterEach(() => vi.unstubAllGlobals());

it('keeps a complete idle body until every attack layer is loaded and decoded', async () => {
  const { container } = render(<PixelAvatar motion="attack" />);
  const body = () => container.querySelector<HTMLElement>('[data-layer="body"]')!;
  expect(body().style.backgroundImage).toContain('hero-body-idle.png');
  expect(container.querySelector('.sprite-idle')).not.toBeNull();
  await act(async () => {
    await PendingImage.images[0].onload?.();
    await PendingImage.images[1].onload?.();
    await Promise.all(PendingImage.images.slice(3).map((image) => image.onload?.()));
  });
  expect(body().style.backgroundImage).toContain('hero-body-idle.png');
  expect(container.querySelector('[data-layer="weapon"]')).toBeNull();
  let finishDecode!: () => void;
  PendingImage.images[2].decode.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finishDecode = resolve;
      })
  );
  let loading!: Promise<void>;
  await act(async () => {
    loading = PendingImage.images[2].onload!();
  });
  expect(container.querySelector('.sprite-idle')).not.toBeNull();
  await act(async () => {
    finishDecode();
    await loading;
  });
  await waitFor(() => expect(container.querySelector('.sprite-attack')).not.toBeNull());
  expect(body().style.backgroundImage).toContain('/body.png');
  expect(container.querySelector('[data-layer="weapon"]')).not.toBeNull();
  expect(
    PendingImage.images.slice(0, 6).every((image) => image.decode.mock.calls.length === 1)
  ).toBe(true);
});

it('keeps the character visible if an attack image fails', async () => {
  const { container } = render(<PixelAvatar motion="attack" />);
  await act(async () => {
    await PendingImage.images[0].onload?.();
    PendingImage.images[1].onerror?.();
    await PendingImage.images[2].onload?.();
  });
  expect(container.querySelector('.sprite-idle')).not.toBeNull();
  expect(
    container.querySelector<HTMLElement>('[data-layer="outfit"]')!.style.backgroundImage
  ).toContain('hero-outfit-idle.png');
});

it('starts walking by revealing the already painted walking sheet', async () => {
  const { container, rerender } = render(<PixelAvatar walking={false} />);
  await act(async () => {
    await Promise.all(PendingImage.images.map((image) => image.onload?.()));
  });
  await waitFor(() =>
    expect(container.querySelector('[data-walking-ready="true"]')).not.toBeNull()
  );
  const idle = container.querySelector<HTMLElement>('[data-pose="idle"][data-layer="body"]')!;
  const walk = container.querySelector<HTMLElement>('[data-pose="walk"][data-layer="body"]')!;
  expect(walk.style.backgroundImage).toContain('hero-body.png');
  expect(idle).not.toHaveAttribute('data-standby');
  expect(walk).toHaveAttribute('data-standby');

  rerender(<PixelAvatar walking />);
  // Same nodes, same images: only visibility flips, so no sheet is decoded mid-step.
  expect(container.querySelector('[data-pose="idle"][data-layer="body"]')).toBe(idle);
  expect(container.querySelector('[data-pose="walk"][data-layer="body"]')).toBe(walk);
  expect(idle.style.backgroundImage).toContain('hero-body-idle.png');
  expect(idle).toHaveAttribute('data-standby');
  expect(walk).not.toHaveAttribute('data-standby');
});

it('reuses decoded layers when another character mounts', async () => {
  const first = render(<PixelAvatar />);
  await act(async () => {
    await Promise.all(PendingImage.images.map((image) => image.onload?.()));
  });
  await waitFor(() =>
    expect(first.container.querySelector('[data-attack-ready="true"]')).not.toBeNull()
  );
  first.unmount();
  const second = render(<PixelAvatar motion="attack" />);
  await waitFor(() => expect(second.container.querySelector('.sprite-attack')).not.toBeNull());
  expect(PendingImage.images.filter((image) => image.src.startsWith('/test-'))).toHaveLength(6);
});
