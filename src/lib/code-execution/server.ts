import 'server-only';

import { JUDGE0_API_URL, JUDGE0_LANGUAGES, WANDBOX_API_URL, WANDBOX_LANGUAGES } from '@/lib/config';

export interface ServerExecutionResult {
  ok: boolean;
  output: string;
  error?: string;
  executionMs: number;
}

function cleanJvmWarnings(stderr: string): string {
  return stderr
    .split('\n')
    .filter(
      (line) =>
        !line.includes('OpenJDK 64-Bit Server VM warning:') &&
        !line.includes('-Xverify:none') &&
        !line.includes('-noverify')
    )
    .join('\n')
    .trim();
}

function indent(code: string): string {
  return code
    .split('\n')
    .map((line) => (line.trim() ? `    ${line}` : line))
    .join('\n');
}

export function prepareCode(
  code: string,
  language: string,
  provider: 'judge0' | 'wandbox'
): string {
  const trimmed = code.trim();

  switch (language) {
    case 'java': {
      if (/class\s+\w+/i.test(trimmed)) {
        return provider === 'wandbox' ? trimmed.replace(/public\s+class\s+/gi, 'class ') : trimmed;
      }
      const classDeclaration = provider === 'wandbox' ? 'class Main' : 'public class Main';
      return `${classDeclaration} {\n  public static void main(String[] args) {\n${indent(trimmed)}\n  }\n}`;
    }
    case 'go':
      return /package\s+main/i.test(trimmed)
        ? trimmed
        : `package main\n\nimport "fmt"\n\nfunc main() {\n${indent(trimmed)}\n}`;
    case 'cpp':
    case 'c':
      return /#include|main\s*\(/i.test(trimmed)
        ? trimmed
        : `#include <iostream>\nusing namespace std;\n\nint main() {\n${indent(trimmed)}\n  return 0;\n}`;
    case 'kotlin':
      return /fun\s+main\s*\(/i.test(trimmed) ? trimmed : `fun main() {\n${indent(trimmed)}\n}`;
    case 'swift':
      return /import\s+Foundation/i.test(trimmed) ? trimmed : `import Foundation\n\n${trimmed}`;
    case 'rust':
      return /fn\s+main\s*\(/i.test(trimmed) ? trimmed : `fn main() {\n${indent(trimmed)}\n}`;
    default:
      return trimmed;
  }
}

async function runOnJudge0(
  code: string,
  languageId: number
): Promise<ServerExecutionResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const startedAt = performance.now();

  try {
    const response = await fetch(JUDGE0_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code: code, language_id: languageId }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const stdout = (data.stdout as string | undefined)?.trim() ?? '';
    const stderr = cleanJvmWarnings((data.stderr as string | undefined)?.trim() ?? '');
    const compileOutput = (data.compile_output as string | undefined)?.trim() ?? '';
    const statusId = data.status?.id;
    const reportedSeconds = Number(data.time);
    const executionMs =
      Number.isFinite(reportedSeconds) && reportedSeconds >= 0
        ? Math.max(0, Math.round(reportedSeconds * 1000))
        : Math.max(0, Math.round(performance.now() - startedAt));

    if (statusId === 3) {
      return {
        ok: true,
        output: stdout || '(sem output)',
        error: stderr || undefined,
        executionMs,
      };
    }
    if (statusId === 6) {
      return {
        ok: false,
        output: compileOutput || stderr,
        error: 'Erro de compilação.',
        executionMs,
      };
    }
    if (statusId === 5) {
      return {
        ok: false,
        output: '',
        error: 'Tempo limite de execução atingido (15s).',
        executionMs,
      };
    }

    return {
      ok: false,
      output: stdout,
      error: stderr || compileOutput || data.status?.description || 'Erro em tempo de execução.',
      executionMs,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        output: '',
        error: 'Tempo limite de execução atingido (15s).',
        executionMs: Math.max(0, Math.round(performance.now() - startedAt)),
      };
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function runOnWandbox(code: string, compiler: string): Promise<ServerExecutionResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const startedAt = performance.now();

  try {
    const response = await fetch(WANDBOX_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, compiler }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const result = await response.json();
    const stdout = (result.program_output as string | undefined)?.trim() ?? '';
    const stderr = (result.program_error as string | undefined)?.trim() ?? '';
    const compileOutput = (result.compiler_output as string | undefined)?.trim() ?? '';
    const compileError = (result.compiler_error as string | undefined)?.trim() ?? '';
    const executionMs = Math.max(0, Math.round(performance.now() - startedAt));

    if (compileError && result.status !== '0') {
      return {
        ok: false,
        output: compileOutput || compileError,
        error: 'Erro de compilação.',
        executionMs,
      };
    }
    if (result.signal) {
      return {
        ok: false,
        output: stdout,
        error: stderr || `Execução interrompida (${result.signal}).`,
        executionMs,
      };
    }
    if (result.status !== '0' && result.status !== 0) {
      return {
        ok: false,
        output: stdout,
        error: stderr || 'Erro em tempo de execução.',
        executionMs,
      };
    }

    return { ok: true, output: stdout || '(sem output)', error: stderr || undefined, executionMs };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        output: '',
        error: 'Tempo limite de execução atingido (15s).',
        executionMs: Math.max(0, Math.round(performance.now() - startedAt)),
      };
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function executeCode(code: string, language: string): Promise<ServerExecutionResult> {
  const normalized = language.toLowerCase();
  const judge0LanguageId = JUDGE0_LANGUAGES[normalized];
  const wandboxLanguage = WANDBOX_LANGUAGES[normalized];

  if (!judge0LanguageId && !wandboxLanguage) {
    return {
      ok: false,
      output: '',
      error: `Linguagem "${language}" não suportada.`,
      executionMs: 0,
    };
  }

  if (judge0LanguageId) {
    const result = await runOnJudge0(prepareCode(code, normalized, 'judge0'), judge0LanguageId);
    if (result) return result;
  }

  if (wandboxLanguage && normalized !== 'kotlin' && normalized !== 'swift') {
    const result = await runOnWandbox(
      prepareCode(code, normalized, 'wandbox'),
      wandboxLanguage.compiler
    );
    if (result) return result;
  }

  return {
    ok: false,
    output: '',
    error: 'Serviço de execução indisponível no momento. Tente novamente em instantes.',
    executionMs: 0,
  };
}
