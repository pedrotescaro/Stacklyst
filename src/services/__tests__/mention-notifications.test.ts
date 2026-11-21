import { it, expect, vi } from 'vitest';
import type { Prisma } from '@prisma/client';
import { notifyMentions } from '../mention-notifications';
it('notifies once for visible Markdown mentions in a followers-only reply', async () => {
  const people = vi.fn().mockResolvedValue([{ id: 'b' }]),
    notify = vi.fn();
  const tx = {
    user: { findMany: people },
    notification: { createMany: notify },
  } as unknown as Prisma.TransactionClient;
  await notifyMentions(tx, 'a', 'Olá @Ana e @ana, `@code` [@link](https://example.com)', {
    type: 'ANSWER',
    id: 'reply',
    authorId: 'author',
    audience: 'followers',
  });
  expect(people.mock.calls[0][0].where).toMatchObject({
    id: { not: 'a' },
    username: { in: ['ana'], mode: 'insensitive' },
    AND: expect.arrayContaining([
      { OR: [{ id: 'author' }, { following: { some: { followingId: 'author' } } }] },
    ]),
  });
  expect(notify).toHaveBeenCalledWith({
    data: [
      { actorId: 'a', userId: 'b', type: 'MENTION', resourceType: 'ANSWER', resourceId: 'reply' },
    ],
  });
});
it('does not renotify an unchanged bio mention', async () => {
  const people = vi.fn();
  await notifyMentions(
    { user: { findMany: people } } as unknown as Prisma.TransactionClient,
    'a',
    'Amiga da @Ana',
    { type: 'PROFILE', id: 'a', previousBio: 'Com @ana' }
  );
  expect(people).not.toHaveBeenCalled();
});
