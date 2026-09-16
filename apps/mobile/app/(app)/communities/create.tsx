import { useState } from 'react';
import { router } from 'expo-router';
import { Screen, Field } from '~/components/ui';
import { Action } from '~/components/remote';
export default function Create() {
  const [name, setName] = useState(''),
    [description, setDescription] = useState('');
  return (
    <Screen title="Criar comunidade" back>
      <Field label="Nome" value={name} onChangeText={setName} />
      <Field multiline label="Descrição" value={description} onChangeText={setDescription} />
      <Action
        label="Criar comunidade"
        path="/api/guilds"
        body={{ name, description }}
        onSuccess={(g) => router.replace(('/communities/' + g.id) as never)}
      />
    </Screen>
  );
}
