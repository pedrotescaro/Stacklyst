import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { getCredentialCollection } from '@/lib/credentials/repository';

export const GET = apiHandler(async () =>
  Response.json(await getCredentialCollection((await requireAuth()).id), {
    headers: { 'Cache-Control': 'private, no-store' },
  })
);
