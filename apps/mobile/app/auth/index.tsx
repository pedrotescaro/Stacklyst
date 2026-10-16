import { useState } from 'react';
import { Image, Text, View, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { Screen, Field, Button, Label, Choice, useUIStyles } from '../../src/components/ui';
import { supabase } from '../../src/lib/supabase';
import { send, errorMessage } from '../../src/lib/api';
import { configured } from '../../src/lib/config';
import { safeRoute } from '../../src/lib/links';
import { disablePreview, enablePreview } from '../../src/lib/preview';
import { queryClient } from '../../src/lib/query';
import { useTheme } from '../../src/theme';

type Mode = 'login' | 'register' | 'recover';
export default function Auth() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { colors } = useTheme();
  const styles = useUIStyles();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [info, setInfo] = useState('');
  const [openingPreview, setOpeningPreview] = useState(false);
  const beginConnection = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    disablePreview();
    setInfo('');
  };
  const mutation = useMutation({
    mutationFn: async () => {
      if (!configured) throw new Error('A conexão com o Stacklyst ainda não está disponível.');
      await beginConnection();
      const address = email.trim();
      if (mode === 'recover') {
        const { error } = await supabase.auth.resetPasswordForEmail(address, {
          redirectTo: 'stacklyst://auth/callback?type=recovery',
        });
        if (error) throw error;
        setInfo('Confira seu e-mail para recuperar a senha.');
        return;
      }
      const registering = mode === 'register';
      if (registering) {
        await send('/api/auth/register', { email: address, password, username: username.trim() });
        // The account now exists, including when the project requires confirmation.
        // Another tap must log in instead of trying to create the account again.
        setMode('login');
      }
      const { error } = await supabase.auth.signInWithPassword({ email: address, password });
      if (error) {
        if (error.code === 'email_not_confirmed') {
          setInfo(
            'Sua conta precisa de confirmação. Confira seu e-mail ou solicite um novo link abaixo.'
          );
          return;
        }
        throw error;
      }
      setPassword('');
      router.replace(registering ? '/onboarding' : (safeRoute(returnTo) as never));
    },
  });
  const oauth = useMutation({
    mutationFn: async (provider: 'google' | 'github' | 'discord') => {
      if (!configured) throw new Error('A conexão com o Stacklyst ainda não está disponível.');
      await beginConnection();
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
  const resend = useMutation({
    mutationFn: async () => {
      await beginConnection();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: 'stacklyst://auth/callback' },
      });
      if (error) throw error;
      setInfo('E-mail de confirmação solicitado. Confira também a caixa de spam.');
    },
  });
  const busy = mutation.isPending || oauth.isPending || resend.isPending || openingPreview;
  const openPreview = async () => {
    setOpeningPreview(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    enablePreview();
    router.replace('/');
    setOpeningPreview(false);
  };
  return (
    <Screen title="Stacklyst">
      <View style={{ paddingTop: 20, paddingBottom: 12, gap: 20 }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 44, height: 44 }}
          accessibilityLabel="Stacklyst"
        />
        <Text style={[styles.title, { fontSize: 32, lineHeight: 38, maxWidth: 360 }]}>
          Aprender fica melhor em comunidade.
        </Text>
        <Label muted>
          Compartilhe suas descobertas, pratique código e encontre seu próximo passo.
        </Label>
      </View>
      {configured ? (
        <>
          <Choice
            value={mode}
            onChange={(value) => {
              setMode(value as Mode);
              mutation.reset();
              oauth.reset();
              resend.reset();
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
              autoCapitalize="none"
              editable={!busy}
            />
          )}
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            editable={!busy}
          />
          {mode !== 'recover' && (
            <Field
              label="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              editable={!busy}
            />
          )}
          {mutation.error && (
            <Label>
              {mutation.error instanceof Error
                ? mutation.error.message
                : errorMessage(mutation.error)}
            </Label>
          )}
          <Button
            label={
              mode === 'login'
                ? 'Entrar na minha conta'
                : mode === 'register'
                  ? 'Criar minha conta'
                  : 'Enviar recuperação'
            }
            busy={mutation.isPending}
            disabled={
              busy ||
              !email.trim() ||
              (mode !== 'recover' && !password) ||
              (mode === 'register' && !username.trim())
            }
            onPress={() => mutation.mutate()}
          />
          {mode === 'login' &&
            Platform.OS !== 'web' &&
            (['google', 'github', 'discord'] as const).map((provider) => (
              <Button
                key={provider}
                secondary
                label={
                  'Continuar com ' +
                  { google: 'Google', github: 'GitHub', discord: 'Discord' }[provider]
                }
                disabled={busy}
                onPress={() => oauth.mutate(provider)}
              />
            ))}
          {oauth.error && <Label>{oauth.error.message}</Label>}
          {mode === 'login' && (
            <Button
              secondary
              label="Reenviar confirmação de e-mail"
              disabled={busy || !email.trim()}
              busy={resend.isPending}
              onPress={() => resend.mutate()}
            />
          )}
          {resend.error && <Label>{resend.error.message}</Label>}
          {!!info && (
            <View accessibilityLiveRegion="polite">
              <Label>{info}</Label>
            </View>
          )}
        </>
      ) : (
        <Label muted>
          A conexão com sua conta ainda não foi configurada nesta versão. Você já pode conhecer a
          interface na demonstração.
        </Label>
      )}
      <View
        style={{
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 24,
          marginTop: 8,
          gap: 12,
        }}
      >
        <Button
          secondary
          label="Explorar demonstração"
          disabled={busy}
          busy={openingPreview}
          onPress={() => {
            void openPreview();
          }}
        />
        <Label muted>
          Exemplos locais, somente leitura. Nenhuma conta é criada e nenhuma atividade é publicada.
        </Label>
      </View>
    </Screen>
  );
}
