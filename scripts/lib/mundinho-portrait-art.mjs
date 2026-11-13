import { canvas } from './mundinho-pixel-art.mjs';

/** Original 96 × 112 anime pixel busts, sharing a single wardrobe drawing grid. */
export function createPortraitArt({ SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS }) {
  const make = () => canvas(96, 112);
  const ink = '#24232d';
  const shift = (hex, amount) =>
    '#' +
    hex
      .slice(1)
      .match(/../g)
      .map((v) =>
        Math.max(0, Math.min(255, parseInt(v, 16) + amount))
          .toString(16)
          .padStart(2, '0')
      )
      .join('');
  const edge = (c, points, color = ink, close = true) => {
    for (let i = 1; i < points.length; i++) c.line(...points[i - 1], ...points[i], color);
    if (close) c.line(...points.at(-1), ...points[0], color);
  };
  const shape = (c, points, color, outline = ink) => {
    c.polygon(points, color);
    if (outline) edge(c, points, outline);
  };

  function body(index, female) {
    const c = make(),
      p = SKIN_PALETTES[index];
    // Garments own the shoulder/torso silhouette; skin supplies only the neck
    // and head so it cannot protrude outside narrower sleeves.
    shape(
      c,
      [
        [39, 68],
        [56, 68],
        [57, 79],
        [62, 83],
        [55, 91],
        [41, 91],
        [34, 83],
        [39, 79],
      ],
      p.base,
      p.deepShadow
    );
    c.polygon(
      [
        [39, 69],
        [56, 69],
        [56, 76],
        [50, 80],
        [40, 75],
      ],
      p.shadow
    );
    c.line(42, 79, 48, 83, p.highlight);
    for (const x of [22, 73]) {
      c.ellipse(x, 48, 4, 7, p.deepShadow);
      c.ellipse(x, 47, 3, 6, p.base);
      c.line(x, 47, x + 1, 51, p.shadow);
      c.pixel(x, 52, p.highlight);
    }
    const face = female
      ? [
          [25, 29],
          [29, 23],
          [38, 19],
          [57, 19],
          [66, 24],
          [71, 32],
          [72, 49],
          [69, 59],
          [64, 66],
          [57, 72],
          [50, 75],
          [46, 75],
          [38, 72],
          [31, 66],
          [26, 58],
          [23, 48],
          [23, 37],
        ]
      : [
          [25, 28],
          [31, 21],
          [40, 18],
          [56, 19],
          [66, 24],
          [71, 32],
          [73, 47],
          [71, 57],
          [66, 65],
          [59, 71],
          [52, 75],
          [45, 75],
          [37, 71],
          [30, 65],
          [25, 57],
          [22, 47],
          [23, 36],
        ];
    shape(c, face, p.base, p.deepShadow);
    c.polygon(
      [
        [67, 33],
        [71, 36],
        [72, 47],
        [69, 57],
        [63, 65],
        [56, 70],
        [49, 73],
        [45, 73],
        [52, 69],
        [61, 62],
        [66, 54],
      ],
      p.shadow
    );
    c.polygon(
      [
        [26, 34],
        [30, 27],
        [39, 23],
        [50, 23],
        [56, 26],
        [35, 29],
        [27, 39],
      ],
      p.highlight
    );
    c.line(28, 58, 32, 60, p.shadow);
    c.line(62, 59, 66, 57, p.shadow);
    c.line(29, 57, 33, 57, p.blush);
    c.line(61, 57, 65, 57, p.blush);
    c.pixel(48, 57, p.shadow);
    c.line(48, 59, 50, 59, p.deepShadow);
    c.pixel(47, 60, p.highlight);
    c.line(43, 66, 49, 67, shift(p.deepShadow, -24));
    c.line(49, 67, 53, 65, shift(p.deepShadow, -24));
    c.line(45, 69, 50, 69, p.highlight);
    if (female) c.line(44, 65, 50, 65, p.blush);
    return c;
  }

  function eyes(index, female) {
    const c = make(),
      iris = EYE_COLORS[index];
    // Curved scanlines keep the shorter aperture and iris free of rectangular sidewalls.
    const margins = female ? [4, 2, 1, 0, 0, 0, 1, 1, 2, 3, 4] : [4, 2, 1, 0, 0, 1, 1, 2, 3, 4];
    for (const x of [27, 54]) {
      const y = female ? 43 : 44;
      const bottom = y + margins.length - 1;
      c.line(x + 1, 38, x + 10, 37, '#68515a');
      c.line(x + 2, 39, x + 9, 38, '#68515a');
      const centerY = (margins.length - 1) / 2;
      for (const [row, margin] of margins.entries()) {
        for (let col = margin; col <= 13 - margin; col++) {
          let color = '#fff8ed';
          const irisDistance = ((col - 6.5) / 4.8) ** 2 + ((row - centerY) / (centerY + 0.4)) ** 2;
          if (irisDistance <= 1) {
            color = index === 0 ? '#51413a' : iris;
            if (row < 4) color = index === 0 ? '#3a3333' : shift(iris, -28);
            if (row >= margins.length - 3) color = index === 0 ? '#967552' : shift(iris, 48);
            const pupilDistance = ((col - 6.8) / 2.3) ** 2 + ((row - (centerY - 0.9)) / 3.1) ** 2;
            if (pupilDistance <= 1) color = '#20212b';
          }
          c.pixel(x + col, y + row, color);
        }
      }
      edge(
        c,
        [
          [x, y + 3],
          [x + 2, y + 1],
          [x + 4, y],
          [x + 9, y],
          [x + 11, y + 1],
          [x + 13, y + 3],
        ],
        ink,
        false
      );
      c.line(x + 3, y + 1, x + 10, y + 1, ink);
      c.line(x + 3, y + 2, x + 4, y + 2, '#ffffff');
      c.pixel(x + 4, y + 3, '#ffffff');
      c.pixel(x + 10, bottom - 2, '#fce8d3');
      c.line(x + 4, bottom, x + 7, bottom, '#a37d78');
      if (female) {
        c.line(x - 1, y + 1, x + 1, y + 3, ink);
        c.line(x + 12, y - 1, x + 11, y + 1, ink);
      }
    }
    return c;
  }

  function clothes(index, female) {
    const c = make(),
      p = OUTFIT_SPECS[index],
      kind = p.kind;
    const left = female ? 10 : 6,
      right = 95 - left;
    const rim = shift(p.shadow, -24),
      light = shift(p.jacket, 23);
    shape(
      c,
      [
        [left, 112],
        [left + 3, 99],
        [left + 7, 90],
        [23, 84],
        [35, 80],
        [39, 83],
        [47, 88],
        [56, 83],
        [61, 80],
        [73, 84],
        [right - 7, 90],
        [right - 3, 99],
        [right, 112],
      ],
      p.jacket
    );
    c.polygon(
      [
        [left + 1, 112],
        [left + 5, 98],
        [left + 10, 90],
        [23, 87],
        [24, 112],
      ],
      p.shadow
    );
    c.polygon(
      [
        [72, 87],
        [right - 9, 92],
        [right - 4, 101],
        [right - 1, 112],
        [72, 112],
      ],
      p.shadow
    );
    c.line(left + 7, 99, left + 11, 92, light);
    c.line(left + 12, 90, 23, 86, light);
    c.line(22, 99, 20, 111, rim);
    c.line(75, 99, 77, 111, rim);
    shape(
      c,
      [
        [38, 84],
        [47, 88],
        [57, 83],
        [59, 112],
        [36, 112],
      ],
      p.shirt,
      rim
    );
    c.line(40, 88, 47, 91, shift(p.shirt, -45));
    c.line(47, 91, 55, 87, shift(p.shirt, -45));
    if (['jacket', 'tech', 'denim', 'overcoat'].includes(kind)) {
      // Raised adventure collar retains the reference protagonist's identity.
      shape(
        c,
        [
          [35, 77],
          [38, 81],
          [40, 91],
          [37, 103],
          [24, 83],
        ],
        p.jacket,
        rim
      );
      shape(
        c,
        [
          [60, 77],
          [70, 83],
          [57, 103],
          [54, 91],
          [56, 81],
        ],
        p.jacket,
        rim
      );
      c.line(26, 83, 35, 80, light);
      c.line(58, 80, 66, 83, light);
      c.line(28, 87, 37, 99, light);
      c.line(65, 86, 57, 98, light);
      c.line(37, 103, 36, 111, rim);
      c.line(57, 103, 59, 111, rim);
      if (kind === 'tech') {
        c.line(18, 91, 25, 91, '#55c5e9');
        c.line(68, 91, 75, 91, '#55c5e9');
        c.rect(64, 101, 7, 2, '#55c5e9');
      }
      if (kind === 'denim') {
        for (const x of [25, 64]) {
          c.line(x, 103, x + 7, 103, p.shirt);
          c.line(x, 103, x, 109, light);
          c.pixel(x + 4, 106, '#e4c58a');
        }
        c.line(60, 99, 61, 111, p.shirt);
      }
      if (kind === 'overcoat') for (let y = 101; y < 112; y += 7) c.rect(61, y, 2, 2, '#d9c79b');
    } else if (kind === 'hoodie') {
      shape(
        c,
        [
          [33, 80],
          [38, 79],
          [39, 85],
          [47, 90],
          [56, 85],
          [58, 79],
          [63, 80],
          [69, 89],
          [61, 96],
          [48, 94],
          [35, 96],
          [27, 89],
        ],
        p.shadow,
        rim
      );
      c.line(31, 87, 37, 92, light);
      c.line(37, 92, 47, 93, light);
      c.line(49, 93, 60, 91, light);
      c.line(60, 91, 65, 87, light);
      for (const x of [37, 58]) {
        c.line(x, 94, x, 108, p.shirt);
        c.rect(x - 1, 107, 3, 3, shift(p.shirt, -25));
      }
      c.line(48, 96, 48, 111, rim);
    } else if (kind === 'sweater') {
      c.polygon(
        [
          [34, 81],
          [39, 83],
          [47, 88],
          [56, 83],
          [61, 81],
          [59, 93],
          [50, 98],
          [43, 98],
          [36, 92],
        ],
        p.jacket
      );
      c.line(37, 83, 41, 90, rim);
      c.line(41, 90, 48, 93, rim);
      c.line(48, 93, 55, 89, rim);
      c.line(55, 89, 59, 83, rim);
      c.line(24, 108, 72, 108, p.shadow);
      c.line(24, 111, 72, 111, light);
      for (let x = 28; x < 72; x += 4) c.line(x, 109, x, 111, p.shadow);
    } else if (kind === 'ceremonial') {
      shape(
        c,
        [
          [34, 80],
          [42, 85],
          [48, 94],
          [54, 85],
          [62, 80],
          [58, 96],
          [48, 102],
          [38, 96],
        ],
        p.shadow,
        rim
      );
      c.line(34, 81, 48, 98, p.shirt);
      c.line(62, 81, 48, 98, p.shirt);
      c.line(48, 99, 48, 111, p.shirt);
      for (const x of [24, 72]) c.line(x, 88, x, 110, p.shirt);
      c.rect(45, 99, 7, 4, '#f6df9d');
      c.rect(47, 100, 3, 2, '#a77733');
    } else if (kind === 'bomber') {
      shape(
        c,
        [
          [36, 79],
          [41, 84],
          [48, 89],
          [55, 84],
          [60, 79],
          [61, 86],
          [55, 94],
          [41, 94],
          [34, 86],
        ],
        p.shadow,
        rim
      );
      c.line(37, 83, 47, 92, light);
      c.line(59, 83, 50, 92, light);
      c.line(48, 95, 48, 111, '#dfc8a1');
      shape(
        c,
        [
          [24, 98],
          [32, 98],
          [32, 105],
          [24, 105],
        ],
        '#f5dcc3',
        rim
      );
      c.rect(26, 100, 3, 3, p.jacket);
      c.line(63, 102, 71, 100, rim);
    } else if (kind === 'cardigan') {
      c.polygon(
        [
          [34, 81],
          [41, 88],
          [45, 112],
          [38, 112],
        ],
        p.jacket
      );
      c.polygon(
        [
          [61, 81],
          [54, 89],
          [50, 112],
          [57, 112],
        ],
        p.jacket
      );
      c.line(35, 84, 41, 111, p.shadow);
      c.line(60, 84, 54, 111, p.shadow);
      for (let y = 99; y < 112; y += 6) c.rect(53, y, 2, 2, '#eed8b0');
    } else if (kind === 'sailor') {
      shape(
        c,
        [
          [32, 80],
          [38, 81],
          [48, 88],
          [57, 81],
          [64, 80],
          [69, 91],
          [57, 97],
          [48, 91],
          [38, 97],
          [27, 91],
        ],
        '#243551',
        rim
      );
      edge(
        c,
        [
          [32, 84],
          [30, 90],
          [38, 94],
          [48, 89],
          [57, 94],
          [66, 90],
          [63, 84],
        ],
        p.shirt,
        false
      );
      shape(
        c,
        [
          [47, 92],
          [43, 98],
          [47, 103],
          [48, 112],
          [51, 103],
          [54, 98],
        ],
        '#c6364c',
        rim
      );
      c.line(48, 96, 50, 101, '#ed9baa');
    } else if (kind === 'tunic') {
      c.polygon(
        [
          [35, 80],
          [42, 87],
          [48, 94],
          [55, 87],
          [60, 80],
          [57, 96],
          [48, 103],
          [39, 96],
        ],
        p.jacket
      );
      edge(
        c,
        [
          [36, 82],
          [42, 92],
          [48, 98],
          [54, 92],
          [59, 82],
        ],
        p.shirt,
        false
      );
      for (let y = 94; y < 104; y += 4) c.line(45, y, 51, y, '#e3ca90');
      c.line(23, 110, 73, 110, '#78543e');
      c.rect(45, 108, 7, 4, '#dfbb74');
    } else if (kind === 'coat') {
      shape(
        c,
        [
          [36, 80],
          [40, 81],
          [48, 88],
          [55, 81],
          [60, 80],
          [60, 87],
          [51, 94],
          [44, 94],
          [35, 87],
        ],
        p.jacket,
        rim
      );
      c.line(38, 83, 47, 91, light);
      c.line(57, 83, 49, 91, light);
      c.polygon(
        [
          [41, 91],
          [48, 94],
          [55, 91],
          [55, 112],
          [41, 112],
        ],
        p.jacket
      );
      c.line(48, 94, 48, 111, rim);
      for (let y = 98; y < 112; y += 6) c.rect(51, y, 2, 2, '#d9cba4');
      for (const x of [25, 65]) {
        c.line(x, 102, x + 7, 102, light);
        c.line(x, 103, x, 108, p.shadow);
      }
    }
    return c;
  }

  // Neutral silver ramp follows the saved/custom hair transfer in Portrait.tsx.
  const h = { ink: '#20212b', dark: '#b2aeaa', base: '#dcd8d4', mid: '#ece8e4', light: '#fffaf5' };
  function extraHair(style, back) {
    const c = make();
    const curl = (x, y, rx, ry, fill = h.base) => {
      c.ellipse(x, y, rx, ry, h.ink);
      c.ellipse(x, y - 1, rx - 1, ry - 1, fill);
      c.line(x - rx + 3, y - 2, x - rx + 4, y - 5, h.mid);
      c.line(x - rx + 4, y - 5, x - rx + 7, y - 5, h.mid);
      c.line(x + rx - 3, y + 1, x + rx - 5, y + 4, h.dark);
    };
    if (style === 6) {
      // Rounded, overlapping coils: broad airy crown, soft temple curls and a short nape.
      shape(
        c,
        [
          [19, 24],
          [29, 12],
          [45, 7],
          [62, 12],
          [76, 23],
          [82, 42],
          [78, 61],
          [68, 75],
          [28, 75],
          [17, 61],
          [12, 42],
        ],
        h.dark,
        h.ink
      );
      if (back) {
        for (const [x, y, rx, ry] of [
          [21, 31, 10, 12],
          [34, 21, 12, 12],
          [50, 19, 12, 12],
          [65, 25, 12, 12],
          [76, 38, 10, 12],
          [22, 48, 11, 12],
          [35, 41, 12, 13],
          [53, 40, 12, 13],
          [69, 51, 12, 13],
          [30, 62, 11, 12],
          [47, 63, 12, 12],
          [61, 65, 11, 11],
        ])
          curl(x, y, rx, ry);
      } else {
        // Only the rear layer fills the skull; keep the front opening clear for the face.
        c.polygon(
          [
            [26, 37],
            [68, 37],
            [72, 53],
            [69, 71],
            [56, 78],
            [38, 78],
            [24, 68],
            [22, 51],
          ],
          '#00000000'
        );
        for (const [x, y, rx, ry] of [
          [23, 23, 10, 11],
          [35, 15, 11, 10],
          [50, 13, 11, 10],
          [64, 18, 11, 11],
          [76, 29, 10, 12],
          [18, 38, 9, 11],
          [77, 47, 9, 11],
          [19, 54, 8, 10],
          [74, 61, 8, 10],
          [27, 31, 10, 10],
          [42, 29, 11, 10],
          [58, 29, 10, 10],
          [69, 34, 8, 10],
        ])
          curl(x, y, rx, ry);
        c.line(36, 20, 40, 17, h.light);
        c.line(48, 18, 53, 19, h.light);
      }
      return c;
    }
    if (style === 7) {
      // Two high coiled buns remain separate from the parted crown and wispy fringe.
      for (const [x, sign] of [
        [15, -1],
        [80, 1],
      ]) {
        c.ellipse(x, 21, 13, 14, h.ink);
        c.ellipse(x, 20, 11, 12, h.dark);
        c.ellipse(x - 2, 18, 9, 10, h.base);
        edge(
          c,
          [
            [x - 5, 12],
            [x + 3, 12],
            [x + 7, 17],
            [x + 6, 23],
            [x + 1, 26],
            [x - 4, 22],
            [x - 4, 17],
            [x, 16],
            [x + 2, 19],
          ],
          h.dark,
          false
        );
        c.line(x - 5, 12, x - 8, 17, h.mid);
        c.line(x - 7, 13, x - 6, 11, h.light);
        c.rect(x - sign * 8, 28, 3, 4, '#a65957');
        c.line(x - sign * 8, 28, x - sign * 8 + 2, 28, '#eab3a0');
      }
      if (back) {
        shape(
          c,
          [
            [21, 25],
            [28, 16],
            [41, 11],
            [55, 12],
            [68, 18],
            [76, 29],
            [76, 55],
            [70, 69],
            [58, 77],
            [36, 76],
            [24, 66],
            [19, 50],
          ],
          h.dark,
          h.ink
        );
        c.polygon(
          [
            [25, 28],
            [33, 19],
            [46, 15],
            [58, 17],
            [69, 27],
            [71, 50],
            [66, 64],
            [56, 71],
            [37, 70],
            [27, 61],
            [23, 46],
          ],
          h.base
        );
        edge(
          c,
          [
            [47, 16],
            [46, 30],
            [48, 46],
            [48, 63],
            [47, 72],
          ],
          h.dark,
          false
        );
        c.line(28, 28, 34, 22, h.mid);
        c.line(34, 22, 42, 19, h.light);
        edge(
          c,
          [
            [30, 41],
            [31, 56],
            [37, 65],
          ],
          h.mid,
          false
        );
        edge(
          c,
          [
            [65, 37],
            [64, 55],
            [58, 65],
          ],
          h.dark,
          false
        );
      } else {
        shape(
          c,
          [
            [20, 49],
            [20, 32],
            [24, 23],
            [33, 16],
            [44, 12],
            [53, 12],
            [64, 17],
            [72, 25],
            [77, 37],
            [75, 53],
            [71, 60],
            [68, 45],
            [66, 34],
            [59, 30],
            [52, 34],
            [48, 28],
            [43, 34],
            [35, 36],
            [30, 32],
            [26, 43],
            [25, 56],
            [22, 60],
          ],
          h.base,
          h.ink
        );
        c.polygon(
          [
            [23, 35],
            [28, 25],
            [39, 18],
            [45, 16],
            [40, 24],
            [31, 33],
            [27, 46],
            [25, 53],
          ],
          h.dark
        );
        c.polygon(
          [
            [48, 15],
            [57, 16],
            [67, 23],
            [71, 30],
            [61, 25],
            [54, 24],
            [49, 28],
          ],
          h.mid
        );
        edge(
          c,
          [
            [46, 15],
            [43, 23],
            [36, 30],
            [31, 31],
          ],
          h.dark,
          false
        );
        edge(
          c,
          [
            [50, 16],
            [53, 23],
            [61, 28],
            [66, 31],
          ],
          h.dark,
          false
        );
        c.line(34, 23, 40, 19, h.light);
        c.line(28, 39, 27, 49, h.mid);
        c.line(72, 39, 73, 50, h.dark);
      }
      return c;
    }
    if (style === 8) {
      // Shoulder-length waves have alternating, outward-turning ends rather than straight curtains.
      if (back) {
        shape(
          c,
          [
            [20, 31],
            [26, 21],
            [38, 14],
            [53, 12],
            [66, 17],
            [74, 27],
            [78, 41],
            [75, 56],
            [77, 70],
            [83, 81],
            [79, 88],
            [70, 86],
            [67, 93],
            [58, 90],
            [49, 94],
            [40, 91],
            [30, 94],
            [25, 86],
            [16, 87],
            [13, 80],
            [19, 68],
            [17, 53],
          ],
          h.dark,
          h.ink
        );
        c.polygon(
          [
            [24, 34],
            [30, 24],
            [40, 18],
            [54, 16],
            [65, 21],
            [71, 32],
            [73, 44],
            [69, 59],
            [72, 74],
            [77, 82],
            [68, 81],
            [64, 87],
            [56, 84],
            [48, 89],
            [40, 86],
            [32, 89],
            [29, 81],
            [20, 82],
            [25, 69],
            [22, 54],
          ],
          h.base
        );
        edge(
          c,
          [
            [34, 26],
            [30, 39],
            [32, 52],
            [28, 66],
            [31, 80],
          ],
          h.mid,
          false
        );
        edge(
          c,
          [
            [47, 20],
            [42, 35],
            [46, 50],
            [42, 67],
            [46, 84],
          ],
          h.mid,
          false
        );
        edge(
          c,
          [
            [59, 23],
            [63, 38],
            [60, 54],
            [64, 70],
            [61, 84],
          ],
          h.dark,
          false
        );
        c.line(35, 24, 40, 20, h.light);
      } else {
        shape(
          c,
          [
            [19, 52],
            [18, 35],
            [23, 25],
            [32, 18],
            [44, 13],
            [57, 13],
            [68, 20],
            [75, 31],
            [77, 45],
            [73, 59],
            [75, 71],
            [81, 81],
            [76, 87],
            [69, 82],
            [65, 88],
            [62, 81],
            [65, 69],
            [63, 58],
            [66, 44],
            [64, 33],
            [59, 29],
            [54, 33],
            [49, 38],
            [41, 41],
            [34, 39],
            [31, 34],
            [27, 43],
            [29, 54],
            [26, 65],
            [29, 77],
            [25, 86],
            [19, 83],
            [15, 87],
            [13, 79],
            [20, 67],
            [17, 58],
          ],
          h.base,
          h.ink
        );
        c.polygon(
          [
            [21, 36],
            [27, 26],
            [38, 20],
            [48, 17],
            [43, 25],
            [33, 32],
            [29, 42],
            [28, 51],
            [24, 60],
            [26, 70],
            [23, 81],
            [19, 80],
            [23, 68],
            [20, 58],
            [24, 47],
          ],
          h.dark
        );
        c.polygon(
          [
            [48, 17],
            [58, 17],
            [66, 22],
            [70, 29],
            [63, 26],
            [56, 25],
            [49, 30],
            [42, 35],
            [35, 35],
            [41, 28],
          ],
          h.mid
        );
        edge(
          c,
          [
            [56, 22],
            [50, 28],
            [43, 34],
            [36, 36],
          ],
          h.dark,
          false
        );
        edge(
          c,
          [
            [69, 38],
            [70, 47],
            [67, 58],
            [70, 69],
            [70, 78],
          ],
          h.dark,
          false
        );
        edge(
          c,
          [
            [25, 43],
            [25, 52],
            [22, 61],
            [24, 72],
          ],
          h.mid,
          false
        );
        edge(
          c,
          [
            [69, 62],
            [72, 71],
            [76, 79],
          ],
          h.mid,
          false
        );
        c.line(35, 24, 41, 20, h.light);
        c.line(57, 21, 61, 22, h.light);
      }
      return c;
    }
    return c;
  }
  function hair(style, back = false) {
    if (style >= 6) {
      const layer = extraHair(style, back);
      if (!back) {
        // The new side locks frame both eye shapes without hiding lashes or irises.
        for (const female of [false, true]) {
          const aperture = eyes(0, female);
          for (let i = 43 * 96 * 4; i < layer.data.length; i += 4)
            if (aperture.data[i + 3]) layer.data.fill(0, i, i + 4);
        }
      }
      return layer;
    }
    const c = make();
    if (back) {
      if (style === 1) {
        shape(
          c,
          [
            [19, 30],
            [23, 20],
            [33, 14],
            [57, 13],
            [69, 19],
            [76, 30],
            [78, 58],
            [75, 69],
            [68, 77],
            [63, 73],
            [32, 76],
            [22, 71],
            [17, 61],
          ],
          h.dark,
          h.ink
        );
        c.polygon(
          [
            [21, 35],
            [27, 23],
            [64, 22],
            [72, 34],
            [73, 64],
            [66, 73],
            [29, 72],
            [22, 64],
          ],
          h.base
        );
      }
      if (style === 4) {
        shape(
          c,
          [
            [20, 30],
            [27, 18],
            [39, 13],
            [56, 14],
            [68, 20],
            [75, 32],
            [76, 65],
            [80, 91],
            [76, 106],
            [67, 102],
            [60, 108],
            [37, 105],
            [26, 108],
            [18, 99],
            [19, 74],
          ],
          h.dark,
          h.ink
        );
        c.polygon(
          [
            [23, 34],
            [29, 22],
            [62, 21],
            [71, 34],
            [71, 72],
            [75, 98],
            [68, 100],
            [61, 104],
            [36, 101],
            [27, 104],
            [22, 96],
          ],
          h.base
        );
        c.line(26, 53, 25, 93, h.mid);
        c.line(69, 50, 73, 94, h.dark);
        c.line(62, 73, 65, 99, h.dark);
      }
      if (style === 5) {
        shape(
          c,
          [
            [68, 17],
            [76, 15],
            [83, 20],
            [88, 29],
            [90, 42],
            [87, 57],
            [80, 69],
            [73, 73],
            [77, 64],
            [80, 51],
            [80, 37],
            [75, 29],
            [67, 28],
          ],
          h.dark,
          h.ink
        );
        c.polygon(
          [
            [74, 19],
            [81, 23],
            [85, 32],
            [86, 44],
            [82, 58],
            [77, 65],
            [81, 47],
            [81, 33],
            [74, 25],
          ],
          h.base
        );
        c.line(80, 24, 84, 35, h.light);
        c.line(86, 44, 82, 57, h.mid);
      }
      return c;
    }
    const silhouettes = [
      // Tousled side-swept hero: curved crown and overlapping locks.
      [
        [18, 49],
        [18, 38],
        [14, 41],
        [17, 29],
        [12, 31],
        [20, 21],
        [16, 18],
        [28, 16],
        [25, 10],
        [36, 12],
        [36, 5],
        [45, 10],
        [50, 8],
        [56, 12],
        [66, 11],
        [65, 16],
        [74, 18],
        [72, 23],
        [79, 29],
        [76, 30],
        [80, 39],
        [75, 39],
        [75, 51],
        [71, 57],
        [68, 46],
        [68, 34],
        [62, 32],
        [59, 40],
        [54, 35],
        [50, 29],
        [44, 37],
        [40, 42],
        [37, 34],
        [32, 38],
        [30, 30],
        [25, 37],
        [25, 51],
        [22, 56],
      ],
      // Rounded bob with soft cut-in ends.
      [
        [18, 56],
        [18, 32],
        [21, 24],
        [27, 18],
        [36, 14],
        [47, 12],
        [59, 15],
        [68, 20],
        [74, 28],
        [77, 40],
        [77, 60],
        [73, 70],
        [68, 75],
        [65, 67],
        [65, 37],
        [60, 40],
        [55, 38],
        [48, 40],
        [41, 38],
        [35, 40],
        [28, 37],
        [27, 63],
        [25, 73],
        [20, 68],
      ],
      [
        [17, 47],
        [18, 34],
        [13, 36],
        [20, 26],
        [15, 23],
        [24, 20],
        [22, 15],
        [34, 15],
        [36, 9],
        [44, 13],
        [48, 5],
        [53, 13],
        [63, 10],
        [64, 16],
        [74, 17],
        [71, 24],
        [78, 28],
        [74, 33],
        [78, 40],
        [73, 47],
        [70, 54],
        [67, 39],
        [61, 34],
        [57, 41],
        [50, 32],
        [44, 43],
        [38, 34],
        [31, 39],
        [28, 33],
        [25, 42],
        [24, 53],
        [20, 55],
      ],
      [
        [19, 46],
        [19, 31],
        [23, 21],
        [26, 25],
        [29, 12],
        [35, 20],
        [40, 6],
        [46, 17],
        [52, 5],
        [56, 18],
        [65, 10],
        [66, 22],
        [73, 18],
        [74, 31],
        [77, 39],
        [73, 48],
        [70, 54],
        [68, 38],
        [62, 32],
        [57, 37],
        [51, 29],
        [45, 34],
        [39, 29],
        [32, 35],
        [28, 30],
        [25, 41],
        [24, 54],
      ],
      [
        [19, 56],
        [19, 34],
        [23, 25],
        [29, 19],
        [38, 14],
        [48, 12],
        [59, 15],
        [68, 21],
        [74, 31],
        [76, 49],
        [73, 67],
        [74, 82],
        [77, 96],
        [72, 105],
        [68, 100],
        [65, 87],
        [66, 64],
        [66, 34],
        [60, 30],
        [54, 37],
        [48, 32],
        [42, 41],
        [36, 35],
        [29, 38],
        [28, 61],
        [27, 83],
        [29, 98],
        [24, 105],
        [19, 100],
        [22, 81],
      ],
      [
        [20, 48],
        [19, 34],
        [23, 25],
        [31, 18],
        [41, 13],
        [53, 12],
        [64, 16],
        [71, 22],
        [76, 31],
        [75, 45],
        [72, 55],
        [69, 57],
        [67, 39],
        [65, 31],
        [61, 29],
        [56, 36],
        [49, 42],
        [42, 44],
        [35, 42],
        [31, 37],
        [27, 41],
        [26, 52],
        [23, 57],
      ],
    ];
    shape(c, silhouettes[style], h.base, h.ink);
    const shadows = [
      [
        [18, 38],
        [24, 26],
        [31, 22],
        [26, 35],
        [25, 49],
        [22, 53],
        [20, 46],
      ],
      [
        [19, 38],
        [24, 27],
        [27, 37],
        [27, 63],
        [24, 69],
        [22, 63],
      ],
      [
        [19, 34],
        [26, 25],
        [32, 24],
        [27, 35],
        [25, 48],
        [21, 50],
      ],
      [
        [20, 34],
        [25, 25],
        [29, 28],
        [26, 39],
        [24, 49],
        [21, 45],
      ],
      [
        [20, 41],
        [25, 30],
        [28, 36],
        [28, 62],
        [26, 84],
        [27, 97],
        [24, 100],
        [22, 93],
        [24, 75],
      ],
      [
        [21, 37],
        [27, 27],
        [34, 22],
        [30, 34],
        [27, 42],
        [26, 51],
        [23, 54],
      ],
    ];
    c.polygon(shadows[style], h.dark);
    const highlight = [
      [
        [24, 23],
        [30, 19],
        [37, 18],
        [41, 12],
        [45, 16],
        [54, 16],
        [61, 19],
        [55, 22],
        [45, 20],
        [37, 25],
        [30, 25],
      ],
      [
        [25, 27],
        [31, 21],
        [41, 17],
        [51, 17],
        [62, 21],
        [68, 27],
        [59, 25],
        [48, 23],
        [38, 25],
        [30, 29],
      ],
      [
        [27, 23],
        [34, 20],
        [40, 15],
        [44, 19],
        [49, 13],
        [53, 20],
        [61, 18],
        [65, 23],
        [55, 25],
        [46, 22],
        [38, 26],
      ],
      [
        [28, 26],
        [33, 22],
        [36, 25],
        [41, 15],
        [45, 24],
        [51, 15],
        [53, 26],
        [63, 20],
        [60, 28],
        [48, 27],
        [39, 30],
      ],
      [
        [26, 28],
        [32, 22],
        [41, 18],
        [51, 17],
        [62, 22],
        [67, 27],
        [59, 25],
        [49, 22],
        [40, 26],
        [32, 29],
      ],
      [
        [27, 28],
        [35, 21],
        [44, 17],
        [54, 17],
        [64, 21],
        [58, 23],
        [49, 24],
        [39, 31],
        [32, 33],
      ],
    ];
    c.polygon(highlight[style], h.mid);
    const locks = [
      [
        [32, 21, 30, 29],
        [45, 17, 40, 31],
        [54, 21, 57, 31],
        [64, 23, 67, 31],
        [70, 32, 72, 45],
      ],
      [
        [31, 27, 31, 36],
        [41, 25, 41, 37],
        [51, 25, 51, 37],
        [61, 28, 62, 37],
        [22, 43, 23, 63],
        [72, 41, 73, 63],
      ],
      [
        [33, 23, 31, 32],
        [44, 21, 42, 34],
        [53, 24, 55, 34],
        [64, 24, 67, 36],
      ],
      [
        [33, 24, 32, 30],
        [42, 18, 39, 29],
        [52, 19, 49, 29],
        [63, 24, 61, 30],
        [71, 33, 71, 44],
      ],
      [
        [39, 26, 35, 33],
        [51, 25, 48, 31],
        [62, 26, 65, 33],
        [24, 49, 24, 71],
        [70, 43, 69, 69],
        [69, 80, 72, 96],
      ],
      [
        [57, 23, 50, 33],
        [48, 25, 39, 36],
        [36, 29, 32, 37],
        [69, 31, 71, 47],
      ],
    ];
    for (const line of locks[style]) c.line(...line, h.dark);
    const glints = [
      [34, 20, 39, 18],
      [35, 21, 41, 19],
      [35, 21, 39, 18],
      [41, 20, 43, 23],
      [35, 22, 41, 19],
      [39, 22, 44, 19],
    ];
    c.line(...glints[style], h.light);
    if (style === 5) {
      c.rect(73, 24, 5, 3, '#a65957');
      c.line(73, 24, 77, 24, '#eab3a0');
    }
    return c;
  }
  return { body, clothes, eyes, hair };
}
