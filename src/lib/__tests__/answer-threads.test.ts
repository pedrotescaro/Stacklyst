import { describe, expect, it } from 'vitest';
import { buildAnswerThreads } from '../answer-threads';

describe('buildAnswerThreads', () => {
  it('includes replies deeper than the old fixed include, retaining order and fields', () => {
    const rows = Array.from({ length: 7 }, (_, index) => ({
      id: String(index),
      parent_id: index === 0 ? null : String(index - 1),
      body: 'reply ' + index,
    }));
    const threads = buildAnswerThreads(rows);
    expect(threads).toHaveLength(1);
    let thread = threads[0];
    for (let i = 0; i < 7; i++) {
      expect(thread.body).toBe('reply ' + i);
      thread = thread.replies[0] as typeof thread;
    }
    expect(rows[0]).not.toHaveProperty('replies');
  });

  it('retains siblings and orphaned historical replies as visible roots', () => {
    expect(
      buildAnswerThreads([
        { id: 'a', parent_id: null },
        { id: 'b', parent_id: 'a' },
        { id: 'c', parent_id: 'a' },
        { id: 'd', parent_id: 'removed' },
      ])
    ).toEqual([
      {
        id: 'a',
        parent_id: null,
        replies: [
          { id: 'b', parent_id: 'a', replies: [] },
          { id: 'c', parent_id: 'a', replies: [] },
        ],
      },
      { id: 'd', parent_id: 'removed', replies: [] },
    ]);
  });
});
