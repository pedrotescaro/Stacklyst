import { describe, expect, it } from 'vitest';
import {
  MAX_EVENT_CHALLENGES,
  MIN_EVENT_CHALLENGES,
  eventChallengeSetSchema,
} from '../event-challenges';

const validChallenge = {
  title: 'Somar dois números',
  statement: 'Leia dois números inteiros e devolva a soma entre eles.',
  language: 'TS' as const,
  expected_answer: 'return a + b;',
  examples: [{ input: '2 3', output: '5', explanation: 'A soma de 2 e 3 é 5.' }],
};

describe('eventChallengeSetSchema', () => {
  it('accepts a complete set with the minimum number of challenges', () => {
    const parsed = eventChallengeSetSchema.parse({
      challenges: Array.from({ length: MIN_EVENT_CHALLENGES }, () => ({ ...validChallenge })),
    });

    expect(parsed.challenges).toHaveLength(MIN_EVENT_CHALLENGES);
  });

  it('rejects sets with fewer than 3 challenges', () => {
    const result = eventChallengeSetSchema.safeParse({ challenges: [validChallenge] });

    expect(result.success).toBe(false);
  });

  it('rejects sets with more than 20 challenges', () => {
    const result = eventChallengeSetSchema.safeParse({
      challenges: Array.from({ length: MAX_EVENT_CHALLENGES + 1 }, () => ({ ...validChallenge })),
    });

    expect(result.success).toBe(false);
  });
});
