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
    p: ['.bbbbb.', 'llbbbbs', '.sssbs.', '....ls.'],
    b: ['.bbbbb.', 'sllbbbs', '.ssbss.', '..bls..'],
    s: ['.lbbb.', 'sbbbs.', '.sbls.', '...bs.'],
    inks: { b: '#c56850', l: '#ffa06d', s: '#824648' },
  },
};

// Trace an open rim around the visible pupil(s) in this frame.
function drawGlasses(c, eyes, direction, head) {
  if (direction === 2) return c.data;
  // The raised bow can hide the eye in the source. Fit the profile temple
  // to its ordinary eye line and let the foreground weapon occlude it.
  const landmarks = eyes.length
    ? eyes
    : [{ x: direction === 3 ? head.x + 2 : head.x + head.w - 3, y: head.y + 6 }];
  const xs = [...new Set(landmarks.map((p) => p.x))].sort((a, b) => a - b);
  const rim = '#805c49',
    glint = '#d0b29a';
  for (const x of xs) {
    const points = landmarks.filter((p) => p.x === x).map((p) => p.y);
    const y = Math.min(...points),
      bottom = Math.max(...points);
    c.rect(x - 1, y - 1, 3, 1, rim);
    c.pixel(x - 1, y - 1, glint);
    c.rect(x - 2, y, 1, bottom - y + 1, rim);
    c.rect(x + 2, y, 1, bottom - y + 1, rim);
    c.rect(x - 1, bottom + 1, 3, 1, rim);
    if (direction % 2 === 1) c.rect(direction === 1 ? x - 4 : x + 2, y, 3, 1, rim);
  }
  if (xs.length === 2)
    c.rect(xs[0] + 2, Math.min(...eyes.map((p) => p.y)), xs[1] - xs[0] - 3, 1, rim);
  for (const { x, y } of eyes) c.data.fill(0, (y * 48 + x) * 4, (y * 48 + x) * 4 + 4);
  return c.data;
}

export function drawGear(id, { head, direction, pixels, eyes, faceAndHands }) {
  const c = canvas(48, 48);
  if (!id) return c.data;
  if (id === 1) return drawGlasses(c, eyes, direction, head);
  const side = direction % 2 === 1,
    back = direction === 2;
  const g = gear[['', '', 'pack', 'hat', 'phones', 'scarf'][id]];
  const rows = (side && g.s) || (back && g.b) || g.p;
  const cx = head.x + (head.w - 1) / 2;
  const chest = pixels.filter(
    (p) => (p.color === 'ce0c39' || p.color === '921038') && Math.abs(p.x - cx) <= 4
  );
  const collar = chest.length ? Math.min(...chest.map((p) => p.y)) : head.y + 11;
  const chestX = chest.length
    ? Math.round(chest.reduce((sum, p) => sum + p.x, 0) / chest.length)
    : Math.round(cx);
  const onBody = id === 2 || id === 5;
  const top =
    id === 2
      ? back
        ? collar - 2
        : collar
      : id === 3
        ? head.y - 4
        : id === 4
          ? head.y - 1
          : collar;
  let left = Math.round((onBody ? chestX : cx) - (rows[0].length - 1) / 2);
  if (side && id === 2) left = direction === 1 ? chestX - 5 : chestX + 2;
  rows.forEach((row, dy) =>
    [...row].forEach((v, dx) => {
      const x = left + (direction === 3 ? row.length - 1 - dx : dx),
        y = top + dy;
      if (g.inks[v] && !faceAndHands.has(y * 48 + x)) c.pixel(x, y, g.inks[v]);
    })
  );
  return c.data;
}
