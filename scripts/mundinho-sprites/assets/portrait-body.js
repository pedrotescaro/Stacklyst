// portrait-body.png — 18 frames: 9 skins × masculine/feminine.
portraitSheet(
  18,
  function (i) {
    portraitBody(AVATAR.skins[i % 9], i >= 9);
  },
  true
);
