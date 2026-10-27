import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Keep the profile, hero, dropdown, query cache, pagination and mutation handlers real.
// Replace only platform rendering, identity, already-covered feed rows and HTTP.
const rootRequire = createRequire(new URL('../../../package.json', import.meta.url));
const require = createRequire(import.meta.url);
const React = rootRequire('react');
const { JSDOM } = rootRequire('jsdom');
const dom = new JSDOM('<!doctype html><div id="app"></div>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = rootRequire('react-dom/client');
const state = {
  viewer: 'ana-id',
  role: 'ADMIN',
  preview: false,
  own: true,
  username: 'ana',
  following: false,
  followers: 4,
  failFollow: false,
  failDuel: false,
  requests: [],
  reads: [],
  navigation: '',
  user: {
    id: 'ana-id',
    username: 'ana',
    name: 'Ana do site',
    avatar_config: { name: 'Nome legado', displayName: 'Outro nome', background: 2 },
    created_at: '2026-09-01T12:00:00.000Z',
    institution: 'Universidade de São Paulo',
    pronouns: 'ela/dela',
    github_username: 'ana-dev',
    bio: 'Aprendendo com código real.',
    total_xp: 3200,
    streak_days: 7,
    badges: [
      {
        slug: 'first',
        label: 'Primeiro passo',
        description: 'Primeira atividade concluída.',
        earned_at: '2026-09-02T12:00:00.000Z',
      },
    ],
  },
};
globalThis.__profile = state;
const native = `import React from 'react';
export const View=({children,accessibilityLabel})=>React.createElement('div',{'aria-label':accessibilityLabel},children);
export const Text=({children,accessibilityLabel,accessibilityLiveRegion})=>React.createElement('span',{'aria-label':accessibilityLabel,'aria-live':accessibilityLiveRegion},children);
export const ScrollView=View;export const RefreshControl=()=>null;
export const Image=({accessibilityLabel,source})=>React.createElement('img',{'aria-label':accessibilityLabel,src:source.uri});
export const Modal=({visible,children})=>visible?React.createElement('div',{role:'dialog'},children):null;
export const Pressable=React.forwardRef(({children,onPress,disabled,accessibilityLabel,accessibilityRole,accessibilityState},ref)=>{
React.useImperativeHandle(ref,()=>({measureInWindow:callback=>callback(20,20,48,48)}));
return React.createElement('button',{onClick:onPress,disabled,'aria-label':accessibilityLabel,role:accessibilityRole==='tab'?'tab':accessibilityRole==='menuitem'?'menuitem':undefined,'aria-selected':accessibilityState?.selected,'aria-expanded':accessibilityState?.expanded},children);
});
export const Linking={openURL:async url=>{globalThis.__profile.navigation=url}};export const StyleSheet={hairlineWidth:1,create:styles=>styles};export const useWindowDimensions=()=>({width:390,height:844});`;
const ui = `import React from 'react';
export const Screen=({title,children,actions})=>React.createElement('main',null,React.createElement('header',null,title,actions),children);
export const AsyncState=({query,children})=>query.isPending?React.createElement('span',null,'Carregando'):query.error&&!query.data?React.createElement('div',null,query.error.message,React.createElement('button',{'aria-label':'Tentar novamente',onClick:()=>query.refetch()},'Tentar novamente')):children;
export const Avatar=()=>React.createElement('span',{'data-avatar':true});
export const Button=({label,onPress,disabled,busy})=>React.createElement('button',{onClick:onPress,disabled:disabled||busy,'aria-label':label,'aria-busy':busy},label);
export const IconButton=({label,onPress,disabled})=>React.createElement('button',{'aria-label':label,onClick:onPress,disabled},label);
export const Heading=({children})=>React.createElement('h2',null,children);export const Label=({children})=>React.createElement('span',null,children);
export const Choice=({options,value,onChange})=>React.createElement('div',null,options.map(option=>React.createElement('button',{key:option.value,onClick:()=>onChange(option.value),'aria-label':option.label,'aria-pressed':value===option.value},option.label)));`;
const theme = `import React from 'react';export const ScopedTheme=({children})=>children;export const useTheme=()=>({colors:{background:'#000',surface:'#111316',elevated:'#1a1e23',text:'#f4f6f8',muted:'#9da7b3',primary:'#0078d4',onPrimary:'#fff',border:'#292d33',warning:'#f2cb6d',success:'#63d99b',danger:'#ff8c95'}});`;
const transport = `export const errorMessage=error=>error.message;
export const api=async path=>{
const s=globalThis.__profile;s.reads.push(path);const url=new URL(path,'https://example.invalid');const cursor=url.searchParams.get('cursor');
if(url.pathname==='/api/profile/customization')return s.customization;
const post=(id,body)=>({id,author_id:'ana-id',author:s.user,body,title:'',created_at:'2026-10-19T12:00:00.000Z'});
if(url.pathname.endsWith('/followers')||url.pathname.endsWith('/following'))return [{id:'bob-id',username:'bob',avatar_config:{displayName:'Bruno'}}];
if(url.pathname.endsWith('/replies'))return {items:cursor?[]:[{id:'reply-1',author_id:'ana-id',author:s.user,body:'Resposta real de Ana.',post_id:'original',post:post('original','Contexto da publicação original.'),is_accepted:false}],nextCursor:cursor?null:'replies-2'};
if(url.pathname==='/api/posts')return {items:[post(cursor?'liked-2':'liked-1',cursor?'Outra curtida real.':'Publicação curtida.')],nextCursor:cursor?null:'likes-2'};
if(url.pathname.startsWith('/api/profile/'))return {user:s.user,stats:{answers_count:12,accepted_count:8,accuracy:80},followers:s.followers,following:3,isFollowing:s.following,trails:[{language:'TS',xp:650,level:2},{language:'PYTHON',xp:250,level:1}],posts:{items:[post(cursor?'post-2':'post-1',cursor?'Segunda publicação.':'Primeira publicação.')],nextCursor:cursor?null:'posts-2'}};
throw new Error('Unexpected GET '+path);
};
export const send=async(path,body={},method='POST')=>{
const s=globalThis.__profile;s.requests.push({path,body,method});
if(path.endsWith('/follow')){if(s.failFollow)throw new Error('Não foi possível seguir.');s.following=!s.following;s.followers+=s.following?1:-1;return {following:s.following};}
if(path==='/api/duels/request'){if(s.failDuel)throw new Error('Duelo indisponível.');return {message:'Convite confirmado pelo servidor.'};}
throw new Error('Unexpected mutation '+path);
};`;
const icons =
  'export const IconTrophy=()=>null,IconX=()=>null,IconDots=()=>null,IconBolt=()=>null,IconBrandGithub=()=>null,IconCalendar=()=>null,IconFlame=()=>null,IconSchool=()=>null,IconTarget=()=>null,IconMusic=()=>null;';
const stubs = {
  'react-native-svg': `import React from 'react';const Shape=({children})=>React.createElement('span',null,children);export default Shape;export const SvgUri=Shape,Defs=Shape,LinearGradient=Shape,Rect=Shape,Stop=Shape;`,
  'react-native-webview': `export const WebView=()=>null;`,
  '../../lib/config': 'export const config={apiUrl:"https://example.invalid"};',
  'react-native': native,
  'react-native-safe-area-context':
    'export const useSafeAreaInsets=()=>({top:0,bottom:12,left:0,right:0});',
  '../../components/ui': ui,
  '~/components/ui': ui,
  '../../components/icons': icons,
  '~/components/icons': icons,
  './icons': icons,
  '../../theme': theme,
  '../theme': theme,
  '~/theme': theme,
  '../../lib/api': transport,
  '../../lib/query': `import {QueryClient} from '@tanstack/react-query';export const queryClient=globalThis.__profile.queryClient??=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0},mutations:{retry:false,gcTime:0}}});`,
  '../../lib/session': `export const useMe=()=>({data:{id:globalThis.__profile.viewer,username:globalThis.__profile.viewer==='ana-id'?'ana':'viewer',role:globalThis.__profile.role}});export const useSession=()=>({isPreview:globalThis.__profile.preview,session:globalThis.__profile.preview?null:{user:{id:globalThis.__profile.viewer}}});`,
  '../../lib/motion': 'export const useReducedMotion=()=>true;',
  '~/lib/config': 'export const config={apiUrl:"https://example.invalid"};',
  '~/components/LanguageLogo': `import React from 'react';export const LanguageLogo=({language})=>React.createElement('span',{'data-language':language});`,
  '../../components/content': `import React from 'react';export const RichText=({body})=>React.createElement('div',null,body);`,
  '../feed/PostCard': `import React from 'react';export const PostCard=({post})=>React.createElement('article',{'data-post':post.id},post.body);export const timeLabel=()=>'';`,
  '../feed/ThreadAnswer': `import React from 'react';export const useSavedReplies=()=>({ids:[],save:{isPending:false,error:null,mutate(){}}});export const ThreadAnswer=({answer,onReply})=>React.createElement('div',null,answer.body,React.createElement('button',{'aria-label':'Responder a '+answer.id,onClick:onReply},'Responder'));`,
  'expo-router': 'export const router={push:path=>globalThis.__profile.navigation=path};',
};
const directory = await mkdtemp(join(tmpdir(), 'stacklyst-profile-'));
const output = join(directory, 'profile.cjs');
let root;
let queryClient;
try {
  await build({
    stdin: {
      contents: `export {Profile} from './src/features/profile/Profile';export * from './src/lib/profile-customization';export * from './src/features/profile/profile-model';export {normalizeAvatarConfig,AVATAR_BACKGROUNDS} from '../../src/lib/avatar';export {calculateLevel} from '../../src/lib/learning/rewards';export {QueryClientProvider} from '@tanstack/react-query';export {queryClient} from './src/lib/query';`,
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
  queryClient = built.queryClient;
  state.customization = { preferences: built.defaultProfilePreferences, achievements: [] };
  for (const username of ['', 'ana', 'ANA', 'pedrotescaro', 'usuário']) {
    for (const config of [
      undefined,
      null,
      [],
      {},
      { background: 0 },
      { background: 7 },
      { background: 9 },
      { background: '3' },
      { skin: -1, background: 2 },
      { name: 'x'.repeat(51), background: 2 },
      { hair: undefined, background: 2 },
    ]) {
      assert.equal(
        built.profileBannerColor(username, config),
        built.AVATAR_BACKGROUNDS[built.normalizeAvatarConfig(config, username).background],
        'Avatar fallback must match the website.'
      );
    }
  }
  assert.equal(built.profileLevel(3200), 4);
  assert.equal(built.profileName(state.user), 'Ana do site');
  assert.equal(
    built.profileName({ username: 'ana', avatar_config: { name: 'Nome', displayName: 'Outro' } }),
    'Nome'
  );
  for (const xp of [0, 250, 500, 650, 799, 800, 1100, 1500, 2000, 2600, 5000]) {
    const band = built.calculateLevel(xp);
    assert.equal(
      built.trailProgress({ xp, level: band.level }),
      Math.round(((xp - band.prevLevelXp) / (band.nextLevelXp - band.prevLevelXp)) * 100)
    );
  }
  root = createRoot(document.getElementById('app'));
  const render = () =>
    root.render(
      React.createElement(
        built.QueryClientProvider,
        { client: queryClient },
        React.createElement(built.Profile, { username: state.username, own: state.own })
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
  const click = async (label) => {
    const node = button(label);
    assert.ok(node, 'Missing button: ' + label);
    assert.equal(node.disabled, false, 'Disabled button: ' + label);
    await React.act(async () => node.click());
    await settle();
  };
  await React.act(async () => render());
  await settle();
  assert.match(document.body.textContent, /Ana do site/);
  assert.doesNotMatch(document.body.textContent, /Nome legado/);
  assert.match(document.body.textContent, /Lvl 4/);
  assert.match(document.body.textContent, /Por aqui desde setembro de 2026/);
  assert.match(document.body.textContent, /Universidade de São Paulo/);
  assert.match(document.body.textContent, /ela\/dela/);
  assert.equal(document.querySelectorAll('[data-language]').length, 4);
  assert.equal(button('Configurações'), undefined, 'Account actions stay behind the menu.');
  await click('Opções da conta');
  await click('Configurações');
  assert.equal(state.navigation, '/settings');
  await click('Opções da conta');
  await click('Administração');
  assert.equal(state.navigation, '/admin');
  await click('Editar perfil');
  assert.equal(state.navigation, '/edit-profile');
  await click('Ver trilhas');
  assert.equal(state.navigation, '/learn');
  await click('Carregar mais publicações');
  assert.match(document.body.textContent, /Primeira publicação.*Segunda publicação/);
  await click('Respostas');
  assert.match(document.body.textContent, /Contexto da publicação original/);
  assert.match(document.body.textContent, /Resposta real de Ana/);
  assert.equal(
    document.querySelector('[data-post="post-1"]'),
    null,
    'A different tab cannot leak old posts.'
  );
  await click('Responder a reply-1');
  assert.equal(state.navigation, '/post/original');
  await click('Carregar mais respostas');
  assert.ok(state.reads.some((path) => path.includes('cursor=replies-2')));
  await click('Curtidas');
  assert.match(document.body.textContent, /Publicação curtida/);
  assert.doesNotMatch(document.body.textContent, /Resposta real de Ana/);
  await click('Carregar mais curtidas');
  assert.match(document.body.textContent, /Outra curtida real/);
  await click('Estatísticas');
  assert.match(document.body.textContent, /80%/);
  await click('Trilhas');
  assert.match(document.body.textContent, /TypeScript/);
  await click('Conquistas');
  assert.match(document.body.textContent, /Primeiro passo/);
  await click('4 seguidores');
  await click('Abrir perfil de bob');
  assert.equal(state.navigation, '/profile/bob');
  assert.equal(document.querySelector('[role=dialog]'), null);
  await click('3 seguindo');
  assert.ok(state.reads.some((path) => path === '/api/users/ana-id/following'));
  await click('Fechar lista de pessoas');
  state.own = false;
  state.viewer = 'viewer';
  await React.act(async () => render());
  await settle();
  assert.equal(button('Editar perfil'), undefined);
  assert.equal(button('Opções da conta'), undefined);
  state.failFollow = true;
  await click('Seguir');
  assert.match(document.body.textContent, /Não foi possível seguir/);
  assert.ok(button('4 seguidores'));
  assert.ok(button('Seguir'));
  state.failFollow = false;
  await click('Seguir');
  assert.ok(button('Seguindo'));
  assert.ok(button('5 seguidores'));
  await click('Seguindo');
  assert.ok(button('Seguir'));
  assert.ok(button('4 seguidores'));
  await click('Mensagem');
  assert.equal(state.navigation, '/conversation/ana-id?username=ana');
  await click('Desafiar');
  await click('Python');
  state.failDuel = true;
  await click('Enviar convite');
  assert.match(document.body.textContent, /Duelo indisponível/);
  state.failDuel = false;
  await click('Enviar convite');
  assert.equal(
    state.requests.filter((request) => request.path === '/api/duels/request').at(-1).body.language,
    'PYTHON'
  );
  assert.match(document.body.textContent, /Convite confirmado pelo servidor/);
  await click('Fechar convite para duelo');
  state.preview = true;
  await React.act(async () => render());
  await settle();
  assert.equal(button('Seguir').disabled, true);
  assert.equal(
    button('Seguir').getAttribute('aria-busy'),
    'false',
    'Read-only mode is disabled, never an endless loading state.'
  );
  await click('Desafiar');
  assert.equal(button('Enviar convite').disabled, true);
  const mutationCount = state.requests.length;
  button('Enviar convite').click();
  assert.equal(state.requests.length, mutationCount);
  console.log(
    'Profile: website identity/fallback parity, six real tabs, pagination, followers, owner navigation, follow errors/counts, message/duel contracts and read-only behavior passed.'
  );
} finally {
  if (root) await React.act(async () => root.unmount());
  queryClient?.clear();
  dom.window.close();
  await rm(directory, { recursive: true, force: true });
}
