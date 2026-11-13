// Quantizes the avatar editor's colors (skins, outfits, eyes, hair) to AAP-64 so
// the character sprites share the single palette, and writes data/avatar.json.
// Indices and order are preserved: saved avatars keep pointing at the same rows.

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** sRGB → CIE Lab (D65). */
function toLab([r, g, b]) {
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** Perceptual distance (CIE76 ΔE in Lab). */
function distance(a, b) {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function nearest(palette, hex, avoid = new Set()) {
  const rgb = hexToRgb(hex);
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of palette) {
    if (avoid.has(candidate)) continue;
    const d = distance(rgb, hexToRgb(candidate));
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  return best;
}

const lightness = (hex) => toLab(hexToRgb(hex))[0];

/**
 * Maps a dark→light ramp to the palette. `baseIndex` is matched first; every other
 * level is the nearest palette color that is really darker (or lighter) than its
 * neighbour, so shading always reads in the right direction.
 */
function ramp(palette, hexes, baseIndex = hexes.length - 2) {
  const out = new Array(hexes.length);
  out[baseIndex] = nearest(palette, hexes[baseIndex]);
  for (let i = baseIndex - 1; i >= 0; i--) {
    const limit = lightness(out[i + 1]) - 4;
    const darker = palette.filter((p) => lightness(p) < limit);
    out[i] = nearest(darker.length ? darker : palette, hexes[i]);
  }
  for (let i = baseIndex + 1; i < hexes.length; i++) {
    const limit = lightness(out[i - 1]) + 4;
    const lighter = palette.filter((p) => lightness(p) > limit);
    out[i] = nearest(lighter.length ? lighter : palette, hexes[i]);
  }
  return out;
}

function lighten(hex, amount) {
  return '#' + hexToRgb(hex).map((v) => Math.round(v + (255 - v) * amount).toString(16).padStart(2, '0')).join('');
}

export async function prepareAvatar(root, palette) {
  const source = fs.readFileSync(path.join(root, 'src/lib/mundinho/avatar-palettes.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  const { SKIN_PALETTES, OUTFIT_SPECS, EYE_COLORS, HAIR_SHADES } = mod;

  const avatar = {
    skins: SKIN_PALETTES.map((p) => ({
      id: p.id,
      ramp: ramp(palette, [p.deepShadow, p.shadow, p.base, p.highlight], 2),
      blush: nearest(palette, p.blush),
    })),
    eyes: EYE_COLORS.map((hex) => nearest(palette, hex)),
    hairs: HAIR_SHADES.map((h) => ramp(palette, [h.shadow, h.base, h.highlight], 1)),
    outfits: OUTFIT_SPECS.map((o) => ({
      kind: o.kind,
      jacket: ramp(palette, [o.shadow, o.jacket, lighten(o.jacket, 0.28)], 1),
      shirt: nearest(palette, o.shirt),
      pants: ramp(palette, [o.pants, lighten(o.pants, 0.22)], 0),
      shoes: nearest(palette, o.shoes),
    })),
  };
  const out = path.join(root, 'scripts/mundinho-sprites/data/avatar.json');
  fs.writeFileSync(out, JSON.stringify(avatar, null, 1));
  return avatar;
}
