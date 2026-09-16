import { prisma } from '@/lib/prisma';
import { sendMobilePush } from '@/lib/mobile/push';
import { NotificationType } from '@prisma/client';
import { encodeCursor, buildCursorWhere } from '@/lib/pagination';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  actorId?: string | null;
  resourceId?: string | null;
  resourceType?: string | null;
  read?: boolean;
  title?: string;
  content?: string;
  link?: string;
}

async function resolveLinkedPostId(resourceType?: string | null, resourceId?: string | null) {
  if (!resourceId) return null;

  if (resourceType === 'POST') {
    return resourceId;
  }

  if (resourceType === 'ANSWER') {
    const answer = await prisma.answer.findUnique({
      where: { id: resourceId },
      select: { post_id: true },
    });

    return answer?.post_id ?? null;
  }

  return null;
}

async function resolveProfileUsername(resourceType?: string | null, resourceId?: string | null) {
  if (resourceType !== 'PROFILE' || !resourceId) return null;

  const user = await prisma.user.findUnique({
    where: { id: resourceId },
    select: { username: true },
  });

  return user?.username ?? null;
}

function mapApiType(type: NotificationType) {
  if (type === 'COMMENT') return 'ANSWER';
  if (type === 'XP_MILESTONE' || type === 'LEVEL_UP') return 'XP';
  if (type === 'DUEL_CHALLENGE' || type === 'DUEL_RESULT') return 'DUEL';
  if (type === 'FOLLOW') return 'SYSTEM';
  return type;
}

function getNotificationTitle(type: NotificationType, isMessage: boolean) {
  if (type === 'FOLLOW') return 'Novo seguidor';
  if (type === 'LIKE') return 'Novo upvote';
  if (type === 'REACTION') return 'Nova reacao';
  if (type === 'COMMENT') return isMessage ? 'Mensagem recebida' : 'Nova resposta no seu post';
  if (type === 'LEVEL_UP') return 'Subiu de nivel';
  if (type === 'XP_MILESTONE') return 'Conquista de XP';
  if (type === 'QUIZ_CORRECT') return 'Quiz correto';
  if (type === 'DUEL_CHALLENGE') return 'Duelo disponivel';
  if (type === 'DUEL_RESULT') return 'Resultado do duelo';
  if (type === 'MENTION') return 'Voce foi mencionado';
  return 'Notificacao Stacklyst';
}

function getNotificationContent(type: NotificationType, actorName: string, isMessage: boolean) {
  if (type === 'FOLLOW') return `${actorName} comecou a seguir voce no Stacklyst.`;
  if (type === 'LIKE') return `${actorName} deu um upvote no seu post.`;
  if (type === 'REACTION') return `${actorName} reagiu ao seu post.`;
  if (type === 'COMMENT') {
    return isMessage
      ? `${actorName} enviou uma mensagem para voce no Bate-papo.`
      : `${actorName} respondeu a sua pergunta.`;
  }
  if (type === 'LEVEL_UP') return 'Parabens, voce subiu de nivel!';
  if (type === 'QUIZ_CORRECT') return 'Voce acertou um quiz e ganhou XP.';
  if (type === 'DUEL_CHALLENGE') return 'Ha um novo duelo disponivel para testar suas habilidades.';
  if (type === 'DUEL_RESULT') return 'O resultado de um duelo foi atualizado.';
  if (type === 'MENTION') return `${actorName} mencionou voce no Stacklyst.`;
  return 'Voce recebeu uma notificacao.';
}

function getNotificationLink({
  isMessage,
  postId,
  profileUsername,
  resourceType,
}: {
  isMessage: boolean;
  postId: string | null;
  profileUsername: string | null;
  resourceType?: string | null;
}) {
  if (isMessage) return '/messages';
  if (postId) return `/post/${postId}`;
  if (resourceType === 'DUEL') return '/duels';
  if (resourceType === 'FEED') return '/feed';
  if (profileUsername) return `/profile/${profileUsername}`;
  return null;
}

export const NotificationService = {
  async create(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        actorId: data.actorId || null,
        resourceId: data.resourceId || null,
        resourceType: data.resourceType || null,
        read: data.read ?? false,
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            total_xp: true,
          },
        },
      },
    });
    await sendMobilePush(data.userId, notification.id).catch(() => undefined);
    return notification;
  },

  async getUserNotifications(userId: string, cursor?: string, limit = 10, useCursor = true) {
    const where = {
      userId,
      ...buildCursorWhere(cursor, 'createdAt'),
    };

    const takeVal = useCursor ? limit + 1 : undefined;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: takeVal,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            total_xp: true,
          },
        },
      },
    });

    const enhancedNotifications = await Promise.all(
      notifications.map(async (notif) => {
        let postTitle: string | undefined = undefined;
        let postBody: string | undefined = undefined;
        let upvoters: any[] = [];

        const [postId, profileUsername] = await Promise.all([
          resolveLinkedPostId(notif.resourceType, notif.resourceId),
          resolveProfileUsername(notif.resourceType, notif.resourceId),
        ]);

        if (postId) {
          try {
            const post = await prisma.post.findUnique({
              where: { id: postId },
              select: {
                title: true,
                body: true,
                votes: {
                  where: { value: 1 },
                  include: {
                    user: {
                      select: {
                        username: true,
                        avatar_url: true,
                      },
                    },
                  },
                  orderBy: { created_at: 'desc' },
                },
              },
            });

            if (post) {
              postTitle = post.title;
              postBody = post.body;
              upvoters = post.votes.map((vote) => vote.user);
            }
          } catch (err) {
            console.error('Error enhancing notification:', err);
          }
        }

        const actorName = notif.actor ? `@${notif.actor.username}` : 'Alguem';
        const isMessage = notif.resourceType === 'MESSAGE';
        const link = getNotificationLink({
          isMessage,
          postId,
          profileUsername,
          resourceType: notif.resourceType,
        });

        return {
          id: notif.id,
          user_id: notif.userId,
          type: mapApiType(notif.type),
          title: getNotificationTitle(notif.type, isMessage),
          content: getNotificationContent(notif.type, actorName, isMessage),
          link,
          is_read: notif.read,
          created_at: notif.createdAt.toISOString(),
          actor: notif.actor,
          postTitle,
          postBody,
          upvoters,
        };
      })
    );

    if (useCursor) {
      const hasNext = enhancedNotifications.length > limit;
      const items = hasNext ? enhancedNotifications.slice(0, limit) : enhancedNotifications;

      let nextCursor: string | null = null;

      if (hasNext && items.length > 0) {
        const originalLastNotif = notifications[items.length - 1];
        nextCursor = encodeCursor(originalLastNotif.createdAt, originalLastNotif.id);
      }

      return { items, nextCursor };
    }

    return { items: enhancedNotifications, nextCursor: null };
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    const totalCount = await prisma.notification.count({
      where: { userId },
    });

    if (totalCount === 0) {
      await NotificationService.getUserNotifications(userId, undefined, 10, false);
    }

    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  },
};
