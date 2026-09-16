import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, RowLink, Avatar, Button, Notice } from '~/components/ui';
import { api } from '~/lib/api';
import { Person } from '~/lib/types';
export default function Messages() {
  const q = useQuery({
    queryKey: ['chats'],
    queryFn: () =>
      api<{ partnerId: string; partner: Person; lastMessage: string }[]>('/api/messages/chats'),
    refetchInterval: 10000,
  });
  return (
    <Screen title="Mensagens" back>
      <Button
        secondary
        label="Encontrar pessoas"
        onPress={() => router.push('/explore?type=users')}
      />
      <AsyncState query={q}>
        {q.data?.length ? (
          q.data.map((chat) => (
            <RowLink
              key={chat.partnerId}
              leading={<Avatar uri={chat.partner.avatar_url} name={chat.partner.username} />}
              title={'@' + chat.partner.username}
              subtitle={chat.lastMessage}
              onPress={() => router.push(('/conversation/' + chat.partnerId) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
