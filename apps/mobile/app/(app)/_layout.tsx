import { Stack, Redirect, usePathname, useGlobalSearchParams } from 'expo-router';
import { useSession } from '../../src/lib/session';
import { Loading, Screen, Label } from '../../src/components/ui';
import { configured } from '../../src/lib/config';
export default function Layout() {
  const { session, ready } = useSession();
  const path = usePathname();
  const params = useGlobalSearchParams();
  if (!configured)
    return (
      <Screen title="Configurar Stacklyst">
        <Label>
          Defina a URL da API e as credenciais públicas do Supabase em apps/mobile/.env para
          conectar sua conta.
        </Label>
      </Screen>
    );
  if (!ready) return <Loading />;
  if (!session)
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
    <Stack key={session.user.id} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
