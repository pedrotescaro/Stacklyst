import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { JourneyOverview } from '../JourneyOverview';
import Link from 'next/link';

const props = {
  title: 'Python do zero',
  description: 'Da primeira instrução a um projeto com dados e testes.',
  completedLessons: 3,
  totalLessons: 13,
  completedExercises: 6,
  totalExercises: 26,
  units: [
    'Primeiros programas',
    'Decisões e repetições',
    'Código reutilizável',
    'Dados, testes e projeto',
  ],
  pathId: 'python',
  action: <Link href="/lesson/comparar">Começar: Comparar antes de decidir</Link>,
};

it('shows the actual exercise progress and keeps links to every unit and the next lesson', () => {
  render(<JourneyOverview {...props} />);
  expect(screen.getByRole('progressbar', { name: 'Exercícios concluídos' })).toHaveAttribute(
    'aria-valuenow',
    '6'
  );
  expect(screen.getByText('23%')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Dados, testes e projeto/ })).toHaveAttribute(
    'href',
    '#unit-python-3'
  );
  expect(screen.getByRole('link', { name: /Começar/ })).toHaveAttribute('href', '/lesson/comparar');
});
it('handles a course with no exercises without an invalid percentage', () => {
  render(
    <JourneyOverview
      {...props}
      completedExercises={0}
      totalExercises={0}
      units={[]}
      action={null}
    />
  );
  expect(screen.getByText('0%')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
});
