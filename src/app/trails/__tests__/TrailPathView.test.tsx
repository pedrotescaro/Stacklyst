import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrailPathView } from '@/app/trails/TrailPathView';
import type { KnowledgeMapNode, LearningPathSummary } from '@/lib/learning/types';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

function createNode(id: string, overrides: Partial<KnowledgeMapNode> = {}): KnowledgeMapNode {
  return {
    id,
    slug: id,
    title: id,
    description: `Descrição de ${id}`,
    type: 'CONCEPT',
    category: 'Fundamentos',
    language: 'JS',
    difficulty: 2,
    xpReward: 80,
    estimatedMinutes: 30,
    position: { x: 0, y: 0 },
    status: 'AVAILABLE',
    mastery: 0,
    completedExercises: 0,
    exercises: [
      {
        id: `${id}-exercise`,
        slug: `${id}-exercise`,
        title: `Prática de ${id}`,
        summary: `Pratique ${id}`,
        language: 'JS',
        difficulty: 2,
        baseXp: 80,
        estimatedMinutes: 15,
      },
    ],
    prerequisites: [],
    ...overrides,
  };
}

function createPath(id: string, title: string, nodeIds: string[]): LearningPathSummary {
  return {
    id,
    slug: id,
    title,
    description: `Caminho ${title}`,
    accentColor: '#3b82f6',
    estimatedMinutes: 120,
    featured: id === 'frontend',
    nodeIds,
    completedNodes: 0,
    totalNodes: nodeIds.length,
    progressPercent: 0,
    nextRecommendedNodeId: nodeIds[0] ?? null,
  };
}

const nodes = [
  createNode('Fundamentos'),
  createNode('React'),
  createNode('Sistemas'),
  createNode('Algoritmos'),
  createNode('Backend'),
];

const paths = [
  createPath('frontend', 'Frontend React', ['Fundamentos', 'React']),
  createPath('systems', 'JavaScript para Sistemas', ['Fundamentos', 'Sistemas']),
  createPath('algorithms', 'Algoritmos Aplicados', ['Algoritmos']),
  createPath('backend', 'Backend e Dados', ['Backend']),
];

describe('TrailPathView', () => {
  beforeEach(() => {
    pushMock.mockClear();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('restores the long section-and-unit trail without a connector line', () => {
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    const trail = screen.getByTestId('trail-path-map');
    expect(screen.getByTestId('trail-section-sticky-header')).toHaveClass('top-0', 'md:top-2');
    expect(screen.getByText('Seção 1, Unidade 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'JavaScript no navegador' })).toBeInTheDocument();
    expect(screen.getByText('Base da interface')).toBeInTheDocument();
    expect(trail.querySelectorAll('[id^="trail-level-"]')).toHaveLength(32);
    expect(screen.getAllByRole('button', { name: /Baú da trilha/ })).toHaveLength(8);
    expect(screen.getAllByTestId('trail-robot')).toHaveLength(8);
    expect(screen.getAllByTestId('trail-robot-gaming')).toHaveLength(8);
    expect(screen.getByTestId('trail-moving-mascot')).toBeInTheDocument();
    expect(trail.querySelectorAll('[data-trail-mascot-node]')).toHaveLength(32);
    for (const robot of screen.getAllByTestId('trail-robot')) {
      expect(robot).not.toHaveClass('hidden');
      expect(robot).toHaveClass('right-0', 'h-[92px]', 'w-[92px]', 'sm:h-28', 'sm:w-28');
    }
    for (const robot of screen.getAllByTestId('trail-robot-gaming')) {
      expect(robot).not.toHaveClass('hidden');
      expect(robot).toHaveClass('left-0', 'top-[37%]', 'md:-left-8', 'lg:-left-12');
    }
    expect(screen.getAllByTestId('trail-book-icon').length).toBeGreaterThan(0);
    expect(screen.queryByText(/^\{[1-8]\}$/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Pular para a seção/ })).toHaveLength(7);
    for (const node of screen.getAllByTestId('trail-main-node')) {
      expect(node).toHaveClass('rounded-full');
      expect(node).not.toHaveClass('ring-2', 'ring-white/80');
    }
    for (const checkpoint of screen.getAllByRole('button', { name: /Checkpoint da seção/ })) {
      expect(checkpoint).toHaveClass('rounded-full');
    }
    expect(trail.querySelector('svg.pointer-events-none.absolute.inset-0')).not.toBeInTheDocument();
    expect(screen.queryByText(/Duolingo/i)).not.toBeInTheDocument();
  });

  it('changes the active route from the sections menu and keeps 32 activities per route', () => {
    const onSelectPath = vi.fn();
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={onSelectPath}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Seções/i }));
    expect(screen.getByRole('heading', { name: 'Seções e unidades' })).toBeInTheDocument();
    expect(screen.getAllByText(/\/32 atividades/)).toHaveLength(4);
    expect(
      screen.getByRole('heading', { name: 'Seção 2 · Componentes e composição' })
    ).toBeInTheDocument();
    expect(screen.getByText('Props como contrato')).toBeInTheDocument();
    expect(screen.getByText('Estado otimista')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /JavaScript para Sistemas/ }));
    expect(onSelectPath).toHaveBeenCalledWith('systems');
  });

  it('opens an available unit and keeps required prerequisites locked', () => {
    const onSelectNode = vi.fn();
    const onSelectPath = vi.fn();
    const onSelectExercise = vi.fn();
    const locked = createNode('Bloqueado', {
      status: 'NOT_STARTED',
      prerequisites: [
        {
          nodeId: 'required',
          title: 'Base obrigatória',
          relation: 'REQUIRED',
          status: 'AVAILABLE',
          completed: false,
        },
      ],
    });
    const route = createPath('javascript-systems', 'JavaScript para Sistemas', [
      'Fundamentos',
      locked.id,
    ]);

    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={[nodes[0]!, locked]}
        paths={[route]}
        selectedNodeId="Fundamentos"
        selectedPathId="javascript-systems"
        onSelectNode={onSelectNode}
        onSelectPath={onSelectPath}
        onSelectExercise={onSelectExercise}
      />
    );

    const firstUnit = screen.getByRole('button', {
      name: /Seção 1, unidade 1: Conceito: Valores e coerção/,
    });
    fireEvent.click(firstUnit);
    expect(onSelectPath).toHaveBeenCalledWith('javascript-systems');
    expect(onSelectNode).toHaveBeenCalledWith('Fundamentos');
    expect(onSelectExercise).not.toHaveBeenCalled();
    const activityPopup = screen.getByTestId('trail-activity-popup');
    expect(activityPopup).toHaveTextContent('Valores e coerção');
    expect(activityPopup).toHaveStyle({
      backgroundColor: '#1d4ed8',
    });
    expect(firstUnit.closest('[id^="trail-level-"]')).toHaveClass('z-20');
    expect(firstUnit.closest('[id^="trail-level-"]')).not.toHaveClass('z-40');

    fireEvent.click(screen.getByRole('button', { name: 'Praticar +80 XP' }));
    expect(onSelectExercise).toHaveBeenCalledWith(
      'js-javascript-systems-s1-u1',
      '/trails?view=trail&path=javascript-systems&section=1&language=JS'
    );
    expect(
      JSON.parse(sessionStorage.getItem('stacklyst-trail-mascot-pending') ?? '{}')
    ).toMatchObject({
      progressKey: 'js:javascript-systems',
      fromNodeKey: 'js-javascript-systems-s1-u1',
    });

    const lockedUnit = screen.getByRole('button', {
      name: /Seção 5, unidade 1: Conceito: Promises compostas/,
    });
    expect(lockedUnit).toBeDisabled();
  });

  it('uses the current section color in activity popups', () => {
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
        onSelectExercise={vi.fn()}
        jumpUnlockIds={['trail-jump-js-frontend-s3']}
      />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Seção 3, unidade 1: Conceito: Listas e chaves estáveis/,
      })
    );

    expect(screen.getByTestId('trail-activity-popup')).toHaveStyle({
      backgroundColor: '#047857',
    });
  });

  it('shows earned stars for lessons completed on the server', () => {
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
        completedLessonIds={['js-frontend-s1-u1']}
      />
    );

    expect(screen.getAllByLabelText('3 de 3 estrelas conquistadas')).toHaveLength(1);
    expect(screen.getAllByLabelText('0 de 3 estrelas conquistadas')).toHaveLength(87);
  });

  it('keeps the first node colored and uses progress for the remaining lessons', () => {
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
        completedLessonIds={['js-frontend-s1-u2']}
      />
    );

    const firstUnit = screen.getByRole('button', {
      name: /Seção 1, unidade 1:/,
    });
    const completedSecondUnit = screen.getByRole('button', {
      name: /Seção 1, unidade 2:/,
    });
    const incompleteBlueUnit = screen.getByRole('button', {
      name: /Seção 1, unidade 3:/,
    });
    const purpleJumpTarget = screen.getByRole('button', {
      name: /Seção 2, unidade 1:/,
    });
    const incompletePurpleUnit = screen.getByRole('button', {
      name: /Seção 2, unidade 2:/,
    });

    expect(firstUnit).toHaveAttribute('data-progress-appearance', 'section');
    expect(firstUnit).toHaveClass('bg-blue-500');
    expect(completedSecondUnit).toHaveAttribute('data-progress-appearance', 'section');
    expect(completedSecondUnit).toHaveClass('bg-blue-500');
    expect(incompleteBlueUnit).toHaveAttribute('data-progress-appearance', 'incomplete');
    expect(incompleteBlueUnit).toHaveClass('bg-[#37464f]');
    expect(purpleJumpTarget).toHaveAttribute('data-progress-appearance', 'section');
    expect(purpleJumpTarget).toHaveClass('bg-purple-500');
    expect(incompletePurpleUnit).toHaveAttribute('data-progress-appearance', 'incomplete');
    expect(incompletePurpleUnit).toHaveClass('bg-[#37464f]');

    const unclaimedChest = screen.getAllByRole('button', { name: /Baú da trilha/ })[0]!;
    expect(unclaimedChest.querySelector('img')).toHaveAttribute(
      'data-progress-appearance',
      'incomplete'
    );
    expect(unclaimedChest.querySelector('img')).toHaveStyle({
      filter: 'grayscale(1) saturate(0) brightness(0.72)',
    });
  });

  it('gives intermediate activities full-size nodes, stars, and their own hover popup', () => {
    const onSelectExercise = vi.fn();
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
        onSelectExercise={onSelectExercise}
      />
    );

    const intermediateNodes = screen.getAllByTestId('trail-intermediate-node');
    expect(intermediateNodes).toHaveLength(48);
    expect(screen.getAllByTestId('trail-code-icon')).toHaveLength(48);

    const firstIntermediateNode = intermediateNodes[0]!;
    expect(firstIntermediateNode).toHaveClass('h-[76px]', 'w-[76px]', 'rounded-full');
    expect(
      firstIntermediateNode.parentElement?.querySelector('[data-testid="trail-lesson-stars"]')
    ).toBeInTheDocument();

    fireEvent.mouseEnter(firstIntermediateNode.parentElement!);
    expect(screen.getByTestId('trail-activity-popup')).toHaveTextContent(
      'Código: JavaScript no navegador · 1'
    );
    expect(screen.getByTestId('trail-activity-popup')).toHaveTextContent(
      'desafio de programação exclusivo'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Praticar +35 XP' }));
    expect(onSelectExercise).toHaveBeenCalledWith(
      'js-frontend-s1-u1-code-1',
      '/trails?view=trail&path=frontend&section=1&language=JS'
    );

    fireEvent.mouseLeave(firstIntermediateNode.parentElement!);
    expect(screen.queryByTestId('trail-activity-popup')).not.toBeInTheDocument();
  });

  it('tracks every code node completion independently', () => {
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
        completedLessonIds={['js-frontend-s1-u1-code-1']}
      />
    );

    const intermediateNodes = screen.getAllByTestId('trail-intermediate-node');
    expect(intermediateNodes[0]).toHaveAttribute('data-progress-appearance', 'section');
    expect(intermediateNodes[0]).toHaveClass('bg-blue-500');
    expect(intermediateNodes[1]).toHaveAttribute('data-progress-appearance', 'incomplete');
    expect(intermediateNodes[1]).toHaveClass('bg-[#37464f]');
    expect(
      intermediateNodes[0]?.parentElement?.querySelector(
        '[aria-label="3 de 3 estrelas conquistadas"]'
      )
    ).toBeInTheDocument();
    expect(
      intermediateNodes[1]?.parentElement?.querySelector(
        '[aria-label="0 de 3 estrelas conquistadas"]'
      )
    ).toBeInTheDocument();
  });

  it('turns the start bubble into a hard-mode section jump challenge', () => {
    render(
      <TrailPathView
        activeLanguage="JS"
        nodes={nodes}
        paths={paths}
        selectedNodeId="Fundamentos"
        selectedPathId="frontend"
        onSelectNode={vi.fn()}
        onSelectPath={vi.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Pular para a seção 3: Renderização de coleções',
      })
    );

    const jumpDialog = screen.getByRole('dialog');
    expect(screen.getByRole('heading', { name: 'Pular para a Seção 3?' })).toBeInTheDocument();
    expect(jumpDialog).toHaveStyle({ backgroundColor: '#047857' });
    expect(screen.getByText('Listas e chaves estáveis')).toBeInTheDocument();
    expect(screen.getByText(/modo Difícil/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Fazer desafio de entrada/i }));

    expect(pushMock).toHaveBeenCalledWith(
      '/lesson/Fundamentos-exercise?challenge=jump&path=frontend&section=3&language=JS'
    );
  });
});
