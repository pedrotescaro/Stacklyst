import { getAuthIdentity } from '@/lib/auth-session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getAuthIdentity();

  redirect(user ? '/feed' : '/login');
}
