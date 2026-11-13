// hero-hair.png — 36 rows: 6 styles × 6 color slots (slot 3 is the tintable silver).
heroSheet(
  36,
  function (v, dir, f) {
    drawHair(AVATAR.hairs[v % 6], Math.floor(v / 6), dir, f);
  },
  true,
  function (_v, dir, f) {
    // Keep the eyes (and lash flicks) clear of bangs and of the outline under them.
    if (dir === 2) return;
    const b = BOB[f];
    const boxes =
      dir === 0
        ? [
            [10, 12],
            [18, 21],
          ]
        : [[19, 21]];
    for (const [x0, x1] of boxes)
      for (let y = 10 + b; y <= 12 + b; y++) for (let x = x0; x <= x1; x++) px(x, y, null);
  }
);
