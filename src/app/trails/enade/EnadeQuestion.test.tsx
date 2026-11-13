import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { QuestionPresentation } from '@/lib/enade/feedback';
import { EnadeQuestion } from './EnadeQuestion';

function question(overrides: Partial<QuestionPresentation> = {}) {
  const options = ['A', 'B', 'C'].map((canonical) => ({
    canonical,
    letter: canonical,
    text: `Alternativa ${canonical}`,
    code: false,
    image: undefined,
    selected: false,
    disabled: false,
    correction: undefined,
  }));
  return {
    id: 'q-1',
    number: 1,
    year: 2023,
    kind: 'objective',
    section: 'specific',
    marked: false,
    annulled: false,
    readOnly: false,
    reveal: false,
    content: { images: [], statement: 'Qual consulta?', transcript: '' },
    options,
    ...overrides,
  } as unknown as QuestionPresentation;
}

const renderQuestion = (q: QuestionPresentation, onAnswer = vi.fn()) =>
  render(
    <EnadeQuestion
      question={q}
      index={0}
      total={10}
      onAnswer={onAnswer}
      onMark={vi.fn()}
      onCheckDiscursive={vi.fn()}
    />
  );

const card = (letter: string) =>
  screen.getByLabelText(new RegExp(`^${letter} Alternativa`)).parentElement!;

describe('EnadeQuestion struck alternatives', () => {
  beforeEach(() => sessionStorage.clear());

  it('strikes and restores an alternative with a right-click', () => {
    renderQuestion(question());
    fireEvent.contextMenu(card('B'));
    expect(card('B')).toHaveAttribute('data-struck', 'true');
    expect(screen.getByRole('button', { name: 'Desfazer risco da alternativa B' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.contextMenu(card('B'));
    expect(card('B')).toHaveAttribute('data-struck', 'false');
  });

  it('offers a button for keyboard and touch, and remembers strikes for the session', () => {
    const { unmount } = renderQuestion(question());
    fireEvent.click(screen.getByRole('button', { name: 'Riscar alternativa C' }));
    expect(card('C')).toHaveAttribute('data-struck', 'true');
    unmount();
    renderQuestion(question());
    expect(card('C')).toHaveAttribute('data-struck', 'true');
  });

  it('un-strikes an alternative when it is chosen', () => {
    const onAnswer = vi.fn();
    renderQuestion(question(), onAnswer);
    fireEvent.contextMenu(card('A'));
    fireEvent.click(screen.getByLabelText(/^A Alternativa/));
    expect(onAnswer).toHaveBeenCalledWith('q-1', 'A');
    expect(card('A')).toHaveAttribute('data-struck', 'false');
  });

  it('keeps the browser menu once the question is locked', () => {
    renderQuestion(question({ readOnly: true }));
    const event = fireEvent.contextMenu(card('A'));
    expect(event).toBe(true);
    expect(card('A')).toHaveAttribute('data-struck', 'false');
    expect(screen.queryByRole('button', { name: /Riscar alternativa/ })).toBeNull();
  });
});
