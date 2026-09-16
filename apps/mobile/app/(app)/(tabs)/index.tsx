import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import IconSearch from '@tabler/icons-react-native/IconSearch';
import IconBell from '@tabler/icons-react-native/IconBell';
import IconMail from '@tabler/icons-react-native/IconMail';
import IconPlus from '@tabler/icons-react-native/IconPlus';
import { Screen, Choice, IconButton, Button } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import { PostCard } from '~/features/feed/PostCard';
import { Post } from '~/lib/types';
import { api } from '~/lib/api';
import { queryClient } from '~/lib/query';
import { colors } from '~/theme';
export default function Feed() {
  const [filter, setFilter] = useState('community');
  const [since, setSince] = useState(() => new Date().toISOString());
  const unread = useQuery({
    queryKey: ['unread'],
    queryFn: () => api<{ count: number }>('/api/notifications/unread-count'),
    refetchInterval: 30000,
  });
  const fresh = useQuery({
    queryKey: ['new-posts', filter, since],
    queryFn: () =>
      api<{ count: number }>(
        '/api/posts?mode=count&after=' + encodeURIComponent(since) + '&filter=' + filter
      ),
    refetchInterval: 30000,
  });
  return (
    <Screen
      title="Stacklyst"
      scroll={false}
      actions={
        <>
          <IconButton
            label="Explorar"
            onPress={() => router.push('/explore')}
            icon={<IconSearch color={colors.text} />}
          />
          <IconButton
            label="Mensagens"
            onPress={() => router.push('/messages')}
            icon={<IconMail color={colors.text} />}
          />
          <IconButton
            label={'Notificações: ' + (unread.data?.count ?? 0)}
            onPress={() => router.push('/notifications')}
            icon={<IconBell color={unread.data?.count ? colors.primary : colors.text} />}
          />
        </>
      }
    >
      <Choice
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'community', label: 'Comunidade' },
          { value: 'following', label: 'Seguindo' },
        ]}
      />
      <RemoteList<Post>
        key={filter}
        path={'/api/posts?limit=15&filter=' + filter}
        render={(post) => <PostCard post={post} />}
        header={
          fresh.data?.count ? (
            <Button
              label={fresh.data.count + ' novas publicações'}
              onPress={() => {
                queryClient.invalidateQueries({ queryKey: ['list'] });
                setSince(new Date().toISOString());
              }}
            />
          ) : null
        }
      />
      <View
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: colors.primary,
          borderRadius: 16,
        }}
      >
        <IconButton
          label="Criar publicação"
          onPress={() => router.push('/compose')}
          icon={<IconPlus color="#fff" />}
        />
      </View>
    </Screen>
  );
}
