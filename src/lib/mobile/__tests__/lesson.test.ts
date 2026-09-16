import { describe, expect, it } from 'vitest';
import { publicLesson } from '../lesson';
import type { Lesson } from '@/lib/lessons/types';

describe('mobile lesson public contract', () => {
  it('strips assessment answers, hidden tests and future internal fields recursively', () => {
    const lesson = {
      id: 'lesson',
      title: 'Types',
      description: 'Learn',
      language: 'typescript',
      estimatedTime: '5 min',
      secret: 'private',
      steps: [
        {
          id: 'step',
          type: 'matching',
          title: 'Pair',
          question: 'Which?',
          correctOptionIndex: 1,
          solutionCode: 'secret',
          checkCode: 'private',
          expectedOutput: 'answer',
          explanation: 'solution',
          evaluation: { functionName: 'test', cases: [{ input: [], expected: 42, hidden: true }] },
          testCases: [{ id: 'hidden', testCode: 'secret' }],
          terminalExpected: 'answer',
          expectedBlockTokens: ['answer'],
          blanks: [{ id: 'blank', placeholder: 'type', expected: ['answer'] }],
          orderItems: [
            { id: 'b', text: 'Zulu', correctIndex: 0 },
            { id: 'a', text: 'Alpha', correctIndex: 1 },
          ],
          matchingPairs: [
            { id: 'first', left: 'one', right: 'z' },
            { id: 'second', left: 'two', right: 'a' },
          ],
        },
      ],
    } as unknown as Lesson;
    const output = publicLesson(lesson);
    const serialized = JSON.stringify(output);
    for (const field of [
      'secret',
      'correctOptionIndex',
      'solutionCode',
      'checkCode',
      'expectedOutput',
      'explanation',
      'evaluation',
      'testCases',
      'terminalExpected',
      'expectedBlockTokens',
      'correctIndex',
      'matchingPairs',
      'expected',
    ]) {
      expect(serialized).not.toContain(`"${field}"`);
    }
    expect(output.steps[0].blanks).toEqual([{ id: 'blank', placeholder: 'type' }]);
    expect(output.steps[0].orderItems).toEqual([
      { id: 'a', text: 'Alpha' },
      { id: 'b', text: 'Zulu' },
    ]);
    expect(output.steps[0].matchingLeft).toEqual(['one', 'two']);
    expect(output.steps[0].matchingRight).toEqual(['a', 'z']);
  });
});
