import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getProfileCustomization } from '@/services/profile-customization.service';
import { TitlesShowcaseView } from '@/components/titles/TitlesShowcaseView';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const state = await getProfileCustomization(user.id);

  return (
    <TitlesShowcaseView
      initialData={state}
      user={{
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
      }}
    />
  );
}
