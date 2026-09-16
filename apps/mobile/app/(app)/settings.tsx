import { useState } from 'react';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { Screen, Field, Button, Label, Heading, confirm } from '~/components/ui';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '~/lib/supabase';
import { disablePush, enablePush, setReminder, cancelReminder } from '~/lib/notifications';
import { queryClient } from '~/lib/query';
import { config } from '~/lib/config';
export default function Settings() {
  const [hour, setHour] = useState('19:00'),
    [info, setInfo] = useState('');
  const action = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => {
      await fn();
      setInfo('Configuração atualizada.');
    },
  });
  const logout = async () => {
    await disablePush();
    await cancelReminder();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    await queryClient.cancelQueries();
    queryClient.clear();
    router.replace('/auth');
  };
  return (
    <Screen title="Configurações" back>
      <Heading>Notificações</Heading>
      <Label muted>
        Receba avisos de atividade. O conteúdo de mensagens fica oculto na tela bloqueada.
      </Label>
      <Button
        label="Ativar notificações push"
        busy={action.isPending}
        onPress={() => action.mutate(enablePush)}
      />
      <Button
        secondary
        label="Desativar push"
        busy={action.isPending}
        onPress={() => action.mutate(disablePush)}
      />
      <Field
        label="Lembrete diário (HH:MM)"
        value={hour}
        onChangeText={setHour}
        keyboardType="numbers-and-punctuation"
      />
      <Button
        secondary
        label="Salvar lembrete"
        onPress={() => {
          const match = /^(\d{2}):(\d{2})$/.exec(hour);
          if (!match || +match[1] > 23 || +match[2] > 59) {
            setInfo('Use um horário entre 00:00 e 23:59.');
            return;
          }
          action.mutate(() => setReminder(+match[1], +match[2]));
        }}
      />
      <Button secondary label="Remover lembrete" onPress={() => action.mutate(cancelReminder)} />
      <Heading>Conta e acessibilidade</Heading>
      <Label muted>
        O app acompanha o tamanho de texto do sistema. As transições respeitam a preferência de
        movimento do aparelho. Sem sons ou vibrações contínuas.
      </Label>
      <Button
        secondary
        label="Preferências de aprendizado"
        onPress={() => router.push('/onboarding')}
      />
      <Button secondary label="Alterar senha" onPress={() => router.push('/auth/password')} />
      <Button
        secondary
        label="Privacidade"
        onPress={() => Linking.openURL(config.apiUrl + '/privacy')}
      />
      <Button
        secondary
        label="Ajuda e código do projeto"
        onPress={() => Linking.openURL('https://github.com/pedrotescaro/Stacklyst')}
      />
      {action.error && <Label>{action.error.message}</Label>}
      {info && <Label>{info}</Label>}
      <Button
        secondary
        danger
        label="Sair da conta"
        busy={action.isPending}
        onPress={() =>
          confirm('Sair', 'Sair desta conta e desvincular as notificações deste dispositivo?', () =>
            action.mutate(logout)
          )
        }
      />
    </Screen>
  );
}
