import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, Field, Avatar, Notice } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import type { Person } from '~/lib/types';
import { useMe, useSession } from '~/lib/session';
import { useTheme } from '~/theme';

export default function NewMessage() {
  const { colors } = useTheme();
  const me = useMe();
  const { session } = useSession();
  const currentUserId = session?.user.id ?? me.data?.id;
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);
  return (
    <Screen title="Nova mensagem" back scroll={false}>
      <View style={{ padding: 20 }}>
        <Field
          label="Para quem?"
          placeholder="Buscar pelo nome de usuário"
          value={text}
          onChangeText={setText}
          autoFocus
          autoCorrect={false}
          maxLength={100}
          returnKeyType="search"
          onSubmitEditing={() => setSearch(text.trim())}
        />
      </View>
      <RemoteList<Person>
        filter={(person) => person.id !== currentUserId}
        path={'/api/search?type=users&q=' + encodeURIComponent(search)}
        empty={
          <Notice
            title={search.length < 2 ? 'Encontre uma pessoa' : 'Nenhuma pessoa encontrada'}
            description={
              search.length < 2
                ? 'Digite pelo menos 2 caracteres para começar uma conversa.'
                : 'Confira o nome de usuário e tente novamente.'
            }
          />
        }
        render={(person) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Conversar com ' + person.username}
            onPress={() =>
              router.replace(
                ('/conversation/' +
                  person.id +
                  '?username=' +
                  encodeURIComponent(person.username)) as never
              )
            }
            style={({ pressed }) => ({
              minHeight: 76,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 8,
              backgroundColor: pressed ? colors.surface : 'transparent',
            })}
          >
            <Avatar name={person.username} uri={person.avatar_url} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {person.avatar_config?.displayName || person.username}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 14 }}>@{person.username}</Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
