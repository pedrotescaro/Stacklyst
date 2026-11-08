import { z } from 'zod';
import { apiHandler } from '@/lib/api-handler';
import { requireRole } from '@/lib/auth';
import { assignRecruitmentActivity } from '@/services/job-activity.service';

export const PATCH = apiHandler(async (request, { params }) => {
  const user = await requireRole(['RECRUITER', 'ADMIN']);
  const { id, stageId } = await params;
  const { assignment } = z
    .object({ assignment: z.string().min(1).max(200) })
    .strict()
    .parse(await request.json().catch(() => null));
  return Response.json(await assignRecruitmentActivity(id, stageId, assignment, user));
});
