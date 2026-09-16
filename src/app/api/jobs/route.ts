import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getAuthUser, requireRole } from '@/lib/auth';
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
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
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
  const level = (searchParams.get('level') as JobLevel) || undefined;
  const modality = (searchParams.get('modality') as JobModality) || undefined;
  const contract = (searchParams.get('contract') as JobContract) || undefined;
  const technology = searchParams.get('technology') || undefined;
  const statusParam = searchParams.get('status');
  const status = statusParam === 'ALL' ? 'ALL' : (statusParam as JobStatus) || 'OPEN';
  const companyId = searchParams.get('company_id') || undefined;

  const jobs = await JobService.listJobs({
    search,
    level,
    modality,
    contract,
    technology,
    status,
    companyId,
  });

  return NextResponse.json(jobs);
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
