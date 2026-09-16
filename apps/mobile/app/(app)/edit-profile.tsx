import { useState } from 'react';
import { router } from 'expo-router';
import { Screen, AsyncState, Field, Label } from '~/components/ui';
import { Action } from '~/components/remote';
import { useMe } from '~/lib/session';
import { Person } from '~/lib/types';
function Form({ user }: { user: Person }) {
  const [name, setName] = useState(user.avatar_config?.displayName || ''),
    [username, setUsername] = useState(user.username),
    [bio, setBio] = useState(user.bio || ''),
    [github, setGithub] = useState(user.github_username || '');
  return (
    <>
      <Field label="Nome" value={name} onChangeText={setName} />
      <Field label="Username" value={username} onChangeText={setUsername} />
      <Label muted>
        Alterações de username estão sujeitas ao intervalo de sete dias da sua conta.
      </Label>
      <Field label="Bio" value={bio} onChangeText={setBio} multiline />
      <Field label="GitHub" value={github} onChangeText={setGithub} />
      <Action
        label="Salvar perfil"
        path="/api/profile/update"
        body={{ name, username, bio, github_username: github }}
        confirmText="Salvar essas alterações no seu perfil público?"
        onSuccess={() => router.back()}
      />
    </>
  );
}
export default function Edit() {
  const q = useMe();
  return (
    <Screen title="Editar perfil" back>
      <AsyncState query={q}>{q.data && <Form user={q.data} />}</AsyncState>
    </Screen>
  );
}
