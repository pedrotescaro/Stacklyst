import { useEffect, useMemo, useRef, useState } from 'react';
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
  const signedIn = Boolean(session?.user.id);
  const localKey = 'stacklyst:' + session?.user.id + ':' + key;
  const request = useMemo(() => ({ localKey, enabled, signedIn }), [localKey, enabled, signedIn]);
  const [value, updateValue] = useState(initial),
    [loadedRequest, setLoadedRequest] = useState<typeof request | null>(null),
    [status, setStatus] = useState('Carregando rascunho…');
  const [conflict, setConflict] = useState<{ value: string; version: number } | null>(null);
  const scope = useRef('');
  const generation = useRef(0);
  const initialRef = useRef(initial);
  useEffect(() => {
    initialRef.current = initial;
  }, [initial]);
  const latest = useRef<StoredDraft>({ value: initial, version: 0, dirty: false });
  const writes = useRef(Promise.resolve());
  const syncing = useRef(false);
  const ready = signedIn && enabled && loadedRequest === request;
  const persist = (draft: StoredDraft, target = localKey) => {
    writes.current = writes.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(target, JSON.stringify(draft)));
    return writes.current;
  };
  useEffect(() => {
    let alive = true;
    generation.current += 1;
    scope.current = localKey;
    syncing.current = false;
    const seed = initialRef.current;
    if (signedIn && enabled)
      void AsyncStorage.getItem(localKey)
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
          latest.current = stored ?? { value: seed, version: 0, dirty: false };
          updateValue(latest.current.value);
          setLoadedRequest(request);
          setConflict(null);
          setStatus('Salvo neste aparelho');
        })
        .catch(() => {
          if (alive) {
            latest.current = { value: seed, version: 0, dirty: false };
            updateValue(seed);
            setLoadedRequest(request);
            setConflict(null);
            setStatus('Armazenamento indisponível');
          }
        });
    return () => {
      alive = false;
      scope.current = '';
      generation.current += 1;
    };
  }, [localKey, enabled, signedIn, request]);
  const setValue = (next: string) => {
    if (!ready || scope.current !== localKey) return;
    const draft = { ...latest.current, value: next, dirty: true };
    latest.current = draft;
    const revision = generation.current;
    updateValue(next);
    setStatus('Salvando no aparelho…');
    void persist(draft)
      .then(() => {
        if (scope.current === localKey && generation.current === revision)
          setStatus('Salvo neste aparelho');
      })
      .catch(() => {
        if (scope.current === localKey && generation.current === revision)
          setStatus('Não foi possível salvar no aparelho');
      });
  };
  const sync = async () => {
    if (!ready || scope.current !== localKey || syncing.current) return;
    syncing.current = true;
    const target = localKey;
    const revision = generation.current;
    const active = () => scope.current === target && generation.current === revision;
    const path = '/api/mobile/state/' + encodeURIComponent('draft:' + key);
    setStatus('Sincronizando…');
    try {
      const remote = await api<{ value: string; version: number } | null>(path);
      if (!active()) return;
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
        if (active()) setStatus('Rascunho recuperado da sua conta');
        return;
      }
      const snapshot = draft.value;
      const result = await send<{ version: number }>(
        path,
        { value: snapshot, version: remote?.version ?? 0 },
        'PUT'
      );
      if (!active()) return;
      latest.current = {
        value: latest.current.value,
        version: result.version,
        dirty: latest.current.value !== snapshot,
      };
      await persist(latest.current, target);
      if (active())
        setStatus(
          latest.current.dirty
            ? 'Novo texto salvo localmente. Sincronize novamente.'
            : 'Sincronizado com sua conta'
        );
    } catch (error) {
      if (active())
        setStatus(
          error instanceof ApiError && error.status === 409
            ? 'Outra edição chegou ao servidor. Sincronize para comparar.'
            : errorMessage(error)
        );
    } finally {
      if (active()) syncing.current = false;
    }
  };
  return {
    value: ready ? value : initial,
    setValue,
    ready,
    status: ready ? status : 'Carregando rascunho…',
    sync,
    conflict: ready ? conflict : null,
    acceptRemote: () => {
      if (ready && scope.current === localKey && conflict) {
        const revision = generation.current;
        latest.current = { ...conflict, dirty: false };
        updateValue(conflict.value);
        setConflict(null);
        void persist(latest.current)
          .then(() => {
            if (scope.current === localKey && generation.current === revision)
              setStatus('Versão do servidor salva neste aparelho');
          })
          .catch(() => {
            if (scope.current === localKey && generation.current === revision)
              setStatus('Não foi possível salvar no aparelho');
          });
      }
    },
    keepLocal: () => {
      if (ready && scope.current === localKey && conflict) {
        latest.current = { ...latest.current, version: conflict.version, dirty: true };
        setConflict(null);
        void persist(latest.current).catch(() => undefined);
        setStatus('Texto local preservado. Toque em Sincronizar para enviar.');
      }
    },
    clear: async () => {
      if (!ready || scope.current !== localKey) return;
      const target = localKey;
      const revision = generation.current;
      const version = latest.current.version;
      latest.current = { value: '', version, dirty: false };
      updateValue('');
      setConflict(null);
      writes.current = writes.current
        .catch(() => undefined)
        .then(() => AsyncStorage.removeItem(target));
      await writes.current;
      if (version > 0 && scope.current === target && generation.current === revision) {
        const result = await send<{ version: number }>(
          '/api/mobile/state/' + encodeURIComponent('draft:' + key),
          { value: '', version },
          'PUT'
        ).catch(() => null);
        if (result && scope.current === target && generation.current === revision)
          latest.current.version = result.version;
      }
    },
  };
}
