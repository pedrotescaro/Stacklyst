import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
export async function requireCompanyAccess(companyId: string, user: { id: string; role: string }) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new AppError('COMPANY_NOT_FOUND', 'Empresa não encontrada.', 404);
  if (user.role !== 'ADMIN' && (user.role !== 'RECRUITER' || company.owner_id !== user.id))
    throw new AppError('FORBIDDEN', 'Você não gerencia esta empresa.', 403);
  return company;
}
