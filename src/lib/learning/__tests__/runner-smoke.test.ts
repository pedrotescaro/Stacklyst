// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { executeCode } from '@/lib/code-execution/server';
import { LEARNING_LESSONS } from '../catalog';
describe.skipIf(process.env.LEARNING_RUNNER_SMOKE !== '1')('configured execution providers', () => {
  it.each(['js', 'ts', 'python', 'go', 'rust', 'java'])(
    'executes %s outside the application',
    async (language) => {
      const lesson = LEARNING_LESSONS.get(`learn-${language}-first-output`)!;
      const step = lesson.steps[2];
      const result = await executeCode(step.solutionCode!, lesson.language);
      expect(result.ok, result.error).toBe(true);
      expect(result.output.trim()).toBe(step.expectedOutput);
    },
    40000
  );
});
