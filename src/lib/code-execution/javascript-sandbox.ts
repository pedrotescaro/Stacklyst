import 'server-only';

import releaseVariant from '@jitl/quickjs-singlefile-browser-release-sync';
import {
  newQuickJSWASMModuleFromVariant,
  shouldInterruptAfterDeadline,
  type QuickJSContext,
  type QuickJSHandle,
  type QuickJSRuntime,
} from 'quickjs-emscripten-core';
import type { ServerExecutionResult } from '@/lib/code-execution/server';
import { logger } from '@/lib/logger';

const JAVASCRIPT_TIMEOUT_MS = 5_000;
const JAVASCRIPT_MEMORY_LIMIT_BYTES = 32 * 1024 * 1024;
const JAVASCRIPT_STACK_LIMIT_BYTES = 512 * 1024;
const JAVASCRIPT_OUTPUT_LIMIT_CHARS = 16_384;
const JAVASCRIPT_TIMER_LIMIT = 1_024;

interface SandboxOutput {
  chunks: string[];
  length: number;
}

let quickJsModulePromise: ReturnType<typeof newQuickJSWASMModuleFromVariant> | undefined;

function getQuickJsModule() {
  quickJsModulePromise ??= newQuickJSWASMModuleFromVariant(releaseVariant).catch((error) => {
    // A failed cold start must not poison every later request in this process.
    quickJsModulePromise = undefined;
    throw error;
  });
  return quickJsModulePromise;
}

function formatOutputValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function appendOutput(output: SandboxOutput, value: string) {
  const remaining = JAVASCRIPT_OUTPUT_LIMIT_CHARS - output.length;
  if (remaining <= 0) return;

  const chunk = value.slice(0, remaining);
  output.chunks.push(chunk);
  output.length += chunk.length;
}

function exposeOutputApi(vm: QuickJSContext, output: SandboxOutput) {
  const write = (separator: string, suffix: string) =>
    vm.newFunction('write', (...args: QuickJSHandle[]) => {
      if (output.length < JAVASCRIPT_OUTPUT_LIMIT_CHARS) {
        appendOutput(
          output,
          args.map((arg) => formatOutputValue(vm.dump(arg))).join(separator) + suffix
        );
      }
      return vm.undefined;
    });

  const consoleObject = vm.newObject();
  for (const method of ['log', 'info', 'warn', 'error']) {
    const callback = write(' ', '\n');
    vm.setProp(consoleObject, method, callback);
    callback.dispose();
  }
  vm.setProp(vm.global, 'console', consoleObject);
  consoleObject.dispose();

  const stdoutObject = vm.newObject();
  const stdoutWrite = write('', '');
  vm.setProp(stdoutObject, 'write', stdoutWrite);
  stdoutWrite.dispose();

  const processObject = vm.newObject();
  vm.setProp(processObject, 'stdout', stdoutObject);
  stdoutObject.dispose();
  vm.setProp(vm.global, 'process', processObject);
  processObject.dispose();
}

function exposeTimerApi(vm: QuickJSContext) {
  const timers = new Map<
    number,
    { dueAt: number; callback: QuickJSHandle; args: QuickJSHandle[] }
  >();
  let nextId = 1;
  const disposeTimer = (timer: { callback: QuickJSHandle; args: QuickJSHandle[] }) => {
    timer.callback.dispose();
    timer.args.forEach((arg) => arg.dispose());
  };
  const schedule = vm.newFunction('setTimeout', (callback, delay, ...args) => {
    if (!callback || vm.typeof(callback) !== 'function') {
      return {
        error: vm.newError({ name: 'TypeError', message: 'setTimeout espera uma função.' }),
      };
    }
    if (timers.size >= JAVASCRIPT_TIMER_LIMIT) {
      return {
        error: vm.newError({ name: 'RangeError', message: 'Limite de timers pendentes atingido.' }),
      };
    }
    const milliseconds = delay ? vm.getNumber(delay) : 0;
    const id = nextId++;
    timers.set(id, {
      dueAt: Date.now() + Math.max(0, Number.isFinite(milliseconds) ? milliseconds : 0),
      callback: callback.dup(),
      args: args.map((arg) => arg.dup()),
    });
    return vm.newNumber(id);
  });
  const cancel = vm.newFunction('clearTimeout', (id) => {
    const timerId = id ? vm.getNumber(id) : 0;
    const timer = timers.get(timerId);
    if (timer) {
      timers.delete(timerId);
      disposeTimer(timer);
    }
    return vm.undefined;
  });
  vm.setProp(vm.global, 'setTimeout', schedule);
  vm.setProp(vm.global, 'clearTimeout', cancel);
  schedule.dispose();
  cancel.dispose();

  return {
    get size() {
      return timers.size;
    },
    async runNext(deadline: number) {
      const next = [...timers.entries()].sort((left, right) => left[1].dueAt - right[1].dueAt)[0];
      if (!next) return;
      const [id, timer] = next;
      const waitMs = Math.min(timer.dueAt, deadline) - Date.now();
      if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
      if (Date.now() >= deadline) throw { name: 'InternalError', message: 'interrupted' };
      timers.delete(id);
      try {
        const result = vm.callFunction(timer.callback, vm.undefined, timer.args);
        if (result.error) {
          const error = vm.dump(result.error);
          result.error.dispose();
          throw error;
        }
        result.value.dispose();
      } finally {
        disposeTimer(timer);
      }
    },
    dispose() {
      timers.forEach(disposeTimer);
      timers.clear();
    },
  };
}

function executionError(
  error: unknown,
  output: string,
  executionMs: number,
  timeoutMs: number
): ServerExecutionResult {
  const record = error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  const name = typeof record.name === 'string' ? record.name : '';
  const message = typeof record.message === 'string' ? record.message : String(error);

  if (name === 'InternalError' && /interrupted/i.test(message)) {
    return {
      ok: false,
      output,
      error: `Tempo limite de execução atingido (${timeoutMs / 1000}s).`,
      executionMs,
    };
  }

  if (name === 'SyntaxError') {
    return {
      ok: false,
      output: message,
      error: 'Erro de compilação.',
      executionMs,
    };
  }

  return {
    ok: false,
    output,
    error: message || 'Erro em tempo de execução.',
    executionMs,
  };
}

function disposeSafely(disposable: QuickJSContext | QuickJSRuntime | undefined) {
  if (!disposable?.alive) return;
  try {
    disposable.dispose();
  } catch {
    // A runtime interrupted by a memory limit may already be partially disposed.
  }
}

export async function runJavaScriptInSandbox(
  code: string,
  timeoutMs = JAVASCRIPT_TIMEOUT_MS
): Promise<ServerExecutionResult | null> {
  let runtime: QuickJSRuntime | undefined;
  let vm: QuickJSContext | undefined;

  try {
    const quickJs = await getQuickJsModule();
    runtime = quickJs.newRuntime();
    runtime.setMemoryLimit(JAVASCRIPT_MEMORY_LIMIT_BYTES);
    runtime.setMaxStackSize(JAVASCRIPT_STACK_LIMIT_BYTES);
    vm = runtime.newContext();
  } catch (error) {
    logger.error('JavaScript sandbox initialization failed', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    disposeSafely(vm);
    disposeSafely(runtime);
    return null;
  }

  const output: SandboxOutput = { chunks: [], length: 0 };
  let timers: ReturnType<typeof exposeTimerApi> | undefined;
  const deadline = Date.now() + timeoutMs;
  try {
    exposeOutputApi(vm, output);
    timers = exposeTimerApi(vm);
    runtime.setInterruptHandler(shouldInterruptAfterDeadline(deadline));
  } catch (error) {
    logger.error('JavaScript sandbox output setup failed', {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    timers?.dispose();
    disposeSafely(vm);
    disposeSafely(runtime);
    return null;
  }
  const startedAt = performance.now();

  try {
    const result = vm.evalCode(code, 'stacklyst-submission.js');

    if (result.error) {
      const error = vm.dump(result.error);
      result.error.dispose();
      throw error;
    }

    try {
      // QuickJS does not drain Promise continuations after evalCode. The exercise
      // harness awaits every case, including calls to synchronous student code.
      while (runtime.hasPendingJob() || timers.size) {
        if (Date.now() >= deadline) throw { name: 'InternalError', message: 'interrupted' };
        if (runtime.hasPendingJob()) {
          const pending = runtime.executePendingJobs(128);
          if (pending.error) {
            const error = pending.error.context.dump(pending.error);
            pending.error.dispose();
            throw error;
          }
        } else {
          await timers.runNext(deadline);
        }
      }
      const state = vm.getPromiseState(result.value);
      if (state.type === 'pending') {
        throw new Error('A execução assíncrona não foi concluída.');
      }
      if (state.type === 'rejected') {
        const error = vm.dump(state.error);
        state.error.dispose();
        throw error;
      }
      if (!state.notAPromise) state.value.dispose();
    } finally {
      result.value.dispose();
    }
    return {
      ok: true,
      output: output.chunks.join('').trim() || '(sem output)',
      executionMs: Math.max(0, Math.round(performance.now() - startedAt)),
    };
  } catch (error) {
    return executionError(
      error,
      output.chunks.join('').trim(),
      Math.max(0, Math.round(performance.now() - startedAt)),
      timeoutMs
    );
  } finally {
    timers?.dispose();
    disposeSafely(vm);
    disposeSafely(runtime);
  }
}
