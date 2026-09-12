import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonClient } from '@/app/lesson/[lessonId]/LessonClient';
import type { Lesson } from '@/lib/lessons/types';

const { pushMock, playSoundMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  playSoundMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
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
    sessionStorage.clear();
  });

  it('persists a concept activity and returns to the exact trail context', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isCorrect: true,
        xpEarned: 0,
        lessonCompleted: true,
        message: 'Resposta validada.',
      }),
    });
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
      '/api/lessons/js-frontend-react-s1-u1/attempt',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      })
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      stepId: lesson.steps[0].id,
      action: 'submit',
    });
    expect(localStorage.getItem('stacklyst-completed-lessons')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a Trilha' }));
    expect(pushMock).toHaveBeenCalledWith(
      '/trails?view=trail&path=frontend-react&section=1&language=JS'
    );
    expect(
      JSON.parse(sessionStorage.getItem('stacklyst-trail-mascot-pending') ?? '{}')
    ).toMatchObject({
      progressKey: 'js:frontend-react',
      fromNodeKey: lesson.id,
    });
  });

  it('advances from concept step to question step without showing feedback banner', async () => {
    const multiStepLesson: Lesson = {
      id: 'learn-java-first-output',
      title: 'Seu primeiro programa Java',
      description: 'Saída no terminal com Java.',
      language: 'JAVA',
      unitNumber: 1,
      levelNumber: 1,
      xpReward: 30,
      difficulty: 'iniciante',
      estimatedTime: '2 min',
      steps: [
        {
          id: 'step-concept',
          type: 'concept_explanation',
          title: 'Aprenda o conceito',
          conceptText: 'Um programa é uma sequência de instruções.',
          xp: 0,
        },
        {
          id: 'step-question',
          type: 'output_prediction',
          title: 'Preveja a saída',
          instruction: 'Qual é a saída exata deste programa?',
          codeSnippet: 'System.out.println("Olá!");',
          options: ['Olá!', 'Nenhuma saída', 'Erro de sintaxe', 'O texto do próprio código'],
          correctOptionIndex: 0,
          xp: 15,
        },
      ],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isCorrect: true,
        xpEarned: 0,
        lessonCompleted: false,
        message: 'Resposta validada.',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <LessonClient
        lesson={multiStepLesson}
        user={{ id: 'user-1', username: 'Pedro', total_xp: 0, streak: 0 }}
      />
    );

    expect(screen.getByRole('button', { name: 'Entendi, Continuar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Entendi, Continuar' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Preveja a saída:' })).toBeInTheDocument();
    });

    // The question step should NOT display the quiz success feedback banner
    expect(screen.queryByText('Mandou muito bem!')).toBeNull();
    expect(screen.queryByText('Resposta validada.')).toBeNull();

    // The footer should have the "Verificar" button (disabled because no option selected yet)
    const verifyButton = screen.getByRole('button', { name: 'Verificar' });
    expect(verifyButton).toBeInTheDocument();
    expect(verifyButton).toBeDisabled();

    // User can select an option and then verify
    const firstOption = screen.getByRole('button', { name: /Olá!/ });
    expect(firstOption).not.toBeDisabled();
    fireEvent.click(firstOption);

    expect(verifyButton).not.toBeDisabled();
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Mandou muito bem!')).toBeInTheDocument();
    });
  });
});
