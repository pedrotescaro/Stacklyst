import type { Dialect, BankLanguage } from './dialect';

export type BankTopic =
  | 'basics'
  | 'conditionals'
  | 'loops'
  | 'functions'
  | 'collections'
  | 'errors';
export type BankKind = 'output' | 'complete' | 'order' | 'bug' | 'truefalse' | 'match' | 'quiz';

export const BANK_TOPICS: readonly BankTopic[] = [
  'basics',
  'conditionals',
  'loops',
  'functions',
  'collections',
  'errors',
];

/** Language-neutral exercise content; the lesson builder turns it into a LessonStep. */
export type BankExercise =
  | {
      kind: 'output';
      title: string;
      instruction: string;
      code: string;
      options: string[];
      answer: string;
      explanation: string;
    }
  | {
      kind: 'quiz' | 'bug' | 'truefalse';
      title: string;
      question: string;
      code?: string;
      options: string[];
      answer: string;
      explanation: string;
    }
  | {
      kind: 'complete';
      title: string;
      instruction: string;
      context?: string;
      prefix: string;
      suffix: string;
      placeholder: string;
      expected: string[];
      explanation: string;
    }
  | {
      kind: 'order';
      title: string;
      instruction: string;
      lines: string[];
      explanation: string;
    }
  | {
      kind: 'match';
      title: string;
      instruction: string;
      pairs: Array<[left: string, right: string]>;
      explanation: string;
    };

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export interface GeneratorContext {
  d: Dialect;
  language: BankLanguage;
  rng: Rng;
}

export interface BankGenerator {
  id: string;
  topic: BankTopic;
  kind: BankKind;
  /** Restricts a generator to some languages (idioms, error handling…). */
  languages?: readonly BankLanguage[];
  /** Idioms and concepts beyond the beginner course; hidden from foundation lessons. */
  advanced?: boolean;
  make(ctx: GeneratorContext): BankExercise;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Deterministic PRNG (mulberry32): the same lesson id always builds the same lesson. */
export function seededRng(seed: string): Rng {
  let state = hashString(seed) || 1;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)]!,
    shuffle: (items) => {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = Math.floor(next() * (index + 1));
        [copy[index], copy[other]] = [copy[other]!, copy[index]!];
      }
      return copy;
    },
  };
}

/** Unique distractors around a numeric answer, never equal to it. */
export function numericOptions(answer: number, candidates: number[], rng: Rng, size = 4) {
  const seen = new Set([answer]);
  const options = [String(answer)];
  for (const candidate of [...candidates, answer + 1, answer - 1, answer + 2, answer * 2]) {
    if (options.length >= size) break;
    if (!Number.isFinite(candidate) || seen.has(candidate)) continue;
    seen.add(candidate);
    options.push(String(candidate));
  }
  return { options: rng.shuffle(options), answer: String(answer) };
}
