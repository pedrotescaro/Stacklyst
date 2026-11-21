import { describe, expect, it } from 'vitest';
import { activeMention, mentionedUsernames } from '../mention-text';

describe('mention ranges', () => {
  it('replaces only the current handle even in the middle of a line', () => {
    expect(activeMention('Olá\n@pe-dro e @ana', 7)).toEqual({ from: 4, to: 11, query: 'pe' });
    expect(activeMention('Oi @', 4)).toEqual({ from: 3, to: 4, query: '' });
    expect(activeMention('mail@dev', 8)).toBeNull();
  });
  it('deduplicates notifications and skips email addresses and overlong handles', () => {
    expect(mentionedUsernames('Oi @AnA @ana! @dev-2 mail@empresa.br @' + 'x'.repeat(31))).toEqual([
      'ana',
      'dev-2',
    ]);
  });
});
