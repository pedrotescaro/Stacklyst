import { prisma } from '@/lib/prisma';
import { ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export const SearchService = {
  async searchPosts(query: string, cursor?: string, limit = 10) {
    if (query.length > 100) {
      throw new ValidationError(
        'QUERY_TOO_LONG',
        'A consulta de busca não pode exceder 100 caracteres'
      );
    }

    const sanitized = query
      .replace(/[^\w\s@]/g, ' ') // remove special chars
      .trim()
      .split(/\s+/)
      .filter((w) => w.length >= 2) // ignore 1-character words
      .join(' & '); // AND terms

    if (!sanitized) {
      return {
        items: [],
        nextCursor: null,
      };
    }

    let cursorRank: number | null = null;
    let cursorTime: Date | null = null;
    let cursorId: string | null = null;

    if (cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
        cursorRank = Number(decoded.r);
        cursorTime = new Date(decoded.t);
        cursorId = String(decoded.i);
      } catch {
        throw new ValidationError('INVALID_CURSOR', 'Cursor de busca inválido');
      }
    }

    const limitVal = limit + 1;
    let posts: any[] = [];
    const startTime = Date.now();

    if (cursorRank !== null && cursorTime !== null && cursorId !== null) {
      posts = await prisma.$queryRaw`
        WITH search_results AS (
          SELECT p.id, p.author_id, p.title, p.body, p.language, p.code_snippet, p.image_url, p.is_pinned, p.created_at, p.view_count, p.upvotes,
                 u.username as "author_username", 
                 u.avatar_url as "author_avatar_url",
                 u.avatar_config as "author_avatar_config",
                 u.total_xp as "author_total_xp",
                 (SELECT COUNT(*)::int FROM "Answer" WHERE post_id = p.id) as "answers_count",
                 ts_headline('portuguese', p.title || ' ' || COALESCE(p.body, ''),
                   plainto_tsquery('portuguese', ${sanitized}),
                   'MaxWords=10, MinWords=5, StartSel=<mark>, StopSel=</mark>'
                 ) as excerpt,
                 ts_rank(to_tsvector('portuguese', p.title || ' ' || COALESCE(p.body, '')),
                   plainto_tsquery('portuguese', ${sanitized})
                 )::float as rank
          FROM "Post" p
          JOIN "User" u ON p.author_id = u.id
          WHERE to_tsvector('portuguese', p.title || ' ' || COALESCE(p.body, '')) @@ plainto_tsquery('portuguese', ${sanitized})
        )
        SELECT *
        FROM search_results
        WHERE (rank < ${cursorRank} OR (rank = ${cursorRank} AND created_at < ${cursorTime}) OR (rank = ${cursorRank} AND created_at = ${cursorTime} AND id < ${cursorId}))
        ORDER BY rank DESC, created_at DESC, id DESC
        LIMIT ${limitVal}
      `;
    } else {
      posts = await prisma.$queryRaw`
        WITH search_results AS (
          SELECT p.id, p.author_id, p.title, p.body, p.language, p.code_snippet, p.image_url, p.is_pinned, p.created_at, p.view_count, p.upvotes,
                 u.username as "author_username", 
                 u.avatar_url as "author_avatar_url",
                 u.avatar_config as "author_avatar_config",
                 u.total_xp as "author_total_xp",
                 (SELECT COUNT(*)::int FROM "Answer" WHERE post_id = p.id) as "answers_count",
                 ts_headline('portuguese', p.title || ' ' || COALESCE(p.body, ''),
                   plainto_tsquery('portuguese', ${sanitized}),
                   'MaxWords=10, MinWords=5, StartSel=<mark>, StopSel=</mark>'
                 ) as excerpt,
                 ts_rank(to_tsvector('portuguese', p.title || ' ' || COALESCE(p.body, '')),
                   plainto_tsquery('portuguese', ${sanitized})
                 )::float as rank
          FROM "Post" p
          JOIN "User" u ON p.author_id = u.id
          WHERE to_tsvector('portuguese', p.title || ' ' || COALESCE(p.body, '')) @@ plainto_tsquery('portuguese', ${sanitized})
        )
        SELECT *
        FROM search_results
        ORDER BY rank DESC, created_at DESC, id DESC
        LIMIT ${limitVal}
      `;
    }

    const duration = Date.now() - startTime;
    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;

    const formattedItems = items.map((p) => ({
      id: p.id,
      author_id: p.author_id,
      title: p.title,
      body: p.body,
      language: p.language,
      code_snippet: p.code_snippet,
      image_url: p.image_url,
      is_pinned: p.is_pinned,
      created_at: p.created_at,
      view_count: p.view_count,
      upvotes: p.upvotes,
      excerpt: p.excerpt,
      rank: p.rank,
      author: {
        id: p.author_id,
        username: p.author_username,
        avatar_url: p.author_avatar_url,
        avatar_config: p.author_avatar_config,
        total_xp: p.author_total_xp,
      },
      _count: {
        answers: p.answers_count,
      },
    }));

    let nextCursor: string | null = null;
    if (hasNext && formattedItems.length > 0) {
      const lastPost = formattedItems[formattedItems.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          r: lastPost.rank,
          t: new Date(lastPost.created_at).toISOString(),
          i: lastPost.id,
        })
      ).toString('base64url');
    }

    logger.info('Search executed', {
      query: query,
      sanitized: sanitized,
      resultCount: formattedItems.length,
      durationMs: duration,
    });

    return {
      items: formattedItems,
      nextCursor,
    };
  },

  async searchUsers(query: string, cursor?: string, limit = 10) {
    if (query.length > 100) {
      throw new ValidationError(
        'QUERY_TOO_LONG',
        'A consulta de busca não pode exceder 100 caracteres'
      );
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          {
            profile_customization: {
              is: {
                preferences: {
                  path: ['tags'],
                  array_contains: [query.replace(/^#/, '').toLowerCase()],
                },
              },
            },
          },
        ],
        id: cursor ? { gt: cursor } : undefined,
      },
      select: {
        id: true,
        username: true,
        avatar_url: true,
        avatar_config: true,
        total_xp: true,
      },
      orderBy: { id: 'asc' },
      take: limit + 1,
    });

    const hasNext = users.length > limit;
    const items = hasNext ? users.slice(0, limit) : users;
    const nextCursor = hasNext ? items[items.length - 1].id : null;

    logger.info('User search executed', {
      query,
      resultCount: items.length,
    });

    return { items, nextCursor };
  },
};
