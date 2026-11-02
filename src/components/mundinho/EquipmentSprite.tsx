import { EQUIPMENT } from '../../lib/mundinho/equipment';
import SPRITES from '../../lib/mundinho/equipment-sprites.json';
import { adventureAsset } from './assets';

export function EquipmentSprite({ itemId }: { itemId: string }) {
  const index = SPRITES.indexOf(itemId);
  const item = EQUIPMENT.find((entry) => entry.id === itemId);
  if (index < 0 || !item) return null;
  return (
    <span
      role="img"
      aria-label={item.name}
      className="ad-equipment-sprite"
      style={{
        backgroundImage: `url(${adventureAsset('equipment.png', '/assets/mundinho')})`,
        backgroundPositionX: `${(index / (SPRITES.length - 1)) * 100}%`,
        backgroundSize: `${SPRITES.length * 100}% 100%`,
      }}
    />
  );
}
