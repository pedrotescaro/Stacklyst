import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Screen, Heading, Label, Field, Choice, Button } from '~/components/ui';
import { api, send, errorMessage } from '~/lib/api';
export default function Onboarding() {
  const [language, setLanguage] = useState('JS'),
    [goal, setGoal] = useState('learn'),
    [minutes, setMinutes] = useState('15');
  const q = useQuery({
    queryKey: ['preferences'],
    queryFn: () =>
      api<{
        version: number;
        value: { language?: string; goal?: string; minutes?: number };
      } | null>('/api/mobile/state/preferences'),
  });
  useEffect(() => {
    if (q.data) {
      setLanguage(q.data.value.language || 'JS');
      setGoal(q.data.value.goal || 'learn');
      setMinutes(String(q.data.value.minutes || 15));
    }
  }, [q.data]);
  const m = useMutation({
    mutationFn: () =>
      send(
        '/api/mobile/state/preferences',
        {
          version: q.data?.version ?? 0,
          value: { language, goal, minutes: Number(minutes), onboarded: true },
        },
        'PUT'
      ),
    onSuccess: () => router.replace('/'),
  });
  return (
    <Screen title="Seu Stacklyst" back>
      <Heading>Como você quer começar?</Heading>
      <Label muted>Você pode mudar suas preferências quando quiser.</Label>
      <Choice
        value={goal}
        onChange={setGoal}
        options={[
          { value: 'learn', label: 'Aprender' },
          { value: 'practice', label: 'Praticar' },
          { value: 'community', label: 'Comunidade' },
        ]}
      />
      <Heading>Linguagem de interesse</Heading>
      <Choice
        value={language}
        onChange={setLanguage}
        options={['JS', 'TS', 'PYTHON', 'JAVA', 'GO', 'RUST', 'CPP'].map((value) => ({
          value,
          label: value,
        }))}
      />
      <Field
        label="Meta de estudo em minutos"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="number-pad"
      />
      {m.error && <Label>{errorMessage(m.error)}</Label>}
      {q.error && <Label>{errorMessage(q.error)}</Label>}
      <Button
        label="Salvar e começar"
        disabled={
          q.isPending ||
          !!q.error ||
          !Number.isInteger(Number(minutes)) ||
          Number(minutes) < 1 ||
          Number(minutes) > 180
        }
        busy={m.isPending}
        onPress={() => m.mutate()}
      />
      <Button secondary label="Pular por enquanto" onPress={() => router.replace('/')} />
      <Button secondary label="Editar nome e perfil" onPress={() => router.push('/edit-profile')} />
    </Screen>
  );
}
