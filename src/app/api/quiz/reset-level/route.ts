import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const resetLevelSchema = z.object({
  question_ids: z.array(z.string()),
});

export const POST = apiHandler(async (req) => {
  await requireAuth();

  const body = await req.json();
  resetLevelSchema.parse(body);
  // A review starts a new UI session, never erases the completion/reward ledger.
  return NextResponse.json({ success: true, review: true, xpPolicy: 'first_completion_only' });
});
