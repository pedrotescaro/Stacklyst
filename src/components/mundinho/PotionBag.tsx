import { useEffect, useRef, type KeyboardEvent } from 'react';
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

export function potionTotal(inventory: readonly string[]) {
  return Object.values(potionCounts(inventory)).reduce((sum, n) => sum + n, 0);
}

const PREVIOUS = ['arrowleft', 'arrowup', 'a', 'w'];
const NEXT = ['arrowright', 'arrowdown', 'd', 's'];

/**
 * The potion picker opened by the battle's "Usar poções" action. Drinking one
 * spends the turn; going back does not.
 */
export function PotionMenu({
  inventory,
  healthFull,
  effects,
  busy,
  onUse,
  onClose,
}: {
  inventory: string[];
  healthFull: boolean;
  effects: { strength: boolean; regen: number };
  busy: boolean;
  onUse: (id: PotionId) => void;
  onClose: () => void;
}) {
  const { text } = useLocalizedText();
  const counts = potionCounts(inventory);
  const empty = potionTotal(inventory) === 0;
  const list = useRef<HTMLDivElement>(null);
  const buttons = () =>
    Array.from(list.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
  useEffect(() => {
    // Opening the picker moves the cursor to the first potion that can be drunk.
    buttons()[0]?.focus({ preventScroll: true });
  }, []);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === 'escape' || key === 'backspace') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    const previous = PREVIOUS.includes(key);
    if (!previous && !NEXT.includes(key) && key !== 'home' && key !== 'end') return;
    event.preventDefault();
    event.stopPropagation();
    const enabled = buttons();
    if (!enabled.length) return;
    const current = enabled.indexOf(document.activeElement as HTMLButtonElement);
    const index =
      key === 'home'
        ? 0
        : key === 'end'
          ? enabled.length - 1
          : (current + (previous ? -1 : 1) + enabled.length) % enabled.length;
    enabled[index].focus({ preventScroll: true });
  };
  return (
    <section
      className="ad-potion-menu"
      aria-labelledby="ad-potion-menu-title"
      onKeyDown={onKeyDown}
    >
      <header>
        <strong id="ad-potion-menu-title">{text('Poções', 'Potions')}</strong>
        <span>
          {empty
            ? text(
                'Sua bolsa está vazia. Derrote criaturas para encontrar poções.',
                'Your bag is empty. Defeat creatures to find potions.'
              )
            : text(
                'Beber uma poção gasta o turno: a criatura ataca em seguida.',
                'Drinking a potion spends your turn: the creature attacks next.'
              )}
        </span>
      </header>
      <div className="ad-potion-list" ref={list}>
        {!empty &&
          POTIONS.map((potion) => {
            const active =
              (potion.id === 'potion-regen' && effects.regen > 0) ||
              (potion.id === 'potion-strength' && effects.strength);
            const reason = !counts[potion.id]
              ? text('Nenhuma na bolsa', 'None in your bag')
              : potion.id === 'potion-heal' && healthFull
                ? text('Vida cheia', 'HP is full')
                : active
                  ? text('Efeito já ativo', 'Effect already active')
                  : null;
            return (
              <button
                key={potion.id}
                type="button"
                className="ad-potion-btn"
                disabled={busy || reason !== null}
                onClick={() => onUse(potion.id)}
              >
                <PotionIcon id={potion.id} />
                <span className="ad-potion-text">
                  <strong>{text(potion.name, potion.nameEn)}</strong>
                  <small>{reason ?? text(potion.description, potion.descriptionEn)}</small>
                </span>
                <span className="ad-potion-count">×{counts[potion.id]}</span>
              </button>
            );
          })}
        <button type="button" className="ad-potion-back" disabled={busy} onClick={onClose}>
          {text('Voltar', 'Back')}
        </button>
      </div>
      <p className="rpg-command-hint">
        {text(
          'WASD / setas: selecionar · Enter: beber · Esc: voltar',
          'WASD / arrows: select · Enter: drink · Esc: back'
        )}
      </p>
    </section>
  );
}
