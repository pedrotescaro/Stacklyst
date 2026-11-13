import { describe, expect, it } from 'vitest';
import { drawExercise, toStep } from '..';
import { DIALECTS, type BankLanguage } from '../dialect';
import { LANGUAGE_GENERATORS } from '../languages';
import { SHARED_GENERATORS } from '../shared';
import { BANK_TOPICS, seededRng, type BankExercise, type BankKind } from '../types';

const LANGUAGES = Object.keys(DIALECTS) as BankLanguage[];
const KINDS: BankKind[] = ['output', 'complete', 'order', 'bug', 'truefalse', 'match'];

function assertSound(exercise: BankExercise, where: string) {
  if ('options' in exercise) {
    expect(exercise.options.length, where).toBeGreaterThanOrEqual(2);
    expect(new Set(exercise.options).size, where).toBe(exercise.options.length);
    expect(exercise.options, where).toContain(exercise.answer);
  }
  if (exercise.kind === 'order') {
    expect(new Set(exercise.lines).size, where).toBe(exercise.lines.length);
    expect(exercise.lines.length, where).toBeGreaterThanOrEqual(3);
  }
  if (exercise.kind === 'match') {
    expect(new Set(exercise.pairs.map(([left]) => left)).size, where).toBe(exercise.pairs.length);
    expect(new Set(exercise.pairs.map(([, right]) => right)).size, where).toBe(
      exercise.pairs.length
    );
  }
  if (exercise.kind === 'complete') expect(exercise.expected.length, where).toBeGreaterThan(0);
}

describe('exercise bank', () => {
  it('every shared generator is sound in every language across many seeds', () => {
    for (const language of LANGUAGES) {
      for (const generator of SHARED_GENERATORS) {
        for (let seed = 0; seed < 25; seed += 1) {
          const exercise = generator.make({
            d: DIALECTS[language],
            language,
            rng: seededRng(`${generator.id}:${language}:${seed}`),
          });
          expect(exercise.kind).toBe(generator.kind);
          assertSound(exercise, `${generator.id} ${language} seed ${seed}`);
        }
      }
    }
  });

  it('every language-specific exercise is sound', () => {
    for (const generator of LANGUAGE_GENERATORS) {
      const language = generator.languages![0]!;
      const exercise = generator.make({
        d: DIALECTS[language],
        language,
        rng: seededRng(generator.id),
      });
      assertSound(exercise, generator.id);
    }
  });

  it('covers every format for every beginner topic in every language', () => {
    for (const language of LANGUAGES) {
      for (const topic of BANK_TOPICS.filter((t) => t !== 'errors')) {
        const kinds = new Set(
          SHARED_GENERATORS.filter((g) => g.topic === topic).map((g) => g.kind)
        );
        expect(kinds.size, `${language} ${topic}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    const draw = () =>
      drawExercise('output', 'loops', DIALECTS.RUST, seededRng('same-seed'), new Set());
    expect(draw()).toEqual(draw());
  });

  it('stays inside a beginner scope even when the requested format is missing', () => {
    for (const language of LANGUAGES) {
      const rng = seededRng(`scope:${language}`);
      const used = new Set<string>();
      for (const kind of [...KINDS, ...KINDS]) {
        const exercise = drawExercise(kind, 'basics', DIALECTS[language], rng, used, {
          beginner: true,
          topics: ['basics'],
        });
        const step = toStep(exercise, 'step', 10);
        const text = JSON.stringify(step).toLowerCase();
        for (const advanced of ['reduce', 'filter', 'async', 'goroutine', 'borrow', 'hashmap']) {
          expect(text, `${language} ${kind}`).not.toContain(advanced);
        }
      }
    }
  });

  it('turns every format into a gradable step', () => {
    for (const kind of KINDS) {
      const exercise = drawExercise(
        kind,
        'collections',
        DIALECTS.PYTHON,
        seededRng(kind),
        new Set()
      );
      const step = toStep(exercise, 'id', 10, 30);
      expect(step.timeLimitSeconds).toBe(30);
      if (step.options) expect(step.correctOptionIndex).toBeGreaterThanOrEqual(0);
    }
  });
});
