import type { CSSProperties } from 'react';
import { adventureAsset } from './assets';
import { brandGeometry } from '../../lib/brand-geometry';
import { DEFAULT_AVATAR, type Avatar } from '../../lib/mundinho/types';

export interface SkinPalette {
  id: string;
  name: string;
  highlight: string;
  base: string;
  shadow: string;
  deepShadow: string;
  blush: string;
}

/**
 * 9 Shaded Skin Palettes with 4-level shading ramps + blush,
 * matching the user reference grid and original 32x32 spr_stacklyst001 chibi.
 */
export const SKIN_PALETTES: SkinPalette[] = [
  // 0: Pêssego Claro / Porcelana (Ref row 1 col 1)
  {
    id: 'peach_fair',
    name: 'Pêssego Claro',
    highlight: '#fff3ea',
    base: '#fcd4b8',
    shadow: '#eab090',
    deepShadow: '#ca8968',
    blush: '#fcaaa0',
  },
  // 1: Lilás Fantasia (Ref row 1 col 2)
  {
    id: 'lilac_fantasy',
    name: 'Lilás Fantasia',
    highlight: '#f8ecfa',
    base: '#e8d3e8',
    shadow: '#c5a5c5',
    deepShadow: '#9b769b',
    blush: '#e2b3e8',
  },
  // 2: Morena Âmbar (Ref row 1 col 3)
  {
    id: 'warm_tan',
    name: 'Morena Âmbar',
    highlight: '#e2ba93',
    base: '#c89b70',
    shadow: '#a8784d',
    deepShadow: '#81542e',
    blush: '#b86d48',
  },
  // 3: Bege Rosado (Ref row 2 col 1)
  {
    id: 'rosy_peach',
    name: 'Bege Rosado',
    highlight: '#fde3d2',
    base: '#f6be9d',
    shadow: '#db9874',
    deepShadow: '#b4714f',
    blush: '#f0907d',
  },
  // 4: Azul Névoa / Fantasia (Ref row 2 col 2)
  {
    id: 'slate_fantasy',
    name: 'Azul Névoa',
    highlight: '#e4e8f7',
    base: '#c7cbe3',
    shadow: '#9fa5c7',
    deepShadow: '#737ba0',
    blush: '#a2aae0',
  },
  // 5: Marfim Pálido (Ref row 2 col 3 - selected checkmark in Image 4)
  {
    id: 'pale_ivory',
    name: 'Marfim Pálido',
    highlight: '#fff8f0',
    base: '#fde5d0',
    shadow: '#e8c4a9',
    deepShadow: '#c49c7f',
    blush: '#f9bfa8',
  },
  // 6: Dourado Trigo (Ref row 3 col 1)
  {
    id: 'warm_wheat',
    name: 'Dourado Trigo',
    highlight: '#f5e7b8',
    base: '#e2cb8b',
    shadow: '#bea462',
    deepShadow: '#927a3c',
    blush: '#d8ab5b',
  },
  // 7: Areia Suave (Ref row 3 col 2)
  {
    id: 'almond_sand',
    name: 'Areia Suave',
    highlight: '#fbf6ee',
    base: '#e7ded0',
    shadow: '#c4b7a4',
    deepShadow: '#998b76',
    blush: '#d2af9c',
  },
  // 8: Cacau Profundo (Ref row 3 col 3)
  {
    id: 'deep_cocoa',
    name: 'Cacau Profundo',
    highlight: '#d8a998',
    base: '#ba8b7a',
    shadow: '#926352',
    deepShadow: '#6a3f30',
    blush: '#844238',
  },
];

export const SKIN = SKIN_PALETTES.map((p) => p.base);

export const HAIR = [
  '#273047', // Preto Ônix
  '#684331', // Castanho Chocolate
  '#bd8240', // Loiro Âmbar
  '#dcd8d4', // Prata Platina
  '#805d9e', // Roxo Místico
  '#c15e54', // Ruivo Carmim
];

export const HAIR_SHADES = [
  { base: '#273047', highlight: '#425175', shadow: '#151c2e' },
  { base: '#684331', highlight: '#8a5c45', shadow: '#452b1e' },
  { base: '#bd8240', highlight: '#deb06a', shadow: '#8c5d28' },
  { base: '#dcd8d4', highlight: '#ffffff', shadow: '#a8a4a0' },
  { base: '#805d9e', highlight: '#a782c7', shadow: '#593e70' },
  { base: '#c15e54', highlight: '#e2837a', shadow: '#8a3c34' },
];

export const EYE_COLORS = [
  '#1a1a1a', // Ônix Escuro
  '#2f855a', // Verde Esmeralda
  '#2b6cb0', // Azul Safira
  '#b7791f', // Âmbar Dourado
  '#805ad5', // Roxo Cibernético
];

export const OUTFIT_SPECS = [
  // 0: Jaqueta Vermelha de Aventura (matching Image 3 & 4)
  { jacket: '#c04f57', shadow: '#8e2d34', shirt: '#dae4ec', pants: '#293346', shoes: '#171e2d' },
  // 1: Moletom Azul
  { jacket: '#42a0d3', shadow: '#2c78a0', shirt: '#f0f6ff', pants: '#222f3e', shoes: '#ffffff' },
  // 2: Jaqueta Tech / Dev
  { jacket: '#273447', shadow: '#1a2432', shirt: '#38bdf8', pants: '#151c24', shoes: '#0d131a' },
  // 3: Casaco Verde Florestal
  { jacket: '#4d855e', shadow: '#315d3e', shirt: '#e2f0d9', pants: '#3e3223', shoes: '#271f16' },
  // 4: Suéter Carmim
  { jacket: '#9b2c3a', shadow: '#6e1e28', shirt: '#f8e9eb', pants: '#a69575', shoes: '#544933' },
  // 5: Traje Dourado
  { jacket: '#eab308', shadow: '#b48404', shirt: '#ffffff', pants: '#1e1b4b', shoes: '#0f0e26' },
];

export const OUTFIT = OUTFIT_SPECS.map((s) => s.jacket);

export function PixelAvatar({
  avatar = DEFAULT_AVATAR,
  direction = 'down',
  walking = false,
  className = '',
  style,
  effect = false,
  motion = 'idle',
}: {
  avatar?: Avatar;
  direction?: string;
  walking?: boolean;
  className?: string;
  style?: CSSProperties;
  effect?: boolean;
  motion?: 'idle' | 'attack' | 'hurt' | 'victory';
}) {
  const d = Math.max(0, ['down', 'right', 'up', 'left'].indexOf(direction));
  const layers = [
    ['body', avatar.skin, 9],
    ['outfit', avatar.outfit, 6],
    ['eyes', avatar.eyes, 5],
    ['hair', avatar.hair * 6 + avatar.hairColor, 36],
    ['accessory', avatar.accessory, 6],
  ] as const;
  return (
    <span
      role="img"
      aria-label={`Avatar olhando para ${direction}`}
      className={`pixel-avatar sprite-avatar ${walking ? 'is-walking' : ''} sprite-${motion} ${effect ? 'has-fireflies' : ''} ${className}`}
      style={style}
    >
      {layers
        .filter(([, value]) => value >= 0)
        .map(([layer, value, count]) => (
          <span
            aria-hidden="true"
            key={layer}
            className="sprite-layer"
            style={{
              backgroundImage: `url(${adventureAsset(`hero-${layer}${motion === 'attack' && ['body', 'outfit'].includes(layer) ? '-attack' : ''}.png`, '/assets/mundinho')})`,
              backgroundSize: `800% ${count * 400}%`,
              backgroundPositionY: `${((Math.min(count - 1, value) * 4 + d) / (count * 4 - 1)) * 100}%`,
            }}
          />
        ))}
    </span>
  );
}
export function PixelCreature({
  kind = 'syntax-slime',
  className = '',
}: {
  color?: string;
  kind?: string;
  className?: string;
}) {
  const row = Math.max(
    0,
    ['syntax-slime', 'blue-slime', 'ember', 'byte-bug', 'forest', 'null-ghost'].indexOf(kind)
  );
  return (
    <span
      aria-hidden="true"
      className={`pixel-creature sprite-creature ${className}`}
      style={{
        backgroundImage: `url(${adventureAsset('creatures-animated.png', '/assets/mundinho')})`,
        backgroundSize: '800% 600%',
        backgroundPositionY: `${row * 20}%`,
      }}
    />
  );
}

export function Coin({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`gold-coin ${className}`}>
      <circle cx="20" cy="21" r="17" fill="#8e5917" />
      <circle cx="20" cy="19" r="17" fill="#edaf25" />
      <circle cx="20" cy="19" r="13" fill="#ffda58" stroke="#ffe895" strokeWidth="2" />
      <g transform="translate(12.2 11.8) scale(0.018)">
        <path d={brandGeometry.path} fill="#b77b1b" />
      </g>
    </svg>
  );
}

const r = (x: number, y: number, w: number, h: number, fill: string) => (
  <rect key={`${x}:${y}:${w}:${h}:${fill}`} x={x} y={y} width={w} height={h} fill={fill} />
);
export function TreasureChest({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`pixel-chest ${className}`}>
      {r(4, 26, 24, 3, '#10271e80')}
      {r(5, 14, 22, 12, '#9b5e2b')}
      {r(4, 14, 24, 1, '#44250e')}
      {r(4, 25, 24, 1, '#44250e')}
      {r(4, 14, 1, 12, '#44250e')}
      {r(27, 14, 1, 12, '#44250e')}
      {r(6, 8, 20, 6, '#b7763c')}
      {r(5, 8, 22, 1, '#44250e')}
      {r(8, 14, 3, 11, '#f3cb48')}
      {r(21, 14, 3, 11, '#f3cb48')}
      {r(8, 8, 3, 6, '#f3cb48')}
      {r(21, 8, 3, 6, '#f3cb48')}
      {r(14, 16, 4, 5, '#f3cb48')}
      {r(15, 18, 2, 2, '#2a1708')}
    </svg>
  );
}
