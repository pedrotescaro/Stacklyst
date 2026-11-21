import { apiHandler } from '@/lib/api-handler';
import { requireAuth } from '@/lib/auth';
import { chatPrivacyChange } from '@/lib/chat-privacy';
import { getChatPrivacy, saveChatPrivacy } from '@/services/chat-privacy.service';

export const GET = apiHandler(async () => {
  const user = await requireAuth();
  return Response.json(await getChatPrivacy(user.id), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});

export const PATCH = apiHandler(async (request) => {
  const user = await requireAuth();
  await saveChatPrivacy(user.id, chatPrivacyChange.parse(await request.json()));
  return new Response(null, { status: 204 });
});
