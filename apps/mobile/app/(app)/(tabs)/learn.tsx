import { useState } from 'react';
import { Image, View, Text } from 'react-native';
import { router } from 'expo-router';
import { IconCheck, IconLock, IconCode } from '~/components/icons';
import {
  Screen,
  AsyncState,
  Heading,
  Label,
  Button,
  Choice,
  RowLink,
  useUIStyles,
} from '~/components/ui';
import { useLearning } from '~/features/learning/hooks';
import { useMe } from '~/lib/session';
import { useTheme } from '~/theme';
import { AdventureScreen } from '~/mundinho/AdventureScreen';
export default function Learning() {
  const styles = useUIStyles();
  const { colors: c } = useTheme();
  const q = useLearning(),
    me = useMe();
  const [language, setLanguage] = useState('JS'),
    [path, setPath] = useState('all');
  const [showLessons, setShowLessons] = useState(false);
  const languages = [
    ...new Set(q.data?.nodes.map((n) => n.language).filter((s): s is string => !!s)),
  ];
  const selected = q.data?.paths.find((p) => p.id === path);
  const languageNodes = q.data?.nodes.filter((n) => !n.language || n.language === language) ?? [];
  const nodes = languageNodes.filter((n) => !selected || selected.nodeIds.includes(n.id));
  const next =
    nodes.find((n) => n.status === 'IN_PROGRESS') ??
    nodes.find(
      (n) =>
        !['COMPLETED', 'MASTERED'].includes(n.status) &&
        !n.prerequisites.some((p) => p.relation === 'REQUIRED' && !p.completed)
    );
  if (!showLessons)
    return (
      <AdventureScreen
        onCourse={(selected) => {
          if (selected) setLanguage(selected);
          setShowLessons(true);
        }}
      />
    );
  return (
    <Screen title="Aprender">
      <Button label="Meu Mundinho e recompensas" secondary onPress={() => setShowLessons(false)} />
      <AsyncState query={q}>
        <Choice
          value={language}
          onChange={setLanguage}
          options={languages.map((value) => ({ value, label: value }))}
        />
        <View style={[styles.row, { paddingVertical: 16 }]}>
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={styles.title}>
              {next ? 'Um passo de cada vez.' : 'Explore um novo caminho.'}
            </Text>
            <Label muted>
              {me.data?.streak_days ?? 0} dias de ofensiva · {me.data?.total_xp ?? 0} XP
            </Label>
          </View>
          <Image
            source={require('../../../assets/robot.png')}
            style={{ width: 100, height: 110 }}
            resizeMode="contain"
          />
        </View>
        {next && (
          <Button
            label={'Continuar: ' + next.title}
            onPress={() => router.push(('/knowledge/' + next.id) as never)}
          />
        )}
        <Heading>Seu caminho, seu ritmo</Heading>
        <Label muted>
          Recomendações ajudam a escolher. O domínio é compartilhado entre caminhos.
        </Label>
        <Choice
          value={path}
          onChange={setPath}
          options={[
            { value: 'all', label: 'Todos' },
            ...(q.data?.paths ?? [])
              .filter(
                (p) =>
                  p.nodeIds.some((id) => languageNodes.some((n) => n.id === id)) || path === p.id
              )
              .map((p) => ({ value: p.id, label: p.title })),
          ]}
        />
        {nodes.map((n) => {
          const done = ['COMPLETED', 'MASTERED'].includes(n.status),
            locked = n.prerequisites.some((p) => p.relation === 'REQUIRED' && !p.completed);
          return (
            <RowLink
              key={n.id}
              title={n.title}
              subtitle={
                (done
                  ? 'Concluído'
                  : locked
                    ? 'Pré-requisito obrigatório'
                    : n.status === 'IN_PROGRESS'
                      ? 'Em andamento'
                      : 'Disponível') +
                ' · ' +
                n.completedExercises +
                '/' +
                n.exercises.length +
                ' atividades'
              }
              leading={
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: done ? c.successSurface : c.elevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {done ? (
                    <IconCheck color={c.success} />
                  ) : locked ? (
                    <IconLock color={c.muted} />
                  ) : (
                    <IconCode color={c.primary} />
                  )}
                </View>
              }
              onPress={() => router.push(('/knowledge/' + n.id) as never)}
            />
          );
        })}
        <Button label="Ver ranking" secondary onPress={() => router.push('/ranking')} />
      </AsyncState>
    </Screen>
  );
}
