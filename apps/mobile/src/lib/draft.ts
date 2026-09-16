import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSession } from './session';
import { api, send, errorMessage, ApiError } from './api';
interface StoredDraft {
  value: string;
  version: number;
  dirty: boolean;
}
export function useDraft(key: string, initial = '', enabled = true) {
  const { session } = useSession();
  const localKey = 'stacklyst:' + session?.user.id + ':' + key;
  const [value, updateValue] = useState(initial),
    [ready, setReady] = useState(false),
    [status, setStatus] = useState('Carregando rascunho…');
  const [conflict, setConflict] = useState<{ value: string; version: number } | null>(null);
  const scope = useRef('');
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const latest = useRef<StoredDraft>({ value: initial, version: 0, dirty: false });
  const writes = useRef(Promise.resolve());
  const syncing = useRef(false);
  const persist = (draft: StoredDraft, target = localKey) => {
    writes.current = writes.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(target, JSON.stringify(draft)));
    return writes.current;
  };
  useEffect(() => {
    let alive = true;
    scope.current = localKey;
    syncing.current = false;
    setReady(false);
    setConflict(null);
    updateValue(initialRef.current);
    setStatus('Carregando rascunho…');
    if (!session || !enabled) return;
    AsyncStorage.getItem(localKey)
      .then((raw) => {
        if (!alive) return;
        let stored: StoredDraft | null = null;
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (typeof parsed?.value === 'string' && Number.isInteger(parsed.version))
            stored = {
              value: parsed.value,
              version: parsed.version,
              dirty: parsed.dirty !== false,
            };
        } catch {
          /* Malformed storage must not block editing. */
        }
        latest.current = stored ?? { value: initialRef.current, version: 0, dirty: false };
        updateValue(latest.current.value);
        setReady(true);
        setStatus('Salvo neste aparelho');
      })
      .catch(() => {
        if (alive) {
          latest.current = { value: initialRef.current, version: 0, dirty: false };
          updateValue(initialRef.current);
          setReady(true);
          setStatus('Armazenamento indisponível');
        }
      });
    return () => {
      alive = false;
      scope.current = '';
    };
  }, [localKey, enabled, !!session]);
  const setValue = (next: string) => {
    if (!ready || scope.current !== localKey) return;
    const draft = { ...latest.current, value: next, dirty: true };
    latest.current = draft;
    updateValue(next);
    setStatus('Salvando no aparelho…');
    void persist(draft)
      .then(() => {
        if (scope.current === localKey) setStatus('Salvo neste aparelho');
      })
      .catch(() => {
        if (scope.current === localKey) setStatus('Não foi possível salvar no aparelho');
      });
  };
  const sync = async () => {
    if (!ready || !session || syncing.current) return;
    syncing.current = true;
    const target = localKey;
    const path = '/api/mobile/state/' + encodeURIComponent('draft:' + key);
    setStatus('Sincronizando…');
    try {
      const remote = await api<{ value: string; version: number } | null>(path);
      if (scope.current !== target) return;
      const draft = latest.current;
      if (remote && remote.version !== draft.version && remote.value !== draft.value) {
        if (draft.dirty) {
          setConflict(remote);
          setStatus('Compare a versão do servidor. Seu texto foi preservado.');
          return;
        }
        latest.current = { ...remote, dirty: false };
        updateValue(remote.value);
        await persist(latest.current, target);
        setStatus('Rascunho recuperado da sua conta');
        return;
      }
      const snapshot = draft.value;
      const result = await send<{ version: number }>(
        path,
        { value: snapshot, version: remote?.version ?? 0 },
        'PUT'
      );
      if (scope.current !== target) return;
      latest.current = {
        value: latest.current.value,
        version: result.version,
        dirty: latest.current.value !== snapshot,
      };
      await persist(latest.current, target);
      setStatus(
        latest.current.dirty
          ? 'Novo texto salvo localmente. Sincronize novamente.'
          : 'Sincronizado com sua conta'
      );
    } catch (error) {
      if (scope.current === target)
        setStatus(
          error instanceof ApiError && error.status === 409
            ? 'Outra edição chegou ao servidor. Sincronize para comparar.'
            : errorMessage(error)
        );
    } finally {
      if (scope.current === target) syncing.current = false;
    }
  };
  return {
    value,
    setValue,
    ready: ready && scope.current === localKey,
    status,
    sync,
    conflict,
    acceptRemote: () => {
      if (conflict) {
        latest.current = { ...conflict, dirty: false };
        updateValue(conflict.value);
        setConflict(null);
        void persist(latest.current)
          .then(() => setStatus('Versão do servidor salva neste aparelho'))
          .catch(() => setStatus('Não foi possível salvar no aparelho'));
      }
    },
    keepLocal: () => {
      if (conflict) {
        latest.current = { ...latest.current, version: conflict.version, dirty: true };
        setConflict(null);
        void persist(latest.current).catch(() => undefined);
        setStatus('Texto local preservado. Toque em Sincronizar para enviar.');
      }
    },
    clear: async () => {
      const target = localKey;
      const version = latest.current.version;
      latest.current = { value: '', version, dirty: false };
      updateValue('');
      setConflict(null);
      await writes.current.catch(() => undefined);
      await AsyncStorage.removeItem(target);
      if (version > 0 && scope.current === target) {
        const result = await send<{ version: number }>(
          '/api/mobile/state/' + encodeURIComponent('draft:' + key),
          { value: '', version },
          'PUT'
        ).catch(() => null);
        if (result && scope.current === target) latest.current.version = result.version;
      }
    },
  };
}
