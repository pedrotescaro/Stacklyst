import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { EvaluatorService } from '@/services/evaluator.service';
import { z } from 'zod';
import { EVALUATOR_MIN_MOTIVATION_LENGTH } from '@/lib/evaluators/policy';

const applySchema = z.object({
  motivation: z
    .string()
    .trim()
    .min(
      EVALUATOR_MIN_MOTIVATION_LENGTH,
      `A motivação deve conter pelo menos ${EVALUATOR_MIN_MOTIVATION_LENGTH} caracteres`
    ),
  tech_stack: z.array(z.string()).min(1, 'Selecione pelo menos uma tecnologia'),
});

export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const parsed = applySchema.parse(body);

  const application = await EvaluatorService.applyForEvaluator(
    user.id,
    parsed.motivation,
    parsed.tech_stack
  );

  return NextResponse.json({
    success: true,
    message: 'Candidatura a avaliador enviada com sucesso! Aguarde a aprovação do administrador.',
    application,
  });
});
