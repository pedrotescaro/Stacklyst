import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';
import {
  SPOTIFY_SESSION_COOKIE,
  publicAccount,
  readSession,
  spotifyConnectConfigured,
} from '@/lib/spotify-connect';

const headers = { 'Cache-Control': 'private, no-store' };

/** Connection status for settings and the player. Never returns tokens. */
export const GET = apiHandler(async (_request, { session: user }) => {
  const configured = spotifyConnectConfigured();
  if (!user || !configured) {
    return Response.json({ configured, connected: false }, { headers });
  }
  const session = await readSession((await cookies()).get(SPOTIFY_SESSION_COOKIE)?.value, user.id);
  return Response.json({ configured, ...publicAccount(session) }, { headers });
});
