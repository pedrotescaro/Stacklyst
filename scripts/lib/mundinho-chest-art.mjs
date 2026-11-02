import { canvas } from './mundinho-pixel-art.mjs';

// Eight hand-placed 48px frames. The lid rotates behind the fixed front wall;
// the final frame is empty, so the collected state never implies another reward.
export function chestArtwork() {
  const ink = '#30241f',
    dark = '#593323',
    wood = '#99502c',
    warm = '#bf7139';
  const gold = '#d9a443',
    shade = '#92602e',
    light = '#ffe09a';
  const frames = Array.from({ length: 8 }, (_, frame) => {
    const ground = canvas(48, 48),
      body = canvas(48, 48),
      lid = canvas(48, 48);
    const metal = canvas(48, 48),
      reward = canvas(48, 48);
    ground.ellipse(24, 42, 19, 3, '#182b2538');
    ground.ellipse(24, 42, 14, 2, '#182b2542');
    // Back rim and a deep, empty interior visible as the lid rises.
    body.polygon(
      [
        [7, 26],
        [13, 21],
        [36, 21],
        [42, 25],
        [42, 39],
        [35, 43],
        [9, 41],
        [7, 38],
      ],
      ink
    );
    body.polygon(
      [
        [9, 26],
        [14, 23],
        [35, 23],
        [39, 26],
        [34, 30],
        [10, 29],
      ],
      shade
    );
    body.polygon(
      [
        [12, 26],
        [16, 24],
        [34, 24],
        [37, 26],
        [33, 29],
        [12, 28],
      ],
      '#211d20'
    );
    body.line(16, 25, 32, 25, '#45302b');
    // Front planks, end grain, and the right side in shade.
    body.polygon(
      [
        [9, 29],
        [34, 30],
        [34, 41],
        [10, 39],
      ],
      wood
    );
    body.polygon(
      [
        [35, 30],
        [40, 27],
        [40, 38],
        [35, 41],
      ],
      dark
    );
    body.line(10, 33, 33, 34, dark);
    body.line(10, 34, 33, 35, warm);
    body.line(10, 38, 33, 39, '#d18a49');
    body.line(17, 31, 20, 31, '#bd6c37');
    body.line(27, 36, 31, 36, '#713b27');
    body.line(36, 34, 39, 32, '#80502f');
    for (const x of [11, 29]) {
      metal.polygon(
        [
          [x, 29],
          [x + 3, 29],
          [x + 3, 40],
          [x, 40],
        ],
        shade
      );
      metal.rect(x, 29, 2, 10, gold);
      metal.line(x, 30, x, 38, light);
      metal.pixel(x + 1, 32, '#76502c');
      metal.pixel(x + 1, 38, '#76502c');
    }
    metal.line(9, 39, 34, 41, shade);
    metal.line(10, 39, 33, 40, gold);
    metal.line(35, 40, 40, 37, gold);
    metal.rect(20, 29, 6, 7, ink);
    metal.rect(21, 29, 4, 6, gold);
    metal.line(21, 29, 24, 29, light);
    metal.rect(22, 31, 2, 2, '#513728');
    metal.pixel(23, 33, '#513728');

    const rise = [0, 1, 3, 7, 11, 14, 14, 14][frame];
    const top = 16 - rise;
    const edge = 28 - Math.round(rise * 0.55);
    // A stepped barrel lid with a beveled brass outline.
    lid.polygon(
      [
        [7, edge - 3],
        [8, top + 4],
        [12, top],
        [33, top],
        [39, top + 3],
        [42, edge - 4],
        [41, edge],
        [34, edge + 3],
        [8, edge + 1],
      ],
      ink
    );
    lid.polygon(
      [
        [9, edge - 3],
        [10, top + 4],
        [13, top + 2],
        [32, top + 2],
        [37, top + 4],
        [39, edge - 3],
        [34, edge + 1],
        [10, edge - 1],
      ],
      frame > 2 ? dark : warm
    );
    lid.polygon(
      [
        [34, top + 2],
        [39, top + 5],
        [40, edge - 1],
        [35, edge + 1],
      ],
      '#683b27'
    );
    lid.line(14, top + 3, 31, top + 3, '#db934b');
    lid.line(13, top + 6, 32, top + 6, '#854626');
    lid.line(14, top + 7, 31, top + 7, '#bd7037');
    for (const x of [11, 29]) {
      lid.polygon(
        [
          [x, top + 2],
          [x + 3, top + 1],
          [x + 4, edge],
          [x + 1, edge + 1],
        ],
        shade
      );
      lid.line(x + 1, top + 2, x + 2, edge, gold);
      lid.line(x + 1, top + 2, x + 2, top + 5, light);
      lid.pixel(x + 2, edge - 1, light);
    }
    lid.line(9, edge, 34, edge + 2, gold);
    lid.line(35, edge + 1, 40, edge - 2, shade);
    if (frame < 3) {
      lid.rect(21, edge, 4, 4, ink);
      lid.rect(22, edge, 2, 3, light);
    } else {
      lid.line(13, edge - 2, 31, edge - 2, '#e3ab51');
      lid.pixel(22, edge, light);
    }
    if (frame >= 3 && frame <= 6) {
      const y = 25 - (frame - 3) * 5;
      reward.ellipse(23, y, frame === 5 ? 1 : 3, 4, '#8a5527');
      reward.ellipse(23, y - 1, frame === 5 ? 1 : 2, 3, '#f5c956');
      reward.line(23, y - 3, 23, y, '#fff0b1');
      for (const [x, yy] of [
        [12, y - 4],
        [35, y + 1],
      ]) {
        reward.line(x - 1, yy, x + 1, yy, light);
        reward.line(x, yy - 1, x, yy + 1, light);
      }
    }
    // Raised lid belongs behind the front edge of the chest.
    return [ground, lid, body, metal, reward];
  });
  // With the lid closed it covers the cavity/front seam.
  for (const frame of [0, 1]) {
    const [ground, lid, body, metal, reward] = frames[frame];
    frames[frame] = [ground, body, metal, lid, reward];
  }
  // Flatten layer order consistently while retaining editable material layers.
  return {
    names: ['Sombra', 'Baú de madeira e latão', 'Moeda e brilho'],
    frames: frames.map(([ground, ...layers]) => {
      const combined = canvas(48, 48);
      const reward = layers.pop();
      for (const layer of layers) {
        for (let i = 0; i < layer.data.length; i += 4)
          if (layer.data[i + 3]) layer.data.copy(combined.data, i, i, i + 4);
      }
      // Material artwork is kept together so front/back occlusion stays exact.
      return [ground, combined, reward];
    }),
  };
}
