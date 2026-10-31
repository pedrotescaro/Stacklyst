import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PixelAvatar } from './PixelArt';
import { Portrait } from './Portrait';
import { DEFAULT_AVATAR } from '../../lib/mundinho/types';

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
  expect(parseFloat(worldOutfit.style.backgroundPositionY)).toBeCloseTo(93.617, 3);
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
    backgroundSize: '800% 4800%',
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
