import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Use the repository's React and DOM renderer together. Native surfaces are
// replaced only at their rendering boundary; lesson state/handlers stay real.
const rootRequire = createRequire(new URL('../../../package.json', import.meta.url));
const React = rootRequire('react');
const { createRoot } = rootRequire('react-dom/client');
const { JSDOM } = rootRequire('jsdom');
const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-interactions-'));
const require = createRequire(import.meta.url);
const output = join(directory, 'lesson.cjs');
const stubs = {
  'react-native': `import React from 'react';
    export const View=({children})=>React.createElement('div',null,children);
    export const Text=({children})=>React.createElement('span',null,children);
    export const Image=()=>null; export const ActivityIndicator=()=>null;
    export const RefreshControl=()=>null;
    export const Keyboard={dismiss(){}};
    export const Pressable=({children,onPress,disabled,accessibilityLabel})=>React.createElement('button',{onClick:onPress,disabled,'aria-label':accessibilityLabel},children);
    export const Animated={Value:class {constructor(value){this.value=value} interpolate(){return '0%'}},View,timing:()=>({start(){}})};
    export const StyleSheet={create:styles=>styles};`,
  '~/components/ui': `import React from 'react';
    export const Screen=({title,children,footer})=>React.createElement('main',null,React.createElement('header',null,title),children,React.createElement('footer',null,footer));
    export const Label=({children})=>React.createElement('span',null,children);
    export const Heading=({children})=>React.createElement('h2',null,children);
    export const AsyncState=()=>null;
    export const Choice=({onChange,options})=>React.createElement('div',null,options.map(({value,label})=>React.createElement('button',{key:value,onClick:()=>onChange(value)},label)));
    export const Button=({label,onPress,disabled})=>React.createElement('button',{onClick:onPress,disabled},label);
    export const Field=()=>null;`,
  '@shopify/flash-list': `import React from 'react'; export const FlashList=({data,renderItem,ListEmptyComponent,ListHeaderComponent})=>React.createElement('div',null,ListHeaderComponent,data.length?data.map(item=>React.createElement(React.Fragment,{key:item.id},renderItem({item}))):ListEmptyComponent);`,
  './ui': `import React from 'react'; export const Button=()=>null; export const Label=({children})=>React.createElement('span',null,children); export const Loading=()=>null; export const Notice=()=>React.createElement('span',null,'Vazio');`,
  '../lib/api': `export const api=async()=>({}); export const send=async()=>({}); export const errorMessage=()=>'';`,
  '../lib/query': 'export const queryClient={invalidateQueries:async()=>{}};',
  '../theme': 'export const useTheme=()=>({colors:{}});',
  '~/components/content': `import React from 'react'; export const RichText=({body})=>React.createElement('div',null,body); export const CodeBlock=()=>null; export const DraftConflict=()=>null;`,
  '~/components/Editor': 'export const Editor=()=>null;',
  '~/components/icons':
    'export const IconBulb=()=>null; export const IconTrophy=()=>null; export const IconCheck=()=>null; export const IconX=()=>null;',
  '~/theme':
    'export const useTheme=()=>({colors:{text:"#fff",muted:"#aaa",background:"#000",success:"#63d99b",onSuccess:"#002616"}});',
  '~/lib/motion': 'export const useReducedMotion=()=>true;',
  '~/lib/sounds': `const stopSounds=()=>{}; export const useSoundEffects=()=>({playSequence:(sounds)=>globalThis.__interaction.sounds.push(...sounds),playSound:sound=>globalThis.__interaction.sounds.push(sound),stopSounds});`,
  '~/lib/draft':
    'export const useDraft=()=>({value:"code",ready:true,status:"Saved",setValue(){},sync(){}});',
  '~/lib/session': 'export const useSession=()=>({isPreview:globalThis.__interaction.preview});',
  '~/lib/query': 'export const queryClient={invalidateQueries:async()=>{}};',
  '~/lib/api': `export const api=async()=>globalThis.__interaction.exercise; export const send=async(path,body)=>{globalThis.__interaction.requests.push({path,body});const result=globalThis.__interaction.results.shift();if(result instanceof Error)throw result;return result;}; export const errorMessage=error=>error.message;`,
  'expo-router': `import {useEffect} from 'react'; export const router={replace:path=>globalThis.__interaction.navigation.push(path),canGoBack:()=>false}; export const useLocalSearchParams=()=>({id:"exercise-a"}); export const useFocusEffect=callback=>useEffect(()=>{const cleanup=callback();globalThis.__interaction.blur=cleanup;globalThis.__interaction.refocus=callback;return cleanup;},[callback]);`,
  './ResultView': 'export const ResultView=()=>null;',
  '~/features/learning/ResultView': 'export const ResultView=()=>null;',
  '@tanstack/react-query': `import {useState} from 'react';
    export function useMutation(options){
      const [state,setState]=useState({});
      return {...state,isPending:false,reset:()=>setState({}),mutate:action=>{
        const context=options.onMutate?.(action);
        return Promise.resolve().then(()=>options.mutationFn(action)).then(data=>{
          setState({data});options.onSuccess?.(data,action,context);
        },error=>setState({error}));
      }};
    }
    export const useQuery=()=>({data:globalThis.__interaction.exercise});
    export const useInfiniteQuery=()=>({data:{pages:[{items:globalThis.__interaction.rows||[]}]},isPending:false});`,
};
let root;
try {
  await build({
    stdin: {
      contents:
        "export {LessonSession} from './src/features/learning/LessonSession'; export {notificationDestination} from './src/lib/links'; export {RemoteList} from './src/components/remote'; export {default as Exercise} from './app/(app)/exercise/[id]';",
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      loader: 'tsx',
    },
    bundle: true,
    outfile: output,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    logLevel: 'silent',
    loader: { '.png': 'dataurl' },
    plugins: [
      {
        name: 'native-render-boundary',
        setup(builder) {
          builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({
            path: rootRequire.resolve(path),
            external: true,
          }));
          builder.onResolve({ filter: /.*/ }, ({ path }) =>
            Object.hasOwn(stubs, path) ? { path, namespace: 'stub' } : undefined
          );
          builder.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
            contents: stubs[path],
            loader: 'tsx',
          }));
        },
      },
    ],
  });
  const { LessonSession, notificationDestination, RemoteList, Exercise } = require(output);
  assert.equal(
    notificationDestination({ actor: { username: 'paulo_leal' } }),
    '/profile/paulo_leal'
  );
  assert.equal(
    notificationDestination({ link: '/post/post-a', actor: { username: 'paulo' } }),
    '/post/post-a'
  );
  assert.equal(notificationDestination({}), null);
  assert.equal(notificationDestination({ actor: { username: '../admin' } }), null);
  const fixture = {
    id: 'lesson-a',
    title: 'Fundamentos',
    language: 'JS',
    completedStepIds: [],
    steps: [
      { id: 'choice', type: 'multiple_choice', title: 'Escolha um valor', options: ['Zero', 'Um'] },
      {
        id: 'concept',
        type: 'concept_explanation',
        title: 'Entenda o conceito',
        conceptText: 'Pratique com calma.',
      },
    ],
  };
  const mount = async (lesson = fixture, preview = false) => {
    if (root) await React.act(() => root.unmount());
    globalThis.__interaction = { requests: [], results: [], navigation: [], sounds: [], preview };
    root = createRoot(document.getElementById('app'));
    await React.act(() => root.render(React.createElement(LessonSession, { lesson })));
  };
  const button = (label) =>
    [...document.querySelectorAll('button')].find((node) => node.textContent === label);
  const click = async (label) => {
    assert.ok(button(label), 'Missing button: ' + label);
    await React.act(async () => {
      button(label).click();
    });
  };
  await mount();
  assert.deepEqual(globalThis.__interaction.sounds, [], 'Mount must not celebrate a result');
  assert.equal(button('Verificar resposta').disabled, true);
  await click('AZero');
  globalThis.__interaction.results.push({ isCorrect: false, message: 'Revise a resposta.' });
  await click('Verificar resposta');
  assert.equal(globalThis.__interaction.requests[0].body.selectedOption, 0);
  assert.ok(document.body.textContent.includes('Vamos tentar de novo'));
  assert.equal(button('Continuar'), undefined);
  assert.deepEqual(globalThis.__interaction.sounds, ['quiz_incorrect']);
  await click('BUm');
  globalThis.__interaction.results.push({ isCorrect: true, xpEarned: 5 });
  await click('Verificar resposta');
  assert.ok(document.body.textContent.includes('1/2'));
  assert.deepEqual(globalThis.__interaction.sounds, ['quiz_incorrect', 'quiz_correct', 'xpgain']);
  await click('Continuar');
  assert.ok(document.body.textContent.includes('Entenda o conceito'));
  globalThis.__interaction.results.push(new Error('Temporary failure'));
  await click('Entendi, continuar');
  assert.ok(document.body.textContent.includes('Temporary failure'));
  assert.equal(button('Concluir lição'), undefined);
  assert.deepEqual(
    globalThis.__interaction.sounds,
    ['quiz_incorrect', 'quiz_correct', 'xpgain'],
    'Network failures must not play feedback'
  );
  globalThis.__interaction.results.push({ isCorrect: true, xpEarned: 5, lessonCompleted: true });
  await click('Entendi, continuar');
  await click('Concluir lição');
  assert.ok(document.body.textContent.includes('Lição concluída!'));
  assert.ok(document.body.textContent.includes('+10 XP'));
  assert.deepEqual(globalThis.__interaction.sounds, [
    'quiz_incorrect',
    'quiz_correct',
    'xpgain',
    'quiz_correct',
    'xpgain',
    'lesson_completed',
  ]);
  await click('Voltar ao caminho');
  assert.deepEqual(globalThis.__interaction.navigation, ['/learn']);
  await mount({ ...fixture, completedStepIds: ['choice'] });
  assert.ok(document.body.textContent.includes('Entenda o conceito'));
  assert.ok(!document.body.textContent.includes('Escolha um valor'));
  await mount(fixture, true);
  await click('AZero');
  assert.equal(button('Verificar resposta').disabled, true);
  assert.equal(globalThis.__interaction.requests.length, 0);
  assert.deepEqual(globalThis.__interaction.sounds, []);
  await mount({ ...fixture, steps: [] });
  assert.ok(document.body.textContent.includes('ainda não possui atividades'));
  await mount({ ...fixture, completedStepIds: ['choice', 'concept'] });
  assert.ok(document.body.textContent.includes('Lição concluída!'));
  assert.ok(!document.body.textContent.includes('+10 XP'));
  assert.deepEqual(
    globalThis.__interaction.sounds,
    [],
    'Loading a completed lesson must stay silent'
  );
  await click('Revisar lição');
  assert.ok(document.body.textContent.includes('Escolha um valor'));
  await click('AZero');
  globalThis.__interaction.results.push({
    isCorrect: true,
    xpEarned: 0,
    firstCompletion: false,
    lessonCompleted: true,
  });
  await click('Verificar resposta');
  assert.deepEqual(
    globalThis.__interaction.sounds,
    ['quiz_correct'],
    'Review keeps answer feedback without reward or completion cues'
  );
  await mount();
  await click('AZero');
  let finishLateLesson;
  globalThis.__interaction.results.push(
    new Promise((resolve) => {
      finishLateLesson = resolve;
    })
  );
  await click('Verificar resposta');
  await React.act(() => root.unmount());
  root = undefined;
  await React.act(async () => {
    finishLateLesson({ isCorrect: true, xpEarned: 10 });
  });
  assert.deepEqual(
    globalThis.__interaction.sounds,
    [],
    'A lesson response after leaving the screen must stay silent'
  );
  await mount();
  await click('AZero');
  let finishBlurredLesson;
  globalThis.__interaction.results.push(
    new Promise((resolve) => {
      finishBlurredLesson = resolve;
    })
  );
  await click('Verificar resposta');
  globalThis.__interaction.blur();
  globalThis.__interaction.refocus();
  await React.act(async () => {
    finishBlurredLesson({ isCorrect: true, xpEarned: 10 });
  });
  assert.deepEqual(
    globalThis.__interaction.sounds,
    [],
    'A lesson response from an earlier focus session must stay silent'
  );
  const exercise = {
    id: 'exercise-a',
    title: 'Somar dois números',
    language: 'JS',
    problem: 'Some.',
    objective: 'Retorne a soma.',
    constraints: [],
    examples: [],
    hints: [],
    activity: { completed: false },
  };
  const mountExercise = async (completed = false) => {
    if (root) await React.act(() => root.unmount());
    globalThis.__interaction = {
      requests: [],
      results: [],
      navigation: [],
      sounds: [],
      exercise: { ...exercise, activity: { completed } },
    };
    root = createRoot(document.getElementById('app'));
    await React.act(() => root.render(React.createElement(Exercise)));
    await click('Começar desafio');
  };
  await mountExercise();
  assert.deepEqual(globalThis.__interaction.sounds, []);
  globalThis.__interaction.results.push({ passed: true, xpEarned: 0 });
  await click('Testar casos públicos');
  assert.deepEqual(
    globalThis.__interaction.sounds,
    [],
    'Public test runs cannot sound like completion'
  );
  await click('Código');
  globalThis.__interaction.results.push(new Error('Exercise network failure'));
  await click('Enviar solução');
  assert.deepEqual(globalThis.__interaction.sounds, []);
  globalThis.__interaction.results.push({ passed: false, xpEarned: 0, firstCompletion: false });
  await click('Enviar solução');
  assert.deepEqual(globalThis.__interaction.sounds, ['quiz_incorrect']);
  await click('Revisar código');
  globalThis.__interaction.results.push({ passed: true, xpEarned: 25, firstCompletion: true });
  await click('Enviar solução');
  assert.deepEqual(globalThis.__interaction.sounds, [
    'quiz_incorrect',
    'quiz_correct',
    'xpgain',
    'lesson_completed',
  ]);
  await mountExercise(true);
  globalThis.__interaction.results.push({ passed: true, xpEarned: 0, firstCompletion: false });
  await click('Enviar solução');
  assert.deepEqual(
    globalThis.__interaction.sounds,
    ['quiz_correct'],
    'Exercise review keeps feedback without completion rewards'
  );
  await mountExercise();
  let finishLateExercise;
  globalThis.__interaction.results.push(
    new Promise((resolve) => {
      finishLateExercise = resolve;
    })
  );
  await click('Enviar solução');
  await React.act(() => root.unmount());
  root = undefined;
  await React.act(async () => {
    finishLateExercise({ passed: true, firstCompletion: true, xpEarned: 25 });
  });
  assert.deepEqual(
    globalThis.__interaction.sounds,
    [],
    'An exercise response after leaving the screen must stay silent'
  );
  await mountExercise();
  let finishBlurredExercise;
  globalThis.__interaction.results.push(
    new Promise((resolve) => {
      finishBlurredExercise = resolve;
    })
  );
  await click('Enviar solução');
  globalThis.__interaction.blur();
  globalThis.__interaction.refocus();
  await React.act(async () => {
    finishBlurredExercise({ passed: true, firstCompletion: true, xpEarned: 25 });
  });
  assert.deepEqual(
    globalThis.__interaction.sounds,
    [],
    'An exercise response from an earlier focus session must stay silent'
  );
  await mountExercise();
  globalThis.__interaction.rows = [{ id: 'self' }];
  await React.act(() =>
    root.render(
      React.createElement(RemoteList, {
        path: '/api/search',
        filter: (item) => item.id !== 'self',
        render: (item) => React.createElement('span', null, item.id),
      })
    )
  );
  assert.ok(
    document.body.textContent.includes('Vazio'),
    'Filtered self-only results must show the empty state'
  );
  console.log(
    'Interactions passed: follower/post destinations, answer index zero, incorrect/retry/network failure, confirmed progress/XP, resume, completed/empty lessons, read-only demo, exercise submit/run/review feedback, and stale responses after blur/refocus/unmount staying silent. Native layout and audible playback are not assessed by this DOM test.'
  );
} finally {
  if (root) await React.act(() => root.unmount());
  dom.window.close();
  await rm(directory, { recursive: true, force: true });
}
