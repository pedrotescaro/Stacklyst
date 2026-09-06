import { TRAILS_DATA } from '@/lib/trailsData';
import { FOUNDATION_COURSES } from './foundations';
import { SPECIALIZATION_COURSES } from './specializations';
import { defineLesson, type LearningCourse, type LearningLesson } from './catalog-types';
import type { KnowledgeMapData, KnowledgeMapNode } from './types';
import { calculatePathProgress, isKnowledgeCompleted } from './progress';

// Existing language-specific questions keep their original assessment IDs and rewards.
// They are explicitly knowledge checks, not fictitious implementation projects.
const LANGUAGE_REVIEWS: LearningCourse[] = Object.entries(TRAILS_DATA).map(
  ([language, levels]) => ({
    id: `review-${language.toLowerCase()}`,
    language,
    title: `${language} · aprofundamento`,
    description:
      'Revisões de conceitos específicos da linguagem. O progresso anterior continua válido.',
    lessons: levels.map((level, index) => {
      const id = `learn-${language.toLowerCase()}-review-${level.levelNumber}`;
      const lesson = defineLesson({
        id,
        language,
        title: `Revisão: ${level.title}`,
        description: level.description,
        unitNumber: level.unitNumber + 4,
        unitTitle: level.unitTitle,
        levelNumber: level.levelNumber + 13,
        difficulty: level.unitNumber >= 6 ? 'avancado' : 'intermediario',
        kind: 'review',
        skills: [level.title],
        prerequisites: [
          index
            ? `learn-${language.toLowerCase()}-review-${levels[index - 1].levelNumber}`
            : `learn-${language.toLowerCase()}-receipt-project`,
        ],
        steps: [
          {
            type: 'concept_explanation',
            title: level.title,
            conceptText: `${level.description}\n\nPontos para revisar:\n${level.questions.map((q) => `- ${q.options[q.correctIndex]}`).join('\n')}\n\nEsta etapa verifica compreensão. Não substitui uma implementação prática desse assunto.`,
          },
          ...level.questions.map((q) => ({
            type: 'multiple_choice' as const,
            title: 'Aplicar o conceito',
            question: q.question,
            options: q.options,
            correctOptionIndex: q.correctIndex,
            explanation: q.options[q.correctIndex],
            xp: 10,
          })),
        ],
      });
      lesson.steps.slice(1).forEach((step, i) => {
        step.id = level.questions[i].id;
      });
      return lesson;
    }),
  })
);
export const LEARNING_COURSES: LearningCourse[] = [
  ...FOUNDATION_COURSES,
  ...SPECIALIZATION_COURSES.map((course) => ({
    ...course,
    lessons: [...FOUNDATION_COURSES.find((c) => c.language === 'JS')!.lessons, ...course.lessons],
  })),
  ...LANGUAGE_REVIEWS.map((course) => ({
    ...course,
    lessons: [
      ...FOUNDATION_COURSES.find((c) => c.language === course.language)!.lessons,
      ...course.lessons,
    ],
  })),
];
export const LEARNING_LESSONS = new Map<string, LearningLesson>(
  LEARNING_COURSES.flatMap((course) => course.lessons.map((lesson) => [lesson.id, lesson] as const))
);
export function getLearningLesson(id: string) {
  return LEARNING_LESSONS.get(id) ?? null;
}
export function isLessonComplete(lesson: LearningLesson, completed: ReadonlySet<string>) {
  return lesson.steps
    .filter((step) => step.type !== 'concept_explanation')
    .every((step) => completed.has(step.id));
}
export function buildLearningMap(
  completedStepIds: readonly string[],
  attemptedStepIds: readonly string[] = []
): KnowledgeMapData {
  const completed = new Set(completedStepIds),
    attempted = new Set(attemptedStepIds);
  const done = new Set(
    [...LEARNING_LESSONS.values()]
      .filter((lesson) => isLessonComplete(lesson, completed))
      .map((lesson) => lesson.id)
  );
  const nodes: KnowledgeMapNode[] = [...LEARNING_LESSONS.values()].map((lesson) => {
    const exercises = lesson.steps.filter((step) => step.type !== 'concept_explanation');
    const finished = exercises.filter((step) => completed.has(step.id)).length;
    const started = lesson.steps.some((step) => attempted.has(step.id) || completed.has(step.id));
    const prerequisites = lesson.prerequisites.map((id) => ({
      nodeId: id,
      title: LEARNING_LESSONS.get(id)?.title ?? id,
      relation: 'REQUIRED' as const,
      status: done.has(id) ? ('COMPLETED' as const) : ('NOT_STARTED' as const),
      completed: done.has(id),
    }));
    const status = done.has(lesson.id)
      ? 'COMPLETED'
      : prerequisites.some((p) => !p.completed)
        ? 'NOT_STARTED'
        : started
          ? 'IN_PROGRESS'
          : 'AVAILABLE';
    return {
      id: lesson.id,
      slug: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type:
        lesson.kind === 'project' ? 'PROJECT' : lesson.kind === 'review' ? 'CHALLENGE' : 'CONCEPT',
      category: lesson.unitTitle,
      language: lesson.language,
      difficulty:
        lesson.difficulty === 'iniciante' ? 1 : lesson.difficulty === 'intermediario' ? 3 : 5,
      xpReward: lesson.xpReward,
      estimatedMinutes: parseInt(lesson.estimatedTime),
      position: { x: 0, y: lesson.levelNumber },
      status,
      mastery: Math.round((finished / exercises.length) * 100),
      completedExercises: finished,
      prerequisites,
      lessonId: lesson.id,
      unitNumber: lesson.unitNumber,
      activityKind: lesson.kind,
      exercises: exercises.map((step) => ({
        id: step.id,
        slug: lesson.id,
        title: step.title,
        summary: step.instruction ?? step.question ?? '',
        language: lesson.language,
        difficulty: 1,
        baseXp: step.xp,
        estimatedMinutes: 3,
        completed: completed.has(step.id),
      })),
    };
  });
  const statuses = new Map(nodes.map((node) => [node.id, node.status]));
  return {
    nodes,
    edges: nodes.flatMap((node) =>
      node.prerequisites.map((p) => ({
        id: `${p.nodeId}:${node.id}`,
        sourceNodeId: p.nodeId,
        targetNodeId: node.id,
        relation: p.relation,
      }))
    ),
    paths: LEARNING_COURSES.map((course) =>
      calculatePathProgress(
        {
          id: course.id,
          slug: course.id,
          title: course.title,
          description: course.description,
          accentColor: '#0083fe',
          estimatedMinutes: course.lessons.reduce((n, l) => n + parseInt(l.estimatedTime), 0),
          featured: course.id === 'foundations-js',
          nodeIds: course.lessons.map((l) => l.id),
        },
        statuses
      )
    ),
    totals: {
      completedNodes: done.size,
      masteredNodes: 0,
      totalNodes: nodes.length,
      overallMastery: Math.round(nodes.reduce((n, x) => n + x.mastery, 0) / nodes.length),
    },
  };
}
export function mergeLearningMaps(
  curriculum: KnowledgeMapData,
  database: KnowledgeMapData
): KnowledgeMapData {
  const nodes = [...curriculum.nodes, ...database.nodes];
  return {
    nodes,
    edges: [...curriculum.edges, ...database.edges],
    paths: [
      ...curriculum.paths,
      ...database.paths.map((path) => ({
        ...path,
        id: `practice-${path.id}`,
        slug: `practice-${path.slug}`,
        title: `Prática complementar · ${path.title}`,
        featured: false,
      })),
    ],
    totals: {
      totalNodes: nodes.length,
      completedNodes: nodes.filter((n) => isKnowledgeCompleted(n.status)).length,
      masteredNodes: nodes.filter((n) => n.status === 'MASTERED').length,
      overallMastery: Math.round(nodes.reduce((n, x) => n + x.mastery, 0) / nodes.length),
    },
  };
}
