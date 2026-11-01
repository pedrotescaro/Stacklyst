import 'server-only';
import { LEARNING_COURSES, LEARNING_LESSONS } from '@/lib/learning/catalog';
import { HANDCRAFTED_LESSONS, getLessonById } from '@/lib/lessons/registry';
import type { Lesson } from '@/lib/lessons/types';
import {
  CURRICULUM_BY_SLUG,
  buildTrailLessonId,
  buildTrailCodeLessonId,
  parseTrailLessonStepId,
} from '@/app/trails/trailCurriculum';
import {
  CREDENTIAL_LANGUAGES,
  type CredentialDefinition,
  type CredentialLanguage,
  type CredentialRequirement,
} from './types';

export const CREDENTIAL_VERSION = 1;
export interface CredentialCheck {
  requirement: CredentialRequirement;
  stepIds?: string[];
  exerciseId?: string;
}
export interface CredentialGoal {
  definition: CredentialDefinition;
  checks: CredentialCheck[];
}
export interface CredentialExercise {
  id: string;
  title: string;
  language: string;
  knowledge_node_id: string;
  estimated_minutes: number | null;
  testCount: number;
}
export interface CredentialPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  nodes: Array<{ id: string; title: string; language: string | null }>;
}
export const credentialLanguage = (value: string): CredentialLanguage | null =>
  CREDENTIAL_LANGUAGES.includes(value as CredentialLanguage) ? (value as CredentialLanguage) : null;

function lessonCheck(lesson: Lesson): CredentialCheck | null {
  const stepIds = [
    ...new Set(
      lesson.steps.filter((step) => step.type !== 'concept_explanation').map((step) => step.id)
    ),
  ];
  if (!stepIds.length || !credentialLanguage(lesson.language)) return null;
  return { requirement: { source: 'lesson', id: lesson.id, title: lesson.title }, stepIds };
}
function minutes(lesson: Lesson) {
  return Math.max(1, Number.parseInt(lesson.estimatedTime) || 5);
}
function goal(
  input: Omit<CredentialDefinition, 'version' | 'requirements'>,
  checks: CredentialCheck[]
): CredentialGoal | null {
  if (!checks.length || checks.some((check) => !check.stepIds?.length && !check.exerciseId))
    return null;
  return {
    definition: {
      ...input,
      version: CREDENTIAL_VERSION,
      requirements: checks.map((check) => check.requirement),
    },
    checks,
  };
}

/** Every source is an exact catalog lookup. UI title inference and fallback paths never grant awards. */
export function buildCredentialCatalog(
  input: {
    completedStepIds?: ReadonlySet<string>;
    exercises?: readonly CredentialExercise[];
    paths?: readonly CredentialPath[];
  } = {}
): { goals: CredentialGoal[]; lessons: Map<string, Lesson> } {
  const goals = new Map<string, CredentialGoal>();
  const lessons = new Map<string, Lesson>([
    ...LEARNING_LESSONS,
    ...Object.entries(HANDCRAFTED_LESSONS),
  ]);
  const add = (entry: CredentialGoal | null) => {
    if (entry) goals.set(entry.definition.id, entry);
  };

  for (const course of LEARNING_COURSES) {
    const language = credentialLanguage(course.language);
    if (!language || !course.lessons.length) continue;
    const checks = course.lessons.map(lessonCheck);
    if (checks.some((check) => !check)) continue;
    add(
      goal(
        {
          id: `course:${course.id}`,
          title: course.title,
          description: `Conclusão de todas as lições e projetos exigidos em ${course.title}.`,
          language,
          kind: 'course',
          estimatedMinutes: course.lessons.reduce((n, lesson) => n + minutes(lesson), 0),
          skills: [...new Set(course.lessons.flatMap((lesson) => lesson.skills))].slice(0, 100),
        },
        checks as CredentialCheck[]
      )
    );
    for (const unit of new Set(course.lessons.map((lesson) => lesson.unitNumber))) {
      const section = course.lessons.filter((lesson) => lesson.unitNumber === unit);
      add(
        goal(
          {
            id: `section:${course.id}:${unit}`,
            title: `${course.title} · ${section[0].unitTitle}`,
            description: `Conclusão das ${section.length} lições da seção ${unit} de ${course.title}.`,
            language,
            kind: 'section',
            estimatedMinutes: section.reduce((n, lesson) => n + minutes(lesson), 0),
            skills: [...new Set(section.flatMap((lesson) => lesson.skills))].slice(0, 100),
          },
          section.map(lessonCheck) as CredentialCheck[]
        )
      );
    }
  }

  // Legacy curriculum is included when this exact source appears in persisted progress.
  // A newly selected language or a UI fallback alone is not evidence of an existing course.
  const activeLegacy = new Map<string, { language: CredentialLanguage; slug: string }>();
  for (const id of input.completedStepIds ?? []) {
    const parsed = parseTrailLessonStepId(id);
    const language =
      parsed && credentialLanguage(parsed.language === 'PY' ? 'PYTHON' : parsed.language);
    if (parsed && language)
      activeLegacy.set(`${language}:${parsed.pathSlug}`, { language, slug: parsed.pathSlug });
  }
  for (const { language, slug } of activeLegacy.values()) {
    const curriculum = CURRICULUM_BY_SLUG[slug];
    if (!curriculum) continue;
    const pathLessons: Lesson[] = [];
    let pathComplete = true;
    for (const [sectionIndex, section] of curriculum.sections.entries()) {
      const sectionLessons: Lesson[] = [];
      let sectionComplete = section.units.length > 0;
      for (const [unitIndex] of section.units.entries()) {
        const ids = [
          buildTrailLessonId(language, slug, sectionIndex + 1, unitIndex + 1),
          ...[1, 2].map((slot) =>
            buildTrailCodeLessonId(language, slug, sectionIndex + 1, unitIndex + 1, slot)
          ),
        ];
        for (const id of ids) {
          const lesson = getLessonById(id);
          if (!lesson || lesson.id !== id || lesson.language !== language || !lessonCheck(lesson)) {
            sectionComplete = false;
            continue;
          }
          lessons.set(id, lesson);
          sectionLessons.push(lesson);
        }
      }
      pathLessons.push(...sectionLessons);
      if (!sectionComplete) {
        pathComplete = false;
        continue;
      }
      add(
        goal(
          {
            id: `section:curriculum:${language}:${slug}:${sectionIndex + 1}`,
            title: `${curriculum.title} · ${section.title}`,
            description: section.goal,
            language,
            kind: 'section',
            estimatedMinutes: sectionLessons.reduce((n, lesson) => n + minutes(lesson), 0),
            skills: section.units.map((unit) => unit.title),
          },
          sectionLessons.map(lessonCheck) as CredentialCheck[]
        )
      );
    }
    if (pathComplete)
      add(
        goal(
          {
            id: `path:curriculum:${language}:${slug}`,
            title: `${curriculum.title} · percurso complementar`,
            description: `Conclusão das seções e práticas de código do percurso ${curriculum.title}.`,
            language,
            kind: 'path',
            estimatedMinutes: pathLessons.reduce((n, lesson) => n + minutes(lesson), 0),
            skills: curriculum.sections.map((section) => section.title),
          },
          pathLessons.map(lessonCheck) as CredentialCheck[]
        )
      );
  }

  for (const lesson of lessons.values()) {
    const check = lessonCheck(lesson),
      language = credentialLanguage(lesson.language);
    if (!check || !language) continue;
    add(
      goal(
        {
          id: `practice:lesson:${lesson.id}`,
          title: lesson.title,
          description: `Conclusão dos requisitos avaliados da lição ${lesson.title}.`,
          language,
          kind: 'practice',
          estimatedMinutes: minutes(lesson),
          skills: 'skills' in lesson ? (lesson.skills as string[]).slice(0, 100) : [lesson.title],
        },
        [check]
      )
    );
  }

  const exercises =
    input.exercises?.filter(
      (exercise) => exercise.testCount > 0 && credentialLanguage(exercise.language)
    ) ?? [];
  const exerciseCheck = (exercise: CredentialExercise): CredentialCheck => ({
    requirement: { id: exercise.id, title: exercise.title, source: 'exercise' },
    exerciseId: exercise.id,
  });
  for (const exercise of exercises) {
    add(
      goal(
        {
          id: `practice:exercise:${exercise.id}`,
          title: exercise.title,
          description: `Prática complementar aprovada em todos os testes públicos e ocultos disponíveis.`,
          language: credentialLanguage(exercise.language),
          kind: 'practice',
          estimatedMinutes: exercise.estimated_minutes ?? 10,
          skills: [exercise.title],
        },
        [exerciseCheck(exercise)]
      )
    );
  }
  for (const path of input.paths ?? []) {
    for (const language of CREDENTIAL_LANGUAGES) {
      const nodes = path.nodes.filter(
        (node) => node.language === null || node.language === language
      );
      if (!nodes.length) continue;
      const requirements = nodes.map((node) =>
        exercises.filter(
          (exercise) => exercise.knowledge_node_id === node.id && exercise.language === language
        )
      );
      if (requirements.some((items) => !items.length)) continue;
      const required = requirements.flat();
      add(
        goal(
          {
            id: `path:database:${path.id}:${language}`,
            title: `${path.title} · prática complementar`,
            description: path.description,
            language,
            kind: 'path',
            estimatedMinutes: required.reduce(
              (n, exercise) => n + (exercise.estimated_minutes ?? 10),
              0
            ),
            skills: nodes.map((node) => node.title).slice(0, 100),
          },
          required.map(exerciseCheck)
        )
      );
    }
  }
  return { goals: [...goals.values()], lessons };
}

export function credentialGoalProgress(
  goal: CredentialGoal,
  completedSteps: ReadonlySet<string>,
  passedExercises: ReadonlySet<string>
) {
  const completed = goal.checks.filter((check) =>
    check.exerciseId
      ? passedExercises.has(check.exerciseId)
      : Boolean(check.stepIds?.length) && check.stepIds!.every((id) => completedSteps.has(id))
  ).length;
  return {
    completed,
    total: goal.checks.length,
    eligible: goal.checks.length > 0 && completed === goal.checks.length,
  };
}

export function firstLessonGoal(
  lessons: ReadonlyMap<string, Lesson>,
  completedSteps: ReadonlySet<string>
): CredentialGoal {
  const lesson = [...lessons.values()].find((item) => {
    const check = lessonCheck(item);
    return check && check.stepIds!.every((id) => completedSteps.has(id));
  });
  const check = lesson && lessonCheck(lesson);
  return {
    definition: {
      id: 'first-lesson',
      version: CREDENTIAL_VERSION,
      title: 'Primeira lição concluída',
      description:
        'Conclusão verificada de todos os passos avaliados de uma lição real do Stacklyst.',
      language: lesson ? credentialLanguage(lesson.language) : null,
      kind: 'first_lesson',
      estimatedMinutes: lesson ? minutes(lesson) : 0,
      skills: lesson ? [lesson.title] : [],
      requirements: check ? [check.requirement] : [],
    },
    checks: check ? [check] : [],
  };
}
