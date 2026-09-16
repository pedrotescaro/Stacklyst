import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, Field, RowLink, Notice } from '~/components/ui';
import { Action } from '~/components/remote';
import { api } from '~/lib/api';
import { Duel } from '~/lib/types';
import { useMe } from '~/lib/session';
function Queue() {
  const q = useQuery({ queryKey: ['evaluations'], queryFn: () => api<Duel[]>('/api/evaluations') });
  return (
    <AsyncState query={q}>
      {q.data?.length ? (
        q.data.map((d) => (
          <RowLink
            key={d.id}
            title={d.problem_title}
            subtitle={d.language + ' · Aguardando revisão'}
            onPress={() => router.push(('/evaluation/' + d.id) as never)}
          />
        ))
      ) : (
        <Notice />
      )}
    </AsyncState>
  );
}
function Application() {
  const [motivation, setMotivation] = useState(''),
    [stack, setStack] = useState('');
  const q = useQuery({
    queryKey: ['eligibility'],
    queryFn: () =>
      api<{
        eligible: boolean;
        totalXp: number;
        hasPendingApplication: boolean;
        latestApplication?: { status: string };
      }>('/api/evaluators/eligibility'),
  });
  return (
    <AsyncState query={q}>
      <Heading>Compartilhe sua experiência</Heading>
      <Label>
        Elegibilidade: uma trilha completa ou pelo menos 1.000 XP, conforme as regras do servidor.
      </Label>
      <Label muted>
        Seu XP: {q.data?.totalXp ?? 0} · Candidatura:{' '}
        {q.data?.latestApplication?.status ?? 'Não enviada'}
      </Label>
      {q.data?.eligible && !q.data.hasPendingApplication && (
        <>
          <Field
            label="Por que você quer avaliar?"
            value={motivation}
            onChangeText={setMotivation}
            multiline
          />
          <Field
            label="Tecnologias (separadas por vírgula)"
            value={stack}
            onChangeText={setStack}
          />
          <Action
            label="Enviar candidatura"
            path="/api/evaluators/apply"
            body={{
              motivation,
              tech_stack: stack
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            }}
          />
        </>
      )}
    </AsyncState>
  );
}
export default function Evaluator() {
  const me = useMe();
  return (
    <Screen title="Avaliação técnica" back>
      {['ADMIN', 'EVALUATOR'].includes(me.data?.role ?? '') ? <Queue /> : <Application />}
    </Screen>
  );
}
