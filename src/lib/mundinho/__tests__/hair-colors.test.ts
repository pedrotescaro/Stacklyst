import { describe, expect, it } from 'vitest';
import { DEFAULT_AVATAR } from '../types';
import {
  avatarHairColor,
  hairColorTransfer,
  LEGACY_HAIR_COLORS,
  withAvatarHairColor,
} from '../hair-colors';

describe('expanded avatar hair palette', () => {
  it('preserves the original six indices and removes tint when returning to a preset', () => {
    for (const [index, color] of LEGACY_HAIR_COLORS.entries()) {
      expect(avatarHairColor({ ...DEFAULT_AVATAR, hairColor: index })).toBe(color);
      expect(withAvatarHairColor({ ...DEFAULT_AVATAR, hairTint: '#2563eb' }, color)).toEqual({
        ...DEFAULT_AVATAR,
        hairColor: index,
      });
    }
  });
  it('stores extra colors independently of hairstyle and other avatar parts', () => {
    const avatar = { ...DEFAULT_AVATAR, hair: 4, skin: 7, outfit: 2 };
    const updated = withAvatarHairColor(avatar, '#93C5FD');
    expect(updated).toEqual({ ...avatar, hairColor: 3, hairTint: '#93c5fd' });
    expect(avatarHairColor(updated)).toBe('#93c5fd');
    expect(avatar).not.toHaveProperty('hairTint');
  });
  it('maps silver base/highlight/shadow to the selected color and keeps outline pixels', () => {
    const transfer = hairColorTransfer('#2563eb').map((values) => values.split(' ').map(Number));
    const target = [37, 99, 235],
      source = [220, 216, 212];
    for (let channel = 0; channel < 3; channel++) {
      expect(Math.round(transfer[channel][source[channel]] * 255)).toBe(target[channel]);
      expect(Math.round(transfer[channel][source[channel] - 20] * 255)).toBe(
        Math.max(0, target[channel] - 20)
      );
      expect(Math.round(transfer[channel][source[channel] + 25] * 255)).toBe(
        Math.min(255, target[channel] + 25)
      );
      expect(Math.round(transfer[channel][20] * 255)).toBe(20);
    }
  });
  it('rejects invalid tints and safely renders legacy data', () => {
    expect(() => withAvatarHairColor(DEFAULT_AVATAR, 'url(script)')).toThrow();
    expect(() => hairColorTransfer('red')).toThrow();
    expect(avatarHairColor({ ...DEFAULT_AVATAR, hairTint: 'invalid' })).toBe(LEGACY_HAIR_COLORS[0]);
  });
});
