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
  '~/lib/draft':
    'export const useDraft=()=>({value:"code",ready:true,status:"Saved",setValue(){},sync(){}});',
  '~/lib/session': 'export const useSession=()=>({isPreview:globalThis.__interaction.preview});',
  '~/lib/query': 'export const queryClient={invalidateQueries:async()=>{}};',
  '~/lib/api': `export const send=async(path,body)=>{globalThis.__interaction.requests.push({path,body});const result=globalThis.__interaction.results.shift();if(result instanceof Error)throw result;return result;}; export const errorMessage=error=>error.message;`,
  'expo-router':
    'export const router={replace:path=>globalThis.__interaction.navigation.push(path)};',
  './ResultView': 'export const ResultView=()=>null;',
  '@tanstack/react-query': `import {useState} from 'react'; export function useMutation(options){const [state,setState]=useState({});return {...state,isPending:false,reset:()=>setState({}),mutate:action=>Promise.resolve().then(()=>options.mutationFn(action)).then(data=>{setState({data});options.onSuccess?.(data,action)},error=>setState({error}))};} export const useInfiniteQuery=()=>({data:{pages:[{items:globalThis.__interaction.rows||[]}]},isPending:false});`,
};
let root;
try {
  await build({
    stdin: {
      contents:
        "export {LessonSession} from './src/features/learning/LessonSession'; export {notificationDestination} from './src/lib/links'; export {RemoteList} from './src/components/remote';",
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
  const { LessonSession, notificationDestination, RemoteList } = require(output);
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
    globalThis.__interaction = { requests: [], results: [], navigation: [], preview };
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
  assert.equal(button('Verificar resposta').disabled, true);
  await click('AZero');
  globalThis.__interaction.results.push({ isCorrect: false, message: 'Revise a resposta.' });
  await click('Verificar resposta');
  assert.equal(globalThis.__interaction.requests[0].body.selectedOption, 0);
  assert.ok(document.body.textContent.includes('Vamos tentar de novo'));
  assert.equal(button('Continuar'), undefined);
  await click('BUm');
  globalThis.__interaction.results.push({ isCorrect: true, xpEarned: 5 });
  await click('Verificar resposta');
  assert.ok(document.body.textContent.includes('1/2'));
  await click('Continuar');
  assert.ok(document.body.textContent.includes('Entenda o conceito'));
  globalThis.__interaction.results.push(new Error('Temporary failure'));
  await click('Entendi, continuar');
  assert.ok(document.body.textContent.includes('Temporary failure'));
  assert.equal(button('Concluir lição'), undefined);
  globalThis.__interaction.results.push({ isCorrect: true, xpEarned: 5, lessonCompleted: true });
  await click('Entendi, continuar');
  await click('Concluir lição');
  assert.ok(document.body.textContent.includes('Lição concluída!'));
  assert.ok(document.body.textContent.includes('+10 XP'));
  await click('Voltar ao caminho');
  assert.deepEqual(globalThis.__interaction.navigation, ['/learn']);
  await mount({ ...fixture, completedStepIds: ['choice'] });
  assert.ok(document.body.textContent.includes('Entenda o conceito'));
  assert.ok(!document.body.textContent.includes('Escolha um valor'));
  await mount(fixture, true);
  await click('AZero');
  assert.equal(button('Verificar resposta').disabled, true);
  assert.equal(globalThis.__interaction.requests.length, 0);
  await mount({ ...fixture, steps: [] });
  assert.ok(document.body.textContent.includes('ainda não possui atividades'));
  await mount({ ...fixture, completedStepIds: ['choice', 'concept'] });
  assert.ok(document.body.textContent.includes('Lição concluída!'));
  assert.ok(!document.body.textContent.includes('+10 XP'));
  await click('Revisar lição');
  assert.ok(document.body.textContent.includes('Escolha um valor'));
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
    'Interactions passed: follower profile, post destinations, first answer index zero, incorrect/retry/network failure, confirmed progress/XP, resume, completed/empty lessons and read-only demo. Native layout is not assessed by this DOM test.'
  );
} finally {
  if (root) await React.act(() => root.unmount());
  dom.window.close();
  await rm(directory, { recursive: true, force: true });
}
