export type KnowledgeNodeType =
  | 'FOUNDATION'
  | 'LANGUAGE'
  | 'CONCEPT'
  | 'FRAMEWORK'
  | 'LIBRARY'
  | 'TOOL'
  | 'DATABASE'
  | 'ARCHITECTURE'
  | 'PROJECT'
  | 'CHALLENGE';

export type KnowledgeRelation = 'REQUIRED' | 'RECOMMENDED' | 'RELATED' | 'BUILDS_ON' | 'COMBINES';

export type KnowledgeProgressStatus =
  | 'NOT_STARTED'
  | 'AVAILABLE'
  | 'RECOMMENDED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MASTERED';

export interface KnowledgeExerciseSummary {
  completed?: boolean;
  id: string;
  slug: string;
  title: string;
  summary: string;
  language: string;
  difficulty: number;
  baseXp: number;
  estimatedMinutes: number | null;
}

export interface KnowledgePrerequisite {
  nodeId: string;
  title: string;
  relation: KnowledgeRelation;
  status: KnowledgeProgressStatus;
  completed: boolean;
}

export interface KnowledgeMapNode {
  lessonId?: string;
  unitNumber?: number;
  activityKind?: 'lesson' | 'review' | 'project';
  id: string;
  slug: string;
  title: string;
  description: string;
  type: KnowledgeNodeType;
  category: string;
  language: string | null;
  difficulty: number;
  xpReward: number;
  estimatedMinutes: number | null;
  position: { x: number; y: number };
  status: KnowledgeProgressStatus;
  mastery: number;
  completedExercises: number;
  exercises: KnowledgeExerciseSummary[];
  prerequisites: KnowledgePrerequisite[];
}

export interface KnowledgeMapEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: KnowledgeRelation;
}

export interface LearningPathSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  accentColor: string;
  estimatedMinutes: number | null;
  featured: boolean;
  nodeIds: string[];
  completedNodes: number;
  totalNodes: number;
  progressPercent: number;
  nextRecommendedNodeId: string | null;
}

export interface KnowledgeMapData {
  nodes: KnowledgeMapNode[];
  edges: KnowledgeMapEdge[];
  paths: LearningPathSummary[];
  totals: {
    completedNodes: number;
    masteredNodes: number;
    totalNodes: number;
    overallMastery: number;
  };
}
