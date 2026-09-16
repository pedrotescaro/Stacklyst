import { useState } from 'react';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Screen,
  AsyncState,
  Heading,
  Label,
  Field,
  Choice,
  Button,
  styles,
  Notice,
} from '~/components/ui';
import { RoleGate } from '~/components/RoleGate';
import { Action } from '~/components/remote';
import { api } from '~/lib/api';
import { Person } from '~/lib/types';
function UserRow({ user }: { user: Person }) {
  const [role, setRole] = useState(user.role ?? 'USER');
  return (
    <View style={styles.separator}>
      <Heading>@{user.username}</Heading>
      <Choice
        value={role}
        onChange={(v) => setRole(v as typeof role)}
        options={['USER', 'EVALUATOR', 'RECRUITER', 'ADMIN'].map((value) => ({
          value,
          label: value,
        }))}
      />
      <Action
        secondary
        label="Alterar papel"
        path="/api/admin/users"
        method="PATCH"
        body={{ user_id: user.id, role }}
        confirmText={'Alterar o papel de @' + user.username + ' para ' + role + '?'}
      />
    </View>
  );
}
function Users() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState('');
  const q = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      api<{ users: Person[]; pagination: { totalPages: number } }>(
        '/api/admin/users?page=' + page + '&search=' + encodeURIComponent(search)
      ),
  });
  return (
    <>
      <Field
        label="Buscar usuários"
        value={search}
        onChangeText={(s) => {
          setSearch(s);
          setPage(1);
        }}
      />
      <AsyncState query={q}>
        {q.data?.users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
        <Button
          secondary
          label="Página anterior"
          disabled={page === 1}
          onPress={() => setPage(page - 1)}
        />
        <Button
          secondary
          label="Próxima página"
          disabled={page >= (q.data?.pagination.totalPages ?? 1)}
          onPress={() => setPage(page + 1)}
        />
      </AsyncState>
    </>
  );
}
function Reports() {
  const q = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () =>
      api<{ id: string; post_id: string; reason: string; post: { title: string; body: string } }[]>(
        '/api/admin/reports'
      ),
  });
  return (
    <AsyncState query={q}>
      {q.data?.length ? (
        q.data.map((r) => (
          <View key={r.id} style={styles.separator}>
            <Heading>{r.post.title}</Heading>
            <Label>{r.reason}</Label>
            <Label>{r.post.body}</Label>
            <Action
              label="Excluir publicação denunciada"
              path="/api/admin/reports"
              method="DELETE"
              body={{ report_id: r.id, post_id: r.post_id }}
              confirmText="Excluir permanentemente esta publicação?"
            />
          </View>
        ))
      ) : (
        <Notice />
      )}
    </AsyncState>
  );
}
function Applications() {
  const q = useQuery({
    queryKey: ['admin-evaluators'],
    queryFn: () =>
      api<{ id: string; user: Person; motivation: string; status: string; tech_stack: string[] }[]>(
        '/api/admin/evaluators?status=PENDING'
      ),
  });
  return (
    <AsyncState query={q}>
      {q.data?.length ? (
        q.data.map((a) => (
          <View key={a.id} style={styles.separator}>
            <Heading>@{a.user.username}</Heading>
            <Label>{a.motivation}</Label>
            <Label muted>{a.tech_stack.join(', ')}</Label>
            <Action
              label="Aprovar avaliador"
              path="/api/admin/evaluators"
              body={{ application_id: a.id, decision: 'APPROVED' }}
              confirmText="Conceder a permissão de avaliador a esta pessoa?"
            />
            <Action
              secondary
              label="Rejeitar candidatura"
              path="/api/admin/evaluators"
              body={{ application_id: a.id, decision: 'REJECTED' }}
              confirmText="Rejeitar esta candidatura?"
            />
          </View>
        ))
      ) : (
        <Notice />
      )}
    </AsyncState>
  );
}
function Metrics() {
  const q = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => api<Record<string, Record<string, number>>>('/api/admin/metrics'),
  });
  const labels: Record<string, string> = {
    users: 'Usuários',
    duels: 'Duelos',
    jobs: 'Vagas',
    companies: 'Empresas',
    events: 'Eventos',
    moderation: 'Moderação',
    engagement: 'Participação',
    total: 'Total',
    active: 'Ativos',
    newLast7Days: 'Novos em 7 dias',
    completed: 'Concluídos',
    pendingEvaluation: 'Aguardando avaliação',
    verified: 'Verificadas',
    pendingReports: 'Denúncias pendentes',
    pendingEvaluatorApps: 'Candidaturas de avaliador',
    totalQuizAttempts: 'Tentativas de quiz',
  };
  return (
    <AsyncState query={q}>
      {Object.entries(q.data ?? {}).map(([key, values]) => (
        <View key={key} style={styles.separator}>
          <Heading>{labels[key] ?? key}</Heading>
          {Object.entries(values).map(([k, v]) => (
            <Label key={k}>
              {labels[k] ?? k}: {v}
            </Label>
          ))}
        </View>
      ))}
    </AsyncState>
  );
}
function Content() {
  const [tab, setTab] = useState('users');
  return (
    <>
      <Choice
        value={tab}
        onChange={setTab}
        options={[
          { value: 'users', label: 'Usuários' },
          { value: 'reports', label: 'Denúncias' },
          { value: 'applications', label: 'Avaliadores' },
          { value: 'metrics', label: 'Indicadores' },
        ]}
      />
      {tab === 'users' ? (
        <Users />
      ) : tab === 'reports' ? (
        <Reports />
      ) : tab === 'applications' ? (
        <Applications />
      ) : (
        <Metrics />
      )}
    </>
  );
}
export default function Admin() {
  return (
    <Screen title="Administração" back>
      <RoleGate roles={['ADMIN']}>
        <Content />
      </RoleGate>
    </Screen>
  );
}
