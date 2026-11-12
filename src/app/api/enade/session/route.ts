import { apiHandler } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';
import { UnauthorizedError, AppError } from '@/lib/errors';
import { enadeWorkspaceSchema } from '@/lib/enade/simulator-schema';
import { EMPTY_WORKSPACE, WORKSPACE_KEY } from '@/lib/enade/simulator';

export const GET = apiHandler(async (_request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const row = await prisma.mobileState.findUnique({
    where: { user_id_key: { user_id: session.id, key: WORKSPACE_KEY } },
  });
  return Response.json({ value: row?.value || EMPTY_WORKSPACE });
});
export const PUT = apiHandler(async (request, { session }) => {
  if (!session) throw new UnauthorizedError();
  const value = enadeWorkspaceSchema.parse(await request.json());
  const key = { user_id: session.id, key: WORKSPACE_KEY };
  const previous = await prisma.mobileState.findUnique({ where: { user_id_key: key } });
  const parsed = enadeWorkspaceSchema.safeParse(previous?.value);
  if (parsed.success && parsed.data.updatedAt > value.updatedAt)
    return Response.json({ value: parsed.data, newer: true });
  if (previous) {
    const result = await prisma.mobileState.updateMany({
      where: { ...key, version: previous.version },
      data: { value, version: { increment: 1 } },
    });
    if (!result.count)
      throw new AppError(
        'DRAFT_CONFLICT',
        'Outra aba salvou um progresso mais recente. Tente sincronizar novamente.',
        409
      );
  } else {
    try {
      await prisma.mobileState.create({ data: { ...key, value } });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002')
        throw new AppError(
          'DRAFT_CONFLICT',
          'Outro progresso foi salvo. Tente sincronizar novamente.',
          409
        );
      throw error;
    }
  }
  return Response.json({ value });
});
