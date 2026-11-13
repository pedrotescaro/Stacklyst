// Layered 96×112 portrait (Portrait.tsx) in the BlueStar anime style: dark outline,
// pointed bangs with a shine band, big eyes with a highlight, slim jaw and light from
// the top-left. Frames sit side by side in one row.
// hair-back 6 · body 18 (9 skins × masc/fem) · outfit 24 (12 × masc/fem)
// eyes 10 (5 colors × masc/fem) · hair 6 · accessory 6.
// Hair is grey: the app tints every channel ≥ 96 to the chosen color at runtime, so
// the outline (below 96) stays dark whatever the hair color.

const PW = 96;
const PH = 112;
const CX = 48;
const HAIR_GREY = ['6d758d', '8b93af', 'b3b9d1', 'dae0ea', 'ffffff'];
const BROW = '423934';
// Eye boxes: x0..x0+11, rows EYE_Y..EYE_Y+8. Bangs never reach them.
const EYE_Y = 44;

/** Half width of the face at row y (cranium ellipse, then a tapering anime jaw). */
function faceHalf(y) {
  if (y < 21 || y > 74) return -1;
  if (y <= 54) {
    const ny = (y + 0.5 - 46) / 25;
    return 21 * Math.sqrt(Math.max(0, 1 - ny * ny));
  }
  if (y > 72) return -1;
  const t = (y - 54) / 18;
  return 20 - 15 * Math.pow(t, 1.6);
}

function inFace(x, y) {
  const h = faceHalf(y);
  return h >= 0 && Math.abs(x + 0.5 - CX) <= h;
}

/** Mirrors a left-side x coordinate to the right side of the face. */
function mx(x) {
  return 2 * CX - 1 - x;
}

function portraitBody(skin, female) {
  const [deep, shadow, base] = skin.ramp.map(c);
  // Shoulders (mostly covered by the outfit) and neck, shaded under the chin.
  ellipse(48, 116, female ? 39 : 43, 34, base);
  for (let y = 60; y < 100; y++)
    for (let x = 43; x <= 53; x++) px(x, y, y < 76 || x >= 50 ? shadow : base);
  // Ears.
  for (const [x, tone] of [
    [27, base],
    [68, shadow],
  ]) {
    ellipse(x + 0.5, 51, 3.5, 6, tone);
    px(x + (x < CX ? 1 : 0), 50, shadow);
    px(x + (x < CX ? 1 : 0), 51, shadow);
  }
  // Face: flat base tone, shadow on the far side of the face and jaw and under the
  // fringe, a small highlight on the lit cheek.
  for (let y = 21; y <= 74; y++)
    for (let x = 20; x < 76; x++) {
      if (!inFace(x, y)) continue;
      const h = faceHalf(y);
      const nx = (x + 0.5 - CX) / h;
      let tone = base;
      if (y < 39 || nx > 0.78 || (y > 64 && nx > 0.5)) tone = shadow;
      px(x, y, tone);
    }
  // Jawline drawn over the neck, as in the BlueStar portraits.
  for (let y = 56; y <= 72; y++)
    for (let x = 40; x <= 56; x++) if (inFace(x, y) && !inFace(x, y + 1)) px(x, y + 1, deep);
  // Nose (shadow falls to the right) and mouth.
  px(49, 57, shadow);
  px(50, 58, shadow);
  px(49, 59, deep);
  rect(45, 65, female ? 5 : 6, 1, deep);
  px(female ? 50 : 51, 64, deep);
  if (female) {
    rect(32, 59, 5, 1, c(skin.blush));
    rect(59, 59, 5, 1, c(skin.blush));
  }
}

function portraitEyes(color, female) {
  const iris = c(color);
  const pupil = c('221c1a');
  const lash = c('221c1a');
  const white = c('ffffff');
  const sclera = c('e3e6ff');
  const lid = c('8e5252');
  for (const right of [false, true]) {
    const X = function (lx) {
      return right ? mx(33 + lx) : 33 + lx;
    };
    const P = function (lx, ly, color) {
      px(X(lx), EYE_Y + ly, color);
    };
    for (let ly = 2; ly <= 6; ly++) for (let lx = 1; lx <= 10; lx++) P(lx, ly, sclera);
    // Iris (dark under the lid), pupil and highlight.
    for (let ly = 1; ly <= 7; ly++)
      for (let lx = 4; lx <= 9; lx++) P(lx, ly, ly <= 2 ? pupil : iris);
    for (let ly = 3; ly <= 5; ly++) for (let lx = 6; lx <= 8; lx++) P(lx, ly, pupil);
    P(5, 3, white);
    P(5, 4, white);
    P(8, 6, white);
    // Thick upper lash dropping at the outer corner; thin lower lid.
    for (let lx = 2; lx <= 10; lx++) P(lx, 0, lash);
    for (let lx = 0; lx <= 11; lx++) P(lx, 1, lash);
    P(0, 2, lash);
    P(1, 2, lash);
    for (let lx = 3; lx <= 9; lx++) P(lx, 8, lid);
    if (female) {
      P(-1, 0, lash);
      P(-2, -1, lash);
      P(-1, 1, lash);
      P(0, 3, lash);
    }
    // Brow (often under the fringe).
    const browRows = female ? [-6] : [-6, -5];
    for (const ly of browRows) for (let lx = 2; lx <= 10; lx++) P(lx, ly, c(BROW));
    P(1, -5, c(BROW));
  }
}

/** A pointed lock of hair from a top span [x0, x1] down to a tip. */
function lock(x0, x1, top, tipX, tipY, tones) {
  const [dark, mid, lightTone] = tones.map(c);
  for (let y = top; y <= tipY; y++) {
    const t = Math.pow((y - top) / Math.max(1, tipY - top), 0.6);
    const xl = Math.round(x0 + (tipX - x0) * t);
    const xr = Math.round(x1 + (tipX - x1) * t);
    for (let x = xl; x <= xr; x++) {
      let tone = x < (xl + xr) / 2 ? lightTone : mid;
      if (y >= tipY - 1 || x === xr) tone = dark;
      px(x, y, tone);
    }
  }
}

/** Crown volume with the anime shine band, lit from the top-left. */
function crown(cy, ry) {
  shadedEllipse(48, cy, 26, ry, HAIR_GREY, function (_x, y) {
    return y <= 40;
  });
  const shine = c(HAIR_GREY[4]);
  const mid = c(HAIR_GREY[3]);
  for (let x = 29; x <= 50; x++) {
    const y = Math.round(cy - ry * 0.45 + ((x - 40) * (x - 40)) / 40);
    px(x, y, shine);
    px(x, y + 1, x % 3 === 0 ? mid : shine);
  }
}

const L = ['8b93af', 'b3b9d1', 'dae0ea'];
const D = ['6d758d', '8b93af', 'b3b9d1'];

function sideLocks(bottom, width) {
  // Locks that frame the face in front of the ears (outside the eye boxes).
  lock(22, 22 + width, 30, 24, bottom, L);
  lock(74 - width, 74, 30, 72, bottom, D);
}

function fringe(tips) {
  // `tips`: [topLeft, topRight, tipX, tipY] per lock, drawn right to left so the lit
  // locks overlap the shaded ones.
  for (let i = tips.length - 1; i >= 0; i--) {
    const [a, b, tx, ty] = tips[i];
    lock(a, b, 24, tx, ty, tx < CX ? L : D);
  }
}

// Tips stay above the eyes (row < 44) except between them (x 45..50).
const FRINGE_STRAIGHT = [
  [24, 34, 27, 42],
  [30, 42, 36, 41],
  [38, 50, 46, 47],
  [46, 58, 52, 41],
  [54, 66, 60, 42],
  [62, 73, 69, 43],
];

function portraitHairBack(style) {
  if (style === 1)
    shadedEllipse(48, 50, 30, 26, HAIR_GREY, function (_x, y) {
      return y < 70;
    });
  if (style === 4) {
    shadedEllipse(48, 56, 31, 44, HAIR_GREY, function (_x, y) {
      return y < 104;
    });
    // Pointed ends.
    lock(18, 34, 96, 24, 110, L);
    lock(62, 78, 96, 72, 110, D);
  }
  if (style === 5) {
    shadedEllipse(78, 48, 9, 12, HAIR_GREY);
    lock(70, 88, 52, 82, 92, D);
  }
}

function portraitHair(style) {
  if (style === 0) {
    crown(36, 22);
    sideLocks(54, 6);
    fringe(FRINGE_STRAIGHT);
  } else if (style === 1) {
    crown(36, 22);
    sideLocks(68, 8);
    fringe([
      [24, 36, 30, 41],
      [32, 46, 39, 42],
      [42, 54, 47, 46],
      [50, 64, 57, 42],
      [60, 73, 66, 41],
    ]);
  } else if (style === 2) {
    // Side-swept fringe falling to the right, with a long lock past the cheek.
    crown(36, 22);
    lock(22, 28, 30, 23, 50, L);
    fringe([
      [24, 38, 34, 40],
      [32, 46, 42, 42],
      [40, 54, 49, 47],
      [48, 62, 58, 42],
      [56, 70, 66, 43],
    ]);
    lock(62, 74, 26, 69, 64, D);
  } else if (style === 3) {
    // Spiky: tall points over the crown, like the BlueStar hero.
    for (const [a, b, tx, ty] of [
      [24, 40, 20, 14],
      [32, 48, 34, 5],
      [42, 58, 50, 3],
      [52, 68, 64, 6],
      [60, 74, 78, 15],
    ])
      lockUp(a, b, 26, tx, ty, tx < CX ? L : D);
    crown(36, 21);
    sideLocks(52, 6);
    fringe([
      [24, 36, 25, 43],
      [30, 44, 37, 42],
      [40, 52, 47, 48],
      [48, 60, 56, 41],
      [56, 70, 64, 43],
      [64, 74, 71, 46],
    ]);
  } else if (style === 4) {
    crown(36, 22);
    lock(20, 29, 30, 22, 92, L);
    lock(67, 76, 30, 74, 92, D);
    fringe(FRINGE_STRAIGHT);
  } else if (style === 5) {
    crown(36, 22);
    sideLocks(50, 5);
    fringe([
      [24, 36, 29, 41],
      [32, 44, 38, 42],
      [40, 52, 46, 46],
      [48, 60, 55, 42],
      [56, 72, 64, 41],
    ]);
    // Hair tie on the ponytail side.
    rect(71, 38, 4, 6, c('ffd541'));
    rect(71, 38, 1, 6, c('f9a31b'));
  }
}

/** A lock pointing upward (spikes). */
function lockUp(x0, x1, bottom, tipX, tipY, tones) {
  const [dark, mid, lightTone] = tones.map(c);
  for (let y = bottom; y >= tipY; y--) {
    const t = Math.pow((bottom - y) / Math.max(1, bottom - tipY), 0.85);
    const xl = Math.round(x0 + (tipX - x0) * t);
    const xr = Math.round(x1 + (tipX - x1) * t);
    for (let x = Math.min(xl, xr); x <= Math.max(xl, xr); x++) {
      let tone = x < (xl + xr) / 2 ? lightTone : mid;
      if (x === Math.max(xl, xr)) tone = dark;
      px(x, y, tone);
    }
  }
}

/** Runs `draw` with every y shifted by `dy` (clipping stays on the cell). */
function shifted(dy, draw) {
  const saved = ORIGIN;
  ORIGIN = { x: saved.x, y: saved.y + dy };
  draw();
  ORIGIN = saved;
}

// Shoulders sit 6px higher than the layout below was drawn for: a short anime neck.
function portraitOutfit(o, female) {
  shifted(-6, function () {
    drawOutfit(o, female);
  });
}

function drawOutfit(o, female) {
  const PH = 118;
  const [shadow, base, light] = o.jacket.map(c);
  const shirt = c(o.shirt);
  const rx = female ? 39 : 43;
  // Shoulders lit from the left, with fold lines toward the arms.
  for (let y = 84; y < PH; y++)
    for (let x = 0; x < PW; x++) {
      if (!insideEllipse(x, y, 48, 122, rx, 34)) continue;
      const nx = (x + 0.5 - 48) / rx;
      px(x, y, nx < -0.62 ? light : nx > 0.5 ? shadow : base);
    }
  line(27, 97, 31, PH, shadow);
  line(69, 97, 65, PH, shadow);
  line(20, 101, 22, PH, light);
  const mid = 48;
  switch (o.kind) {
    case 'jacket':
    case 'bomber':
    case 'denim':
    case 'coat':
    case 'overcoat':
      for (let y = 86; y < PH; y++) {
        const w = Math.max(0, 9 - Math.floor((y - 86) / 3));
        for (let x = mid - w; x <= mid + w; x++) px(x, y, shirt);
      }
      // Lapels.
      line(mid - 12, 86, mid - 2, PH, light);
      line(mid - 11, 86, mid - 1, PH, shadow);
      line(mid + 11, 86, mid + 1, PH, shadow);
      if (o.kind === 'bomber')
        for (let x = 20; x < 76; x++)
          for (let y = 84; y < 92; y++)
            if (insideEllipse(x, y, 48, 122, rx, 34) && !insideEllipse(x, y - 3, 48, 122, rx, 34))
              px(x, y, shirt);
      if (o.kind === 'denim' || o.kind === 'overcoat')
        for (let y = 96; y < PH; y += 6) px(mid - 5, y, c('ffd541'));
      break;
    case 'hoodie':
      // Hood around the neck and drawstrings.
      shadedEllipse(48, 88, 23, 7, o.jacket, null, -0.2);
      rect(40, 86, 16, 3, shadow);
      rect(44, 92, 2, 12, shirt);
      rect(51, 92, 2, 12, shirt);
      px(44, 104, c('ffd541'));
      px(51, 104, c('ffd541'));
      break;
    case 'tech':
      line(30, 92, 30, PH, shirt);
      line(66, 92, 66, PH, shirt);
      rect(39, 86, 18, 3, shirt);
      break;
    case 'sweater':
    case 'cardigan':
      rect(38, 84, 20, 4, shirt);
      if (o.kind === 'cardigan') for (let y = 94; y < PH; y += 5) px(mid, y, shirt);
      break;
    case 'ceremonial':
      for (let y = 86; y < PH; y++) {
        px(mid - 8 + Math.floor((y - 86) / 3), y, shirt);
        px(mid + 8 - Math.floor((y - 86) / 3), y, shirt);
      }
      rect(mid - 1, 97, 3, 3, c('b4202a'));
      break;
    case 'sailor':
      rect(24, 86, 48, 8, shirt);
      rect(mid - 2, 94, 5, 5, c('b4202a'));
      break;
    case 'tunic':
      rect(36, 86, 24, 3, shirt);
      line(mid, 89, mid, PH, shadow);
      break;
  }
}

function portraitAccessory(kind) {
  if (kind === 1) {
    // Glasses around the eye boxes (no outline pass, so the face stays clean).
    const frame = c('242234');
    const lens = c('a6fcdb');
    for (const x0 of [31, 51]) {
      rect(x0, 42, 14, 1, frame);
      rect(x0, 54, 14, 1, frame);
      rect(x0, 42, 1, 13, frame);
      rect(x0 + 13, 42, 1, 13, frame);
      px(x0 + 2, 44, lens);
      px(x0 + 3, 44, lens);
      px(x0 + 2, 45, lens);
    }
    rect(45, 45, 6, 1, frame);
    rect(25, 45, 6, 1, frame);
    rect(65, 45, 6, 1, frame);
  } else if (kind === 2) {
    shifted(-6, function () {
      portraitAccessory(-2);
    });
  } else if (kind === 5) {
    shifted(-4, function () {
      portraitAccessory(-5);
    });
  } else if (kind === -2) {
    for (const x of [28, 66]) {
      rect(x, 86, 4, 32, c('71413b'));
      rect(x, 86, 1, 32, c('bb7547'));
    }
    rect(27, 100, 6, 4, c('ffd541'));
  } else if (kind === 3) {
    // Straw hat over the crown.
    shadedEllipse(48, 22, 40, 7, ['a08662', 'c7b08b', 'e4d2aa']);
    shadedEllipse(48, 12, 21, 12, ['a08662', 'c7b08b', 'e4d2aa'], function (_x, y) {
      return y <= 20;
    });
    rect(28, 17, 40, 4, c('b4202a'));
    rect(28, 17, 40, 1, c('df3e23'));
  } else if (kind === 4) {
    // Headphones: band over the crown, cups over the ears.
    for (let x = 22; x <= 74; x++) {
      const y = Math.round(16 - Math.sin(((x - 22) / 52) * Math.PI) * 9);
      px(x, y, c('6d758d'));
      px(x, y + 1, c('4a5462'));
    }
    shadedEllipse(24, 50, 6, 10, ['333941', '4a5462', '849be4']);
    shadedEllipse(72, 50, 6, 10, ['333941', '4a5462', '849be4']);
  } else if (kind === -5) {
    // Scarf around the neck with a hanging end.
    shadedEllipse(48, 82, 24, 7, ['73172d', 'b4202a', 'df3e23']);
    rect(54, 86, 8, 22, c('b4202a'));
    rect(54, 86, 2, 22, c('df3e23'));
    for (let x = 54; x < 62; x += 2) px(x, 108, c('ffd541'));
  }
}

/** Draws `count` portrait frames side by side. */
function portraitSheet(count, draw, withOutline) {
  for (let i = 0; i < count; i++) {
    cell(i * PW, 0, PW, PH);
    draw(i);
    const outlined = typeof withOutline === 'function' ? withOutline(i) : withOutline;
    if (outlined) outline();
  }
}
