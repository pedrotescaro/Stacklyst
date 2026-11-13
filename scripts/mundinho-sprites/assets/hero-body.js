// hero-body.png — 18 variants (9 skins × masculine/feminine) × 4 directions × 8 frames.
heroSheet(
  18,
  function (v, dir, f) {
    drawBody(AVATAR.skins[v % 9], v >= 9, dir, f, 'walk');
  },
  true
);
