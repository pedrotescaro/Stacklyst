import { useId, type CSSProperties } from 'react';
import { adventureAsset } from './assets';
import { brandGeometry } from '../../lib/brand-geometry';
import { DEFAULT_AVATAR, type Avatar } from '../../lib/mundinho/types';
import { EYE_COLORS, OUTFIT_SPECS, SKIN_PALETTES } from '../../lib/mundinho/avatar-palettes';
import HAIRSTYLES from '../../lib/mundinho/hairstyles.json';
import {
  avatarHairColor,
  hairColorTransfer,
  LEGACY_HAIR_COLORS,
} from '../../lib/mundinho/hair-colors';
import { useLocalizedText } from '../../i18n/useLocalizedText';
import { useAttackSprites, useWalkingSprites } from './useAttackSprites';

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
  walking,
  className = '',
  style,
  effect = false,
  motion = 'idle',
  bow = false,
}: {
  avatar?: Avatar;
  direction?: string;
  walking?: boolean;
  className?: string;
  style?: CSSProperties;
  effect?: boolean;
  bow?: boolean;
  motion?: 'idle' | 'attack' | 'hurt' | 'victory';
}) {
  const { text } = useLocalizedText();
  const filterId = `hair-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tinted = typeof avatar.hairTint === 'string' && /^#[\da-f]{6}$/i.test(avatar.hairTint);
  const transfer = tinted ? hairColorTransfer(avatarHairColor(avatar)) : null;
  const d = Math.max(0, ['down', 'right', 'up', 'left'].indexOf(direction));
  const female = avatar.gender === 'feminine';
  const attackReady = useAttackSprites(bow);
  const walkingReady = useWalkingSprites();
  const visibleMotion = motion === 'attack' && !attackReady ? 'idle' : motion;
  const isWalking = Boolean(walking) && walkingReady && motion === 'idle';
  const poseSuffix = visibleMotion === 'attack' ? (bow ? '-bow' : '-attack') : '-idle';
  const pose = visibleMotion === 'attack' ? (bow ? 'bow' : 'attack') : 'idle';
  // Characters that can walk keep the idle and walking sheets painted at all
  // times and only swap opacity. Swapping background-image instead lets the
  // browser evict the unused sheet's decoded pixels while the hero stands
  // still, so the first step after a long pause drew one empty frame.
  const standbyWalk = walking !== undefined && visibleMotion === 'idle';
  const layers = [
    ['body', avatar.skin + (female ? SKIN_PALETTES.length : 0), SKIN_PALETTES.length * 2],
    [
      'outfit',
      avatar.outfit < 0 ? -1 : avatar.outfit + (female ? OUTFIT_SPECS.length : 0),
      OUTFIT_SPECS.length * 2,
    ],
    ['eyes', avatar.eyes + (female ? EYE_COLORS.length : 0), EYE_COLORS.length * 2],
    [
      'hair',
      avatar.hair * HAIR.length + (tinted ? 3 : avatar.hairColor),
      HAIRSTYLES.length * HAIR.length,
    ],
    ['accessory', avatar.accessory, 6],
  ] as const;
  const renderLayers = (suffix: string, layerPose: string, standby: boolean) =>
    layers
      .filter(([, value]) => value >= 0)
      .map(([layer, value, count]) => (
        <span
          aria-hidden="true"
          key={`${layerPose}-${layer}`}
          data-layer={layer}
          data-pose={layerPose}
          data-standby={standby || undefined}
          className={`sprite-layer${standbyWalk ? ' sprite-layer-swappable' : ''}`}
          style={{
            backgroundImage: `url(${adventureAsset(`hero-${layer}${suffix}.png`, '/assets/mundinho')})`,
            backgroundSize: `600% ${count * 400}%`,
            backgroundPositionY: `${((Math.min(count - 1, value) * 4 + d) / (count * 4 - 1)) * 100}%`,
            ...(layer === 'hair' && tinted ? { filter: `url(#${filterId})` } : {}),
          }}
        />
      ));
  return (
    <span
      role="img"
      aria-label={text(`Avatar olhando para ${direction}`, `Avatar facing ${direction}`)}
      className={`pixel-avatar sprite-avatar ${isWalking ? 'is-walking' : ''} sprite-${visibleMotion} ${effect ? 'has-fireflies' : ''} ${className}`}
      data-silhouette={female ? 'feminine' : 'masculine'}
      data-attack-ready={attackReady}
      data-walking-ready={walkingReady}
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
      {renderLayers(poseSuffix, pose, isWalking)}
      {standbyWalk && renderLayers('', 'walk', !isWalking)}
      {visibleMotion === 'attack' && (
        <span
          aria-hidden="true"
          data-layer="weapon"
          className="sprite-layer"
          style={{
            backgroundImage: `url(${adventureAsset(`hero-weapon${poseSuffix}.png`, '/assets/mundinho')})`,
            backgroundSize: `600% ${SKIN_PALETTES.length * 400}%`,
            backgroundPositionY: `${((avatar.skin * 4 + d) / (SKIN_PALETTES.length * 4 - 1)) * 100}%`,
          }}
        />
      )}
    </span>
  );
}
/**
 * Ada, the clearing's guide, has her own artwork (dark hair in a bun and a
 * navy Victorian dress, after Ada Lovelace) instead of the player wardrobe.
 * See scripts/build-mundinho-ada.mjs.
 */
export function AdaSprite({ assetBase = '/assets/mundinho' }: { assetBase?: string }) {
  const { text } = useLocalizedText();
  return (
    <span
      role="img"
      aria-label={text('Ada, a guia da clareira', 'Ada, the clearing guide')}
      className="pixel-avatar sprite-avatar sprite-idle"
      data-silhouette="feminine"
    >
      <span
        aria-hidden="true"
        data-layer="ada"
        className="sprite-layer"
        style={{
          backgroundImage: `url(${adventureAsset('ada-world.png', assetBase)})`,
          backgroundSize: '600% 100%',
        }}
      />
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
  const variant = { 'iron-beetle': 'byte-bug', 'wild-ember': 'ember', 'null-titan': 'null-ghost' }[
    kind
  ];
  const row = Math.max(
    0,
    ['syntax-slime', 'blue-slime', 'ember', 'byte-bug', 'forest', 'null-ghost'].indexOf(
      variant ?? kind
    )
  );
  return (
    <span
      aria-hidden="true"
      className={`pixel-creature sprite-creature ${className}`}
      data-creature={kind}
      style={{
        backgroundImage: `url(${adventureAsset('blue-creatures.png', '/assets/mundinho')})`,
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
