import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen, Choice, AsyncState, RowLink, Avatar, Notice } from '~/components/ui';
import { api } from '~/lib/api';
export default function Ranking() {
  const [language, setLanguage] = useState('');
  const q = useQuery({
    queryKey: ['ranking', language],
    queryFn: () =>
      api<
        {
          rank: number;
          username: string;
          avatar_url: string;
          xp: number;
          level: number;
          streak: number;
        }[]
      >('/api/leaderboard' + (language ? '?language=' + language : '')),
  });
  return (
    <Screen title="Ranking" back>
      <Choice
        value={language}
        onChange={setLanguage}
        options={[
          { value: '', label: 'Global' },
          ...['JS', 'TS', 'PYTHON', 'JAVA', 'RUST', 'GO', 'CPP'].map((value) => ({
            value,
            label: value,
          })),
        ]}
      />
      <AsyncState query={q}>
        {q.data?.length ? (
          q.data.map((p) => (
            <RowLink
              key={p.username}
              title={p.rank + '. @' + p.username}
              subtitle={p.xp + ' XP · Nível ' + p.level + ' · ' + p.streak + ' dias'}
              leading={<Avatar uri={p.avatar_url} name={p.username} />}
              onPress={() => router.push(('/profile/' + p.username) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
