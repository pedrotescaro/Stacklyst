import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Exercise the real loader and actions with an intentionally explosive native package.
// A passing JS export alone cannot detect an eager native-module lookup during startup.
const require = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'stacklyst-notifications-'));
const output = join(temporary, 'notifications.cjs');
const originalFetch = globalThis.fetch;
let networkCalls = 0;
const stubs = {
  react:
    'export const useState = (value) => [value, () => {}]; export const useEffect = () => {}; export const useRef = (value) => ({current: value});',
  'react/jsx-runtime':
    'export const jsx = (type, props) => ({type, props}); export const jsxs = jsx; export const Fragment = "Fragment";',
  'react-native':
    'export const Platform = { OS: globalThis.__notificationCheck.platform }; export const Linking = {};',
  'react-native-gesture-handler': 'export const GestureHandlerRootView = "GestureHandlerRootView";',
  'expo-router':
    'export const Stack = "Stack"; export const router = {}; export const useRootNavigationState = () => ({key: "test"});',
  '@tanstack/react-query':
    'export const QueryClientProvider = "QueryClientProvider"; export const useMutation = () => ({});',
  'react-native-safe-area-context': 'export const SafeAreaProvider = "SafeAreaProvider";',
  'expo-status-bar': 'export const StatusBar = "StatusBar";',
  '../src/lib/session':
    'export const SessionProvider = "SessionProvider"; export const useSession = () => ({ready: false, isPreview: false});',
  '../src/lib/query': 'export const queryClient = {};',
  '../src/theme':
    'export const ThemeProvider = "ThemeProvider"; export const useTheme = () => ({colors: {background: "black"}, mode: "dark", setMode() {}});',
  '../src/components/AppDrawer': 'export const AppDrawer = "AppDrawer";',
  '../src/lib/motion': 'export const useReducedMotion = () => false;',
  '../src/lib/links': 'export const notificationRoute = (path) => path;',
  '~/components/ui':
    'export const Screen = "Screen", Field = "Field", Button = "Button", Label = "Label", Heading = "Heading", Choice = "Choice"; export const confirm = () => {};',
  '~/lib/preview': 'export const disablePreview = () => {};',
  '~/lib/supabase': 'export const supabase = {};',
  expo: 'export const isRunningInExpoGo = () => globalThis.__notificationCheck.environment === "expoGo";',
  'expo-device': 'export const isDevice = true;',
  './config': 'export const config = { projectId: "test-project-id" };',
  './api':
    'export const api = async (path, init) => globalThis.__notificationCheck.events.push(["api", path, init]); export const send = async (path, body, method) => globalThis.__notificationCheck.events.push(["send", path, body, method]);',
  '@react-native-async-storage/async-storage':
    'export default { getItem: async () => globalThis.__notificationCheck.token, setItem: async (_key, value) => { globalThis.__notificationCheck.token = value; }, removeItem: async () => { globalThis.__notificationCheck.token = null; } };',
  'expo-notifications': `
    globalThis.__notificationCheck.imports++;
    if (globalThis.__notificationCheck.explodes)
      throw new Error("Cannot find native module 'ExpoTopicSubscriptionModule'");
    export const AndroidImportance = { DEFAULT: 3 };
    export const SchedulableTriggerInputTypes = { DAILY: "daily" };
    export const setNotificationChannelAsync = async (...args) => globalThis.__notificationCheck.events.push(["channel", ...args]);
    export const requestPermissionsAsync = async () => {
      globalThis.__notificationCheck.events.push(["permission"]);
      return { status: "granted" };
    };
    export const getExpoPushTokenAsync = async (options) => {
      globalThis.__notificationCheck.events.push(["token", options]);
      return { data: "ExponentPushToken[test]" };
    };
    export const cancelAllScheduledNotificationsAsync = async () => globalThis.__notificationCheck.events.push(["cancel"]);
    export const scheduleNotificationAsync = async (request) => globalThis.__notificationCheck.events.push(["schedule", request]);
  `,
};

function freshClient(platform, environment, explodes) {
  const state = { platform, environment, explodes, imports: 0, events: [], token: 'old-token' };
  globalThis.__notificationCheck = state;
  delete require.cache[require.resolve(output)];
  const client = require(output);
  assert.equal(
    typeof client.RootLayout,
    'function',
    'The root route must retain its default export'
  );
  assert.equal(typeof client.Settings, 'function', 'Settings must retain its default export');
  assert.ok(client.RootLayout());
  assert.ok(client.Settings());
  assert.equal(state.imports, 0, 'Importing the helper must not evaluate expo-notifications');
  return { client, state };
}

async function checkDisablePush(client, state) {
  state.events.length = 0;
  state.token = 'saved-token';
  await client.disablePush();
  assert.equal(state.token, null, 'Disabling push must clear the local token');
  assert.equal(state.events.length, 1);
  const [kind, endpoint, request] = state.events[0];
  assert.equal(kind, 'api');
  assert.equal(endpoint, '/api/mobile/devices');
  assert.equal(request.method, 'DELETE');
  assert.deepEqual(JSON.parse(request.body), { token: 'saved-token' });
}

try {
  globalThis.fetch = async () => {
    networkCalls++;
    throw new Error('Notification checks must never use the network');
  };
  await build({
    stdin: {
      contents:
        "export { default as RootLayout } from './app/_layout'; export { default as Settings } from './app/(app)/settings'; export { notificationsAvailable, loadNotifications } from './src/lib/notification-runtime'; export { enablePush, disablePush, setReminder, cancelReminder, clearNotificationsForLogout } from './src/lib/notifications';",
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
        name: 'isolated-notification-runtime',
        setup(builder) {
          builder.onResolve({ filter: /.*/ }, ({ path }) => {
            if (path === '~/lib/notifications')
              return {
                path: fileURLToPath(new URL('../src/lib/notifications.ts', import.meta.url)),
              };
            path =
              {
                '~/lib/session': '../src/lib/session',
                '~/lib/query': '../src/lib/query',
                '~/theme': '../src/theme',
                '~/lib/config': './config',
              }[path] ?? path;
            if (Object.hasOwn(stubs, path)) return { path, namespace: 'stub' };
          });
          builder.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({
            contents: stubs[path],
          }));
        },
      },
    ],
  });

  for (const [platform, environment] of [
    ['android', 'expoGo'],
    ['ios', 'expoGo'],
    ['web', 'standalone'],
  ]) {
    const { client, state } = freshClient(platform, environment, true);
    assert.equal(client.notificationsAvailable(), false);
    assert.equal(await client.loadNotifications(), null);
    await assert.rejects(client.enablePush(), Error);
    await assert.rejects(client.setReminder(9, 30), Error);
    await client.cancelReminder();
    assert.equal(
      state.events.length,
      0,
      'Unsupported actions must not request permissions or tokens'
    );
    await checkDisablePush(client, state);
    state.events.length = 0;
    state.token = 'logout-token';
    await client.clearNotificationsForLogout();
    assert.equal(state.token, null);
    assert.equal(state.events.length, 1, 'Logout must still revoke a saved push token');
    assert.equal(state.events[0][0], 'api');
    assert.equal(
      state.imports,
      0,
      `${platform}/${environment} must never import the native package`
    );
  }

  for (const [platform, environment] of [
    ['android', 'standalone'],
    ['ios', 'standalone'],
    ['android', 'development'],
  ]) {
    const { client, state } = freshClient(platform, environment, false);
    assert.equal(client.notificationsAvailable(), true);
    assert.equal(await client.enablePush(), 'ExponentPushToken[test]');
    assert.equal(state.token, 'ExponentPushToken[test]');
    const modules = await Promise.all([
      client.loadNotifications(),
      client.loadNotifications(),
      client.loadNotifications(),
    ]);
    assert.ok(modules[0]);
    assert.ok(modules.every((module) => module === modules[0]));
    assert.equal(state.imports, 1, 'Native notifications must load only once and on demand');
    assert.equal(
      state.events.filter(([kind]) => kind === 'channel').length,
      platform === 'android' ? 1 : 0
    );
    assert.ok(state.events.some(([kind]) => kind === 'permission'));
    assert.ok(state.events.some(([kind]) => kind === 'token'));
    assert.deepEqual(
      state.events.find(([kind]) => kind === 'send'),
      ['send', '/api/mobile/devices', { token: 'ExponentPushToken[test]', enabled: true }, 'PUT']
    );
    await client.setReminder(9, 30);
    const scheduled = state.events.find(([kind]) => kind === 'schedule');
    assert.ok(scheduled, 'A compatible native build must keep real reminder scheduling');
    assert.deepEqual(scheduled[1].trigger, { type: 'daily', hour: 9, minute: 30 });
    assert.equal(scheduled[1].content.data.url, '/learn');
    await client.cancelReminder();
    assert.ok(state.events.filter(([kind]) => kind === 'cancel').length >= 2);
    await checkDisablePush(client, state);
    assert.equal(state.imports, 1);
  }

  const { client, state } = freshClient('android', 'standalone', true);
  const unavailable = await Promise.all([client.loadNotifications(), client.loadNotifications()]);
  assert.deepEqual(unavailable, [null, null], 'A missing native module must not crash startup');
  await assert.rejects(client.enablePush(), Error);
  await assert.rejects(client.setReminder(9, 30), Error);
  await client.cancelReminder();
  await checkDisablePush(client, state);
  assert.equal(state.imports, 1, 'A failed native import must also be cached');
  assert.equal(networkCalls, 0);
  console.log(
    'Notifications OK: safe Expo Go/web startup, guarded actions, lazy cached native import, missing-module fallback, push revocation preserved, zero network calls.'
  );
} finally {
  globalThis.fetch = originalFetch;
  delete globalThis.__notificationCheck;
  await rm(output, { force: true });
  await rmdir(temporary);
}
