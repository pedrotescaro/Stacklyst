'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, ShieldCheck } from 'lucide-react';
import { SpotifyLogo } from '@/components/icons/SpotifyLogo';

import {
  disconnectSpotify,
  fetchSpotifyConnection,
  notifySpotifyConnectionChanged,
  type SpotifyConnectionStatus,
} from '@/lib/client/spotify-connection';

const OUTCOMES: Record<string, { tone: 'ok' | 'error'; text: string }> = {
  connected: { tone: 'ok', text: 'Conta Spotify conectada.' },
  denied: { tone: 'error', text: 'Você cancelou a conexão no Spotify.' },
  invalid_state: {
    tone: 'error',
    text: 'O pedido de conexão expirou ou veio de outra sessão. Tente de novo.',
  },
  not_allowed: {
    tone: 'error',
    text: 'O Spotify ainda não liberou esta conta para o Stacklyst. Enquanto o app estiver em modo de desenvolvimento no Spotify, cada conta precisa ser adicionada pelo responsável do Stacklyst.',
  },
  not_configured: {
    tone: 'error',
    text: 'A conexão com o Spotify não está configurada no servidor.',
  },
  rate_limited: {
    tone: 'error',
    text: 'Muitas tentativas. Espere alguns minutos e tente de novo.',
  },
  revoked: { tone: 'error', text: 'O acesso foi revogado no Spotify. Conecte de novo.' },
  signed_out: {
    tone: 'error',
    text: 'Sua sessão expirou durante a conexão. Entre e tente de novo.',
  },
  wrong_host: {
    tone: 'error',
    text: 'Abra o Stacklyst pelo endereço cadastrado no Spotify para conectar. No ambiente local, use http://127.0.0.1:3000 em vez de localhost.',
  },
  error: { tone: 'error', text: 'Não foi possível conectar ao Spotify agora. Tente de novo.' },
};

/** Settings → Spotify: each person links their own Spotify account. */
export function SpotifyConnectionSettings() {
  const [status, setStatus] = useState<SpotifyConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      setStatus(await fetchSpotifyConnection(signal));
      setError('');
    } catch (failure) {
      if ((failure as Error)?.name !== 'AbortError')
        setError('Não foi possível verificar a conexão com o Spotify.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('spotify');
    if (result) {
      setOutcome(OUTCOMES[result] ? result : 'error');
      // Drop the one-time OAuth outcome so a reload does not repeat the message.
      params.delete('spotify');
      const query = params.toString();
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`
      );
      if (result === 'connected') notifySpotifyConnectionChanged();
    }
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const disconnect = async () => {
    setBusy(true);
    setOutcome(null);
    try {
      await disconnectSpotify();
      await refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível desconectar.');
    } finally {
      setBusy(false);
    }
  };

  const message = outcome ? OUTCOMES[outcome] : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-dd-muted uppercase tracking-wider mb-1">
          Conta Spotify
        </h3>
        <p className="text-xs text-dd-muted leading-relaxed">
          Conecte sua própria conta para ouvir as músicas inteiras dos perfis e posts aqui no
          Stacklyst. Sem conexão, o player mostra a prévia do Spotify.
        </p>
      </div>

      {message && (
        <div
          role={message.tone === 'ok' ? 'status' : 'alert'}
          className={`rounded-lg border p-3 text-xs flex items-start gap-2 ${
            message.tone === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.tone === 'ok' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {message.text}
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="bg-dd-surface border border-dd-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <SpotifyLogo className="h-10 w-10 shrink-0 text-[#1ED760]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-dd-text">Spotify</p>
            <p className="text-xs text-dd-muted">
              {loading
                ? 'Verificando…'
                : !status?.configured
                  ? 'Indisponível neste servidor'
                  : status.connected
                    ? `Conectado${status.displayName ? ` como ${status.displayName}` : ''}`
                    : 'Não conectado'}
            </p>
          </div>
          {!loading && status?.configured && !status.connected && (
            // A plain link: the OAuth flow is a full-page redirect to Spotify.
            <a
              href="/api/spotify/connect"
              className="rounded-full bg-[#1db954] px-4 py-2 text-xs font-bold text-black hover:bg-[#1ed760]"
            >
              Conectar
            </a>
          )}
          {!loading && status?.connected && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void disconnect()}
              className="rounded-full border border-dd-border px-4 py-2 text-xs font-bold text-dd-text hover:bg-dd-bg cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Desconectando…' : 'Desconectar'}
            </button>
          )}
        </div>

        {status?.connected && status.premium === false && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-400">
            Sua conta é Spotify Free. O Spotify só libera a música inteira em outros sites para
            contas Premium, então o player continua tocando a prévia.
          </p>
        )}
        {status?.connected && status.premium && (
          <p className="text-xs text-dd-muted">
            Tudo certo: as músicas tocam inteiras pela sua conta Premium. Ao dar play aqui, o
            Spotify pausa o que estiver tocando em outro aparelho.
          </p>
        )}

        <ul className="space-y-1.5 border-t border-dd-border pt-4 text-[11px] text-dd-muted">
          <li className="flex gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />O
            Stacklyst nunca vê sua senha do Spotify; o login acontece no site do Spotify.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
            Pedimos só o necessário para tocar músicas: reprodução e dados básicos da conta.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />A
            conexão fica criptografada neste navegador e é apagada quando você sai ou desconecta.
            Também dá para revogar em spotify.com/account/apps.
          </li>
        </ul>
      </div>
    </div>
  );
}
