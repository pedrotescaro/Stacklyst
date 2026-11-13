// portrait-outfit.png — 24 frames: 12 outfits × masculine/feminine shoulders.
portraitSheet(
  24,
  function (i) {
    portraitOutfit(AVATAR.outfits[i % 12], i >= 12);
  },
  true
);
