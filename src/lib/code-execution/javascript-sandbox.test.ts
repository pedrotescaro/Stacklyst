import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.doUnmock('quickjs-emscripten-core');
  vi.resetModules();
  vi.restoreAllMocks();
});

it('retries initialization after a failed cold start and logs the infrastructure error', async () => {
  const core = await import('quickjs-emscripten-core');
  const initialize = vi.fn(core.newQuickJSWASMModuleFromVariant);
  initialize.mockRejectedValueOnce(new Error('Sandbox cold start failed'));
  vi.resetModules();
  vi.doMock('quickjs-emscripten-core', () => ({
    ...core,
    newQuickJSWASMModuleFromVariant: initialize,
  }));
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');

  expect(await runJavaScriptInSandbox('console.log(42)')).toBeNull();
  expect(log).toHaveBeenCalledWith(expect.stringContaining('Sandbox cold start failed'));
  expect(await runJavaScriptInSandbox('console.log(42)')).toMatchObject({ ok: true, output: '42' });
  expect(await runJavaScriptInSandbox('console.log(43)')).toMatchObject({ ok: true, output: '43' });
  expect(initialize).toHaveBeenCalledTimes(2);
});
