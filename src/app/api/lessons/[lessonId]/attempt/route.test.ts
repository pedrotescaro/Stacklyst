// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { executeCode } from '@/lib/code-execution/server';
import { getLessonById } from '@/lib/lessons/registry';
import { LEARNING_LESSONS } from '@/lib/learning/catalog';
import { saveLessonAssessment } from '@/lib/learning/lesson-progress';

vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(async () => ({ id: 'learner' })),
  requireAuth: vi.fn(async () => ({ id: 'learner' })),
}));
vi.mock('@/lib/ratelimit', () => ({ rateLimit: vi.fn() }));
vi.mock('@/lib/code-execution/server', () => ({ executeCode: vi.fn() }));
vi.mock('@/lib/lessons/registry', () => ({ getLessonById: vi.fn() }));
vi.mock('@/lib/learning/lesson-progress', () => ({
  requireLessonAccess: vi.fn(),
  saveLessonAssessment: vi.fn(async () => ({ xpEarned: 0 })),
}));

const lesson = LEARNING_LESSONS.get('learn-js-first-output')!;
const step = lesson.steps.find((item) => item.type === 'code_editor')!;

function send(action: 'run' | 'submit' = 'run') {
  return POST(
    new Request(`https://stacklyst.test/api/lessons/${lesson.id}/attempt`, {
      method: 'POST',
      body: JSON.stringify({
        stepId: step.id,
        action,
        code: 'print("Stacklyst")\nprint("Meu primeiro programa")',
      }),
    }),
    { params: Promise.resolve({ lessonId: lesson.id }) }
  );
}

describe.each(['output', 'test cases'] as const)('lesson execution using %s', (mode) => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLessonById).mockReturnValue({
      ...lesson,
      steps: [
        mode === 'output'
          ? step
          : {
              ...step,
              evaluation: {
                functionName: 'greeting',
                cases: [{ input: [], expected: 'Stacklyst' }],
              },
            },
      ],
    });
  });

  it.each(['run', 'submit'] as const)(
    'returns the code error at zero milliseconds for %s',
    async (action) => {
      vi.mocked(executeCode).mockResolvedValue({
        ok: false,
        output: '',
        error: "'print' is not defined",
        executionMs: 0,
      });

      const response = await send(action);

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        isCorrect: false,
        details: "'print' is not defined",
        unavailable: false,
        xpEarned: 0,
      });
      if (action === 'run') expect(saveLessonAssessment).not.toHaveBeenCalled();
      else
        expect(saveLessonAssessment).toHaveBeenCalledWith(
          'learner',
          expect.any(Object),
          expect.any(Object),
          false,
          0
        );
    }
  );

  it.each([0, 42])(
    'preserves progress during an actual outage lasting %s ms',
    async (executionMs) => {
      vi.mocked(executeCode).mockResolvedValue({
        ok: false,
        output: '',
        error: 'Executor unavailable',
        unavailable: true,
        executionMs,
      });

      const response = await send('submit');

      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ error: 'RUNNER_UNAVAILABLE' });
      expect(saveLessonAssessment).not.toHaveBeenCalled();
    }
  );
});
