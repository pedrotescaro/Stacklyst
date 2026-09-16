import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, RowLink } from '~/components/ui';
import { Action } from '~/components/remote';
import { RichText } from '~/components/content';
import { api } from '~/lib/api';
import { useMe } from '~/lib/session';
import { Event } from '~/features/explore/types';
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useMe();
  const q = useQuery({
    queryKey: ['event', id],
    queryFn: () =>
      api<Event & { is_joined: boolean; userParticipation?: { score: number; rank: number } }>(
        '/api/events/' + id
      ),
  });
  const e = q.data;
  return (
    <Screen title="Evento" back>
      <AsyncState query={q}>
        {e && (
          <>
            <Heading>{e.title}</Heading>
            <Label>
              {new Date(e.start_date).toLocaleString('pt-BR')} até{' '}
              {new Date(e.end_date).toLocaleString('pt-BR')}
            </Label>
            <RichText body={e.description} />
            <Label muted>
              Nível mínimo: {e.min_level} · {e.status}
            </Label>
            <Action
              label={e.is_joined ? 'Cancelar participação' : 'Participar do evento'}
              path={'/api/events/' + id + '/participate'}
              method={e.is_joined ? 'DELETE' : 'POST'}
              confirmText={e.is_joined ? 'Cancelar sua participação?' : undefined}
            />
            {e.userParticipation && (
              <Label>
                Pontuação: {e.userParticipation.score} · Posição:{' '}
                {e.userParticipation.rank ?? 'Ainda não definida'}
              </Label>
            )}
            <Heading>Participantes</Heading>
            {e.participants?.map((p) => (
              <RowLink
                key={p.user.id}
                title={'@' + p.user.username}
                onPress={() => router.push(('/profile/' + p.user.username) as never)}
              />
            ))}
            {(me.data?.role === 'ADMIN' || me.data?.id === e.creator_id) && (
              <Action
                secondary
                label="Excluir evento"
                path={'/api/events/' + id}
                method="DELETE"
                confirmText="Excluir este evento e suas participações?"
                onSuccess={() => router.back()}
              />
            )}
          </>
        )}
      </AsyncState>
    </Screen>
  );
}
