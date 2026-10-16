import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { loadProjectEnv } from '@expo/env';
import { fileURLToPath } from 'node:url';

loadProjectEnv(fileURLToPath(new URL('..', import.meta.url)), { mode: 'production' });
const api = 'https://stacklyst.vercel.app';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(
  supabaseUrl && key,
  'Configure the public Supabase URL and publishable key before building.'
);
assert.equal(new URL(supabaseUrl).protocol, 'https:');
assert.ok(!key.startsWith('sb_secret_'), 'A secret Supabase key cannot be included in the APK.');
if (key.split('.').length === 3) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
  assert.equal(claims.role, 'anon', 'Only the public anon legacy key is allowed in the APK.');
}

const request = (url, options = {}) =>
  fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(20000) });
const callback = await request(api + '/api/auth/callback?client=mobile&error=access_denied');
assert.ok([302, 303, 307].includes(callback.status), 'Native OAuth callback is unavailable.');
const location = new URL(callback.headers.get('location'));
assert.equal(
  location.protocol,
  'stacklyst:',
  'Publish the native callback: the server still redirects to the website.'
);
assert.equal(location.hostname, 'auth');
assert.equal(location.pathname, '/callback');
assert.equal(location.searchParams.get('error'), 'access_denied');

const bootstrap = await request(api + '/api/mobile/auth/bootstrap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
});
assert.equal(
  bootstrap.status,
  401,
  'Publish the mobile account endpoint before distributing the APK.'
);
assert.ok(bootstrap.headers.get('content-type')?.includes('application/json'));
const settings = await request(supabaseUrl + '/auth/v1/settings', { headers: { apikey: key } });
assert.equal(settings.status, 200, 'The public Supabase configuration is invalid.');
const auth = await settings.json();
assert.equal(auth.disable_signup, false, 'Supabase sign-up is disabled.');
for (const provider of ['email', 'google', 'github'])
  assert.equal(auth.external[provider], true, `Supabase ${provider} sign-in is disabled.`);
console.log(
  'Published auth endpoints and public Supabase settings passed. No user was created or signed in.'
);
