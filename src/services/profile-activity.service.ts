import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { decodeCursor, encodeCursor } from '@/lib/pagination';
import { publicQuiz } from '@/lib/quiz-public';
import { visibleUserWhere } from './block.service';

type ActivityKind = 'post' | 'reply';
type ActivityTab = 'posts' | 'likes';
const authorSelect = {
  id: true,
  username: true,
  avatar_url: true,
  avatar_config: true,
  total_xp: true,
} as const;

export function visibleProfileReplyWhere(viewerId: string | null): Prisma.AnswerWhereInput {
  return {
    author: visibleUserWhere(viewerId),
    post: { author: visibleUserWhere(viewerId) },
    OR: [{ parent: null }, { parent: { author: visibleUserWhere(viewerId) } }],
  };
}

/** One ordering across both tables, including rows created at the same instant. */
function activityCursorWhere(cursor: string | undefined, kind: ActivityKind) {
  if (!cursor) return {};
  const { t, i } = decodeCursor(cursor);
  const match = typeof i === 'string' && /^(post|reply):(.+)$/.exec(i);
  const time = new Date(t);
  if (!match || !Number.isFinite(time.getTime()))
    throw new ValidationError('INVALID_CURSOR', 'Cursor de publicações inválido.');
  const [, cursorKind, id] = match;
  const older: Array<{ created_at: Date | { lt: Date }; id?: { lt: string } }> = [
    { created_at: { lt: time } },
  ];
  if (kind < cursorKind) older.push({ created_at: time });
  else if (kind === cursorKind) older.push({ created_at: time, id: { lt: id } });
  return { OR: older };
}

export async function getProfilePublicationCounts(viewerId: string | null, authorId: string) {
  const [posts, replies] = await Promise.all([
    prisma.post.count({ where: { author_id: authorId, author: visibleUserWhere(viewerId) } }),
    prisma.answer.count({
      where: { AND: [{ author_id: authorId }, visibleProfileReplyWhere(viewerId)] },
    }),
  ]);
  return { posts, replies, total: posts + replies };
}

export async function getProfileActivity(
  viewerId: string | null,
  username: string,
  options: {
    tab?: ActivityTab;
    cursor?: string;
    search?: string;
    limit?: number;
  } = {}
) {
  const { tab = 'posts', cursor, search } = options;
  const limit = Math.max(1, Math.min(30, options.limit ?? 10));
  const person = {
    username: { equals: username, mode: 'insensitive' as const },
    ...visibleUserWhere(viewerId),
  };
  const postInclude = {
    author: { select: authorSelect },
    _count: { select: { answers: true } },
    quizzes: { include: { attempts: { where: { user_id: viewerId ?? '__anonymous__' } } } },
    votes: { where: { user_id: viewerId ?? '__anonymous__' }, select: { value: true } },
    bookmarks: { where: { user_id: viewerId ?? '__anonymous__' }, select: { id: true } },
  } satisfies Prisma.PostInclude;
  const postWhere: Prisma.PostWhereInput = {
    AND: [
      { author: visibleUserWhere(viewerId) },
      tab === 'likes' ? { votes: { some: { value: 1, user: person } } } : { author: person },
      activityCursorWhere(cursor, 'post'),
      ...(search
        ? [
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { body: { contains: search, mode: 'insensitive' as const } },
                { code_snippet: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          ]
        : []),
    ],
  };
  const replyWhere: Prisma.AnswerWhereInput = {
    AND: [
      visibleProfileReplyWhere(viewerId),
      tab === 'likes' ? { votes: { some: { value: 1, user: person } } } : { author: person },
      activityCursorWhere(cursor, 'reply'),
      ...(search
        ? [
            {
              OR: [
                { body: { contains: search, mode: 'insensitive' as const } },
                { code_snippet: { contains: search, mode: 'insensitive' as const } },
                { post: { title: { contains: search, mode: 'insensitive' as const } } },
                { post: { body: { contains: search, mode: 'insensitive' as const } } },
              ],
            },
          ]
        : []),
    ],
  };
  // Fetch at most two bounded candidate pages; never merge independently paginated results.
  const [posts, replies] = await Promise.all([
    prisma.post.findMany({
      where: postWhere,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: postInclude,
    }),
    prisma.answer.findMany({
      where: replyWhere,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        author: { select: authorSelect },
        votes: { where: { user_id: viewerId ?? '__anonymous__' }, select: { value: true } },
        post: { include: postInclude },
        parent: { include: { author: { select: authorSelect } } },
      },
    }),
  ]);
  const candidates = [
    ...posts.map((post) => ({
      ...post,
      kind: 'post' as const,
      quizzes: post.quizzes.map(publicQuiz),
    })),
    ...replies.map((reply) => ({
      ...reply,
      kind: 'reply' as const,
      post: { ...reply.post, quizzes: reply.post.quizzes.map(publicQuiz) },
    })),
  ].sort((a, b) => {
    const date = b.created_at.getTime() - a.created_at.getTime();
    if (date) return date;
    const aKey = `${a.kind}:${a.id}`,
      bKey = `${b.kind}:${b.id}`;
    return aKey < bKey ? 1 : aKey > bKey ? -1 : 0;
  });
  const items = candidates.slice(0, limit);
  const last = items.at(-1);
  return {
    items,
    nextCursor:
      candidates.length > limit && last
        ? encodeCursor(last.created_at, `${last.kind}:${last.id}`)
        : null,
  };
}
