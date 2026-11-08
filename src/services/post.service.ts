import { prisma } from '@/lib/prisma';
import { visibleUserWhere } from '@/services/block.service';
import { Language } from '@prisma/client';
import { CreatePostInput } from '@/lib/validators';
import { encodeCursor, buildCursorWhere } from '@/lib/pagination';
import { XpService, calculateLevel } from './xp.service';
import { NotificationService } from './notification.service';
import { logger } from '@/lib/logger';
import { publicQuiz } from '@/lib/quiz-public';
import { syncProfileAchievementsSafely } from './profile-customization.service';
import { visiblePostWhere } from './post-access.service';
import { postPollInclude, publicPostPoll } from '@/lib/post-poll';
import { ValidationError } from '@/lib/errors';
import { Prisma } from '@prisma/client';
import { loadFeedDefinition, feedDefinitionWhere } from './feed-preferences.service';
import {
  rankRecentFeedPage,
  buildPopularFeedCursorWhere,
  encodePopularFeedCursor,
} from '@/lib/feed-ranking';

export const PostService = {
  async create(userId: string, data: CreatePostInput, clientId?: string) {
    const { title, body, language, code, image_url, type, audience, attachments, music, poll } =
      data;

    // Idempotency check: if client_id already exists for this user, return existing post
    if (clientId) {
      const existing = await prisma.post.findFirst({
        where: { author_id: userId, client_id: clientId },
      });
      if (existing) {
        return { post: existing, xpResult: null };
      }
    }

    let leveledUp = false;
    const result = await prisma.$transaction(async (tx) => {
      const mediaIds = attachments.map((item) => item.url.split('/').at(-1)!);
      if (new Set(mediaIds).size !== mediaIds.length)
        throw new ValidationError(
          'INVALID_MEDIA',
          'Um mesmo anexo não pode ser adicionado duas vezes.'
        );
      if (mediaIds.length) {
        const media = await tx.postMedia.findMany({
          where: { id: { in: mediaIds }, owner_id: userId, post_id: null },
        });
        if (
          media.length !== mediaIds.length ||
          attachments.some((item) => {
            const file = media.find((file) => file.id === item.url.split('/').at(-1));
            return (
              !file ||
              (item.type === 'audio'
                ? !file.content_type.startsWith('audio/')
                : item.type === 'gif'
                  ? file.content_type !== 'image/gif'
                  : !file.content_type.startsWith('image/'))
            );
          })
        )
          throw new ValidationError(
            'INVALID_MEDIA',
            'Um anexo está indisponível. Envie o arquivo novamente.'
          );
      }
      // 1. Create Post
      const post = await tx.post.create({
        data: {
          author_id: userId,
          title,
          body,
          language: language || null,
          code_snippet: code || null,
          image_url: image_url || null,
          client_id: clientId || null,
          audience,
          attachments: attachments.length ? attachments : Prisma.JsonNull,
          music: music ? music : Prisma.JsonNull,
          ...(poll
            ? {
                poll: {
                  create: {
                    question: poll.question,
                    expires_at: new Date(Date.now() + poll.durationHours * 3600000),
                    options: { create: poll.options.map((text, position) => ({ text, position })) },
                  },
                },
              }
            : {}),
        },
        include: { poll: { include: postPollInclude(userId) } },
      });
      if (mediaIds.length) {
        const attached = await tx.postMedia.updateMany({
          where: { id: { in: mediaIds }, owner_id: userId, post_id: null },
          data: { post_id: post.id },
        });
        if (attached.count !== mediaIds.length)
          throw new ValidationError(
            'INVALID_MEDIA',
            'Um anexo já foi publicado. Envie-o novamente.'
          );
      }

      // 2. Award XP directly using the SAME transaction tx!
      const xpAmount = language ? 10 : 5;
      const beforeUser = await tx.user.findUnique({
        where: { id: userId },
        select: { total_xp: true },
      });

      const xpResult = await XpService.awardXPInTransaction(tx, userId, language, xpAmount);

      if (calculateLevel(xpResult.newXp).level > calculateLevel(beforeUser?.total_xp ?? 0).level) {
        leveledUp = true;
      }

      // 3. Mentions Parsing & Notifications
      const usernames = Array.from(
        new Set((body.match(/@([\w-]+)/g) || []).map((m) => m.substring(1)))
      );

      if (usernames.length > 0) {
        const usersToNotify = await tx.user.findMany({
          where: { username: { in: usernames } },
          select: { id: true, username: true },
        });

        // Trigger mentions notifications (idempotent: unique target users)
        for (const targetUser of usersToNotify) {
          const canSee =
            audience !== 'followers' ||
            (await tx.follow.findUnique({
              where: { followerId_followingId: { followerId: targetUser.id, followingId: userId } },
            }));
          if (targetUser.id !== userId && canSee) {
            await tx.notification.create({
              data: {
                userId: targetUser.id,
                type: 'MENTION',
                actorId: userId,
                resourceId: post.id,
                resourceType: 'POST',
                read: false,
              },
            });
            logger.info('Mention notification created', {
              postId: post.id,
              actorId: userId,
              targetId: targetUser.id,
            });
          }
        }
      }

      logger.info('Post created successfully in DB', {
        userId,
        postId: post.id,
        type,
        language,
        hasImage: !!image_url,
        xpAwarded: xpAmount,
      });

      return { post: { ...post, poll: publicPostPoll(post.poll) }, xpResult };
    });

    if (leveledUp) {
      try {
        await NotificationService.create({
          userId,
          type: 'LEVEL_UP',
          title: 'Subiu de nível!',
          content: 'Sua prática avançou mais um nível.',
          link: '/profile',
        });
      } catch (err) {
        logger.error('Failed to notify level up', { error: String(err) });
      }
    }

    await syncProfileAchievementsSafely(userId);
    return result;
  },

  async getFeed(
    userId: string | null,
    params: {
      language?: string;
      languages?: string[];
      search?: string;
      author?: string;
      filter?: string;
      sort?: 'recent' | 'popular';
      cursor?: string;
      limit?: number;
      likedBy?: string;
      answeredBy?: string;
      feedId?: string;
    }
  ) {
    const definition = await loadFeedDefinition(userId, params.feedId);
    const {
      language,
      languages,
      search,
      author,
      filter,
      sort,
      cursor,
      limit = 10,
      likedBy,
      answeredBy,
    } = {
      ...params,
      ...(definition ? { filter: definition.source, languages: definition.languages } : {}),
    };

    const whereClause: any = {};

    if (filter === 'following') {
      if (!userId) {
        whereClause.id = { equals: '__anonymous_following_feed__' };
      } else {
        whereClause.author = {
          followers: {
            some: { followerId: userId },
          },
        };
      }
    }

    if (language) {
      whereClause.language = language as Language;
    }
    if (author) {
      whereClause.author = { username: author };
    }
    if (likedBy) {
      whereClause.votes = {
        some: {
          user: { username: likedBy, ...visibleUserWhere(userId) },
          value: 1,
        },
      };
    }
    if (answeredBy) {
      whereClause.answers = {
        some: {
          author: { username: answeredBy, ...visibleUserWhere(userId) },
        },
      };
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { code_snippet: { contains: search, mode: 'insensitive' } },
        { author: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const personalized =
      filter !== 'following' && !author && !likedBy && !answeredBy && !search && !language;
    const popular = filter === 'following' && sort === 'popular';
    const cursorWhere = popular
      ? buildPopularFeedCursorWhere(cursor)
      : buildCursorWhere(cursor, 'created_at');
    const finalWhere = {
      AND: [
        whereClause,
        cursorWhere,
        visiblePostWhere(userId),
        ...(definition ? [feedDefinitionWhere(definition)] : []),
      ],
    };

    const posts = await prisma.post.findMany({
      where: finalWhere,
      orderBy: popular
        ? [{ upvotes: 'desc' }, { created_at: 'desc' }, { id: 'desc' }]
        : [{ created_at: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        poll: { include: postPollInclude(userId) },
        author: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            avatar_config: true,
            total_xp: true,
          },
        },
        _count: {
          select: { answers: true },
        },
        quizzes: {
          include: {
            attempts: userId ? { where: { user_id: userId } } : { where: { id: 'none' } },
          },
        },
        votes: userId
          ? { where: { user_id: userId }, select: { value: true } }
          : { where: { id: 'none' }, select: { value: true } },
        bookmarks: userId
          ? { where: { user_id: userId }, select: { id: true } }
          : { where: { id: 'none' }, select: { id: true } },
      },
    });

    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;

    let nextCursor: string | null = null;
    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = popular
        ? encodePopularFeedCursor(lastItem)
        : encodeCursor(lastItem.created_at, lastItem.id);
    }

    const followedAuthors =
      userId && personalized && items.length > 1
        ? await prisma.follow.findMany({
            where: {
              followerId: userId,
              followingId: { in: [...new Set(items.map((post) => post.author_id))] },
            },
            select: { followingId: true },
          })
        : [];
    const orderedItems = personalized
      ? rankRecentFeedPage(items, {
          languages,
          followingIds: new Set(followedAuthors.map((follow) => follow.followingId)),
        })
      : items;

    return {
      items: orderedItems.map((post) => ({
        ...post,
        poll: publicPostPoll(post.poll),
        quizzes: post.quizzes.map(publicQuiz),
      })),
      nextCursor,
    };
  },

  async countNewer(
    userId: string | null,
    params: { after: Date; filter?: string; languages?: string[]; feedId?: string }
  ) {
    const definition = await loadFeedDefinition(userId, params.feedId);
    const where: any = {
      created_at: { gt: params.after },
    };

    if ((definition?.source ?? params.filter) === 'following') {
      if (!userId) {
        where.id = { equals: '__anonymous_following_feed__' };
      } else {
        where.author = {
          followers: {
            some: { followerId: userId },
          },
        };
      }
    }
    // Interests are ranking signals, not an audience restriction. Count all visible new posts.

    return prisma.post.count({
      where: {
        AND: [
          where,
          visiblePostWhere(userId),
          ...(definition ? [feedDefinitionWhere(definition)] : []),
        ],
      },
    });
  },
};
