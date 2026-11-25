import type { JSONContent } from '@tiptap/core';
import { markdownToDoc } from '@/lib/editor/markdown';
import { parsePostExtras } from '@/lib/post-composer';
import type { Prisma } from '@prisma/client';
import { mentionedUsernames } from '@/lib/mention-text';
import { visibleUserWhere } from '@/services/block.service';

type MentionSource =
  | { type: 'PROFILE'; id: string; previousBio?: string | null }
  | { type: 'POST'; id: string; authorId: string; audience?: string }
  | {
      type: 'ANSWER';
      id: string;
      authorId: string;
      audience?: string;
      replyRecipientId?: string;
    };

function postUsernames(text: string) {
  if (!text.includes('@')) return [];
  const names = new Set<string>();
  function visit(node: JSONContent) {
    if (
      node.type === 'codeBlock' ||
      node.marks?.some((mark) => mark.type === 'link' || mark.type === 'code')
    )
      return;
    if (node.text) for (const name of mentionedUsernames(node.text)) names.add(name);
    node.content?.forEach(visit);
  }
  visit(markdownToDoc(parsePostExtras(text).content));
  return [...names];
}

export async function notifyMentions(
  tx: Prisma.TransactionClient,
  actorId: string,
  text: string,
  source: MentionSource
) {
  const previous = new Set(
    source.type === 'PROFILE' ? mentionedUsernames(source.previousBio ?? '') : []
  );
  const candidates = source.type === 'PROFILE' ? mentionedUsernames(text) : postUsernames(text);
  const names = candidates.filter((name) => !previous.has(name));
  const replyRecipientId = source.type === 'ANSWER' ? source.replyRecipientId : undefined;
  if (!names.length && !replyRecipientId) return;
  const restrictions: Prisma.UserWhereInput[] = [visibleUserWhere(actorId)];
  if (source.type !== 'PROFILE') {
    if (source.authorId !== actorId) restrictions.push(visibleUserWhere(source.authorId));
    if (source.audience === 'followers')
      restrictions.push({
        OR: [{ id: source.authorId }, { following: { some: { followingId: source.authorId } } }],
      });
  }
  const usernames = { username: { in: names, mode: 'insensitive' as const } };
  const people = await tx.user.findMany({
    where: {
      id: { not: actorId },
      ...(replyRecipientId ? { OR: [usernames, { id: replyRecipientId }] } : usernames),
      AND: restrictions,
    },
    select: { id: true },
  });
  if (people.length)
    await tx.notification.createMany({
      data: people.map(({ id }) => ({
        userId: id,
        actorId,
        type: 'MENTION' as const,
        resourceType: source.type,
        resourceId: source.id,
      })),
    });
}
