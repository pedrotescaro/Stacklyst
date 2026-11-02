import {
  EQUIPMENT,
  EQUIPMENT_SLOTS,
  equipmentBonusLabel,
  type CombatStats,
  type EquipmentSlot,
} from '../../lib/mundinho/equipment';
import { EquipmentSprite } from './EquipmentSprite';

export function EquipmentInventory({
  inventory,
  equipped,
  stats,
  busy,
  locked,
  onEquip,
}: {
  inventory: string[];
  equipped: Record<string, string>;
  stats: CombatStats;
  busy: boolean;
  locked: boolean;
  onEquip: (itemId: string, remove: boolean) => void;
}) {
  const owned = EQUIPMENT.filter((item) => inventory.includes(item.id));
  return (
    <section className="ad-equipment-inventory" aria-label="Equipamentos de batalha">
      <h2>Equipamentos de batalha</h2>
      <p>
        Vença criaturas para encontrar equipamentos. Equipe um item de cada tipo para melhorar seus
        atributos.
      </p>
      <dl className="ad-equipment-stats">
        <div>
          <dt>Vida máxima</dt>
          <dd>{stats.maxHp} PV</dd>
        </div>
        <div>
          <dt>Proteção</dt>
          <dd>−{stats.protection} por golpe</dd>
        </div>
        <div>
          <dt>Sorte</dt>
          <dd>+{stats.luck} p.p.</dd>
        </div>
      </dl>
      <p>
        Golpe direto: {stats.directChance}% · Exercício: {100 - stats.directChance}% · Chance de
        drop: {stats.dropChance}%
      </p>
      <ul className="ad-equipment-slots">
        {(Object.entries(EQUIPMENT_SLOTS) as [EquipmentSlot, string][]).map(([slot, label]) => {
          const item = owned.find((entry) => entry.slot === slot && equipped[slot] === entry.id);
          return (
            <li key={slot}>
              <span>{label}</span>
              <strong>{item?.name ?? 'Sem equipamento'}</strong>
            </li>
          );
        })}
      </ul>
      {locked && (
        <p className="ad-equipment-lock" role="status">
          Encerre a batalha para trocar equipamentos. Seus atributos ficam fixos durante o combate.
        </p>
      )}
      {owned.length === 0 ? (
        <p className="ad-equipment-empty">
          Seu primeiro equipamento pode cair em uma vitória. Ele será guardado aqui automaticamente.
        </p>
      ) : (
        <ul className="ad-equipment-list">
          {owned.map((item) => {
            const worn = equipped[item.slot] === item.id;
            return (
              <li key={item.id} data-equipped={worn}>
                <EquipmentSprite itemId={item.id} />
                <div className="ad-equipment-copy">
                  <h3>{item.name}</h3>
                  <p>
                    {EQUIPMENT_SLOTS[item.slot]} · {item.rarity}
                  </p>
                  <strong>{equipmentBonusLabel(item)}</strong>
                  <p>{item.description}</p>
                </div>
                <button
                  type="button"
                  className="ad-equip-btn"
                  disabled={busy || locked}
                  aria-label={`${worn ? 'Desequipar' : 'Equipar'} ${item.name}`}
                  onClick={() => onEquip(item.id, worn)}
                >
                  {worn ? 'Desequipar' : 'Equipar'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
