export interface CodeRunResult {
  ok: boolean;
  output: string;
  error?: string;
}

export async function runCodeInSandbox(
  code: string,
  language?: string | null
): Promise<CodeRunResult> {
  let normalized = language?.toLowerCase() ?? 'typescript';
  if (normalized === 'js') normalized = 'javascript';
  if (normalized === 'ts') normalized = 'typescript';

  try {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language: normalized }),
    });

    const data = await res.json();
    return {
      ok: Boolean(data.ok),
      output: data.output ?? '',
      error: data.error,
    };
  } catch {
    return {
      ok: false,
      output: '',
      error: 'Falha ao conectar com o serviço de execução.',
    };
  }
}
