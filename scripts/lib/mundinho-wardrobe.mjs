import { canvas } from './mundinho-pixel-art.mjs';

// Six-pixel tailoring at the scale of the tutorial character. The first three
// rows describe shoulders, chest and waist. The last row is optional lower trim.
// Side art faces right; mapping the coordinates mirrors it for the left view.
const tailoring = {
  hoodie: {
    front: ['.shjjhjs.', 'jjhjssjjj', '.sjjppjs.', '.........'],
    side: ['.shhjs.', 'jjsjjs.', '.ssppj.', '.......'],
    back: ['.hhllhhs.', 'jjshhhsjj', '.jjspsjj.', '.........'],
    accent: '#8ad5e5',
  },
  tech: {
    front: ['.ppjjppp.', 'ljjjsapjj', '.pssajsp.', '.........'],
    side: ['.ppjjs.', 'jljsap.', '.jsssp.', '.......'],
    back: ['.ppaaapp.', 'ljppjppjl', '.pjjajjp.', '.........'],
    accent: '#54d9d8',
  },
  coat: {
    front: ['.shhhssj.', 'jjhccssjj', '.sjccjsp.', '..js.sp..'],
    side: ['.jhsss.', 'jhccsj.', '.sjcsp.', '..js...'],
    back: ['.hhlllss.', 'jjhhssjjj', '.jjspsjj.', '..js.sj..'],
    accent: '#e4ac65',
  },
  sweater: {
    front: ['.sscccss.', 'jljjajjjj', '.jsaaasj.', '.........'],
    side: ['.sccss.', 'jjljjj.', '.saasj.', '.......'],
    back: ['.sscscss.', 'jljjjjjjj', '.jsaaasj.', '.........'],
    accent: '#ce825c',
  },
  ceremonial: {
    front: ['.ajhhhja.', 'sajpcpjas', '.sjacajp.', '...a.a...'],
    side: ['.ahljs.', 'ajppsj.', '.sajap.', '...a...'],
    back: ['.aaahaaa.', 'sjajjajjs', '.psaaasp.', '...a.a...'],
    accent: '#ffe99d',
  },
  bomber: {
    front: ['.pplllpp.', 'ljjpcjjaa', '.ssscssj.', '.........'],
    side: ['.ppllp.', 'llajjc.', '.ssssp.', '.......'],
    back: ['.pphhhpp.', 'ljjjjjjjl', '.psssssp.', '.........'],
    accent: '#ffe7be',
  },
  denim: {
    front: ['.sjhhjjs.', 'jjapcjapj', '.sjscsjp.', '.........'],
    side: ['.shhjs.', 'jjapjc.', '.sssjp.', '.......'],
    back: ['.jjhhhjj.', 'jjaaaajjj', '.ssjjjss.', '.........'],
    accent: '#dbbf88',
  },
  cardigan: {
    front: ['.hjccclj.', 'jjlcccsjj', '.sjlcasp.', '.........'],
    side: ['.jlccs.', 'jjlccs.', '.jslas.', '.......'],
    back: ['.hhllhhs.', 'jjljjjsjj', '.psjjjsp.', '.........'],
    accent: '#f2ca9e',
  },
  overcoat: {
    front: ['.pllcllp.', 'ssjacajss', '.sjajasp.', '..js.sj..'],
    side: ['.pplcs.', 'psjlcs.', '.sjasp.', '..js...'],
    back: ['.pllhlsp.', 'ssjjpsjss', '.pjsasjp.', '..js.sj..'],
    accent: '#e7bd75',
  },
  sailor: {
    front: ['.jnncnnj.', 'jjcnancjj', '.sjcacjs.', '....a....'],
    side: ['.jncnn.', 'jnccnj.', '.ssjac.', '.....a.'],
    back: ['.nnnnnnn.', 'jjnncnnjj', '.sjnnnjs.', '.........'],
    accent: '#c6364c',
  },
  tunic: {
    front: ['.sshhhss.', 'jjhccssjj', '.spaaaps.', '..ja.aj..'],
    side: ['.shhhs.', 'jhccsj.', '.spaap.', '..ja...'],
    back: ['.hhllhhs.', 'jjsllsjjj', '.ssaaass.', '..jj.jj..'],
    accent: '#e6bc79',
  },
};

export function detailClothing(c, pose, garment, shade) {
  const design = tailoring[garment.kind];
  if (!design) return; // The red adventure jacket is the original tutorial artwork.
  const fabric = pose.pixels.filter((p) =>
    ['ce0c39', '921038', 'd7d7d7', '8c8c8c'].includes(p.color)
  );
  if (!fabric.length) return;
  const top = Math.min(...fabric.map((p) => p.y)),
    bottom = Math.max(...fabric.map((p) => p.y));
  const center = pose.head.x + (pose.head.w - 1) / 2;
  const rows = pose.direction % 2 ? design.side : pose.direction === 2 ? design.back : design.front;
  const colors = {
    j: garment.jacket,
    s: garment.shadow,
    p: shade(garment.shadow, -27),
    h: shade(garment.jacket, 18),
    l: shade(garment.jacket, 37),
    a: design.accent,
    c: garment.shirt,
    n: '#243551',
  };
  // Map details onto the actual pose. Selectively use interior outline pixels
  // underneath the chin for the collar, keeping the hands, head and blade clear.
  const clothSet = new Set(fabric.map((p) => p.y * 48 + p.x));
  for (const p of pose.pixels) {
    if (p.y < top || p.y > bottom + 1) continue;
    const dx = p.x - center;
    const cloth = clothSet.has(p.y * 48 + p.x);
    const underChin =
      p.color === '0c0c0c' && Math.abs(dx) < 3 && p.y === top && clothSet.has((p.y + 1) * 48 + p.x);
    const trim = p.y === bottom + 1 && ['1b1214', '2e1e21'].includes(p.color);
    if (!cloth && !underChin && !trim) continue;
    const col = Math.round((pose.direction === 3 ? -dx : dx) + (rows[0].length - 1) / 2);
    const row = trim ? 3 : Math.round((2 * (p.y - top)) / Math.max(1, bottom - top));
    const color = colors[rows[row]?.[col]];
    if (color) c.pixel(p.x, p.y, color);
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
