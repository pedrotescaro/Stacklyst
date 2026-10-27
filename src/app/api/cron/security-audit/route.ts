import { timingSafeEqual } from 'node:crypto';
import { purgeExpiredSecurityAudit } from '@/lib/security-audit';
import { apiHandler } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const POST = apiHandler(
  async (request) => {
    const secret = process.env.CRON_SECRET;
    const provided = request.headers.get('authorization') ?? '';
    const expected = secret ? `Bearer ${secret}` : '';
    if (
      !secret ||
      Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    ) {
      return Response.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const result = await purgeExpiredSecurityAudit();
    return Response.json({ deleted: result.count });
  },
  { resolveSession: false }
);
