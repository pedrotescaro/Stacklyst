/**
 * Potions drop from defeated creatures and are used during creature battles.
 * Drinking one is the turn's action: the creature counters afterwards.
 *
 * Storage needs no schema change: each potion owned is one `potion-*` entry in
 * the player's inventory array (equipment code only looks up equipment ids),
 * and a battle's active effects live in its `used` array as `fx:` entries
 * beside the question ids it has already asked.
 */
export const POTIONS = [
  {
    id: 'potion-heal',
    name: 'Poção de cura',
    nameEn: 'Healing potion',
    description: 'Recupera 40 de vida na hora.',
    descriptionEn: 'Restores 40 HP right away.',
  },
  {
    id: 'potion-regen',
    name: 'Poção de regeneração',
    nameEn: 'Regeneration potion',
    description: 'Recupera 12 de vida ao fim de cada um dos próximos 3 turnos.',
    descriptionEn: 'Restores 12 HP at the end of each of the next 3 turns.',
  },
  {
    id: 'potion-strength',
    name: 'Poção de força',
    nameEn: 'Strength potion',
    description: 'O próximo golpe certeiro causa 50% a mais de dano.',
    descriptionEn: 'Your next landed blow deals 50% more damage.',
  },
] as const;

export type PotionId = (typeof POTIONS)[number]['id'];
export const POTION_IDS = POTIONS.map((potion) => potion.id) as PotionId[];
export const POTION_HEAL = 40;
export const REGEN_HP = 12;
export const REGEN_TURNS = 3;
export const STRENGTH_BONUS = 0.5;
/** Chance (in %) that a won battle drops a potion, and how likely each one is. */
export const POTION_DROP_CHANCE = 65;
export const POTION_WEIGHTS: Record<PotionId, number> = {
  'potion-heal': 50,
  'potion-regen': 30,
  'potion-strength': 20,
};

export function isPotion(id: string): id is PotionId {
  return (POTION_IDS as string[]).includes(id);
}

export function potionCounts(inventory: readonly string[]): Record<PotionId, number> {
  const counts = Object.fromEntries(POTION_IDS.map((id) => [id, 0])) as Record<PotionId, number>;
  for (const item of inventory) if (isPotion(item)) counts[item]++;
  return counts;
}

/** Picks a potion from a 0–99 roll, following POTION_WEIGHTS. */
export function potionForRoll(roll: number): PotionId {
  let threshold = 0;
  for (const id of POTION_IDS) {
    threshold += POTION_WEIGHTS[id];
    if (roll < threshold) return id;
  }
  return POTION_IDS[0];
}

/** Removes a single owned potion from an inventory, keeping everything else. */
export function withoutOnePotion(inventory: readonly string[], id: PotionId) {
  const index = inventory.indexOf(id);
  return index < 0 ? [...inventory] : [...inventory.slice(0, index), ...inventory.slice(index + 1)];
}

export type BattleEffects = { strength: boolean; regen: number };

const FX = 'fx:';

/** Splits a battle's `used` list into the asked question ids and its potion effects. */
export function readBattleUsed(used: unknown): { questions: string[]; effects: BattleEffects } {
  const effects: BattleEffects = { strength: false, regen: 0 };
  const questions: string[] = [];
  for (const entry of Array.isArray(used) ? used : []) {
    if (typeof entry !== 'string') continue;
    if (!entry.startsWith(FX)) {
      questions.push(entry);
      continue;
    }
    const [, name, value] = entry.split(':');
    if (name === 'strength') effects.strength = true;
    else if (name === 'regen') effects.regen = Math.max(0, Number(value) || 0);
    // Older battles may still carry an `fx:item:<turn>` marker; it is dropped on the next write.
  }
  return { questions, effects };
}

export function writeBattleUsed(questions: readonly string[], effects: BattleEffects): string[] {
  return [
    ...questions,
    ...(effects.strength ? [`${FX}strength`] : []),
    ...(effects.regen > 0 ? [`${FX}regen:${effects.regen}`] : []),
  ];
}
