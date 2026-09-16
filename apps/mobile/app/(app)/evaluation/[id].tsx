import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, Field, Choice, Notice } from '~/components/ui';
import { Action } from '~/components/remote';
import { CodeBlock } from '~/components/content';
import { RoleGate } from '~/components/RoleGate';
import { api } from '~/lib/api';
import { Duel, Person } from '~/lib/types';
type Review = Duel & { solutions: { id: string; code: string; user: Person }[] };
function Form({ d }: { d: Review }) {
  const [score1, setScore1] = useState('0'),
    [score2, setScore2] = useState('0'),
    [winner, setWinner] = useState(d.challenger_id),
    [feedback, setFeedback] = useState(''),
    [strengths, setStrengths] = useState(''),
    [improvements, setImprovements] = useState('');
  return (
    <>
      <Heading>{d.problem_title}</Heading>
      {d.solutions.map((s) => (
        <>
          <Label key={s.id}>Solução de @{s.user.username}</Label>
          <CodeBlock code={s.code} />
        </>
      ))}
      <Field
        label={'Nota de @' + d.challenger?.username + ' (0–1000)'}
        value={score1}
        onChangeText={setScore1}
        keyboardType="number-pad"
      />
      <Field
        label={'Nota de @' + d.opponent?.username + ' (0–1000)'}
        value={score2}
        onChangeText={setScore2}
        keyboardType="number-pad"
      />
      <Choice
        value={winner}
        onChange={setWinner}
        options={[
          { value: d.challenger_id, label: 'Vencedor: @' + d.challenger?.username },
          ...(d.opponent_id
            ? [{ value: d.opponent_id, label: 'Vencedor: @' + d.opponent?.username }]
            : []),
        ]}
      />
      <Field label="Parecer técnico" value={feedback} onChangeText={setFeedback} multiline />
      <Field
        label="Pontos fortes (um por linha)"
        value={strengths}
        onChangeText={setStrengths}
        multiline
      />
      <Field
        label="Melhorias (uma por linha)"
        value={improvements}
        onChangeText={setImprovements}
        multiline
      />
      <Action
        label="Enviar avaliação"
        path="/api/evaluations"
        body={{
          duel_id: d.id,
          score_player1: Number(score1),
          score_player2: Number(score2),
          winner_id: winner,
          human_feedback: feedback,
          strengths: strengths.split('\n').filter(Boolean),
          improvements: improvements.split('\n').filter(Boolean),
        }}
        confirmText="Confirmar notas, vencedor e parecer? Esta avaliação afeta o resultado do duelo."
        onSuccess={() => router.back()}
      />
    </>
  );
}
function Content() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => api<Review[]>('/api/evaluations'),
  });
  const d = q.data?.find((d) => d.id === id);
  return <AsyncState query={q}>{d ? <Form d={d} /> : <Notice />}</AsyncState>;
}
export default function Evaluation() {
  return (
    <Screen title="Revisar duelo" back>
      <RoleGate roles={['ADMIN', 'EVALUATOR']}>
        <Content />
      </RoleGate>
    </Screen>
  );
}
