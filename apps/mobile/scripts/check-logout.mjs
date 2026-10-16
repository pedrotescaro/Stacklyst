import assert from 'node:assert/strict';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

// Execute Settings' real logout action and notification cleanup without native APIs or a network.
const require = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'stacklyst-logout-'));
const output = join(temporary, 'logout.cjs');
const originalFetch = globalThis.fetch;
const stubs = {
  react: 'export const useState = (value) => [value, () => {}];',
  'react/jsx-runtime':
    'export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx; export const Fragment = "Fragment";',
  'react-native': 'export const Linking = {}; export const Platform = { OS: "android" };',
  expo: 'export const isRunningInExpoGo = () => false;',
  'expo-router':
    'export const router = { replace: (path) => globalThis.__logoutCheck.events.push(["route", path]) };',
  '~/components/ui':
    'export const Screen="Screen", Field="Field", Button="Button", Label="Label", Heading="Heading", Choice="Choice"; export const confirm = (_title, _message, action) => action();',
  '~/theme': 'export const useTheme = () => ({mode:"dark", setMode() {}});',
  '~/lib/session': 'export const useSession = () => ({isPreview:false});',
  '~/lib/preview': 'export const disablePreview = () => {};',
  '@tanstack/react-query':
    'export const useMutation = (options) => ({ mutate(value) { globalThis.__logoutCheck.operation = options.mutationFn(value); globalThis.__logoutCheck.operation.catch(() => {}); } });',
  '~/lib/supabase':
    'export const supabase = {auth: {signOut: (options) => globalThis.__logoutCheck.signOut(options)}};',
  '~/lib/query':
    'export const queryClient = {cancelQueries: () => { globalThis.__logoutCheck.events.push(["cancel"]); return globalThis.__logoutCheck.cancelQueries(); }, clear: () => globalThis.__logoutCheck.events.push(["clear"])};',
  '~/lib/config': 'export const config = {};',
  './config': 'export const config = {};',
  './api':
    'export const api = (path, init) => globalThis.__logoutCheck.api(path, init); export const send = () => { throw new Error("Unexpected send"); };',
  'expo-device': 'export const isDevice = true;',
  'expo-notifications':
    'export const cancelAllScheduledNotificationsAsync = () => globalThis.__logoutCheck.reminder();',
  '@react-native-async-storage/async-storage':
    'export default { getItem: async () => globalThis.__logoutCheck.token, removeItem: async () => { globalThis.__logoutCheck.token = null; } };',
};

function findLogout(element) {
  if (!element || typeof element !== 'object') return undefined;
  if (element.props?.label === 'Sair da conta') return element;
  const children = element.props?.children;
  return (Array.isArray(children) ? children : [children]).flat().map(findLogout).find(Boolean);
}

try {
  await build({
    entryPoints: [fileURLToPath(new URL('../app/(app)/settings.tsx', import.meta.url))],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: output,
    logLevel: 'silent',
    plugins: [
      {
        name: 'isolated-logout',
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, ({ path }) => {
            if (path === '~/lib/notifications')
              return {
                path: fileURLToPath(new URL('../src/lib/notifications.ts', import.meta.url)),
              };
            if (Object.hasOwn(stubs, path)) return { path, namespace: 'stub' };
          });
          builder.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
            contents: stubs[path],
          }));
        },
      },
    ],
  });
  const { default: Settings } = require(output);
  let networkCalls = 0;
  globalThis.fetch = async () => {
    networkCalls++;
    throw new Error('Logout check must never use the network');
  };
  const run = (overrides = {}) => {
    const state = {
      events: [],
      token: 'local-push-token',
      api: async (path, init) => {
        assert.equal(path, '/api/mobile/devices');
        assert.equal(init.method, 'DELETE');
        throw new Error('Push service unavailable');
      },
      reminder: async () => {
        throw new Error('Native reminder unavailable');
      },
      cancelQueries: async () => {},
      signOut: async (options) => {
        assert.deepEqual(options, { scope: 'local' });
        state.events.push(['signOut']);
        return { error: null };
      },
      ...overrides,
    };
    globalThis.__logoutCheck = state;
    const button = findLogout(Settings());
    assert.ok(button, 'The real logout control must be present');
    button.props.onPress();
    return state;
  };

  const failedCleanup = run();
  await failedCleanup.operation;
  assert.deepEqual(failedCleanup.events, [['signOut'], ['cancel'], ['clear'], ['route', '/auth']]);

  let signal;
  const started = Date.now();
  const stalledCleanup = run({
    api: (_path, init) => {
      signal = init.signal;
      return new Promise(() => {});
    },
    reminder: () => new Promise(() => {}),
  });
  await stalledCleanup.operation;
  assert.ok(signal.aborted, 'A stalled push request must be aborted');
  assert.ok(Date.now() - started < 5000, 'Logout must not wait for the API timeout');
  assert.deepEqual(stalledCleanup.events, [['signOut'], ['cancel'], ['clear'], ['route', '/auth']]);

  for (const throws of [false, true]) {
    const authError = new Error('Actual signOut failure');
    const failedAuth = run({
      signOut: async () => {
        if (throws) throw authError;
        return { error: authError };
      },
      cancelQueries: async () => {
        throw new Error('Query cancellation failure');
      },
    });
    await assert.rejects(failedAuth.operation, (error) => error === authError);
    assert.deepEqual(failedAuth.events, [['cancel'], ['clear']]);
  }

  const successfulCleanup = run({ api: async () => {}, reminder: async () => {} });
  await successfulCleanup.operation;
  assert.equal(successfulCleanup.token, null);
  assert.equal(networkCalls, 0);
  console.log(
    'Logout OK: failed/stalled cleanup cannot block local signOut; cache always cleared; auth errors preserved; zero network calls.'
  );
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.__logoutCheck;
  await rm(output, { force: true });
  await rmdir(temporary);
}
