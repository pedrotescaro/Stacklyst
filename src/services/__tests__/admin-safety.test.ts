import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { AdminService } from '../admin.service';

vi.mock('@/lib/prisma', () => ({ prisma: { $transaction: vi.fn() } }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn() } }));

function transaction() {
  return {
    $queryRaw: vi.fn().mockResolvedValue([{ locked: 1 }]),
    user: {
      findUnique: vi.fn().mockResolvedValue({ role: 'ADMIN' }),
      count: vi.fn().mockResolvedValue(1),
      update: vi.fn().mockResolvedValue({ id: 'admin-1', role: 'USER' }),
    },
    report: { findUnique: vi.fn().mockResolvedValue({ post_id: 'post-1', reason: 'Spam' }) },
    post: { delete: vi.fn().mockResolvedValue({ id: 'post-1' }) },
    securityAuditEvent: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
  };
}

describe('administrative safety', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects demotion of the last administrator without mutation or audit', async () => {
    const tx = transaction();
    vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => run(tx));
    await expect(AdminService.updateUserRole('admin-1', 'USER', 'actor')).rejects.toMatchObject({
      code: 'LAST_ADMIN_REQUIRED',
    });
    expect(tx.$queryRaw).toHaveBeenCalledOnce();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.securityAuditEvent.create).not.toHaveBeenCalled();
  });

  it('serializes concurrent demotions before counting and preserves one administrator', async () => {
    const roles = new Map([
      ['admin-1', 'ADMIN'],
      ['admin-2', 'ADMIN'],
    ]);
    let previous = Promise.resolve();
    const transactions: ReturnType<typeof transaction>[] = [];
    vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => {
      const tx = transaction();
      let release = () => {};
      tx.$queryRaw.mockImplementation(async () => {
        const wait = previous;
        previous = new Promise<void>((resolve) => {
          release = resolve;
        });
        await wait;
        return [{ locked: 1 }];
      });
      tx.user.findUnique.mockImplementation(async ({ where }: any) => ({
        role: roles.get(where.id)!,
      }));
      tx.user.count.mockImplementation(
        async () => [...roles.values()].filter((role) => role === 'ADMIN').length
      );
      tx.user.update.mockImplementation(async ({ where, data }: any) => {
        roles.set(where.id, data.role);
        return { id: where.id, role: data.role };
      });
      transactions.push(tx);
      try {
        return await run(tx);
      } finally {
        release();
      }
    });

    const result = await Promise.allSettled([
      AdminService.updateUserRole('admin-1', 'USER', 'admin-2'),
      AdminService.updateUserRole('admin-2', 'USER', 'admin-1'),
    ]);
    expect(result.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
    expect([...roles.values()].filter((role) => role === 'ADMIN')).toHaveLength(1);
    expect(transactions[0].$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      transactions[0].user.findUnique.mock.invocationCallOrder[0]
    );
    expect(transactions[1].user.update).not.toHaveBeenCalled();
  });

  it('records moderation and lets post cascades resolve all its reports', async () => {
    const tx = transaction();
    vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => run(tx));
    await expect(AdminService.deleteReportedPost('report-1', 'post-1', 'admin-1')).resolves.toEqual(
      { success: true }
    );
    expect(tx.post.delete).toHaveBeenCalledWith({ where: { id: 'post-1' } });
    expect(tx.securityAuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actor_id: 'admin-1',
          action: 'REPORTED_POST_DELETED',
          resource_id: 'post-1',
        }),
      })
    );
    expect(tx.securityAuditEvent.create.mock.invocationCallOrder[0]).toBeLessThan(
      tx.post.delete.mock.invocationCallOrder[0]
    );
  });

  it('rejects a report paired with a different post', async () => {
    const tx = transaction();
    vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => run(tx));
    await expect(
      AdminService.deleteReportedPost('report-1', 'another-post', 'admin-1')
    ).rejects.toMatchObject({ code: 'REPORT_NOT_FOUND' });
    expect(tx.post.delete).not.toHaveBeenCalled();
    expect(tx.securityAuditEvent.create).not.toHaveBeenCalled();
  });

  it('does not delete content when its audit cannot be persisted', async () => {
    const tx = transaction();
    tx.securityAuditEvent.create.mockRejectedValue(new Error('database unavailable'));
    vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => run(tx));
    await expect(AdminService.deleteReportedPost('report-1', 'post-1')).rejects.toThrow(
      'database unavailable'
    );
    expect(tx.post.delete).not.toHaveBeenCalled();
  });
});
