import { getAuthIdentity } from '@/lib/auth-session';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const user = await getAuthIdentity();
  return <HomeClient initialUser={user} />;
}
