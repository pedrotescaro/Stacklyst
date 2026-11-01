import { apiHandler } from '@/lib/api-handler';
import { NotFoundError } from '@/lib/errors';
import { getPublicCredential } from '@/lib/credentials/repository';

export const GET = apiHandler(
  async (_request, { params }) => {
    const { id } = await params;
    const record = await getPublicCredential(id);
    if (!record) throw new NotFoundError('CREDENTIAL_NOT_FOUND', 'Certificado não encontrado.');
    return Response.json(record, { headers: { 'Cache-Control': 'no-store' } });
  },
  { resolveSession: false }
);
