import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label } from '~/components/ui';
import { Action } from '~/components/remote';
import { RichText } from '~/components/content';
import { api } from '~/lib/api';
import { Job } from '~/features/explore/types';
export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({ queryKey: ['job', id], queryFn: () => api<Job>('/api/jobs/' + id) });
  const j = q.data;
  return (
    <Screen title="Vaga" back>
      <AsyncState query={q}>
        {j && (
          <>
            <Heading>{j.title}</Heading>
            <Label>
              {j.company.name} · {j.modality} · {j.contract_type}
            </Label>
            <RichText body={j.description} />
            <Heading>Tecnologias e requisitos</Heading>
            <Label>{j.technologies.join(' · ')}</Label>
            {j.requirements.map((r) => (
              <Label key={r}>{r}</Label>
            ))}
            <Heading>Etapas</Heading>
            {j.stages.map((s) => (
              <Label key={s.id}>
                {s.order}. {s.title}
              </Label>
            ))}
            {j.userApplication ? (
              <>
                <Label>Candidatura: {j.userApplication.status}</Label>
                {j.userApplication.feedback && <Label>{j.userApplication.feedback}</Label>}
              </>
            ) : j.status === 'OPEN' ? (
              <Action
                label="Candidatar-me"
                path={'/api/jobs/' + id + '/apply'}
                confirmText="Seu portfólio da plataforma será vinculado à candidatura. Enviar?"
              />
            ) : (
              <Label>Esta vaga não recebe candidaturas.</Label>
            )}
          </>
        )}
      </AsyncState>
    </Screen>
  );
}
