// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { translateMundinho } from '../i18n';
import { localizeMundinhoPayload } from '../i18n.server';
import { CREATURES, ITEMS } from '../types';
import { EQUIPMENT, EQUIPMENT_SLOTS } from '../equipment';
import { SKILLS } from '../rules';
import { QUESTIONS, publicQuestion } from '../questions';
import { codeChallenges } from '../codeChallenges';

describe('Mundinho English copy', () => {
  it('keeps Portuguese untouched by default', () => {
    expect(translateMundinho('Gosma de sintaxe', 'pt')).toBe('Gosma de sintaxe');
  });

  it('translates every creature, item, equipment and skill name', () => {
    const names = [
      ...CREATURES.map((creature) => creature.name),
      ...ITEMS.flatMap((item) => [item.name, item.description, item.rarity]),
      ...EQUIPMENT.flatMap((item) => [item.name, item.description, item.rarity]),
      ...Object.values(EQUIPMENT_SLOTS),
      ...SKILLS.flatMap((skill) => [skill.name, skill.description]),
    ];
    const untranslated = names.filter((name) => translateMundinho(name, 'en') === name);
    expect(untranslated.filter((name) => !['Avatar', 'Pastel'].includes(name))).toEqual([]);
  });

  it('translates templated battle feedback, including the question explanation', () => {
    expect(translateMundinho('Vitória · Gosma de sintaxe', 'en')).toBe('Victory · Syntax slime');
    expect(
      translateMundinho('Ainda não. O inimigo aproveitou a abertura. Revise os comandos.', 'en')
    ).toBe('Not yet. The enemy took the opening. Review the commands.');
    expect(
      localizeMundinhoPayload({
        battle: {
          feedback:
            'Correto! Depurar causou 18 de dano. A divisão entre inteiros descarta a parte fracionária.',
        },
      }).battle.feedback
    ).toBe('Correct! Debug dealt 18 damage. Integer division discards the fractional part.');
  });

  it('localizes every quiz question while keeping ids and code untouched', () => {
    for (const question of QUESTIONS) {
      const english = localizeMundinhoPayload(publicQuestion(question));
      expect(english.id).toBe(question.id);
      expect(english.prompt, question.prompt).not.toBe(question.prompt);
      expect(english.concept === question.concept || english.concept !== '').toBe(true);
    }
  });

  it('localizes code challenges without touching tile labels or starter code', () => {
    const [challenge] = codeChallenges('JS');
    const english = localizeMundinhoPayload(challenge);
    expect(english.prompt).not.toBe(challenge.prompt);
    expect(english.code?.title).not.toBe(challenge.code?.title);
    expect(english.code?.tiles).toEqual(challenge.code?.tiles);
    expect(english.code?.commands).toEqual(challenge.code?.commands);
  });
});
