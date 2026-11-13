import { canvas } from './mundinho-pixel-art.mjs';

// Stamps overlap the filled crown. Their colored roots are drawn through the old
// one-pixel outline, so a light dye never exposes a black seam at the attachment.
const locks = {
  bob: ['.ssb', 'ssbb', 'sbbb', 'sbhb', 'sbhb', 'sbb.', '.ss.'],
  feather: ['...b', '..bb', '.bhb', 'sbb.', 'sb..'],
  spike: ['...b..', '..bb..', '.bhbbs', 'bbbhbb', 'bbbbbb'],
  curtain: ['..bbb', '.sbbb', 'sbbhb', 'sbhbb', 'sbhbb', 'sbhb.', 'sbbb.', 'sbb..', '.s...'],
  tail: ['..bbbbb', '.bhbbbs', 'shbbs..', 'sbbbs..', '.sbbs..', '..sbbs.', '...sbb.', '....sb.'],
  curl: ['.bbbb.', 'bhhbbb', 'bhbbsb', 'bbbssb', '.bbbs.'],
  bun: ['..bbb.', '.bhhbb', 'bhbbbs', 'bbbssb', '.sbbsb', '..bbbb'],
  wave: ['..bbbb', '.bhbbb', 'shbbs.', 'sbbbs.', '.sbbbs', '..sbhb', '.sbbbs', 'sbbbs.', '.ss...'],
};

export function styleTutorialHair({ data, style, direction, head, shade, dye }) {
  if (!style) return data;
  const c = canvas(48, 48);
  c.data.set(data);
  const { x, y, w } = head;
  const mid = x + Math.floor(w / 2),
    side = direction % 2 === 1,
    back = direction === 2;
  const light = shade(dye, 30),
    shadow = shade(dye, -28);
  const colors = { b: dye, h: light, s: shadow };
  const fill = (px, py, col) => c.pixel(direction === 3 ? 2 * x + w - 1 - px : px, py, col);
  function stamp(name, left, top, flip = false) {
    const rows = locks[name];
    rows.forEach((row, dy) =>
      [...row].forEach((v, dx) => {
        if (colors[v]) fill(left + (flip ? row.length - 1 - dx : dx), top + dy, colors[v]);
      })
    );
  }
  // Use the tutorial hair, including its recessed fringe and the animation's bob.
  // Interior brush strokes model a part and the direction the hair is combed.
  function stroke(px, py, length, col) {
    for (let j = 0; j < length; j++) {
      const xx = direction === 3 ? 2 * x + w - 1 - (px + j) : px + j;
      if (data[(py * 48 + xx) * 4 + 3]) c.pixel(xx, py, col);
    }
  }
  const paired = (name, l, t, width) => {
    stamp(name, l, t);
    if (!side) stamp(name, 2 * mid - l - width, t, true);
  };
  switch (style) {
    case 1:
      paired('bob', x - 1, y + 3, 4);
      stroke(mid - 2, y + 2, 4, light);
      break;
    case 2:
      stamp('feather', x - 2, y + 2);
      stamp('feather', mid - 2, y - 1);
      stroke(mid, y + 3, 3, light);
      break;
    case 3:
      stamp('spike', x, y - 2);
      stamp('spike', mid - 1, y - 3);
      stroke(mid - 1, y + 2, 4, light);
      break;
    case 4:
      paired('curtain', x - 2, y + 3, 5);
      stroke(mid - 1, y + 1, 2, shadow);
      stroke(mid + 1, y + 2, 3, light);
      break;
    case 5:
      stamp('tail', side ? x - 4 : x + w - 4, y + 2, !side);
      fill(side ? x : x + w - 1, y + 4, '#b96a51');
      stroke(mid - 2, y + 2, 4, light);
      break;
    case 6:
      stamp('curl', x - 2, y + 2);
      stamp('curl', x + 1, y - 1);
      stamp('curl', mid, y);
      if (!side) stamp('curl', x + w - 4, y + 3);
      break;
    case 7:
      stamp('bun', x - 3, y - 1);
      if (!side) stamp('bun', x + w - 3, y - 1, true);
      stroke(mid - 2, y + 2, 4, light);
      break;
    case 8:
      paired('wave', x - 2, y + 2, 6);
      stroke(mid - 2, y + 1, 3, light);
      stroke(mid, y + 2, 3, light);
      break;
  }
  if (back && (style === 4 || style === 8)) {
    for (let j = 1; j < w - 1; j++) fill(x + j, y + head.h, j % 4 === 1 ? shadow : dye);
  }
  return c.data;
}
