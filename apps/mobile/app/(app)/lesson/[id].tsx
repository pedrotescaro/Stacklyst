import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Screen, AsyncState, Heading, Label, Button, Field, Choice } from '~/components/ui';
import { RichText, CodeBlock, DraftConflict } from '~/components/content';
import { Editor } from '~/components/Editor';
import { useDraft } from '~/lib/draft';
import { api, send, errorMessage } from '~/lib/api';
import { PublicLesson, Result } from '~/lib/types';
import { queryClient } from '~/lib/query';
import { ResultView } from '~/features/learning/ResultView';
import { colors } from '~/theme';
type Lesson = PublicLesson & { completedStepIds: string[] };
type Step = PublicLesson['steps'][number];
function Activity({ step, lesson, next }: { step: Step; lesson: Lesson; next: () => void }) {
  const draft = useDraft('lesson:' + step.id, step.codeTemplate ?? '');
  const [option, setOption] = useState(''),
    [blanks, setBlanks] = useState<Record<string, string>>({}),
    [order, setOrder] = useState<string[]>([]),
    [tokens, setTokens] = useState<string[]>([]),
    [pairs, setPairs] = useState<Record<string, string>>({}),
    [left, setLeft] = useState(''),
    [command, setCommand] = useState(''),
    [submitted, setSubmitted] = useState(false);
  const isCode = ['code_editor', 'debug', 'boss_challenge'].includes(step.type);
  const m = useMutation({
    mutationFn: (action: 'run' | 'submit') =>
      send<Result & { lessonCompleted: boolean }>('/api/lessons/' + lesson.id + '/attempt', {
        stepId: step.id,
        action,
        code: draft.value,
        selectedOption: option ? Number(option) : undefined,
        blanks,
        order,
        tokens,
        pairs,
        command,
      }),
    onSuccess: (_r, action) => {
      setSubmitted(action === 'submit');
      if (action === 'submit') {
        queryClient.invalidateQueries({ queryKey: ['learning'] });
        queryClient.invalidateQueries({ queryKey: ['me'] });
      }
    },
  });
  return (
    <>
      <Heading>{step.title}</Heading>
      {[step.conceptText, step.question, step.instruction].filter(Boolean).map((t, i) => (
        <RichText key={i} body={t!} />
      ))}
      {step.codeSnippet && <CodeBlock code={step.codeSnippet} />}
      {step.options?.map((text, i) => (
        <Button
          key={i}
          secondary={option !== String(i)}
          label={text}
          onPress={() => {
            setOption(String(i));
            m.reset();
          }}
        />
      ))}
      {isCode && draft.ready && (
        <>
          <Editor value={draft.value} onChange={draft.setValue} language={lesson.language} />
          <Label muted>{draft.status}</Label>
          <Button label="Sincronizar rascunho" secondary onPress={draft.sync} />
          <DraftConflict draft={draft} />
        </>
      )}
      {step.blanks && (
        <>
          <CodeBlock
            code={(step.completionPrefix ?? '') + ' ___ ' + (step.completionSuffix ?? '')}
          />
          {step.blanks.map((b) => (
            <Field
              key={b.id}
              label={b.placeholder}
              value={blanks[b.id] ?? ''}
              onChangeText={(v) => setBlanks({ ...blanks, [b.id]: v })}
            />
          ))}
        </>
      )}
      {step.orderItems && (
        <>
          <Label>Toque nos itens na ordem correta.</Label>
          {order.map((id, i) => (
            <Label key={id}>
              {i + 1}. {step.orderItems?.find((o) => o.id === id)?.text}
            </Label>
          ))}
          {step.orderItems
            .filter((o) => !order.includes(o.id))
            .map((o) => (
              <Button
                key={o.id}
                secondary
                label={o.text}
                onPress={() => setOrder([...order, o.id])}
              />
            ))}
          <Button secondary label="Recomeçar ordem" onPress={() => setOrder([])} />
        </>
      )}
      {step.blockTokens && (
        <>
          <CodeBlock code={tokens.join(' ')} />
          <View style={{ gap: 8 }}>
            {step.blockTokens.map((t, i) => (
              <Button key={i} secondary label={t} onPress={() => setTokens([...tokens, t])} />
            ))}
          </View>
          <Button
            secondary
            label="Remover último bloco"
            onPress={() => setTokens(tokens.slice(0, -1))}
          />
        </>
      )}
      {step.matchingLeft && (
        <>
          <Label>Escolha um conceito, depois a correspondência.</Label>
          <Choice
            value={left}
            onChange={setLeft}
            options={step.matchingLeft.map((value) => ({ value, label: value }))}
          />
          {step.matchingRight?.map((text) => (
            <Button
              key={text}
              secondary
              disabled={!left}
              label={text}
              onPress={() => {
                setPairs({ ...pairs, [left]: text });
                setLeft('');
              }}
            />
          ))}
          {Object.entries(pairs).map(([a, b]) => (
            <Label key={a}>
              {a}: {b}
            </Label>
          ))}
        </>
      )}
      {step.type === 'terminal' && (
        <Field label={step.terminalPrompt || 'Comando'} value={command} onChangeText={setCommand} />
      )}
      {step.tip && <Label muted>{step.tip}</Label>}
      {m.data && <ResultView result={m.data} submitted={submitted} />}
      {m.error && <Label>{errorMessage(m.error)}</Label>}
      {submitted && m.data?.isCorrect ? (
        <Button label="Continuar" onPress={next} />
      ) : (
        <>
          {isCode && (
            <Button secondary label="Testar" busy={m.isPending} onPress={() => m.mutate('run')} />
          )}
          <Button
            label={
              step.type === 'concept_explanation' ? 'Entendi, continuar' : 'Verificar resposta'
            }
            busy={m.isPending}
            onPress={() => m.mutate('submit')}
          />
        </>
      )}
    </>
  );
}
function Session({ lesson }: { lesson: Lesson }) {
  const [index, setIndex] = useState(() => {
    const first = lesson.steps.findIndex((s) => !lesson.completedStepIds.includes(s.id));
    return first < 0 ? 0 : first;
  });
  return index >= lesson.steps.length ? (
    <>
      <Heading>Lição concluída!</Heading>
      <Label>
        Suas respostas foram confirmadas pelo servidor. Seu progresso está disponível na web.
      </Label>
      <Button label="Voltar ao caminho" onPress={() => router.replace('/learn')} />
    </>
  ) : (
    <>
      <Label muted>
        {lesson.title} · Atividade {index + 1} de {lesson.steps.length}
      </Label>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: lesson.steps.length, now: index }}
        style={{ height: 6, backgroundColor: colors.elevated, borderRadius: 4 }}
      >
        <View
          style={{
            height: 6,
            width: ((index / lesson.steps.length) * 100 + '%') as '0%',
            backgroundColor: colors.success,
            borderRadius: 4,
          }}
        />
      </View>
      <Activity
        key={lesson.steps[index].id}
        step={lesson.steps[index]}
        lesson={lesson}
        next={() => setIndex(index + 1)}
      />
    </>
  );
}
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['lesson', id],
    queryFn: () => api<Lesson>('/api/mobile/lessons/' + id),
  });
  return (
    <Screen title="Lição" back>
      <AsyncState query={q}>{q.data && <Session key={id} lesson={q.data} />}</AsyncState>
    </Screen>
  );
}
