import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, Field, Choice, RowLink, Avatar } from '~/components/ui';
import { RemoteList } from '~/components/remote';
import { PostCard } from '~/features/feed/PostCard';
import { Person, Post } from '~/lib/types';
export default function Explore() {
  const params = useLocalSearchParams<{ type?: string }>();
  const [type, setType] = useState(params.type || 'posts'),
    [text, setText] = useState(''),
    [query, setQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <Screen title="Explorar" back scroll={false}>
      <RemoteList<Post | Person>
        path={'/api/search?type=' + type + '&q=' + encodeURIComponent(query)}
        header={
          <>
            <Field label="Buscar pessoas ou publicações" value={text} onChangeText={setText} />
            <Choice
              value={type}
              onChange={setType}
              options={[
                { value: 'posts', label: 'Publicações' },
                { value: 'users', label: 'Pessoas' },
              ]}
            />
            <RowLink
              title="Comunidades"
              subtitle="Encontre pessoas com os mesmos interesses"
              onPress={() => router.push('/communities')}
            />
            <RowLink
              title="Eventos"
              subtitle="Desafios e encontros da comunidade"
              onPress={() => router.push('/events')}
            />
            <RowLink
              title="Vagas"
              subtitle="O próximo passo na sua carreira"
              onPress={() => router.push('/jobs')}
            />
          </>
        }
        render={(item) =>
          type === 'posts' ? (
            <PostCard post={item as Post} />
          ) : (
            <RowLink
              title={'@' + (item as Person).username}
              leading={
                <Avatar name={(item as Person).username} uri={(item as Person).avatar_url} />
              }
              onPress={() => router.push(('/profile/' + (item as Person).username) as never)}
            />
          )
        }
      />
    </Screen>
  );
}
