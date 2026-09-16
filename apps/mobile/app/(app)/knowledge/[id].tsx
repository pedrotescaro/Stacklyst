import { router, useLocalSearchParams } from 'expo-router';
import { Screen, AsyncState, Heading, Label, RowLink, Button, Notice } from '~/components/ui';
import { useLearning } from '~/features/learning/hooks';
export default function Knowledge() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useLearning();
  const n = q.data?.nodes.find((n) => n.id === id);
  return (
    <Screen title="Conhecimento" back>
      <AsyncState query={q}>
        {n ? (
          <>
            <Heading>{n.title}</Heading>
            <Label>{n.description}</Label>
            <Label muted>
              Domínio: {n.mastery}% · {n.completedExercises}/{n.exercises.length} atividades
              concluídas
            </Label>
            {n.prerequisites.map((p) => (
              <RowLink
                key={p.nodeId}
                title={p.title}
                subtitle={
                  (p.relation === 'REQUIRED' ? 'Obrigatório' : 'Recomendado') +
                  (p.completed ? ' · Concluído' : '')
                }
                onPress={() => router.push(('/knowledge/' + p.nodeId) as never)}
              />
            ))}
            {n.lessonId ? (
              <Button
                label="Iniciar lição"
                onPress={() => router.push(('/lesson/' + n.lessonId) as never)}
              />
            ) : (
              n.exercises.map((e) => (
                <RowLink
                  key={e.id}
                  title={e.title}
                  subtitle={(e.completed ? 'Concluído · ' : '') + e.baseXp + ' XP'}
                  onPress={() => router.push(('/exercise/' + e.id) as never)}
                />
              ))
            )}
          </>
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
