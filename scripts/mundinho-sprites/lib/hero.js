// Layered 32×32 hero (body, outfit, eyes, hair, accessory). Sheet layout, fixed by
// PixelAvatar: 8 columns (frames) × rows of [variant × 4 directions], directions in
// the order down, right, up, left. Left is the mirror of right.
// Walk: frames 0/2/4/6 neutral, 1/5 and 3/7 alternate legs. Idle toggles 0 ↔ 2,
// so frame 2 also blinks. Attack sheets swing the right arm across the 8 frames.

const HS = 32;
const STEP = [0, -1, 0, 1, 0, -1, 0, 1];
const BOB = [0, 1, 0, 1, 0, 1, 0, 1];
const INK = c('242234');

function pose(dir, frame, motion) {
  if (motion === 'attack') {
    // 0–1 wind-up, 2–4 strike, 5–7 recover.
    const phase = frame <= 1 ? 'windup' : frame <= 4 ? 'strike' : 'recover';
    return { step: 0, bob: frame === 3 ? 1 : 0, attack: phase, stance: 1 };
  }
  return { step: STEP[frame], bob: BOB[frame], attack: null, stance: 0 };
}

/** Rectangle with a left-lit 3-tone ramp [shadow, base, light]. */
function litRect(x, y, w, h, ramp3, lightCols, shadowCols) {
  const [shadow, base, light] = ramp3.map(c);
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const color = xx < (lightCols || 1) ? light : xx >= w - (shadowCols || 1) ? shadow : base;
      px(x + xx, y + yy, color);
    }
}

// Shared silhouette so every layer lines up. Coordinates are cell-relative.
function bodyShape(dir, p) {
  const b = p.bob;
  const side = dir === 1;
  const shape = {
    head: { cx: 16, cy: 10 + b, rx: side ? 7 : 7.5, ry: 6.8 },
    torso: side ? { x: 13, y: 17 + b, w: 7, h: 8 - b } : { x: 11, y: 17 + b, w: 10, h: 8 - b },
    arms: [],
    legs: [],
  };
  if (side) {
    const swing = p.attack ? 0 : p.step * 2;
    shape.arms.push({ x: 14 - swing, y: 18 + b, w: 2, h: 5, far: true });
    if (p.attack === 'windup')
      shape.arms.push({ x: 11, y: 15 + b, w: 3, h: 3, hand: [10, 14 + b] });
    else if (p.attack === 'strike')
      shape.arms.push({ x: 17, y: 19 + b, w: 7, h: 2, hand: [24, 19 + b] });
    else shape.arms.push({ x: 16 + swing, y: 18 + b, w: 2, h: 5, hand: [16 + swing, 23 + b] });
    const stride = p.attack ? 1 : p.step * 2;
    shape.legs.push({ x: 14 - stride, y: 25, w: 3, h: 4, far: true, foot: [13 - stride, 29, 5] });
    shape.legs.push({ x: 15 + stride, y: 25, w: 3, h: 4, foot: [15 + stride, 29, 5] });
  } else {
    const swingL = p.attack ? 0 : p.step;
    shape.arms.push({ x: 9, y: 18 + b + swingL, w: 2, h: 5, hand: [9, 23 + b + swingL] });
    if (p.attack === 'windup')
      shape.arms.push({ x: 21, y: 13 + b, w: 2, h: 5, hand: [22, 12 + b] });
    else if (p.attack === 'strike')
      shape.arms.push({ x: 21, y: 18 + b, w: 6, h: 2, hand: [27, 18 + b] });
    else shape.arms.push({ x: 21, y: 18 + b - swingL, w: 2, h: 5, hand: [21, 23 + b - swingL] });
    const liftL = p.step === -1 ? 1 : 0;
    const liftR = p.step === 1 ? 1 : 0;
    const spread = p.stance;
    shape.legs.push({
      x: 12 - spread,
      y: 25,
      w: 3,
      h: 4 - liftL,
      foot: [11 - spread, 29 - liftL, 4],
    });
    shape.legs.push({
      x: 17 + spread,
      y: 25,
      w: 3,
      h: 4 - liftR,
      foot: [17 + spread, 29 - liftR, 4],
    });
  }
  return shape;
}

// ── Body (skin) ──
function drawBody(skin, female, dir, frame, motion) {
  const p = pose(dir, frame, motion);
  const s = bodyShape(dir, p);
  const [deep, shadow, base, light] = skin.ramp;
  const b = p.bob;
  // Far limbs first, in shadow.
  for (const arm of s.arms.filter((a) => a.far)) rect(arm.x, arm.y, arm.w, arm.h, c(shadow));
  for (const leg of s.legs.filter((l) => l.far)) rect(leg.x, leg.y, leg.w, leg.h, c(shadow));
  litRect(s.torso.x, s.torso.y, s.torso.w, s.torso.h, [shadow, base, light]);
  for (const leg of s.legs.filter((l) => !l.far))
    litRect(leg.x, leg.y, leg.w, leg.h, [shadow, base, light]);
  for (const arm of s.arms.filter((a) => !a.far)) {
    litRect(arm.x, arm.y, arm.w, arm.h, [shadow, base, light]);
    if (arm.hand) rect(arm.hand[0], arm.hand[1], 2, 2, c(base));
  }
  rect(14, 16 + b, 4, 1, c(shadow));
  shadedEllipse(s.head.cx, s.head.cy, s.head.rx, s.head.ry, [shadow, base, light]);
  if (dir === 0) {
    px(8, 11 + b, c(shadow));
    px(23, 11 + b, c(shadow));
    px(15, 15 + b, c(deep));
    px(16, 15 + b, c(deep));
    if (female) {
      px(10, 14 + b, c(skin.blush));
      px(21, 14 + b, c(skin.blush));
    }
  } else if (dir === 1) {
    px(23, 12 + b, c(base));
    px(22, 12 + b, c(light));
    px(21, 15 + b, c(deep));
    px(13, 11 + b, c(shadow));
    px(13, 12 + b, c(deep));
    if (female) px(19, 14 + b, c(skin.blush));
  } else {
    px(8, 11 + b, c(shadow));
    px(23, 11 + b, c(shadow));
  }
}

// ── Outfit ──
const LONG = { coat: 27, overcoat: 27, ceremonial: 28, tunic: 26 };

function drawOutfit(o, dir, frame, motion) {
  const p = pose(dir, frame, motion);
  const s = bodyShape(dir, p);
  const b = p.bob;
  const jacket = o.jacket;
  const [pantsDark, pantsLight] = o.pants;
  // Pants and shoes.
  for (const leg of s.legs) {
    if (leg.far) rect(leg.x, leg.y, leg.w, leg.h, c(pantsDark));
    else litRect(leg.x, leg.y, leg.w, leg.h, [pantsDark, pantsDark, pantsLight]);
    rect(leg.foot[0], leg.foot[1], leg.foot[2], 2, c(o.shoes));
    px(leg.foot[0], leg.foot[1], c(o.shoes === 'ffffff' ? 'dae0ea' : o.shoes));
  }
  // Torso garment, longer for coats and robes.
  const bottom = LONG[o.kind] || s.torso.y + s.torso.h;
  litRect(s.torso.x, s.torso.y, s.torso.w, bottom - s.torso.y, jacket, 1, 1);
  // Sleeves (everything but the hands).
  for (const arm of s.arms) {
    if (arm.far) rect(arm.x, arm.y, arm.w, Math.max(1, arm.h - 1), c(jacket[0]));
    else litRect(arm.x, arm.y, arm.w, arm.h, jacket);
  }
  const front = dir === 0;
  const back = dir === 2;
  const t = s.torso;
  const mid = t.x + Math.floor(t.w / 2);
  const shirt = c(o.shirt);
  switch (o.kind) {
    case 'jacket':
      if (front) {
        rect(mid - 1, t.y, 2, t.h, shirt);
        px(mid - 2, t.y, c(jacket[2]));
        px(mid + 1, t.y, c(jacket[2]));
      }
      break;
    case 'hoodie':
      rect(t.x + 1, t.y - 1, t.w - 2, 1, c(jacket[0]));
      if (front) {
        rect(mid - 2, t.y + 4, 4, 2, c(jacket[0]));
        px(mid - 1, t.y + 1, shirt);
        px(mid, t.y + 1, shirt);
        px(mid - 1, t.y + 2, shirt);
      }
      if (back) rect(t.x + 2, t.y, t.w - 4, 3, c(jacket[0]));
      break;
    case 'tech':
      for (const x of front || back ? [t.x + 2, t.x + t.w - 3] : [t.x + 2])
        line(x, t.y + 1, x, t.y + t.h - 1, shirt);
      if (front) px(mid, t.y + 2, c('a6fcdb'));
      break;
    case 'coat':
    case 'overcoat':
      if (front) {
        line(mid, t.y, mid, bottom - 1, c(jacket[0]));
        px(mid - 1, t.y + 2, shirt);
        px(mid - 1, t.y + 5, shirt);
        rect(t.x, t.y + 4, t.w, 1, c(jacket[0]));
      }
      break;
    case 'sweater':
      if (front || back) rect(mid - 2, t.y, 4, 1, shirt);
      rect(t.x, t.y + t.h - 1, t.w, 1, c(jacket[0]));
      break;
    case 'ceremonial':
      rect(t.x, bottom - 1, t.w, 1, shirt);
      if (front) {
        line(mid, t.y, mid, bottom - 1, shirt);
        px(mid - 1, t.y + 1, c('b4202a'));
      }
      break;
    case 'bomber':
      rect(t.x, t.y, t.w, 1, shirt);
      rect(t.x, t.y + t.h - 1, t.w, 1, c(jacket[0]));
      if (front) line(mid, t.y + 1, mid, t.y + t.h - 2, c('ffd541'));
      break;
    case 'denim':
      if (front) {
        px(mid - 2, t.y + 2, shirt);
        px(mid + 1, t.y + 2, shirt);
        line(mid, t.y, mid, t.y + t.h - 1, c(jacket[0]));
      }
      break;
    case 'cardigan':
      if (front) {
        rect(mid - 1, t.y, 2, 2, shirt);
        for (let y = t.y + 2; y < t.y + t.h; y += 2) px(mid, y, shirt);
      }
      break;
    case 'sailor':
      if (front) {
        rect(t.x + 1, t.y, t.w - 2, 2, c(o.shirt));
        px(mid - 1, t.y + 2, c('b4202a'));
        px(mid, t.y + 2, c('b4202a'));
        px(mid, t.y + 3, c('b4202a'));
      } else if (back) rect(t.x + 1, t.y, t.w - 2, 3, c(o.shirt));
      break;
    case 'tunic':
      rect(t.x, t.y + 4, t.w, 1, c('71413b'));
      if (front) px(mid, t.y + 4, c('ffd541'));
      break;
  }
}

// ── Eyes ──
function drawEyes(color, female, dir, frame) {
  if (dir === 2) return;
  const b = BOB[frame];
  const iris = c(color);
  const dark = c('221c1a');
  const blink = frame === 2;
  const spots = dir === 0 ? [11, 19] : [19];
  for (const x of spots) {
    if (blink) {
      px(x, 12 + b, dark);
      px(x + 1, 12 + b, dark);
      continue;
    }
    px(x, 11 + b, c('ffffff'));
    px(x + 1, 11 + b, iris);
    px(x, 12 + b, iris);
    px(x + 1, 12 + b, dark);
    // Lash line; feminine eyes get an outer flick.
    px(x, 10 + b, dark);
    px(x + 1, 10 + b, dark);
    if (female) px(dir === 0 && x < 16 ? x - 1 : x + 2, 10 + b, dark);
  }
}

// ── Hair ──
function drawHair(ramp, style, dir, frame) {
  const b = BOB[frame];
  const [shadow, base, light] = ramp;
  const fill = c(base);
  const dark = c(shadow);
  if (dir === 0) {
    shadedEllipse(16, 9 + b, 8.3, 7, ramp, function (_x, y) {
      return y <= 7 + b;
    });
    rect(8, 6 + b, 1, 4, dark);
    rect(23, 6 + b, 1, 4, dark);
    if (style === 0 || style === 5) {
      for (let x = 9; x <= 22; x++) {
        if (x % 3 !== 0) px(x, 8 + b, fill);
        if (x % 3 === 1) px(x, 9 + b, x < 16 ? c(light) : fill);
      }
    } else if (style === 1) {
      rect(9, 8 + b, 14, 1, fill);
      rect(7, 7 + b, 2, 9, dark);
      rect(23, 7 + b, 2, 9, dark);
      rect(9, 8 + b, 3, 1, c(light));
    } else if (style === 2) {
      for (let x = 9; x <= 22; x++) {
        // Swept to one side, but always above the lash line (y 10).
        const len = x < 17 ? 2 : 1;
        for (let k = 0; k < len; k++) px(x, 8 + b + k, k === 0 && x < 14 ? c(light) : fill);
      }
    } else if (style === 3) {
      for (const sx of [9, 13, 17, 21]) {
        for (let k = 0; k < 4; k++) {
          px(sx, 4 + b - k + (k > 0 ? 0 : 0), k === 3 ? c(light) : fill);
          if (k < 2) px(sx + 1, 4 + b - k, dark);
        }
      }
      for (let x = 9; x <= 22; x += 2) px(x, 8 + b, fill);
    } else if (style === 4) {
      rect(9, 8 + b, 6, 1, fill);
      rect(17, 8 + b, 6, 1, fill);
      rect(7, 7 + b, 2, 15, dark);
      rect(23, 7 + b, 2, 15, dark);
      rect(9, 8 + b, 2, 1, c(light));
    }
    if (style === 5) {
      rect(24, 9 + b, 2, 8, dark);
      px(24, 9 + b, c('ffd541'));
      px(25, 17 + b, dark);
    }
  } else if (dir === 2) {
    shadedEllipse(16, 9.5 + b, 8.3, 7.4, ramp);
    if (style === 1) rect(8, 12 + b, 16, 4, fill);
    if (style === 4) litRect(8, 12 + b, 16, 11, [shadow, base, light]);
    if (style === 5) {
      rect(15, 12 + b, 3, 9, fill);
      px(15, 12 + b, c('ffd541'));
      px(16, 12 + b, c('ffd541'));
    }
    if (style === 3)
      for (const sx of [10, 14, 18, 22]) for (let k = 0; k < 3; k++) px(sx, 3 + b - k, fill);
  } else {
    // Facing right: hair covers the back of the head and the crown.
    shadedEllipse(15, 9 + b, 8, 7, ramp, function (x, y) {
      return x <= 16 || y <= 6 + b;
    });
    rect(17, 7 + b, 5, 1, fill);
    if (style !== 3) px(21, 8 + b, fill);
    if (style === 1) rect(8, 12 + b, 6, 4, fill);
    if (style === 4) litRect(8, 12 + b, 6, 11, [shadow, base, light]);
    if (style === 5) {
      rect(6, 9 + b, 2, 9, dark);
      px(8, 9 + b, c('ffd541'));
    }
    if (style === 2) rect(19, 8 + b, 3, 2, fill);
    if (style === 3)
      for (const sx of [10, 14, 18]) for (let k = 0; k < 3; k++) px(sx, 3 + b - k, fill);
  }
}

// ── Accessories ──
function drawAccessory(kind, dir, frame) {
  const b = BOB[frame];
  if (kind === 0) return;
  if (kind === 1) {
    // Glasses.
    if (dir === 2) return;
    const frameColor = c('242234');
    const lens = c('a6fcdb');
    for (const x of dir === 0 ? [10, 18] : [18]) {
      rect(x, 10 + b, 4, 1, frameColor);
      rect(x, 13 + b, 4, 1, frameColor);
      px(x, 11 + b, frameColor);
      px(x, 12 + b, frameColor);
      px(x + 3, 11 + b, frameColor);
      px(x + 3, 12 + b, frameColor);
      px(x + 1, 11 + b, lens);
    }
    if (dir === 0) rect(14, 11 + b, 4, 1, frameColor);
    else line(13, 11 + b, 17, 11 + b, frameColor);
  } else if (kind === 2) {
    // Backpack.
    const ramp = ['5b3138', '8e5252', 'bb7547'];
    if (dir === 0) {
      line(12, 17 + b, 12, 22 + b, c('71413b'));
      line(19, 17 + b, 19, 22 + b, c('71413b'));
    } else if (dir === 2) {
      litRect(11, 17 + b, 10, 8, ramp);
      rect(12, 18 + b, 8, 2, c('5b3138'));
      px(16, 21 + b, c('ffd541'));
    } else {
      litRect(9, 17 + b, 4, 8, ramp);
      line(13, 17 + b, 13, 21 + b, c('71413b'));
    }
  } else if (kind === 3) {
    // Explorer hat.
    const ramp = ['a08662', 'c7b08b', 'e4d2aa'];
    const x0 = dir === 1 ? 7 : 6;
    rect(x0, 5 + b, 26 - x0, 2, c(ramp[0]));
    rect(x0 + 1, 5 + b, 24 - x0, 1, c(ramp[1]));
    litRect(10, 1 + b, 12, 4, ramp);
    rect(10, 4 + b, 12, 1, c('b4202a'));
  } else if (kind === 4) {
    // Headphones.
    const band = c('4a5462');
    if (dir === 1) {
      line(12, 3 + b, 17, 2 + b, band);
      litRect(13, 9 + b, 4, 5, ['333941', '4a5462', '849be4']);
    } else {
      line(9, 4 + b, 16, 2 + b, band);
      line(16, 2 + b, 23, 4 + b, band);
      litRect(6, 9 + b, 3, 5, ['333941', '4a5462', '849be4']);
      litRect(23, 9 + b, 3, 5, ['333941', '4a5462', '849be4']);
    }
  } else if (kind === 5) {
    // Scarf.
    const ramp = ['73172d', 'b4202a', 'df3e23'];
    if (dir === 1) {
      litRect(13, 16 + b, 8, 2, ramp);
      rect(10, 17 + b, 3, 4, c('b4202a'));
    } else {
      litRect(10, 16 + b, 12, 2, ramp);
      rect(dir === 0 ? 18 : 12, 18 + b, 2, 4, c('df3e23'));
    }
  }
}

/** Copies a cell mirrored horizontally (right-facing → left-facing). */
function mirrorCell(sx, sy, dx, dy) {
  for (let y = 0; y < HS; y++)
    for (let x = 0; x < HS; x++) {
      const from = ((sy + y) * W + (sx + x)) * 4;
      const to = ((dy + y) * W + (dx + HS - 1 - x)) * 4;
      for (let k = 0; k < 4; k++) DATA[to + k] = DATA[from + k];
    }
}

/** Uncovers the near hand after the outfit's outline pass, so the skin shows through. */
function uncoverHands(dir, frame, motion) {
  const s = bodyShape(dir, pose(dir, frame, motion));
  for (const arm of s.arms) if (!arm.far && arm.hand) rect(arm.hand[0], arm.hand[1], 2, 2, null);
}

/**
 * Draws one layer sheet: `draw(variant, dir, frame)` per cell, left mirrored.
 * `withOutline` is a boolean or a function of the variant (thin props like glasses
 * must not be outlined: the outline would fill the whole face). `after` runs once the
 * cell is drawn and outlined.
 */
function heroSheet(variants, draw, withOutline, after) {
  for (let v = 0; v < variants; v++)
    for (const dir of [0, 1, 2]) {
      for (let f = 0; f < 8; f++) {
        cell(f * HS, (v * 4 + dir) * HS, HS, HS);
        draw(v, dir, f);
        const outlined = typeof withOutline === 'function' ? withOutline(v) : withOutline;
        if (outlined) outline();
        if (after) after(v, dir, f);
      }
    }
  for (let v = 0; v < variants; v++)
    for (let f = 0; f < 8; f++) {
      ORIGIN = { x: 0, y: 0 };
      CLIP = { x0: 0, y0: 0, x1: W, y1: H };
      mirrorCell(f * HS, (v * 4 + 1) * HS, f * HS, (v * 4 + 3) * HS);
    }
}
