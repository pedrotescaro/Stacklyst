import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, Button, Choice } from '~/components/ui';
import { Action } from '~/components/remote';
import { RichText, DraftConflict } from '~/components/content';
import { Editor } from '~/components/Editor';
import { useDraft } from '~/lib/draft';
import { useMe } from '~/lib/session';
import { supabase } from '~/lib/supabase';
import { api, send, errorMessage } from '~/lib/api';
import { queryClient } from '~/lib/query';
import { Duel, Result } from '~/lib/types';
import { ResultView } from '~/features/learning/ResultView';
function Arena({ duel }: { duel: Duel }) {
  const me = useMe();
  const draft = useDraft('duel:' + duel.id + ':' + duel.language);
  const [now, setNow] = useState(Date.now()),
    [connection, setConnection] = useState('Conectando…'),
    [presence, setPresence] = useState(false),
    [area, setArea] = useState('problem'),
    [submitted, setSubmitted] = useState(false);
  const participant = me.data?.id === duel.challenger_id || me.data?.id === duel.opponent_id;
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!participant || !me.data) return;
    const channel = supabase.channel('duel:' + duel.id, {
      config: { presence: { key: me.data.id } },
    });
    channel.on('presence', { event: 'sync' }, () => {
      setPresence(Object.keys(channel.presenceState()).some((id) => id !== me.data!.id));
    });
    // Client events only request a server refresh, never alter the result.
    channel.on('broadcast', { event: 'opponent_won' }, () =>
      queryClient.invalidateQueries({ queryKey: ['duel', duel.id] })
    );
    channel.subscribe((status) => {
      setConnection(status === 'SUBSCRIBED' ? 'Conectado' : 'Reconectando…');
      if (status === 'SUBSCRIBED') {
        channel.track({ userId: me.data!.id, username: me.data!.username });
        queryClient.invalidateQueries({ queryKey: ['duel', duel.id] });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [duel.id, participant, me.data]);
  const end = duel.started_at ? Date.parse(duel.started_at) + duel.time_limit_seconds * 1000 : 0;
  const remaining = Math.max(0, Math.ceil((end - now) / 1000));
  const m = useMutation({
    mutationFn: (action: 'run' | 'solution') =>
      send<Result>('/api/duels/' + duel.id + '/' + action, { code: draft.value }),
    onSuccess: (_r, a) => {
      setSubmitted(a === 'solution');
      queryClient.invalidateQueries({ queryKey: ['duel', duel.id] });
    },
  });
  return (
    <>
      <Heading>{duel.problem_title}</Heading>
      <Label>
        {duel.status} · {duel.language}
      </Label>
      <Label muted>
        @{duel.challenger?.username} × @{duel.opponent?.username || 'aguardando oponente'}
      </Label>
      {duel.status === 'PENDING' && me.data?.id !== duel.challenger_id && (
        <Action
          label="Entrar no duelo"
          path={'/api/duels/' + duel.id}
          method="PATCH"
          body={{ action: 'join' }}
        />
      )}
      {duel.status === 'ACTIVE' && (
        <>
          <Heading>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} restantes
          </Heading>
          <Label muted>
            {connection} · {presence ? 'Oponente presente' : 'Oponente sem presença confirmada'}
          </Label>
        </>
      )}
      <Choice
        value={area}
        onChange={setArea}
        options={[
          { value: 'problem', label: 'Enunciado' },
          { value: 'code', label: 'Código' },
          { value: 'result', label: 'Resultado' },
        ]}
      />
      {area === 'problem' && <RichText body={duel.problem_body} />}
      {area === 'code' && participant && (
        <>
          {draft.ready && (
            <Editor value={draft.value} onChange={draft.setValue} language={duel.language} />
          )}
          <Label muted>{draft.status}</Label>
          <Button secondary label="Sincronizar rascunho" onPress={draft.sync} />
          <DraftConflict draft={draft} />
        </>
      )}
      {duel.status === 'ACTIVE' && participant && (
        <>
          <Button
            secondary
            label="Testar casos públicos"
            disabled={!remaining}
            busy={m.isPending}
            onPress={() => m.mutate('run')}
          />
          <Button
            label="Enviar solução"
            disabled={!remaining}
            busy={m.isPending}
            onPress={() => m.mutate('solution')}
          />
        </>
      )}
      {m.error && <Label>{errorMessage(m.error)}</Label>}
      {m.data && <ResultView result={m.data} submitted={submitted} />}
      {area === 'result' && (
        <>
          {duel.winner && <Heading>Vencedor: @{duel.winner.username}</Heading>}
          {duel.status === 'REVIEW_PENDING' && <Label>Aguardando avaliação humana.</Label>}
          {duel.submissions?.map((s) => (
            <Label key={s.id}>
              {s.status} · {s.passed_tests}/{s.total_tests} testes
            </Label>
          ))}
          {duel.evaluations?.map((e, i) => (
            <Label key={i}>{e.human_feedback}</Label>
          ))}
        </>
      )}
      {duel.status === 'PENDING' && me.data?.id === duel.challenger_id && (
        <Action
          secondary
          label="Cancelar duelo"
          path={'/api/duels/' + duel.id}
          method="DELETE"
          confirmText="Cancelar este duelo enquanto aguarda um oponente?"
        />
      )}
    </>
  );
}
export default function DuelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['duel', id],
    queryFn: () => api<Duel>('/api/duels/' + id),
    refetchInterval: 5000,
  });
  return (
    <Screen title="Arena" back>
      <AsyncState query={q}>{q.data && <Arena duel={q.data} />}</AsyncState>
    </Screen>
  );
}
