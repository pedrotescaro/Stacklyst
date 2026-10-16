import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, Field, Button, Label, useUIStyles } from '~/components/ui';
import { RemoteList, Action } from '~/components/remote';
import { send, errorMessage } from '~/lib/api';
import { useSession } from '~/lib/session';
import { useDraft } from '~/lib/draft';
import { Message } from '~/lib/types';
import { queryClient } from '~/lib/query';
import { useTheme } from '~/theme';
interface Pending {
  client_id: string;
  content: string;
}
export default function Conversation() {
  const { id, username } = useLocalSearchParams<{ id: string; username?: string }>();
  const { session, isPreview } = useSession();
  return (
    <ConversationContent
      key={`${isPreview ? 'preview' : session?.user.id}:${id}`}
      id={id}
      username={username}
    />
  );
}
function ConversationContent({ id, username }: { id: string; username?: string }) {
  const insets = useSafeAreaInsets();
  const styles = useUIStyles();
  const { colors: colors } = useTheme();
  const { session, isPreview } = useSession();
  const userId = session?.user.id;
  const draft = useDraft('message:' + id);
  const [pending, setPending] = useState<Pending | null>(null),
    [loaded, setLoaded] = useState(false),
    [editing, setEditing] = useState<Message | null>(null),
    [editText, setEditText] = useState('');
  const key = 'pending:' + userId + ':' + id;
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          if (typeof parsed?.client_id === 'string' && typeof parsed.content === 'string')
            setPending(parsed);
        } catch {
          /* Invalid stored attempts are ignored. */
        }
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [key, id]);
  const m = useMutation({
    mutationFn: async () => {
      const item = pending ?? { client_id: Crypto.randomUUID(), content: draft.value.trim() };
      setPending(item);
      await AsyncStorage.setItem(key, JSON.stringify(item));
      return send<Message>('/api/mobile/messages', { ...item, receiver_id: id });
    },
    onSuccess: async () => {
      setPending(null);
      await AsyncStorage.removeItem(key);
      await draft.clear();
      await queryClient.invalidateQueries({ queryKey: ['list'] });
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
  const edit = useMutation({
    mutationFn: () => send('/api/messages/' + editing?.id, { content: editText.trim() }, 'PATCH'),
    onSuccess: () => {
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['list'] });
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
  return (
    <Screen title={username ? '@' + username : 'Conversa'} back scroll={false}>
      <RemoteList<Message>
        key={key}
        chronological
        refetchInterval={5000}
        path={'/api/mobile/messages?receiver_id=' + id}
        render={(message) => (
          <View
            style={[
              styles.separator,
              { alignItems: message.sender_id === userId ? 'flex-end' : 'flex-start' },
            ]}
          >
            <View
              style={[
                styles.panel,
                {
                  maxWidth: '90%',
                  backgroundColor:
                    message.sender_id === userId ? colors.ownMessage : colors.surface,
                },
              ]}
            >
              <Label>{message.content}</Label>
              <Label muted>{new Date(message.created_at).toLocaleString('pt-BR')}</Label>
              {message.sender_id === userId && (
                <>
                  <Button
                    secondary
                    label="Editar mensagem"
                    onPress={() => {
                      setEditing(message);
                      setEditText(message.content);
                      edit.reset();
                    }}
                  />
                  <Action
                    secondary
                    label="Excluir mensagem"
                    path={'/api/messages/' + message.id}
                    method="DELETE"
                    confirmText="Excluir esta mensagem?"
                  />
                </>
              )}
            </View>
          </View>
        )}
      />
      <View style={{ padding: 12, paddingBottom: Math.max(insets.bottom, 12), gap: 8 }}>
        {editing ? (
          <>
            <Field
              label="Editar mensagem"
              value={editText}
              onChangeText={setEditText}
              maxLength={5000}
              multiline
            />
            <Button
              label="Salvar mensagem"
              busy={edit.isPending}
              disabled={!editText.trim()}
              onPress={() => edit.mutate()}
            />
            <Button
              secondary
              label="Cancelar edição"
              disabled={edit.isPending}
              onPress={() => setEditing(null)}
            />
            {edit.error && <Label>{errorMessage(edit.error)}</Label>}
          </>
        ) : (
          <>
            {pending && <Label>Envio pendente: {pending.content}</Label>}
            {m.error && <Label>{errorMessage(m.error)}</Label>}
            <Field
              label="Mensagem"
              value={draft.value}
              onChangeText={draft.setValue}
              editable={loaded && draft.ready && !pending}
              multiline
              maxLength={5000}
              style={{ minHeight: 64, maxHeight: 120 }}
            />
            <Label muted>
              {isPreview ? 'Entre na sua conta para enviar mensagens.' : draft.status}
            </Label>
            <Button
              label={pending ? 'Tentar enviar novamente' : 'Enviar'}
              busy={m.isPending}
              disabled={isPreview || !loaded || !draft.ready || (!pending && !draft.value.trim())}
              onPress={() => m.mutate()}
            />
          </>
        )}
      </View>
    </Screen>
  );
}
