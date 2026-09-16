import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Field, Button, RowLink, Notice } from '~/components/ui';
import { Action } from '~/components/remote';
import { RoleGate } from '~/components/RoleGate';
import { useMe } from '~/lib/session';
import { api } from '~/lib/api';
import { Company } from '~/features/explore/types';
function Content() {
  const me = useMe();
  const [create, setCreate] = useState(false),
    [name, setName] = useState(''),
    [description, setDescription] = useState('');
  const q = useQuery({ queryKey: ['companies'], queryFn: () => api<Company[]>('/api/companies') });
  const rows = q.data?.filter((c) => me.data?.role === 'ADMIN' || c.owner_id === me.data?.id) ?? [];
  return (
    <>
      <Button label="Cadastrar empresa" onPress={() => setCreate(!create)} />
      {create && (
        <>
          <Field label="Nome da empresa" value={name} onChangeText={setName} />
          <Field label="Descrição" value={description} onChangeText={setDescription} multiline />
          <Action
            label="Salvar empresa"
            path="/api/companies"
            body={{ name, description }}
            onSuccess={() => setCreate(false)}
          />
        </>
      )}
      <AsyncState query={q}>
        {rows.length ? (
          rows.map((c) => (
            <RowLink
              key={c.id}
              title={c.name}
              subtitle={c.location}
              onPress={() => router.push(('/company/' + c.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </>
  );
}
export default function Recruiter() {
  return (
    <Screen title="Empresas e vagas" back>
      <RoleGate roles={['ADMIN', 'RECRUITER']}>
        <Content />
      </RoleGate>
    </Screen>
  );
}
