import { canvas } from './mundinho-pixel-art.mjs';

// Three rows of stitching across the jacket. Directional patterns are clipped
// to the original garment pixels so cuffs, hands, trousers and boots articulate.
const patterns = {
  hoodie: ['..s...s..', '..l...l..', '...sss...'],
  tech: ['.aa...aa.', '..s.l....', 'a...l...a'],
  coat: ['..ll.ll..', '..s.a.s..', '.pp...pp.'],
  sweater: ['..sllls..', 'alalalala', '..s...s..'],
  ceremonial: ['aa..l..aa', '.aaslsaa.', '...aaa...'],
  bomber: ['.ls...sl.', '..p.l.p..', 'sssslssss'],
  denim: ['.ll...ll.', '.pp.l.pp.', '..a.l.a..'],
  cardigan: ['..l...l..', '...l.l...', '..p.a.p..'],
  overcoat: ['.lll.lll.', '..sa.as..', '...a.a...'],
  sailor: ['.aaa.aaa.', '..aalaa..', '...ala...'],
  tunic: ['..aalaa..', '...ala...', '.ssaaass.'],
};
export function detailClothing(c, pose, garment, shade) {
  const cloth = pose.pixels.filter((p) =>
    ['ce0c39', '921038', '8c8c8c', 'd7d7d7'].includes(p.color)
  );
  if (!cloth.length || !patterns[garment.kind]) return;
  const top = Math.min(...cloth.map((p) => p.y)),
    bottom = Math.max(...cloth.map((p) => p.y));
  const middle = pose.head.x + (pose.head.w - 1) / 2,
    side = pose.direction % 2 === 1;
  const inks = {
    s: garment.shadow,
    l: shade(garment.jacket, 40),
    a: garment.shirt,
    p: shade(garment.shadow, -22),
  };
  const front = patterns[garment.kind];
  const back =
    garment.kind === 'hoodie'
      ? ['.sslllss.', '..sllls..', '...sss...']
      : ['..lllll..', 's.......s', '..sssss..'];
  for (const { x, y } of cloth) {
    const row = Math.min(2, Math.round((2 * (y - top)) / Math.max(1, bottom - top)));
    const dx = pose.direction === 3 ? middle - x : x - middle;
    const col = Math.max(0, Math.min(8, Math.round(dx + (side ? 3 : 4))));
    const mark = (pose.direction === 2 ? back : front)[row][col];
    if (inks[mark]) c.pixel(x, y, inks[mark]);
  }
}

const gear = {
  glasses: {
    p: ['.tt..tt.', 'trrttrrt', 't..tt..t', '.tt..tt.'],
    s: ['..tttt.', 'tttrrrt', '...t..t', '....tt.'],
    inks: { t: '#644739', r: '#b0d2d1' },
  },
  pack: {
    p: ['ls...sl', 'ls...sl', '.a...a.', '.s...s.'],
    s: ['.tt.', 'tllt', 'tbat', 'tbpt', '.tt.'],
    b: ['..ttt..', '.t...t.', 'tlllllt', 'tlbbblt', 'tssaast', 'tbpppbt', '.ttttt.'],
    inks: { t: '#4a2f2b', l: '#c99861', s: '#7b5039', b: '#a5714a', a: '#edc17c', p: '#855339' },
  },
  hat: {
    p: [
      '....tttttt....',
      '...tllllbbt...',
      '..tblblblbbt..',
      '..trrrrrrrrt..',
      '.tllbbbbbbbtt.',
      'ttbbbbbbbbbbbt',
      '..tttttttttt..',
    ],
    inks: { t: '#78532f', l: '#f9d993', b: '#dbad65', r: '#ab4d40' },
  },
  phones: {
    p: [
      '...tttttt...',
      '..tllllllt..',
      '.tt......tt.',
      '.t........t.',
      'ttt......ttt',
      'tlb......blt',
      'tab......bat',
      '.tt......tt.',
    ],
    s: [
      '..tttttt..',
      '.tllllllt.',
      '.tt.....tt',
      '.t........',
      'tttt......',
      'tblbt.....',
      'tbabt.....',
      '.ttt......',
    ],
    inks: { t: '#283342', l: '#91acb7', b: '#4a6173', a: '#e7ad66' },
  },
  scarf: {
    p: ['.bbbbbb.', 'lsllbbbs', '.sssbbss', '....bls.', '....sls.', '.....ss.'],
    b: ['.bbbbbb.', 'sllbbbbs', '.ssbbss.', '..bls...', '..ls....'],
    inks: { b: '#c56850', l: '#ffa06d', s: '#824648' },
  },
};

export function drawGear(id, { head, direction, pixels }) {
  const c = canvas(48, 48);
  if (!id) return c.data;
  const side = direction % 2 === 1,
    back = direction === 2;
  if (back && id === 1) return c.data;
  const g = gear[['', 'glasses', 'pack', 'hat', 'phones', 'scarf'][id]];
  const rows = (side && g.s) || (back && g.b) || g.p;
  const cx = head.x + (head.w - 1) / 2;
  const eye = pixels.filter((p) => p.layer === 'eyes'),
    eyeY = eye.length ? Math.min(...eye.map((p) => p.y)) : head.y + 7;
  const chest = pixels.filter((p) => p.color === 'ce0c39' || p.color === '921038');
  const collar = chest.length ? Math.min(...chest.map((p) => p.y)) : head.y + 11;
  const top = [0, eyeY - 2, back ? collar - 3 : collar - 1, head.y - 3, head.y - 1, collar - 1][id];
  let left = Math.round(cx - (rows[0].length - 1) / 2);
  if (side && id === 2) left = head.x - 1;
  if (side && id === 1) left = head.x + head.w - rows[0].length + 1;
  rows.forEach((row, dy) =>
    [...row].forEach((v, dx) => {
      const color = g.inks[v];
      if (!color) return;
      const x = direction === 3 ? Math.round(2 * cx) - (left + dx) : left + dx;
      c.pixel(x, top + dy, color);
    })
  );
  return c.data;
}
