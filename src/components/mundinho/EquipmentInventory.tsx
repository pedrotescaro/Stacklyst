import {
  EQUIPMENT,
  EQUIPMENT_SLOTS,
  equipmentBonusLabel,
  hasBugHunterTitle,
  type CombatStats,
  type EquipmentSlot,
} from '../../lib/mundinho/equipment';
import { EquipmentSprite } from './EquipmentSprite';
import { useLocalizedText } from '../../i18n/useLocalizedText';
import { translateMundinho } from '../../lib/mundinho/i18n';

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
  const { text, language: uiLanguage } = useLocalizedText();
  const m = (value: string) => translateMundinho(value, uiLanguage);
  const owned = EQUIPMENT.filter((item) => inventory.includes(item.id));
  return (
    <section
      className="ad-equipment-inventory"
      aria-label={text('Equipamentos de batalha', 'Battle equipment')}
    >
      <h2 id="ad-equipment-inventory-title" tabIndex={-1}>
        {text('Equipamentos de batalha', 'Battle equipment')}
      </h2>
      <p>
        {text(
          'Compre equipamentos na loja ou encontre-os ao vencer criaturas. Equipe um item de cada tipo para melhorar seus atributos.',
          'Buy equipment in the store or find it by defeating creatures. Equip one item of each type to improve your stats.'
        )}
      </p>
      <dl className="ad-equipment-stats">
        <div>
          <dt>{text('Vida máxima', 'Max HP')}</dt>
          <dd>
            {stats.maxHp} {text('PV', 'HP')}
          </dd>
        </div>
        <div>
          <dt>{text('Proteção', 'Protection')}</dt>
          <dd>
            −{stats.protection} {text('por golpe', 'per hit')}
          </dd>
        </div>
        <div>
          <dt>{text('Sorte', 'Luck')}</dt>
          <dd>+{stats.luck} p.p.</dd>
        </div>
      </dl>
      <p>
        {text('Golpe direto:', 'Direct hit:')} {stats.directChance}% ·{' '}
        {text('Exercício:', 'Exercise:')} {100 - stats.directChance}% ·{' '}
        {text('Chance de drop:', 'Drop chance:')} {stats.dropChance}%
      </p>
      {hasBugHunterTitle(inventory, equipped) && (
        <p>
          {text(
            'Caça-bugs equipado: exercícios de código são dispensados nas batalhas.',
            'Bug Hunter equipped: code exercises are skipped in battles.'
          )}
        </p>
      )}
      <ul className="ad-equipment-slots">
        {(Object.entries(EQUIPMENT_SLOTS) as [EquipmentSlot, string][]).map(([slot, label]) => {
          const item = owned.find((entry) => entry.slot === slot && equipped[slot] === entry.id);
          return (
            <li key={slot}>
              <span>{m(label)}</span>
              <strong>{item ? m(item.name) : text('Sem equipamento', 'No equipment')}</strong>
            </li>
          );
        })}
      </ul>
      {locked && (
        <p className="ad-equipment-lock" role="status">
          {text(
            'Encerre a batalha para trocar amuletos, proteções ou relíquias.',
            'End the battle to swap charms, protections or relics.'
          )}
        </p>
      )}
      {owned.length === 0 ? (
        <p className="ad-equipment-empty">
          {text(
            'Compre seu primeiro equipamento na loja ou encontre um em uma vitória. Ele será guardado aqui automaticamente.',
            'Buy your first piece of equipment in the store or find one in a victory. It will be stored here automatically.'
          )}
        </p>
      ) : (
        <ul className="ad-equipment-list">
          {owned.map((item) => {
            const worn = equipped[item.slot] === item.id;
            return (
              <li key={item.id} data-equipped={worn}>
                <EquipmentSprite itemId={item.id} />
                <div className="ad-equipment-copy">
                  <h3>{m(item.name)}</h3>
                  <p>
                    {m(EQUIPMENT_SLOTS[item.slot])} · {m(item.rarity)}
                  </p>
                  <strong>{equipmentBonusLabel(item, uiLanguage)}</strong>
                  <p>{m(item.description)}</p>
                </div>
                <button
                  type="button"
                  className="ad-equip-btn"
                  disabled={busy || locked}
                  aria-label={`${worn ? text('Desequipar', 'Unequip') : text('Equipar', 'Equip')} ${m(item.name)}`}
                  onClick={() => onEquip(item.id, worn)}
                >
                  {worn ? text('Desequipar', 'Unequip') : text('Equipar', 'Equip')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
