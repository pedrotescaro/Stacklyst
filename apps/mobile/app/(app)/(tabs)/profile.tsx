import { useMe } from '~/lib/session';
import { Profile } from '~/features/profile/Profile';
import { Screen, AsyncState } from '~/components/ui';
export default function OwnProfile() {
  const me = useMe();
  return me.data ? (
    <Profile username={me.data.username} own />
  ) : (
    <Screen title="Perfil">
      <AsyncState query={me}>{null}</AsyncState>
    </Screen>
  );
}
