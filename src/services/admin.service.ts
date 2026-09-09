import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { UserRole } from '@prisma/client';
import { ValidationError } from '@/lib/errors';

export const AdminService = {
  /**
   * Get general platform executive metrics for the admin dashboard.
   */
  async getDashboardMetrics() {
    const [
      totalUsers,
      activeUsersCount,
      newUsersLast7Days,
      totalDuels,
      completedDuels,
      totalJobs,
      activeJobs,
      totalCompanies,
      verifiedCompanies,
      totalEvents,
      activeEvents,
      pendingReports,
      pendingEvaluations,
      pendingEvaluatorApps,
      totalQuizAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          last_active_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.duel.count(),
      prisma.duel.count({ where: { status: 'CLOSED' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'OPEN' } }),
      prisma.company.count(),
      prisma.company.count({ where: { is_verified: true } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: 'ONGOING' } }),
      prisma.report.count(),
      prisma.duel.count({ where: { status: 'ACTIVE' } }),
      prisma.evaluatorApplication.count({ where: { status: 'PENDING' } }),
      prisma.quizAttempt.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsersCount,
        newLast7Days: newUsersLast7Days,
      },
      duels: {
        total: totalDuels,
        completed: completedDuels,
        pendingEvaluation: pendingEvaluations,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      companies: {
        total: totalCompanies,
        verified: verifiedCompanies,
      },
      events: {
        total: totalEvents,
        active: activeEvents,
      },
      moderation: {
        pendingReports,
        pendingEvaluatorApps,
      },
      engagement: {
        totalQuizAttempts,
      },
    };
  },

  /**
   * List users with pagination, search, and role filtering.
   */
  async listUsers(params: { page?: number; limit?: number; search?: string; role?: UserRole }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.role) {
      where.role = params.role;
    }
    if (params.search) {
      where.OR = [
        { username: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          avatar_url: true,
          role: true,
          total_xp: true,
          streak_days: true,
          created_at: true,
          last_active_at: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Update a user's role (USER, EVALUATOR, ADMIN, RECRUITER).
   */
  async updateUserRole(userId: string, newRole: UserRole) {
    let approvedApplication: { tech_stack: string[] } | null = null;
    if (newRole === 'EVALUATOR') {
      const [application, evaluatorProfile] = await Promise.all([
        prisma.evaluatorApplication.findFirst({
          where: { user_id: userId, status: 'APPROVED' },
          orderBy: [{ reviewed_at: 'desc' }, { created_at: 'desc' }],
          select: { tech_stack: true },
        }),
        prisma.evaluatorProfile.findUnique({
          where: { user_id: userId },
          select: { status: true },
        }),
      ]);
      approvedApplication = application;
      if (!approvedApplication) {
        throw new ValidationError(
          'APPROVED_APPLICATION_REQUIRED',
          'A promoção para avaliador exige uma candidatura aprovada pela rubrica.'
        );
      }
      if (evaluatorProfile && ['SUSPENDED', 'REVOKED'].includes(evaluatorProfile.status)) {
        throw new ValidationError(
          'EVALUATOR_REINSTATEMENT_REQUIRED',
          'Use a reintegração justificada no painel de avaliadores para restaurar este perfil.'
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const changedUser = await tx.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      if (newRole === 'EVALUATOR') {
        await tx.evaluatorProfile.upsert({
          where: { user_id: userId },
          update: {
            tech_stack: approvedApplication?.tech_stack ?? [],
          },
          create: {
            user_id: userId,
            reputation: 100,
            evaluations_count: 0,
            tech_stack: approvedApplication?.tech_stack ?? [],
            status: 'ACTIVE',
          },
        });
      }
      return changedUser;
    });

    logger.info('User role updated by admin', { userId, newRole });
    return updated;
  },

  /**
   * List reports for content moderation.
   */
  async listReports() {
    return prisma.report.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar_url: true },
        },
        post: {
          select: {
            id: true,
            title: true,
            body: true,
            author: { select: { id: true, username: true } },
          },
        },
      },
    });
  },

  /**
   * Delete reported post and resolve report.
   */
  async deleteReportedPost(reportId: string, postId: string) {
    await prisma.post.delete({ where: { id: postId } });
    await prisma.report.delete({ where: { id: reportId } });
    logger.info('Reported post deleted by admin', { reportId, postId });
    return { success: true };
  },
};
