import assert from 'node:assert/strict';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

// Exercise the same api() boundary used by screens without a user account or network.
// An auth call throws immediately, so fixtures can never accidentally mask a real request.
const require = createRequire(import.meta.url);
const temporary = await mkdtemp(join(tmpdir(), 'stacklyst-preview-'));
const output = join(temporary, 'preview.cjs');
const originalFetch = globalThis.fetch;
let requests = 0;
try {
  await build({
    stdin: {
      contents:
        "export { api, send, ApiError } from './src/lib/api'; export { enablePreview, disablePreview, isPreviewEnabled } from './src/lib/preview';",
      resolveDir: fileURLToPath(new URL('..', import.meta.url)),
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    define: { __DEV__: 'false' },
    outfile: output,
    plugins: [
      {
        name: 'auth-network-guard',
        setup(builder) {
          builder.onResolve({ filter: /^\.\/supabase$/ }, () => ({
            path: 'supabase',
            namespace: 'guard',
          }));
          builder.onLoad({ filter: /.*/, namespace: 'guard' }, () => ({
            contents:
              "export const supabase = { auth: { getSession() { throw new Error('Preview called Supabase'); } } };",
          }));
        },
      },
    ],
  });
  const client = require(output);
  globalThis.fetch = async () => {
    requests++;
    throw new Error('Preview called the network');
  };
  assert.equal(client.isPreviewEnabled(), false);
  client.enablePreview();
  assert.equal(client.isPreviewEnabled(), true);
  const feed = await client.api('/api/posts?filter=community');
  assert.equal(feed.items.length, 4);
  assert.equal(feed.nextCursor, null);
  assert.equal((await client.api('/api/posts/' + feed.items[0].id)).id, feed.items[0].id);
  feed.items[0].body = 'changed';
  assert.notEqual((await client.api('/api/posts')).items[0].body, 'changed');
  assert.equal((await client.api('/api/posts?filter=following')).items.length, 0);
  assert.equal((await client.api('/api/search?type=posts&q=TypeScript')).items.length, 1);
  assert.equal((await client.api('/api/users/me')).role, 'USER');
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
    await assert.rejects(
      client.api('/api/posts', { method }),
      (error) => error instanceof client.ApiError && error.status === 403
    );
  await assert.rejects(
    client.send('/api/posts', { body: 'example' }),
    (error) => error instanceof client.ApiError && error.status === 403
  );
  await assert.rejects(
    client.api('/api/missing'),
    (error) => error instanceof client.ApiError && error.status === 404
  );
  for (const endpoint of [
    '/api/notifications?useCursor=true',
    '/api/messages/chats',
    '/api/mobile/messages?receiver_id=demo_ana',
    '/api/mobile/learning',
    '/api/profile/ana_dev',
  ])
    assert.ok(await client.api(endpoint));
  const profile = await client.api('/api/profile/visitante');
  assert.equal(profile.followers, 2);
  assert.equal(profile.following, 2);
  assert.ok(profile.trails.length > 0);
  assert.ok(profile.user.badges.length > 0);
  assert.equal((await client.api('/api/users/demo_reader/followers')).length, profile.followers);
  assert.equal((await client.api('/api/users/demo_reader/following')).length, profile.following);
  const replies = await client.api('/api/profile/ana_dev/replies?limit=10');
  assert.equal(replies.items.length, 1);
  assert.equal(replies.items[0].post.id, 'demo_typescript');
  assert.equal((await client.api('/api/profile/ana_dev/replies?cursor=next')).items.length, 0);
  const authored = await client.api('/api/posts?author=ana_dev');
  assert.ok(authored.items.length > 0);
  assert.ok(authored.items.every((post) => post.author.username === 'ana_dev'));
  assert.equal((await client.api('/api/posts?likedBy=missing')).items.length, 0);
  assert.equal(requests, 0);
  client.disablePreview();
  assert.equal(client.isPreviewEnabled(), false);
  console.log(
    'Preview OK: local contracts, isolated fixtures, mutations blocked, missing routes explicit, zero auth or network calls.'
  );
} finally {
  globalThis.fetch = originalFetch;
  await rm(output, { force: true });
  await rmdir(temporary);
}
