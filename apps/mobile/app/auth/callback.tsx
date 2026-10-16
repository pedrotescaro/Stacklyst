import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Screen, Label, Button } from '../../src/components/ui';
import { completeAuthCallback, parseAuthCallback } from '../../src/lib/auth-callback';
export default function Callback() {
  const params = useLocalSearchParams<{
    code?: string;
    type?: string;
    token_hash?: string;
    error_description?: string;
    error?: string;
    returnTo?: string;
  }>();
  const [error, setError] = useState('');
  const operation = useRef<Promise<string> | null>(null);
  useEffect(() => {
    let active = true;
    operation.current ??= (async () => {
      const callback =
        params.code || params.token_hash || params.error || params.error_description
          ? params
          : parseAuthCallback((await Linking.getInitialURL()) ?? '');
      return completeAuthCallback(callback);
    })();
    operation.current
      .then((path) => {
        if (active) router.replace(path as never);
      })
      .catch((error) => {
        if (active)
          setError(error instanceof Error ? error.message : 'Não foi possível validar o link.');
      });
    return () => {
      active = false;
    };
  }, [params]);
  return (
    <Screen title="Confirmar acesso">
      <Label>{error || 'Validando seu link…'}</Label>
      {error && <Button label="Voltar ao login" onPress={() => router.replace('/auth')} />}
    </Screen>
  );
}
