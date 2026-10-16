import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState } from '~/components/ui';
import { api } from '~/lib/api';
import { LessonSession, type Lesson } from '~/features/learning/LessonSession';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => api<Lesson>('/api/mobile/lessons/' + id),
  });
  if (query.data) return <LessonSession key={id} lesson={query.data} />;
  return (
    <Screen title="Aprender" back>
      <AsyncState query={query}>{null}</AsyncState>
    </Screen>
  );
}
