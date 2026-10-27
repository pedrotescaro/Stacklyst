import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth';
import { AdminService } from '@/services/admin.service';
import { z } from 'zod';

const deleteReportSchema = z.object({
  report_id: z.string(),
  post_id: z.string(),
});

export const GET = apiHandler(async () => {
  await requireAdmin();
  const reports = await AdminService.listReports();
  return NextResponse.json(reports);
});

export const DELETE = apiHandler(async (req) => {
  const actor = await requireAdmin();
  const body = await req.json();
  const parsed = deleteReportSchema.parse(body);

  const result = await AdminService.deleteReportedPost(parsed.report_id, parsed.post_id, actor.id);
  return NextResponse.json(result);
});
