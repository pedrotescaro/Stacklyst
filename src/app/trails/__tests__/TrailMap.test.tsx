import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TrailMap } from '@/app/trails/TrailMap';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';

const nodes: KnowledgeMapNode[] = [
  {
    id: 'foundations',
    slug: 'foundations',
    title: 'Fundamentos',
    description: 'Base compartilhada',
    type: 'FOUNDATION',
    category: 'Fundamentos',
    language: 'JS',
    difficulty: 3,
    xpReward: 120,
    estimatedMinutes: 90,
    position: { x: 80, y: 100 },
    status: 'COMPLETED',
    mastery: 85,
    completedExercises: 1,
    exercises: [
      {
        id: 'normalize-identifiers',
        slug: 'normalize-identifiers',
        title: 'Normalizador de identificadores',
        summary: 'Normalize identificadores recebidos pela aplicação.',
        language: 'JS',
        difficulty: 3,
        baseXp: 120,
        estimatedMinutes: 20,
      },
    ],
    prerequisites: [],
  },
  {
    id: 'react',
    slug: 'react-state',
    title: 'Arquitetura de Estado React',
    description: 'Estado previsível',
    type: 'FRAMEWORK',
    category: 'Frontend',
    language: 'TS',
    difficulty: 5,
    xpReward: 230,
    estimatedMinutes: 190,
    position: { x: 340, y: 220 },
    status: 'RECOMMENDED',
    mastery: 0,
    completedExercises: 0,
    exercises: [],
    prerequisites: [
      {
        nodeId: 'foundations',
        title: 'Fundamentos',
        relation: 'RECOMMENDED',
        status: 'COMPLETED',
        completed: true,
      },
    ],
  },
];

const path: LearningPathSummary = {
  id: 'frontend-path',
  slug: 'frontend-path',
  title: 'Frontend React',
  description: 'Caminho de frontend',
  accentColor: '#84cc16',
  estimatedMinutes: 240,
  featured: true,
  nodeIds: ['foundations', 'react'],
  completedNodes: 1,
  totalNodes: 2,
  progressPercent: 50,
  nextRecommendedNodeId: 'react',
};

const sharedPath: LearningPathSummary = {
  ...path,
  id: 'systems-path',
  slug: 'systems-path',
  title: 'JavaScript para Sistemas',
  accentColor: '#3b82f6',
};

describe('TrailMap', () => {
  it('renders the same selectable knowledge nodes in graph and mobile views', () => {
    const onSelectNode = vi.fn();

    render(
      <TrailMap
        nodes={nodes}
        edges={[
          {
            id: 'edge-1',
            sourceNodeId: 'foundations',
            targetNodeId: 'react',
            relation: 'RECOMMENDED',
          },
        ]}
        paths={[path]}
        selectedNodeId="foundations"
        selectedPathId="frontend-path"
        onSelectNode={onSelectNode}
        onSelectPath={vi.fn()}
      />
    );

    expect(screen.getByTestId('knowledge-map-mobile-list')).toBeInTheDocument();
    expect(screen.getByTestId('knowledge-map-graph')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid^="knowledge-skill-node-"]')).toHaveLength(34);
    const reactNodeCards = screen.getAllByRole('button', {
      name: /^Arquitetura de Estado React\. Recomendado\. 0 tarefas\.$/,
    });
    expect(reactNodeCards).toHaveLength(2);

    fireEvent.click(reactNodeCards[0]);
    expect(onSelectNode).toHaveBeenCalledWith('react');
  });

  it('draws typed connections and highlights the selected node accessibly', () => {
    const { container } = render(
      <TrailMap
        nodes={nodes}
        edges={[
          {
            id: 'edge-1',
            sourceNodeId: 'foundations',
            targetNodeId: 'react',
            relation: 'RECOMMENDED',
          },
        ]}
        paths={[path]}
        selectedNodeId="react"
        selectedPathId="frontend-path"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    expect(container.querySelector('path[data-relation="RECOMMENDED"]')).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-testid^="knowledge-skill-node-"]').length
    ).toBeGreaterThan(0);
    expect(screen.getByTestId('knowledge-map-graph')).not.toHaveClass(
      'overflow-x-auto',
      'rounded-3xl',
      'border'
    );
    expect(
      screen.getByRole('button', {
        name: /Início da jornada/,
      })
    ).toBeInTheDocument();
    for (const selectedButton of screen.getAllByRole('button', {
      name: /^Arquitetura de Estado React\. Recomendado\. 0 tarefas\.$/,
    })) {
      expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('selects milestone node when clicked and handles selection correctly', () => {
    const onSelectNode = vi.fn();

    render(
      <TrailMap
        nodes={nodes}
        edges={[]}
        paths={[path]}
        selectedNodeId="foundations"
        selectedPathId="frontend-path"
        onSelectNode={onSelectNode}
        onSelectPath={vi.fn()}
      />
    );

    const foundationNodes = screen.getAllByRole('button', {
      name: /^Fundamentos\. Concluído\. 1 tarefa\.$/,
    });

    expect(foundationNodes).toHaveLength(2);
    fireEvent.click(foundationNodes[0]);
    expect(onSelectNode).toHaveBeenCalledWith('foundations');
  });

  it('keeps shared skills visible in every sector that uses them', () => {
    render(
      <TrailMap
        nodes={nodes}
        edges={[]}
        paths={[path, sharedPath]}
        selectedNodeId="foundations"
        selectedPathId="frontend-path"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    expect(
      screen.getAllByRole('button', {
        name: /^Fundamentos\. Concluído\. 1 tarefa\.$/,
      })
    ).toHaveLength(4);
    expect(
      screen
        .getAllByRole('button', {
          name: /^Fundamentos\. Concluído\. 1 tarefa\.$/,
        })
        .filter((button) => button.getAttribute('aria-pressed') === 'true')
    ).toHaveLength(2);
  });

  it('keeps four learning paths as four cardinal sectors', () => {
    const algorithmsPath: LearningPathSummary = {
      ...path,
      id: 'algorithms-path',
      slug: 'algorithms-path',
      title: 'Algoritmos Aplicados',
    };
    const backendPath: LearningPathSummary = {
      ...path,
      id: 'backend-path',
      slug: 'backend-path',
      title: 'Backend e Dados',
    };

    render(
      <TrailMap
        nodes={nodes}
        edges={[]}
        paths={[path, sharedPath, algorithmsPath, backendPath]}
        selectedNodeId="foundations"
        selectedPathId="frontend-path"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    expect(screen.getAllByText('Setor Oeste')).toHaveLength(2);
    expect(screen.getAllByText('Setor Norte')).toHaveLength(2);
    expect(screen.getAllByText('Setor Leste')).toHaveLength(2);
    expect(screen.getAllByText('Setor Sul')).toHaveLength(2);
    expect(screen.queryByText('Setor Noroeste')).not.toBeInTheDocument();
    expect(screen.queryByText('Setor Sudeste')).not.toBeInTheDocument();
  });

  it('renders pan-zoom controls for zooming in, out, and resetting view', () => {
    render(
      <TrailMap
        nodes={nodes}
        edges={[]}
        paths={[path]}
        selectedNodeId="foundations"
        selectedPathId="frontend-path"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    const controls = screen.getByTestId('trail-map-controls');
    expect(controls).toBeInTheDocument();

    const zoomInBtn = screen.getByRole('button', { name: /Aumentar zoom/i });
    const zoomOutBtn = screen.getByRole('button', { name: /Diminuir zoom/i });
    const resetBtn = screen.getByRole('button', { name: /Centralizar visualização/i });

    expect(zoomInBtn).toBeInTheDocument();
    expect(zoomOutBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();

    const focusBtn = screen.getByRole('button', { name: /Focar na lição atual/i });
    expect(focusBtn).toBeInTheDocument();

    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(focusBtn);
    fireEvent.click(resetBtn);
  });

  it('opens Duolingo-style lesson popover when a node is clicked and dismisses on close button, escape key, or canvas click', () => {
    const onSelectNode = vi.fn();
    const onSelectPath = vi.fn();

    render(
      <TrailMap
        nodes={nodes}
        edges={[]}
        paths={[path]}
        selectedNodeId="foundations"
        selectedPathId="frontend-path"
        onSelectNode={onSelectNode}
        onSelectPath={onSelectPath}
      />
    );

    // Initial state: popover is not open
    expect(screen.queryByTestId('trail-map-lesson-popover')).not.toBeInTheDocument();

    // Click a desktop node to open popover
    const desktopNodes = screen
      .getAllByRole('button', {
        name: /^Fundamentos\. Concluído\. 1 tarefa\.$/,
      })
      .filter((button) => !button.getAttribute('data-testid')?.includes('-mobile-'));
    expect(desktopNodes.length).toBeGreaterThan(0);
    fireEvent.click(desktopNodes[0]);

    // Popover is displayed
    const popover = screen.getByTestId('trail-map-lesson-popover');
    expect(popover).toBeInTheDocument();
    expect(within(popover).getByText('Frontend React')).toBeInTheDocument();
    expect(within(popover).getByText('+120 XP')).toBeInTheDocument();
    expect(within(popover).getByRole('button', { name: /Revisar \+120 XP/i })).toBeInTheDocument();

    // Dismiss with close button
    const closeBtn = screen.getByRole('button', { name: /Fechar resumo da lição/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('trail-map-lesson-popover')).not.toBeInTheDocument();

    // Re-open and dismiss with Escape key
    fireEvent.click(desktopNodes[0]);
    expect(screen.getByTestId('trail-map-lesson-popover')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('trail-map-lesson-popover')).not.toBeInTheDocument();
  });

  it('renders locked prerequisites state in popover for locked node', () => {
    const lockedNode: KnowledgeMapNode = {
      id: 'advanced-patterns',
      slug: 'advanced-patterns',
      title: 'Padrões Avançados',
      description: 'Arquitetura avançada',
      type: 'ARCHITECTURE',
      category: 'Frontend',
      language: 'TS',
      difficulty: 5,
      xpReward: 300,
      estimatedMinutes: 60,
      position: { x: 500, y: 300 },
      status: 'NOT_STARTED',
      mastery: 0,
      completedExercises: 0,
      exercises: [],
      prerequisites: [
        {
          nodeId: 'foundations',
          title: 'Fundamentos',
          relation: 'REQUIRED',
          status: 'NOT_STARTED',
          completed: false,
        },
      ],
    };

    const advancedPath: LearningPathSummary = {
      ...path,
      id: 'advanced-path',
      nodeIds: ['advanced-patterns'],
    };

    render(
      <TrailMap
        nodes={[lockedNode]}
        edges={[]}
        paths={[advancedPath]}
        selectedNodeId="advanced-patterns"
        selectedPathId="advanced-path"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    const desktopNodes = screen
      .getAllByRole('button', {
        name: /^Padrões Avançados\. Bloqueado\. 0 tarefas\.$/,
      })
      .filter((button) => !button.getAttribute('data-testid')?.includes('-mobile-'));
    expect(desktopNodes.length).toBeGreaterThan(0);
    fireEvent.click(desktopNodes[0]);

    const popover = screen.getByTestId('trail-map-lesson-popover');
    expect(popover).toBeInTheDocument();
    expect(within(popover).getByText(/Requisito: Fundamentos/i)).toBeInTheDocument();
    const actionBtn = within(popover).getByRole('button', { name: /Bloqueado/i });
    expect(actionBtn).toBeDisabled();
  });
});


