import { useId, type CSSProperties } from 'react';
import { adventureAsset } from './assets';
import { brandGeometry } from '../../lib/brand-geometry';
import { DEFAULT_AVATAR, type Avatar } from '../../lib/mundinho/types';
import { EYE_COLORS, OUTFIT_SPECS, SKIN_PALETTES } from '../../lib/mundinho/avatar-palettes';
import {
  avatarHairColor,
  hairColorTransfer,
  LEGACY_HAIR_COLORS,
} from '../../lib/mundinho/hair-colors';

export {
  SKIN_PALETTES,
  SKIN,
  HAIR_SHADES,
  EYE_COLORS,
  OUTFIT_SPECS,
  OUTFIT,
} from '../../lib/mundinho/avatar-palettes';
export const HAIR = LEGACY_HAIR_COLORS;

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
  const filterId = `hair-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tinted = typeof avatar.hairTint === 'string' && /^#[\da-f]{6}$/i.test(avatar.hairTint);
  const transfer = tinted ? hairColorTransfer(avatarHairColor(avatar)) : null;
  const d = Math.max(0, ['down', 'right', 'up', 'left'].indexOf(direction));
  const female = avatar.gender === 'feminine';
  const layers = [
    ['body', avatar.skin + (female ? SKIN_PALETTES.length : 0), SKIN_PALETTES.length * 2],
    ['outfit', avatar.outfit, OUTFIT_SPECS.length],
    ['eyes', avatar.eyes + (female ? EYE_COLORS.length : 0), EYE_COLORS.length * 2],
    ['hair', avatar.hair * 6 + (tinted ? 3 : avatar.hairColor), 36],
    ['accessory', avatar.accessory, 6],
  ] as const;
  return (
    <span
      role="img"
      aria-label={`Avatar olhando para ${direction}`}
      className={`pixel-avatar sprite-avatar ${walking ? 'is-walking' : ''} sprite-${motion} ${effect ? 'has-fireflies' : ''} ${className}`}
      data-silhouette={female ? 'feminine' : 'masculine'}
      style={style}
    >
      {transfer && (
        <svg aria-hidden="true" width="0" height="0" className="sprite-color-defs">
          <defs>
            <filter
              id={filterId}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feComponentTransfer>
                <feFuncR type="table" tableValues={transfer[0]} />
                <feFuncG type="table" tableValues={transfer[1]} />
                <feFuncB type="table" tableValues={transfer[2]} />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>
      )}
      {layers
        .filter(([, value]) => value >= 0)
        .map(([layer, value, count]) => (
          <span
            aria-hidden="true"
            key={layer}
            data-layer={layer}
            className="sprite-layer"
            style={{
              backgroundImage: `url(${adventureAsset(`hero-${layer}${motion === 'attack' && ['body', 'outfit'].includes(layer) ? '-attack' : ''}.png`, '/assets/mundinho')})`,
              backgroundSize: `800% ${count * 400}%`,
              backgroundPositionY: `${((Math.min(count - 1, value) * 4 + d) / (count * 4 - 1)) * 100}%`,
              ...(layer === 'hair' && tinted ? { filter: `url(#${filterId})` } : {}),
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
