import { prisma } from '@/lib/prisma';
import { requireCompanyAccess } from '@/lib/mobile/company-access';
import { logger } from '@/lib/logger';
import {
  ApplicationStatus,
  JobContract,
  JobLevel,
  JobModality,
  JobStatus,
  RecruitmentStageType,
} from '@prisma/client';
import { NotificationService } from './notification.service';

export const JobService = {
  /**
   * List jobs with rich filters (technology, level, modality, contract).
   */
  async listJobs(filters?: {
    search?: string;
    level?: JobLevel;
    modality?: JobModality;
    contract?: JobContract;
    technology?: string;
    status?: JobStatus | 'ALL';
    companyId?: string;
  }) {
    const where: any = {};

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    } else if (!filters?.status) {
      where.status = 'OPEN';
    }

    if (filters?.companyId) where.company_id = filters.companyId;
    if (filters?.level) where.level = filters.level;
    if (filters?.modality) where.modality = filters.modality;
    if (filters?.contract) where.contract_type = filters.contract;
    if (filters?.technology) {
      where.technologies = { has: filters.technology };
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.job.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_url: true,
            location: true,
            is_verified: true,
          },
        },
        stages: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });
  },

  /**
   * Get all applications for a specific job with applicant user and stage info.
   * Only accessible by Recruiter or Admin.
   */
  async getJobApplications(jobId: string, currentUserId: string, userRole: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      throw new Error('Vaga não encontrada.');
    }
    if (userRole !== 'ADMIN' && userRole !== 'RECRUITER') {
      throw new Error('Acesso não autorizado às candidaturas desta vaga.');
    }
    await requireCompanyAccess(job.company_id, { id: currentUserId, role: userRole });

    return prisma.jobApplication.findMany({
      where: { job_id: jobId },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            total_xp: true,
            bio: true,
            github_username: true,
          },
        },
        stage: true,
      },
    });
  },

  /**
   * Get job by ID with all details and recruitment stages.
   */
  async getJobById(jobId: string, currentUserId?: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        stages: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) return null;

    let userApplication = null;
    if (currentUserId) {
      userApplication = await prisma.jobApplication.findUnique({
        where: {
          job_id_user_id: {
            job_id: jobId,
            user_id: currentUserId,
          },
        },
        include: {
          stage: true,
        },
      });
    }

    return {
      ...job,
      userApplication,
    };
  },

  /**
   * Create a new Job opportunity with customizable recruitment stages.
   */
  async createJob(params: {
    companyId: string;
    title: string;
    description: string;
    level: JobLevel;
    technologies: string[];
    modality: JobModality;
    location?: string;
    contractType: JobContract;
    salaryMin?: number;
    salaryMax?: number;
    requirements: string[];
    benefits: string[];
    stages?: {
      title: string;
      type: RecruitmentStageType;
      order: number;
      challengeId?: string;
      description?: string;
    }[];
  }) {
    const {
      companyId,
      title,
      description,
      level,
      technologies,
      modality,
      location,
      contractType,
      salaryMin,
      salaryMax,
      requirements,
      benefits,
      stages,
    } = params;

    const defaultStages = stages || [
      { title: 'Inscrição', type: 'INSCRICAO' as RecruitmentStageType, order: 1 },
      {
        title: 'Desafio Técnico na Plataforma',
        type: 'DESAFIO_TECNICO' as RecruitmentStageType,
        order: 2,
        description: 'Resolva o desafio prático de código no Stacklyst.',
      },
      {
        title: 'Duelo Técnico',
        type: 'DUELO_TECNICO' as RecruitmentStageType,
        order: 3,
        description: 'Demonstre performance em combate de código.',
      },
      {
        title: 'Avaliação Técnica por Especialista',
        type: 'AVALIACAO' as RecruitmentStageType,
        order: 4,
        description: 'Revisão humana de arquitetura e boas práticas.',
      },
      { title: 'Entrevista', type: 'ENTREVISTA' as RecruitmentStageType, order: 5 },
      { title: 'Contratação', type: 'CONTRATACAO' as RecruitmentStageType, order: 6 },
    ];

    const job = await prisma.job.create({
      data: {
        company_id: companyId,
        title,
        description,
        level,
        technologies,
        modality,
        location,
        contract_type: contractType,
        salary_min: salaryMin,
        salary_max: salaryMax,
        requirements,
        benefits,
        status: 'OPEN',
        stages: {
          create: defaultStages.map((st) => ({
            title: st.title,
            type: st.type,
            order: st.order,
            challenge_id: st.challengeId,
            description: st.description,
          })),
        },
      },
      include: {
        stages: true,
        company: true,
      },
    });

    logger.info('Job opportunity created', { jobId: job.id, companyId });
    return job;
  },

  /**
   * Apply for a job and link developer's platform technical profile.
   */
  async applyForJob(userId: string, jobId: string) {
    const existing = await prisma.jobApplication.findUnique({
      where: {
        job_id_user_id: {
          job_id: jobId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      throw new Error('Você já se candidatou a esta vaga.');
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        company: true,
      },
    });

    if (!job || job.status !== 'OPEN') {
      throw new Error('Esta vaga não está mais aceitando inscrições.');
    }

    const firstStage = job.stages[0];

    const application = await prisma.jobApplication.create({
      data: {
        job_id: jobId,
        user_id: userId,
        stage_id: firstStage?.id,
        status: 'APPLIED',
      },
      include: {
        stage: true,
        job: { include: { company: true } },
      },
    });

    logger.info('User applied for job', { userId, jobId, applicationId: application.id });
    return application;
  },

  /**
   * Advance or update candidate application status in recruitment pipeline.
   */
  async updateApplicationStage(params: {
    applicationId: string;
    stageId?: string;
    status: ApplicationStatus;
    feedback?: string;
    technicalScore?: number;
  }) {
    const { applicationId, stageId, status, feedback, technicalScore } = params;

    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        stage_id: stageId,
        status,
        feedback,
        technical_score: technicalScore,
      },
      include: {
        job: { include: { company: true } },
        user: true,
      },
    });

    try {
      await NotificationService.create({
        userId: application.user_id,
        type: 'JOB_APPLICATION_UPDATE',
        resourceId: application.job_id,
        resourceType: 'JOB',
      });
    } catch (err) {
      logger.error('Failed to notify job application update', { error: String(err) });
    }

    return application;
  },

  /**
   * Create or register a company profile.
   */
  async createCompany(params: {
    ownerId: string;
    name: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    location?: string;
  }) {
    const slug = params.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const company = await prisma.company.create({
      data: {
        owner_id: params.ownerId,
        name: params.name,
        slug,
        description: params.description,
        logo_url: params.logoUrl,
        website: params.website,
        location: params.location,
        is_verified: false,
      },
    });

    // Upgrade user role to RECRUITER if currently standard USER
    await prisma.user.updateMany({
      where: { id: params.ownerId, role: 'USER' },
      data: { role: 'RECRUITER' },
    });

    return company;
  },
};
