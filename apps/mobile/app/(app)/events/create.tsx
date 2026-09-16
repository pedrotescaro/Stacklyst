import { useState } from 'react';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Screen, Field, Button, Label } from '~/components/ui';
import { send } from '~/lib/api';
import { queryClient } from '~/lib/query';
export default function Create() {
  const [title, setTitle] = useState(''),
    [description, setDescription] = useState(''),
    [start, setStart] = useState(''),
    [end, setEnd] = useState('');
  const m = useMutation({
    mutationFn: () => {
      const a = new Date(start),
        b = new Date(end);
      if (!Number.isFinite(+a) || !Number.isFinite(+b) || b <= a)
        throw new Error('Informe datas válidas, com o fim após o início.');
      return send('/api/events', {
        title,
        description,
        start_date: a.toISOString(),
        end_date: b.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.back();
    },
  });
  return (
    <Screen title="Organizar evento" back>
      <Field label="Título" value={title} onChangeText={setTitle} />
      <Field
        label="Descrição e regras"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Field
        label="Início (AAAA-MM-DDTHH:MM, horário local)"
        value={start}
        onChangeText={setStart}
      />
      <Field label="Fim (AAAA-MM-DDTHH:MM, horário local)" value={end} onChangeText={setEnd} />
      {m.error && <Label>{m.error.message}</Label>}
      <Button label="Criar evento" busy={m.isPending} onPress={() => m.mutate()} />
    </Screen>
  );
}
