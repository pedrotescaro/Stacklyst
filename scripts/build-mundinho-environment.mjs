import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { canvas, aseDocument } from './lib/mundinho-pixel-art.mjs';

const libreSprite = process.env.LIBRESPRITE_BIN || 'C:/Program Files/LibreSprite/libresprite.exe';
const source = 'artifacts/mundinho/libresprite/environment';
const output = 'public/assets/mundinho';
const scratch = '.tmp/mundinho-environment';
await Promise.all([source, output, scratch].map((dir) => fs.mkdir(dir, { recursive: true })));
const rng = (seed) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};

// All strokes land on native pixels; source documents keep materials on editable layers.
const greens = ['#203d34', '#2a4a35', '#365e3b', '#497644', '#628e4b', '#81a65b', '#a5bb75'];
function crown(c, x, y, rx, ry, tone, variant) {
  const edge = [
    [-1, -0.12],
    [-0.91, -0.48],
    [-0.64, -0.56],
    [-0.55, -0.83],
    [-0.21, -0.86],
    [-0.02, -1],
    [0.34, -0.89],
    [0.46, -0.71],
    [0.78, -0.6],
    [0.82, -0.32],
    [1, -0.05],
    [0.92, 0.32],
    [0.72, 0.45],
    [0.65, 0.73],
    [0.31, 0.77],
    [0.12, 0.96],
    [-0.22, 0.86],
    [-0.37, 0.7],
    [-0.68, 0.65],
    [-0.75, 0.34],
    [-0.94, 0.26],
  ];
  const shape = (dx, dy, scale) =>
    edge.map(([xx, yy], i) => [
      x + xx * rx * scale + dx + (i % 4 === variant ? 1 : 0),
      y + yy * ry * scale + dy,
    ]);
  c.polygon(shape(0, 1, 1), greens[0]);
  c.polygon(shape(-1, -1, 0.94), greens[tone]);
  // The light is an offset leaf mass, not a concentric ring.
  c.polygon(
    [
      [x - rx * 0.75, y - ry * 0.3],
      [x - rx * 0.55, y - ry * 0.65],
      [x - rx * 0.15, y - ry * 0.78],
      [x + rx * 0.25, y - ry * 0.62],
      [x + rx * 0.43, y - ry * 0.23],
      [x + rx * 0.12, y - ry * 0.05],
      [x - rx * 0.16, y - ry * 0.14],
      [x - rx * 0.4, y + ry * 0.07],
    ],
    greens[Math.min(tone + 1, 5)]
  );
}

function trees() {
  const frames = [];
  for (let variant = 0; variant < 3; variant++) {
    const shadow = canvas(176, 160),
      wood = canvas(176, 160),
      foliage = canvas(176, 160),
      accents = canvas(176, 160);
    shadow.ellipse(91, 150, 35, 7, '#163b2b1c');
    shadow.ellipse(90, 151, 24, 5, '#163b2b36');
    wood.polygon(
      [
        [81, 104],
        [95, 102],
        [95, 137],
        [99, 149],
        [106, 155],
        [94, 156],
        [88, 152],
        [79, 157],
        [72, 156],
        [80, 147],
      ],
      '#342e25'
    );
    wood.polygon(
      [
        [83, 106],
        [91, 106],
        [91, 144],
        [95, 152],
        [89, 149],
        [80, 153],
        [84, 142],
      ],
      '#8d6b43'
    );
    wood.line(84, 114, 84, 144, '#bb9257');
    wood.line(89, 119, 88, 137, '#6c5237');
    wood.line(93, 111, 93, 144, '#5d4933');
    wood.line(81, 151, 76, 154, '#a6814b');
    wood.line(93, 147, 99, 153, '#6c5237');
    wood.polygon(
      [
        [83, 124],
        [69, 105],
        [63, 92],
        [67, 91],
        [77, 106],
        [87, 112],
      ],
      '#6a5235'
    );
    wood.polygon(
      [
        [91, 118],
        [106, 102],
        [110, 86],
        [113, 88],
        [110, 106],
        [94, 130],
      ],
      '#4c3e2d'
    );
    wood.line(72, 105, 82, 116, '#a07b46');
    wood.line(97, 112, 106, 102, '#96723e');
    wood.ellipse(87, 134, 2, 4, '#4f3f2c');
    wood.line(86, 133, 87, 137, '#bc955d');
    // Deliberately asymmetric crowns, with separate hanging lower boughs.
    const masses =
      variant === 1
        ? [
            [83, 94, 31, 26, 2],
            [58, 86, 23, 25, 3],
            [111, 86, 26, 28, 2],
            [68, 58, 28, 28, 3],
            [100, 51, 26, 29, 4],
            [87, 76, 29, 26, 4],
          ]
        : variant === 2
          ? [
              [90, 100, 34, 22, 2],
              [57, 87, 26, 23, 3],
              [118, 83, 25, 27, 2],
              [65, 59, 27, 24, 4],
              [100, 53, 32, 26, 3],
              [89, 77, 30, 24, 4],
            ]
          : [
              [86, 98, 33, 24, 2],
              [55, 86, 25, 23, 3],
              [116, 86, 27, 25, 2],
              [64, 57, 29, 26, 3],
              [100, 52, 30, 29, 4],
              [86, 78, 30, 26, 4],
            ];
    for (let i = 0; i < masses.length; i++) crown(foliage, ...masses[i], (i + variant) % 4);
    const random = rng(170 + variant);
    for (let i = 0; i < 155; i++) {
      const x = 34 + Math.floor(random() * 106),
        y = 27 + Math.floor(random() * 94);
      const p = (y * 176 + x) * 4;
      if (!foliage.data[p + 3]) continue;
      const bright = foliage.data[p + 1] > 110;
      const color = bright ? (i % 4 ? greens[5] : greens[6]) : greens[3];
      accents.line(x, y, x + 2, y - 1, color);
      accents.pixel(x + 3, y - 1, color);
      if (i % 3 === 0) accents.pixel(x + 1, y + 1, bright ? greens[4] : greens[1]);
    }
    // Moss at the roots and a few sunlit grass blades ground the trunk.
    accents.line(77, 153, 82, 151, '#527345');
    accents.line(97, 154, 102, 154, '#406239');
    accents.line(75, 156, 73, 152, '#77964c');
    accents.line(101, 156, 104, 152, '#52793f');
    frames.push([shadow, wood, foliage, accents]);
  }
  return { names: ['Sombra', 'Tronco e galhos', 'Copa', 'Folhas e musgo'], frames };
}

function cabin() {
  const shadow = canvas(176, 160),
    building = canvas(176, 160),
    roof = canvas(176, 160),
    details = canvas(176, 160);
  shadow.polygon(
    [
      [21, 140],
      [139, 141],
      [160, 132],
      [170, 146],
      [148, 158],
      [24, 158],
      [13, 151],
    ],
    '#203a2d38'
  );
  // Stone footings and the darker right facade establish the viewing angle.
  building.polygon(
    [
      [24, 77],
      [137, 77],
      [157, 67],
      [157, 142],
      [137, 154],
      [24, 154],
    ],
    '#3b352c'
  );
  building.rect(27, 82, 108, 62, '#a57a4a');
  building.polygon(
    [
      [137, 81],
      [154, 72],
      [154, 140],
      [137, 150],
    ],
    '#725637'
  );
  for (let y = 86; y < 141; y += 7) {
    building.line(28, y, 133, y, '#715236');
    building.line(29, y + 1, 133, y + 1, '#c3955a');
    building.line(139, y, 153, y - 8, '#4e412f');
    building.line(139, y + 1, 153, y - 7, '#8b6b41');
  }
  for (const [x, y, w] of [
    [32, 91, 13],
    [92, 98, 14],
    [44, 129, 16],
    [102, 135, 19],
    [72, 91, 8],
  ]) {
    building.line(x, y, x + w, y, '#8c623b');
    building.pixel(x + w + 1, y - 1, '#8c623b');
  }
  for (const x of [27, 70, 132]) {
    building.rect(x, 82, 5, 62, '#5c432e');
    building.line(x + 1, 84, x + 1, 141, '#bf9258');
  }
  building.rect(25, 142, 112, 11, '#6f7263');
  building.polygon(
    [
      [138, 143],
      [155, 134],
      [155, 142],
      [138, 153],
    ],
    '#4d594f'
  );
  for (let y = 144; y < 153; y += 5)
    for (let x = 27 + (y % 2 ? 0 : 5); x < 133; x += 13) {
      building.rect(x, y, 10, 3, '#95937b');
      building.line(x, y, x + 9, y, '#b3ad8b');
      building.pixel(x + 8, y + 2, '#555f53');
    }
  // An inset framed door, three stone steps and a brass handle.
  details.rect(80, 101, 28, 45, '#453829');
  details.rect(83, 104, 22, 42, '#6a4a30');
  details.line(84, 105, 84, 143, '#c28c4e');
  details.line(88, 106, 88, 142, '#8c623a');
  details.line(100, 106, 100, 143, '#392f25');
  details.rect(88, 110, 12, 10, '#3d4137');
  details.rect(89, 111, 10, 8, '#c0cdb2');
  details.line(90, 112, 93, 112, '#eff0cb');
  details.line(94, 111, 94, 118, '#6a4b30');
  details.rect(100, 127, 2, 4, '#d9b262');
  details.pixel(100, 127, '#ffe5a1');
  for (const [y, x, w, color] of [
    [146, 78, 33, '#b5ad8a'],
    [150, 76, 37, '#8a8c77'],
    [154, 74, 41, '#6e7967'],
  ]) {
    details.rect(x, y, w, 3, color);
    details.line(x, y, x + w - 1, y, '#d0c49a');
  }
  for (const x of [39, 113]) {
    details.rect(x - 2, 99, 24, 28, '#503c2d');
    details.rect(x, 101, 20, 22, '#9ab7ac');
    details.rect(x + 2, 103, 7, 8, '#dce2bb');
    details.rect(x + 11, 103, 7, 8, '#b9d0bb');
    details.rect(x + 2, 114, 7, 7, '#7b9e94');
    details.rect(x + 11, 114, 7, 7, '#b2bfa1');
    details.rect(x + 9, 101, 2, 22, '#5f4b32');
    details.rect(x, 112, 20, 2, '#604c33');
    details.line(x - 2, 99, x + 21, 99, '#dcad68');
    details.rect(x - 4, 125, 28, 3, '#b5884d');
    details.rect(x - 1, 129, 21, 6, '#634d33');
    details.line(x, 130, x + 18, 130, '#bb8851');
    for (let i = 0; i < 5; i++) {
      details.line(x + 2 + i * 4, 130, x + 1 + i * 4, 125 - (i % 2), '#426b3b');
      details.rect(x + i * 4, 124 - (i % 2), 3, 2, i % 2 ? '#c99591' : '#e4cf9a');
      details.pixel(x + i * 4 + 1, 123 - (i % 2), '#f3dfb2');
    }
  }
  // Chimney sits behind the roof. No smoke obscures the walking space.
  building.rect(117, 10, 15, 33, '#4d4f47');
  building.rect(119, 12, 11, 28, '#9d9681');
  for (let y = 14; y < 38; y += 6) {
    building.line(119, y, 129, y, '#626b60');
    building.line(y % 4 ? 122 : 126, y, y % 4 ? 122 : 126, y + 5, '#626b60');
  }
  building.rect(115, 9, 19, 4, '#c4b79b');
  building.rect(118, 8, 13, 2, '#4f5147');
  roof.polygon(
    [
      [8, 85],
      [42, 23],
      [122, 23],
      [169, 73],
      [141, 92],
      [17, 93],
    ],
    '#3f3530'
  );
  roof.polygon(
    [
      [13, 84],
      [44, 27],
      [120, 27],
      [139, 85],
    ],
    '#a76145'
  );
  roof.polygon(
    [
      [123, 28],
      [164, 73],
      [141, 85],
    ],
    '#754c3d'
  );
  // Individual overlapping clay shingles narrow toward the ridge.
  for (let row = 0; row < 8; row++) {
    const y = 30 + row * 7,
      left = 43 - row * 4,
      right = 121 + row * 2;
    for (let x = left - (row % 2) * 5; x < right; x += 11) {
      const start = Math.max(x, left),
        end = Math.min(x + 9, right);
      if (end <= start) continue;
      roof.rect(start, y, end - start, 4, (row + Math.floor(x / 11)) % 3 ? '#b87551' : '#99583e');
      roof.line(start, y, end - 1, y, '#d49765');
      roof.line(start, y + 4, end, y + 4, '#6e4637');
      roof.pixel(end, y + 3, '#724637');
    }
  }
  for (let i = 0; i < 6; i++)
    roof.line(126 + i * 5, 37 + i * 6, 141 + i * 3, 83 - i * 2, '#b27852');
  roof.line(43, 25, 121, 25, '#e0ad75');
  roof.line(12, 85, 139, 86, '#d3935e');
  roof.rect(16, 88, 123, 5, '#5a3c2e');
  roof.line(19, 89, 136, 89, '#b47c4b');
  roof.line(141, 88, 166, 74, '#b28051');
  // A small dormer breaks the large roof plane without changing its footprint.
  roof.polygon(
    [
      [44, 63],
      [62, 40],
      [83, 64],
      [80, 69],
      [47, 69],
    ],
    '#46362b'
  );
  roof.polygon(
    [
      [48, 62],
      [62, 45],
      [78, 63],
      [77, 67],
      [49, 67],
    ],
    '#cb9960'
  );
  roof.rect(57, 54, 12, 12, '#493f31');
  roof.rect(59, 56, 8, 8, '#b9c9ab');
  roof.line(63, 56, 63, 63, '#6c5237');
  roof.line(59, 60, 66, 60, '#6c5237');
  roof.line(43, 62, 62, 39, '#c08a59');
  roof.line(63, 40, 84, 63, '#86533a');
  details.line(32, 141, 37, 125, '#3d633d');
  for (let i = 0; i < 6; i++) {
    details.rect(30 + (i % 2) * 4, 127 + i * 2, 4, 3, i % 2 ? '#6b8d4d' : '#4c7541');
  }
  return {
    names: ['Sombra', 'Estrutura', 'Telhado', 'Janelas e detalhes'],
    frames: [[shadow, building, roof, details]],
  };
}

const shoreline = [
  [45, 24],
  [79, 12],
  [104, 15],
  [123, 10],
  [146, 20],
  [167, 25],
  [183, 46],
  [186, 70],
  [197, 91],
  [187, 109],
  [185, 136],
  [168, 151],
  [155, 173],
  [134, 179],
  [115, 184],
  [89, 176],
  [64, 178],
  [49, 165],
  [30, 157],
  [20, 133],
  [17, 108],
  [25, 89],
  [20, 67],
  [32, 43],
];
function pond() {
  const bank = canvas(208, 200),
    water = canvas(208, 200),
    life = canvas(208, 200),
    reflections = canvas(208, 200);
  bank.polygon(shoreline, '#5d8253');
  const mask = bank.data;
  const inside = (x, y) =>
    x >= 0 && y >= 0 && x < 208 && y < 200 && mask[(y * 208 + x) * 4 + 3] > 0;
  const random = rng(619);
  for (let y = 10; y < 187; y++)
    for (let x = 14; x < 200; x++) {
      if (!inside(x, y)) continue;
      let distance = 20;
      for (let i = 0; i < shoreline.length; i++) {
        const a = shoreline[i],
          b = shoreline[(i + 1) % shoreline.length];
        const dx = b[0] - a[0],
          dy = b[1] - a[1];
        const t = Math.max(
          0,
          Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))
        );
        distance = Math.min(distance, Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t));
      }
      if (distance < 3) {
        if ((x + y * 3) % 7 < 2) bank.pixel(x, y, '#92a870');
      } else if (distance < 6) {
        bank.pixel(x, y, random() > 0.3 ? '#8b9671' : '#afa681');
      } else {
        const shallow = distance < 12;
        const depth = Math.sin(x / 31) + Math.cos(y / 27);
        const color = shallow
          ? (x + y) % 4
            ? '#4a9290'
            : '#6da29a'
          : distance < 19 && random() > 0.3
            ? '#387d83'
            : depth > 0.3
              ? '#326d79'
              : '#2b606f';
        water.pixel(x, y, color);
        if (distance < 8 && y > 90 && x % 5 < 4) reflections.pixel(x, y, '#9abcb0');
      }
    }
  const rock = (x, y, w, h) => {
    life.ellipse(x + 1, y + 2, w + 1, h, '#284a4148');
    life.polygon(
      [
        [x - w, y],
        [x - w + 2, y - h],
        [x + 1, y - h - 1],
        [x + w, y - 2],
        [x + w - 1, y + h],
        [x - w + 2, y + h],
      ],
      '#515e53'
    );
    life.polygon(
      [
        [x - w + 1, y - 1],
        [x - w + 3, y - h + 1],
        [x, y - h],
        [x + w - 2, y - 2],
        [x + w - 3, y + 1],
        [x - 2, y + 2],
      ],
      '#a0a38a'
    );
    life.line(x - w + 3, y - h + 1, x - 1, y - h + 1, '#c1bea0');
    life.pixel(x + w - 2, y, '#6f7e6b');
  };
  for (const args of [
    [39, 34, 6, 4],
    [31, 41, 4, 3],
    [148, 23, 7, 4],
    [159, 29, 4, 3],
    [182, 106, 5, 4],
    [163, 159, 8, 5],
    [153, 170, 4, 3],
    [33, 145, 6, 4],
    [86, 175, 5, 3],
  ])
    rock(...args);
  for (const [x, y] of [
    [35, 67],
    [27, 114],
    [139, 178],
    [176, 59],
  ]) {
    for (let i = 0; i < 6; i++) {
      const length = 9 + (i % 3) * 3,
        dx = (i - 3) * 2;
      life.line(x + i - 3, y + 3, x + dx, y - length, '#3d6644');
      life.line(x + i - 2, y + 2, x + dx + 1, y - length + 1, '#7d9c56');
      if (i % 2 === 0) {
        life.rect(x + dx, y - length, 2, 5, '#715840');
        life.pixel(x + dx, y - length, '#bb9b66');
      }
    }
  }
  // Broken reflections and submerged stones follow the water mask.
  for (let i = 0; i < 80; i++) {
    const x = 36 + Math.floor(random() * 140),
      y = 35 + Math.floor(random() * 126);
    if (!water.data[(y * 208 + x) * 4 + 3]) continue;
    const length = 3 + Math.floor(random() * 8);
    for (let j = 0; j < length; j++) {
      if (water.data[(y * 208 + x + j) * 4 + 3])
        reflections.pixel(x + j, y, i % 5 ? '#528e93' : '#7caaa3');
    }
  }
  for (const [x, y, r] of [
    [124, 63, 6],
    [135, 69, 4],
    [142, 126, 7],
    [127, 133, 4],
  ]) {
    life.ellipse(x + 1, y + 2, r + 1, 3, '#285b6655');
    life.ellipse(x, y, r, Math.max(2, r - 2), '#365f3d');
    life.ellipse(x - 1, y - 1, r - 1, Math.max(1, r - 3), '#75995b');
    life.line(x, y, x + r, y + 1, '#2f6264');
    life.pixel(x - 2, y - 2, '#a1b673');
  }
  for (const [x, y] of [
    [121, 61],
    [140, 122],
  ]) {
    life.polygon(
      [
        [x - 3, y],
        [x - 2, y - 3],
        [x, y - 1],
        [x + 1, y - 4],
        [x + 3, y - 1],
        [x + 4, y],
        [x + 1, y + 2],
      ],
      '#e0b5af'
    );
    life.line(x - 1, y - 1, x + 2, y - 1, '#fff0d0');
    life.pixel(x + 1, y, '#d5ad66');
  }
  return {
    names: ['Margem', 'Agua', 'Pedras e plantas', 'Reflexos'],
    frames: [[bank, water, life, reflections]],
  };
}

function flowers() {
  const frames = [];
  const colors = [
    ['#ece1b6', '#fff3d0', '#c8b77f'],
    ['#d9b65f', '#f5d782', '#ae8549'],
    ['#a99cbf', '#c9b8d8', '#7d729d'],
    ['#cb939c', '#ebbac0', '#a46b7c'],
    ['#b86f69', '#da9b89', '#8f524f'],
    ['#8cb6c4', '#bbd6d7', '#608a9e'],
  ];
  for (let variant = 0; variant < colors.length; variant++) {
    const stems = canvas(32, 32),
      blooms = canvas(32, 32);
    stems.ellipse(16, 27, 10, 2, '#254c352e');
    for (const [x, y] of [
      [10, 15],
      [17, 10],
      [23, 17],
    ]) {
      stems.line(16, 27, x, y + 2, '#345f3a');
      stems.line(17, 27, x + 1, y + 3, '#70944d');
      stems.polygon(
        [
          [14, 25],
          [9, 23],
          [7, 19],
          [12, 21],
        ],
        '#68934d'
      );
      stems.polygon(
        [
          [18, 25],
          [24, 23],
          [26, 20],
          [20, 22],
        ],
        '#49763f'
      );
      const [base, light, dark] = colors[variant];
      if (variant === 2) {
        blooms.line(x, y + 3, x + 1, y - 4, dark);
        for (let i = 0; i < 4; i++) {
          blooms.rect(x - 1 + (i % 2), y - i * 2, 3, 2, i % 2 ? base : light);
        }
      } else {
        blooms.pixel(x - 2, y, dark);
        blooms.rect(x - 1, y - 3, 2, 2, light);
        blooms.rect(x - 3, y - 1, 2, 2, base);
        blooms.rect(x + 1, y - 1, 2, 2, light);
        blooms.rect(x - 1, y + 1, 2, 2, base);
        blooms.rect(x - 1, y - 1, 2, 2, variant === 1 ? '#8f703d' : '#ceaa59');
        blooms.pixel(x - 1, y - 1, '#f0d98b');
      }
    }
    frames.push([stems, blooms]);
  }
  return { names: ['Caules e folhas', 'Petalas'], frames };
}

const manifest = [];
for (const [name, document] of [
  ['trees', trees()],
  ['cabin', cabin()],
  ['pond', pond()],
  ['flowers', flowers()],
]) {
  const draft = `${scratch}/${name}.ase`,
    native = `${source}/${name}.ase`,
    png = `${output}/${name}.png`;
  await fs.writeFile(draft, aseDocument(document));
  execFileSync(libreSprite, ['--batch', draft, '--save-as', native], { stdio: 'pipe' });
  execFileSync(
    libreSprite,
    [
      '--batch',
      native,
      '--sheet',
      png,
      '--sheet-width',
      String(document.frames[0][0].width * document.frames.length),
      '--data',
      `${source}/${name}.json`,
      '--format',
      'json-array',
    ],
    { stdio: 'pipe' }
  );
  const metadata = await sharp(png).metadata();
  if (
    metadata.width !== document.frames[0][0].width * document.frames.length ||
    metadata.height !== document.frames[0][0].height ||
    !metadata.hasAlpha
  )
    throw new Error(`Invalid sprite export: ${name}`);
  manifest.push({
    name,
    png,
    native,
    width: document.frames[0][0].width,
    height: document.frames[0][0].height,
    variants: document.frames.length,
    layers: document.names,
    exporter: 'LibreSprite 1.3',
  });
}
await fs.writeFile(`${source}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
const review = await sharp({
  create: { width: 704, height: 368, channels: 4, background: '#40764f' },
})
  .composite([
    { input: `${output}/trees.png`, left: 0, top: 0 },
    { input: `${output}/cabin.png`, left: 528, top: 0 },
    { input: `${output}/pond.png`, left: 8, top: 164 },
    {
      input: await sharp(`${output}/flowers.png`)
        .resize(384, 64, { kernel: 'nearest' })
        .png()
        .toBuffer(),
      left: 256,
      top: 230,
    },
  ])
  .png()
  .toBuffer();
await sharp(review)
  .resize(1408, 736, { kernel: 'nearest' })
  .png()
  .toFile('artifacts/mundinho/environment-review.png');
console.log(
  'LibreSprite exported trees (3), cabin, pond and flowers (6), with layered native sources.'
);
