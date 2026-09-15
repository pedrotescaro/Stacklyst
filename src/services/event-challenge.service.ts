import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import {
  MAX_EVENT_CHALLENGES,
  MIN_EVENT_CHALLENGES,
  type EventChallengeInput,
} from '@/lib/event-challenges';
import { logger } from '@/lib/logger';
import type { EventStatus } from '@prisma/client';

interface EventChallengeViewer {
  id: string;
  isAdmin?: boolean;
}

function effectiveEventStatus(event: {
  status: EventStatus;
  start_date: Date;
  end_date: Date;
}): EventStatus {
  const now = new Date();
  if (event.status === 'COMPLETED' || event.end_date <= now) return 'COMPLETED';
  if (event.status === 'ONGOING' || event.start_date <= now) return 'ONGOING';
  return 'UPCOMING';
}

async function findEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      creator_id: true,
      status: true,
      start_date: true,
      end_date: true,
    },
  });

  if (!event) {
    throw new NotFoundError('EVENT_NOT_FOUND', 'Evento não encontrado.');
  }

  return event;
}

export const EventChallengeService = {
  async list(eventId: string, viewer?: EventChallengeViewer | null) {
    const event = await findEvent(eventId);
    const canManage = Boolean(
      viewer && (viewer.id === event.creator_id || viewer.isAdmin === true)
    );
    const eventStatus = effectiveEventStatus(event);

    const challenges = await prisma.eventChallenge.findMany({
      where: { event_id: eventId },
      orderBy: { position: 'asc' },
    });

    return {
      challenges: challenges.map(({ expected_answer, ...challenge }) =>
        canManage ? { ...challenge, expected_answer } : challenge
      ),
      can_manage: canManage,
      can_edit: canManage && eventStatus !== 'COMPLETED',
      event_status: eventStatus,
      limits: {
        min: MIN_EVENT_CHALLENGES,
        max: MAX_EVENT_CHALLENGES,
      },
    };
  },

  async replaceSet(
    eventId: string,
    challenges: EventChallengeInput[],
    viewer: EventChallengeViewer
  ) {
    const event = await findEvent(eventId);

    if (viewer.id !== event.creator_id && viewer.isAdmin !== true) {
      throw new ForbiddenError(
        'EVENT_CHALLENGE_FORBIDDEN',
        'Somente o criador do evento pode gerenciar os desafios.'
      );
    }

    if (effectiveEventStatus(event) === 'COMPLETED') {
      throw new ValidationError(
        'EVENT_COMPLETED',
        'Os desafios não podem ser alterados depois que o evento termina.'
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.eventChallenge.deleteMany({ where: { event_id: eventId } });
      await transaction.eventChallenge.createMany({
        data: challenges.map((challenge, index) => ({
          event_id: eventId,
          position: index + 1,
          title: challenge.title,
          statement: challenge.statement,
          language: challenge.language,
          expected_answer: challenge.expected_answer,
          examples: challenge.examples,
        })),
      });
    });

    logger.info('Event challenge set replaced', {
      eventId,
      userId: viewer.id,
      challengeCount: challenges.length,
    });

    return EventChallengeService.list(eventId, viewer);
  },
};
