import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, RowLink, Button, Notice } from '~/components/ui';
import { api } from '~/lib/api';
import { Event } from '~/features/explore/types';
export default function Events() {
  const q = useQuery({ queryKey: ['events'], queryFn: () => api<Event[]>('/api/events') });
  return (
    <Screen title="Eventos" back>
      <Button secondary label="Organizar evento" onPress={() => router.push('/events/create')} />
      <AsyncState query={q}>
        {q.data?.length ? (
          q.data.map((e) => (
            <RowLink
              key={e.id}
              title={e.title}
              subtitle={new Date(e.start_date).toLocaleDateString('pt-BR') + ' · ' + e.status}
              onPress={() => router.push(('/events/' + e.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
