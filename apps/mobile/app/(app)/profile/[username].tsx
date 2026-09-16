import { useLocalSearchParams } from 'expo-router';
import { Profile } from '~/features/profile/Profile';
export default function PublicProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();
  return <Profile username={username} />;
}
