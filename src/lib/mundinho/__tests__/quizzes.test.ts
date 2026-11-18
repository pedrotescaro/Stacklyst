import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../types';
import { publicQuiz, QUIZ_EN, QUIZZES, quizPool } from '../quizzes';
import {
  potionCounts,
  potionForRoll,
  readBattleUsed,
  withoutOnePotion,
  writeBattleUsed,
} from '../potions';

describe('battle quiz bank', () => {
  it('offers concept quizzes and find-the-bug snippets in every language', () => {
    for (const language of LANGUAGES) {
      expect(quizPool(language, 'concept').length).toBeGreaterThanOrEqual(6);
      expect(quizPool(language, 'bug').length).toBeGreaterThanOrEqual(4);
    }
  });
  it('keeps every question well formed, with unique ids and answers in range', () => {
    expect(new Set(QUIZZES.map((q) => q.id)).size).toBe(QUIZZES.length);
    for (const q of QUIZZES) {
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.explanation).toBeTruthy();
      if (q.kind === 'bug') expect(q.snippet).toBeTruthy();
    }
  });
  it('spreads correct answers across the options instead of always using the first', () => {
    const positions = new Set(QUIZZES.filter((q) => q.kind === 'bug').map((q) => q.answer));
    expect(positions).toEqual(new Set([0, 1, 2, 3]));
  });
  it('never sends the answer or explanation to the client', () => {
    const shown = publicQuiz(quizPool('JS', 'bug')[0]);
    expect(shown).not.toHaveProperty('answer');
    expect(shown).not.toHaveProperty('explanation');
    expect(shown.snippet).toBeTruthy();
  });
  it('has English copy for the new prompts, options and explanations', () => {
    for (const q of QUIZZES.filter((quiz) => /^(gen|web|bug)-/.test(quiz.id))) {
      expect(QUIZ_EN[q.prompt]).toBeTruthy();
      expect(QUIZ_EN[q.explanation]).toBeTruthy();
    }
  });
});

describe('potions', () => {
  it('counts, removes one at a time and keeps other inventory', () => {
    const inventory = ['potion-heal', 'gear-clover', 'potion-heal', 'potion-regen'];
    expect(potionCounts(inventory)).toEqual({
      'potion-heal': 2,
      'potion-regen': 1,
      'potion-strength': 0,
    });
    expect(withoutOnePotion(inventory, 'potion-heal')).toEqual([
      'gear-clover',
      'potion-heal',
      'potion-regen',
    ]);
  });
  it('rolls healing most often and strength least often', () => {
    const rolls = Array.from({ length: 100 }, (_, roll) => potionForRoll(roll));
    const count = (id: string) => rolls.filter((rolled) => rolled === id).length;
    expect([count('potion-heal'), count('potion-regen'), count('potion-strength')]).toEqual([
      50, 30, 20,
    ]);
  });
  it('stores battle effects beside the asked questions and reads them back', () => {
    const used = writeBattleUsed(['PYTHON-0', 'bug-JS-1'], { strength: true, regen: 2 });
    expect(readBattleUsed(used)).toEqual({
      questions: ['PYTHON-0', 'bug-JS-1'],
      effects: { strength: true, regen: 2 },
    });
    expect(readBattleUsed(['code-1']).effects).toEqual({ strength: false, regen: 0 });
    // The per-turn marker from when potions did not spend the turn is ignored and dropped.
    const legacy = readBattleUsed(['code-1', 'fx:item:3', 'fx:regen:1']);
    expect(legacy).toEqual({ questions: ['code-1'], effects: { strength: false, regen: 1 } });
    expect(writeBattleUsed(legacy.questions, legacy.effects)).toEqual(['code-1', 'fx:regen:1']);
  });
});
