import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EvaluatorService } from '../evaluator.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: { $transaction: vi.fn(), evaluatorProfile: { findUnique: vi.fn() } },
}));
vi.mock('../notification.service', () => ({ NotificationService: { create: vi.fn() } }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn() } }));

describe('evaluator moderation preserves administrators', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(['REVOKE', 'REINSTATE'] as const)(
    '%s never rewrites an administrator role',
    async (action) => {
      vi.mocked(prisma.evaluatorProfile.findUnique).mockResolvedValue({
        status: 'ACTIVE',
        reputation: 100,
      } as any);
      const tx = {
        user: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
        evaluatorProfile: { update: vi.fn().mockResolvedValue({ user_id: 'admin' }) },
        securityAuditEvent: { create: vi.fn().mockResolvedValue({ id: 'audit' }) },
      };
      vi.mocked(prisma.$transaction).mockImplementation(async (run: any) => run(tx));
      await EvaluatorService.moderateEvaluator(
        'admin',
        action,
        'Revisão administrativa documentada do perfil.',
        'actor'
      );
      expect(tx.user.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'admin', role: { not: 'ADMIN' } } })
      );
      expect(tx.securityAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ actor_id: 'actor', action: 'EVALUATOR_MODERATED' }),
        })
      );
    }
  );
});
