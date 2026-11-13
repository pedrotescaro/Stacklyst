import { canvas } from './mundinho-pixel-art.mjs';

// Eight authored poses: ready, wind-up, overhead, strike, extension, follow-through,
// recovery and return. The blade, sleeve, hand and torso all change in the atlas.
const attackHands = [
  [21, 18],
  [23, 16],
  [24, 15],
  [23, 17],
  [24, 19],
  [22, 21],
  [20, 21],
  [21, 19],
];
const attackTips = [
  [26, 8],
  [27, 5],
  [28, 5],
  [30, 10],
  [30, 19],
  [27, 29],
  [18, 29],
  [24, 10],
];
const attackTwist = [0, -1, -1, 0, 1, 1, 0, 0];
const stride = [0, -1, 0, 1, 0, -1, 0, 1];

/** Compact 32px chibi body, independently authored from the old skin thumbnails. */
export function drawCompactHero({
  layer,
  palette: p,
  female = false,
  direction: d,
  frame: f,
  motion,
  shade,
}) {
  const c = canvas(32, 32);
  const side = d === 1 || d === 3;
  const back = d === 2;
  const attacking = motion === 'attack';
  const mirror = d === 3 || (attacking && back);
  const step = attacking ? 0 : stride[f];
  const twist = attacking ? attackTwist[f] : 0;
  const ink = '#211a23';
  const point = ([x, y]) => [mirror ? 31 - x : x, y];
  const r = (x, y, w, h, col) => c.rect(mirror ? 32 - x - w : x, y, w, h, col);
  const poly = (points, col) => c.polygon(points.map(point), col);
  const line = (a, b, col, width = 1) => {
    const [x1, y1] = point(a),
      [x2, y2] = point(b);
    c.line(x1, y1, x2, y2, col);
    if (width > 1) {
      c.line(x1 + (mirror ? -1 : 1), y1, x2 + (mirror ? -1 : 1), y2, col);
      c.line(x1, y1 + 1, x2, y2 + 1, col);
    }
  };
  const weaponHand = attacking ? attackHands[f] : side ? [14, 19 + step] : [21, 19 - step];
  const nearShoulder = side ? [15 + twist, 17] : [19 + twist, 17];
  const farShoulder = side ? [18 + twist, 17] : [12 + twist, 17];
  const farHand = side ? [19, 19 - step] : [9, 19 + step];
  const nearHand = attacking ? weaponHand : side ? [14, 19 + step] : weaponHand;
  const drawWeapon = () => {
    const hand = weaponHand,
      tip = attackTips[f];
    const dx = tip[0] - hand[0],
      dy = tip[1] - hand[1];
    const len = Math.max(Math.abs(dx), Math.abs(dy));
    const ux = dx / len,
      uy = dy / len;
    const bladeStart = [hand[0] + Math.round(ux * 2), hand[1] + Math.round(uy * 2)];
    line(bladeStart, tip, '#586e83', 2);
    line(bladeStart, tip, '#edf6ff');
    const guard = [hand[0] + Math.round(ux), hand[1] + Math.round(uy)];
    line(
      [guard[0] - Math.round(uy * 2), guard[1] + Math.round(ux * 2)],
      [guard[0] + Math.round(uy * 2), guard[1] - Math.round(ux * 2)],
      '#d8b76e'
    );
  };
  if (layer === 'weapon') {
    // A raised hand and sword pass in front of voluminous hair during the swing.
    if (attacking) {
      drawWeapon();
      r(nearHand[0], nearHand[1], 2, 2, p.deepShadow);
      r(nearHand[0], nearHand[1], 1, 1, p.highlight);
      r(nearHand[0] + 1, nearHand[1], 1, 1, p.base);
    }
    return c.data;
  }

  if (layer === 'body') {
    // Large round head, short neck and a five-pixel torso are intentional reference proportions.
    poly(
      [
        [10, 4],
        [20, 4],
        [23, 7],
        [23, 12],
        [21, 15],
        [17, 16],
        [13, 16],
        [9, 14],
        [8, 11],
        [8, 7],
      ],
      p.deepShadow
    );
    poly(
      [
        [10, 5],
        [20, 5],
        [22, 7],
        [22, 12],
        [20, 14],
        [17, 15],
        [13, 15],
        [10, 13],
        [9, 10],
        [9, 7],
      ],
      p.base
    );
    r(10, 6, 2, 6, p.highlight);
    r(21, 8, 1, 5, p.shadow);
    r(13, 14, 6, 1, p.shadow);
    r(14, 15, 4, 3, p.shadow);
    r(14, 16, 3, 1, p.base);
    if (!back) {
      if (!side) {
        r(15, 14, 2, 1, shade(p.deepShadow, 16));
        if (female) {
          r(10, 13, 2, 1, p.blush);
          r(20, 13, 2, 1, p.blush);
        }
      } else {
        r(21, 14, 1, 1, p.deepShadow);
        if (female) r(19, 13, 2, 1, p.blush);
      }
    }
    const left = (side ? 13 : 11) + twist;
    const right = (side ? 20 : 20) + twist;
    poly(
      [
        [left + 1, 16],
        [right - 1, 16],
        [right, 18],
        [right - 1, 21],
        [left + 1, 21],
        [left, 18],
      ],
      p.shadow
    );
    r(left + 1, 17, right - left - 1, 3, p.base);
    // Hands are real skin pixels, authored into the same poses as the outfit sleeves.
    for (const [shoulder, hand] of [
      [farShoulder, farHand],
      [nearShoulder, nearHand],
    ]) {
      line(shoulder, hand, p.deepShadow, 2);
      line(shoulder, hand, p.base);
      r(hand[0], hand[1], 2, 2, p.deepShadow);
      r(hand[0], hand[1], 1, 1, p.highlight);
      r(hand[0] + 1, hand[1], 1, 1, p.base);
    }
    return c.data;
  }

  const rim = shade(p.shadow, -22),
    light = shade(p.jacket, 25);
  const kind = p.kind;
  // Stubby boots alternate independently; there is no long trouser column below the shirt.
  if (!side) {
    for (const [x, off] of [
      [12, step],
      [17, -step],
    ]) {
      r(x, 21 + off, 3, 2, p.pants);
      r(x, 22 + off, 3, 2, ink);
      r(x, 22 + off, 2, 1, p.shoes);
      r(x, 22 + off, 1, 1, shade(p.shoes, 13));
    }
  } else {
    r(15, 21 - step, 3, 3, ink);
    r(15, 21 - step, 3, 1, p.pants);
    r(14, 21 + step, 3, 3, ink);
    r(14, 21 + step, 3, 1, p.pants);
    r(15, 23 + step, 3, 1, p.shoes);
  }
  const torsoLeft = (side ? 13 : 11) + twist;
  const torsoRight = (side ? 20 : 20) + twist;
  poly(
    [
      [torsoLeft + 1, 16],
      [torsoRight - 1, 16],
      [torsoRight, 18],
      [torsoRight - 1, 21],
      [torsoLeft + 1, 21],
      [torsoLeft, 18],
    ],
    rim
  );
  poly(
    [
      [torsoLeft + 1, 17],
      [torsoRight - 1, 17],
      [torsoRight - 1, 20],
      [torsoLeft + 1, 20],
    ],
    p.jacket
  );
  r(torsoLeft + 1, 17, 2, 1, light);
  r(torsoRight - 2, 18, 1, 3, p.shadow);

  if (attacking) {
    // Steel outline, lit cutting edge and warm crossguard are part of the sprite frames.
    drawWeapon();
  }

  for (const [shoulder, hand] of [
    [farShoulder, farHand],
    [nearShoulder, nearHand],
  ]) {
    const dx = hand[0] - shoulder[0],
      dy = hand[1] - shoulder[1];
    const end = [hand[0] - Math.sign(dx), hand[1] - Math.sign(dy)];
    line(shoulder, end, rim, 2);
    line(shoulder, end, p.jacket);
    r(shoulder[0], shoulder[1], 1, 1, light);
  }
  // Fine wardrobe details preserve all saved outfit choices at this deliberately tiny scale.
  if (!side && !back) {
    if (['jacket', 'bomber', 'denim', 'cardigan', 'overcoat', 'coat'].includes(kind)) {
      r(15 + twist, 17, 2, 4, p.shirt);
      r(12 + twist, 15, 2, 2, rim);
      r(13 + twist, 16, 1, 2, light);
      r(18 + twist, 15, 2, 2, rim);
      r(18 + twist, 16, 1, 1, p.jacket);
    }
    if (kind === 'hoodie') {
      r(13 + twist, 16, 5, 1, p.shirt);
      r(14 + twist, 17, 3, 1, p.shadow);
      r(14 + twist, 18, 1, 1, p.shirt);
      r(17 + twist, 18, 1, 1, p.shirt);
      r(14 + twist, 20, 4, 1, light);
    }
    if (kind === 'tech') {
      r(16 + twist, 17, 1, 4, p.shirt);
      r(12 + twist, 18, 2, 1, p.shirt);
    }
    if (kind === 'sweater') {
      r(14 + twist, 16, 4, 1, p.shirt);
      r(12 + twist, 19, 7, 1, light);
    }
    if (kind === 'ceremonial') {
      r(14 + twist, 17, 4, 2, p.shirt);
      r(16 + twist, 18, 1, 2, '#693744');
      r(12 + twist, 20, 8, 1, '#edcd78');
    }
    if (kind === 'denim') {
      r(12 + twist, 18, 2, 1, light);
      r(18 + twist, 18, 1, 1, light);
    }
    if (kind === 'bomber') r(12 + twist, 20, 8, 1, p.shirt);
    if (kind === 'sailor') {
      r(13 + twist, 16, 6, 1, p.shirt);
      r(14 + twist, 17, 4, 1, p.shirt);
      r(16 + twist, 18, 1, 2, '#b84d69');
    }
    if (kind === 'tunic') {
      r(14 + twist, 16, 4, 1, p.shirt);
      r(16 + twist, 17, 1, 2, p.shirt);
      r(12 + twist, 20, 8, 1, '#795342');
      r(16 + twist, 20, 1, 1, '#dfbf78');
    }
  } else if (side) {
    if (['jacket', 'bomber', 'denim', 'cardigan', 'overcoat', 'coat'].includes(kind)) {
      r(19 + twist, 17, 1, 3, p.shirt);
      r(14 + twist, 15, 4, 1, rim);
    }
    if (kind === 'hoodie' || kind === 'sailor') r(14 + twist, 16, 4, 1, p.shirt);
    if (kind === 'tech') r(18 + twist, 18, 2, 1, p.shirt);
    if (kind === 'sweater' || kind === 'bomber') r(15 + twist, 20, 5, 1, p.shirt);
    if (kind === 'ceremonial' || kind === 'tunic') r(15 + twist, 20, 5, 1, '#c7ad70');
  } else {
    if (kind === 'hoodie') {
      r(13 + twist, 16, 5, 2, p.shadow);
      r(14 + twist, 16, 3, 1, light);
    }
    if (kind === 'sailor') {
      r(12 + twist, 16, 7, 2, p.shirt);
      r(13 + twist, 16, 5, 1, p.jacket);
    }
    if (kind === 'denim') r(12 + twist, 19, 7, 1, light);
    if (kind === 'tech') r(14 + twist, 18, 4, 1, p.shirt);
  }
  if (['coat', 'cardigan', 'overcoat', 'tunic'].includes(kind))
    r(torsoLeft + 1, 21, torsoRight - torsoLeft - 1, 1, p.shadow);
  // Keep every palette's two hand pixels visible, even when a sleeve changes angle.
  for (const hand of [farHand, nearHand]) {
    const [x, y] = point(hand);
    const start = mirror ? x - 1 : x;
    for (let yy = y; yy < y + 2; yy++)
      for (let xx = start; xx < start + 2; xx++)
        c.data.fill(0, (yy * 32 + xx) * 4, (yy * 32 + xx) * 4 + 4);
  }
  return c.data;
}
