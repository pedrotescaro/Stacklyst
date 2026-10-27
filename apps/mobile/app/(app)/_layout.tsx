import { Stack, Redirect, usePathname, useGlobalSearchParams } from 'expo-router';
import { useSession } from '../../src/lib/session';
import { Loading } from '../../src/components/ui';
import { configured } from '../../src/lib/config';
import { AchievementNotice } from '../../src/features/profile/AchievementNotice';
export default function Layout() {
  const { session, ready, isPreview } = useSession();
  const path = usePathname();
  const params = useGlobalSearchParams();
  if (!ready && !isPreview) return <Loading />;
  if ((!configured || !session) && !isPreview)
    return (
      <Redirect
        href={{
          pathname: '/auth',
          params: {
            returnTo:
              path +
              (Object.keys(params).length
                ? '?' +
                  new URLSearchParams(
                    Object.entries(params)
                      .filter(([k]) => k !== 'returnTo')
                      .map(([k, v]) => [k, String(v)])
                  ).toString()
                : ''),
          },
        }}
      />
    );
  return (
    <>
      <Stack key={isPreview ? 'preview' : session?.user.id} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
      </Stack>
      <AchievementNotice />
    </>
  );
}
