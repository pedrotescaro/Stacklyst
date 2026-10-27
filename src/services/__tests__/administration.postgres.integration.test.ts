// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { AdminService } from '../admin.service';
import { JobService } from '../job.service';
import { NotificationService } from '../notification.service';
import { purgeExpiredSecurityAudit } from '@/lib/security-audit';

// Explicitly opt in to a disposable database. Never inherit DATABASE_URL or .env.local.
vi.mock('@/lib/prisma', async () => {
  const connectionString = process.env.STACKLYST_TEST_DATABASE_URL;
  if (!connectionString) return { prisma: null };
  const destination = new URL(connectionString);
  if (
    destination.hostname !== '127.0.0.1' ||
    destination.port !== '55437' ||
    destination.pathname !== '/stacklyst_quality_services'
  ) {
    throw new Error('Integration tests require the dedicated local quality database.');
  }
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl: false, max: 8 }) }),
  };
});

const enabled = Boolean(process.env.STACKLYST_TEST_DATABASE_URL);
const suffix = `quality-${Date.now()}`;
const firstAdmin = `${suffix}-admin-a`;
const secondAdmin = `${suffix}-admin-b`;
const candidate = `${suffix}-candidate`;
const reporter = `${suffix}-reporter`;
const jobId = `${suffix}-job`;

describe.skipIf(!enabled)('administration with PostgreSQL', () => {
  beforeAll(async () => {
    vi.stubEnv('MOBILE_PUSH_ENABLED', 'false');
    for (const [id, role] of [
      [firstAdmin, 'ADMIN'],
      [secondAdmin, 'ADMIN'],
      [candidate, 'USER'],
      [reporter, 'USER'],
    ] as const) {
      await prisma.user.create({
        data: { id, username: id, email: `${id}@example.invalid`, role },
      });
    }
  });
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [firstAdmin, secondAdmin, candidate, reporter] } },
    });
    await prisma.$disconnect();
    vi.unstubAllEnvs();
  });

  it('commits only one of two simultaneous administrator demotions', async () => {
    const outcomes = await Promise.allSettled([
      AdminService.updateUserRole(firstAdmin, 'USER', secondAdmin),
      AdminService.updateUserRole(secondAdmin, 'USER', firstAdmin),
    ]);
    expect(outcomes.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    const rejected = outcomes.find((entry) => entry.status === 'rejected') as PromiseRejectedResult;
    expect(rejected.reason).toMatchObject({ code: 'LAST_ADMIN_REQUIRED' });
    expect(await prisma.user.count({ where: { role: 'ADMIN' } })).toBe(1);
    expect(
      await prisma.securityAuditEvent.count({
        where: { action: 'USER_ROLE_UPDATED', resource_id: { in: [firstAdmin, secondAdmin] } },
      })
    ).toBe(1);
  });

  it('deletes reported content with its cascades and retains a durable moderation audit', async () => {
    const post = await prisma.post.create({
      data: { author_id: candidate, title: 'Reported post', body: 'Content to remove' },
    });
    const report = await prisma.report.create({
      data: { user_id: reporter, post_id: post.id, reason: 'Spam' },
    });
    await expect(AdminService.deleteReportedPost(report.id, post.id, secondAdmin)).resolves.toEqual(
      { success: true }
    );
    expect(await prisma.post.findUnique({ where: { id: post.id } })).toBeNull();
    expect(await prisma.report.count({ where: { post_id: post.id } })).toBe(0);
    expect(
      await prisma.securityAuditEvent.count({
        where: { resource_id: post.id, action: 'REPORTED_POST_DELETED' },
      })
    ).toBe(1);
  });

  it('persists stage and feedback, protects candidate private fields and provides a useful notification', async () => {
    const company = await prisma.company.create({
      data: { owner_id: firstAdmin, name: 'Quality Company', slug: suffix },
    });
    await prisma.job.create({
      data: {
        id: jobId,
        company_id: company.id,
        title: 'Quality Frontend',
        description: 'Test vacancy',
        technologies: ['React'],
        requirements: [],
        benefits: [],
        stages: {
          create: [
            { id: `${suffix}-stage-a`, title: 'Inscrição', order: 1 },
            { id: `${suffix}-stage-b`, title: 'Entrevista', order: 2 },
          ],
        },
      },
    });
    const application = await prisma.jobApplication.create({
      data: { job_id: jobId, user_id: candidate, stage_id: `${suffix}-stage-a` },
    });
    const updated = await JobService.updateApplicationStage({
      applicationId: application.id,
      stageId: `${suffix}-stage-b`,
      status: 'INTERVIEW',
      feedback: 'Conversa técnica na próxima etapa.',
      actorId: firstAdmin,
    });
    expect(updated.stage?.title).toBe('Entrevista');
    expect(updated.feedback).toBe('Conversa técnica na próxima etapa.');
    expect(Object.keys(updated.user).sort()).toEqual([
      'avatar_url',
      'bio',
      'github_username',
      'id',
      'total_xp',
      'username',
    ]);
    expect(JSON.stringify(updated)).not.toContain('@example.invalid');
    const notifications = await NotificationService.getUserNotifications(candidate);
    expect(notifications.items[0]).toMatchObject({
      title: 'Candidatura: Quality Frontend',
      link: `/jobs/${jobId}#application`,
    });
    expect(notifications.items[0].content).toContain('Quality Company');
    expect(notifications.items[0].content).toContain('Entrevista');
    await prisma.user.delete({ where: { id: candidate } });
    expect(await prisma.securityAuditEvent.count({ where: { resource_id: application.id } })).toBe(
      1
    );
  });

  it('enforces immutability, minimum retention and expiry-based purge inside PostgreSQL', async () => {
    const event = await prisma.securityAuditEvent.findFirstOrThrow({
      where: { action: 'USER_ROLE_UPDATED', resource_id: { in: [firstAdmin, secondAdmin] } },
    });
    await expect(prisma.securityAuditEvent.delete({ where: { id: event.id } })).rejects.toThrow(
      'immutable'
    );
    await expect(
      prisma.securityAuditEvent.update({ where: { id: event.id }, data: { action: 'REWRITTEN' } })
    ).rejects.toThrow('immutable');
    await expect(
      prisma.securityAuditEvent.create({
        data: {
          action: 'INVALID_RETENTION',
          resource_id: suffix,
          created_at: new Date(),
          retain_until: new Date(),
        },
      })
    ).rejects.toThrow();
    const createdAt = new Date(Date.now() - 182 * 86400000);
    const expired = await prisma.securityAuditEvent.create({
      data: {
        action: 'EXPIRED_FIXTURE',
        resource_id: suffix,
        created_at: createdAt,
        retain_until: new Date(createdAt.getTime() + 180 * 86400000),
      },
    });
    const purge = await purgeExpiredSecurityAudit();
    expect(purge.count).toBeGreaterThanOrEqual(1);
    expect(await prisma.securityAuditEvent.findUnique({ where: { id: expired.id } })).toBeNull();
    expect(await prisma.securityAuditEvent.findUnique({ where: { id: event.id } })).not.toBeNull();
  });
});
