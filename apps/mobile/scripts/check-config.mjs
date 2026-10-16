import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const production = 'https://stacklyst.vercel.app';
for (const development of [false, true]) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../src/lib/config.ts', import.meta.url))],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    minify: true,
    define: {
      __DEV__: String(development),
      'process.env.EXPO_PUBLIC_API_URL': JSON.stringify('http://10.0.2.2:3000'),
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify('https://project.supabase.co'),
      'process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('public-key'),
      'process.env.EXPO_PUBLIC_EAS_PROJECT_ID': '""',
    },
  });
  const source = result.outputFiles[0].text;
  const module = { exports: {} };
  new Function('module', 'exports', source)(module, module.exports);
  const { config, configured } = module.exports;
  assert.equal(config.apiUrl, development ? 'http://10.0.2.2:3000' : production);
  assert.equal(config.authCallbackUrl, production + '/api/auth/callback?client=mobile');
  assert.equal(configured, true);
  if (!development) assert.ok(!source.includes('10.0.2.2'), 'Release contains an emulator URL');
}
console.log(
  'Configuration regression passed: release uses HTTPS; local API stays in development; OAuth always uses the public native callback.'
);
