import { deflateSync } from 'node:zlib';

export function canvas(width, height) {
  const data = Buffer.alloc(width * height * 4);
  const pixel = (x, y, color) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const rgba = color.match(/\w\w/g).map((value) => parseInt(value, 16));
    data.set([...rgba.slice(0, 3), rgba[3] ?? 255], (y * width + x) * 4);
  };
  const line = (x0, y0, x1, y1, color) => {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0),
      dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1,
      sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      pixel(x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      const twice = 2 * error;
      if (twice >= dy) {
        error += dy;
        x0 += sx;
      }
      if (twice <= dx) {
        error += dx;
        y0 += sy;
      }
    }
  };
  return {
    width,
    height,
    data,
    pixel,
    line,
    rect(x, y, w, h, color) {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) pixel(xx, yy, color);
    },
    polygon(points, color) {
      const minY = Math.floor(Math.min(...points.map((p) => p[1])));
      const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
      for (let y = minY; y <= maxY; y++) {
        const crossings = [];
        for (let i = 0; i < points.length; i++) {
          const a = points[i],
            b = points[(i + 1) % points.length];
          if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
            crossings.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
          }
        }
        crossings.sort((a, b) => a - b);
        for (let i = 0; i < crossings.length; i += 2) {
          for (let x = Math.ceil(crossings[i]); x <= Math.floor(crossings[i + 1]); x++)
            pixel(x, y, color);
        }
      }
    },
    ellipse(cx, cy, rx, ry, color) {
      for (let y = -ry; y <= ry; y++)
        for (let x = -rx; x <= rx; x++) {
          if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) pixel(cx + x, cy + y, color);
        }
    },
  };
}

export function aseDocument({ names, frames }) {
  const chunks = frames.map((layers, frameIndex) => {
    const parts = [];
    if (!frameIndex)
      for (const name of names) {
        const label = Buffer.from(name),
          layer = Buffer.alloc(24 + label.length);
        layer.writeUInt32LE(layer.length, 0);
        layer.writeUInt16LE(0x2004, 4);
        layer.writeUInt16LE(3, 6); // Visible and editable.
        layer.writeUInt8(255, 18);
        layer.writeUInt16LE(label.length, 22);
        label.copy(layer, 24);
        parts.push(layer);
      }
    for (let index = 0; index < layers.length; index++) {
      const layer = layers[index],
        compressed = deflateSync(layer.data),
        cel = Buffer.alloc(26);
      cel.writeUInt32LE(26 + compressed.length, 0);
      cel.writeUInt16LE(0x2005, 4);
      cel.writeUInt16LE(index, 6);
      cel.writeUInt8(255, 12);
      cel.writeUInt16LE(2, 13);
      cel.writeUInt16LE(layer.width, 22);
      cel.writeUInt16LE(layer.height, 24);
      parts.push(Buffer.concat([cel, compressed]));
    }
    const header = Buffer.alloc(16);
    header.writeUInt32LE(16 + parts.reduce((total, part) => total + part.length, 0), 0);
    header.writeUInt16LE(0xf1fa, 4);
    header.writeUInt16LE(parts.length, 6);
    header.writeUInt16LE(160, 8);
    return Buffer.concat([header, ...parts]);
  });
  const header = Buffer.alloc(128);
  header.writeUInt32LE(128 + chunks.reduce((total, part) => total + part.length, 0), 0);
  header.writeUInt16LE(0xa5e0, 4);
  header.writeUInt16LE(frames.length, 6);
  header.writeUInt16LE(frames[0][0].width, 8);
  header.writeUInt16LE(frames[0][0].height, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(1, 14);
  header.writeUInt16LE(160, 18);
  header.writeUInt8(1, 34);
  header.writeUInt8(1, 35);
  return Buffer.concat([header, ...chunks]);
}
