import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { executeCode } from '@/lib/code-execution/server';
import { RATE_LIMIT_CODE_RUN } from '@/lib/config';
import { rateLimit } from '@/lib/ratelimit';
import { requireAuth } from '@/lib/auth';

const runSchema = z.object({
  code: z.string().min(1).max(10_000),
  language: z.string().min(1),
});

export const POST = apiHandler(async (request) => {
  const user = await requireAuth();
  await rateLimit(`code-run:${user.id}`, {
    ...RATE_LIMIT_CODE_RUN,
    endpoint: '/api/run',
  });

  const { code, language } = runSchema.parse(await request.json());
  const normalized = language.toLowerCase();

  const result = await executeCode(code, normalized);
  const status = result.error?.startsWith('Linguagem') ? 400 : result.executionMs === 0 ? 502 : 200;

  return NextResponse.json(result, { status });
});
