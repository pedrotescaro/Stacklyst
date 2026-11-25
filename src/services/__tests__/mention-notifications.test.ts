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

it('notifies an answer author once even when the text also mentions them', async () => {
  const people = vi.fn().mockResolvedValue([{ id: 'parent-author' }]);
  const createMany = vi.fn();
  const tx = {
    user: { findMany: people },
    notification: { createMany },
  } as unknown as Prisma.TransactionClient;
  await notifyMentions(tx, 'reply-author', 'Respondendo ao exemplo da @Ana.', {
    type: 'ANSWER',
    id: 'reply',
    authorId: 'post-author',
    audience: 'followers',
    replyRecipientId: 'parent-author',
  });
  expect(people.mock.calls[0][0].where).toMatchObject({
    id: { not: 'reply-author' },
    OR: [{ username: { in: ['ana'], mode: 'insensitive' } }, { id: 'parent-author' }],
    AND: expect.arrayContaining([
      expect.objectContaining({ blocks_made: { none: { blockedId: 'post-author' } } }),
      { OR: [{ id: 'post-author' }, { following: { some: { followingId: 'post-author' } } }] },
    ]),
  });
  expect(createMany).toHaveBeenCalledWith({
    data: [
      {
        actorId: 'reply-author',
        userId: 'parent-author',
        type: 'MENTION',
        resourceType: 'ANSWER',
        resourceId: 'reply',
      },
    ],
  });
});
