// hero-eyes.png — 10 variants (5 colors × masculine/feminine). No outline: eyes sit on skin.
heroSheet(
  10,
  function (v, dir, f) {
    drawEyes(AVATAR.eyes[v % 5], v >= 5, dir, f);
  },
  false
);
