import { adventureAsset } from './assets';
import { PROP_GEOMETRY, worldDepth } from '../../lib/mundinho/world';

export function WorldPropSprite({
  kind,
  assetBase,
  chestState = 'closed',
}: {
  kind: 'chest' | 'signpost' | 'portal-hole';
  assetBase: string;
  chestState?: 'closed' | 'opening' | 'open';
}) {
  const anchorY = kind === 'portal-hole' ? 48 : PROP_GEOMETRY[kind].anchor.y;
  return (
    <span
      className="world-prop-sprite"
      data-prop={kind}
      data-chest-state={kind === 'chest' ? chestState : undefined}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${adventureAsset(`${kind}.png`, assetBase)})`,
        transform: `translateY(${48 - anchorY}px)`,
      }}
    />
  );
}

export function HabitatSprite({
  x,
  y,
  variant,
  assetBase,
}: {
  x: number;
  y: number;
  variant: number;
  assetBase: string;
}) {
  return (['back', 'front'] as const).map((layer) => (
    <span
      key={layer}
      className="world-foliage-sprite"
      data-foliage={layer}
      aria-hidden="true"
      style={{
        left: x,
        top: y + 10,
        zIndex: worldDepth(y) + (layer === 'front' ? 1 : -1),
        backgroundImage: `url(${adventureAsset(`habitats-${layer}.png`, assetBase)})`,
        backgroundPositionX: `${(variant % 3) * 50}%`,
      }}
    />
  ));
}
