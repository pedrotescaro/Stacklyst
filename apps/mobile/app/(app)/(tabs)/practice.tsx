import { useState } from 'react';
import { router } from 'expo-router';
import { Screen, Field, Choice, AsyncState, RowLink, Notice } from '~/components/ui';
import { useLearning } from '~/features/learning/hooks';
export default function Practice() {
  const q = useLearning();
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState('all'),
    [language, setLanguage] = useState('all'),
    [difficulty, setDifficulty] = useState('all');
  const all = q.data?.nodes.filter((n) => !n.lessonId).flatMap((n) => n.exercises) ?? [];
  const exercises = all.filter(
    (e) =>
      (status === 'all' || e.completed === (status === 'done')) &&
      (language === 'all' || e.language === language) &&
      (difficulty === 'all' || e.difficulty === Number(difficulty)) &&
      (e.title + ' ' + e.summary).toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Screen title="Praticar">
      <Field label="Buscar exercício" value={search} onChangeText={setSearch} />
      <Choice
        value={status}
        onChange={setStatus}
        options={[
          { value: 'all', label: 'Todos' },
          { value: 'new', label: 'Não resolvidos' },
          { value: 'done', label: 'Resolvidos' },
        ]}
      />
      <Choice
        value={language}
        onChange={setLanguage}
        options={[
          { value: 'all', label: 'Linguagens' },
          ...[...new Set(all.map((e) => e.language))].map((value) => ({ value, label: value })),
        ]}
      />
      <Choice
        value={difficulty}
        onChange={setDifficulty}
        options={[
          { value: 'all', label: 'Dificuldade' },
          ...[...new Set(all.map((e) => e.difficulty))]
            .sort()
            .map((value) => ({ value: String(value), label: String(value) })),
        ]}
      />
      <AsyncState query={q}>
        {exercises.length ? (
          exercises.map((e) => (
            <RowLink
              key={e.id}
              title={e.title}
              subtitle={
                e.language +
                ' · Dificuldade ' +
                e.difficulty +
                ' · ' +
                (e.completed ? 'Resolvido' : e.baseXp + ' XP')
              }
              onPress={() => router.push(('/exercise/' + e.id) as never)}
            />
          ))
        ) : (
          <Notice />
        )}
      </AsyncState>
    </Screen>
  );
}
