import 'server-only';

import { prisma } from '@/lib/prisma';
import {
  calculatePathProgress,
  deriveKnowledgeStatus,
  isKnowledgeCompleted,
} from '@/lib/learning/progress';
import type {
  KnowledgeMapData,
  KnowledgeProgressStatus,
  KnowledgeRelation,
} from '@/lib/learning/types';

export async function getKnowledgeMapForUser(userId: string): Promise<KnowledgeMapData> {
  const completions = await prisma.exerciseSubmission.findMany({
    where: { user_id: userId, first_completion: true },
    select: { exercise_id: true },
  });
  const completedExerciseIds = new Set(completions.map((row) => row.exercise_id));
  const [databaseNodes, databasePaths, databaseProgress] = await Promise.all([
    prisma.knowledgeNode.findMany({
      where: { is_published: true },
      orderBy: [{ position_y: 'asc' }, { position_x: 'asc' }],
      include: {
        outgoing_edges: true,
        incoming_edges: {
          include: {
            source_node: {
              select: { id: true, title: true },
            },
          },
        },
        exercises: {
          where: { is_published: true },
          orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
          select: {
            id: true,
            slug: true,
            title: true,
            summary: true,
            language: true,
            difficulty: true,
            base_xp: true,
            estimated_minutes: true,
          },
        },
      },
    }),
    prisma.learningPath.findMany({
      where: { is_published: true },
      orderBy: [{ is_featured: 'desc' }, { title: 'asc' }],
      include: {
        nodes: {
          orderBy: { position: 'asc' },
          select: { knowledge_node_id: true },
        },
      },
    }),
    prisma.userNodeProgress.findMany({
      where: { user_id: userId },
      select: {
        knowledge_node_id: true,
        status: true,
        mastery: true,
        completed_exercises: true,
      },
    }),
  ]);

  const progressByNode = new Map(
    databaseProgress.map((progress) => [progress.knowledge_node_id, progress] as const)
  );
  const persistedStatuses = new Map<string, KnowledgeProgressStatus>(
    databaseProgress.map((progress) => [
      progress.knowledge_node_id,
      progress.status as KnowledgeProgressStatus,
    ])
  );

  const recommendedNodeIds = new Set(
    databasePaths
      .filter((path) => path.is_featured)
      .map((path) =>
        path.nodes.find(
          (pathNode) =>
            !isKnowledgeCompleted(
              persistedStatuses.get(pathNode.knowledge_node_id) ?? 'NOT_STARTED'
            )
        )
      )
      .filter((pathNode): pathNode is { knowledge_node_id: string } => Boolean(pathNode))
      .map((pathNode) => pathNode.knowledge_node_id)
  );

  const statusByNode = new Map<string, KnowledgeProgressStatus>();

  for (const node of databaseNodes) {
    const requiredStatuses = node.incoming_edges
      .filter((edge) => edge.relation === 'REQUIRED')
      .map(
        (edge) =>
          statusByNode.get(edge.source_node_id) ??
          persistedStatuses.get(edge.source_node_id) ??
          'NOT_STARTED'
      );

    statusByNode.set(
      node.id,
      deriveKnowledgeStatus({
        persistedStatus: persistedStatuses.get(node.id),
        requiredPrerequisiteStatuses: requiredStatuses,
        isNextRecommended: recommendedNodeIds.has(node.id),
      })
    );
  }

  const nodes = databaseNodes.map((node) => {
    const progress = progressByNode.get(node.id);
    const status = statusByNode.get(node.id) ?? 'NOT_STARTED';

    return {
      id: node.id,
      slug: node.slug,
      title: node.title,
      description: node.description,
      type: node.type,
      category: node.category,
      language: node.language,
      difficulty: node.difficulty,
      xpReward: node.xp_reward,
      estimatedMinutes: node.estimated_minutes,
      position: { x: node.position_x, y: node.position_y },
      status,
      mastery: progress?.mastery ?? 0,
      completedExercises: node.exercises.filter((exercise) => completedExerciseIds.has(exercise.id))
        .length,
      exercises: node.exercises.map((exercise) => ({
        completed: completedExerciseIds.has(exercise.id),
        id: exercise.id,
        slug: exercise.slug,
        title: exercise.title,
        summary: exercise.summary,
        language: exercise.language,
        difficulty: exercise.difficulty,
        baseXp: exercise.base_xp,
        estimatedMinutes: exercise.estimated_minutes,
      })),
      prerequisites: node.incoming_edges.map((edge) => {
        const prerequisiteStatus = statusByNode.get(edge.source_node_id) ?? 'NOT_STARTED';
        return {
          nodeId: edge.source_node_id,
          title: edge.source_node.title,
          relation: edge.relation as KnowledgeRelation,
          status: prerequisiteStatus,
          completed: isKnowledgeCompleted(prerequisiteStatus),
        };
      }),
    };
  });

  const paths = databasePaths.map((path) =>
    calculatePathProgress(
      {
        id: path.id,
        slug: path.slug,
        title: path.title,
        description: path.description,
        accentColor: path.accent_color,
        estimatedMinutes: path.estimated_minutes,
        featured: path.is_featured,
        nodeIds: path.nodes.map((pathNode) => pathNode.knowledge_node_id),
      },
      statusByNode
    )
  );

  const completedNodes = nodes.filter((node) => isKnowledgeCompleted(node.status)).length;
  const masteredNodes = nodes.filter((node) => node.status === 'MASTERED').length;

  return {
    nodes,
    edges: databaseNodes.flatMap((node) =>
      node.outgoing_edges.map((edge) => ({
        id: edge.id,
        sourceNodeId: edge.source_node_id,
        targetNodeId: edge.target_node_id,
        relation: edge.relation as KnowledgeRelation,
      }))
    ),
    paths,
    totals: {
      completedNodes,
      masteredNodes,
      totalNodes: nodes.length,
      overallMastery:
        nodes.length === 0
          ? 0
          : Math.round(nodes.reduce((total, node) => total + node.mastery, 0) / nodes.length),
    },
  };
}
