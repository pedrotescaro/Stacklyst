// portrait-eyes.png — 10 frames: 5 eye colors × masculine/feminine (no outline).
portraitSheet(
  10,
  function (i) {
    portraitEyes(AVATAR.eyes[i % 5], i >= 5);
  },
  false
);
