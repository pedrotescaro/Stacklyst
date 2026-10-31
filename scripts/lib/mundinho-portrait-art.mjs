import { canvas } from './mundinho-pixel-art.mjs';

/** Hand-authored, single-pixel contours for the LibreSprite portrait documents. */
export function createPortraitArt({ SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS }) {
  const make = () => canvas(96, 112);
  const poly = (c, p, color) => c.polygon(p, color);
  const shift = (hex, n) =>
    '#' +
    hex
      .slice(1)
      .match(/../g)
      .map((v) =>
        Math.max(0, Math.min(255, parseInt(v, 16) + n))
          .toString(16)
          .padStart(2, '0')
      )
      .join('');
  const contour = (c, points, color, close = true) => {
    for (let i = 1; i < points.length; i++) c.line(...points[i - 1], ...points[i], color);
    if (close) c.line(...points.at(-1), ...points[0], color);
  };
  function body(skin, female) {
    const c = make(),
      p = SKIN_PALETTES[skin];
    const shoulder = female ? 17 : 10;
    // Neck and shoulders remain aligned with every wardrobe and accessory layer.
    poly(
      c,
      [
        [shoulder, 112],
        [shoulder + 4, 87],
        [36, 79],
        [39, 65],
        [56, 65],
        [59, 79],
        [75 - shoulder + 17, 87],
        [96 - shoulder, 112],
      ],
      p.shadow
    );
    poly(
      c,
      [
        [40, 65],
        [55, 65],
        [55, 79],
        [63, 83],
        [48, 95],
        [33, 83],
        [40, 78],
      ],
      p.base
    );
    poly(
      c,
      [
        [40, 67],
        [55, 67],
        [55, 74],
        [49, 80],
        [40, 74],
      ],
      p.shadow
    );
    c.line(42, 78, 48, 83, p.highlight);
    for (const x of [27, 68]) {
      c.ellipse(x, 47, 3, 6, p.shadow);
      c.ellipse(x, 47, 2, 5, p.base);
      c.line(x, 46, x + 1, 49, p.deepShadow);
    }
    const face = female
      ? [
          [29, 25],
          [35, 19],
          [58, 19],
          [65, 25],
          [66, 47],
          [63, 58],
          [57, 66],
          [49, 72],
          [46, 72],
          [37, 66],
          [31, 58],
          [28, 46],
        ]
      : [
          [29, 24],
          [36, 18],
          [58, 18],
          [65, 24],
          [67, 46],
          [64, 58],
          [58, 67],
          [52, 72],
          [43, 72],
          [35, 66],
          [29, 57],
          [27, 46],
        ];
    poly(c, face, p.base);
    // Selective coloured outline: one pixel only, open across the lit forehead.
    contour(
      c,
      female
        ? [
            [66, 34],
            [66, 47],
            [63, 58],
            [57, 66],
            [49, 72],
            [46, 72],
            [37, 66],
            [31, 58],
            [28, 46],
            [28, 35],
          ]
        : [
            [66, 34],
            [67, 46],
            [64, 58],
            [58, 67],
            [52, 72],
            [43, 72],
            [35, 66],
            [29, 57],
            [27, 46],
            [28, 34],
          ],
      p.deepShadow,
      false
    );
    poly(
      c,
      [
        [61, 29],
        [64, 31],
        [65, 47],
        [62, 57],
        [56, 65],
        [49, 69],
        [45, 69],
        [50, 67],
        [58, 59],
        [61, 48],
      ],
      p.shadow
    );
    poly(
      c,
      [
        [31, 30],
        [36, 24],
        [48, 22],
        [56, 25],
        [54, 28],
        [37, 29],
        [31, 39],
      ],
      p.highlight
    );
    c.rect(32, 54, 5, 1, p.blush);
    c.rect(58, 54, 4, 1, p.blush);
    // Small anime nose and relaxed mouth replace the long rigid nose and lip box.
    c.pixel(48, 53, p.shadow);
    c.line(47, 55, 49, 55, p.shadow);
    c.pixel(46, 54, p.highlight);
    c.line(female ? 44 : 43, 62, 50, 62, female ? shift(p.deepShadow, 20) : p.deepShadow);
    c.pixel(51, 61, p.shadow);
    c.line(46, 64, 49, 64, p.highlight);
    if (female) c.pixel(44, 61, p.blush);
    return c;
  }

  function clothes(index, female) {
    const c = make(),
      p = OUTFIT_SPECS[index];
    const left = female ? 17 : 10,
      right = 96 - left;
    const kind = p.kind;
    const rim = shift(p.shadow, -12),
      light = shift(p.jacket, 24);
    const shape = [
      [left, 112],
      [left + 3, 89],
      [25, 83],
      [35, 78],
      [40, 80],
      [48, 86],
      [56, 80],
      [61, 78],
      [71, 83],
      [right - 3, 89],
      [right, 112],
    ];
    poly(c, shape, p.jacket);
    contour(
      c,
      [
        [left, 111],
        [left + 3, 89],
        [25, 83],
        [35, 78],
      ],
      rim,
      false
    );
    contour(
      c,
      [
        [61, 78],
        [71, 83],
        [right - 3, 89],
        [right, 111],
      ],
      rim,
      false
    );
    poly(
      c,
      [
        [left + 2, 111],
        [left + 6, 89],
        [31, 83],
        [31, 110],
      ],
      p.shadow
    );
    poly(
      c,
      [
        [66, 83],
        [right - 5, 89],
        [right - 2, 111],
        [66, 110],
      ],
      p.shadow
    );
    c.line(left + 8, 90, left + 5, 108, light);
    c.line(right - 8, 92, right - 5, 110, shift(p.shadow, 12));
    c.line(left + 16, 98, left + 16, 111, p.shadow);
    c.line(right - 16, 98, right - 16, 111, p.shadow);
    // Each cut has its own collar, fastening and construction rather than a tint.
    if (['jacket', 'tech', 'denim', 'cardigan', 'overcoat', 'ceremonial'].includes(kind)) {
      poly(
        c,
        [
          [38, 81],
          [48, 87],
          [58, 81],
          [56, 112],
          [40, 112],
        ],
        p.shirt
      );
      poly(
        c,
        [
          [35, 79],
          [44, 86],
          [38, 96],
          [31, 84],
        ],
        light
      );
      poly(
        c,
        [
          [61, 79],
          [52, 86],
          [58, 96],
          [66, 84],
        ],
        shift(p.jacket, 12)
      );
      c.line(38, 96, 37, 111, rim);
      c.line(58, 96, 59, 111, rim);
      if (kind === 'denim') {
        for (const x of [24, 62]) {
          c.rect(x, 94, 10, 8, p.shadow);
          c.line(x, 94, x + 9, 94, light);
          c.line(x + 1, 96, x + 8, 96, p.shirt);
        }
        for (let y = 91; y < 112; y += 6) c.pixel(58, y, '#e5d2a1');
      } else if (kind === 'cardigan') {
        // Fine knit trim and small pearl buttons, soft shoulders.
        c.line(38, 94, 39, 111, p.shirt);
        c.line(58, 94, 57, 111, p.shirt);
        for (let y = 97; y < 112; y += 6) c.pixel(59, y, '#f7e1dd');
        for (let x = 23; x < 33; x += 3) c.line(x, 106, x, 111, light);
      } else if (kind === 'overcoat') {
        poly(
          c,
          [
            [34, 79],
            [44, 85],
            [40, 93],
            [34, 100],
            [30, 84],
          ],
          p.shadow
        );
        poly(
          c,
          [
            [62, 79],
            [52, 85],
            [56, 93],
            [63, 100],
            [67, 84],
          ],
          light
        );
        for (const x of [42, 54]) for (let y = 101; y < 112; y += 7) c.rect(x, y, 2, 2, '#c3b997');
        c.line(23, 105, 33, 105, light);
        c.line(63, 105, 73, 105, p.shadow);
      } else if (kind === 'ceremonial') {
        c.line(34, 82, 38, 95, '#ffe9ad');
        c.line(62, 82, 58, 95, '#ffe9ad');
        for (let y = 97; y < 112; y += 5) c.rect(58, y, 2, 2, '#fff0bc');
        c.line(25, 85, 25, 102, '#fce7ab');
      } else if (kind === 'tech') {
        c.rect(left + 9, 91, 8, 2, p.shirt);
        c.pixel(left + 10, 91, '#e9fbff');
        c.line(right - 11, 91, right - 11, 107, p.shirt);
        c.rect(61, 102, 7, 4, p.shadow);
        c.line(62, 102, 67, 102, p.shirt);
      } else {
        c.line(22, 99, 32, 99, light);
        c.line(22, 100, 22, 105, p.shadow);
        c.line(64, 99, 73, 99, p.shadow);
        c.pixel(58, 101, '#d7cbc4');
      }
    } else if (kind === 'hoodie') {
      poly(
        c,
        [
          [32, 79],
          [39, 78],
          [48, 84],
          [57, 78],
          [64, 80],
          [68, 87],
          [61, 94],
          [55, 88],
          [48, 91],
          [40, 88],
          [34, 94],
          [28, 87],
        ],
        p.shadow
      );
      contour(
        c,
        [
          [32, 81],
          [30, 86],
          [35, 91],
          [41, 86],
          [48, 89],
          [55, 86],
          [61, 91],
          [66, 86],
          [63, 82],
        ],
        light,
        false
      );
      c.line(41, 88, 41, 101, p.shirt);
      c.line(55, 88, 55, 101, p.shirt);
      c.line(39, 103, 57, 103, p.shadow);
      c.line(39, 103, 36, 111, p.shadow);
      c.line(57, 103, 60, 111, p.shadow);
    } else if (kind === 'bomber') {
      c.line(36, 79, 41, 85, p.shadow);
      c.line(41, 85, 55, 85, p.shadow);
      c.line(55, 85, 61, 79, p.shadow);
      c.rect(45, 86, 5, 26, p.shirt);
      c.line(47, 86, 47, 111, rim);
      c.rect(left + 10, 92, 7, 7, p.shirt);
      c.rect(left + 11, 93, 5, 5, p.shadow);
      c.line(27, 103, 34, 100, rim);
      c.line(62, 100, 69, 103, rim);
      for (let x = 26; x < 72; x += 3) c.line(x, 108, x, 111, p.shadow);
    } else if (kind === 'sweater') {
      poly(
        c,
        [
          [35, 78],
          [41, 80],
          [48, 84],
          [55, 80],
          [61, 78],
          [60, 85],
          [54, 89],
          [42, 89],
          [36, 85],
        ],
        p.shadow
      );
      c.line(38, 82, 44, 86, p.shirt);
      c.line(44, 86, 52, 86, p.shirt);
      c.line(52, 86, 58, 82, p.shirt);
      for (let y = 95; y < 112; y += 5) c.line(32, y, 65, y, shift(p.jacket, 13));
      for (const x of [39, 48, 57]) c.line(x, 93, x, 109, p.shadow);
    } else if (kind === 'sailor') {
      poly(
        c,
        [
          [32, 79],
          [39, 78],
          [48, 85],
          [57, 78],
          [64, 79],
          [68, 89],
          [57, 93],
          [48, 88],
          [39, 93],
          [28, 89],
        ],
        p.shadow
      );
      contour(
        c,
        [
          [33, 81],
          [30, 88],
          [39, 91],
          [48, 86],
          [57, 91],
          [66, 88],
          [63, 81],
        ],
        p.shirt,
        false
      );
      poly(
        c,
        [
          [48, 87],
          [42, 93],
          [47, 99],
          [48, 111],
          [52, 98],
          [55, 93],
        ],
        '#b94f65'
      );
      c.line(48, 91, 50, 96, '#ec9ca5');
    } else if (kind === 'tunic') {
      poly(
        c,
        [
          [36, 79],
          [44, 85],
          [48, 96],
          [52, 85],
          [60, 79],
          [56, 92],
          [48, 102],
          [40, 92],
        ],
        p.shadow
      );
      c.line(37, 81, 44, 92, p.shirt);
      c.line(59, 81, 52, 92, p.shirt);
      c.line(45, 90, 51, 90, '#e4c991');
      c.line(46, 94, 50, 94, '#e4c991');
      c.line(28, 108, 68, 108, '#78553d');
      c.rect(46, 107, 5, 4, '#d7b56c');
    } else if (kind === 'coat') {
      c.rect(39, 79, 18, 8, p.shadow);
      c.line(40, 80, 48, 85, light);
      c.line(56, 80, 48, 85, light);
      c.line(48, 87, 48, 111, rim);
      for (let y = 93; y < 112; y += 7) c.rect(51, y, 2, 2, '#c9c3a0');
      c.rect(25, 99, 10, 9, p.shadow);
      c.line(25, 99, 34, 99, light);
      c.line(62, 99, 71, 99, light);
    }
    return c;
  }

  function eyes(index, female) {
    const c = make(),
      iris = EYE_COLORS[index],
      line = '#493b4b';
    for (const x of [32, 54]) {
      c.line(x + 1, 39, x + 8, 38, female ? '#967b82' : '#79636b');
      const bottom = female ? 53 : 51;
      poly(
        c,
        [
          [x, 46],
          [x + 2, 43],
          [x + 8, 43],
          [x + 10, 46],
          [x + 9, bottom - 1],
          [x + 2, bottom],
          [x, bottom - 2],
        ],
        '#fff9f3'
      );
      // Tapered upper eyelid and open lower lid avoid heavy rectangular sockets.
      c.line(x, 45, x + 2, 43, line);
      c.line(x + 2, 43, x + 8, 43, line);
      c.line(x + 8, 43, x + 10, 45, line);
      c.rect(x + 4, 44, 4, female ? 9 : 7, iris);
      c.rect(x + 5, 45, 2, female ? 5 : 4, shift(iris, -25));
      c.line(x + 4, bottom - 1, x + 7, bottom - 1, shift(iris, 35));
      c.rect(x + 4, 44, 2, 2, '#ffffff');
      c.pixel(x + 7, bottom - 2, '#ffffff');
      c.line(x + 2, bottom, x + 5, bottom, '#b28d8b');
      if (female) {
        c.line(x - 1, 43, x + 1, 45, line);
        c.pixel(x + 10, 43, line);
      }
    }
    return c;
  }

  // Six complete silhouettes, with six independently drawn forehead/fringe lines.
  const h = { dark: '#a8a4a0', base: '#dcd8d4', light: '#ffffff', mid: '#ece8e4' };
  function hair(style, back = false) {
    const c = make();
    if (back) {
      if (style === 1) {
        poly(
          c,
          [
            [24, 29],
            [28, 20],
            [65, 20],
            [72, 30],
            [74, 66],
            [69, 76],
            [60, 72],
            [33, 74],
            [22, 67],
          ],
          h.dark
        );
        poly(
          c,
          [
            [25, 36],
            [29, 23],
            [65, 24],
            [69, 34],
            [71, 65],
            [67, 72],
            [32, 71],
            [25, 65],
          ],
          h.base
        );
      }
      if (style === 4) {
        poly(
          c,
          [
            [25, 29],
            [34, 18],
            [62, 20],
            [71, 31],
            [75, 90],
            [70, 106],
            [60, 102],
            [32, 106],
            [21, 99],
          ],
          h.dark
        );
        poly(
          c,
          [
            [27, 34],
            [34, 22],
            [62, 23],
            [68, 35],
            [71, 90],
            [67, 101],
            [59, 97],
            [31, 102],
            [25, 96],
          ],
          h.base
        );
        c.line(28, 46, 27, 96, h.mid);
        c.line(66, 45, 69, 94, h.mid);
        c.line(59, 71, 61, 99, h.dark);
      }
      if (style === 5) {
        poly(
          c,
          [
            [66, 21],
            [76, 23],
            [83, 32],
            [86, 52],
            [81, 70],
            [76, 80],
            [77, 56],
            [74, 39],
            [68, 34],
          ],
          h.dark
        );
        poly(
          c,
          [
            [69, 24],
            [76, 26],
            [80, 34],
            [82, 51],
            [79, 64],
            [78, 48],
            [75, 36],
            [69, 31],
          ],
          h.base
        );
        c.line(76, 29, 80, 48, h.light);
      }
      return c;
    }
    const shapes = [
      [
        [25, 45],
        [24, 29],
        [28, 20],
        [37, 15],
        [52, 14],
        [64, 19],
        [70, 29],
        [70, 44],
        [67, 51],
        [65, 31],
        [60, 30],
        [54, 36],
        [50, 29],
        [43, 35],
        [39, 29],
        [31, 34],
        [28, 49],
      ],
      [
        [22, 56],
        [22, 30],
        [27, 20],
        [35, 15],
        [57, 15],
        [66, 21],
        [72, 31],
        [73, 59],
        [69, 71],
        [65, 67],
        [64, 34],
        [59, 37],
        [53, 37],
        [48, 35],
        [43, 37],
        [36, 37],
        [29, 35],
        [29, 65],
        [24, 69],
      ],
      [
        [23, 43],
        [24, 26],
        [20, 27],
        [26, 17],
        [23, 15],
        [37, 14],
        [43, 8],
        [48, 14],
        [59, 10],
        [61, 17],
        [70, 18],
        [68, 26],
        [74, 30],
        [69, 44],
        [65, 35],
        [59, 30],
        [55, 38],
        [48, 29],
        [43, 39],
        [37, 30],
        [30, 36],
        [28, 47],
      ],
      [
        [25, 43],
        [25, 25],
        [29, 13],
        [34, 19],
        [41, 5],
        [47, 16],
        [57, 7],
        [59, 20],
        [68, 16],
        [69, 29],
        [70, 42],
        [66, 47],
        [64, 29],
        [58, 28],
        [53, 33],
        [49, 26],
        [43, 30],
        [39, 24],
        [31, 29],
        [29, 47],
      ],
      [
        [24, 57],
        [23, 30],
        [28, 21],
        [39, 14],
        [54, 14],
        [65, 21],
        [71, 31],
        [71, 58],
        [68, 78],
        [70, 98],
        [65, 104],
        [62, 96],
        [63, 58],
        [62, 31],
        [56, 29],
        [50, 34],
        [44, 27],
        [37, 32],
        [31, 30],
        [30, 59],
        [28, 98],
        [23, 102],
        [21, 96],
      ],
      [
        [25, 43],
        [25, 28],
        [29, 20],
        [39, 14],
        [54, 14],
        [65, 20],
        [71, 30],
        [70, 47],
        [66, 54],
        [64, 30],
        [60, 28],
        [57, 30],
        [52, 35],
        [47, 37],
        [41, 38],
        [35, 37],
        [30, 41],
        [28, 51],
      ],
    ];
    poly(c, shapes[style], h.base);
    contour(c, shapes[style], h.dark);
    // Individual locks and highlights follow each cut instead of reusing a fringe.
    const highlights = [
      [
        [29, 25],
        [37, 19],
        [49, 18],
        [57, 21],
        [43, 22],
        [34, 27],
      ],
      [
        [27, 26],
        [35, 19],
        [55, 19],
        [64, 25],
        [56, 24],
        [35, 24],
        [29, 29],
      ],
      [
        [28, 23],
        [36, 18],
        [42, 13],
        [45, 19],
        [52, 16],
        [58, 19],
        [49, 23],
        [39, 23],
      ],
      [
        [31, 23],
        [34, 18],
        [40, 23],
        [43, 12],
        [47, 22],
        [56, 14],
        [54, 24],
        [43, 25],
      ],
      [
        [29, 27],
        [38, 19],
        [51, 18],
        [59, 21],
        [51, 22],
        [39, 23],
        [32, 29],
      ],
      [
        [30, 25],
        [39, 19],
        [53, 18],
        [61, 22],
        [49, 23],
        [40, 28],
        [32, 32],
      ],
    ];
    poly(c, highlights[style], h.light);
    const strands = [
      [
        [40, 19, 38, 28],
        [52, 21, 54, 30],
        [62, 24, 65, 30],
      ],
      [
        [36, 25, 35, 34],
        [46, 23, 46, 34],
        [56, 25, 58, 34],
        [25, 40, 26, 60],
        [69, 39, 70, 61],
      ],
      [
        [32, 23, 31, 29],
        [44, 20, 42, 31],
        [53, 22, 55, 31],
        [63, 24, 65, 31],
      ],
      [
        [43, 15, 41, 24],
        [55, 18, 52, 26],
        [63, 23, 63, 28],
      ],
      [
        [44, 20, 42, 26],
        [55, 21, 56, 27],
        [26, 42, 25, 88],
        [67, 43, 67, 89],
      ],
      [
        [58, 22, 50, 30],
        [49, 24, 39, 33],
        [35, 27, 30, 36],
        [67, 28, 67, 45],
      ],
    ];
    for (const [x0, y0, x1, y1] of strands[style]) c.line(x0, y0, x1, y1, h.dark);
    if (style === 5) {
      c.rect(70, 27, 4, 3, '#bd8268');
      c.line(70, 27, 73, 27, '#eac5a3');
    }
    return c;
  }
  return { body, clothes, eyes, hair };
}
