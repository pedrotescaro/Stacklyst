import sharp from 'sharp';
import { canvas } from './mundinho-pixel-art.mjs';
import { styleTutorialHair } from './mundinho-tutorial-hair.mjs';

export const directions = ['baixo', 'direita', 'cima', 'esquerda'];
// Fixed strip origins preserve the bounce and keep the whole blade inside the cell.
export const poses = {
  idle: {
    source: 'parado',
    origins: [
      [17, 20],
      [18, 21],
      [17, 20],
      [18, 21],
    ],
  },
  walk: {
    source: 'correndo',
    origins: [
      [17, 18],
      [18, 19],
      [17, 18],
      [18, 19],
    ],
  },
  attack: {
    source: 'atacando',
    origins: [
      [16, 20],
      [17, 22],
      [13, 10],
      [2, 22],
    ],
  },
  bow: {
    source: 'arco',
    origins: [
      [18, 20],
      [18, 20],
      [18, 20],
      [11, 20],
    ],
  },
};
const browns = ['34181a', '1b0e0f'];
const skinColors = ['e19870', 'a78567', '8f735b'];
const fabric = ['ce0c39', '921038', 'd7d7d7', '8c8c8c', '1b1214', '2e1e21'];
const weaponColors = ['e9eaf6', 'c1c2cb', 'a1a1a4', '2a2a2a', '000000', '0c0a0a'];
const hairColors = ['#34181a', '#684331', '#bd8240', '#dcd8d4', '#805d9e', '#c15e54'];
const shade = (hex, delta) =>
  '#' +
  [1, 3, 5]
    .map((i) =>
      Math.max(0, Math.min(255, parseInt(hex.slice(i, i + 2), 16) + delta))
        .toString(16)
        .padStart(2, '0')
    )
    .join('');

export async function readPose(motion, direction) {
  const pose = poses[motion];
  const file =
    'artifacts/mundinho/tutorial-source/spr_personagem_' +
    pose.source +
    '_' +
    directions[direction] +
    '_strip6.png';
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const width = info.width / 6;
  return Array.from({ length: 6 }, (_, frame) => {
    const grid = Array.from({ length: info.height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const index = (y * info.width + frame * width + x) * 4;
        return data[index + 3] ? data.subarray(index, index + 3).toString('hex') : null;
      })
    );
    const [dx, dy] = pose.origins[direction];
    const pixels = [],
      hair = [];
    grid.forEach((row, y) =>
      row.forEach((color, x) => {
        if (!color) return;
        const neighbors = [grid[y - 1]?.[x], grid[y + 1]?.[x], row[x - 1], row[x + 1]];
        let layer = 'body';
        if (browns.includes(color)) {
          layer = 'hair';
          hair.push([x + dx, y + dy]);
        } else if (fabric.includes(color)) layer = 'outfit';
        else if (
          weaponColors.includes(color) ||
          (motion === 'bow' && !skinColors.includes(color) && color !== '0c0c0c')
        )
          layer = 'weapon';
        else if (
          color === '0c0c0c' &&
          neighbors.filter((c) => skinColors.includes(c)).length >= 3 &&
          direction !== 2
        )
          layer = 'eyes';
        pixels.push({ x: x + dx, y: y + dy, color, layer });
      })
    );
    const xs = hair.map((p) => p[0]),
      ys = hair.map((p) => p[1]);
    const x = Math.min(...xs),
      y = Math.min(...ys);
    return {
      pixels,
      head: { x, y, w: Math.max(...xs) - x + 1, h: Math.max(...ys) - y + 1 },
      direction,
    };
  });
}

function accessory(c, id, head, direction) {
  const x = head.x,
    y = head.y,
    w = head.w,
    center = x + Math.floor(w / 2);
  const side = direction % 2 === 1,
    back = direction === 2;
  if (id === 1 && !back) {
    const lenses = side ? [direction === 1 ? x + w - 4 : x] : [x + 1, x + w - 5];
    for (const lx of lenses) {
      c.rect(lx, y + 7, 4, 1, '#493c38');
      c.rect(lx, y + 8, 1, 2, '#493c38');
      c.rect(lx + 3, y + 8, 1, 2, '#493c38');
      c.rect(lx + 1, y + 10, 2, 1, '#493c38');
    }
    if (!side) c.rect(center - 1, y + 8, 2, 1, '#493c38');
  }
  if (id === 2) {
    const lx = side ? (direction === 1 ? x - 1 : x + w - 3) : center - 3;
    if (back || side) {
      c.rect(lx, y + 10, side ? 4 : 7, 5, '#422c22');
      c.rect(lx + 1, y + 10, side ? 2 : 5, 3, '#a37148');
    } else for (const lx of [x + 2, x + w - 3]) c.rect(lx, y + 11, 1, 3, '#75523b');
  }
  if (id === 3) {
    c.rect(x + 1, y - 2, w - 2, 4, '#b98b4c');
    c.rect(x + 2, y - 2, w - 4, 1, '#e1bc74');
    c.rect(x, y + 1, w, 1, '#914031');
    c.rect(x - 2, y + 2, w + 4, 2, '#ddb471');
  }
  if (id === 4) {
    c.rect(x + 1, y - 1, w - 2, 1, '#67889e');
    for (const lx of [x - 1, x + w - 2]) {
      c.rect(lx, y + 1, 2, 5, '#343744');
      c.rect(lx, y + 5, 3, 3, '#557587');
    }
  }
  if (id === 5) {
    c.rect(center - 4, y + 11, 8, 2, '#ad513c');
    c.rect(center - 3, y + 11, 6, 1, '#efaa73');
    c.rect(direction === 3 ? center + 2 : center - 3, y + 12, 2, 3, '#a84b37');
  }
}

export function paintLayer(layer, value, pose, palettes) {
  const { pixels, head, direction } = pose;
  const c = canvas(48, 48);
  const skin = palettes.SKIN_PALETTES[value % 9];
  const garment = palettes.OUTFIT_SPECS[value % 12];
  const dye = hairColors[value % 6];
  const skinRamp = [skin.base, skin.shadow, skin.deepShadow];
  const clothes = [
    garment.jacket,
    garment.shadow,
    garment.shirt,
    shade(garment.shirt, -35),
    garment.pants,
    garment.shoes,
  ];
  if (layer === 'accessory') {
    accessory(c, value, head, direction);
    return c.data;
  }
  for (const p of pixels) {
    if (layer === 'body' && ['hair', 'eyes', 'outfit'].includes(p.layer))
      c.pixel(p.x, p.y, skin.base);
    if (p.layer !== layer) continue;
    let col = '#' + p.color;
    if (layer === 'body' && value % 9 !== 2 && skinColors.includes(p.color))
      col = skinRamp[skinColors.indexOf(p.color)];
    if (layer === 'eyes' && value % 5) col = palettes.EYE_COLORS[value % 5];
    if (layer === 'outfit' && value % 12 !== 0) col = clothes[fabric.indexOf(p.color)];
    if (layer === 'hair' && value % 6) col = p.color === browns[0] ? dye : shade(dye, -26);
    c.pixel(p.x, p.y, col);
  }
  if (layer === 'outfit' && value >= 12) {
    // Follow the existing red jacket's hem in this pose, including crouched strikes.
    const hem = pixels.filter((p) => p.color === '921038' || p.color === 'ce0c39');
    if (hem.length) {
      const bottom = Math.max(...hem.map((p) => p.y));
      const middle = Math.round(head.x + (head.w - 1) / 2);
      const rim = value % 12 ? garment.shadow : '#921038';
      c.rect(middle - 3, bottom, 7, 1, rim);
      c.rect(middle - 4, bottom + 1, 9, 1, rim);
      c.rect(middle - 3, bottom + 1, 3, 1, value % 12 ? garment.jacket : '#ce0c39');
    }
  }
  if (layer === 'body' && value >= 9) {
    // A small pin at the temple and soft cheek follow the head through every pose.
    const right = direction !== 3;
    const sx = right ? head.x + head.w : head.x - 1;
    c.rect(sx - 1, head.y + 4, 3, 2, '#672844');
    c.pixel(sx, head.y + 4, '#ffc6a1');
    if (direction !== 2)
      for (const p of pixels)
        if (skinColors.includes(p.color) && p.y === head.y + 9 && Math.abs(p.x - sx) <= 3)
          c.pixel(p.x, p.y, skin.blush);
    // A short side lock frames the cheek below the common hairstyle.
    c.rect(sx, head.y + 6, 1, 4, '#302025');
  }
  if (layer === 'hair')
    return styleTutorialHair({
      data: c.data,
      style: Math.floor(value / 6),
      direction,
      head,
      shade,
    });
  return c.data;
}
