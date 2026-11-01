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

it('drains async functions and chained Promise continuations before collecting output', async () => {
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');
  const result = await runJavaScriptInSandbox(`
    async function value() { return await Promise.resolve(21); }
    value().then(result => result * 2).then(result => console.log(result));
  `);
  expect(result).toMatchObject({ ok: true, output: '42' });
});

it('supports concurrent isolated timers with arguments and cancellation', async () => {
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');
  const result = await runJavaScriptInSandbox(`
    const cancelled = setTimeout(() => console.log('must not run'), 1);
    clearTimeout(cancelled);
    const completed = [];
    Promise.all([30, 5, 15].map(delay => new Promise(resolve => {
      setTimeout((value) => { completed.push(value); resolve(value * 2); }, delay, delay);
    }))).then(values => console.log(JSON.stringify({ values, completed })));
  `);
  expect(result?.ok, result?.error).toBe(true);
  expect(JSON.parse(result!.output)).toEqual({ values: [60, 10, 30], completed: [5, 15, 30] });
});

it('reports errors thrown by timer callbacks', async () => {
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');
  expect(
    await runJavaScriptInSandbox('setTimeout(() => { throw new Error("timer failed"); }, 0);')
  ).toMatchObject({ ok: false, error: 'timer failed' });
});

it('reports an async result that rejects or cannot finish', async () => {
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');
  expect(
    await runJavaScriptInSandbox('(async () => { throw new Error("async failed"); })()')
  ).toMatchObject({ ok: false, error: 'async failed' });
  expect(await runJavaScriptInSandbox('new Promise(() => {})')).toMatchObject({ ok: false });
});

it.each([
  'Promise.resolve().then(function repeat() { Promise.resolve().then(repeat); });',
  'setTimeout(function repeat() { setTimeout(repeat, 0); }, 0);',
  'setTimeout(() => console.log("too late"), 60000);',
])('enforces the same deadline for asynchronous work: %s', async (code) => {
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');
  const started = performance.now();
  const result = await runJavaScriptInSandbox(code, 25);
  expect(result?.ok).toBe(false);
  expect(result?.error).toContain('Tempo limite de execução atingido');
  expect(performance.now() - started).toBeLessThan(1000);
});

it('bounds pending timers and cleans retained callbacks before the next execution', async () => {
  const { runJavaScriptInSandbox } = await import('./javascript-sandbox');
  const overflow = await runJavaScriptInSandbox(`
    for (let index = 0; index < 2000; index++) setTimeout(() => {}, 1000);
  `);
  expect(overflow).toMatchObject({ ok: false, error: 'Limite de timers pendentes atingido.' });
  expect(
    await runJavaScriptInSandbox('console.log(typeof require, typeof fetch, typeof process.env)')
  ).toMatchObject({ ok: true, output: 'undefined undefined undefined' });
});
