import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import {
  findProfileCustomizationByUsername,
  getProfileCustomization,
  saveProfileCustomization,
} from '@/services/profile-customization.service';

export const GET = apiHandler(async (request) => {
  const username = new URL(request.url).searchParams.get('username');
  const state = username
    ? await findProfileCustomizationByUsername(username)
    : await getProfileCustomization((await requireAuth()).id);
  return Response.json(state, { headers: { 'Cache-Control': 'private, no-store' } });
});
export const PUT = apiHandler(async (request) => {
  const user = await requireAuth();
  await rateLimit(`profile-customization:${user.id}`, {
    limit: 30,
    window: '1 m',
    endpoint: '/api/profile/customization',
  });
  return Response.json(await saveProfileCustomization(user.id, await request.json()), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
