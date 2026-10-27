import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { ProfileCatalogEditor } from '@/components/profile-customization/ProfileCatalogEditor';

export const dynamic = 'force-dynamic';

export default async function ProfileCatalogPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/personalize');
  return <ProfileCatalogEditor />;
}
