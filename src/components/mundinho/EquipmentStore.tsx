import {
  EQUIPMENT,
  EQUIPMENT_SLOTS,
  equipmentBonusLabel,
  equipmentPrice,
} from '../../lib/mundinho/equipment';
import { EquipmentSprite } from './EquipmentSprite';
import { useLocalizedText } from '../../i18n/useLocalizedText';
import { translateMundinho } from '../../lib/mundinho/i18n';
import { Coin } from './PixelArt';

export function EquipmentStore({
  inventory,
  equipped,
  coins,
  busy,
  locked,
  confirming,
  onConfirmChange,
  onBuy,
  onEquip,
}: {
  inventory: string[];
  equipped: Record<string, string>;
  coins: number;
  busy: boolean;
  locked: boolean;
  confirming: string | null;
  onConfirmChange: (itemId: string | null) => void;
  onBuy: (itemId: string) => Promise<void>;
  onEquip: (itemId: string, remove: boolean) => void;
}) {
  const { text, language: uiLanguage } = useLocalizedText();
  const m = (value: string) => translateMundinho(value, uiLanguage);
  return (
    <section className="ad-equipment-store" aria-labelledby="ad-equipment-store-title">
      <h2 id="ad-equipment-store-title" tabIndex={-1}>
        {text('Equipamentos de batalha', 'Battle equipment')}
      </h2>
      <p>
        {text(
          'Compre com moedas ou encontre equipamentos ao vencer criaturas.',
          'Buy with coins or find equipment by defeating creatures.'
        )}
      </p>
      {locked && (
        <p>
          {text(
            'Equipamentos podem ser trocados após encerrar a batalha.',
            'Equipment can be changed after the battle ends.'
          )}
        </p>
      )}
      <div className="ad-store-grid">
        {EQUIPMENT.map((item) => {
          const owned = inventory.includes(item.id);
          const worn = equipped[item.slot] === item.id;
          const price = equipmentPrice(item);
          return (
            <article className="ad-store-card" key={item.id}>
              <div className="ad-store-item-preview">
                <EquipmentSprite itemId={item.id} />
              </div>
              <small className="ad-item-rarity">
                {m(EQUIPMENT_SLOTS[item.slot])} · {m(item.rarity)}
              </small>
              <h3 className="ad-item-name">{m(item.name)}</h3>
              <strong className="ad-equipment-bonus">
                {equipmentBonusLabel(item, uiLanguage)}
              </strong>
              <p className="ad-item-desc">{m(item.description)}</p>
              {owned ? (
                <button
                  type="button"
                  className={`ad-equip-btn ${worn ? 'is-worn' : ''}`}
                  disabled={busy || locked}
                  aria-label={`${worn ? text('Desequipar', 'Unequip') : text('Equipar', 'Equip')} ${m(item.name)}`}
                  onClick={() => onEquip(item.id, worn)}
                >
                  {worn ? text('Desequipar', 'Unequip') : text('Equipar', 'Equip')}
                </button>
              ) : confirming === item.id ? (
                <div className="ad-confirm-box">
                  <p>
                    {text('Confirmar', 'Confirm')} {m(item.name)} {text('por', 'for')} {price}{' '}
                    {text('moedas?', 'coins?')}
                  </p>
                  <button
                    type="button"
                    className="ad-primary w-full text-xs py-2"
                    disabled={busy || coins < price}
                    aria-label={text(
                      `Confirmar compra de ${item.name} por ${price} moedas`,
                      `Confirm purchase of ${m(item.name)} for ${price} coins`
                    )}
                    onClick={() => void onBuy(item.id)}
                  >
                    {text('Confirmar', 'Confirm')}
                  </button>
                  <button
                    type="button"
                    className="ad-cancel-text"
                    disabled={busy}
                    onClick={() => onConfirmChange(null)}
                  >
                    {text('Cancelar', 'Cancel')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ad-buy-btn"
                  disabled={busy || coins < price}
                  aria-label={text(
                    `Comprar ${item.name} por ${price} moedas`,
                    `Buy ${m(item.name)} for ${price} coins`
                  )}
                  onClick={() => onConfirmChange(item.id)}
                >
                  <Coin />
                  <span>
                    {text('Comprar ·', 'Buy ·')} {price}
                  </span>
                  {coins < price && (
                    <small>{text('(Saldo insuficiente)', '(Not enough coins)')}</small>
                  )}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
