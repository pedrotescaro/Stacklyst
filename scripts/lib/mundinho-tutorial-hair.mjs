import { canvas } from './mundinho-pixel-art.mjs';

/**
 * Hair variants are small additions to the tutorial player's actual hair mask.
 * `head` bounds the two brown source colors after the frame has been positioned
 * in its 48px cell. Style 0 is deliberately an exact copy of the source layer.
 * Other styles keep the source fringe and leave the central face opening intact.
 */
export function styleTutorialHair({ data, style, direction, head, shade }) {
  const result = Buffer.from(data);
  if (!style || style < 0 || style > 8 || !head?.w || !head?.h) return result;
  const c = canvas(48, 48);
  c.data.set(result);
  const ink = '#0c0c0c';
  const counts = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const hex = `#${Buffer.from(data.subarray(i, i + 3)).toString('hex')}`;
    if (hex !== ink) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  const tones = [...counts].sort((a, b) => b[1] - a[1]).map(([color]) => color);
  const base = tones[0] ?? '#34181a';
  const dark = tones[1] ?? shade(base, -15);
  const light = shade(base, 11);
  const { x: left, y: top, w, h } = head;
  const right = left + w - 1;
  const bottom = top + h - 1;
  const mid = Math.floor((left + right) / 2);
  const side = direction === 1 || direction === 3;
  const back = direction === 2;
  const facing = direction === 3 ? -1 : 1;
  const rear = facing === 1 ? left : right;
  const px = (x, y, color) => c.pixel(x, y, color);
  const rect = (x, y, width, height, color) => c.rect(x, y, width, height, color);
  const poly = (points, color) => c.polygon(points, color);
  const clump = (x, y, size = 3) => {
    rect(x + 1, y, size - 2, size, ink);
    rect(x, y + 1, size, size - 2, ink);
    rect(x + 1, y + 1, size - 2, size - 2, base);
    px(x + 1, y + 1, light);
  };
  // A strand grows outside the face opening. Its stepped tip remains above the
  // feet even on the tutorial's lowest crouched frame.
  const strand = (x, length, outward = -1) => {
    const y = top + Math.max(3, Math.floor(h / 2));
    const end = Math.min(37, bottom + length);
    poly(
      [
        [x, y],
        [x + 2, y],
        [x + 2, end - 1],
        [x + 1 + outward, end],
        [x - 1, end - 1],
      ],
      ink
    );
    rect(x, y + 1, 2, Math.max(1, end - y - 1), dark);
    rect(x, y + 1, 1, Math.max(1, end - y - 2), base);
  };

  if (style === 1) {
    // A rounded bob with a short, blunt lower edge and a clean side part.
    if (!side || back) {
      strand(left - 1, 1);
      strand(right - 1, 1, 1);
    } else strand(rear - 1, 1, -facing);
    rect(mid - 2, top + 1, 3, 1, light);
    if (back) {
      rect(left + 1, bottom - 1, w - 2, 2, dark);
      rect(left + 2, bottom, w - 4, 1, base);
    }
  } else if (style === 2) {
    // Feathered tufts: a low crown curl and two crisp side points.
    poly(
      [
        [mid - 3, top + 1],
        [mid - 2, top - 2],
        [mid, top],
        [mid + 1, top - 1],
        [mid + 2, top + 2],
      ],
      ink
    );
    px(mid - 2, top, base);
    px(mid - 1, top + 1, light);
    poly(
      [
        [left, top + 4],
        [left - 2, top + 6],
        [left, top + 7],
        [left + 1, top + 5],
      ],
      ink
    );
    px(left - 1, top + 6, base);
    if (!side || facing === -1) {
      poly(
        [
          [right - 1, top + 3],
          [right + 2, top + 5],
          [right, top + 6],
        ],
        ink
      );
      px(right, top + 5, base);
    }
  } else if (style === 3) {
    // Three compact crown spikes, preserving the rounded source head underneath.
    for (const [x, rise] of [
      [mid - 3, 2],
      [mid, 3],
      [mid + 3, 2],
    ]) {
      poly(
        [
          [x - 2, top + 2],
          [x, top - rise],
          [x + 2, top + 2],
        ],
        ink
      );
      poly(
        [
          [x - 1, top + 1],
          [x, top - rise + 1],
          [x + 1, top + 1],
        ],
        base
      );
      px(x, top, light);
    }
    if (side) {
      poly(
        [
          [rear, top + 3],
          [rear - facing * 3, top + 4],
          [rear, top + 6],
        ],
        ink
      );
      px(rear - facing, top + 4, base);
    }
  } else if (style === 4) {
    // Long part: two slim curtains around the face, joined only in the rear view.
    if (!side) {
      strand(left - 1, 3);
      strand(right - 1, 3, 1);
      if (back) {
        rect(left, bottom - 1, w, 4, ink);
        rect(left + 1, bottom - 1, w - 2, 3, dark);
        rect(left + 2, bottom - 2, 2, 4, base);
        rect(right - 3, bottom - 2, 2, 4, base);
      }
    } else {
      strand(rear - 1, 3, -facing);
      rect(rear - (facing === 1 ? 0 : 1), top + 4, 1, Math.max(2, h - 3), light);
    }
    rect(mid, top + 1, 1, 3, dark);
  } else if (style === 5) {
    // Tied ponytail hangs behind the skull, away from the forward-facing eye.
    const x = side ? rear - facing * 2 : back ? mid + 2 : right + 1;
    const y = top + 3;
    const dx = side ? -facing : 1;
    poly(
      [
        [x, y],
        [x + dx * 2, y + 1],
        [x + dx * 3, y + 4],
        [x + dx * 2, y + 7],
        [x, y + 9],
        [x + dx, y + 5],
      ],
      ink
    );
    for (let j = 2; j <= 6; j++) px(x + dx, y + j, j < 4 ? base : dark);
    px(x, y + 1, '#ce0c39');
    px(x + dx, y + 2, light);
  } else if (style === 6) {
    // Rounded curls read at native resolution rather than becoming noisy strands.
    for (const x of [left, mid - 1, right - 2]) clump(x, top - 2, 4);
    clump(left - 3, top + 2, 4);
    clump(left - 2, top + 5, 4);
    if (!side || facing === -1) {
      clump(right, top + 2, 4);
      clump(right - 1, top + 5, 4);
    }
    if (back) {
      clump(left + 1, bottom - 2, 4);
      clump(right - 4, bottom - 2, 4);
    }
  } else if (style === 7) {
    // Two small buns share the original fringe and compact skull silhouette.
    if (side) {
      clump(rear - (facing === 1 ? 4 : 0), top, 5);
      clump(mid - 1, top - 2, 4);
    } else {
      clump(left - 3, top - 1, 5);
      clump(right - 1, top - 1, 5);
    }
  } else if (style === 8) {
    // Waves have alternating stepped edges with a short, separated lower tip.
    const wave = (x, sign) => {
      strand(x, 2, sign);
      clump(x - (sign < 0 ? 2 : 0), top + 4, 4);
      clump(x - (sign < 0 ? 1 : -1), top + 7, 4);
      px(x, bottom + 1, light);
    };
    if (!side) {
      wave(left - 1, -1);
      wave(right - 1, 1);
    } else wave(rear - 1, -facing);
    poly(
      [
        [mid - 3, top + 2],
        [mid - 1, top],
        [mid + 2, top + 1],
        [mid + 3, top + 3],
      ],
      light
    );
    if (back) {
      rect(mid - 2, bottom - 1, 2, 3, dark);
      px(mid, bottom + 1, base);
    }
  }
  return c.data;
}
