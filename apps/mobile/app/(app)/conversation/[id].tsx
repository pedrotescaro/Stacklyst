import { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen, IconButton, confirm } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import { ActionMenu } from '~/components/ActionMenu';
import { CompactComposer } from '~/components/CompactComposer';
import { IconPlus, IconX } from '~/components/icons';
import { send, errorMessage } from '~/lib/api';
import { useMe, useSession } from '~/lib/session';
import { useDraft } from '~/lib/draft';
import { Message } from '~/lib/types';
import { queryClient } from '~/lib/query';
import { useTheme } from '~/theme';
import { conversationTime, startsMessageGroup } from '~/features/messages/presentation';

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
  const { colors: c } = useTheme();
  const { session, isPreview } = useSession();
  const me = useMe();
  const userId = session?.user.id ?? (isPreview ? me.data?.id : undefined);
  const draft = useDraft('message:' + id);
  const input = useRef<TextInput>(null);
  const [pending, setPending] = useState<Pending | null>(null),
    [loaded, setLoaded] = useState(false),
    [editing, setEditing] = useState<Message | null>(null),
    [editText, setEditText] = useState(''),
    [menuId, setMenuId] = useState<string | null>(null),
    [clipboardError, setClipboardError] = useState('');
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
  }, [key]);

  const refreshConversation = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['list'] }),
      queryClient.invalidateQueries({ queryKey: ['chats'] }),
    ]);
  };
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
      await refreshConversation();
    },
  });
  const edit = useMutation({
    mutationFn: () => send('/api/messages/' + editing?.id, { content: editText.trim() }, 'PATCH'),
    onSuccess: async () => {
      setEditing(null);
      await refreshConversation();
    },
  });
  const remove = useMutation({
    mutationFn: (message: Message) => send('/api/messages/' + message.id, {}, 'DELETE'),
    onSuccess: async (_, message) => {
      if (editing?.id === message.id) setEditing(null);
      await refreshConversation();
    },
  });
  const changeText = (value: string) => {
    setClipboardError('');
    if (editing) setEditText(value);
    else draft.setValue(value);
  };
  const paste = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      if (!value) {
        setClipboardError('Nenhum texto disponível para colar.');
        return;
      }
      changeText(((editing ? editText : draft.value) + value).slice(0, 5000));
      input.current?.focus();
    } catch {
      setClipboardError('Não foi possível colar. Use a opção Colar do teclado.');
    }
  };
  const copy = async (message: Message) => {
    try {
      await Clipboard.setStringAsync(message.content);
      setClipboardError('');
    } catch {
      setClipboardError('Não foi possível copiar a mensagem.');
    }
  };
  const startEditing = (message: Message) => {
    setEditing(message);
    setEditText(message.content);
    edit.reset();
    setClipboardError('');
    input.current?.focus();
  };
  const editable = !isPreview && !m.isPending && !edit.isPending && !remove.isPending;
  const canCompose = editable && loaded && draft.ready && !pending;
  const error = editing ? edit.error : m.error;
  const draftError =
    draft.status.startsWith('Não foi possível') || draft.status === 'Armazenamento indisponível'
      ? draft.status
      : '';

  return (
    <Screen title={username ? '@' + username : 'Conversa'} back scroll={false}>
      <RemoteList<Message>
        key={key}
        chronological
        refetchInterval={5000}
        path={'/api/mobile/messages?receiver_id=' + id}
        empty={
          <View style={s.empty}>
            <Text style={[s.emptyTitle, { color: c.text }]}>Comece a conversa</Text>
            <Text style={[s.emptyText, { color: c.muted }]}>
              Envie uma mensagem para {username ? '@' + username : 'esta pessoa'}.
            </Text>
          </View>
        }
        render={(message, index, rows) => {
          const own = message.sender_id === userId;
          const previous = rows[index - 1];
          const groupStart = startsMessageGroup(message, previous);
          const sameSender = previous?.sender_id === message.sender_id && !groupStart;
          const lastSent = own && index === rows.length - 1;
          const actions = [
            { label: 'Copiar mensagem', onPress: () => void copy(message) },
            ...(own
              ? [
                  {
                    label: 'Editar mensagem',
                    onPress: () => startEditing(message),
                    disabled: !editable || Boolean(pending),
                  },
                  {
                    label: 'Excluir mensagem',
                    destructive: true,
                    disabled: !editable,
                    onPress: () =>
                      confirm(
                        'Excluir mensagem',
                        'Excluir esta mensagem? Esta ação não pode ser desfeita.',
                        () => remove.mutate(message)
                      ),
                  },
                ]
              : []),
          ];
          return (
            <View>
              {groupStart && (
                <Text style={[s.dateSeparator, { color: c.muted }]}>
                  {conversationTime(message.created_at)}
                </Text>
              )}
              <View
                style={[
                  s.messageRow,
                  {
                    justifyContent: own ? 'flex-end' : 'flex-start',
                    marginTop: sameSender ? 3 : 12,
                  },
                ]}
              >
                {own && (
                  <ActionMenu
                    label="Opções da mensagem enviada"
                    items={actions}
                    open={menuId === message.id}
                    onOpenChange={(open) => setMenuId(open ? message.id : null)}
                  />
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={(own ? 'Você: ' : 'Mensagem: ') + message.content}
                  accessibilityHint="Mantenha pressionado para ver as opções da mensagem"
                  onLongPress={() => setMenuId(message.id)}
                  onPress={() => setMenuId(message.id)}
                  delayLongPress={350}
                  style={({ pressed }) => [
                    s.bubble,
                    {
                      backgroundColor: own ? c.primary : c.incomingMessage,
                      borderBottomRightRadius: own && sameSender ? 8 : 24,
                      borderBottomLeftRadius: !own && sameSender ? 8 : 24,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[s.messageText, { color: own ? c.onPrimary : c.text }]}>
                    {message.content}
                  </Text>
                </Pressable>
                {!own && (
                  <ActionMenu
                    label="Opções da mensagem recebida"
                    items={actions}
                    open={menuId === message.id}
                    onOpenChange={(open) => setMenuId(open ? message.id : null)}
                  />
                )}
              </View>
              {lastSent && (
                <Text style={[s.sentStatus, { color: c.muted }]}>
                  Enviada ·{' '}
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
          );
        }}
      />
      {pending && !editing && (
        <View style={s.pending}>
          <View
            style={[s.bubble, { alignSelf: 'flex-end', backgroundColor: c.primary, opacity: 0.65 }]}
          >
            <Text numberOfLines={3} style={[s.messageText, { color: c.onPrimary }]}>
              {pending.content}
            </Text>
          </View>
          <Text style={[s.pendingStatus, { color: m.error ? c.danger : c.muted }]}>
            {m.isPending ? 'Enviando…' : 'Não enviada · toque em enviar para tentar novamente'}
          </Text>
        </View>
      )}
      {editing && (
        <View style={[s.editing, { borderTopColor: c.socialBorder }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[s.editingTitle, { color: c.primary }]}>Editando mensagem</Text>
            <Text numberOfLines={1} style={[s.status, { color: c.muted }]}>
              {editing.content}
            </Text>
          </View>
          <IconButton
            label="Cancelar edição"
            disabled={edit.isPending}
            onPress={() => {
              setEditing(null);
              edit.reset();
            }}
            icon={<IconX size={20} color={c.muted} />}
          />
        </View>
      )}
      {(error || remove.error || clipboardError || draftError || isPreview) && (
        <Text
          accessibilityLiveRegion="polite"
          style={[s.notice, { color: isPreview ? c.muted : c.danger }]}
        >
          {isPreview
            ? 'Entre na sua conta para enviar mensagens.'
            : error
              ? errorMessage(error)
              : remove.error
                ? errorMessage(remove.error)
                : clipboardError || draftError}
        </Text>
      )}
      <CompactComposer
        inputRef={input}
        value={editing ? editText : (pending?.content ?? draft.value)}
        onChangeText={changeText}
        onSend={() => (editing ? edit.mutate() : m.mutate())}
        placeholder="Mensagem"
        sendLabel={
          editing ? 'Salvar mensagem' : pending ? 'Tentar enviar novamente' : 'Enviar mensagem'
        }
        maxLength={5000}
        editable={editing ? editable : canCompose}
        disabled={
          editing
            ? !editable || !editText.trim()
            : !editable || !loaded || !draft.ready || (!pending && !draft.value.trim())
        }
        busy={editing ? edit.isPending : m.isPending}
        leading={
          <IconButton
            label="Colar mensagem"
            icon={<IconPlus size={24} color={c.muted} />}
            disabled={editing ? !editable : !canCompose}
            onPress={() => void paste()}
          />
        }
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  dateSeparator: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  bubble: { maxWidth: '82%', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10 },
  messageText: { fontSize: 16, lineHeight: 23, flexShrink: 1 },
  sentStatus: { alignSelf: 'flex-end', fontSize: 12, lineHeight: 18, marginTop: 4, marginRight: 4 },
  pending: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
  },
  pendingStatus: { fontSize: 12, lineHeight: 18, textAlign: 'right' },
  editing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 20,
    paddingRight: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editingTitle: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
  status: { fontSize: 13, lineHeight: 18 },
  notice: { fontSize: 13, lineHeight: 19, paddingHorizontal: 20, paddingVertical: 6 },
  empty: { paddingHorizontal: 24, paddingTop: 48, gap: 8 },
  emptyTitle: { fontSize: 22, lineHeight: 29, fontWeight: '700' },
  emptyText: { fontSize: 15, lineHeight: 22 },
});
