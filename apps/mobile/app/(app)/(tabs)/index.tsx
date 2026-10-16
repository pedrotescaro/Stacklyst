import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IconArrowUp, IconMessageCircle, IconPlus } from '~/components/icons';
import { Screen, Button } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import { PostCard } from '~/features/feed/PostCard';
import { Post } from '~/lib/types';
import { api } from '~/lib/api';
import { queryClient } from '~/lib/query';
import { useTheme } from '~/theme';

const filters = [
  { value: 'community', label: 'Comunidade' },
  { value: 'following', label: 'Seguindo' },
];

export default function Feed() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('community');
  const [since, setSince] = useState(() => new Date().toISOString());
  const fresh = useQuery({
    queryKey: ['new-posts', filter, since],
    queryFn: () =>
      api<{ count: number }>(
        '/api/posts?mode=count&after=' + encodeURIComponent(since) + '&filter=' + filter
      ),
    refetchInterval: 30000,
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['list', '/api/posts?limit=15&filter=' + filter],
    });
    setSince(new Date().toISOString());
  };
  return (
    <Screen title="Stacklyst" scroll={false}>
      <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          }}
        >
          {filters.map((option) => {
            const selected = option.value === filter;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => {
                  setFilter(option.value);
                  setSince(new Date().toISOString());
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? colors.surface : 'transparent',
                })}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: selected ? '700' : '500',
                    color: selected ? colors.text : colors.muted,
                  }}
                >
                  {option.label}
                </Text>
                {selected && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 40,
                      height: 3,
                      borderRadius: 3,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
        <RemoteList<Post>
          key={filter}
          path={'/api/posts?limit=15&filter=' + filter}
          render={(post) => <PostCard post={post} />}
          edgeToEdge
          loadingVariant="feed"
          onRefreshed={() => setSince(new Date().toISOString())}
          header={
            fresh.data?.count ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void refresh()}
                style={({ pressed }) => ({
                  minHeight: 48,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  gap: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: pressed ? colors.elevated : colors.surface,
                  borderBottomColor: colors.border,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                })}
              >
                <IconArrowUp size={18} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                  Ver {fresh.data.count}{' '}
                  {fresh.data.count === 1 ? 'nova publicação' : 'novas publicações'}
                </Text>
              </Pressable>
            ) : null
          }
          empty={
            <View
              style={{
                minHeight: 340,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 32,
                gap: 12,
              }}
            >
              <IconMessageCircle size={36} strokeWidth={1.5} color={colors.muted} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 23,
                  lineHeight: 29,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                {filter === 'following'
                  ? 'Encontre a sua comunidade'
                  : 'A conversa começa com você'}
              </Text>
              <Text
                style={{
                  color: colors.muted,
                  fontSize: 15,
                  lineHeight: 23,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {filter === 'following'
                  ? 'Siga pessoas para acompanhar o que elas estão construindo e aprendendo.'
                  : 'Compartilhe uma ideia, uma dúvida ou algo novo que aprendeu sobre programação.'}
              </Text>
              <Button
                label={filter === 'following' ? 'Explorar pessoas' : 'Criar publicação'}
                onPress={() => router.push(filter === 'following' ? '/explore' : '/compose')}
              />
            </View>
          }
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar publicação"
          accessibilityHint="Abre o editor para compartilhar conteúdo ou fazer uma pergunta"
          onPress={() => router.push('/compose')}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 56,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 28,
            backgroundColor: colors.primary,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            elevation: 4,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
            shadowOpacity: 0.2,
          })}
        >
          <IconPlus color={colors.onPrimary} size={27} strokeWidth={2} />
        </Pressable>
      </View>
    </Screen>
  );
}
