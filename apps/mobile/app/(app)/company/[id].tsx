import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Field, Choice, Button, RowLink } from '~/components/ui';
import { Action } from '~/components/remote';
import { RoleGate } from '~/components/RoleGate';
import { api } from '~/lib/api';
import { Company, Job } from '~/features/explore/types';
function CompanyForm({ c }: { c: Company }) {
  const [name, setName] = useState(c.name),
    [description, setDescription] = useState(c.description || '');
  return (
    <>
      <Field label="Nome" value={name} onChangeText={setName} />
      <Field label="Descrição" value={description} onChangeText={setDescription} multiline />
      <Action
        label="Salvar empresa"
        path={'/api/mobile/companies/' + c.id}
        method="PATCH"
        body={{ name, description }}
      />
    </>
  );
}
function Content() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState(''),
    [description, setDescription] = useState(''),
    [tech, setTech] = useState(''),
    [create, setCreate] = useState(false),
    [edit, setEdit] = useState(false),
    [level, setLevel] = useState('JUNIOR'),
    [modality, setModality] = useState('REMOTE');
  const c = useQuery({ queryKey: ['companies'], queryFn: () => api<Company[]>('/api/companies') });
  const company = c.data?.find((c) => c.id === id);
  const q = useQuery({
    queryKey: ['company-jobs', id],
    queryFn: () => api<Job[]>('/api/jobs?status=ALL&company_id=' + id),
  });
  return (
    <>
      <Heading>{company?.name}</Heading>
      <Button secondary label="Editar empresa" onPress={() => setEdit(!edit)} />
      {edit && company && <CompanyForm c={company} />}
      <Button label="Publicar vaga" onPress={() => setCreate(!create)} />
      {create && (
        <>
          <Field label="Título da vaga" value={title} onChangeText={setTitle} />
          <Field label="Descrição" value={description} onChangeText={setDescription} multiline />
          <Field label="Tecnologias (separadas por vírgula)" value={tech} onChangeText={setTech} />
          <Choice
            value={level}
            onChange={setLevel}
            options={['JUNIOR', 'PLENO', 'SENIOR'].map((value) => ({ value, label: value }))}
          />
          <Choice
            value={modality}
            onChange={setModality}
            options={['REMOTE', 'HYBRID', 'ONSITE'].map((value) => ({ value, label: value }))}
          />
          <Action
            label="Criar vaga"
            path="/api/jobs"
            body={{
              company_id: id,
              title,
              description,
              technologies: tech
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              level,
              modality,
            }}
            onSuccess={() => setCreate(false)}
          />
        </>
      )}
      <AsyncState query={q}>
        {q.data?.map((j) => (
          <>
            <RowLink
              key={j.id}
              title={j.title}
              subtitle={j.status}
              onPress={() => router.push(('/recruitment/' + j.id) as never)}
            />
            <Action
              secondary
              label={j.status === 'OPEN' ? 'Encerrar vaga' : 'Reabrir vaga'}
              path={'/api/mobile/jobs/' + j.id}
              method="PATCH"
              body={{ status: j.status === 'OPEN' ? 'CLOSED' : 'OPEN' }}
              confirmText="Alterar a disponibilidade desta vaga?"
            />
          </>
        ))}
      </AsyncState>
    </>
  );
}
export default function CompanyScreen() {
  return (
    <Screen title="Empresa" back>
      <RoleGate roles={['ADMIN', 'RECRUITER']}>
        <Content />
      </RoleGate>
    </Screen>
  );
}
