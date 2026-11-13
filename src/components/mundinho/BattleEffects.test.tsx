import { render } from '@testing-library/react';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import effects from '../../lib/mundinho/combat-effects.json';
import { BattleEffects } from './BattleEffects';

describe('pixel combat sequences', () => {
  it('restarts the sequence when contact replaces the swing and uses the bundled native asset', () => {
    const scope = globalThis as typeof globalThis & {
      __MUNDINHO_ASSETS__?: Record<string, string>;
    };
    scope.__MUNDINHO_ASSETS__ = { [effects.file]: 'data:image/png;base64,c3ByaXRl' };
    try {
      const { container, rerender } = render(<BattleEffects kind="strike" stage="cast" />);
      const swing = container.querySelector<HTMLElement>('[data-sprite-sequence]')!;
      expect(swing.style.backgroundImage).toContain('data:image/png;base64,c3ByaXRl');
      expect(container.querySelector('svg, i')).toBeNull();
      rerender(<BattleEffects kind="strike" stage="impact" />);
      const contact = container.querySelector<HTMLElement>('[data-sprite-sequence]')!;
      expect(contact).not.toBe(swing);
      expect(contact.style.backgroundPositionY).not.toBe(swing.style.backgroundPositionY);
      expect(contact.style.getPropertyValue('--fx-duration')).toBe('450ms');
    } finally {
      delete scope.__MUNDINHO_ASSETS__;
    }
  });

  it('ships six distinct transparent frames in every attack, hit and recovery row', async () => {
    const image = sharp(`public/assets/mundinho/${effects.file}`);
    const metadata = await image.metadata();
    expect(metadata.width).toBe(effects.cell * effects.frames);
    expect(metadata.height).toBe(effects.cell * effects.rows);
    expect(metadata.hasAlpha).toBe(true);
    for (let row = 0; row < effects.rows; row++) {
      const states = [];
      for (let frame = 0; frame < effects.frames; frame++) {
        const pixels = await image
          .clone()
          .extract({
            left: frame * effects.cell,
            top: row * effects.cell,
            width: effects.cell,
            height: effects.cell,
          })
          .ensureAlpha()
          .raw()
          .toBuffer();
        const alpha = pixels.filter((_, index) => index % 4 === 3);
        expect(
          alpha.some((value) => value > 0),
          `row ${row}, frame ${frame} is blank`
        ).toBe(true);
        expect(
          alpha.some((value) => value === 0),
          `row ${row}, frame ${frame} lost alpha`
        ).toBe(true);
        states.push(pixels.toString('base64'));
      }
      expect(new Set(states).size, `row ${row} must animate independently`).toBe(effects.frames);
    }
  });
});
