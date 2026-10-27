import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  auditRetentionDays,
  purgeExpiredSecurityAudit,
  recordSecurityAudit,
} from '../security-audit';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({ prisma: { securityAuditEvent: { deleteMany: vi.fn() } } }));

describe('security audit retention', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T00:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it.each([undefined, '', '0', '179', 'NaN', '180.5'])(
    'enforces a minimum of 180 days for %s',
    (value) => {
      expect(auditRetentionDays(value)).toBe(180);
    }
  );

  it('uses the configured longer retention and records an independent event', async () => {
    vi.stubEnv('AUDIT_RETENTION_DAYS', '365');
    const tx = { securityAuditEvent: { create: vi.fn().mockResolvedValue({ id: 'audit' }) } };
    await recordSecurityAudit(tx as any, {
      action: 'USER_ROLE_UPDATED',
      resourceId: 'user',
      actorId: 'actor',
      metadata: { role: 'USER' },
    });
    expect(tx.securityAuditEvent.create).toHaveBeenCalledWith({
      data: {
        actor_id: 'actor',
        action: 'USER_ROLE_UPDATED',
        resource_id: 'user',
        metadata: { role: 'USER' },
        created_at: new Date('2026-10-27T00:00:00Z'),
        retain_until: new Date('2027-10-27T00:00:00Z'),
      },
    });
  });

  it('purges only expired events, using their persisted retention deadline', async () => {
    const now = new Date();
    await purgeExpiredSecurityAudit(now);
    expect(prisma.securityAuditEvent.deleteMany).toHaveBeenCalledWith({
      where: { retain_until: { lte: now } },
    });
  });

  it('ships database enforcement and no cascading audit relationships', () => {
    const migration = readFileSync(
      'prisma/migrations/20261027010000_security_audit_retention/migration.sql',
      'utf8'
    );
    expect(migration).toContain('CHECK ("retain_until" >= "created_at" + INTERVAL \'4320 hours\')');
    expect(migration).toContain("TG_OP = 'UPDATE' OR OLD.retain_until > CURRENT_TIMESTAMP");
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).not.toContain('REFERENCES');
  });
});
