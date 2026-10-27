import { describe, expect, it } from 'vitest';
import { avatarCropRect } from './avatar-photo';

describe('avatar photo framing', () => {
  it('centers landscape and portrait images without stretching', () => {
    expect(avatarCropRect(1200, 800, 1, 50, 50)).toEqual({ x: 200, y: 0, size: 800 });
    expect(avatarCropRect(800, 1200, 1, 50, 50)).toEqual({ x: 0, y: 200, size: 800 });
  });
  it('keeps zoomed crops inside the image at both edges', () => {
    const topLeft = avatarCropRect(1200, 800, 2, 0, 0);
    const bottomRight = avatarCropRect(1200, 800, 2, 100, 100);
    expect(topLeft).toEqual({ x: 0, y: 0, size: 400 });
    expect(bottomRight).toEqual({ x: 800, y: 400, size: 400 });
    expect(bottomRight.x + bottomRight.size).toBe(1200);
    expect(bottomRight.y + bottomRight.size).toBe(800);
  });
  it('bounds invalid controls and rejects an invalid source size', () => {
    expect(avatarCropRect(600, 300, -1, -40, 200)).toEqual({ x: 0, y: 0, size: 300 });
    expect(avatarCropRect(600, 300, Number.NaN, Number.NaN, Number.NaN)).toEqual({
      x: 150,
      y: 0,
      size: 300,
    });
    expect(() => avatarCropRect(0, 300, 1, 50, 50)).toThrow('dimensões válidas');
  });
});
