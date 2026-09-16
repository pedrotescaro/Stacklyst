import { supabase } from './supabase';
import { config } from './config';
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}
let refresh: Promise<unknown> | null = null;
export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  if (!path.startsWith('/api/')) throw new Error('Destino de API inválido.');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const abort = () => controller.abort();
  init.signal?.addEventListener('abort', abort, { once: true });
  if (init.signal?.aborted) controller.abort();
  let response: Response;
  try {
    response = await fetch(config.apiUrl + path, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(!(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
        ...(session ? { Authorization: 'Bearer ' + session.access_token } : {}),
      },
    });
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener('abort', abort);
  }
  if (response.status === 401 && session && retry) {
    if (!refresh)
      refresh = supabase.auth.refreshSession().finally(() => {
        refresh = null;
      });
    const result = (await refresh) as { error?: Error | null };
    if (result.error) throw result.error;
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    if (current?.user.id !== session.user.id)
      throw new ApiError(401, 'Sua conta mudou. Abra este conteúdo novamente para continuar.');
    return api<T>(path, init, false);
  }
  if (response.status === 204) return undefined as T;
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new ApiError(response.status, 'O servidor respondeu em um formato inesperado.');
  const body = await response.json();
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.message || body.error || 'Não foi possível concluir.',
      body
    );
  return body as T;
}
export const send = <T>(path: string, body: unknown = {}, method = 'POST') =>
  api<T>(path, { method, body: JSON.stringify(body) });
export const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : 'Sem conexão com o servidor. Seu rascunho continua salvo; tente novamente.';
