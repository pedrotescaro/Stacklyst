import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonClient } from '@/app/lesson/[lessonId]/LessonClient';
import type { Lesson } from '@/lib/lessons/types';

const { pushMock, playSoundMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  playSoundMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({ playSound: playSoundMock }),
}));

const lesson: Lesson = {
  id: 'js-frontend-react-s1-u1',
  title: 'JavaScript no navegador',
  description: 'Primeira unidade do rumo Frontend React.',
  language: 'JS',
  unitNumber: 1,
  levelNumber: 1,
  xpReward: 20,
  difficulty: 'iniciante',
  estimatedTime: '2 min',
  steps: [
    {
      id: 'js-frontend-react-s1-u1-s1',
      type: 'concept_explanation',
      title: 'JavaScript no navegador',
      conceptText: 'Entenda o runtime da interface.',
      xp: 20,
    },
  ],
};

describe('LessonClient trail progress', () => {
  beforeEach(() => {
    pushMock.mockClear();
    playSoundMock.mockClear();
    localStorage.clear();
  });

  it('persists a concept activity and returns to the exact trail context', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <LessonClient
        lesson={lesson}
        returnTo="/trails?view=trail&path=frontend-react&section=1&language=JS"
        user={{ id: 'user-1', username: 'Pedro', total_xp: 0, streak: 0 }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Entendi, Continuar' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Lição Concluída!' })).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/quiz/js-frontend-react-s1-u1-s1/attempt',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ selected_index: 0 }),
      })
    );
    expect(JSON.parse(localStorage.getItem('stacklyst-completed-lessons') ?? '[]')).toEqual([
      lesson.id,
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a Trilha' }));
    expect(pushMock).toHaveBeenCalledWith(
      '/trails?view=trail&path=frontend-react&section=1&language=JS'
    );
  });
});
