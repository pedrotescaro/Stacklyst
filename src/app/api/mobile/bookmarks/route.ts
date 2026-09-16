import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildCursorWhere, encodeCursor } from '@/lib/pagination';
export const GET = apiHandler(async (req) => {
  const user = await requireAuth();
  const cursor = new URL(req.url).searchParams.get('cursor') || undefined;
  const rows = await prisma.bookmark.findMany({
    where: { user_id: user.id, ...buildCursorWhere(cursor, 'created_at') },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    take: 21,
    include: {
      post: {
        include: {
          author: { select: { id: true, username: true, avatar_url: true, avatar_config: true } },
          _count: { select: { answers: true } },
          bookmarks: { where: { user_id: user.id }, select: { id: true } },
        },
      },
    },
  });
  const selected = rows.slice(0, 20),
    last = selected.at(-1);
  return Response.json({
    items: selected.map((b) => b.post),
    nextCursor: rows.length > 20 && last ? encodeCursor(last.created_at, last.id) : null,
  });
});
