import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    await userEvent.click(firstOption);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Verificar' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));

    await waitFor(() => {
      expect(screen.getByText('Mandou muito bem!')).toBeInTheDocument();
    });
  });
});

describe('LessonClient learner support', () => {
  const choiceLesson: Lesson = {
    id: 'learn-js-const',
    title: 'Constantes',
    description: 'const e let.',
    language: 'JS',
    unitNumber: 1,
    levelNumber: 1,
    xpReward: 20,
    difficulty: 'iniciante',
    estimatedTime: '2 min',
    steps: [
      {
        id: 'step-choice',
        type: 'multiple_choice',
        title: 'Qual palavra cria uma constante?',
        options: ['const', 'let'],
        hints: ['Lembre-se que const vem de constant.', 'let permite nova atribuição.'],
        xp: 20,
      },
    ],
  };
  const user = { id: 'user-1', username: 'Pedro', total_xp: 0, streak: 0 };

  beforeEach(() => {
    pushMock.mockClear();
    playSoundMock.mockClear();
  });

  it('reveals the step hints one at a time', async () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<LessonClient lesson={choiceLesson} user={user} />);

    expect(screen.queryByText(/const vem de constant/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver dica/ }));
    expect(screen.getByText('Lembre-se que const vem de constant.')).toBeInTheDocument();
    expect(screen.queryByText('let permite nova atribuição.')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Mais uma dica/ }));
    expect(screen.getByText('let permite nova atribuição.')).toBeInTheDocument();
    // Every hint is out: the button goes away instead of doing nothing.
    expect(screen.queryByRole('button', { name: /dica/ })).not.toBeInTheDocument();
  });

  it('keeps a failed save recoverable inside the footer', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Resposta incompleta' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isCorrect: true,
          xpEarned: 20,
          message: 'Isso!',
          lessonCompleted: true,
        }),
      });
    vi.stubGlobal('fetch', fetchMock);
    render(<LessonClient lesson={choiceLesson} user={user} />);

    await userEvent.click(screen.getByRole('button', { name: /const/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Verifique a conexão');
    expect(alert).not.toHaveTextContent('Failed to fetch');
    expect(alert.closest('footer')).not.toBeNull();

    // The same button retries; the answer is kept.
    await userEvent.click(screen.getByRole('button', { name: 'Tentar salvar novamente' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Verifique a conexão');
    expect(screen.queryByText('Ops, não foi dessa vez!')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Tentar salvar novamente' }));
    await screen.findByText('Mandou muito bem!');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      fetchMock.mock.calls.map(([, request]) => JSON.parse(request.body).selectedOption)
    ).toEqual([0, 0, 0]);
  });

  it('sends the learner to the unfinished step instead of a dead end', async () => {
    const twoStepLesson: Lesson = {
      ...choiceLesson,
      steps: [
        { ...choiceLesson.steps[0], id: 'step-a', question: 'Primeira pergunta', hints: undefined },
        { ...choiceLesson.steps[0], id: 'step-b', question: 'Segunda pergunta', hints: undefined },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isCorrect: true,
            xpEarned: 20,
            message: 'Isso!',
            lessonCompleted: false,
            completedStepIds: ['step-b'],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isCorrect: true,
            xpEarned: 20,
            message: 'Isso!',
            lessonCompleted: true,
            completedStepIds: ['step-a', 'step-b'],
          }),
        })
    );
    // step-a looked done when the lesson opened, but the server still has it pending.
    render(<LessonClient lesson={twoStepLesson} completedStepIds={['step-a']} user={user} />);
    expect(screen.getByText('Segunda pergunta')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /const/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));

    // No "reopen the lesson" error: the learner lands on the remaining step.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.getByText('Falta concluir esta atividade para terminar a lição.')
    ).toBeInTheDocument();
    expect(screen.getByText('Primeira pergunta')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /const/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Continuar' }));
    expect(await screen.findByRole('heading', { name: 'Lição Concluída!' })).toBeInTheDocument();
  });
});
