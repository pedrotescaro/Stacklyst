export type EquipmentSlot = 'charm' | 'armor' | 'relic';
export type Equipment = {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: 'Comum' | 'Raro' | 'Épico';
  minLevel: number;
  luck: number;
  protection: number;
  vitality: number;
};

export const EQUIPMENT: Equipment[] = [
  {
    id: 'gear-clover',
    name: 'Trevo da clareira',
    description: 'Um pequeno amuleto para encontrar oportunidades.',
    slot: 'charm',
    rarity: 'Comum',
    minLevel: 1,
    luck: 5,
    protection: 0,
    vitality: 0,
  },
  {
    id: 'gear-moon',
    name: 'Amuleto lunar',
    description: 'A luz da lua acompanha suas escolhas.',
    slot: 'charm',
    rarity: 'Raro',
    minLevel: 2,
    luck: 10,
    protection: 0,
    vitality: 0,
  },
  {
    id: 'gear-star',
    name: 'Estrela da fortuna',
    description: 'Uma estrela guardada pelos habitantes da floresta.',
    slot: 'charm',
    rarity: 'Épico',
    minLevel: 3,
    luck: 15,
    protection: 0,
    vitality: 0,
  },
  {
    id: 'gear-wood',
    name: 'Escudo do bosque',
    description: 'Madeira resistente para aparar os contra-ataques.',
    slot: 'armor',
    rarity: 'Comum',
    minLevel: 1,
    luck: 0,
    protection: 2,
    vitality: 0,
  },
  {
    id: 'gear-iron',
    name: 'Escudo de ferro',
    description: 'Uma defesa firme para encontros mais difíceis.',
    slot: 'armor',
    rarity: 'Raro',
    minLevel: 2,
    luck: 0,
    protection: 4,
    vitality: 0,
  },
  {
    id: 'gear-crystal',
    name: 'Égide de cristal',
    description: 'Cristais unidos em uma proteção duradoura.',
    slot: 'armor',
    rarity: 'Épico',
    minLevel: 3,
    luck: 0,
    protection: 6,
    vitality: 0,
  },
  {
    id: 'gear-heart',
    name: 'Pingente vital',
    description: 'Uma lembrança da energia da clareira.',
    slot: 'relic',
    rarity: 'Comum',
    minLevel: 1,
    luck: 0,
    protection: 0,
    vitality: 10,
  },
  {
    id: 'gear-orb',
    name: 'Orbe da vida',
    description: 'Energia concentrada para uma jornada mais longa.',
    slot: 'relic',
    rarity: 'Raro',
    minLevel: 2,
    luck: 0,
    protection: 0,
    vitality: 20,
  },
  {
    id: 'gear-phoenix',
    name: 'Núcleo da fênix',
    description: 'Uma relíquia luminosa que fortalece seu aventureiro.',
    slot: 'relic',
    rarity: 'Épico',
    minLevel: 3,
    luck: 0,
    protection: 0,
    vitality: 30,
  },
];

export const EQUIPMENT_SLOTS: Record<EquipmentSlot, string> = {
  charm: 'Amuleto',
  armor: 'Proteção',
  relic: 'Relíquia',
};

/** Store prices are server-owned and shared with the client display. */
export function equipmentPrice(item: Equipment) {
  return { Comum: 100, Raro: 250, Épico: 500 }[item.rarity];
}

export const BUG_HUNTER_TITLE_ID = 'title-debugger';

/** A forged equipped value never grants the title's ability. */
export function hasBugHunterTitle(inventory: readonly string[], equipped: Record<string, string>) {
  return inventory.includes(BUG_HUNTER_TITLE_ID) && equipped.title === BUG_HUNTER_TITLE_ID;
}
export type CombatStats = {
  maxHp: number;
  protection: number;
  luck: number;
  directChance: number;
  dropChance: number;
};

/** Only owned catalog items in their matching slot contribute; the client never supplies stats. */
export function equipmentStats(
  inventory: readonly string[],
  equipped: Record<string, string>
): CombatStats {
  let luck = 0,
    protection = 0,
    vitality = 0;
  for (const item of EQUIPMENT) {
    if (!inventory.includes(item.id) || equipped[item.slot] !== item.id) continue;
    luck += item.luck;
    protection += item.protection;
    vitality += item.vitality;
  }
  luck = Math.min(25, luck);
  return {
    maxHp: 100 + Math.min(50, vitality),
    protection: Math.min(8, protection),
    luck,
    directChance: hasBugHunterTitle(inventory, equipped) ? 100 : Math.min(100, 75 + luck),
    dropChance: 50 + luck,
  };
}

export function directAttack(stats: CombatStats, roll: number) {
  return roll >= 0 && roll < stats.directChance;
}

/** Rarity weights are 6:3:1; tougher creatures add rare and epic items to the pool. */
export function equipmentDropPool(creatureLevel: number) {
  return EQUIPMENT.filter((item) => item.minLevel <= creatureLevel).flatMap((item) =>
    Array.from({ length: item.rarity === 'Comum' ? 6 : item.rarity === 'Raro' ? 3 : 1 }, () => item)
  );
}

export function equipmentBonusLabel(item: Equipment) {
  return item.luck
    ? `+${item.luck} p.p. de sorte`
    : item.protection
      ? `−${item.protection} de dano recebido`
      : `+${item.vitality} de vida máxima`;
}
