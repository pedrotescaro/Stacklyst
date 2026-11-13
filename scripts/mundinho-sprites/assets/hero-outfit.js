// hero-outfit.png — 12 outfits × 4 directions × 8 frames.
heroSheet(
  AVATAR.outfits.length,
  function (v, dir, f) {
    drawOutfit(AVATAR.outfits[v], dir, f, 'walk');
  },
  true,
  function (_v, dir, f) {
    uncoverHands(dir, f, 'walk');
  }
);
