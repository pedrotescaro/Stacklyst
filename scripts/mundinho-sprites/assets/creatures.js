// creatures-animated.png — 8 columns × 6 rows, 24×24 per frame.
// Rows: 0 syntax-slime, 1 blue-slime (water drop), 2 ember, 3 byte-bug, 4 forest (mushroom), 5 null-ghost.
// Frames 0–3: idle loop. Frames 4–7: attack (wind-up, strike, impact, recover).
// Feet rest on y = 22; the drop shadow is drawn by CSS.

const GROUND = 22;
const DARK = c('060608');
const WHITE = c('ffffff');

function eyes(x1, x2, y, opts) {
  const o = opts || {};
  const pupil = o.pupil ? c(o.pupil) : DARK;
  for (const x of [x1, x2]) {
    if (o.closed) {
      px(x, y + 1, pupil);
      px(x + 1, y + 1, pupil);
      continue;
    }
    px(x, y, pupil);
    px(x, y + 1, pupil);
    if (o.big) {
      px(x + 1, y, pupil);
      px(x + 1, y + 1, pupil);
    }
    px(x + (o.big ? 1 : 0), y, o.glint ? c(o.glint) : WHITE);
  }
}

function flatBottom(y) {
  return function (_x, yy) {
    return yy < y;
  };
}

// ── Slimes ──
const SLIME_IDLE = [
  { rx: 8, ry: 7, cy: 15 },
  { rx: 8.6, ry: 6.4, cy: 15.6 },
  { rx: 8, ry: 7, cy: 15 },
  { rx: 7.5, ry: 7.6, cy: 14.4 },
];
const SLIME_ATTACK = [
  { rx: 9.6, ry: 5.4, cy: 16.6 },
  { rx: 6.6, ry: 8.4, cy: 10, air: true },
  { rx: 10.6, ry: 4.8, cy: 17.2, splash: true },
  { rx: 8.4, ry: 6.6, cy: 15.4 },
];

function slime(frame, ramp, accent) {
  const s = frame < 4 ? SLIME_IDLE[frame] : SLIME_ATTACK[frame - 4];
  const cx = 12;
  shadedEllipse(cx, s.cy, s.rx, s.ry, ramp, s.air ? null : flatBottom(GROUND));
  // Glossy highlight on the lit side.
  px(cx - Math.round(s.rx * 0.45), Math.round(s.cy - s.ry * 0.55), c(accent));
  px(cx - Math.round(s.rx * 0.45) + 1, Math.round(s.cy - s.ry * 0.55), c(accent));
  px(cx - Math.round(s.rx * 0.45), Math.round(s.cy - s.ry * 0.55) + 1, c(accent));
  const ey = Math.round(s.cy - 1);
  if (frame === 2) eyes(cx - 4, cx + 3, ey, { closed: true });
  else eyes(cx - 4, cx + 3, ey, { big: frame >= 4 && frame <= 6 });
  if (frame === 5 || frame === 6) {
    // Open mouth while attacking.
    rect(cx - 1, ey + 3, 3, 2, DARK);
    px(cx, ey + 4, c('e86a73'));
  } else {
    px(cx - 1, ey + 3, DARK);
    px(cx + 1, ey + 3, DARK);
    px(cx, ey + 4, DARK);
  }
  if (s.splash) {
    for (const [x, y] of [
      [2, 18],
      [1, 15],
      [21, 18],
      [22, 15],
      [4, 13],
      [19, 13],
    ])
      px(x, y, c(ramp[ramp.length - 2]));
  }
}

function syntaxSlime(frame) {
  slime(frame, ['24523b', '1a7a3e', '14a02e', '59c135', '9cdb43'], 'd6f264');
  // A sprout of code on top: </> leaf.
  const s = frame < 4 ? SLIME_IDLE[frame] : SLIME_ATTACK[frame - 4];
  const top = Math.round(s.cy - s.ry) - 1;
  px(12, top, c('14a02e'));
  px(12, top - 1, c('14a02e'));
  px(13, top - 2, c('9cdb43'));
  px(14, top - 2, c('59c135'));
  px(11, top - 2, c('59c135'));
}

function waterDrop(frame) {
  const ramp = ['143464', '285cc4', '249fde', '20d6c7', 'a6fcdb'];
  slime(frame, ramp, 'ffffff');
  const s = frame < 4 ? SLIME_IDLE[frame] : SLIME_ATTACK[frame - 4];
  // Drop tip.
  const top = Math.round(s.cy - s.ry);
  const sway = frame < 4 ? [0, 1, 0, -1][frame] : 0;
  px(12 + sway, top - 1, c('249fde'));
  px(12 + sway, top - 2, c('20d6c7'));
  px(12 + sway + (sway >= 0 ? 1 : -1), top - 3, c('a6fcdb'));
  if (frame === 6 || frame === 7) {
    // Spit: a droplet flying forward (to the left, toward the hero).
    const x = frame === 6 ? 3 : 1;
    ellipse(x + 1, 12, 1.6, 1.6, c('249fde'));
    px(x, 11, c('a6fcdb'));
  }
}

// ── Ember ──
function ember(frame) {
  const r = rng(300 + frame * 17);
  const grow = frame === 5 ? 1.5 : frame === 6 ? 2.5 : frame === 4 ? -0.5 : 0;
  const bob = frame < 4 ? [0, -1, 0, 1][frame] : 0;
  const cy = 15 + bob - grow * 0.4;
  const fire = ['73172d', 'b4202a', 'df3e23', 'fa6a0a', 'f9a31b'];
  // Tongues of flame.
  const tongues = [
    [8, 4 + Math.floor(r() * 3)],
    [12, 7 + Math.floor(r() * 3) + grow],
    [16, 4 + Math.floor(r() * 3)],
  ];
  for (const [tx, len] of tongues) {
    for (let k = 0; k < len; k++) {
      const w = Math.max(0, Math.round((len - k) / 3));
      for (let dx = -w; dx <= w; dx++)
        px(
          tx + dx + (k > len / 2 ? (frame % 2 ? 1 : -1) : 0),
          cy - 5 - k,
          c(k > len - 2 ? 'f9a31b' : 'fa6a0a')
        );
    }
  }
  shadedEllipse(12, cy, 7 + grow * 0.5, 7 + grow * 0.4, fire, flatBottom(GROUND + 1));
  // Hot core.
  ellipse(12, cy + 1.5, 3.2 + grow * 0.3, 3.2, c('ffd541'));
  ellipse(12, cy + 2, 1.6, 1.6, c('fffc40'));
  eyes(9, 14, Math.round(cy - 2), { pupil: '3b1725', glint: 'fef3c0', big: frame >= 5 });
  if (frame >= 5 && frame <= 6) {
    // Sparks thrown at the target.
    for (const [x, y] of [
      [3, 9],
      [1, 13],
      [4, 16],
      [2, 6],
    ])
      px(x - (frame - 5), y, c(r() > 0.5 ? 'ffd541' : 'fa6a0a'));
  }
}

// ── Byte-bug ──
function byteBug(frame) {
  const rear = frame === 4 ? -2 : frame === 5 ? -3 : frame === 6 ? 1 : 0;
  const lunge = frame === 6 ? -2 : 0;
  const step = frame < 4 ? frame % 2 : frame % 2;
  const cx = 12 + lunge;
  const shellY = 13 + rear * 0.5;
  // Legs (behind the shell).
  const leg = c('242234');
  for (let i = 0; i < 3; i++) {
    const lift = (i + step) % 2;
    line(cx - 5, shellY + 2 + i * 2, cx - 9, GROUND - 1 - lift + (i - 1), leg);
    line(cx + 5, shellY + 2 + i * 2, cx + 9, GROUND - 1 - (1 - lift) + (i - 1), leg);
  }
  // Shell.
  shadedEllipse(cx, shellY, 8, 6.5, ['242234', '403353', '793a80', 'bc4a9b', 'e86a73']);
  line(cx, shellY - 6, cx, shellY + 6, c('242234'));
  // Binary dots on the shell.
  px(cx - 4, shellY - 2, c('f5a097'));
  px(cx - 3, shellY - 2, c('f5a097'));
  px(cx + 3, shellY - 1, c('f5a097'));
  // Head.
  shadedEllipse(cx, shellY + 6, 4.4, 3.2, ['242234', '403353', '6d758d']);
  eyes(cx - 3, cx + 2, Math.round(shellY + 5), { pupil: '20d6c7', glint: 'a6fcdb', big: true });
  // Antennae.
  line(cx - 2, shellY - 6, cx - 5, shellY - 10 + rear, leg);
  line(cx + 2, shellY - 6, cx + 5, shellY - 10 + rear, leg);
  px(cx - 5, shellY - 11 + rear, c('20d6c7'));
  px(cx + 5, shellY - 11 + rear, c('20d6c7'));
  // Pincers snap during the attack.
  if (frame >= 5 && frame <= 6) {
    const open = frame === 5 ? 2 : 0;
    line(cx - 3, shellY + 8, cx - 5 - open, shellY + 10, c('8b93af'));
    line(cx + 3, shellY + 8, cx + 5 + open, shellY + 10, c('8b93af'));
  }
}

// ── Mushroom ──
function mushroom(frame) {
  const sway = frame < 4 ? [0, 1, 0, -1][frame] : frame === 4 ? -1 : 0;
  const squash = frame === 5 ? 2 : frame === 4 ? -1 : 0;
  // Stem with face.
  const stemTop = 12 + squash;
  for (let y = stemTop; y < GROUND; y++) {
    const half = y > GROUND - 3 ? 4 : 3;
    for (let x = 12 - half; x < 12 + half; x++) px(x + (y < 16 ? sway : 0), y, c('e4d2aa'));
  }
  shadeVertical(7, stemTop, 10, GROUND - stemTop, ['a08662', 'c7b08b', 'e4d2aa', 'fef3c0']);
  // Face goes on after the shading so it is not painted over.
  eyes(9, 13, stemTop + 3, { closed: frame === 1, big: frame >= 5 && frame <= 6 });
  if (frame >= 5 && frame <= 6) rect(11, stemTop + 6, 2, 1, DARK);
  else px(11, stemTop + 6, DARK);
  // Cap.
  const capY = stemTop - 1;
  shadedEllipse(
    12 + sway,
    capY,
    10,
    6.5 - squash * 0.5,
    ['3b1725', '73172d', 'b4202a', 'e86a73'],
    function (_x, y) {
      return y <= capY + 1;
    }
  );
  for (const [x, y] of [
    [8, capY - 3],
    [14, capY - 4],
    [17, capY - 1],
    [11, capY - 1],
  ]) {
    px(x + sway, y, c('fef3c0'));
    px(x + 1 + sway, y, c('fef3c0'));
  }
  if (frame >= 5 && frame <= 7) {
    // Spore cloud.
    const spread = frame - 4;
    for (const [x, y] of [
      [4, 6],
      [8, 3],
      [16, 3],
      [20, 6],
      [2, 10],
      [22, 10],
    ])
      px(12 + (x - 12) * (0.6 + spread * 0.25), y - spread, c(frame === 7 ? '5daf8d' : '9cdb43'));
  }
}

// ── Ghost ──
function ghost(frame) {
  const bob = frame < 4 ? [0, -1, -2, -1][frame] : frame === 5 ? -3 : 0;
  const lunge = frame === 6 ? -3 : frame === 5 ? 1 : 0;
  const cx = 12 + lunge;
  const cy = 11 + bob;
  const ramp = ['6d758d', '8b93af', 'b3b9d1', 'dae0ea', 'ffffff'];
  shadedEllipse(cx, cy, 7.5, 7, ramp);
  // Body column and wavy tail.
  for (let y = cy; y <= cy + 8; y++)
    for (let x = cx - 7; x <= cx + 6; x++) {
      const wave = Math.round(Math.sin((x + frame * 2) * 0.9) * 1.2);
      if (y <= cy + 6 + wave) px(x, y, c(x < cx - 3 ? 'dae0ea' : x > cx + 3 ? '8b93af' : 'b3b9d1'));
    }
  const angry = frame >= 5 && frame <= 6;
  eyes(cx - 4, cx + 2, cy - 1, {
    pupil: angry ? 'b4202a' : '242234',
    glint: angry ? 'ffd541' : 'ffffff',
    big: true,
  });
  if (angry) {
    rect(cx - 2, cy + 3, 4, 3, DARK);
    px(cx - 1, cy + 5, c('b4202a'));
  } else {
    px(cx - 1, cy + 3, DARK);
    px(cx, cy + 3, DARK);
  }
  // Little arms.
  px(cx - 8, cy + 2 + (frame % 2), c('b3b9d1'));
  px(cx + 7, cy + 2 + ((frame + 1) % 2), c('8b93af'));
}

const ROWS = [syntaxSlime, waterDrop, ember, byteBug, mushroom, ghost];
for (let row = 0; row < ROWS.length; row++) {
  for (let frame = 0; frame < 8; frame++) {
    cell(frame * 24, row * 24, 24, 24);
    ROWS[row](frame);
    outline();
  }
}
