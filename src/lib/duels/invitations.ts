import 'server-only';

import { prisma } from '@/lib/prisma';
import { getRandomDuelProblem } from '@/lib/duel-problems';
import { serializePublicDuelProblem } from '@/lib/duels/problems';
import { DUEL_TIME_LIMIT_SECONDS, PUBLIC_DUEL_MATCH_WINDOW_SECONDS } from '@/lib/duels/constants';

const INVITATION_MAINTENANCE_BATCH_SIZE = 100;

export interface ExpiredInvitationResult {
  expired: number;
  published: number;
}

export async function expireDuelInvitations(
  now = new Date(),
  filters: { requestId?: string; receiverId?: string } = {}
): Promise<ExpiredInvitationResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('stacklyst-duel-invitations'))`;

    const dueRequests = await tx.duelRequest.findMany({
      where: {
        id: filters.requestId,
        receiver_id: filters.receiverId,
        status: 'PENDING',
        expires_at: { lte: now },
      },
      orderBy: { expires_at: 'asc' },
      take: INVITATION_MAINTENANCE_BATCH_SIZE,
    });

    const result = { expired: 0, published: 0 };
    for (const request of dueRequests) {
      const claim = await tx.duelRequest.updateMany({
        where: { id: request.id, status: 'PENDING', expires_at: { lte: now } },
        data: { status: 'EXPIRED' },
      });
      if (claim.count !== 1) continue;
      result.expired += 1;

      if (!request.publish_on_expiry) continue;
      const fallbackProblem = getRandomDuelProblem();
      const problem = {
        id: request.problem_id ?? fallbackProblem.id,
        title: request.problem_title ?? fallbackProblem.title,
        body: request.problem_body ?? serializePublicDuelProblem(fallbackProblem),
      };
      const publicDuel = await tx.duel.create({
        data: {
          challenger_id: request.sender_id,
          language: request.language,
          problem_id: problem.id,
          problem_title: problem.title,
          problem_body: problem.body,
          status: 'PENDING',
          time_limit_seconds: DUEL_TIME_LIMIT_SECONDS,
          match_deadline: new Date(now.getTime() + PUBLIC_DUEL_MATCH_WINDOW_SECONDS * 1000),
        },
      });
      await tx.duelRequest.update({
        where: { id: request.id },
        data: { published_duel_id: publicDuel.id },
      });
      result.published += 1;
    }

    return result;
  });
}
