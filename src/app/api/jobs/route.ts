import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';
import { z } from 'zod';
import { requireCompanyAccess } from '@/lib/mobile/company-access';
import {
  JobContract,
  JobLevel,
  JobModality,
  JobStatus,
  RecruitmentStageType,
} from '@prisma/client';

const createJobSchema = z.object({
  company_id: z.string(),
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().min(10, 'Descrição detalhada é necessária'),
  level: z.nativeEnum(JobLevel).default('JUNIOR'),
  technologies: z.array(z.string()).min(1, 'Informe pelo menos uma tecnologia'),
  modality: z.nativeEnum(JobModality).default('REMOTE'),
  location: z.string().optional(),
  contract_type: z.nativeEnum(JobContract).default('CLT'),
  salary_min: z.number().int().min(0).optional(),
  salary_max: z.number().int().min(0).optional(),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  stages: z
    .array(
      z.object({
        title: z.string(),
        type: z.nativeEnum(RecruitmentStageType),
        order: z.number(),
        challengeId: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

// GET /api/jobs: List all jobs with optional filters
export const GET = apiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const level = z
    .nativeEnum(JobLevel)
    .optional()
    .parse(searchParams.get('level') || undefined);
  const modality = z
    .nativeEnum(JobModality)
    .optional()
    .parse(searchParams.get('modality') || undefined);
  const contract = z
    .nativeEnum(JobContract)
    .optional()
    .parse(searchParams.get('contract') || undefined);
  const technology = searchParams.get('technology') || undefined;
  const statusParam = searchParams.get('status');
  const status = z.union([z.nativeEnum(JobStatus), z.literal('ALL')]).parse(statusParam || 'OPEN');
  const companyId = searchParams.get('company_id') || undefined;
  const managed = searchParams.get('mine') === 'true';
  const manager = managed ? await requireRole(['RECRUITER', 'ADMIN']) : null;

  const jobs = await JobService.listJobs({
    search,
    level,
    modality,
    contract,
    technology,
    status,
    companyId,
    ownerId: manager && manager.role !== 'ADMIN' ? manager.id : undefined,
    includeExpired: managed,
  });

  return NextResponse.json(jobs, {
    headers: managed ? { 'Cache-Control': 'private, no-store' } : undefined,
  });
});

// POST /api/jobs: Create new job (Recruiter or Admin)
export const POST = apiHandler(async (req) => {
  const user = await requireRole(['RECRUITER', 'ADMIN']);
  const body = await req.json();
  const parsed = createJobSchema.parse(body);
  await requireCompanyAccess(parsed.company_id, user);

  const job = await JobService.createJob({
    companyId: parsed.company_id,
    title: parsed.title,
    description: parsed.description,
    level: parsed.level,
    technologies: parsed.technologies,
    modality: parsed.modality,
    location: parsed.location,
    contractType: parsed.contract_type,
    salaryMin: parsed.salary_min,
    salaryMax: parsed.salary_max,
    requirements: parsed.requirements,
    benefits: parsed.benefits,
    stages: parsed.stages,
  });

  return NextResponse.json({
    success: true,
    message: 'Vaga publicada com sucesso!',
    job,
  });
});
