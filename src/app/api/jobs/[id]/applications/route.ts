import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { requireRole } from '@/lib/auth';
import { JobService } from '@/services/job.service';

export const GET = apiHandler(async (_req, { params }) => {
  const user = await requireRole(['RECRUITER', 'ADMIN']);
  const { id: jobId } = await params;

  const applications = await JobService.getJobApplications(jobId, user.id, user.role);

  return NextResponse.json(applications);
});
