import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getProfileCustomization } from '@/services/profile-customization.service';
import { TitlesShowcaseView } from '@/components/titles/TitlesShowcaseView';
import { Sidebar } from '@/components/Sidebar';
import { FeedRightSidebar } from '@/components/FeedRightSidebar';

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const state = await getProfileCustomization(user.id);

  return (
    <div data-testid="titles-shell" className="dd-platform-shell dd-platform-shell--fullscreen">
      <Sidebar user={user} hideMobileHeader />
      <div className="mx-auto flex w-full min-w-0 flex-grow items-start justify-center xl:max-w-[1480px] 2xl:max-w-[1600px] xl:justify-start">
        <main
          data-testid="primary-column"
          className="flex min-h-screen w-full min-w-0 max-w-[720px] xl:max-w-[820px] 2xl:max-w-[920px] flex-grow flex-col border-r border-dd-border/80 bg-dd-bg pb-24 md:pb-8"
        >
          <TitlesShowcaseView
            initialData={state}
            user={{
              id: user.id,
              username: user.username,
              avatar_url: user.avatar_url,
            }}
          />
        </main>
        <FeedRightSidebar user={user} />
      </div>
    </div>
  );
}
