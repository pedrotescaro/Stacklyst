import { render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { PixelAvatar } from './PixelArt';
import { Portrait } from './Portrait';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';
import HAIRSTYLES from '../../lib/mundinho/hairstyles.json';

it('keeps the newest outfit available in the world and both portrait silhouettes', () => {
  const avatar = { ...DEFAULT_AVATAR, outfit: 11 };
  const { container, rerender } = render(
    <>
      <PixelAvatar avatar={avatar} />
      <Portrait avatar={avatar} name="Jogador" />
    </>
  );
  const worldOutfit = container.querySelector<HTMLElement>('[data-layer="outfit"]')!;
  const portraitOutfit = container.querySelector<HTMLElement>('[data-portrait-layer="outfit"]')!;
  expect(parseFloat(worldOutfit.style.backgroundPositionY)).toBeCloseTo(46.316, 3);
  expect(portraitOutfit.style.backgroundSize).toBe('2400% 100%');
  const masculineOutfitPosition = portraitOutfit.style.backgroundPosition;
  const masculineFacePosition =
    container.querySelector<HTMLElement>('[data-layer="body"]')!.style.backgroundPositionY;
  rerender(
    <>
      <PixelAvatar avatar={{ ...avatar, gender: 'feminine' }} />
      <Portrait avatar={{ ...avatar, gender: 'feminine' }} name="Jogador" />
    </>
  );
  expect(container.querySelector('[data-layer="outfit"]')).toHaveStyle({
    backgroundSize: '600% 9600%',
  });
  expect(container.querySelector('[data-portrait-layer="outfit"]')).toHaveStyle({
    backgroundPosition: '100% 0px',
  });
  expect(
    container.querySelector<HTMLElement>('[data-portrait-layer="outfit"]')!.style.backgroundPosition
  ).not.toBe(masculineOutfitPosition);
  expect(
    container.querySelector<HTMLElement>('[data-layer="body"]')!.style.backgroundPositionY
  ).not.toBe(masculineFacePosition);
});

it('changes both front and back hair layers when choosing another hairstyle', () => {
  const { container, rerender } = render(
    <>
      <PixelAvatar avatar={DEFAULT_AVATAR} />
      <Portrait avatar={DEFAULT_AVATAR} name="Jogador" />
    </>
  );
  const front = container.querySelector<HTMLElement>('[data-portrait-layer="hair"]')!.style
    .backgroundPosition;
  const back = container.querySelector<HTMLElement>('[data-portrait-layer="hair-back"]')!.style
    .backgroundPosition;
  const world =
    container.querySelector<HTMLElement>('[data-layer="hair"]')!.style.backgroundPositionY;
  rerender(
    <>
      <PixelAvatar avatar={{ ...DEFAULT_AVATAR, hair: 4 }} />
      <Portrait avatar={{ ...DEFAULT_AVATAR, hair: 4 }} name="Jogador" />
    </>
  );
  expect(
    container.querySelector<HTMLElement>('[data-portrait-layer="hair"]')!.style.backgroundPosition
  ).not.toBe(front);
  expect(
    container.querySelector<HTMLElement>('[data-portrait-layer="hair-back"]')!.style
      .backgroundPosition
  ).not.toBe(back);
  expect(
    container.querySelector<HTMLElement>('[data-layer="hair"]')!.style.backgroundPositionY
  ).not.toBe(world);
});

it('renders every new hairstyle at its own world and portrait atlas position', () => {
  const { container, rerender } = render(<span />);
  const positions = new Set<string>();
  for (const hair of [6, 7, 8]) {
    const avatar = { ...DEFAULT_AVATAR, hair, hairColor: 3, hairTint: '#2563eb' };
    rerender(
      <>
        <PixelAvatar avatar={avatar} direction="left" />
        <Portrait avatar={avatar} name="Jogador" />
      </>
    );
    const world = container.querySelector<HTMLElement>('[data-layer="hair"]')!;
    const front = container.querySelector<HTMLElement>('[data-portrait-layer="hair"]')!;
    const back = container.querySelector<HTMLElement>('[data-portrait-layer="hair-back"]')!;
    expect(world.style.backgroundSize).toBe(`600% ${HAIRSTYLES.length * 6 * 400}%`);
    expect(parseFloat(world.style.backgroundPositionY)).toBeCloseTo(
      (((hair * 6 + 3) * 4 + 3) / (HAIRSTYLES.length * 6 * 4 - 1)) * 100,
      4
    );
    expect(front.style.backgroundSize).toBe(`${HAIRSTYLES.length * 100}% 100%`);
    expect(parseFloat(front.style.backgroundPosition)).toBe((hair / (HAIRSTYLES.length - 1)) * 100);
    expect(back.style.backgroundPosition).toBe(front.style.backgroundPosition);
    expect(world.style.filter).toMatch(/^url\(["']?#hair-/);
    positions.add(front.style.backgroundPosition);
  }
  expect(positions.size).toBe(3);
});

it('places the swinging sword and hand above voluminous hair only during attacks', async () => {
  vi.stubGlobal('__MUNDINHO_ASSETS__', {
    'hero-hair-attack.png': '/loaded/hero-hair-attack.png',
    'hero-accessory-attack.png': '/loaded/hero-accessory-attack.png',
    'hero-eyes-attack.png': '/loaded/hero-eyes-attack.png',
    'hero-body-attack.png': '/loaded/hero-body-attack.png',
    'hero-outfit-attack.png': '/loaded/hero-outfit-attack.png',
    'hero-weapon-attack.png': '/loaded/hero-weapon-attack.png',
  });
  vi.stubGlobal(
    'Image',
    class {
      onload?: () => void;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
  );
  try {
    const { container, rerender } = render(
      <PixelAvatar avatar={{ ...DEFAULT_AVATAR, hair: 6, skin: 8 }} motion="attack" />
    );
    await waitFor(() => expect(container.querySelector('[data-layer="weapon"]')).not.toBeNull());
    const layers = Array.from(container.querySelectorAll<HTMLElement>('[data-layer]'));
    expect(layers.at(-1)?.dataset.layer).toBe('weapon');
    expect(layers.at(-1)?.style.backgroundImage).toContain('hero-weapon-attack.png');
    expect(layers.at(-1)?.style.backgroundPositionY).toBe(`${(32 / 35) * 100}%`);
    rerender(<PixelAvatar avatar={{ ...DEFAULT_AVATAR, hair: 6, skin: 8 }} />);
    expect(container.querySelector('[data-layer="weapon"]')).toBeNull();
  } finally {
    vi.unstubAllGlobals();
  }
});
