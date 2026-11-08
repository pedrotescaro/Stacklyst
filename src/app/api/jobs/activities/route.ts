import { apiHandler } from '@/lib/api-handler';
import { requireRole } from '@/lib/auth';
import { getRecruitmentActivities } from '@/services/job-activity.service';

export const GET = apiHandler(async () => {
  await requireRole(['RECRUITER', 'ADMIN']);
  return Response.json(await getRecruitmentActivities());
});
