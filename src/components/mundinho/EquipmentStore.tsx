import {
  EQUIPMENT,
  EQUIPMENT_SLOTS,
  equipmentBonusLabel,
  equipmentPrice,
} from '../../lib/mundinho/equipment';
import { EquipmentSprite } from './EquipmentSprite';
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
  return (
    <section className="ad-equipment-store" aria-labelledby="ad-equipment-store-title">
      <h2 id="ad-equipment-store-title" tabIndex={-1}>
        Equipamentos de batalha
      </h2>
      <p>Compre com moedas ou encontre equipamentos ao vencer criaturas.</p>
      {locked && <p>Equipamentos podem ser trocados após encerrar a batalha.</p>}
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
                {EQUIPMENT_SLOTS[item.slot]} · {item.rarity}
              </small>
              <h3 className="ad-item-name">{item.name}</h3>
              <strong className="ad-equipment-bonus">{equipmentBonusLabel(item)}</strong>
              <p className="ad-item-desc">{item.description}</p>
              {owned ? (
                <button
                  type="button"
                  className={`ad-equip-btn ${worn ? 'is-worn' : ''}`}
                  disabled={busy || locked}
                  aria-label={`${worn ? 'Desequipar' : 'Equipar'} ${item.name}`}
                  onClick={() => onEquip(item.id, worn)}
                >
                  {worn ? 'Desequipar' : 'Equipar'}
                </button>
              ) : confirming === item.id ? (
                <div className="ad-confirm-box">
                  <p>
                    Confirmar {item.name} por {price} moedas?
                  </p>
                  <button
                    type="button"
                    className="ad-primary w-full text-xs py-2"
                    disabled={busy || coins < price}
                    aria-label={`Confirmar compra de ${item.name} por ${price} moedas`}
                    onClick={() => void onBuy(item.id)}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    className="ad-cancel-text"
                    disabled={busy}
                    onClick={() => onConfirmChange(null)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ad-buy-btn"
                  disabled={busy || coins < price}
                  aria-label={`Comprar ${item.name} por ${price} moedas`}
                  onClick={() => onConfirmChange(item.id)}
                >
                  <Coin />
                  <span>Comprar · {price}</span>
                  {coins < price && <small>(Saldo insuficiente)</small>}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
