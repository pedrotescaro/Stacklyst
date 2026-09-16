import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, RowLink, Avatar } from '~/components/ui';
import { Action } from '~/components/remote';
import { api } from '~/lib/api';
import { Community } from '~/features/explore/types';
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['community', id],
    queryFn: () => api<Community>('/api/guilds/' + id),
  });
  const g = q.data;
  return (
    <Screen title="Comunidade" back>
      <AsyncState query={q}>
        {g && (
          <>
            <Heading>{g.name}</Heading>
            <Label>{g.description}</Label>
            <Label muted>{g.memberCount} participantes</Label>
            {g.userRole !== 'OWNER' && (
              <Action
                label={g.isMember ? 'Sair da comunidade' : 'Participar'}
                path={'/api/guilds/' + id + '/members'}
                method={g.isMember ? 'DELETE' : 'POST'}
                confirmText={g.isMember ? 'Sair desta comunidade?' : undefined}
              />
            )}
            <Heading>Participantes</Heading>
            {g.members?.map((m) => (
              <RowLink
                key={m.id}
                title={'@' + m.user.username}
                subtitle={m.role}
                leading={<Avatar name={m.user.username} uri={m.user.avatar_url} />}
                onPress={() => router.push(('/profile/' + m.user.username) as never)}
              />
            ))}
          </>
        )}
      </AsyncState>
    </Screen>
  );
}
