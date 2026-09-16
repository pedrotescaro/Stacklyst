import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, Field, Choice, AsyncState, RowLink, Notice } from '~/components/ui';
import { api } from '~/lib/api';
import { Job } from '~/features/explore/types';
export default function Jobs() {
  const [search, setSearch] = useState(''),
    [query, setQuery] = useState(''),
    [mode, setMode] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const q = useQuery({
    queryKey: ['jobs', query, mode],
    queryFn: () =>
      api<Job[]>('/api/jobs?search=' + encodeURIComponent(query) + '&modality=' + mode),
  });
  return (
    <Screen title="Vagas" back>
      <Field label="Buscar cargo, empresa ou tecnologia" value={search} onChangeText={setSearch} />
      <Choice
        value={mode}
        onChange={setMode}
        options={[
          { value: '', label: 'Todas' },
          { value: 'REMOTE', label: 'Remotas' },
          { value: 'HYBRID', label: 'Híbridas' },
          { value: 'ONSITE', label: 'Presenciais' },
        ]}
      />
      <AsyncState query={q}>
        {q.data?.length ? (
          q.data.map((j) => (
            <RowLink
              key={j.id}
              title={j.title}
              subtitle={j.company.name + ' · ' + j.level + ' · ' + j.modality}
              onPress={() => router.push(('/jobs/' + j.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
