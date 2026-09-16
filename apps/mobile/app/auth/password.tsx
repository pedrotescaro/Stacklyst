import { useState } from 'react';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabase';
import { Screen, Field, Button, Label } from '../../src/components/ui';
export default function Password() {
  const [password, setPassword] = useState('');
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.replace('/');
    },
  });
  return (
    <Screen title="Nova senha">
      <Field label="Nova senha" value={password} secureTextEntry onChangeText={setPassword} />
      <Button
        label="Salvar senha"
        disabled={password.length < 6}
        busy={m.isPending}
        onPress={() => m.mutate()}
      />
      {m.error && <Label>{m.error.message}</Label>}
      <Button secondary label="Continuar para o app" onPress={() => router.replace('/')} />
    </Screen>
  );
}
