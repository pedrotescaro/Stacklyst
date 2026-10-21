import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Keep the route, drafts, query cache and mutation handlers real. Only native
// rendering, account identity, storage and the HTTP boundary are substituted.
const rootRequire = createRequire(new URL('../../../package.json', import.meta.url));
const React = rootRequire('react');
const { JSDOM } = rootRequire('jsdom');
const require = createRequire(import.meta.url);
const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = rootRequire('react-dom/client');
const storage = new Map();
const state = {
  preview: false,
  userId: 'viewer',
  requests: [],
  storageFailure: false,
  deferredVote: null,
  post: {
    id: 'post-1',
    author_id: 'owner',
    title: '',
    body: 'Uma publicação da comunidade.',
    created_at: new Date().toISOString(),
    author: { id: 'owner', username: 'ana' },
    answers: [
      {
        id: 'answer-1',
        author_id: 'bob',
        author: { id: 'bob', username: 'bob', avatar_config: { displayName: 'Bruno' } },
        body: 'Uma resposta com contexto.',
        created_at: new Date().toISOString(),
        is_accepted: false,
        upvotes: 2,
        votes: [],
        replies: [
          {
            id: 'answer-2',
            author_id: 'ana',
            author: { id: 'ana', username: 'ana' },
            body: 'Uma resposta encadeada.',
            is_accepted: false,
            upvotes: 0,
            votes: [],
            replies: [],
          },
        ],
      },
    ],
  },
};
globalThis.__thread = state;
state.storage = storage;
const native = `import React from 'react';
  export const View=({children})=>React.createElement('div',null,children);
  export const Text=({children,accessibilityLiveRegion})=>React.createElement('span',{'aria-live':accessibilityLiveRegion},children);
  export const ScrollView=({children})=>React.createElement('div',null,children);
  export const KeyboardAvoidingView=View;export const Platform={OS:'ios'};
  export const Image=()=>null; export const ActivityIndicator=()=>null; export const RefreshControl=()=>null;
  export const Modal=({visible,children})=>visible?React.createElement('div',{role:'dialog'},children):null;
  export const Pressable=React.forwardRef(({children,onPress,disabled,accessibilityLabel,accessibilityRole,accessibilityState},ref)=>{
    React.useImperativeHandle(ref,()=>({measureInWindow:cb=>cb(20,20,48,48)}));
    return React.createElement('button',{onClick:onPress,disabled,'aria-label':accessibilityLabel,role:accessibilityRole==='menuitem'?'menuitem':undefined,'aria-pressed':accessibilityState?.selected,'aria-expanded':accessibilityState?.expanded},children);
  });
  export const TextInput=React.forwardRef(({value,onChangeText,editable,multiline,accessibilityLabel,placeholder,maxLength},ref)=>React.createElement(multiline?'textarea':'input',{ref,value,onInput:event=>onChangeText(event.target.value),disabled:editable===false,'aria-label':accessibilityLabel||placeholder,placeholder,maxLength}));
  export const StyleSheet={hairlineWidth:1,create:styles=>styles};
  export const useWindowDimensions=()=>({width:390,height:844});
  export const Share={share:async data=>{globalThis.__thread.shared=data}};
`;
const ui = `import React from 'react';
  export const Screen=({title,children})=>React.createElement('main',null,React.createElement('header',null,title),children);
  export const AsyncState=({query,children})=>query.isPending?React.createElement('span',null,'Carregando'):children;
  export const Avatar=()=>React.createElement('span',{'data-avatar':true});
  export const Button=({label,onPress,disabled,busy})=>React.createElement('button',{onClick:onPress,disabled:disabled||busy,'aria-label':label},label);
  export const Field=({label,value,onChangeText,editable})=>React.createElement('textarea',{'aria-label':label,value,disabled:editable===false,onInput:event=>onChangeText(event.target.value)});
  export const IconButton=({label,icon,onPress,disabled})=>React.createElement('button',{'aria-label':label,onClick:onPress,disabled},icon);
  export const confirm=(_title,_message,action)=>action();
`;
const transport = `export class ApiError extends Error {}
  export const errorMessage=error=>error.message;
  export const api=async path=>{if(path.startsWith('/api/posts/'))return structuredClone(globalThis.__thread.post); return null};
  export const send=async(path,body={},method='POST')=>{
    const s=globalThis.__thread;s.requests.push({path,body,method});
    if(path.endsWith('/vote')&&s.deferredVote)return s.deferredVote.promise;
    if(path.endsWith('/accept'))s.post.answers[0].is_accepted=true;
    return {upvotes:3};
  };`;
const session = `export const useSession=()=>({isPreview:globalThis.__thread.preview,session:globalThis.__thread.preview?null:{user:{id:globalThis.__thread.userId}}});
  export const useMe=()=>({data:{id:globalThis.__thread.userId,username:'current-user'}});`;
const theme = `export const useTheme=()=>({colors:{background:'#000',composer:'#202327',socialBorder:'#2f3336',text:'#fff',muted:'#9da7b3',primary:'#0078d4',onPrimary:'#fff',like:'#ff678b',danger:'#ff8c95',success:'#63d99b'}});`;
const content = `import React from 'react';export const RichText=({body})=>React.createElement('div',null,body);export const CodeBlock=({code})=>React.createElement('pre',null,code);`;
const stubs = {
  'react-native': native,
  'react-native-safe-area-context':
    'export const useSafeAreaInsets=()=>({top:0,bottom:0,left:0,right:0});',
  '~/components/ui': ui,
  '../../components/ui': ui,
  '~/components/content': content,
  '../../components/content': content,
  '~/lib/api': transport,
  './api': transport,
  '../lib/api': transport,
  '../../lib/api': transport,
  '~/lib/session': session,
  './session': session,
  '~/theme': theme,
  '../theme': theme,
  '../../theme': theme,
  '~/lib/config': 'export const config={apiUrl:"https://example.invalid"};',
  '../../lib/config': 'export const config={apiUrl:"https://example.invalid"};',
  '~/lib/query': `import {QueryClient} from '@tanstack/react-query';export const queryClient=globalThis.__thread.queryClient??=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0},mutations:{retry:false,gcTime:0}}});`,
  '../../lib/query': `export const queryClient=globalThis.__thread.queryClient;`,
  'expo-router':
    'export const router={push:path=>globalThis.__thread.navigation=path,back(){},canGoBack:()=>true,replace(){}};export const useLocalSearchParams=()=>({id:"post-1"});',
  '@react-native-async-storage/async-storage': `export default {getItem:async key=>globalThis.__thread.storage.get(key)??null,setItem:async(key,value)=>{if(globalThis.__thread.storageFailure)throw new Error('Storage unavailable');globalThis.__thread.storage.set(key,value)},removeItem:async key=>globalThis.__thread.storage.delete(key)};`,
  '@shopify/flash-list': `import {useState} from 'react';export const useRecyclingState=(value)=>useState(value);`,
  '~/components/icons':
    'export const IconCode=()=>null,IconX=()=>null,IconDots=()=>null,IconBookmark=()=>null,IconCheck=()=>null,IconHeart=()=>null,IconMessageCircle=()=>null,IconShare=()=>null;',
  './icons': 'export const IconDots=()=>null,IconSend=()=>null;',
  '~/components/SnippetComposer': `import React from 'react';export const SnippetComposer=({value,onChange,editable})=>React.createElement('textarea',{'aria-label':'Código da resposta',value,onInput:event=>onChange(event.target.value),disabled:!editable});`,
};
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-thread-'));
const output = join(directory, 'thread.cjs');
let root;
let queryClient;
try {
  await build({
    stdin: {
      contents: `export {PostDetail} from './app/(app)/post/[id]';export {QueryClientProvider} from '@tanstack/react-query';export {queryClient} from '~/lib/query';`,
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      loader: 'tsx',
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    logLevel: 'silent',
    plugins: [
      {
        name: 'native-boundary',
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
            resolveDir: fileURLToPath(new URL('..', import.meta.url)),
          }));
        },
      },
    ],
  });
  const built = require(output);
  queryClient = built.queryClient;
  root = createRoot(document.getElementById('app'));
  const render = () =>
    root.render(
      React.createElement(
        built.QueryClientProvider,
        { client: queryClient },
        React.createElement(built.PostDetail, { id: 'post-1' })
      )
    );
  const settle = async () => {
    await React.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 35));
    });
  };
  const button = (label) =>
    [...document.querySelectorAll('button')].find(
      (node) => node.getAttribute('aria-label') === label
    );
  const field = (label) => document.querySelector('textarea[aria-label="' + label + '"]');
  const click = async (label) => {
    const node = button(label);
    assert.ok(node, 'Missing button: ' + label);
    assert.equal(node.disabled, false, 'Disabled button: ' + label);
    await React.act(async () => node.click());
    await settle();
  };
  const fill = async (label, value) => {
    const node = field(label);
    assert.ok(node, 'Missing field: ' + label);
    await React.act(async () => {
      node.value = value;
      node.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    });
    await settle();
  };
  await React.act(async () => render());
  await settle();
  assert.match(document.body.textContent, /Bruno @bob/);
  assert.ok(field('Postar sua resposta'));
  assert.equal(button('Denunciar publicação'), undefined);
  assert.doesNotMatch(document.body.textContent, /Escreva uma resposta/);
  await click('Respostas: 1');
  assert.equal(document.activeElement, field('Postar sua resposta'));

  await fill('Postar sua resposta', 'Rascunho para a publicação');
  await click('Responder a @bob');
  assert.match(document.body.textContent, /Respondendo a @bob/);
  await fill('Postar sua resposta', 'Resposta ao comentário');
  await click('Adicionar código à resposta');
  await fill('Código da resposta', 'const total = 2;\nconsole.log(total);');
  await click('Publicar resposta');
  const reply = state.requests.find((request) => request.path === '/api/posts/post-1/answer');
  assert.equal(reply.body.parent_answer_id, 'answer-1');
  assert.match(
    reply.body.body,
    /Resposta ao comentário\n\n```js\nconst total = 2;\nconsole.log\(total\);\n```/
  );
  assert.equal(field('Postar sua resposta').value, 'Rascunho para a publicação');
  assert.match(document.body.textContent, /Resposta publicada/);
  assert.equal(storage.has('stacklyst:viewer:reply:post-1:answer:answer-1'), false);

  let rejectVote;
  state.deferredVote = {
    promise: new Promise((_resolve, reject) => {
      rejectVote = reject;
    }),
  };
  await click('Curtir resposta. 2 curtidas');
  assert.equal(button('Descurtir resposta. 3 curtidas').getAttribute('aria-pressed'), 'true');
  await React.act(async () => rejectVote(new Error('Vote failed')));
  await settle();
  assert.ok(button('Curtir resposta. 2 curtidas'));
  assert.match(document.body.textContent, /Vote failed/);
  state.deferredVote = null;
  await click('Curtir resposta. 2 curtidas');
  assert.equal(state.requests.at(-1).path, '/api/answers/answer-1/vote');
  assert.equal(state.requests.at(-1).body.value, 1);

  await click('Salvar resposta neste aparelho');
  assert.match(document.body.textContent, /Resposta salva neste aparelho/);
  assert.deepEqual(JSON.parse(storage.get('stacklyst:viewer:saved-replies')), ['answer-1']);
  state.userId = 'owner';
  await React.act(async () => render());
  await settle();
  assert.equal(button('Remover resposta dos salvos neste aparelho'), undefined);
  assert.ok(button('Salvar resposta neste aparelho'));
  await click('Opções da resposta de bob');
  await click('Aceitar resposta');
  assert.ok(state.requests.some((request) => request.path === '/api/answers/answer-1/accept'));
  assert.match(document.body.textContent, /Resposta aceita/);

  await click('Opções da publicação');
  await click('Denunciar publicação');
  await fill('Motivo da denúncia', 'Conteúdo inadequado');
  await click('Enviar denúncia');
  assert.ok(
    state.requests.some(
      (request) =>
        request.path === '/api/posts/post-1/report' && request.body.reason === 'Conteúdo inadequado'
    )
  );
  assert.match(document.body.textContent, /Denúncia enviada/);
  assert.equal(field('Motivo da denúncia'), null);

  state.storageFailure = true;
  await click('Salvar resposta neste aparelho');
  assert.match(document.body.textContent, /Não foi possível salvar a resposta neste aparelho/);
  assert.equal(storage.has('stacklyst:owner:saved-replies'), false);
  state.storageFailure = false;
  state.preview = true;
  await React.act(async () => render());
  await settle();
  assert.equal(button('Publicar resposta').disabled, true);
  assert.equal(button('Opções da publicação').disabled, true);
  assert.equal(button('Descurtir resposta. 3 curtidas').disabled, true);
  assert.equal(field('Postar sua resposta').disabled, true);
  console.log(
    'Thread interactions passed: nested code replies, draft isolation, vote rollback, local saves, accept, report and preview.'
  );
} finally {
  if (root) await React.act(async () => root.unmount());
  queryClient?.clear();
  await rm(directory, { recursive: true, force: true });
  dom.window.close();
  delete globalThis.__thread;
}
