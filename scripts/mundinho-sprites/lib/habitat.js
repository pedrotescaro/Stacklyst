// Tall-grass habitats where creatures hide: 3 variants of 72×48 side by side.
// The "back" sheet is drawn behind the creature, the "front" sheet in front of its feet.

const HABITAT_W = 72;
const BLADE = ['122020', '24523b', '1a7a3e', '14a02e', '59c135', '9cdb43'];

/** One leaf blade from (x, y) at the base, curving toward `lean`, lit on its left edge. */
function blade(x, y, height, lean, width) {
  for (let k = 0; k < height; k++) {
    const t = k / height;
    const cx = x + lean * t * t;
    const w = Math.max(0, Math.round((width || 2) * (1 - t)));
    for (let dx = -w; dx <= w; dx++) {
      const lit = dx < 0 || (w === 0 && lean < 0);
      const tone = t > 0.8 ? 5 : lit ? 4 : t < 0.25 ? 1 : 2;
      px(cx + dx, y - k, c(BLADE[tone]));
    }
  }
}

function habitatBack(variant) {
  const r = rng(40 + variant * 13);
  for (let i = 0; i < 16; i++) {
    const x = 10 + r() * 52;
    const h = 14 + Math.floor(r() * 18);
    blade(x, 44, h, (r() - 0.5) * 16, 2);
  }
  if (variant === 2) {
    for (const [x, y] of [
      [18, 26],
      [40, 22],
      [56, 30],
    ]) {
      px(x, y, c('fef3c0'));
      px(x - 1, y, c('fef3c0'));
      px(x + 1, y, c('fef3c0'));
      px(x, y - 1, c('fef3c0'));
      px(x, y, c('ffd541'));
    }
  }
  if (variant === 1) {
    // A few berries on the second clump.
    for (const [x, y] of [
      [24, 30],
      [46, 28],
    ]) {
      px(x, y, c('bc4a9b'));
      px(x + 1, y, c('e86a73'));
    }
  }
}

function habitatFront(variant) {
  const r = rng(90 + variant * 7);
  for (let i = 0; i < 9; i++) {
    const x = 8 + r() * 56;
    blade(x, 47, 5 + Math.floor(r() * 7), (r() - 0.5) * 8, 1);
  }
}
