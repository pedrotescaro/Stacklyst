import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildTrailSections,
  getLevelsForSection,
  getUnitNumberInSection,
  TrailSectionNavigation,
} from '@/app/trails/TrailSectionNavigation';
import type { TrailLevel } from '@/lib/trailsData';

function createLevel(levelNumber: number, sectionNumber: number, questionId: string): TrailLevel {
  return {
    levelNumber,
    unitNumber: sectionNumber,
    unitTitle: `Conteúdo da seção ${sectionNumber}`,
    sectionName: sectionNumber === 1 ? 'Júnior - Iniciante' : 'Pleno - Intermediário',
    title: `Conteúdo ${levelNumber}`,
    description: `Descrição ${levelNumber}`,
    questions: [
      {
        id: questionId,
        question: 'Pergunta?',
        options: ['A', 'B'],
        correctIndex: 0,
      },
    ],
  };
}

const levels = [
  createLevel(1, 1, 'js-l1-q1'),
  createLevel(2, 1, 'js-l2-q1'),
  createLevel(3, 2, 'js-l3-q1'),
  createLevel(4, 2, 'js-l4-q1'),
  createLevel(5, 3, 'js-l5-q1'),
];

describe('TrailSectionNavigation', () => {
  it('converts the existing progression into sections and local units', () => {
    const sections = buildTrailSections(
      levels,
      {
        'js-l1-q1': true,
        'js-l2-q1': true,
        'js-u1-checkpoint': true,
      },
      'JS'
    );

    expect(sections).toHaveLength(3);
    expect(sections[0]).toMatchObject({
      number: 1,
      completedUnits: 2,
      completed: true,
      unlocked: true,
    });
    expect(sections[1]).toMatchObject({ number: 2, unlocked: true, completed: false });
    expect(sections[2]).toMatchObject({ number: 3, unlocked: false, completed: false });
    expect(getUnitNumberInSection(levels[3], levels)).toBe(2);
    expect(getLevelsForSection(levels, 2)).toEqual([levels[2], levels[3]]);
  });

  it('separates the active trail from the actionable sections page', () => {
    const onSelectSection = vi.fn();
    const onOpenSections = vi.fn();
    const onBack = vi.fn();
    const onRequestJump = vi.fn();
    const sections = buildTrailSections(levels, { 'js-u1-checkpoint': true }, 'JS');

    const { rerender } = render(
      <TrailSectionNavigation
        view="trail"
        sectionNumber={2}
        unitNumber={2}
        title="Closures e escopo"
        sections={sections}
        onOpenSections={onOpenSections}
        onBack={onBack}
        onSelectSection={onSelectSection}
        onRequestJump={onRequestJump}
      />
    );

    expect(screen.getByRole('heading', { name: 'Closures e escopo' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /seções/i }));
    expect(onOpenSections).toHaveBeenCalledOnce();
    expect(screen.queryByText('Seções e unidades')).not.toBeInTheDocument();

    rerender(
      <TrailSectionNavigation
        view="sections"
        sectionNumber={2}
        unitNumber={2}
        title="Closures e escopo"
        sections={sections}
        onOpenSections={onOpenSections}
        onBack={onBack}
        onSelectSection={onSelectSection}
        onRequestJump={onRequestJump}
      />
    );

    expect(screen.getByRole('heading', { name: 'Seções e unidades' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /seção \d/i })).toHaveLength(3);
    const jumpButton = screen.getByRole('button', { name: /pular para cá/i });
    expect(jumpButton).toBeEnabled();
    fireEvent.click(jumpButton);
    expect(onRequestJump).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));
    expect(onSelectSection).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
