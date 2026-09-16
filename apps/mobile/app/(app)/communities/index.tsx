import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, Field, AsyncState, RowLink, Button, Notice } from '~/components/ui';
import { api } from '~/lib/api';
import { Community } from '~/features/explore/types';
export default function Communities() {
  const [search, setSearch] = useState('');
  const q = useQuery({
    queryKey: ['communities'],
    queryFn: () => api<{ guilds: Community[]; myGuilds: Community[] }>('/api/guilds'),
  });
  const rows = [
    ...new Map(
      [...(q.data?.myGuilds ?? []), ...(q.data?.guilds ?? [])].map((g) => [g.id, g])
    ).values(),
  ].filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <Screen title="Comunidades" back>
      <Field label="Buscar comunidade" value={search} onChangeText={setSearch} />
      <Button
        secondary
        label="Criar comunidade"
        onPress={() => router.push('/communities/create')}
      />
      <AsyncState query={q}>
        {rows.length ? (
          rows.map((g) => (
            <RowLink
              key={g.id}
              title={g.name}
              subtitle={g.memberCount + ' participantes' + (g.isMember ? ' · Você participa' : '')}
              onPress={() => router.push(('/communities/' + g.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
