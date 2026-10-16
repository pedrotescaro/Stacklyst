import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, Button, Choice } from '~/components/ui';
import { RichText, CodeBlock, DraftConflict } from '~/components/content';
import { Editor } from '~/components/Editor';
import { useDraft } from '~/lib/draft';
import { api, send, errorMessage } from '~/lib/api';
import { ExerciseWorkspaceData, Result } from '~/lib/types';
import { queryClient } from '~/lib/query';
import { ResultView } from '~/features/learning/ResultView';
import { LessonButton } from '~/features/learning/LessonControls';
function Workspace({ e }: { e: ExerciseWorkspaceData }) {
  const draft = useDraft('exercise:' + e.id + ':' + e.language, e.starterCode);
  const [area, setArea] = useState('problem'),
    [submitted, setSubmitted] = useState(false),
    [mode, setMode] = useState('STANDARD');
  const m = useMutation({
    mutationFn: (action: 'run' | 'submit') =>
      send<Result>('/api/exercises/' + e.id + '/' + action, {
        code: draft.value,
        assistanceMode: mode,
      }),
    onSuccess: (_r, action) => {
      setSubmitted(action === 'submit');
      setArea('result');
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
  const accepted = submitted && !!(m.data?.passed ?? m.data?.isCorrect);
  return (
    <Screen
      title="Praticar"
      back
      footer={
        <LessonButton
          label={
            accepted
              ? 'Continuar'
              : area === 'problem'
                ? 'Começar desafio'
                : area === 'result' && submitted
                  ? 'Revisar código'
                  : 'Enviar solução'
          }
          busy={m.isPending}
          disabled={area !== 'problem' && !draft.ready}
          onPress={() => {
            if (accepted) {
              if (router.canGoBack()) router.back();
              else router.replace('/learn');
            } else if (area === 'problem' || (area === 'result' && submitted)) setArea('code');
            else m.mutate('submit');
          }}
        />
      }
    >
      <Heading>{e.title}</Heading>
      <Label muted>
        {e.language} · Dificuldade {e.difficulty} · {e.publicTestCount} testes públicos
      </Label>
      <Choice
        value={area}
        onChange={setArea}
        options={[
          { value: 'problem', label: 'Enunciado' },
          { value: 'code', label: 'Código' },
          { value: 'result', label: 'Resultado' },
        ]}
      />
      {area === 'problem' && (
        <>
          <RichText body={e.problem} />
          <Heading>Objetivo</Heading>
          <Label>{e.objective}</Label>
          {e.constraints.map((s) => (
            <Label key={s}>{s}</Label>
          ))}
          {e.examples.map((s, i) => (
            <CodeBlock key={i} code={typeof s === 'string' ? s : JSON.stringify(s, null, 2)} />
          ))}
        </>
      )}
      {area === 'code' && (
        <>
          <Choice
            value={mode}
            onChange={setMode}
            options={[
              { value: 'GUIDED', label: 'Guiado' },
              { value: 'STANDARD', label: 'Padrão' },
              { value: 'HARD', label: 'Difícil' },
              { value: 'NO_ASSIST', label: 'Sem ajuda' },
            ]}
          />
          {mode === 'GUIDED' && e.hints.map((s) => <Label key={s}>{s}</Label>)}
          {draft.ready && (
            <Editor
              key={e.id}
              value={draft.value}
              onChange={draft.setValue}
              language={e.language}
            />
          )}
          <Label muted>{draft.status}</Label>
          <Button secondary label="Sincronizar rascunho" onPress={draft.sync} />
          <DraftConflict draft={draft} />
        </>
      )}
      {area === 'result' &&
        (m.data ? (
          <ResultView result={m.data} submitted={submitted} />
        ) : (
          <Label>Teste seu código ou envie uma solução para ver o resultado.</Label>
        ))}
      {m.error && <Label>{errorMessage(m.error)}</Label>}
      {area === 'code' && (
        <Button
          secondary
          label="Testar casos públicos"
          busy={m.isPending}
          disabled={!draft.ready}
          onPress={() => m.mutate('run')}
        />
      )}
    </Screen>
  );
}
export default function Exercise() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => api<ExerciseWorkspaceData>('/api/mobile/exercises/' + id),
  });
  if (q.data) return <Workspace key={q.data.id} e={q.data} />;
  return (
    <Screen title="Exercício" back>
      <AsyncState query={q}>{null}</AsyncState>
    </Screen>
  );
}
