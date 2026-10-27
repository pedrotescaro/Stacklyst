import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useSession } from '../../lib/session';
import type {
  ProfileCustomizationData,
  PublicCustomization,
} from '../../lib/profile-customization';

export function useCustomization() {
  const { session, isPreview } = useSession();
  return useQuery({
    queryKey: ['profile-customization', session?.user.id],
    queryFn: ({ signal }) =>
      api<ProfileCustomizationData>('/api/profile/customization', { signal }),
    enabled: !!session && !isPreview,
    staleTime: 15000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });
}
export function usePublicCustomization(username: string, enabled = true) {
  const { isPreview } = useSession();
  return useQuery({
    queryKey: ['profile-customization-public', username],
    queryFn: ({ signal }) =>
      api<PublicCustomization>(
        '/api/profile/customization?username=' + encodeURIComponent(username),
        { signal }
      ),
    enabled: enabled && !!username && !isPreview,
    staleTime: 15000,
  });
}
