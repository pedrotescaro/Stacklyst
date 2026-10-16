import { Redirect } from 'expo-router';

// Community screens are preserved for a future release. Do not mount their
// Stack or queries, including when an old link opens details or creation.
export default function DisabledCommunities() {
  return <Redirect href="/explore" />;
}
