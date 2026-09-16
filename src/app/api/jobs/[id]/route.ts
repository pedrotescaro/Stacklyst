import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { getAuthUser, requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { requireCompanyAccess } from '@/lib/mobile/company-access';

const updateStageSchema = z.object({
  application_id: z.string(),
  stage_id: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus),
  feedback: z.string().optional(),
  technical_score: z.number().optional(),
});

export const GET = apiHandler(async (_req, { params }) => {
  const { id: jobId } = await params;
  const user = await getAuthUser();

  const job = await JobService.getJobById(jobId, user?.id);
  if (!job) {
    return NextResponse.json({ error: 'Vaga não encontrada.' }, { status: 404 });
  }

  return NextResponse.json(job);
});

export const PATCH = apiHandler(async (req, { params }) => {
  const user = await requireRole(['RECRUITER', 'ADMIN']);
  const { id } = await params;
  const job = await prisma.job.findUniqueOrThrow({ where: { id } });
  await requireCompanyAccess(job.company_id, user);
  const body = await req.json();
  const parsed = updateStageSchema.parse(body);
  const application = await prisma.jobApplication.findFirst({
    where: { id: parsed.application_id, job_id: id },
  });
  if (!application)
    return NextResponse.json({ error: 'Candidatura não encontrada nesta vaga.' }, { status: 404 });
  if (
    parsed.stage_id &&
    !(await prisma.jobRecruitmentStage.findFirst({ where: { id: parsed.stage_id, job_id: id } }))
  )
    return NextResponse.json({ error: 'Etapa inválida para esta vaga.' }, { status: 400 });

  const updatedApplication = await JobService.updateApplicationStage({
    applicationId: parsed.application_id,
    stageId: parsed.stage_id,
    status: parsed.status,
    feedback: parsed.feedback,
    technicalScore: parsed.technical_score,
  });

  return NextResponse.json({
    success: true,
    message: 'Etapa do candidato atualizada com sucesso!',
    application: updatedApplication,
  });
});
