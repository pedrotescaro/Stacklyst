import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { ProfilePersonalizationEditor } from '@/components/profile-customization/ProfilePersonalizationEditor';

export const dynamic = 'force-dynamic';

export default async function PersonalizePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const user = await getAuthUser();
  if (!user) redirect('/login');
  const { section } = await searchParams;
  return (
    <ProfilePersonalizationEditor
      initialSection={section === 'frames' ? 'frames' : 'appearance'}
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        avatar_config: user.avatar_config,
        banner_url: user.banner_url,
        role: user.role,
      }}
    />
  );
}
