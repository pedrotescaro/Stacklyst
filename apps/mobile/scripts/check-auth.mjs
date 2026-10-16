import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'stacklyst-auth-'));
const output = join(temporary, 'auth.cjs');
const originalFetch = globalThis.fetch;
let network = 0;
const stubs = {
  expo: 'export const isRunningInExpoGo = () => globalThis.__authCheck.go;',
  'react-native': 'export const Platform = { OS: "android" };',
  'expo-web-browser':
    'export const openAuthSessionAsync = async (...args) => { globalThis.__authCheck.browsers.push(args); return globalThis.__authCheck.browser; };',
  './config':
    'export const config = {apiUrl:"https://stacklyst.test",authCallbackUrl:"https://stacklyst.test/api/auth/callback?client=mobile"};',
  './supabase': `export const supabase = {auth: {
    signInWithOAuth: async (request) => { globalThis.__authCheck.providers.push(request); return {data:{url:"https://project.supabase.co/auth/v1/authorize"},error:null}; },
    exchangeCodeForSession: async (code) => { globalThis.__authCheck.exchanges.push(code); return { data: {user:{id:"user-a"},session:globalThis.__authCheck.session},error:null}; },
    verifyOtp: async (request) => { globalThis.__authCheck.otps.push(request); return {data:{user:{id:"user-a"},session:globalThis.__authCheck.session},error:null}; },
    getSession: async () => ({data:{session:globalThis.__authCheck.session}})
  }};`,
  './api':
    'export const api = async (...args) => { globalThis.__authCheck.bootstraps.push(args); if(globalThis.__authCheck.failBootstrap) throw new Error("API unavailable"); };',
  './query': 'export const queryClient = {invalidateQueries: async () => {}};',
  '@react-native-async-storage/async-storage':
    'export default {setItem:async (key,value) => globalThis.__authCheck.storage.set(key,value),getItem:async key => globalThis.__authCheck.storage.get(key)??null, removeItem:async key => globalThis.__authCheck.storage.delete(key)};',
};
function fresh(overrides = {}) {
  const state = {
    go: false,
    providers: [],
    exchanges: [],
    otps: [],
    browsers: [],
    bootstraps: [],
    storage: new Map(),
    session: { user: { id: 'user-a' } },
    browser: { type: 'success', url: 'stacklyst://auth/callback?code=one-time-code#' },
    ...overrides,
  };
  globalThis.__authCheck = state;
  delete require.cache[require.resolve(output)];
  return { state, client: require(output) };
}
try {
  globalThis.fetch = async () => {
    network++;
    throw new Error('Auth smoke must never use the network');
  };
  await build({
    stdin: {
      contents: "export * from './src/lib/oauth'; export * from './src/lib/auth-callback';",
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: output,
    logLevel: 'silent',
    plugins: [
      {
        name: 'isolated-native-auth',
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, ({ path }) =>
            Object.hasOwn(stubs, path) ? { path, namespace: 'stub' } : undefined
          );
          builder.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
            contents: stubs[path],
          }));
        },
      },
    ],
  });
  for (const provider of ['google', 'github', 'discord']) {
    const { state, client } = fresh();
    assert.equal(
      await client.signInWithProvider(provider, '/post/technical-post'),
      '/post/technical-post'
    );
    assert.deepEqual(state.providers, [
      {
        provider,
        options: {
          redirectTo: 'https://stacklyst.test/api/auth/callback?client=mobile',
          skipBrowserRedirect: true,
        },
      },
    ]);
    assert.deepEqual(state.browsers, [
      ['https://project.supabase.co/auth/v1/authorize', 'stacklyst://auth/callback'],
    ]);
    assert.equal(state.exchanges.length, 1);
    assert.deepEqual(state.bootstraps, [
      ['/api/mobile/auth/bootstrap', { method: 'POST', body: '{}' }],
    ]);
    assert.equal(state.storage.size, 0);
  }
  {
    const { state, client } = fresh({ go: true });
    await assert.rejects(client.signInWithProvider('google'), /Expo Go/);
    assert.equal(state.providers.length, 0);
    assert.equal(state.browsers.length, 0);
  }
  {
    const { state, client } = fresh({ browser: { type: 'cancel' } });
    assert.equal(await client.signInWithProvider('github'), null);
    assert.equal(state.exchanges.length, 0);
    assert.equal(state.bootstraps.length, 0);
  }
  {
    const { state, client } = fresh();
    await client.rememberAuthDestination('/messages');
    assert.deepEqual(
      await Promise.all([
        client.completeAuthCallback({ code: 'shared' }),
        client.completeAuthCallback({ code: 'shared' }),
      ]),
      ['/messages', '/messages']
    );
    assert.deepEqual(state.exchanges, ['shared']);
    assert.equal(state.bootstraps.length, 1);
  }
  {
    const { state, client } = fresh({ failBootstrap: true });
    await assert.rejects(client.completeAuthCallback({ code: 'retry' }), /API unavailable/);
    state.failBootstrap = false;
    assert.equal(await client.completeAuthCallback({ code: 'retry' }), '/');
    assert.deepEqual(state.exchanges, ['retry']);
    assert.equal(state.bootstraps.length, 2);
  }
  {
    const { state, client } = fresh();
    assert.equal(
      await client.completeAuthCallback({ token_hash: 'otp-recovery', type: 'recovery' }),
      '/auth/password'
    );
    assert.equal(
      await client.completeAuthCallback({
        token_hash: 'otp-signup',
        type: 'signup',
        returnTo: 'https://evil.test',
      }),
      '/'
    );
    assert.equal(state.otps.length, 2);
    await assert.rejects(client.completeAuthCallback({ error: 'access_denied' }));
    await assert.rejects(client.completeAuthCallback({}));
    for (const url of [
      'https://evil.test/auth/callback?code=x',
      'stacklyst://auth/callback-extra?code=x',
      'stacklyst://auth/callback#access_token=secret',
      'stacklyst://auth/callback?access_token=secret',
    ])
      assert.throws(() => client.parseAuthCallback(url));
  }
  {
    const { client } = fresh({ session: { user: { id: 'user-b' } } });
    await assert.rejects(client.completeAuthCallback({ code: 'account-changed' }), /sessão mudou/);
  }
  assert.equal(network, 0);
  console.log(
    'Auth OK: native providers, fixed callback, Expo Go guard, one-time PKCE, bootstrap/retry, safe destinations, recovery and zero network calls.'
  );
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.__authCheck;
  await rm(output, { force: true });
  await rmdir(temporary);
}
