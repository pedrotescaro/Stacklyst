'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { TrailMap } from '@/app/trails/TrailMap';
import type {
  KnowledgeMapEdge,
  KnowledgeMapNode,
  LearningPathSummary,
} from '@/lib/learning/types';

const DEMO_NODES: KnowledgeMapNode[] = [
  // Sector 1: Frontend (West)
  {
    id: 'html-css',
    slug: 'html-css',
    title: 'Fundamentos Web & DOM',
    description: 'Aprenda a estruturar documentos semânticos, manipular a árvore DOM e estilizar com CSS moderno.',
    type: 'FOUNDATION',
    category: 'Frontend',
    language: 'JS',
    difficulty: 1,
    xpReward: 80,
    estimatedMinutes: 20,
    position: { x: 200, y: 380 },
    status: 'COMPLETED',
    mastery: 100,
    completedExercises: 2,
    exercises: [
      {
        id: 'dom-selectors',
        slug: 'dom-selectors',
        title: 'Seletores DOM e Eventos',
        summary: 'Manipule elementos no documento usando QuerySelector.',
        language: 'JS',
        difficulty: 1,
        baseXp: 40,
        estimatedMinutes: 10,
      },
      {
        id: 'flexbox-grid',
        slug: 'flexbox-grid',
        title: 'Layout com Flexbox e Grid',
        summary: 'Construa layouts responsivos e fluidos.',
        language: 'JS',
        difficulty: 1,
        baseXp: 40,
        estimatedMinutes: 10,
      },
    ],
    prerequisites: [],
  },
  {
    id: 'react-basics',
    slug: 'react-basics',
    title: 'Componentes e Props React',
    description: 'Entenda a componentização, renderização declarativa e passagem de propriedades no React.',
    type: 'FRAMEWORK',
    category: 'Frontend',
    language: 'TS',
    difficulty: 2,
    xpReward: 120,
    estimatedMinutes: 25,
    position: { x: 120, y: 360 },
    status: 'IN_PROGRESS',
    mastery: 50,
    completedExercises: 1,
    exercises: [
      {
        id: 'react-props',
        slug: 'react-props',
        title: 'Composição de Componentes',
        summary: 'Crie componentes reutilizáveis passando props tipadas.',
        language: 'TS',
        difficulty: 2,
        baseXp: 60,
        estimatedMinutes: 12,
      },
    ],
    prerequisites: [
      {
        nodeId: 'html-css',
        title: 'Fundamentos Web & DOM',
        relation: 'REQUIRED',
        status: 'COMPLETED',
        completed: true,
      },
    ],
  },
  {
    id: 'react-state',
    slug: 'react-state',
    title: 'Arquitetura de Estado',
    description: 'Domine useState, useReducer e sincronização com hooks customizados.',
    type: 'FRAMEWORK',
    category: 'Frontend',
    language: 'TS',
    difficulty: 3,
    xpReward: 160,
    estimatedMinutes: 35,
    position: { x: 50, y: 340 },
    status: 'RECOMMENDED',
    mastery: 0,
    completedExercises: 0,
    exercises: [
      {
        id: 'use-state-pattern',
        slug: 'use-state-pattern',
        title: 'Gerenciamento de Estado Imutável',
        summary: 'Evite mutações diretas e sincronize o estado do componente.',
        language: 'TS',
        difficulty: 3,
        baseXp: 80,
        estimatedMinutes: 18,
      },
    ],
    prerequisites: [
      {
        nodeId: 'react-basics',
        title: 'Componentes e Props React',
        relation: 'REQUIRED',
        status: 'IN_PROGRESS',
        completed: false,
      },
    ],
  },

  // Sector 2: Systems (North)
  {
    id: 'memory-management',
    slug: 'memory-management',
    title: 'Gerenciamento de Memória',
    description: 'Entenda alocação heap vs stack, ponteiros, ciclo de vida e garbage collection.',
    type: 'CONCEPT',
    category: 'Sistemas',
    language: 'C',
    difficulty: 4,
    xpReward: 200,
    estimatedMinutes: 45,
    position: { x: 680, y: 180 },
    status: 'AVAILABLE',
    mastery: 0,
    completedExercises: 0,
    exercises: [
      {
        id: 'pointer-arithmetic',
        slug: 'pointer-arithmetic',
        title: 'Aritmética de Ponteiros',
        summary: 'Navegue por buffers de memória sem memory leaks.',
        language: 'C',
        difficulty: 4,
        baseXp: 100,
        estimatedMinutes: 20,
      },
    ],
    prerequisites: [],
  },
  {
    id: 'concurrency-threads',
    slug: 'concurrency-threads',
    title: 'Concorrência e Threads',
    description: 'Processamento paralelo, race conditions, mutexes e canais assíncronos.',
    type: 'ARCHITECTURE',
    category: 'Sistemas',
    language: 'Go',
    difficulty: 5,
    xpReward: 240,
    estimatedMinutes: 50,
    position: { x: 680, y: 80 },
    status: 'NOT_STARTED',
    mastery: 0,
    completedExercises: 0,
    exercises: [],
    prerequisites: [
      {
        nodeId: 'memory-management',
        title: 'Gerenciamento de Memória',
        relation: 'REQUIRED',
        status: 'AVAILABLE',
        completed: false,
      },
    ],
  },

  // Sector 3: Algorithms (East)
  {
    id: 'trees-graphs',
    slug: 'trees-graphs',
    title: 'Grafos e Busca em Profundidade',
    description: 'Algoritmos de travessia em grafos: DFS, BFS e caminho mais curto com Dijkstra.',
    type: 'CONCEPT',
    category: 'Algoritmos',
    language: 'Python',
    difficulty: 4,
    xpReward: 180,
    estimatedMinutes: 40,
    position: { x: 1100, y: 380 },
    status: 'AVAILABLE',
    mastery: 0,
    completedExercises: 0,
    exercises: [
      {
        id: 'bfs-shortest-path',
        slug: 'bfs-shortest-path',
        title: 'Menor Caminho em Labirinto',
        summary: 'Implemente BFS para encontrar o trajeto ótimo em uma matriz.',
        language: 'Python',
        difficulty: 4,
        baseXp: 90,
        estimatedMinutes: 20,
      },
    ],
    prerequisites: [],
  },
  {
    id: 'dynamic-programming',
    slug: 'dynamic-programming',
    title: 'Programação Dinâmica',
    description: 'Memoização, subproblemas ótimos e algoritmos de tabulação.',
    type: 'CHALLENGE',
    category: 'Algoritmos',
    language: 'Python',
    difficulty: 5,
    xpReward: 260,
    estimatedMinutes: 60,
    position: { x: 1280, y: 380 },
    status: 'NOT_STARTED',
    mastery: 0,
    completedExercises: 0,
    exercises: [],
    prerequisites: [
      {
        nodeId: 'trees-graphs',
        title: 'Grafos e Busca em Profundidade',
        relation: 'REQUIRED',
        status: 'AVAILABLE',
        completed: false,
      },
    ],
  },

  // Sector 4: Backend (South)
  {
    id: 'relational-db',
    slug: 'relational-db',
    title: 'Modelagem Relacional e SQL',
    description: 'Schemas relacionais, índices B-Tree, transações ACID e otimização de queries.',
    type: 'DATABASE',
    category: 'Backend',
    language: 'SQL',
    difficulty: 3,
    xpReward: 150,
    estimatedMinutes: 30,
    position: { x: 680, y: 620 },
    status: 'COMPLETED',
    mastery: 90,
    completedExercises: 1,
    exercises: [
      {
        id: 'sql-joins-indexes',
        slug: 'sql-joins-indexes',
        title: 'JOINs Complexos e Índices',
        summary: 'Escreva consultas performáticas com índices compostos.',
        language: 'SQL',
        difficulty: 3,
        baseXp: 75,
        estimatedMinutes: 15,
      },
    ],
    prerequisites: [],
  },
  {
    id: 'api-architecture',
    slug: 'api-architecture',
    title: 'Design de APIs Resilientes',
    description: 'Autenticação JWT, rate limiting, idempotência e observabilidade com telemetria.',
    type: 'ARCHITECTURE',
    category: 'Backend',
    language: 'TS',
    difficulty: 4,
    xpReward: 210,
    estimatedMinutes: 45,
    position: { x: 680, y: 720 },
    status: 'IN_PROGRESS',
    mastery: 40,
    completedExercises: 1,
    exercises: [
      {
        id: 'jwt-auth-middleware',
        slug: 'jwt-auth-middleware',
        title: 'Middleware de Autenticação e RBAC',
        summary: 'Proteja rotas sensíveis com validação de tokens JWT.',
        language: 'TS',
        difficulty: 4,
        baseXp: 105,
        estimatedMinutes: 22,
      },
    ],
    prerequisites: [
      {
        nodeId: 'relational-db',
        title: 'Modelagem Relacional e SQL',
        relation: 'REQUIRED',
        status: 'COMPLETED',
        completed: true,
      },
    ],
  },
];

const DEMO_PATHS: LearningPathSummary[] = [
  {
    id: 'path-frontend',
    slug: 'frontend',
    title: 'Frontend Moderno',
    description: 'Trilha completa de desenvolvimento client-side com React e TypeScript.',
    accentColor: '#38bdf8',
    estimatedMinutes: 180,
    featured: true,
    nodeIds: ['html-css', 'react-basics', 'react-state'],
    completedNodes: 1,
    totalNodes: 3,
    progressPercent: 33,
    nextRecommendedNodeId: 'react-basics',
  },
  {
    id: 'path-systems',
    slug: 'systems',
    title: 'Sistemas e Baixo Nível',
    description: 'Arquitetura de computadores, concorrência e programação de sistemas.',
    accentColor: '#a855f7',
    estimatedMinutes: 240,
    featured: false,
    nodeIds: ['memory-management', 'concurrency-threads'],
    completedNodes: 0,
    totalNodes: 2,
    progressPercent: 0,
    nextRecommendedNodeId: 'memory-management',
  },
  {
    id: 'path-algorithms',
    slug: 'algorithms',
    title: 'Estruturas de Dados e Algoritmos',
    description: 'Resolução de problemas computacionais complexos e grafos.',
    accentColor: '#22c55e',
    estimatedMinutes: 220,
    featured: false,
    nodeIds: ['trees-graphs', 'dynamic-programming'],
    completedNodes: 0,
    totalNodes: 2,
    progressPercent: 0,
    nextRecommendedNodeId: 'trees-graphs',
  },
  {
    id: 'path-backend',
    slug: 'backend',
    title: 'Backend e Banco de Dados',
    description: 'Arquitetura de microsserviços, modelagem de dados e APIs escaláveis.',
    accentColor: '#f59e0b',
    estimatedMinutes: 200,
    featured: false,
    nodeIds: ['relational-db', 'api-architecture'],
    completedNodes: 1,
    totalNodes: 2,
    progressPercent: 50,
    nextRecommendedNodeId: 'api-architecture',
  },
];

const DEMO_EDGES: KnowledgeMapEdge[] = [
  {
    id: 'edge-1',
    sourceNodeId: 'html-css',
    targetNodeId: 'react-basics',
    relation: 'REQUIRED',
  },
  {
    id: 'edge-2',
    sourceNodeId: 'react-basics',
    targetNodeId: 'react-state',
    relation: 'REQUIRED',
  },
  {
    id: 'edge-3',
    sourceNodeId: 'memory-management',
    targetNodeId: 'concurrency-threads',
    relation: 'REQUIRED',
  },
  {
    id: 'edge-4',
    sourceNodeId: 'trees-graphs',
    targetNodeId: 'dynamic-programming',
    relation: 'REQUIRED',
  },
  {
    id: 'edge-5',
    sourceNodeId: 'relational-db',
    targetNodeId: 'api-architecture',
    relation: 'REQUIRED',
  },
];

export default function DemoMapPage() {
  const [selectedPathId, setSelectedPathId] = useState('path-frontend');
  const [selectedNodeId, setSelectedNodeId] = useState('react-basics');

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-dd-bg text-dd-text">
      {/* Demo Header */}
      <header className="absolute inset-x-0 top-0 z-[70] flex items-center justify-between border-b border-dd-border/80 bg-dd-card/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="dd-focus-ring flex h-8 w-8 items-center justify-center rounded-xl border border-dd-border bg-dd-surface text-dd-muted transition hover:text-dd-text"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                Modo Preview Local (Zero Config)
              </span>
            </div>
            <h1 className="text-sm font-black text-dd-text">
              Mapa de Aprendizado Interativo · Stacklyst
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-dd-border bg-dd-surface/80 px-3 py-1.5 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-dd-muted">Instruções</p>
            <p className="text-xs font-semibold text-dd-text">
              Arraste com o mouse, use o scroll para zoom e clique nos nós
            </p>
          </div>
        </div>
      </header>

      {/* Main Interactive Canvas Area */}
      <main className="relative h-full w-full pt-16">
        <TrailMap
          nodes={DEMO_NODES}
          edges={DEMO_EDGES}
          paths={DEMO_PATHS}
          selectedNodeId={selectedNodeId}
          selectedPathId={selectedPathId}
          onSelectNode={setSelectedNodeId}
          onSelectPath={setSelectedPathId}
        />
      </main>
    </div>
  );
}
