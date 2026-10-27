import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { getProfileCustomization } from '@/services/profile-customization.service';
export const GET = apiHandler(async (request) =>
  Response.json(
    await getProfileCustomization((await requireAuth()).id, {
      claimUnlocks: new URL(request.url).searchParams.get('notify') === '1',
    }),
    {
      headers: { 'Cache-Control': 'private, no-store' },
    }
  )
);
