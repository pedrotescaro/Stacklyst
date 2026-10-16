import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IconEdit } from '~/components/icons';
import { Screen, AsyncState, Avatar, Button, Notice, IconButton } from '~/components/ui';
import { api } from '~/lib/api';
import { Person } from '~/lib/types';
import { useTheme } from '~/theme';

interface ChatSummary {
  partnerId: string;
  partner: Person;
  lastMessage: string;
  lastMessageTime?: string;
  lastSenderId?: string;
}

function chatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export default function Messages({ fromTab = false }: { fromTab?: boolean } = {}) {
  const { colors } = useTheme();
  const q = useQuery({
    queryKey: ['chats'],
    queryFn: () => api<ChatSummary[]>('/api/messages/chats'),
    refetchInterval: 10000,
  });
  const newConversation = () => router.push('/explore?type=users');
  return (
    <Screen
      title="Mensagens"
      back={!fromTab}
      onRefresh={() => {
        void q.refetch();
      }}
      refreshing={q.isRefetching}
      actions={
        <IconButton
          label="Nova conversa"
          onPress={newConversation}
          icon={<IconEdit size={24} color={colors.text} />}
        />
      }
    >
      <AsyncState query={q}>
        {q.data?.length ? (
          <View style={{ marginHorizontal: -20 }}>
            {q.data.map((chat) => (
              <Pressable
                key={chat.partnerId}
                accessibilityRole="button"
                accessibilityLabel={
                  'Conversa com ' + chat.partner.username + '. ' + chat.lastMessage
                }
                onPress={() => router.push(('/conversation/' + chat.partnerId) as never)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  minHeight: 96,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                  backgroundColor: pressed ? colors.surface : 'transparent',
                })}
              >
                <Avatar uri={chat.partner.avatar_url} name={chat.partner.username} size={48} />
                <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: colors.text,
                        fontSize: 16,
                        lineHeight: 23,
                        fontWeight: '700',
                      }}
                    >
                      {chat.partner.avatar_config?.displayName || chat.partner.username}
                    </Text>
                    {!!chatTime(chat.lastMessageTime) && (
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {chatTime(chat.lastMessageTime)}
                      </Text>
                    )}
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{ color: colors.muted, fontSize: 15, lineHeight: 22 }}
                  >
                    {chat.lastMessage}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: 4 }}>
            <Notice
              title="Uma conversa pode começar aqui"
              description="Encontre pessoas da comunidade para trocar ideias sobre o que vocês estão aprendendo e construindo."
            />
            <Button label="Encontrar pessoas" onPress={newConversation} />
          </View>
        )}
      </AsyncState>
    </Screen>
  );
}
