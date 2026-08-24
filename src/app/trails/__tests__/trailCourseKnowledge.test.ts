import { describe, expect, it } from 'vitest';
import { getCourseKnowledgeNodes, getCourseLearningPaths } from '@/app/trails/trailCourseKnowledge';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';

function createNode(id: string, language: string | null): KnowledgeMapNode {
  return {
    id,
    slug: id,
    title: id,
    description: id,
    type: 'CONCEPT',
    category: 'Testes',
    language,
    difficulty: 1,
    xpReward: 10,
    estimatedMinutes: 10,
    position: { x: 0, y: 0 },
    status: 'AVAILABLE',
    mastery: 0,
    completedExercises: 0,
    exercises: [],
    prerequisites: [],
  };
}

const paths: LearningPathSummary[] = [
  {
    id: 'js-path',
    slug: 'js-path',
    title: 'JavaScript',
    description: 'JavaScript',
    accentColor: '#facc15',
    estimatedMinutes: 60,
    featured: true,
    nodeIds: ['js', 'shared'],
    completedNodes: 0,
    totalNodes: 2,
    progressPercent: 0,
    nextRecommendedNodeId: 'js',
  },
  {
    id: 'ts-path',
    slug: 'ts-path',
    title: 'TypeScript',
    description: 'TypeScript',
    accentColor: '#3b82f6',
    estimatedMinutes: 60,
    featured: false,
    nodeIds: ['ts'],
    completedNodes: 0,
    totalNodes: 1,
    progressPercent: 0,
    nextRecommendedNodeId: 'ts',
  },
];

describe('course knowledge filtering', () => {
  const nodes = [createNode('js', 'JS'), createNode('ts', 'TS'), createNode('shared', null)];

  it('keeps the selected language and shared knowledge in the map', () => {
    const courseNodes = getCourseKnowledgeNodes(nodes, 'JS');
    const coursePaths = getCourseLearningPaths(paths, courseNodes);

    expect(courseNodes.map((node) => node.id)).toEqual(['js', 'shared']);
    expect(coursePaths.map((path) => path.id)).toEqual(['js-path']);
    expect(coursePaths[0]).toMatchObject({
      nodeIds: ['js', 'shared'],
      completedNodes: 0,
      totalNodes: 2,
      progressPercent: 0,
      nextRecommendedNodeId: 'js',
    });
  });

  it('returns an honest empty course when no language-specific content is published', () => {
    expect(getCourseKnowledgeNodes(nodes, 'PYTHON')).toEqual([]);
  });
});
