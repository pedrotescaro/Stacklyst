import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth';
import { AdminService } from '@/services/admin.service';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const updateUserRoleSchema = z.object({
  user_id: z.string(),
  role: z.nativeEnum(UserRole),
});

export const GET = apiHandler(async (req) => {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const search = searchParams.get('search') || undefined;
  const role = (searchParams.get('role') as UserRole) || undefined;

  const result = await AdminService.listUsers({ page, limit, search, role });
  return NextResponse.json(result);
});

export const PATCH = apiHandler(async (req) => {
  const actor = await requireAdmin();
  const body = await req.json();
  const parsed = updateUserRoleSchema.parse(body);

  const updatedUser = await AdminService.updateUserRole(parsed.user_id, parsed.role, actor.id);
  return NextResponse.json({
    success: true,
    message: `Papel do usuário atualizado para ${parsed.role}.`,
    user: updatedUser,
  });
});
