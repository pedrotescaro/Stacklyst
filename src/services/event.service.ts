import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { EventStatus, EventType } from '@prisma/client';

export const EventService = {
  /**
   * List all platform events with filtering and user participation status.
   */
  async listEvents(status?: EventStatus, currentUserId?: string) {
    const events = await prisma.event.findMany({
      where: status ? { status } : undefined,
      orderBy: { start_date: 'asc' },
      include: {
        creator: { select: { id: true, username: true, avatar_url: true } },
        company: { select: { id: true, name: true, logo_url: true, is_verified: true } },
        _count: { select: { participants: true } },
        participants: currentUserId
          ? {
              where: { user_id: currentUserId },
              select: { id: true, joined_at: true, score: true, rank: true },
            }
          : false,
      },
    });

    return events.map((event) => {
      const isJoined = currentUserId
        ? Array.isArray(event.participants) && event.participants.length > 0
        : false;
      const userParticipation =
        isJoined && Array.isArray(event.participants) ? event.participants[0] : null;
      const { participants: _participants, ...rest } = event;
      return {
        ...rest,
        is_joined: isJoined,
        user_participation: userParticipation,
      };
    });
  },

  /**
   * Get single event by ID with participants leaderboard.
   */
  async getEventById(id: string, currentUserId?: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, username: true, avatar_url: true } },
        company: true,
        participants: {
          orderBy: { score: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!event) return null;

    let userParticipation = null;
    if (currentUserId) {
      userParticipation = await prisma.eventParticipant.findUnique({
        where: {
          event_id_user_id: {
            event_id: event.id,
            user_id: currentUserId,
          },
        },
      });
    }

    return {
      ...event,
      is_joined: !!userParticipation,
      userParticipation,
    };
  },

  /**
   * Get single event by slug with participants leaderboard.
   */
  async getEventBySlug(slug: string, currentUserId?: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        creator: { select: { id: true, username: true, avatar_url: true } },
        company: true,
        participants: {
          orderBy: { score: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, username: true, avatar_url: true, total_xp: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });

    if (!event) return null;

    let userParticipation = null;
    if (currentUserId) {
      userParticipation = await prisma.eventParticipant.findUnique({
        where: {
          event_id_user_id: {
            event_id: event.id,
            user_id: currentUserId,
          },
        },
      });
    }

    return {
      ...event,
      is_joined: !!userParticipation,
      userParticipation,
    };
  },

  /**
   * Create an official event (requires ADMIN or RECRUITER role or community organizer).
   */
  async createEvent(params: {
    creatorId: string;
    companyId?: string;
    title: string;
    description: string;
    type: EventType;
    bannerUrl?: string;
    minLevel?: number;
    maxParticipants?: number;
    xpReward?: number;
    startDate: Date;
    endDate: Date;
  }) {
    const slugBase = params.title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const event = await prisma.event.create({
      data: {
        creator_id: params.creatorId,
        company_id: params.companyId,
        title: params.title,
        slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
        description: params.description,
        type: params.type,
        banner_url: params.bannerUrl,
        min_level: params.minLevel || 1,
        max_participants: params.maxParticipants,
        xp_reward: params.xpReward || 250,
        start_date: params.startDate,
        end_date: params.endDate,
        status: 'UPCOMING',
      },
    });

    logger.info('Event created', { eventId: event.id, title: event.title });
    return event;
  },

  /**
   * Join an event as a participant.
   */
  async participate(userId: string, eventId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, total_xp: true },
    });
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { participants: true } } },
    });

    if (!user) throw new Error('Usuário não encontrado.');
    if (!event) throw new Error('Evento não encontrado.');
    if (event.status === 'COMPLETED') throw new Error('Este evento já foi encerrado.');
    if (event.max_participants && event._count.participants >= event.max_participants) {
      throw new Error('Limite máximo de participantes atingido.');
    }

    const userLevel = Math.max(1, Math.floor((user.total_xp || 0) / 300) + 1);
    if (event.min_level > 1 && userLevel < event.min_level) {
      throw new Error(
        `Nível mínimo necessário (${event.min_level}) não atingido. Seu nível atual é ${userLevel}.`
      );
    }

    const participant = await prisma.eventParticipant.upsert({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
      update: {},
      create: {
        event_id: eventId,
        user_id: userId,
        score: 0,
      },
    });

    logger.info('User joined event', { userId, eventId });
    return participant;
  },

  /**
   * Cancel participation in an event.
   */
  async cancelParticipation(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true },
    });

    if (!event) throw new Error('Evento não encontrado.');
    if (event.status === 'COMPLETED') {
      throw new Error('Não é possível cancelar inscrição em evento já encerrado.');
    }

    const deleted = await prisma.eventParticipant.deleteMany({
      where: {
        event_id: eventId,
        user_id: userId,
      },
    });

    logger.info('User cancelled event participation', { userId, eventId, count: deleted.count });
    return { success: true, count: deleted.count };
  },

  /**
   * Delete an event by creator or admin.
   */
  async deleteEvent(eventId: string, userId: string, isAdmin = false) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creator_id: true },
    });

    if (!event) throw new Error('Evento não encontrado.');
    if (!isAdmin && event.creator_id !== userId) {
      throw new Error('Você não tem permissão para excluir este evento.');
    }

    await prisma.event.delete({ where: { id: eventId } });
    logger.info('Event deleted', { eventId, userId });
    return { success: true };
  },
};
