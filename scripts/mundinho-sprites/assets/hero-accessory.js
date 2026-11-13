// hero-accessory.png — 0 none, 1 glasses, 2 backpack, 3 explorer hat, 4 headphones, 5 scarf.
heroSheet(
  6,
  function (v, dir, f) {
    drawAccessory(v, dir, f);
  },
  function (v) {
    return v !== 1;
  }
);
