import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth, requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(2, 'Nome da empresa é obrigatório'),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
});

export const GET = apiHandler(async (request) => {
  const managed = new URL(request.url).searchParams.get('mine') === 'true';
  const manager = managed ? await requireRole(['RECRUITER', 'ADMIN']) : null;
  const companies = await prisma.company.findMany({
    where: manager && manager.role !== 'ADMIN' ? { owner_id: manager.id } : undefined,
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { jobs: true, events: true },
      },
    },
  });

  return NextResponse.json(companies, {
    headers: managed ? { 'Cache-Control': 'private, no-store' } : undefined,
  });
});

export const POST = apiHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const parsed = createCompanySchema.parse(body);

  const company = await JobService.createCompany({
    ownerId: user.id,
    name: parsed.name,
    description: parsed.description,
    logoUrl: parsed.logo_url,
    website: parsed.website,
    location: parsed.location,
  });

  return NextResponse.json({
    success: true,
    message: 'Empresa cadastrada com sucesso!',
    company,
  });
});
