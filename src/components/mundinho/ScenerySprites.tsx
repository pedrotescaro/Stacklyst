import { adventureAsset } from './assets';
import { worldDepth } from '../../lib/mundinho/world';

export function WorldPropSprite({
  kind,
  assetBase,
}: {
  kind: 'chest' | 'signpost';
  assetBase: string;
}) {
  return (
    <span
      className="world-prop-sprite"
      data-prop={kind}
      aria-hidden="true"
      style={{ backgroundImage: `url(${adventureAsset(`${kind}.png`, assetBase)})` }}
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
