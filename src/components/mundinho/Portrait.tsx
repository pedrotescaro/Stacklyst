import { useId } from 'react';
import type { Avatar } from '../../lib/mundinho/types';
import { avatarHairColor, hairColorTransfer } from '../../lib/mundinho/hair-colors';
import { adventureAsset } from './assets';
import { EYE_COLORS, OUTFIT_SPECS, SKIN_PALETTES } from '../../lib/mundinho/avatar-palettes';

/** Independently drawn portrait layers; all indices share the avatar's saved wardrobe. */
export function Portrait({
  avatar,
  name,
  assetBase = '/assets/mundinho',
}: {
  avatar: Avatar;
  name: string;
  assetBase?: string;
}) {
  const id = `portrait-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const female = avatar.gender === 'feminine';
  const transfer = hairColorTransfer(avatarHairColor(avatar));
  const layers = [
    ['hair-back', avatar.hair, 6],
    ['body', avatar.skin + (female ? SKIN_PALETTES.length : 0), SKIN_PALETTES.length * 2],
    ['outfit', avatar.outfit + (female ? OUTFIT_SPECS.length : 0), OUTFIT_SPECS.length * 2],
    ['eyes', avatar.eyes + (female ? EYE_COLORS.length : 0), EYE_COLORS.length * 2],
    ['hair', avatar.hair, 6],
    ['accessory', avatar.accessory, 6],
  ] as const;
  return (
    <span
      className="rpg-portrait"
      role="img"
      aria-label={`Retrato de ${name}`}
      data-silhouette={female ? 'feminine' : 'masculine'}
    >
      <svg width="0" height="0" aria-hidden="true" className="sprite-color-defs">
        <defs>
          <filter id={id} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="table" tableValues={transfer[0]} />
              <feFuncG type="table" tableValues={transfer[1]} />
              <feFuncB type="table" tableValues={transfer[2]} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      {layers.map(([layer, value, count]) => (
        <span
          key={layer}
          aria-hidden="true"
          data-portrait-layer={layer}
          style={{
            backgroundImage: `url(${adventureAsset(`portrait-${layer}.png`, assetBase)})`,
            backgroundSize: `${count * 100}% 100%`,
            backgroundPosition: `${(Math.max(0, Math.min(count - 1, value)) / (count - 1)) * 100}% 0`,
            ...(layer.startsWith('hair') ? { filter: `url(#${id})` } : {}),
          }}
        />
      ))}
    </span>
  );
}
