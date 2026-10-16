/**
 * THESIS: Focused practice, one activity and one clear next action.
 * OWN-WORLD: Stacklyst blue, theme-aware surfaces and green learning feedback.
 * STORY: Read, answer, check with the server, understand the result, continue.
 * FIRST VIEWPORT: Compact bar, real progress, large prompt, spacious choices;
 * the primary action stays above the safe area and keyboard.
 * FORM: Extend the native lesson, preserving assessment rules and real XP.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 * finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
 */
import { useState } from 'react';
import { Image, Keyboard, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Screen, Label, Button, Field } from '~/components/ui';
import { RichText, CodeBlock, DraftConflict } from '~/components/content';
import { Editor } from '~/components/Editor';
import { IconBulb, IconTrophy } from '~/components/icons';
import { useDraft } from '~/lib/draft';
import { send, errorMessage } from '~/lib/api';
import type { PublicLesson, Result } from '~/lib/types';
import { queryClient } from '~/lib/query';
import { useSession } from '~/lib/session';
import { useTheme } from '~/theme';
import { ResultView } from './ResultView';
import {
  LessonProgress,
  LessonButton,
  LessonFeedback,
  LessonOption,
  lessonStyles,
} from './LessonControls';

export type Lesson = PublicLesson & { completedStepIds: string[] };
type Step = Lesson['steps'][number];
type Assessment = Result & { lessonCompleted?: boolean };

function Activity({
  step,
  lesson,
  completed,
  last,
  onAccepted,
  next,
}: {
  step: Step;
  lesson: Lesson;
  completed: number;
  last: boolean;
  onAccepted: (result: Assessment) => void;
  next: () => void;
}) {
  const { colors } = useTheme();
  const { isPreview } = useSession();
  const draft = useDraft('lesson:' + step.id, step.codeTemplate ?? '');
  const [option, setOption] = useState('');
  const [blanks, setBlanks] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [left, setLeft] = useState('');
  const [command, setCommand] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const mutation = useMutation({
    mutationFn: (action: 'run' | 'submit') =>
      send<Assessment>('/api/lessons/' + lesson.id + '/attempt', {
        stepId: step.id,
        action,
        code: draft.value,
        selectedOption: option === '' ? undefined : Number(option),
        blanks,
        order,
        tokens,
        pairs,
        command,
      }),
    onSuccess: (result, action) => {
      setSubmitted(action === 'submit');
      if (action === 'submit') Keyboard.dismiss();
      if (action === 'submit' && result.isCorrect) {
        onAccepted(result);
        void queryClient.invalidateQueries({ queryKey: ['learning'] });
        void queryClient.invalidateQueries({ queryKey: ['me'] });
        void queryClient.invalidateQueries({ queryKey: ['lesson', lesson.id] });
      }
    },
  });
  const isCode = ['code_editor', 'debug', 'boss_challenge'].includes(step.type);
  const accepted = submitted && !!mutation.data?.isCorrect;
  const locked = mutation.isPending || accepted;
  const changed = () => {
    mutation.reset();
    setSubmitted(false);
  };
  const hasAnswer = isCode
    ? draft.ready && !!draft.value.trim()
    : step.options?.length
      ? option !== ''
      : step.blanks?.length
        ? step.blanks.every((blank) => !!blanks[blank.id]?.trim())
        : step.orderItems?.length
          ? order.length === step.orderItems.length
          : step.blockTokens?.length
            ? tokens.length > 0
            : step.matchingLeft?.length
              ? step.matchingLeft.every((key) => !!pairs[key])
              : step.type === 'terminal'
                ? !!command.trim()
                : true;
  return (
    <Screen
      title="Aprender"
      back
      footer={
        <View style={lessonStyles.footer}>
          {submitted && mutation.data && (
            <LessonFeedback correct={accepted}>
              {accepted
                ? mutation.data.xpEarned
                  ? `Resposta confirmada. +${mutation.data.xpEarned} XP`
                  : 'Resposta confirmada. Pode continuar!'
                : mutation.data.message ||
                  mutation.data.details ||
                  mutation.data.error ||
                  'Revise sua resposta e verifique novamente.'}
            </LessonFeedback>
          )}
          {mutation.error && (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: colors.danger, fontSize: 15, lineHeight: 22 }}
            >
              {errorMessage(mutation.error)}
            </Text>
          )}
          {isPreview && <Label muted>Entre na sua conta para registrar suas respostas.</Label>}
          <LessonButton
            label={
              accepted
                ? last
                  ? 'Concluir lição'
                  : 'Continuar'
                : step.type === 'concept_explanation'
                  ? 'Entendi, continuar'
                  : 'Verificar resposta'
            }
            busy={mutation.isPending}
            disabled={isPreview || (!accepted && !hasAnswer)}
            onPress={() => (accepted ? next() : mutation.mutate('submit'))}
          />
        </View>
      }
    >
      <LessonProgress completed={completed} total={lesson.steps.length} />
      <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
        {lesson.title}
      </Text>
      <Text accessibilityRole="header" style={[lessonStyles.title, { color: colors.text }]}>
        {step.title}
      </Text>
      {[step.conceptText, step.question, step.instruction].filter(Boolean).map((text, index) => (
        <RichText key={index} body={text!} />
      ))}
      {step.codeSnippet && <CodeBlock code={step.codeSnippet} />}
      {step.options && (
        <View style={lessonStyles.group}>
          {step.options.map((text, index) => (
            <LessonOption
              key={index}
              marker={String.fromCharCode(65 + index)}
              selected={option === String(index)}
              disabled={locked}
              onPress={() => {
                setOption(String(index));
                changed();
              }}
            >
              {text}
            </LessonOption>
          ))}
        </View>
      )}
      {isCode && draft.ready && (
        <>
          <Editor
            editable={!locked}
            value={draft.value}
            onChange={(value) => {
              if (!locked) {
                draft.setValue(value);
                changed();
              }
            }}
            language={lesson.language}
          />
          <Label muted>{draft.status}</Label>
          <Button label="Sincronizar rascunho" secondary disabled={locked} onPress={draft.sync} />
          <DraftConflict draft={draft} />
          <Button
            secondary
            label="Testar casos públicos"
            busy={mutation.isPending}
            disabled={locked || !hasAnswer || isPreview}
            onPress={() => mutation.mutate('run')}
          />
          {mutation.data && <ResultView result={mutation.data} submitted={submitted} />}
        </>
      )}
      {step.blanks && (
        <View style={lessonStyles.group}>
          <CodeBlock
            code={(step.completionPrefix ?? '') + ' ___ ' + (step.completionSuffix ?? '')}
          />
          {step.blanks.map((blank) => (
            <Field
              key={blank.id}
              label={blank.placeholder}
              value={blanks[blank.id] ?? ''}
              editable={!locked}
              autoCorrect={false}
              onChangeText={(value) => {
                setBlanks({ ...blanks, [blank.id]: value });
                changed();
              }}
            />
          ))}
        </View>
      )}
      {step.orderItems && (
        <View style={lessonStyles.group}>
          <Label muted>Monte a sequência. Toque em um item escolhido para removê-lo.</Label>
          {order.map((id, index) => (
            <LessonOption
              key={id}
              marker={String(index + 1)}
              selected
              disabled={locked}
              onPress={() => {
                setOrder(order.filter((value) => value !== id));
                changed();
              }}
            >
              {step.orderItems!.find((item) => item.id === id)?.text}
            </LessonOption>
          ))}
          {step.orderItems
            .filter((item) => !order.includes(item.id))
            .map((item) => (
              <LessonOption
                key={item.id}
                disabled={locked}
                onPress={() => {
                  setOrder([...order, item.id]);
                  changed();
                }}
              >
                {item.text}
              </LessonOption>
            ))}
        </View>
      )}
      {step.blockTokens && (
        <View style={lessonStyles.group}>
          <CodeBlock
            code={tokens.length ? tokens.join(' ') : '// Monte seu código com os blocos abaixo'}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {step.blockTokens.map((token, index) => (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={'Adicionar bloco ' + token}
                disabled={locked}
                onPress={() => {
                  setTokens([...tokens, token]);
                  changed();
                }}
                style={({ pressed }) => ({
                  minHeight: 48,
                  minWidth: 48,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: pressed ? colors.elevated : colors.surface,
                })}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontFamily: 'monospace' }}>
                  {token}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button
            secondary
            label="Remover último bloco"
            disabled={locked || !tokens.length}
            onPress={() => {
              setTokens(tokens.slice(0, -1));
              changed();
            }}
          />
        </View>
      )}
      {step.matchingLeft && (
        <View style={lessonStyles.group}>
          <Label muted>Toque em um conceito e depois no seu par.</Label>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 12 }}>
              {step.matchingLeft.map((text) => (
                <LessonOption
                  key={text}
                  selected={left === text || !!pairs[text]}
                  disabled={locked}
                  onPress={() => setLeft(text)}
                >
                  {text}
                  {pairs[text] ? `: ${pairs[text]}` : ''}
                </LessonOption>
              ))}
            </View>
            <View style={{ flex: 1, gap: 12 }}>
              {step.matchingRight?.map((text) => (
                <LessonOption
                  key={text}
                  disabled={locked || !left}
                  onPress={() => {
                    const nextPairs = Object.fromEntries(
                      Object.entries(pairs).filter(([key, value]) => key !== left && value !== text)
                    );
                    setPairs({ ...nextPairs, [left]: text });
                    setLeft('');
                    changed();
                  }}
                >
                  {text}
                </LessonOption>
              ))}
            </View>
          </View>
        </View>
      )}
      {step.type === 'terminal' && (
        <Field
          label={step.terminalPrompt || 'Comando'}
          value={command}
          editable={!locked}
          autoCorrect={false}
          onChangeText={(value) => {
            setCommand(value);
            changed();
          }}
        />
      )}
      {(step.tip || step.hints?.length) && (
        <View style={{ gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showHint }}
            accessibilityLabel={showHint ? 'Ocultar dica' : 'Ver uma dica'}
            onPress={() => setShowHint(!showHint)}
            style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <IconBulb size={22} color={colors.warning} />
            <Text style={{ color: colors.muted, fontSize: 15 }}>
              {showHint ? 'Ocultar dica' : 'Precisa de uma dica?'}
            </Text>
          </Pressable>
          {showHint &&
            [step.tip, ...(step.hints ?? [])].filter(Boolean).map((hint, index) => (
              <Label key={index} muted>
                {hint}
              </Label>
            ))}
        </View>
      )}
    </Screen>
  );
}

export function LessonSession({ lesson }: { lesson: Lesson }) {
  const { colors } = useTheme();
  const [completed, setCompleted] = useState(() => new Set(lesson.completedStepIds));
  const [index, setIndex] = useState(() => {
    const first = lesson.steps.findIndex((step) => !lesson.completedStepIds.includes(step.id));
    return first < 0 ? 0 : first;
  });
  const [earned, setEarned] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(
    () =>
      lesson.steps.length > 0 &&
      lesson.steps.every((step) => lesson.completedStepIds.includes(step.id))
  );
  if (!lesson.steps.length)
    return (
      <Screen title="Aprender" back>
        <Label>Esta lição ainda não possui atividades.</Label>
        <Button label="Voltar ao caminho" onPress={() => router.replace('/learn')} />
      </Screen>
    );
  const step = lesson.steps[index];
  if (finished)
    return (
      <Screen
        title="Aprender"
        back
        footer={
          <View style={lessonStyles.footer}>
            <LessonButton label="Voltar ao caminho" onPress={() => router.replace('/learn')} />
            <Button
              secondary
              label="Revisar lição"
              onPress={() => {
                setIndex(0);
                setCompleted(new Set());
                setEarned({});
                setFinished(false);
              }}
            />
          </View>
        }
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 32,
            gap: 24,
          }}
        >
          <Image
            source={require('../../../assets/robot.png')}
            style={{ width: 112, height: 112 }}
            accessibilityLabel="Robô do Stacklyst"
          />
          <Text
            accessibilityRole="header"
            style={[lessonStyles.title, { color: colors.text, textAlign: 'center' }]}
          >
            Lição concluída!
          </Text>
          <Text style={{ color: colors.muted, fontSize: 17, lineHeight: 26, textAlign: 'center' }}>
            {lesson.steps.length} atividades concluídas. Seu progresso foi salvo na sua conta.
          </Text>
          {Object.values(earned).reduce((sum, xp) => sum + xp, 0) > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <IconTrophy size={28} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 24, fontWeight: '800' }}>
                +{Object.values(earned).reduce((sum, xp) => sum + xp, 0)} XP
              </Text>
            </View>
          )}
        </View>
      </Screen>
    );
  return (
    <Activity
      key={step.id}
      step={step}
      lesson={lesson}
      completed={lesson.steps.filter((item) => completed.has(item.id)).length}
      last={lesson.steps.every((item) => item.id === step.id || completed.has(item.id))}
      onAccepted={(result) => {
        setCompleted((previous) => new Set([...previous, step.id]));
        setEarned((previous) => ({
          ...previous,
          [step.id]: previous[step.id] ?? result.xpEarned ?? 0,
        }));
      }}
      next={() => {
        const next = lesson.steps.findIndex((item) => !completed.has(item.id));
        if (next < 0) setFinished(true);
        else setIndex(next);
      }}
    />
  );
}
