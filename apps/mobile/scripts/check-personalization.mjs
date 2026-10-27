import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Keep draft state, queries, mutations, validation and upload orchestration real.
// Native rendering, the system picker and HTTP are controlled at their boundaries.
const rootRequire = createRequire(new URL('../../../package.json', import.meta.url));
const require = createRequire(import.meta.url);
const React = rootRequire('react');
const { JSDOM } = rootRequire('jsdom');
const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = rootRequire('react-dom/client');
const state = (globalThis.__personalize = {
  user: { id: 'owner-id', username: 'ana', name: 'Ana', avatar_url: null },
  requests: [],
  fields: {},
  permission: true,
  pickerCalls: [],
  alert: null,
  image: {
    uri: 'file:///photo.jpg',
    fileName: 'photo.jpg',
    mimeType: 'image/jpeg',
    width: 256,
    height: 256,
    fileSize: 4096,
  },
});
const stubs = {
  'react-native': `import React from 'react';
    export const View=({children})=>React.createElement('div',null,children);
    export const Text=({children})=>React.createElement('span',null,children);
    export const Switch=({accessibilityLabel,value,onValueChange,disabled})=>React.createElement('button',{'aria-label':accessibilityLabel,'aria-pressed':value,disabled,onClick:()=>onValueChange(!value)},accessibilityLabel);
    export const Pressable=({children,onPress,disabled,accessibilityLabel,accessibilityState})=>React.createElement('button',{'aria-label':accessibilityLabel,disabled,'aria-pressed':accessibilityState?.selected,onClick:onPress},children);
    export const Keyboard={dismiss(){}};
    export const Alert={alert:(title,message,actions)=>globalThis.__personalize.alert={title,message,actions}};`,
  'expo-router': `export const useLocalSearchParams=()=>({});export const router={push(){},back(){}};`,
  'expo-image-picker': `
    export const requestCameraPermissionsAsync=async()=>({granted:globalThis.__personalize.permission});
    const pick=async(source,options)=>{const s=globalThis.__personalize;s.pickerCalls.push({source,options});return {canceled:false,assets:[s.image]}};
    export const launchImageLibraryAsync=options=>pick('gallery',options);
    export const launchCameraAsync=options=>pick('camera',options);`,
  '../../components/ui': `import React from 'react';
    export const Screen=({title,children,footer})=>React.createElement('main',null,React.createElement('h1',null,title),children,footer);
    export const AsyncState=({query,children})=>query.isPending?'Carregando':query.error?query.error.message:children;
    export const Avatar=({uri})=>React.createElement('img',{'data-avatar':true,src:uri||undefined});
    export const Button=({label,onPress,disabled,busy})=>React.createElement('button',{'aria-label':label,onClick:onPress,disabled:disabled||busy},label);
    export const Choice=({options,value,onChange})=>React.createElement('div',null,options.map(x=>React.createElement('button',{key:x.value,'aria-label':x.label,'aria-pressed':value===x.value,onClick:()=>onChange(x.value)},x.label)));
    export const Field=props=>{globalThis.__personalize.fields[props.label]=props;return React.createElement('input',{'aria-label':props.label,value:props.value,onChange:e=>props.onChangeText?.(e.target.value)})};
    export const Heading=({children})=>React.createElement('h2',null,children);
    export const Label=({children})=>React.createElement('span',null,children);`,
  '../../lib/api': `
    export const errorMessage=e=>e.message;
    export const api=async(path,init={})=>{const s=globalThis.__personalize;
      if(path==='/api/profile/customization')return structuredClone(s.data);
      if(path==='/api/upload'){s.requests.push({path,method:init.method});return {url:'https://storage.example.invalid/owner-id/photo.jpg'}};
      if(path.startsWith('/api/profile/tags'))return {tags:['typescript','testing']};
      if(path.startsWith('/api/profile/music/search'))return {configured:false,tracks:[]};
      throw new Error('Unexpected GET '+path)};
    export const send=async(path,body,method='POST')=>{const s=globalThis.__personalize;s.requests.push({path,body,method});
      if(path==='/api/profile/customization'){
        assertVersion(body.version,s.data.version);
        s.data={...s.data,...body,avatarUrl:Object.hasOwn(body,'avatarUrl')?body.avatarUrl:s.data.avatarUrl,version:s.data.version+1,newUnlocks:[]};return structuredClone(s.data);
      }
      throw new Error('Unexpected mutation '+path)};
    const assertVersion=(a,b)=>{if(a!==b)throw new Error('Conflito: recarregue a versão salva.');};`,
  '../../lib/session': `export const useMe=()=>({data:globalThis.__personalize.user});export const useSession=()=>({session:{user:{id:'owner-id'}},isPreview:false});`,
  '../../lib/query': `import {QueryClient} from '@tanstack/react-query';export const queryClient=globalThis.__personalize.client??=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0},mutations:{retry:false,gcTime:0}}});`,
  '../../theme': `export const ScopedTheme=({children})=>children;export const useTheme=()=>({colors:{background:'#000000',surface:'#111316',elevated:'#1a1e23',text:'#f4f6f8',muted:'#9da7b3',primary:'#0078d4',onPrimary:'#ffffff',border:'#292d33',ownMessage:'#0b2b48',incomingMessage:'#202327',composer:'#202327',socialBorder:'#2f3336',warning:'#f2cb6d',success:'#63d99b',danger:'#ff8c95'}});`,
  './ProfileBanner': `export const ProfileBanner=({children})=>children;`,
  './ProfileIdentity': `import React from 'react';export const ProfileExtras=()=>null;export const ProfileFlag=({code})=>React.createElement('span',null,code);export const ProfileTitle=({achievement})=>React.createElement('span',null,achievement.name);`,
};
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-personalization-'));
let root;
let client;
try {
  const output = join(directory, 'personalization.cjs');
  await build({
    stdin: {
      contents: `export {PersonalizeProfile,MyAchievements} from './src/features/profile/PersonalizeProfile';export * from './src/lib/profile-customization';export {queryClient} from './src/lib/query';export {QueryClientProvider} from '@tanstack/react-query';`,
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
        name: 'native-boundaries',
        setup(builder) {
          builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({
            path: rootRequire.resolve(path),
            external: true,
          }));
          builder.onResolve({ filter: /(?:^|\/)lib\/query$/ }, () => ({
            path: '../../lib/query',
            namespace: 'stub',
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
  client = built.queryClient;
  state.data = {
    avatarUrl: null,
    preferences: structuredClone(built.defaultProfilePreferences),
    chat: structuredClone(built.defaultChatPreferences),
    version: 1,
    newUnlocks: [],
    achievements: [],
    catalog: {
      events: [],
      achievements: [],
      frames: [
        { id: 'none', name: 'Sem moldura', color: '#0083FE', decoration: 'none' },
        {
          id: 'legendary',
          name: 'Lendária',
          color: '#F7CC62',
          decoration: 'legendary',
          achievementId: 'locked',
        },
      ],
    },
  };
  root = createRoot(document.getElementById('app'));
  const settle = async () =>
    React.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
  const button = (label) =>
    [...document.querySelectorAll('button')].find(
      (node) => node.getAttribute('aria-label') === label
    );
  const click = async (label) => {
    const node = button(label);
    assert.ok(node, 'Missing button ' + label);
    assert.equal(node.disabled, false, 'Disabled button ' + label);
    await React.act(async () => node.click());
    await settle();
  };
  const field = async (label, value) => {
    assert.ok(state.fields[label], label);
    await React.act(async () => state.fields[label].onChangeText(value));
    await settle();
  };
  await React.act(async () =>
    root.render(
      React.createElement(
        built.QueryClientProvider,
        { client },
        React.createElement(built.PersonalizeProfile)
      )
    )
  );
  await settle();
  assert.equal(button('Salvar personalização').disabled, true, 'No-op saves stay disabled');
  await click('Avatar e molduras');
  await click('Escolher foto da galeria');
  assert.deepEqual(state.pickerCalls[0].options.aspect, [1, 1]);
  assert.equal(state.pickerCalls[0].options.allowsEditing, true, 'Use native crop before upload');
  assert.equal(state.requests.length, 1, 'Selecting a photo uploads it without publishing it');
  assert.equal(state.requests[0].path, '/api/upload');
  assert.equal(
    document.querySelector('[data-avatar]').getAttribute('src'),
    'https://storage.example.invalid/owner-id/photo.jpg'
  );
  assert.equal(
    button('Lendária, conquista necessária').disabled,
    true,
    'Locked rewards cannot be equipped'
  );
  await click('Salvar personalização');
  const save = state.requests.at(-1);
  assert.equal(save.method, 'PUT');
  assert.equal(save.path, '/api/profile/customization');
  assert.equal(save.body.avatarUrl, 'https://storage.example.invalid/owner-id/photo.jpg');
  assert.equal(save.body.version, 1);
  assert.equal(
    button('Salvar personalização').disabled,
    true,
    'Successful save updates draft baseline'
  );
  await click('Remover foto do perfil');
  await click('Descartar alterações');
  assert.equal(state.alert.title, 'Descartar alterações?');
  await React.act(async () =>
    state.alert.actions.find((action) => action.text === 'Descartar').onPress()
  );
  assert.equal(
    document.querySelector('[data-avatar]').getAttribute('src'),
    'https://storage.example.invalid/owner-id/photo.jpg',
    'Discard restores saved photo'
  );
  state.permission = false;
  await click('Tirar foto com a câmera');
  assert.equal(state.pickerCalls.length, 1, 'Denied permission never launches camera');
  assert.match(document.body.textContent, /Permita o acesso à câmera/);
  state.permission = true;
  await click('Tirar foto com a câmera');
  assert.equal(state.pickerCalls.at(-1).source, 'camera');
  state.image.fileSize = 6 * 1024 * 1024;
  const before = state.requests.length;
  await click('Escolher foto da galeria');
  assert.equal(state.requests.length, before, 'Oversized images never upload');
  assert.match(document.body.textContent, /até 5 MB/);
  await click('Tags e interesses');
  await field('Adicionar tag', 'TypeScript');
  await click('Adicionar tag');
  await field('Adicionar tag', 'typescript');
  await click('Adicionar tag');
  assert.equal(
    [...document.querySelectorAll('button')].filter(
      (node) => node.getAttribute('aria-label') === 'Remover #typescript'
    ).length,
    1,
    'Tags normalize and deduplicate'
  );
  await click('Música do perfil');
  await field('Buscar música ou artista', 'Artist');
  await click('Buscar no Spotify');
  assert.match(
    document.body.textContent,
    /Cole o link da faixa abaixo/,
    'Search without credentials keeps official-link fallback'
  );
  assert.ok(state.fields['Link da faixa no Spotify']);
  await click('Salvar personalização');
  assert.deepEqual(state.requests.at(-1).body.preferences.tags, ['typescript']);
  assert.equal(
    Object.hasOwn(state.requests.at(-1).body, 'avatarUrl'),
    false,
    'Unchanged photo is omitted from later writes'
  );
  const base = {
    background: '#FFFFFF',
    surface: '#F5F7FA',
    elevated: '#F5F7FA',
    text: '#111111',
    muted: '#536471',
    primary: '#0074C8',
    onPrimary: '#FFFFFF',
    ownMessage: '#E2F1FF',
    incomingMessage: '#EFF3F4',
    composer: '#EFF3F4',
  };
  const darkChat = built.chatPalette(base, {
    mode: 'dark',
    bubbleColor: '#F4F6F8',
    accentColor: '#FFE600',
    backgroundColor: null,
  });
  assert.ok(
    built.contrast(darkChat.text, darkChat.incomingMessage) >= 4.5,
    'Dark private chat keeps incoming text readable from a light global theme'
  );
  assert.equal(base.background, '#FFFFFF', 'Scoped chat never mutates global palette');
  assert.equal(
    built.profilePalette(base, built.defaultProfilePreferences.appearance),
    base,
    'Default profile preserves current app theme'
  );
  state.data.achievements = [
    {
      id: 'first-post',
      name: 'Primeiro post',
      description: 'Uma publicação válida.',
      color: '#0083FE',
      icon: 'post',
      category: 'community',
      rarity: 'common',
      requirement: { metric: 'posts', target: 1 },
      progress: 1,
      unlocked: true,
      unlockedAt: '2026-10-27T12:00:00.000Z',
    },
  ];
  await React.act(async () => {
    client.setQueryData(['profile-customization', 'owner-id'], structuredClone(state.data));
    root.render(
      React.createElement(
        built.QueryClientProvider,
        { client },
        React.createElement(built.MyAchievements)
      )
    );
  });
  await settle();
  await click('Equipar título');
  assert.equal(state.requests.at(-1).body.preferences.equippedTitleId, 'first-post');
  assert.ok(button('Remover título'), 'Achievements page equips a real earned title');
  await click('Destacar conquista');
  assert.deepEqual(state.requests.at(-1).body.preferences.featuredAchievementIds, ['first-post']);
  await click('Bloqueadas');
  assert.equal(button('Remover título'), undefined, 'Achievement status filter applies');
  console.log(
    'Personalization: cropped draft photo, atomic save/version, discard, camera permissions, upload size, locked rewards, tag normalization, Spotify fallback and scoped contrast passed.'
  );
} finally {
  if (root) await React.act(async () => root.unmount());
  client?.clear();
  dom.window.close();
  delete globalThis.__personalize;
  await rm(directory, { recursive: true, force: true });
}
