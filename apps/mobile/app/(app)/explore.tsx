import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconBriefcase, IconCalendarEvent } from '~/components/icons';
import { Screen, Field, RowLink, Avatar, Notice } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import { PostCard } from '~/features/feed/PostCard';
import { Person, Post } from '~/lib/types';
import { ProfileName } from '~/components/ProfileName';
import { useTheme } from '~/theme';

export default function Explore({ fromTab = false }: { fromTab?: boolean } = {}) {
  const params = useLocalSearchParams<{ type?: string; tag?: string }>();
  return (
    <ExploreContent
      key={`${params.type || ''}:${params.tag || ''}`}
      fromTab={fromTab}
      initialType={params.type}
      initialTag={params.tag}
    />
  );
}
function ExploreContent({
  fromTab,
  initialType,
  initialTag,
}: {
  fromTab: boolean;
  initialType?: string;
  initialTag?: string;
}) {
  const { colors } = useTheme();
  const [type, setType] = useState(initialType === 'users' ? 'users' : 'posts');
  const [text, setText] = useState(initialTag || '');
  const [query, setQuery] = useState(initialTag || '');
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);
  return (
    <Screen title="Explorar" back={!fromTab} scroll={false}>
      <View
        style={{
          padding: 20,
          paddingBottom: 12,
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
        }}
      >
        <Field
          label="Buscar pessoas ou publicações"
          placeholder="Uma pessoa, uma linguagem, uma ideia"
          value={text}
          onChangeText={setText}
          maxLength={100}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          onSubmitEditing={() => setQuery(text.trim())}
          style={{ borderRadius: 28, paddingHorizontal: 20 }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        }}
      >
        {[
          { value: 'posts', label: 'Publicações' },
          { value: 'users', label: 'Pessoas' },
        ].map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: type === option.value }}
            onPress={() => setType(option.value)}
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
                fontWeight: type === option.value ? '700' : '500',
                color: type === option.value ? colors.text : colors.muted,
              }}
            >
              {option.label}
            </Text>
            {type === option.value && (
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
        ))}
      </View>
      <RemoteList<Post | Person>
        path={'/api/search?type=' + type + '&q=' + encodeURIComponent(query)}
        edgeToEdge
        loadingVariant={type === 'posts' ? 'feed' : 'list'}
        header={
          query.length < 2 ? (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Communities are disabled in mobile; events and jobs stay available. */}
              <RowLink
                title="Eventos"
                subtitle="Desafios e encontros da comunidade"
                leading={<IconCalendarEvent color={colors.muted} size={24} />}
                onPress={() => router.push('/events')}
              />
              <RowLink
                title="Vagas"
                subtitle="O próximo passo na sua carreira"
                leading={<IconBriefcase color={colors.muted} size={24} />}
                onPress={() => router.push('/jobs')}
              />
            </View>
          ) : null
        }
        empty={
          <Notice
            title={query.length < 2 ? 'Descubra novas conexões' : 'Nenhum resultado por aqui'}
            description={
              query.length < 2
                ? 'Digite pelo menos 2 caracteres para encontrar pessoas e conversas sobre programação.'
                : 'Tente outro nome ou termo. Você também pode alternar entre publicações e pessoas.'
            }
          />
        }
        render={(item) => {
          if (type === 'posts') return <PostCard post={item as Post} />;
          const person = item as Person;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={'Abrir perfil de ' + person.username}
              onPress={() => router.push(('/profile/' + person.username) as never)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                minHeight: 84,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
                backgroundColor: pressed ? colors.surface : 'transparent',
              })}
            >
              <Avatar
                name={person.username}
                uri={person.avatar_url}
                profileStyle={person.avatar_config?.profileStyle}
                size={44}
              />
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <ProfileName
                  user={person}
                  numberOfLines={1}
                  style={{ fontSize: 16, lineHeight: 23, fontWeight: '700', color: colors.text }}
                />
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 14, lineHeight: 21, color: colors.muted }}
                >
                  @{person.username}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
