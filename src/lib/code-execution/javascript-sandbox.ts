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

const JAVASCRIPT_TIMEOUT_MS = 5_000;
const JAVASCRIPT_MEMORY_LIMIT_BYTES = 32 * 1024 * 1024;
const JAVASCRIPT_STACK_LIMIT_BYTES = 512 * 1024;
const JAVASCRIPT_OUTPUT_LIMIT_CHARS = 16_384;

interface SandboxOutput {
  chunks: string[];
  length: number;
}

let quickJsModulePromise: ReturnType<typeof newQuickJSWASMModuleFromVariant> | undefined;

function getQuickJsModule() {
  quickJsModulePromise ??= newQuickJSWASMModuleFromVariant(releaseVariant);
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
  } catch {
    disposeSafely(vm);
    disposeSafely(runtime);
    return null;
  }

  const output: SandboxOutput = { chunks: [], length: 0 };
  try {
    exposeOutputApi(vm, output);
    runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + timeoutMs));
  } catch {
    disposeSafely(vm);
    disposeSafely(runtime);
    return null;
  }
  const startedAt = performance.now();

  try {
    const result = vm.evalCode(code, 'stacklyst-submission.js');
    const executionMs = Math.max(0, Math.round(performance.now() - startedAt));
    const capturedOutput = output.chunks.join('').trim();

    if (result.error) {
      const error = vm.dump(result.error);
      result.error.dispose();
      return executionError(error, capturedOutput, executionMs, timeoutMs);
    }

    result.value.dispose();
    return {
      ok: true,
      output: capturedOutput || '(sem output)',
      executionMs,
    };
  } catch (error) {
    return executionError(
      error,
      output.chunks.join('').trim(),
      Math.max(0, Math.round(performance.now() - startedAt)),
      timeoutMs
    );
  } finally {
    disposeSafely(vm);
    disposeSafely(runtime);
  }
}
