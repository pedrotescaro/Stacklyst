import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { QuizWidget } from '../QuizWidget';
vi.mock('@/hooks/useSoundEffects', () => ({ useSoundEffects: () => ({ playSound: vi.fn() }) }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('uses the server verdict without receiving the answer before submission', async () => {
  const onAttemptSuccess = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        is_correct: true,
        correct_index: 1,
        xpResult: { newTotalXp: 15 },
      }),
    }))
  );
  render(
    <QuizWidget
      quiz={{ id: 'q', question: 'Question', options: ['First', 'Second'] }}
      postId="p"
      onAttemptSuccess={onAttemptSuccess}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Second/ }));
  expect(await screen.findByText('Excelente trabalho!')).toBeInTheDocument();
  expect(onAttemptSuccess).toHaveBeenCalledWith(1, true, { newTotalXp: 15 });
});
