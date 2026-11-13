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
      ['body', 'outfit', 'weapon'].map((layer) => [
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
  expect(body().style.backgroundImage).toContain('hero-body.png');
  expect(container.querySelector('.sprite-idle')).not.toBeNull();
  await act(async () => {
    await PendingImage.images[0].onload?.();
    await PendingImage.images[1].onload?.();
  });
  expect(body().style.backgroundImage).toContain('hero-body.png');
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
  expect(PendingImage.images.every((image) => image.decode.mock.calls.length === 1)).toBe(true);
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
  ).toContain('hero-outfit.png');
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
  expect(PendingImage.images).toHaveLength(3);
});
