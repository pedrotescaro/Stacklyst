import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const MINIMUM_RETENTION_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

export function auditRetentionDays(value = process.env.AUDIT_RETENTION_DAYS): number {
  const requested = Number(value);
  return Number.isInteger(requested) && requested >= MINIMUM_RETENTION_DAYS
    ? Math.min(requested, 3650)
    : MINIMUM_RETENTION_DAYS;
}

export function recordSecurityAudit(
  tx: Pick<Prisma.TransactionClient, 'securityAuditEvent'>,
  input: {
    actorId?: string;
    action: string;
    resourceId: string;
    metadata?: Prisma.InputJsonObject;
  }
) {
  const createdAt = new Date();
  return tx.securityAuditEvent.create({
    data: {
      actor_id: input.actorId ?? null,
      action: input.action,
      resource_id: input.resourceId,
      metadata: input.metadata ?? {},
      created_at: createdAt,
      retain_until: new Date(createdAt.getTime() + auditRetentionDays() * DAY_MS),
    },
  });
}

export function purgeExpiredSecurityAudit(now = new Date()) {
  // The database trigger independently prevents early deletion or rewriting.
  return prisma.securityAuditEvent.deleteMany({ where: { retain_until: { lte: now } } });
}
