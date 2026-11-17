import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';
import { z } from 'zod';

const updateCompanySchema = z.object({
  name: z.string().trim().min(2, 'Nome da empresa é obrigatório').max(100),
  description: z.string().trim().max(5000).optional(),
  website: z.union([z.literal(''), z.url('Informe um endereço de site válido')]).optional(),
  location: z.string().trim().max(200).optional(),
});

export const PATCH = apiHandler(async (req, { params }) => {
  const user = await requireRole(['RECRUITER', 'ADMIN']);
  const { id } = await params;
  const parsed = updateCompanySchema.parse(await req.json());

  const company = await JobService.updateCompany(id, user, parsed);

  return NextResponse.json({
    success: true,
    message: 'Empresa atualizada com sucesso!',
    company,
  });
});

export const DELETE = apiHandler(async (_req, { params }) => {
  const user = await requireRole(['RECRUITER', 'ADMIN']);
  const { id } = await params;

  await JobService.deleteCompany(id, user);

  return NextResponse.json({
    success: true,
    message: 'Empresa excluída com sucesso!',
  });
});
