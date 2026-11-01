import type { Language, NotificationType, Prisma } from '@prisma/client';
import { evaluatorCanReviewLanguage } from './policy';
import { sendMobilePush } from '@/lib/mobile/push';

type NotificationDb = Pick<Prisma.TransactionClient, 'user' | 'notification'>;
type Reviewer = { id: string; role: string; evaluator_profile: { tech_stack: string[] } | null };
export type EvaluatorPushTarget = { id: string; userId: string };

/** Persist first, then call outside the transaction. Provider failure never loses inbox activity. */
export async function pushEvaluatorNotifications(targets: EvaluatorPushTarget[]) {
  await Promise.allSettled(targets.map(async ({ id, userId }) => sendMobilePush(userId, id)));
}

export async function findDuelReviewers(db: Pick<NotificationDb, 'user'>): Promise<Reviewer[]> {
  return db.user.findMany({
    where: {
      OR: [
        { role: 'ADMIN' },
        {
          role: 'EVALUATOR',
          evaluator_profile: { is: { status: { in: ['ACTIVE', 'PROBATION'] } } },
        },
      ],
    },
    select: { id: true, role: true, evaluator_profile: { select: { tech_stack: true } } },
  });
}

/** Resource types keep governance notices distinct from ordinary duel invitations. */
export const EVALUATOR_APPLICATION_RESOURCE = 'EVALUATOR_APPLICATION';
export const DUEL_REVIEW_RESOURCE = 'DUEL_REVIEW';

export async function notifyEvaluatorApplication(
  db: NotificationDb,
  application: { id: string },
  recipients?: { id: string }[],
  pushTargets?: EvaluatorPushTarget[]
) {
  const admins =
    recipients ?? (await db.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } }));
  if (!admins.length) return 0;
  const created = await db.notification.createManyAndReturn({
    data: admins.map(({ id }) => ({
      id: `evaluator-application:${application.id}:${id}`,
      userId: id,
      type: 'EVALUATION_COMPLETED' as const,
      resourceId: application.id,
      resourceType: EVALUATOR_APPLICATION_RESOURCE,
      // Administrative delivery must not disappear because of a social block.
      actorId: null,
    })),
    skipDuplicates: true,
    select: { id: true, userId: true },
  });
  pushTargets?.push(...created);
  return created.length;
}

export async function notifyDuelReviewers(
  db: NotificationDb,
  duel: {
    id: string;
    language: Language;
    challenger_id: string;
    opponent_id: string | null;
  },
  candidates?: Reviewer[],
  pushTargets?: EvaluatorPushTarget[]
) {
  const reviewers = candidates ?? (await findDuelReviewers(db));
  const recipients = reviewers.filter(
    (candidate) =>
      candidate.id !== duel.challenger_id &&
      candidate.id !== duel.opponent_id &&
      (candidate.role === 'ADMIN' ||
        evaluatorCanReviewLanguage(candidate.evaluator_profile?.tech_stack ?? [], duel.language))
  );
  if (!recipients.length) return 0;
  const created = await db.notification.createManyAndReturn({
    data: recipients.map(({ id }) => ({
      id: `duel-review:${duel.id}:${id}`,
      userId: id,
      type: 'DUEL_REQUEST' as const,
      resourceId: duel.id,
      resourceType: DUEL_REVIEW_RESOURCE,
      actorId: null,
    })),
    skipDuplicates: true,
    select: { id: true, userId: true },
  });
  pushTargets?.push(...created);
  return created.length;
}

export function getEvaluatorNotificationPresentation(notification: {
  type: NotificationType;
  resourceType?: string | null;
  resourceId?: string | null;
}) {
  if (notification.resourceType === EVALUATOR_APPLICATION_RESOURCE) {
    return {
      title: 'Nova candidatura a avaliador',
      content:
        'Uma candidatura aguarda sua análise. Confira os requisitos, a motivação e as tecnologias no painel administrativo.',
      link: '/admin?tab=evaluators',
    };
  }
  if (notification.resourceType === DUEL_REVIEW_RESOURCE) {
    return {
      title: 'Duelo aguardando sua avaliação',
      content:
        'Um empate técnico precisa de revisão humana. Compare as soluções e envie seu parecer na fila de avaliações.',
      link: notification.resourceId
        ? `/evaluations?duel=${encodeURIComponent(notification.resourceId)}`
        : '/evaluations',
    };
  }
  if (notification.type === 'EVALUATOR_APPROVED') {
    return {
      title: 'Candidatura a avaliador aprovada',
      content:
        'Você já pode revisar duelos das suas tecnologias. Consulte o parecer da candidatura e acesse sua fila de avaliações.',
      link: '/evaluators/apply',
    };
  }
  if (notification.type === 'EVALUATOR_REJECTED') {
    return {
      title: 'Candidatura a avaliador analisada',
      content:
        'Sua candidatura não foi aprovada. Consulte a justificativa da administração antes de enviar uma nova candidatura.',
      link: '/evaluators/apply',
    };
  }
  if (notification.type === 'EVALUATION_COMPLETED' && notification.resourceType === 'DUEL') {
    return {
      title: 'Avaliação do duelo concluída',
      content:
        'O avaliador publicou o parecer e definiu o resultado. Abra o duelo para conferir as notas e o feedback.',
      link: notification.resourceId
        ? `/duels/${encodeURIComponent(notification.resourceId)}`
        : '/duels',
    };
  }
  return null;
}
