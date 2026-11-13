// hero-outfit-attack.png — outfits during the attack swing.
heroSheet(
  AVATAR.outfits.length,
  function (v, dir, f) {
    drawOutfit(AVATAR.outfits[v], dir, f, 'attack');
  },
  true,
  function (_v, dir, f) {
    uncoverHands(dir, f, 'attack');
  }
);
