import { POTIONS, potionCounts, type PotionId } from '../../lib/mundinho/potions';
import { useLocalizedText } from '../../i18n/useLocalizedText';

const LIQUID: Record<PotionId, [string, string]> = {
  'potion-heal': ['#ef4b5f', '#a52637'],
  'potion-regen': ['#4cd37a', '#24894a'],
  'potion-strength': ['#f5a524', '#b06b0c'],
};

/** A small pixel flask, filled with the potion's colour. */
export function PotionIcon({ id }: { id: PotionId }) {
  const [liquid, shade] = LIQUID[id];
  return (
    <svg
      viewBox="0 0 12 14"
      aria-hidden="true"
      className="ad-potion-icon"
      shapeRendering="crispEdges"
    >
      <rect x="4" y="0" width="4" height="2" fill="#8b5a2b" />
      <rect x="3" y="2" width="6" height="1" fill="#1a1a24" />
      <rect x="4" y="3" width="4" height="2" fill="#d6ecf5" />
      <rect x="3" y="3" width="1" height="2" fill="#1a1a24" />
      <rect x="8" y="3" width="1" height="2" fill="#1a1a24" />
      <rect x="1" y="5" width="10" height="8" fill="#1a1a24" />
      <rect x="2" y="6" width="8" height="6" fill={liquid} />
      <rect x="2" y="10" width="8" height="2" fill={shade} />
      <rect x="2" y="6" width="8" height="1" fill="#d6ecf5" />
      <rect x="3" y="7" width="1" height="2" fill="#ffffffb3" />
      <rect x="2" y="13" width="8" height="1" fill="#1a1a24" />
    </svg>
  );
}

/**
 * The potions carried into a creature battle. One may be drunk per turn and
 * drinking does not spend the turn.
 */
export function PotionBag({
  inventory,
  usedThisTurn,
  healthFull,
  effects,
  busy,
  onUse,
}: {
  inventory: string[];
  usedThisTurn: boolean;
  healthFull: boolean;
  effects: { strength: boolean; regen: number };
  busy: boolean;
  onUse: (id: PotionId) => void;
}) {
  const { text } = useLocalizedText();
  const counts = potionCounts(inventory);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return (
    <section className="ad-potion-bag" aria-label={text('Poções', 'Potions')}>
      <header>
        <strong>{text('Poções', 'Potions')}</strong>
        <span>
          {usedThisTurn
            ? text('Você já bebeu uma poção neste turno.', 'You already drank a potion this turn.')
            : total
              ? text('Uma por turno, sem gastar o turno.', 'One per turn, without spending it.')
              : text(
                  'Derrote criaturas para encontrar poções.',
                  'Defeat creatures to find potions.'
                )}
        </span>
      </header>
      <div className="ad-potion-list">
        {POTIONS.map((potion) => {
          const blocked =
            (potion.id === 'potion-heal' && healthFull) ||
            (potion.id === 'potion-regen' && effects.regen > 0) ||
            (potion.id === 'potion-strength' && effects.strength);
          return (
            <button
              key={potion.id}
              type="button"
              className="ad-potion-btn"
              disabled={busy || usedThisTurn || !counts[potion.id] || blocked}
              onClick={() => onUse(potion.id)}
              title={text(potion.description, potion.descriptionEn)}
            >
              <PotionIcon id={potion.id} />
              <span className="ad-potion-text">
                <strong>{text(potion.name, potion.nameEn)}</strong>
                <small>{text(potion.description, potion.descriptionEn)}</small>
              </span>
              <span className="ad-potion-count" aria-label={text('Quantidade', 'Amount')}>
                ×{counts[potion.id]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
