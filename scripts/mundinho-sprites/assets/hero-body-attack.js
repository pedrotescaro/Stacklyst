// hero-body-attack.png — same rows as hero-body, attack swing across the 8 frames.
heroSheet(
  18,
  function (v, dir, f) {
    drawBody(AVATAR.skins[v % 9], v >= 9, dir, f, 'attack');
  },
  true
);
