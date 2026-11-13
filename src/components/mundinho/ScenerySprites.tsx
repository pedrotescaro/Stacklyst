import { adventureAsset } from './assets';
import { PROP_GEOMETRY, worldDepth } from '../../lib/mundinho/world';

export function WorldPropSprite({
  kind,
  assetBase,
  chestState = 'closed',
}: {
  kind: 'chest' | 'signpost' | 'portal-hole' | 'boss-rift';
  assetBase: string;
  chestState?: 'closed' | 'opening' | 'open';
}) {
  const anchorY =
    kind === 'portal-hole' || kind === 'boss-rift' ? 48 : PROP_GEOMETRY[kind].anchor.y;
  return (
    <span
      className="world-prop-sprite"
      data-prop={kind}
      data-chest-state={kind === 'chest' ? chestState : undefined}
      aria-hidden="true"
      style={{
        backgroundImage: `url(${adventureAsset({ 'boss-rift': 'blue-rift.png', 'portal-hole': 'blue-stairs.png', signpost: 'blue-sign.png', chest: 'chest.png' }[kind], assetBase)})`,
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
