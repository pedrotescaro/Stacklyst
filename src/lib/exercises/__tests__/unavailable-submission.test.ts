import { beforeEach, describe, expect, it, vi } from 'vitest';
import { learningTransaction } from '@/lib/learning/transaction';
import { recordExerciseRun, recordExerciseSubmission } from '../repository';
const mocks = vi.hoisted(() => ({ transaction: vi.fn() }));

vi.mock('@/lib/prisma', () => ({ prisma: { $transaction: mocks.transaction } }));
vi.mock('@/lib/learning/transaction', () => ({ learningTransaction: vi.fn() }));

describe('exercise provider failures', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([true, false])(
    'does not open a progression transaction for invalid execution (unavailable=%s)',
    async (unavailable) => {
      await expect(
        recordExerciseSubmission({
          exercise: { id: 'exercise', knowledge_node_id: 'node', base_xp: 25 },
          userId: 'learner',
          assistanceMode: 'STANDARD',
          code: 'answer()',
          evaluation: {
            ok: false,
            passed: false,
            passedTests: 0,
            totalTests: 2,
            tests: [],
            consoleOutput: '',
            executionMs: 0,
            unavailable,
          },
        })
      ).rejects.toMatchObject({
        code: unavailable ? 'RUNNER_UNAVAILABLE' : 'CODE_EVALUATION_FAILED',
        statusCode: unavailable ? 503 : 422,
      });
      expect(learningTransaction).not.toHaveBeenCalled();
      await expect(
        recordExerciseRun({
          exerciseId: 'exercise',
          knowledgeNodeId: 'node',
          userId: 'learner',
          assistanceMode: 'STANDARD',
          code: 'answer()',
          evaluation: {
            ok: false,
            passed: false,
            passedTests: 0,
            totalTests: 2,
            tests: [],
            consoleOutput: '',
            executionMs: 0,
            unavailable,
          },
        })
      ).rejects.toMatchObject({ statusCode: unavailable ? 503 : 422 });
      expect(mocks.transaction).not.toHaveBeenCalled();
    }
  );
});
