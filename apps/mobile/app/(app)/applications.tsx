import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, RowLink, Notice } from '~/components/ui';
import { api } from '~/lib/api';
export default function Applications() {
  const q = useQuery({
    queryKey: ['applications'],
    queryFn: () =>
      api<{ id: string; status: string; job: { id: string; title: string } }[]>(
        '/api/mobile/applications'
      ),
  });
  return (
    <Screen title="Minhas candidaturas" back>
      <AsyncState query={q}>
        {q.data?.length ? (
          q.data.map((a) => (
            <RowLink
              key={a.id}
              title={a.job.title}
              subtitle={a.status}
              onPress={() => router.push(('/jobs/' + a.job.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
