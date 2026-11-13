import type { Lesson, LessonStep } from '@/lib/lessons/types';
import { dialectFor } from '@/lib/lessons/bank/dialect';
import {
  BOSS_SECONDS,
  CHALLENGE_SECONDS,
  TRAIL_LESSON_LIVES,
  drawExercise,
  pickTopic,
  toStep,
} from '@/lib/lessons/bank';
import { seededRng, type BankKind, type BankTopic, type Rng } from '@/lib/lessons/bank/types';
import type { DrawScope } from '@/lib/lessons/bank';
import type { LearningLesson } from './catalog-types';
import { LEARNING_BOSS_STEPS, parseLearningBossId } from './boss-ids';

/**
 * Game layer for the learning catalog. The catalog itself (used by progress,
 * certificates and the knowledge map) is never modified: this module only
 * shapes the copy that is served to the learner and graded by the lesson API.
 *
 * - Original step ids and their completion contract stay untouched.
 * - Extra practice steps get new ids and `practice: true`, so they add XP and
 *   variety without ever re-opening a completed lesson.
 * - Options are shuffled deterministically, so the right answer is not always first.
 */

const FOUNDATION_TOPICS: Record<string, BankTopic> = {
  'first-output': 'basics',
  values: 'basics',
  variables: 'basics',
  strings: 'basics',
  booleans: 'conditionals',
  decisions: 'conditionals',
  loops: 'loops',
  accumulator: 'loops',
  functions: 'functions',
  collections: 'collections',
  records: 'collections',
  debug: 'conditionals',
  'receipt-project': 'collections',
};

const LESSON_PATTERNS: BankKind[][] = [
  ['truefalse', 'output', 'complete'],
  ['output', 'order', 'bug'],
  ['match', 'complete', 'output'],
  ['complete', 'bug', 'order'],
  ['output', 'truefalse', 'match'],
];

const SHORT_PATTERNS: BankKind[][] = [
  ['output', 'complete'],
  ['order', 'truefalse'],
  ['bug', 'output'],
  ['match', 'complete'],
  ['complete', 'order'],
];

const CODE_STEPS = new Set(['code_editor', 'debug', 'boss_challenge']);

function foundationSlug(lesson: LearningLesson) {
  const prefix = `learn-${lesson.language.toLowerCase()}-`;
  const slug = lesson.id.startsWith(prefix) ? lesson.id.slice(prefix.length) : '';
  return slug in FOUNDATION_TOPICS ? slug : null;
}

/** Topics taught up to each unit of the beginner course, in order. */
const FOUNDATION_UNIT_TOPICS: BankTopic[][] = [
  ['basics'],
  ['basics', 'conditionals', 'loops'],
  ['basics', 'conditionals', 'loops', 'functions'],
  ['basics', 'conditionals', 'loops', 'functions', 'collections'],
];

/** Beginner lessons only draw exercises about what the learner has already met. */
function lessonScope(lesson: LearningLesson): DrawScope {
  if (!foundationSlug(lesson)) return {};
  const unit = Math.min(FOUNDATION_UNIT_TOPICS.length, Math.max(1, lesson.unitNumber));
  return { beginner: true, topics: FOUNDATION_UNIT_TOPICS[unit - 1]! };
}

function lessonTopic(lesson: LearningLesson): BankTopic {
  const slug = foundationSlug(lesson);
  if (slug) return FOUNDATION_TOPICS[slug]!;
  return pickTopic(`${lesson.title} ${lesson.unitTitle}`, lesson.levelNumber, lesson.unitTitle);
}

/** Deterministic option shuffle that keeps the answer pointing at the same text. */
function shuffleOptions(step: LessonStep, rng: Rng): LessonStep {
  if (!step.options?.length || step.correctOptionIndex === undefined) return step;
  const answer = step.options[step.correctOptionIndex];
  let options = [...step.options];
  if (step.type === 'output_prediction' && answer && /^-?\d+$/.test(answer.trim())) {
    // The legacy distractor "O texto do próprio código" is replaced by a near miss.
    const near = String(Number(answer) + 1);
    if (!options.includes(near)) {
      options = options.map((option) => (option === 'O texto do próprio código' ? near : option));
    }
  }
  const shuffled = rng.shuffle(options);
  return { ...step, options: shuffled, correctOptionIndex: shuffled.indexOf(answer!) };
}

function practiceSteps(
  lesson: LearningLesson,
  kinds: BankKind[],
  rng: Rng,
  timeLimitSeconds?: number
): LessonStep[] {
  const d = dialectFor(lesson.language);
  const topic = lessonTopic(lesson);
  const used = new Set<string>();
  return kinds.map((kind, index) => ({
    ...toStep(
      drawExercise(kind, topic, d, rng, used, lessonScope(lesson)),
      `${lesson.id}-practice-${index + 1}`,
      10,
      timeLimitSeconds
    ),
    practice: true,
  }));
}

const cache = new Map<string, Lesson>();

export function gamifyLearningLesson(lesson: LearningLesson): Lesson {
  const cached = cache.get(lesson.id);
  if (cached) return cached;
  const rng = seededRng(`gamify:${lesson.id}`);
  const isFoundation = Boolean(foundationSlug(lesson));
  const isReview = lesson.kind === 'review';
  const timed = isReview && lesson.levelNumber % 5 === 0 ? CHALLENGE_SECONDS : undefined;
  const patterns = isFoundation && lesson.kind === 'lesson' ? LESSON_PATTERNS : SHORT_PATTERNS;
  const pattern = patterns[(lesson.levelNumber + lesson.language.length) % patterns.length]!;

  const [first, ...rest] = lesson.steps;
  const concept = first?.type === 'concept_explanation' ? first : null;
  const body = (concept ? rest : lesson.steps).map((step) => {
    const shuffled = shuffleOptions(step, rng);
    return timed && !CODE_STEPS.has(step.type)
      ? { ...shuffled, timeLimitSeconds: timed }
      : shuffled;
  });
  const extra = practiceSteps(lesson, pattern, rng, timed);

  // Code steps close the lesson; everything before them is interleaved for variety.
  const code = body.filter((step) => CODE_STEPS.has(step.type));
  const quick = rng.shuffle([...body.filter((step) => !CODE_STEPS.has(step.type)), ...extra]);
  const steps = [...(concept ? [concept] : []), ...quick, ...code];

  const kind = timed ? 'challenge' : 'lesson';
  const result: Lesson = {
    ...lesson,
    steps,
    xpReward: steps.reduce((sum, step) => sum + step.xp, 0),
    estimatedTime: `${Math.max(4, Math.round(steps.length * 1.5))} min`,
    mode: {
      lives: TRAIL_LESSON_LIVES,
      kind,
      tagline: timed
        ? `Revisão cronometrada: ${timed} s por pergunta e 3 corações.`
        : CODE_STEPS.has(steps.at(-1)?.type ?? '')
          ? 'Pratique em formatos diferentes e feche escrevendo código.'
          : 'Responda em formatos variados. Errou? Perde um coração.',
    },
  };
  cache.set(lesson.id, result);
  return result;
}

// ── Unit bosses ──

export {
  LEARNING_BOSS_STEPS,
  completedLearningBossIds,
  isLearningBossId,
  learningBossId,
} from './boss-ids';

export function buildLearningBoss(
  bossId: string,
  lessons: ReadonlyMap<string, LearningLesson>
): Lesson | null {
  const anchorId = parseLearningBossId(bossId);
  const anchor = anchorId ? lessons.get(anchorId) : undefined;
  if (!anchor) return null;
  const unitLessons = [...lessons.values()].filter(
    (lesson) => lesson.language === anchor.language && lesson.unitTitle === anchor.unitTitle
  );
  const d = dialectFor(anchor.language);
  const rng = seededRng(bossId);
  const topics = [...new Set(unitLessons.map(lessonTopic))];
  const kinds = rng.shuffle<BankKind>([
    'output',
    'bug',
    'complete',
    'order',
    'truefalse',
    'match',
    'output',
  ]);
  const used = new Set<string>();
  const scope = lessonScope(anchor);
  const steps = kinds.map((kind, index) =>
    toStep(
      drawExercise(kind, topics[index % topics.length] ?? 'basics', d, rng, used, scope),
      `${bossId}-step-${index + 1}`,
      25,
      BOSS_SECONDS
    )
  );
  return {
    id: bossId,
    title: `Chefão: ${anchor.unitTitle}`,
    description: `Tudo o que você viu em ${anchor.unitTitle}, sob pressão.`,
    language: anchor.language,
    unitNumber: anchor.unitNumber,
    levelNumber: anchor.levelNumber,
    xpReward: steps.reduce((sum, step) => sum + step.xp, 0),
    difficulty: 'boss',
    estimatedTime: '5 min',
    steps,
    mode: {
      lives: TRAIL_LESSON_LIVES,
      kind: 'boss',
      tagline: `${LEARNING_BOSS_STEPS} etapas misturando a unidade, ${BOSS_SECONDS} s cada e 3 corações.`,
    },
  };
}
