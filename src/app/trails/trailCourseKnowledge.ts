import type { TrailLanguageCode } from '@/app/trails/TrailLanguageLogo';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';

export function getCourseKnowledgeNodes(nodes: KnowledgeMapNode[], language: TrailLanguageCode) {
  const hasPublishedCourse = nodes.some((node) => node.language === language);
  if (!hasPublishedCourse) return [];

  return nodes.filter((node) => node.language === language || node.language === null);
}

export function getCourseLearningPaths(
  paths: LearningPathSummary[],
  courseNodes: KnowledgeMapNode[]
) {
  const courseNodeIds = new Set(courseNodes.map((node) => node.id));
  const courseNodesById = new Map(courseNodes.map((node) => [node.id, node]));

  return paths.flatMap((path) => {
    const nodeIds = path.nodeIds.filter((nodeId) => courseNodeIds.has(nodeId));
    if (nodeIds.length === 0) return [];

    const completedNodes = nodeIds.filter((nodeId) => {
      const status = courseNodesById.get(nodeId)?.status;
      return status === 'COMPLETED' || status === 'MASTERED';
    }).length;
    const nextRecommendedNodeId =
      (path.nextRecommendedNodeId && courseNodeIds.has(path.nextRecommendedNodeId)
        ? path.nextRecommendedNodeId
        : nodeIds.find((nodeId) => {
            const status = courseNodesById.get(nodeId)?.status;
            return status === 'RECOMMENDED' || status === 'AVAILABLE' || status === 'IN_PROGRESS';
          })) ??
      nodeIds[0] ??
      null;

    return [
      {
        ...path,
        nodeIds,
        completedNodes,
        totalNodes: nodeIds.length,
        progressPercent: Math.round((completedNodes / nodeIds.length) * 100),
        nextRecommendedNodeId,
      },
    ];
  });
}
