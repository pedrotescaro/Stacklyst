import { describe, expect, it } from 'vitest';
import {
  EQUIPMENT,
  directAttack,
  equipmentDropPool,
  equipmentStats,
  equipmentPrice,
  hasBugHunterTitle,
} from '../equipment';
import SPRITES from '../equipment-sprites.json';
import { resolveTurn } from '../rules';

describe('Battle equipment rules', () => {
  it('uses catalog prices and grants the title only when it is owned and equipped', () => {
    expect(EQUIPMENT.map((item) => equipmentPrice(item))).toEqual([
      100, 250, 500, 100, 250, 500, 100, 250, 500,
    ]);
    expect(hasBugHunterTitle([], { title: 'title-debugger' })).toBe(false);
    expect(hasBugHunterTitle(['title-debugger'], {})).toBe(false);
    expect(equipmentStats([], { title: 'title-debugger' }).directChance).toBe(50);
    expect(equipmentStats(['title-debugger'], {}).directChance).toBe(50);
    expect(
      equipmentStats(['title-debugger', 'gear-star'], {
        title: 'title-debugger',
        charm: 'gear-star',
      })
    ).toMatchObject({ directChance: 100, dropChance: 65, luck: 15 });
  });
  it('splits the 100 equally likely base outcomes into 50 direct hits and 50 exercises', () => {
    const stats = equipmentStats([], {});
    expect(stats).toEqual({ maxHp: 100, protection: 0, luck: 0, directChance: 50, dropChance: 50 });
    expect(
      Array.from({ length: 100 }, (_, roll) => directAttack(stats, roll)).filter(Boolean)
    ).toHaveLength(50);
    expect(directAttack(stats, 49)).toBe(true);
    expect(directAttack(stats, 50)).toBe(false);
  });
  it('counts only owned catalog gear in the correct slot', () => {
    expect(
      equipmentStats([], { charm: 'gear-star', armor: 'gear-crystal', relic: 'gear-phoenix' })
    ).toEqual(equipmentStats([], {}));
    const owned = EQUIPMENT.map((item) => item.id);
    expect(
      equipmentStats(owned, { charm: 'gear-crystal', armor: 'gear-phoenix', relic: 'gear-star' })
    ).toEqual(equipmentStats([], {}));
    expect(
      equipmentStats(owned, {
        charm: 'gear-star',
        armor: 'gear-crystal',
        relic: 'gear-phoenix',
        extra: 'gear-moon',
      })
    ).toEqual({ maxHp: 130, protection: 6, luck: 15, directChance: 65, dropChance: 65 });
  });
  it('adds rarer items with tougher creatures and weights common, rare and epic drops 6:3:1', () => {
    const level1 = equipmentDropPool(1);
    expect(new Set(level1.map((item) => item.rarity))).toEqual(new Set(['Comum']));
    const level2 = equipmentDropPool(2);
    expect(new Set(level2.map((item) => item.rarity))).toEqual(new Set(['Comum', 'Raro']));
    const level3 = equipmentDropPool(3);
    for (const item of EQUIPMENT)
      expect(level3.filter((entry) => entry.id === item.id)).toHaveLength(
        item.rarity === 'Comum' ? 6 : item.rarity === 'Raro' ? 3 : 1
      );
    expect(SPRITES).toEqual(EQUIPMENT.map((item) => item.id));
  });
  it('caps healing at equipped maximum health and reduces both successful and failed counters', () => {
    const stats = { maxHp: 130, protection: 6 };
    expect(resolveTurn(125, 100, true, 'focus', 3, stats)).toMatchObject({ hp: 121, enemyHp: 82 });
    expect(resolveTurn(130, 100, false, 'strike', 3, stats)).toMatchObject({
      hp: 112,
      enemyHp: 100,
    });
    expect(resolveTurn(100, 100, true, 'strike', 1, { maxHp: 100, protection: 999 }).hp).toBe(99);
  });
});
