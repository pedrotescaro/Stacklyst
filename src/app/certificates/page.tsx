import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  redirect(`/profile/${encodeURIComponent(user.username)}?tab=certificates`);
}
