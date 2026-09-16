import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, Heading, Label, Choice, RowLink, AsyncState, Notice } from '~/components/ui';
import { Action } from '~/components/remote';
import { api } from '~/lib/api';
import { Duel, Person } from '~/lib/types';
export default function Duels() {
  const [language, setLanguage] = useState('TS');
  const q = useQuery({
    queryKey: ['duels'],
    queryFn: () => api<Duel[]>('/api/duels'),
    refetchInterval: 15000,
  });
  const requests = useQuery({
    queryKey: ['duel-invites'],
    queryFn: () =>
      api<{ id: string; sender: Person; language: string }[]>('/api/duels/pending-requests'),
    refetchInterval: 10000,
  });
  return (
    <Screen title="Duelos">
      <Heading>Pratique sob pressão.</Heading>
      <Label muted>Entre na arena e resolva um desafio com outro desenvolvedor.</Label>
      <Choice
        value={language}
        onChange={setLanguage}
        options={['TS', 'JS', 'PYTHON'].map((value) => ({ value, label: value }))}
      />
      <Action
        label="Encontrar um duelo"
        path="/api/duels"
        body={{ isQuickMatch: true, language }}
        onSuccess={(r) => router.push(('/duel/' + r.duel.id) as never)}
      />
      {requests.data?.map((r) => (
        <>
          <Heading key={r.id}>Convite de @{r.sender.username}</Heading>
          <Action
            label="Aceitar convite"
            path="/api/duels/respond"
            body={{ request_id: r.id, action: 'ACCEPT' }}
            onSuccess={(r) => r.duel?.id && router.push(('/duel/' + r.duel.id) as never)}
          />
          <Action
            secondary
            label="Recusar convite"
            path="/api/duels/respond"
            body={{ request_id: r.id, action: 'REJECT' }}
          />
        </>
      ))}
      <Heading>Arena</Heading>
      <AsyncState query={q}>
        {q.data?.length ? (
          q.data.map((d) => (
            <RowLink
              key={d.id}
              title={d.problem_title}
              subtitle={d.language + ' · ' + d.status + ' · @' + d.challenger?.username}
              onPress={() => router.push(('/duel/' + d.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
