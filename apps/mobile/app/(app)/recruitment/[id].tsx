import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';
import { Screen, AsyncState, Heading, Label, Choice, Field, styles, Notice } from '~/components/ui';
import { Action } from '~/components/remote';
import { RoleGate } from '~/components/RoleGate';
import { api } from '~/lib/api';
import { Person } from '~/lib/types';
interface Application {
  id: string;
  user: Person;
  status: string;
  feedback?: string;
}
function Candidate({ a, jobId }: { a: Application; jobId: string }) {
  const [status, setStatus] = useState(a.status),
    [feedback, setFeedback] = useState(a.feedback ?? '');
  return (
    <View style={styles.separator}>
      <Heading>@{a.user.username}</Heading>
      <Label muted>
        {a.user.total_xp} XP · {a.status}
      </Label>
      <Label>{a.user.bio}</Label>
      <Choice
        value={status}
        onChange={setStatus}
        options={[
          'APPLIED',
          'IN_REVIEW',
          'TECHNICAL_CHALLENGE',
          'DUEL',
          'EVALUATION',
          'INTERVIEW',
          'OFFER',
          'REJECTED',
        ].map((value) => ({ value, label: value }))}
      />
      <Field
        label="Feedback para a candidatura"
        value={feedback}
        onChangeText={setFeedback}
        multiline
      />
      <Action
        label="Atualizar candidatura"
        path={'/api/jobs/' + jobId}
        method="PATCH"
        body={{ application_id: a.id, status, feedback }}
        confirmText="Salvar o novo status e feedback desta candidatura?"
      />
    </View>
  );
}
function Content() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['candidates', id],
    queryFn: () => api<Application[]>('/api/jobs/' + id + '/applications'),
  });
  return (
    <AsyncState query={q}>
      {q.data?.length ? q.data.map((a) => <Candidate key={a.id} a={a} jobId={id} />) : <Notice />}
    </AsyncState>
  );
}
export default function Recruitment() {
  return (
    <Screen title="Candidaturas" back>
      <RoleGate roles={['ADMIN', 'RECRUITER']}>
        <Content />
      </RoleGate>
    </Screen>
  );
}
