import { useState } from 'react';
import { Image, Text, View, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Screen, Field, Button, Label, Choice, styles } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { send, errorMessage } from '../../src/lib/api';
import { safeRoute } from '../../src/lib/links';
import * as WebBrowser from 'expo-web-browser';
export default function Auth() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [info, setInfo] = useState('');
  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'recover') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'stacklyst://auth/callback?type=recovery',
        });
        if (error) throw error;
        setInfo('Confira seu e-mail para recuperar a senha.');
        return;
      }
      if (mode === 'register') await send('/api/auth/register', { email, password, username });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace(mode === 'register' ? '/onboarding' : (safeRoute(returnTo) as never));
    },
  });
  const oauth = useMutation({
    mutationFn: async (provider: 'google' | 'github' | 'discord') => {
      const redirect =
        'stacklyst://auth/callback?returnTo=' + encodeURIComponent(safeRoute(returnTo));
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirect, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('O provedor não retornou um endereço de acesso.');
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'stacklyst://auth/callback');
      if (result.type !== 'success') {
        setInfo('Acesso cancelado. Você pode tentar novamente.');
        return;
      }
      const url = new URL(result.url);
      router.replace(('/auth/callback' + url.search + url.hash) as never);
    },
  });
  return (
    <Screen title="Stacklyst">
      <View style={{ paddingTop: 24, gap: 16 }}>
        <Image source={require('../../assets/logo.png')} style={{ width: 64, height: 64 }} />
        <Text style={styles.title}>Seu próximo passo começa aqui.</Text>
        <Label muted>Aprenda, pratique e compartilhe com a comunidade.</Label>
      </View>
      <Choice
        value={mode}
        onChange={(v) => {
          setMode(v);
          mutation.reset();
          setInfo('');
        }}
        options={[
          { value: 'login', label: 'Entrar' },
          { value: 'register', label: 'Criar conta' },
          { value: 'recover', label: 'Recuperar' },
        ]}
      />
      {mode === 'register' && (
        <Field
          label="Nome de usuário"
          value={username}
          onChangeText={setUsername}
          autoComplete="username"
        />
      )}
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
      />
      {mode !== 'recover' && (
        <Field
          label="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />
      )}
      {mutation.error && (
        <Label>
          {mutation.error instanceof Error ? mutation.error.message : errorMessage(mutation.error)}
        </Label>
      )}
      {info && <Label>{info}</Label>}
      <Button
        label={
          mode === 'login'
            ? 'Entrar na minha conta'
            : mode === 'register'
              ? 'Criar minha conta'
              : 'Enviar recuperação'
        }
        busy={mutation.isPending}
        disabled={oauth.isPending || !email || (mode !== 'recover' && !password)}
        onPress={() => mutation.mutate()}
      />
      {mode === 'login' && Platform.OS !== 'web' && (
        <>
          {(['google', 'github', 'discord'] as const).map((provider) => (
            <Button
              key={provider}
              secondary
              label={
                'Continuar com ' +
                { google: 'Google', github: 'GitHub', discord: 'Discord' }[provider]
              }
              busy={oauth.isPending}
              disabled={mutation.isPending}
              onPress={() => {
                setInfo('');
                oauth.mutate(provider);
              }}
            />
          ))}
        </>
      )}
      {oauth.error && <Label>{oauth.error.message}</Label>}
      <Button
        secondary
        label="Reenviar confirmação de e-mail"
        onPress={async () => {
          const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: 'stacklyst://auth/callback' },
          });
          setInfo(error ? error.message : 'E-mail de confirmação solicitado.');
        }}
      />
    </Screen>
  );
}
