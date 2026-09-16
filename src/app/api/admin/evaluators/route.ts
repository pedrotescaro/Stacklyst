import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth';
import { EvaluatorService } from '@/services/evaluator.service';
import { z } from 'zod';

const reviewSchema = z.object({
  application_id: z.string(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().trim().min(20, 'A justificativa deve ter pelo menos 20 caracteres'),
});

const moderationSchema = z.object({
  evaluator_id: z.string(),
  action: z.enum(['WARN', 'SUSPEND', 'REINSTATE', 'REVOKE']),
  notes: z.string().trim().min(20, 'O motivo deve ter pelo menos 20 caracteres'),
});

export const GET = apiHandler(async (req) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any;

  const applications = await EvaluatorService.listApplications(status);
  return NextResponse.json(applications);
});

export const POST = apiHandler(async (req) => {
  const admin = await requireAdmin();
  const body = await req.json();
  const parsed = reviewSchema.parse(body);

  const updated = await EvaluatorService.reviewApplication(
    parsed.application_id,
    admin.id,
    parsed.decision,
    parsed.notes
  );

  return NextResponse.json({
    success: true,
    message: `Candidatura ${parsed.decision === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso.`,
    application: updated,
  });
});

export const PATCH = apiHandler(async (req) => {
  await requireAdmin();
  const parsed = moderationSchema.parse(await req.json());
  const profile = await EvaluatorService.moderateEvaluator(
    parsed.evaluator_id,
    parsed.action,
    parsed.notes
  );

  return NextResponse.json({
    success: true,
    message: 'Medida aplicada ao perfil de avaliador.',
    profile,
  });
});
