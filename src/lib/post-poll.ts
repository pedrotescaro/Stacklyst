import type { Prisma } from '@prisma/client';
import type { PostPoll } from '@/lib/post-content';

export function postPollInclude(viewerId: string | null) {
  return {
    options: {
      orderBy: { position: 'asc' as const },
      include: { _count: { select: { votes: true } } },
    },
    votes: { where: { user_id: viewerId ?? '__anonymous__' }, select: { option_id: true } },
  } satisfies Prisma.PostPollInclude;
}

type PollRecord = Prisma.PostPollGetPayload<{ include: ReturnType<typeof postPollInclude> }>;

export function publicPostPoll(poll: PollRecord | null | undefined): PostPoll | null {
  if (!poll) return null;
  const counts = poll.options.map((option) => option._count.votes);
  const choice = poll.votes?.[0]?.option_id;
  const myVote = choice ? poll.options.findIndex((option) => option.id === choice) : -1;
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map((option) => option.text),
    expiresAt: poll.expires_at.toISOString(),
    counts,
    totalVotes: counts.reduce((sum, count) => sum + count, 0),
    myVote: myVote < 0 ? null : myVote,
    closed: poll.expires_at.getTime() <= Date.now(),
  };
}
