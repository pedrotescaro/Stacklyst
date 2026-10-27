import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Exercise the route's real state and event handlers while replacing native
// surfaces and network/storage boundaries. Native sizing is verified separately.
const rootRequire = createRequire(new URL('../../../package.json', import.meta.url));
const React = rootRequire('react');
const { createRoot } = rootRequire('react-dom/client');
const { JSDOM } = rootRequire('jsdom');
const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-chat-'));
const output = join(directory, 'chat.cjs');
const require = createRequire(import.meta.url);
const stubs = {
  'react-native': `import React from 'react';
    export const View=({children})=>React.createElement('div',null,children);
    export const Text=({children})=>React.createElement('span',null,children);
    export const TextInput=()=>null;
    export const Pressable=({children,onPress,onLongPress,accessibilityLabel})=>React.createElement('button',{onClick:onPress,onContextMenu:onLongPress,'aria-label':accessibilityLabel},children);
    export const StyleSheet={create:value=>value,hairlineWidth:1};`,
  '~/components/ui': `import React from 'react';
    export const Screen=({title,children})=>React.createElement('main',null,React.createElement('header',null,title),children);
    export const IconButton=({label,onPress,disabled})=>React.createElement('button',{onClick:onPress,disabled,'aria-label':label},label);
    export const confirm=(title,body,onConfirm)=>{globalThis.__chat.confirmations.push({title,body});onConfirm();};`,
  '~/components/remote': `import React from 'react';
    export const RemoteList=({render,empty})=>globalThis.__chat.rows.length?React.createElement('div',null,globalThis.__chat.rows.map((row,index)=>React.createElement(React.Fragment,{key:row.id},render(row,index,globalThis.__chat.rows)))):empty;`,
  '~/components/ActionMenu': `import React from 'react';
    export const ActionMenu=({label,items,open,onOpenChange})=>React.createElement('div',null,React.createElement('button',{'aria-label':label,onClick:()=>onOpenChange(!open)},label),open&&items.map(item=>React.createElement('button',{key:item.label,disabled:item.disabled,onClick:()=>{onOpenChange(false);item.onPress();}},item.label)));`,
  '~/components/CompactComposer': `import React from 'react';
    export const CompactComposer=props=>{globalThis.__chat.composer=props;return React.createElement('div',null,props.leading,React.createElement('textarea',{'aria-label':props.placeholder,readOnly:!props.editable,value:props.value,onChange:event=>props.onChangeText(event.target.value)}),React.createElement('button',{'aria-label':props.sendLabel,disabled:props.disabled||props.busy,onClick:props.onSend},props.sendLabel));};`,
  '~/components/icons': 'export const IconPlus=()=>null; export const IconX=()=>null;',
  '~/theme':
    'export const ScopedTheme=({children})=>children; export const useTheme=()=>({colors:{background:"#000000",text:"#FFFFFF",ownMessage:"#0B2B48",incomingMessage:"#202327"}});',
  '~/features/profile/useCustomization': 'export const useCustomization=()=>({data:undefined});',
  '~/lib/session': `export const useSession=()=>({session:globalThis.__chat.preview?null:{user:{id:globalThis.__chat.user}},isPreview:globalThis.__chat.preview}); export const useMe=()=>({data:{id:'preview-user'}});`,
  '~/lib/draft': `import {useState} from 'react';
    export const useDraft=key=>{const scope=globalThis.__chat.user+':'+key;const [value,update]=useState(globalThis.__chat.drafts.get(scope)||'');return {value,ready:!globalThis.__chat.preview,status:'Salvo neste aparelho',setValue:next=>{globalThis.__chat.drafts.set(scope,next);update(next);},clear:async()=>{globalThis.__chat.drafts.delete(scope);update('');}};};`,
  '~/lib/api': `export const send=async(path,body,method='POST')=>{globalThis.__chat.requests.push({path,body,method});const result=globalThis.__chat.results.shift();if(result instanceof Error)throw result;return result||{};}; export const errorMessage=error=>error.message;`,
  '~/lib/query': 'export const queryClient={invalidateQueries:async()=>{}};',
  'expo-router': 'export const useLocalSearchParams=()=>globalThis.__chat.route;',
  'expo-crypto': 'export const randomUUID=()=>"message-attempt-"+(++globalThis.__chat.counter);',
  'expo-clipboard': `export const getStringAsync=async()=>globalThis.__chat.clipboard; export const setStringAsync=async value=>{globalThis.__chat.clipboard=value;};`,
  '@react-native-async-storage/async-storage': `export default {getItem:async key=>globalThis.__chat.storage.get(key)||null,setItem:async(key,value)=>{globalThis.__chat.storage.set(key,value);},removeItem:async key=>{globalThis.__chat.storage.delete(key);}};`,
  '@tanstack/react-query': `import {useState} from 'react';
    export function useMutation(options){const [state,setState]=useState({isPending:false});return {...state,reset:()=>setState({isPending:false}),mutate:value=>{setState({isPending:true});return Promise.resolve().then(()=>options.mutationFn(value)).then(async data=>{await options.onSuccess?.(data,value);setState({isPending:false,data});},error=>setState({isPending:false,error}));}};}`,
};

let root;
try {
  await build({
    stdin: {
      contents:
        "export {default as Conversation} from './app/(app)/conversation/[id]'; export {conversationTime,startsMessageGroup} from './src/features/messages/presentation';",
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      loader: 'tsx',
    },
    bundle: true,
    outfile: output,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    logLevel: 'silent',
    plugins: [
      {
        name: 'chat-native-boundary',
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
  const { Conversation, conversationTime, startsMessageGroup } = require(output);
  const stamp = (created_at) => ({ created_at });
  const today = new Date(2026, 9, 20, 22, 10);
  assert.equal(conversationTime(new Date(2026, 9, 20, 22, 0).toISOString(), today), 'Hoje 22:00');
  assert.equal(conversationTime(new Date(2026, 9, 19, 23, 59).toISOString(), today), 'Ontem 23:59');
  assert.equal(conversationTime('invalid', today), '');
  assert.equal(
    startsMessageGroup(stamp('2026-10-20T10:00:00'), stamp('2026-10-20T09:31:00')),
    false
  );
  assert.equal(
    startsMessageGroup(stamp('2026-10-20T10:00:00'), stamp('2026-10-20T09:30:00')),
    true
  );
  assert.equal(
    startsMessageGroup(stamp('2026-10-21T00:01:00'), stamp('2026-10-20T23:59:00')),
    true
  );
  globalThis.__chat = {
    user: 'self',
    preview: false,
    route: { id: 'friend', username: 'amigo' },
    counter: 0,
    rows: [],
    storage: new Map(),
    drafts: new Map(),
    requests: [],
    results: [],
    confirmations: [],
    clipboard: '',
  };
  const mount = async () => {
    if (root) await React.act(() => root.unmount());
    root = createRoot(document.getElementById('app'));
    await React.act(async () => root.render(React.createElement(Conversation)));
  };
  const button = (label) =>
    [...document.querySelectorAll('button')].find(
      (node) => node.getAttribute('aria-label') === label || node.textContent === label
    );
  const click = async (label) => {
    assert.ok(button(label), 'Missing button: ' + label);
    assert.equal(button(label).disabled, false, 'Disabled button: ' + label);
    await React.act(async () => button(label).click());
  };
  const type = async (value) => React.act(() => globalThis.__chat.composer.onChangeText(value));
  await mount();
  assert.equal(button('Enviar mensagem').disabled, true);
  assert.ok(document.body.textContent.includes('Comece a conversa'));
  assert.ok(!document.body.textContent.includes('Salvo neste aparelho'));
  await type('Olá, mundo');
  globalThis.__chat.results.push(new Error('Sem conexão'));
  await click('Enviar mensagem');
  assert.ok(document.body.textContent.includes('Sem conexão'));
  const attempt = globalThis.__chat.requests[0];
  assert.equal(attempt.body.client_id, 'message-attempt-1');
  assert.equal(
    JSON.parse(globalThis.__chat.storage.get('pending:self:friend')).content,
    'Olá, mundo'
  );
  await mount();
  assert.equal(globalThis.__chat.composer.value, 'Olá, mundo');
  assert.equal(globalThis.__chat.composer.editable, false);
  await click('Tentar enviar novamente');
  assert.deepEqual(
    globalThis.__chat.requests[1].body,
    attempt.body,
    'Retry must preserve client_id and content after remount'
  );
  assert.equal(globalThis.__chat.storage.has('pending:self:friend'), false);
  assert.equal(globalThis.__chat.composer.value, '');
  await type('rascunho separado');
  globalThis.__chat.rows = [
    {
      id: 'incoming',
      sender_id: 'friend',
      receiver_id: 'self',
      content: 'Recebida',
      created_at: '2026-10-20T10:00:00',
    },
    {
      id: 'outgoing',
      sender_id: 'self',
      receiver_id: 'friend',
      content: 'Enviada',
      created_at: '2026-10-20T10:01:00',
    },
  ];
  await mount();
  assert.equal(button('Editar mensagem'), undefined, 'Edit actions must be hidden initially');
  await click('Opções da mensagem recebida');
  assert.equal(button('Editar mensagem'), undefined, 'Incoming messages must not offer edit');
  await click('Copiar mensagem');
  assert.equal(globalThis.__chat.clipboard, 'Recebida');
  await click('Você: Enviada');
  await click('Editar mensagem');
  assert.equal(globalThis.__chat.composer.value, 'Enviada');
  await type('Texto corrigido');
  globalThis.__chat.results.push(new Error('Edição indisponível'));
  await click('Salvar mensagem');
  assert.ok(document.body.textContent.includes('Edição indisponível'));
  assert.equal(globalThis.__chat.composer.value, 'Texto corrigido');
  await click('Salvar mensagem');
  assert.equal(globalThis.__chat.requests.at(-1).method, 'PATCH');
  assert.equal(globalThis.__chat.requests.at(-1).path, '/api/messages/outgoing');
  assert.deepEqual(globalThis.__chat.requests.at(-1).body, { content: 'Texto corrigido' });
  assert.equal(
    globalThis.__chat.composer.value,
    'rascunho separado',
    'Editing must preserve unsent draft'
  );
  await click('Opções da mensagem enviada');
  globalThis.__chat.results.push(new Error('Exclusão indisponível'));
  await click('Excluir mensagem');
  assert.ok(document.body.textContent.includes('Exclusão indisponível'));
  await click('Opções da mensagem enviada');
  await click('Excluir mensagem');
  assert.equal(globalThis.__chat.requests.at(-1).method, 'DELETE');
  assert.equal(globalThis.__chat.confirmations.length, 2);
  globalThis.__chat.route = { id: 'another', username: 'outra' };
  await React.act(async () => root.render(React.createElement(Conversation)));
  assert.equal(
    globalThis.__chat.composer.value,
    '',
    'Different conversations must not share drafts'
  );
  globalThis.__chat.user = 'second-user';
  globalThis.__chat.route = { id: 'friend', username: 'amigo' };
  await React.act(async () => root.render(React.createElement(Conversation)));
  assert.equal(globalThis.__chat.composer.value, '', 'Different accounts must not share drafts');
  globalThis.__chat.preview = true;
  globalThis.__chat.rows = [
    {
      id: 'demo',
      sender_id: 'preview-user',
      receiver_id: 'friend',
      content: 'Demonstração',
      created_at: '2026-10-20T10:00:00',
    },
  ];
  await mount();
  assert.ok(
    button('Você: Demonstração'),
    'Preview must use its own identity to align sent bubbles'
  );
  await click('Opções da mensagem enviada');
  assert.equal(button('Editar mensagem').disabled, true);
  assert.equal(button('Excluir mensagem').disabled, true);
  assert.equal(button('Enviar mensagem').disabled, true);
  console.log(
    'Chat checks passed: date groups, hidden menus, copy, persisted idempotent retry, edit failure/retry, draft isolation, confirmed deletion and read-only preview. Native layout is assessed separately.'
  );
} finally {
  if (root) await React.act(() => root.unmount());
  dom.window.close();
  assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep));
  await rm(directory, { recursive: true, force: true });
}
