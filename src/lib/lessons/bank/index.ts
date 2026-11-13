import { TRAILS_DATA } from '@/lib/trailsData';
import type { LessonStep } from '../types';
import type { BankLanguage, Dialect } from './dialect';
import { LANGUAGE_GENERATORS } from './languages';
import { SHARED_GENERATORS } from './shared';
import {
  BANK_TOPICS,
  type BankExercise,
  type BankGenerator,
  type BankKind,
  type BankTopic,
  type Rng,
} from './types';

const GENERATORS: BankGenerator[] = [...SHARED_GENERATORS, ...LANGUAGE_GENERATORS];

/** Seconds per step in timed lessons. */
export const CHALLENGE_SECONDS = 45;
export const BOSS_SECONDS = 40;
export const TRAIL_LESSON_LIVES = 3;

const TOPIC_KEYWORDS: Array<[BankTopic, RegExp]> = [
  ['errors', /erro|falha|retry|resilien|timeout|exce|observ|recuper|confiavel|seguranc/],
  [
    'collections',
    /lista|array|cole[cç]|chave|derivad|filtr|catalog|ordena|busca|map\b|dados|painel|cache/,
  ],
  ['loops', /la[cç]o|itera|percorr|repet|recurs|evento|fila|stream|lote/],
  ['conditionals', /condic|regra|valida|estado|decis|fluxo|formul|invariant|rota/],
  ['functions', /fun[cç]|compo|props|hook|contrato|modul|servi[cç]o|api|efeito|reducer/],
  ['basics', /tipo|variav|valor|base|fundament|interface|modelo|anatomia|domin/],
];

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function hashOffset(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** Topic from the unit title when it says something concrete; otherwise a steady rotation. */
export function pickTopic(unitTitle: string, lessonIndex: number, pathSlug: string): BankTopic {
  const title = normalize(unitTitle);
  const hit = TOPIC_KEYWORDS.find(([, pattern]) => pattern.test(title));
  if (hit) return hit[0];
  return BANK_TOPICS[(lessonIndex + hashOffset(pathSlug)) % BANK_TOPICS.length]!;
}

function trailQuiz(language: BankLanguage, rng: Rng, asTrueFalse: boolean): BankExercise | null {
  const levels = TRAILS_DATA[language];
  if (!levels?.length) return null;
  const questions = levels.flatMap((level) => level.questions);
  const q = rng.pick(questions);
  const correct = q.options[q.correctIndex]!;
  if (asTrueFalse) {
    const claimTrue = rng.next() < 0.5;
    const wrong = q.options.filter((_, index) => index !== q.correctIndex);
    const proposed = claimTrue ? correct : rng.pick(wrong);
    return {
      kind: 'truefalse',
      title: 'Verdadeiro ou falso?',
      question: `${q.question}\n\nResposta proposta: ${proposed}`,
      options: ['Verdadeiro', 'Falso'],
      answer: claimTrue ? 'Verdadeiro' : 'Falso',
      explanation: `A resposta correta é: ${correct}.`,
    };
  }
  return {
    kind: 'quiz',
    title: 'Escolha a alternativa',
    question: q.question,
    options: rng.shuffle(q.options),
    answer: correct,
    explanation: `A resposta correta é: ${correct}.`,
  };
}

function isValid(exercise: BankExercise) {
  if (exercise.kind === 'order') return new Set(exercise.lines).size === exercise.lines.length;
  if (exercise.kind === 'match')
    return new Set(exercise.pairs.map(([left]) => left)).size === exercise.pairs.length;
  if ('options' in exercise) {
    return (
      new Set(exercise.options).size === exercise.options.length &&
      exercise.options.includes(exercise.answer)
    );
  }
  return true;
}

export interface DrawScope {
  /** Topics the learner has already met; exercises never come from outside them. */
  topics?: readonly BankTopic[];
  /** Beginner course: only exercises that need no idioms beyond the basics. */
  beginner?: boolean;
}

/**
 * Picks an exercise of the requested kind, preferring the lesson topic and never
 * repeating one. Inside a beginner scope it would rather change the format than
 * show something the learner has not been taught.
 */
export function drawExercise(
  kind: BankKind,
  topic: BankTopic,
  d: Dialect,
  rng: Rng,
  used: Set<string>,
  scope: DrawScope = {}
): BankExercise {
  const inScope = (generator: BankGenerator) =>
    (!generator.languages || generator.languages.includes(d.language)) &&
    (!scope.beginner || !generator.advanced) &&
    (!scope.topics || scope.topics.includes(generator.topic));
  const fresh = (generator: BankGenerator) => inScope(generator) && !used.has(generator.id);
  const sameKind = GENERATORS.filter((g) => fresh(g) && g.kind === kind);
  const onTopic = sameKind.filter((g) => g.topic === topic);
  const restricted = Boolean(scope.beginner || scope.topics);

  if (!restricted && kind === 'quiz' && (onTopic.length === 0 || rng.next() < 0.5)) {
    const quiz = trailQuiz(d.language, rng, false);
    if (quiz) return quiz;
  }

  const anyKind = GENERATORS.filter((g) => fresh(g) && g.kind !== 'quiz');
  const pools = restricted
    ? [
        onTopic,
        sameKind,
        anyKind.filter((g) => g.topic === topic),
        anyKind,
        GENERATORS.filter(inScope),
      ]
    : [onTopic, sameKind];
  for (const pool of pools) {
    for (const generator of rng.shuffle(pool)) {
      const exercise = generator.make({ d, language: d.language, rng });
      if (!isValid(exercise)) continue;
      used.add(generator.id);
      return exercise;
    }
  }

  return (
    (restricted ? null : trailQuiz(d.language, rng, kind === 'truefalse')) ??
    SHARED_GENERATORS[0]!.make({ d, language: d.language, rng })
  );
}

const KIND_HINTS: Record<BankExercise['kind'], string> = {
  output: 'Simule a execução linha por linha e anote o valor de cada variável.',
  quiz: 'Elimine primeiro as alternativas que você tem certeza de que estão erradas.',
  truefalse: 'Procure a palavra que torna a frase falsa: "sempre", "nunca", "todos".',
  bug: 'Compare o que cada linha faz com o que o enunciado promete.',
  complete: 'Pense na sintaxe exata da linguagem: maiúsculas e pontuação contam.',
  order: 'Comece pelo que precisa existir antes: declarações vêm antes do uso.',
  match: 'Comece pelos pares mais óbvios e deixe os difíceis por último.',
};

export function toStep(
  exercise: BankExercise,
  id: string,
  xp: number,
  timeLimitSeconds?: number
): LessonStep {
  const base = {
    id,
    title: exercise.title,
    xp,
    explanation: exercise.explanation,
    hints: [KIND_HINTS[exercise.kind]],
    ...(timeLimitSeconds ? { timeLimitSeconds } : {}),
  };
  switch (exercise.kind) {
    case 'output':
      return {
        ...base,
        type: 'output_prediction',
        instruction: exercise.instruction,
        codeSnippet: exercise.code,
        options: exercise.options,
        correctOptionIndex: exercise.options.indexOf(exercise.answer),
      };
    case 'quiz':
    case 'bug':
    case 'truefalse':
      return {
        ...base,
        type: 'multiple_choice',
        variant:
          exercise.kind === 'bug'
            ? 'find_bug'
            : exercise.kind === 'truefalse'
              ? 'true_false'
              : 'quiz',
        question: exercise.question,
        codeSnippet: exercise.code,
        options: exercise.options,
        correctOptionIndex: exercise.options.indexOf(exercise.answer),
      };
    case 'complete':
      return {
        ...base,
        type: 'code_completion',
        instruction: exercise.instruction,
        codeSnippet: exercise.context,
        completionPrefix: exercise.prefix,
        completionSuffix: exercise.suffix,
        blanks: [{ id: 'b1', placeholder: exercise.placeholder, expected: exercise.expected }],
      };
    case 'order':
      return {
        ...base,
        type: 'ordering',
        instruction: exercise.instruction,
        orderItems: exercise.lines.map((text, index) => ({
          id: `l${index + 1}`,
          text,
          correctIndex: index,
        })),
      };
    case 'match':
      return {
        ...base,
        type: 'matching',
        instruction: exercise.instruction,
        matchingPairs: exercise.pairs.map(([left, right], index) => ({
          id: `p${index + 1}`,
          left,
          right,
        })),
      };
  }
}
