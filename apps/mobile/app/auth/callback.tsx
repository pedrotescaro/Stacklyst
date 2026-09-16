import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/lib/supabase';
import { Screen, Label, Button } from '../../src/components/ui';
import { safeRoute } from '../../src/lib/links';
export default function Callback() {
  const params = useLocalSearchParams<{
    code?: string;
    type?: string;
    token_hash?: string;
    error_description?: string;
    returnTo?: string;
  }>();
  const [error, setError] = useState('');
  const operation = useRef<Promise<string> | null>(null);
  useEffect(() => {
    let active = true;
    operation.current ??= (async () => {
      if (params.error_description) throw new Error(params.error_description);
      const initial = await Linking.getInitialURL();
      const url = initial?.includes('auth/callback') ? new URL(initial) : null;
      const fragment = new URLSearchParams(url?.hash.slice(1) ?? '');
      const type = params.type ?? url?.searchParams.get('type') ?? fragment.get('type');
      if (params.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(params.code);
        if (error) throw error;
      } else if (
        params.token_hash &&
        (type === 'recovery' || type === 'email' || type === 'signup')
      ) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: params.token_hash, type });
        if (error) throw error;
      } else if (fragment.get('access_token') && fragment.get('refresh_token')) {
        const { error } = await supabase.auth.setSession({
          access_token: fragment.get('access_token')!,
          refresh_token: fragment.get('refresh_token')!,
        });
        if (error) throw error;
      } else throw new Error('Link inválido ou expirado. Solicite um novo e-mail.');
      return type === 'recovery' ? '/auth/password' : safeRoute(params.returnTo);
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
  }, [params.code, params.type, params.token_hash, params.error_description, params.returnTo]);
  return (
    <Screen title="Confirmar acesso">
      <Label>{error || 'Validando seu link…'}</Label>
      {error && <Button label="Voltar ao login" onPress={() => router.replace('/auth')} />}
    </Screen>
  );
}
