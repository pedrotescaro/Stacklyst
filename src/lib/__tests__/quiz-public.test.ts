import { describe, expect, it } from 'vitest';
import { publicQuiz } from '../quiz-public';
describe('quiz answer disclosure', () => {
  const quiz = { id: 'q', question: 'Question', options: ['A', 'B'], correct_index: 1 };
  it('omits the answer when attempts are absent or empty', () => {
    expect(publicQuiz(quiz)).not.toHaveProperty('correct_index');
    expect(publicQuiz({ ...quiz, attempts: [] })).not.toHaveProperty('correct_index');
    expect(quiz.correct_index).toBe(1);
  });
  it('preserves review feedback after the viewer has attempted', () => {
    expect(publicQuiz({ ...quiz, attempts: [{ selected_index: 0 }] }).correct_index).toBe(1);
  });
});
