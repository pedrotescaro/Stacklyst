import { canvas } from './mundinho-pixel-art.mjs';

/** Rounded, hand-authored 32px chibi hair, shared by every walk direction/frame. */
export function drawWorldHair({ style, color, side, back, left, shade }) {
  const c = canvas(32, 32);
  const ink = shade(color, -35);
  const shadow = shade(color, -18);
  const light = shade(color, 20);
  const gleam = shade(color, 29);
  const r = (x, y, w, h, col) => c.rect(left ? 32 - x - w : x, y, w, h, col);
  const rows = (y, spans, col) => spans.forEach(([x, end], i) => r(x, y + i, end - x + 1, 1, col));
  const poly = (points, col) =>
    c.polygon(
      points.map(([x, y]) => [left ? 31 - x : x, y]),
      col
    );

  // A stepped oval carries the skull in every view: no rectangular helmet or flat top.
  rows(
    1,
    [
      [12, 18],
      [10, 20],
      [8, 22],
      [7, 23],
      [6, 24],
      [6, 24],
      [5, 25],
      [5, 25],
      [6, 24],
    ],
    ink
  );
  rows(
    2,
    [
      [12, 18],
      [10, 20],
      [8, 22],
      [7, 23],
      [7, 23],
      [6, 24],
      [6, 24],
      [7, 23],
    ],
    color
  );
  poly(
    [
      [8, 5],
      [12, 3],
      [18, 3],
      [22, 5],
      [20, 6],
      [13, 5],
      [9, 7],
    ],
    light
  );
  r(11, 4, 5, 1, gleam);
  r(22, 6, 2, 3, shadow);

  if (back) {
    const bottoms = [15, 18, 16, 15, 22, 16];
    const bottom = bottoms[style];
    rows(
      10,
      [
        [6, 24],
        [7, 23],
        [7, 23],
        [8, 22],
        [9, 21],
        [11, 19],
      ],
      ink
    );
    rows(
      9,
      [
        [7, 23],
        [7, 23],
        [8, 22],
        [8, 22],
        [9, 21],
        [11, 19],
      ],
      color
    );
    if (style === 1 || style === 4) {
      poly(
        [
          [6, 8],
          [25, 8],
          [25, bottom - 5],
          [23, bottom - 1],
          [19, bottom],
          [11, bottom],
          [7, bottom - 2],
        ],
        ink
      );
      poly(
        [
          [7, 8],
          [24, 8],
          [23, bottom - 4],
          [21, bottom - 1],
          [11, bottom - 1],
          [8, bottom - 3],
        ],
        color
      );
      r(8, 9, 1, bottom - 11, light);
      r(21, 9, 2, bottom - 11, shadow);
      r(13, bottom - 2, 6, 1, shadow);
    }
    if (style === 2) {
      for (const [x, y] of [
        [6, 9],
        [7, 13],
        [12, 14],
        [19, 13],
        [23, 10],
      ]) {
        r(x, y, 3, 2, ink);
        r(x, y, 2, 1, color);
      }
      r(10, 9, 3, 1, light);
      r(16, 11, 3, 1, shadow);
    }
    if (style === 3) {
      poly(
        [
          [6, 8],
          [4, 9],
          [7, 11],
          [6, 13],
          [9, 13],
          [10, 15],
          [14, 15],
          [10, 12],
        ],
        ink
      );
      r(6, 9, 3, 1, color);
      r(8, 12, 3, 1, shadow);
    }
    if (style === 5) {
      poly(
        [
          [23, 6],
          [27, 6],
          [29, 9],
          [29, 13],
          [27, 17],
          [25, 19],
          [24, 18],
          [26, 13],
          [25, 9],
        ],
        ink
      );
      poly(
        [
          [24, 7],
          [27, 7],
          [28, 10],
          [27, 14],
          [25, 17],
          [26, 11],
        ],
        color
      );
      r(26, 8, 1, 4, light);
      r(23, 7, 2, 2, '#d4ad75');
    }
    r(9, 8, 1, 3, light);
    r(18, 9, 2, 3, shadow);
    r(12, 13, 7, 1, shadow);
  } else if (side) {
    // Full, round occiput; a single swept point ends above the visible eye.
    rows(
      9,
      [
        [6, 18],
        [6, 17],
        [7, 16],
        [7, 15],
        [8, 14],
        [9, 12],
      ],
      ink
    );
    rows(
      8,
      [
        [7, 21],
        [7, 19],
        [7, 17],
        [8, 16],
        [8, 14],
        [9, 12],
      ],
      color
    );
    poly(
      [
        [18, 6],
        [24, 7],
        [23, 8],
        [21, 9],
        [20, 10],
        [18, 9],
        [16, 10],
        [16, 8],
      ],
      shadow
    );
    r(17, 8, 3, 1, color);
    r(18, 9, 1, 1, color);
    r(15, 9, 2, 3, shadow);
    r(8, 8, 2, 3, light);
    if (style === 1 || style === 4) {
      const end = style === 4 ? 21 : 16;
      poly(
        [
          [6, 7],
          [16, 10],
          [16, end - 2],
          [13, end],
          [9, end],
          [7, end - 3],
        ],
        ink
      );
      poly(
        [
          [7, 8],
          [15, 10],
          [14, end - 2],
          [11, end - 1],
          [8, end - 3],
        ],
        color
      );
      r(8, 10, 1, end - 12, light);
      r(14, 12, 1, end - 13, shadow);
    }
    if (style === 2) {
      r(6, 8, 2, 2, color);
      r(6, 12, 2, 2, ink);
      r(7, 12, 2, 1, color);
      r(10, 14, 3, 2, shadow);
      r(10, 9, 2, 1, light);
    }
    if (style === 3) {
      poly(
        [
          [13, 2],
          [13, 0],
          [17, 2],
          [21, 2],
          [20, 4],
        ],
        ink
      );
      r(14, 2, 4, 1, light);
      poly(
        [
          [7, 7],
          [4, 9],
          [6, 11],
          [5, 12],
          [8, 13],
          [11, 13],
        ],
        ink
      );
      r(6, 9, 3, 1, color);
    }
    if (style === 5) {
      poly(
        [
          [7, 6],
          [4, 7],
          [3, 11],
          [4, 15],
          [7, 18],
          [8, 17],
          [6, 13],
          [7, 9],
        ],
        ink
      );
      poly(
        [
          [6, 7],
          [4, 10],
          [5, 14],
          [7, 16],
          [6, 11],
        ],
        color
      );
      r(4, 9, 1, 3, light);
      r(7, 7, 2, 2, '#d4ad75');
    }
  } else {
    // Both eyes remain readable under three distinct, downward-tapered locks.
    rows(
      9,
      [
        [6, 8],
        [6, 8],
        [7, 8],
        [7, 8],
      ],
      ink
    );
    rows(
      9,
      [
        [23, 24],
        [23, 24],
        [23, 23],
        [22, 23],
      ],
      ink
    );
    r(7, 8, 2, 3, color);
    r(22, 8, 2, 3, shadow);
    if (style === 0) {
      poly(
        [
          [8, 6],
          [16, 6],
          [14, 8],
          [12, 8],
          [11, 10],
          [9, 9],
        ],
        color
      );
      poly(
        [
          [15, 6],
          [22, 7],
          [21, 9],
          [18, 9],
          [17, 11],
          [15, 9],
        ],
        color
      );
      r(12, 7, 2, 1, light);
      r(19, 8, 2, 1, shadow);
    } else if (style === 1) {
      r(9, 7, 13, 2, color);
      r(13, 9, 4, 1, color);
      poly(
        [
          [6, 7],
          [9, 9],
          [9, 15],
          [11, 16],
          [9, 17],
          [6, 15],
        ],
        ink
      );
      poly(
        [
          [23, 8],
          [25, 8],
          [25, 15],
          [22, 17],
          [20, 16],
          [22, 14],
        ],
        ink
      );
      r(7, 9, 1, 6, light);
      r(8, 13, 1, 3, color);
      r(23, 10, 1, 5, shadow);
      r(12, 7, 4, 1, light);
    } else if (style === 2) {
      for (const [x, y] of [
        [7, 5],
        [10, 3],
        [15, 3],
        [20, 5],
        [9, 7],
        [14, 7],
        [19, 7],
      ]) {
        r(x, y, 3, 2, color);
        r(x, y, 2, 1, light);
      }
      r(7, 11, 2, 3, color);
      r(23, 11, 2, 3, shadow);
      r(13, 9, 2, 1, color);
    } else if (style === 3) {
      poly(
        [
          [8, 4],
          [5, 4],
          [8, 2],
          [12, 2],
          [11, 0],
          [16, 2],
          [20, 1],
          [21, 3],
          [25, 4],
          [23, 6],
        ],
        ink
      );
      poly(
        [
          [8, 4],
          [11, 3],
          [16, 4],
          [20, 3],
          [22, 5],
          [15, 6],
        ],
        color
      );
      poly(
        [
          [8, 6],
          [13, 6],
          [12, 8],
          [10, 10],
          [9, 9],
        ],
        color
      );
      poly(
        [
          [13, 6],
          [20, 6],
          [19, 8],
          [17, 10],
          [15, 8],
          [14, 10],
        ],
        color
      );
      r(11, 4, 3, 1, light);
      r(20, 7, 2, 2, shadow);
    } else if (style === 4) {
      for (const x of [6, 23]) {
        poly(
          [
            [x, 7],
            [x + 2, 8],
            [x + 2, 17],
            [x + 3, 20],
            [x + 1, 22],
            [x, 20],
          ],
          ink
        );
        r(x + 1, 10, 1, 9, x < 15 ? light : shadow);
      }
      poly(
        [
          [9, 6],
          [15, 6],
          [13, 8],
          [11, 10],
          [10, 9],
        ],
        color
      );
      poly(
        [
          [16, 6],
          [22, 7],
          [21, 9],
          [19, 10],
          [18, 8],
        ],
        color
      );
    } else {
      poly(
        [
          [9, 6],
          [21, 6],
          [18, 8],
          [15, 9],
          [13, 10],
          [10, 9],
        ],
        color
      );
      r(12, 7, 5, 1, light);
      poly(
        [
          [24, 6],
          [27, 6],
          [29, 9],
          [28, 14],
          [26, 18],
          [24, 19],
          [25, 14],
          [25, 9],
        ],
        ink
      );
      poly(
        [
          [25, 7],
          [27, 8],
          [27, 12],
          [25, 16],
          [26, 10],
        ],
        color
      );
      r(26, 8, 1, 3, light);
      r(23, 7, 2, 2, '#d4ad75');
    }
  }
  return c.data;
}
