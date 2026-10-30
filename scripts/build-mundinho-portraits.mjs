/** Original 96 × 112 pixel portraits, authored in layers and exported by LibreSprite.
 * Palette indices match the existing world avatar. No generated approximations of
 * a 32px walking sprite: these are separately drawn faces, clothes and accessories.
 */
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

const paletteSource = await fs.readFile('src/lib/mundinho/avatar-palettes.ts', 'utf8');
const { outputText } = ts.transpileModule(paletteSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const source = 'artifacts/mundinho/libresprite/portraits';
const output = 'public/assets/mundinho';
await fs.mkdir(source, { recursive: true });
const W = 96,
  H = 112,
  ink = '#24212c';
const make = () => canvas(W, H);
const poly = (c, points, color) => c.polygon(points, color);
const shade = (hex, n) =>
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

function body(skin, female) {
  const c = make(),
    p = SKIN_PALETTES[skin];
  // Distinct shoulder line, neck and jaw, with the same face anchors for every layer.
  poly(
    c,
    [
      [female ? 16 : 8, 112],
      [female ? 20 : 12, 85],
      [35, 77],
      [37, 62],
      [59, 62],
      [61, 77],
      [female ? 76 : 84, 85],
      [female ? 80 : 88, 112],
    ],
    ink
  );
  poly(
    c,
    [
      [female ? 19 : 11, 112],
      [female ? 23 : 15, 86],
      [38, 79],
      [40, 62],
      [56, 62],
      [58, 79],
      [female ? 73 : 81, 86],
      [female ? 77 : 85, 112],
    ],
    p.shadow
  );
  poly(
    c,
    [
      [39, 65],
      [55, 66],
      [55, 78],
      [65, 83],
      [49, 100],
      [31, 83],
      [39, 77],
    ],
    p.base
  );
  poly(
    c,
    [
      [39, 66],
      [57, 65],
      [56, 73],
      [48, 78],
      [40, 74],
    ],
    p.deepShadow
  );
  poly(
    c,
    [
      [40, 74],
      [48, 79],
      [54, 74],
      [54, 80],
      [48, 87],
      [40, 81],
    ],
    p.highlight
  );
  c.ellipse(25, 48, 5, 9, ink);
  c.ellipse(70, 48, 5, 9, ink);
  c.ellipse(25, 48, 3, 6, p.shadow);
  c.ellipse(70, 48, 3, 6, p.shadow);
  c.line(24, 46, 26, 51, p.deepShadow);
  c.line(69, 46, 71, 50, p.deepShadow);
  const jaw = female
    ? [
        [66, 59],
        [61, 67],
        [52, 73],
        [43, 73],
        [33, 67],
        [28, 59],
      ]
    : [
        [67, 60],
        [62, 70],
        [54, 74],
        [40, 74],
        [31, 68],
        [27, 60],
      ];
  poly(c, [[27, 24], [35, 16], [58, 16], [67, 24], ...jaw], ink);
  poly(
    c,
    [
      [29, 25],
      [36, 19],
      [57, 19],
      [65, 25],
      [65, 57],
      [59, 66],
      [51, 70],
      [43, 70],
      [34, 64],
      [29, 56],
    ],
    p.base
  );
  poly(
    c,
    [
      [59, 25],
      [65, 27],
      [65, 57],
      [59, 66],
      [51, 70],
      [43, 70],
      [39, 67],
      [52, 66],
      [59, 58],
    ],
    p.shadow
  );
  poly(
    c,
    [
      [31, 28],
      [38, 22],
      [54, 22],
      [58, 28],
      [54, 34],
      [35, 35],
    ],
    p.highlight
  );
  c.rect(31, 53, 6, 2, p.blush);
  c.rect(59, 53, 4, 2, p.blush);
  c.line(48, 43, 46, 54, p.shadow);
  c.line(46, 54, 50, 54, p.deepShadow);
  c.pixel(47, 52, p.highlight);
  c.line(41, 61, 53, 61, p.deepShadow);
  c.line(44, 63, 50, 63, p.highlight);
  c.pixel(54, 60, p.shadow);
  c.rect(33, 57, 3, 1, p.highlight);
  return c;
}

function clothes(index, female) {
  const c = make(),
    p = OUTFIT_SPECS[index];
  const left = female ? 16 : 8,
    right = 96 - left;
  poly(
    c,
    [
      [left, 112],
      [left + 4, 86],
      [34, 77],
      [39, 78],
      [48, 87],
      [57, 78],
      [62, 77],
      [right - 4, 86],
      [right, 112],
    ],
    ink
  );
  poly(
    c,
    [
      [left + 3, 112],
      [left + 7, 88],
      [34, 80],
      [39, 82],
      [48, 91],
      [57, 82],
      [62, 80],
      [right - 7, 88],
      [right - 3, 112],
    ],
    p.jacket
  );
  poly(
    c,
    [
      [36, 81],
      [48, 88],
      [59, 81],
      [56, 112],
      [38, 112],
    ],
    p.shirt
  );
  poly(
    c,
    [
      [34, 80],
      [40, 85],
      [38, 112],
      [30, 112],
      [29, 92],
    ],
    p.shadow
  );
  poly(
    c,
    [
      [60, 80],
      [56, 86],
      [57, 112],
      [67, 112],
      [66, 91],
    ],
    p.shadow
  );
  poly(
    c,
    [
      [35, 78],
      [45, 86],
      [38, 96],
      [31, 85],
    ],
    shade(p.jacket, 30)
  );
  poly(
    c,
    [
      [61, 78],
      [51, 86],
      [57, 96],
      [66, 85],
    ],
    shade(p.jacket, 14)
  );
  c.line(37, 97, 37, 111, ink);
  c.line(57, 97, 57, 111, ink);
  c.line(left + 10, 89, left + 7, 108, shade(p.jacket, 32));
  c.line(right - 11, 91, right - 8, 109, p.shadow);
  c.line(left + 14, 98, left + 15, 111, p.shadow);
  c.line(right - 15, 99, right - 16, 111, shade(p.jacket, 20));
  c.line(43, 98, 51, 98, shade(p.shirt, -30));
  if (index === 1) {
    // soft hood, drawstrings and pocket stitching
    c.line(34, 82, 27, 87, p.shirt);
    c.line(27, 87, 32, 94, p.shirt);
    c.line(62, 82, 69, 87, p.shirt);
    c.line(69, 87, 64, 94, p.shirt);
    c.rect(40, 90, 1, 13, p.shirt);
    c.rect(54, 90, 1, 13, p.shirt);
    c.rect(39, 101, 3, 3, ink);
    c.rect(53, 101, 3, 3, ink);
  } else if (index === 2) {
    c.rect(19, 89, 9, 3, p.shirt);
    c.rect(20, 90, 3, 1, '#e4f8ff');
    c.line(69, 91, 72, 105, p.shirt);
    c.rect(61, 100, 7, 5, ink);
    c.rect(62, 101, 5, 1, p.shirt);
  } else if (index === 4) {
    for (let y = 91; y < 112; y += 4) {
      c.line(42, y, 52, y, shade(p.shirt, -24));
      c.rect(left + 8, y, 3, 1, shade(p.jacket, 16));
    }
  } else {
    c.rect(left + 16, 98, 9, 7, p.shadow);
    c.rect(left + 16, 98, 9, 1, shade(p.jacket, 34));
    for (let y = 96; y < 112; y += 7) c.rect(59, y, 2, 2, index === 5 ? '#fff0ad' : '#d8c6a0');
  }
  return c;
}

function eyes(index, female) {
  const c = make(),
    color = EYE_COLORS[index];
  for (const x of [32, 54]) {
    c.line(x, 39, x + 9, 38, ink);
    c.line(x + 1, 40, x + 9, 39, ink);
    c.rect(x, 44, 10, 6, ink);
    c.rect(x + 1, 45, 8, 5, '#fff2de');
    c.rect(x + 4, 45, 4, 5, color);
    c.rect(x + 5, 45, 2, 4, ink);
    c.pixel(x + 4, 45, '#ffffff');
    c.rect(x + 2, 50, 6, 1, '#705344');
    if (female) {
      c.line(x - 1, 42, x + 2, 44, ink);
      c.pixel(x + 9, 43, ink);
    }
  }
  return c;
}

// Neutral silver uses the same per-channel palette transfer as the walking sprite.
const h = { dark: '#a8a4a0', base: '#dcd8d4', light: '#ffffff', mid: '#ece8e4' };
function hair(style, back = false) {
  const c = make();
  if (back) {
    if (style === 1 || style === 4 || style === 5) {
      const end = style === 1 ? 84 : style === 4 ? 104 : 77;
      poly(
        c,
        [
          [28, 26],
          [62, 22],
          [73, 35],
          [76, end - 7],
          [66, end],
          [57, end - 8],
          [27, end],
          [20, end - 7],
          [23, 38],
        ],
        ink
      );
      poly(
        c,
        [
          [27, 33],
          [65, 30],
          [70, 40],
          [71, end - 10],
          [66, end - 4],
          [59, end - 13],
          [28, end - 5],
          [25, end - 10],
        ],
        h.dark
      );
      c.line(28, 40, 28, end - 9, h.base);
      c.line(67, 42, 68, end - 12, h.base);
      if (style === 5) {
        poly(
          c,
          [
            [67, 30],
            [80, 31],
            [85, 45],
            [83, 70],
            [74, 81],
            [75, 54],
            [68, 46],
          ],
          ink
        );
        poly(
          c,
          [
            [70, 33],
            [78, 34],
            [81, 46],
            [79, 68],
            [77, 72],
            [78, 50],
            [70, 44],
          ],
          h.base
        );
      }
    }
    return c;
  }
  poly(
    c,
    [
      [22, 43],
      [21, 27],
      [26, 18],
      [35, 12],
      [52, 10],
      [66, 16],
      [73, 26],
      [73, 49],
      [67, 56],
      [64, 35],
      [57, 32],
      [49, 36],
      [43, 29],
      [36, 35],
      [29, 32],
      [27, 52],
    ],
    ink
  );
  poly(
    c,
    [
      [24, 40],
      [24, 28],
      [29, 20],
      [36, 15],
      [51, 13],
      [64, 19],
      [70, 28],
      [70, 45],
      [68, 47],
      [66, 32],
      [57, 29],
      [49, 33],
      [43, 26],
      [35, 32],
      [29, 29],
    ],
    h.base
  );
  poly(
    c,
    [
      [54, 16],
      [64, 20],
      [70, 29],
      [70, 45],
      [68, 47],
      [66, 32],
      [58, 30],
      [53, 25],
    ],
    h.dark
  );
  poly(
    c,
    [
      [29, 23],
      [36, 18],
      [49, 16],
      [56, 19],
      [43, 20],
      [36, 24],
    ],
    h.light
  );
  c.line(28, 25, 25, 34, h.mid);
  c.line(46, 23, 50, 29, h.mid);
  c.line(60, 22, 65, 26, h.mid);
  c.line(39, 18, 35, 28, h.dark);
  c.line(54, 20, 57, 27, h.dark);
  if (style === 1) {
    // bob: curved side locks
    for (const [x, flip] of [
      [24, 1],
      [70, -1],
    ]) {
      poly(
        c,
        [
          [x, 30],
          [x + 4 * flip, 34],
          [x + 4 * flip, 60],
          [x + 9 * flip, 71],
          [x, 68],
          [x - 3 * flip, 55],
        ],
        ink
      );
      poly(
        c,
        [
          [x, 35],
          [x + 2 * flip, 38],
          [x + 2 * flip, 59],
          [x + 5 * flip, 66],
          [x, 63],
        ],
        h.base
      );
      c.line(x, 38, x, 59, h.mid);
    }
  }
  if (style === 2) {
    // textured, tousled locks
    for (const [x, y] of [
      [24, 22],
      [34, 15],
      [45, 13],
      [56, 17],
      [64, 23],
    ]) {
      poly(
        c,
        [
          [x - 2, y + 7],
          [x, y - 4],
          [x + 8, y],
          [x + 10, y + 9],
          [x + 4, y + 6],
        ],
        ink
      );
      poly(
        c,
        [
          [x, y + 4],
          [x + 1, y - 1],
          [x + 6, y + 1],
          [x + 7, y + 6],
        ],
        h.base
      );
      c.line(x + 1, y, x + 5, y + 1, h.light);
    }
  }
  if (style === 3) {
    poly(
      c,
      [
        [27, 24],
        [30, 7],
        [39, 15],
        [46, 2],
        [53, 13],
        [64, 6],
        [68, 24],
      ],
      ink
    );
    poly(
      c,
      [
        [30, 22],
        [32, 12],
        [39, 19],
        [46, 7],
        [52, 19],
        [62, 12],
        [65, 24],
      ],
      h.base
    );
    c.line(46, 9, 43, 19, h.light);
    c.line(60, 15, 56, 23, h.dark);
  }
  if (style === 4) {
    poly(
      c,
      [
        [26, 28],
        [35, 30],
        [32, 59],
        [30, 85],
        [25, 103],
        [19, 97],
        [23, 67],
      ],
      ink
    );
    poly(
      c,
      [
        [27, 33],
        [31, 33],
        [28, 61],
        [27, 85],
        [23, 96],
        [22, 94],
        [26, 64],
      ],
      h.base
    );
    c.line(28, 39, 25, 77, h.light);
  }
  if (style === 5) {
    poly(
      c,
      [
        [28, 23],
        [41, 17],
        [57, 20],
        [66, 29],
        [61, 36],
        [49, 32],
        [39, 35],
        [29, 31],
      ],
      h.base
    );
    c.line(30, 25, 42, 21, h.light);
    c.rect(71, 34, 5, 4, '#d78b62');
  }
  return c;
}

function accessory(index) {
  const c = make();
  if (index === 1) {
    for (const x of [29, 52]) {
      c.rect(x, 42, 16, 2, ink);
      c.rect(x, 44, 2, 10, ink);
      c.rect(x + 14, 44, 2, 10, ink);
      c.rect(x + 2, 54, 12, 2, ink);
      c.rect(x + 2, 44, 6, 1, '#a9c8d0');
      c.pixel(x + 2, 53, '#a9c8d0');
    }
    c.rect(45, 45, 7, 2, ink);
    c.line(25, 44, 29, 45, ink);
    c.line(68, 45, 72, 43, ink);
  }
  if (index === 2) {
    for (const x of [26, 63]) {
      c.rect(x, 83, 7, 29, ink);
      c.rect(x + 1, 83, 4, 29, '#9f7048');
      c.line(x + 1, 85, x + 1, 109, '#d2a269');
      c.rect(x - 1, 101, 9, 6, '#ead19a');
      c.rect(x + 1, 103, 5, 2, '#674533');
    }
  }
  if (index === 3) {
    poly(
      c,
      [
        [23, 25],
        [27, 10],
        [36, 5],
        [59, 5],
        [68, 11],
        [73, 25],
        [85, 29],
        [85, 34],
        [11, 34],
        [11, 29],
      ],
      '#57402e'
    );
    poly(
      c,
      [
        [26, 25],
        [30, 12],
        [37, 8],
        [58, 8],
        [65, 13],
        [70, 26],
      ],
      '#cba363'
    );
    poly(
      c,
      [
        [31, 12],
        [38, 9],
        [56, 9],
        [62, 12],
        [33, 14],
      ],
      '#edcc88'
    );
    c.rect(25, 23, 47, 5, '#793e36');
    c.rect(14, 29, 68, 3, '#edcc88');
    c.rect(19, 32, 57, 1, '#aa7b45');
    for (let x = 33; x < 63; x += 5) c.line(x, 16, x - 2, 21, '#aa7b45');
    c.rect(60, 24, 7, 3, '#d18160');
  }
  if (index === 4) {
    // headphones
    poly(
      c,
      [
        [20, 48],
        [20, 25],
        [27, 15],
        [38, 10],
        [58, 10],
        [69, 15],
        [76, 26],
        [76, 48],
        [71, 48],
        [71, 28],
        [65, 19],
        [57, 16],
        [38, 16],
        [29, 20],
        [25, 28],
        [25, 48],
      ],
      ink
    );
    c.line(28, 17, 38, 13, '#9bafd0');
    c.line(38, 13, 56, 13, '#9bafd0');
    for (const x of [19, 69]) {
      c.rect(x, 40, 9, 21, ink);
      c.rect(x + 2, 42, 5, 17, '#566a90');
      c.rect(x + 2, 44, 2, 12, '#8aa5c5');
      c.rect(x + 3, 48, 3, 5, '#66bdd1');
    }
  }
  if (index === 5) {
    // warm scarf, same accessory as the world sprite
    poly(
      c,
      [
        [33, 73],
        [44, 78],
        [59, 73],
        [65, 78],
        [60, 87],
        [55, 89],
        [58, 107],
        [49, 111],
        [43, 88],
        [34, 86],
        [29, 79],
      ],
      ink
    );
    poly(
      c,
      [
        [34, 76],
        [45, 81],
        [59, 76],
        [61, 80],
        [57, 84],
        [44, 85],
        [35, 83],
        [32, 79],
      ],
      '#d6654c'
    );
    poly(
      c,
      [
        [45, 86],
        [53, 87],
        [55, 105],
        [50, 107],
      ],
      '#a9433e'
    );
    c.line(35, 78, 44, 83, '#ef9c65');
    c.line(47, 89, 50, 104, '#e77a50');
    c.rect(49, 106, 7, 2, '#ef9c65');
  }
  return c;
}

const sheets = [
  ['portrait-body', Array.from({ length: 18 }, (_, i) => body(i % 9, i >= 9))],
  ['portrait-outfit', Array.from({ length: 12 }, (_, i) => clothes(i % 6, i >= 6))],
  ['portrait-eyes', Array.from({ length: 10 }, (_, i) => eyes(i % 5, i >= 5))],
  ['portrait-hair-back', Array.from({ length: 6 }, (_, i) => hair(i, true))],
  ['portrait-hair', Array.from({ length: 6 }, (_, i) => hair(i))],
  ['portrait-accessory', Array.from({ length: 6 }, (_, i) => accessory(i))],
];
const manifest = [];
for (const [name, frames] of sheets) {
  const native = `${source}/${name}.ase`;
  await fs.writeFile(native, aseDocument({ names: [name], frames: frames.map((f) => [f]) }));
  execFileSync(
    'C:/Program Files/LibreSprite/libresprite.exe',
    [
      '--batch',
      native,
      '--sheet',
      `${output}/${name}.png`,
      '--sheet-width',
      String(W * frames.length),
      '--data',
      `${source}/${name}.json`,
      '--format',
      'json-array',
    ],
    { stdio: 'pipe' }
  );
  // Re-save through LibreSprite so the editable source follows its native format.
  execFileSync(
    'C:/Program Files/LibreSprite/libresprite.exe',
    ['--batch', native, '--save-as', native],
    { stdio: 'pipe' }
  );
  manifest.push({
    name,
    width: W,
    height: H,
    frames: frames.length,
    source: native,
    exporter: 'LibreSprite 1.3',
    provenance: 'Original layered pixel art; scripts/build-mundinho-portraits.mjs',
  });
  await fs.writeFile(
    `${output}/${name}.png.json`,
    JSON.stringify(
      {
        prompt: `Origin: original pixel art authored in scripts/build-mundinho-portraits.mjs; exported from ${native} using LibreSprite 1.3. Layer: ${name}. No external image or AI image generator used.`,
      },
      null,
      2
    ) + '\n'
  );
}
await fs.writeFile(`${source}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
// Review every accessory and both silhouettes against a dark dialogue background.
const previews = [];
for (let i = 0; i < 12; i++) {
  const female = i >= 6;
  const layers = [
    hair(i % 6, true),
    body(i % 9, female),
    clothes(i % 6, female),
    eyes(i % 5, female),
    hair(i % 6),
    accessory(i % 6),
  ];
  const bytes = await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
    .composite(layers.map((c) => ({ input: c.data, raw: { width: W, height: H, channels: 4 } })))
    .png()
    .toBuffer();
  previews.push({ input: bytes, left: (i % 6) * W, top: Math.floor(i / 6) * H });
}
await sharp({ create: { width: W * 6, height: H * 2, channels: 4, background: '#000000' } })
  .composite(previews)
  .png()
  .toFile(`${source}/catalog.png`);
console.log(
  'LibreSprite exported 58 portrait layers: two silhouettes, 9 skins, 6 outfits, 5 eyes, 6 hairstyles and 6 accessories. Hair colors are transferred at runtime.'
);
