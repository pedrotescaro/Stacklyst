import { useEffect, useState } from 'react';
import { View, Text, Pressable, Share, Image } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import IconArrowUp from '@tabler/icons-react-native/IconArrowUp';
import IconMessageCircle from '@tabler/icons-react-native/IconMessageCircle';
import IconBookmark from '@tabler/icons-react-native/IconBookmark';
import IconShare from '@tabler/icons-react-native/IconShare';
import { Post } from '../../lib/types';
import { send, errorMessage } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { config } from '../../lib/config';
import { Avatar, Label, IconButton, styles, Button } from '../../components/ui';
import { RichText, CodeBlock } from '../../components/content';
import { colors as c } from '../../theme';
export function PostCard({ post, detail = false }: { post: Post; detail?: boolean }) {
  const [expanded, setExpanded] = useState(detail),
    [saved, setSaved] = useState(!!post.bookmarks?.length),
    [vote, setVote] = useState(post.votes?.[0]?.value === 1);
  const m = useMutation({
    mutationFn: ({ action }: { action: 'bookmark' | 'vote' }) =>
      send('/api/posts/' + post.id + '/' + action, action === 'vote' ? { value: 1 } : {}),
    onMutate: ({ action }) => {
      const previous = { saved, vote };
      if (action === 'bookmark') setSaved(!saved);
      else setVote(!vote);
      return previous;
    },
    onError: (_e, _v, previous) => {
      if (previous) {
        setSaved(previous.saved);
        setVote(previous.vote);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['list'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
  });
  useEffect(() => {
    setSaved(!!post.bookmarks?.length);
    setVote(post.votes?.[0]?.value === 1);
  }, [post.id, post.bookmarks?.length, post.votes?.[0]?.value]);
  return (
    <View style={styles.separator}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={'Abrir perfil de ' + post.author.username}
          onPress={() => router.push(('/profile/' + post.author.username) as never)}
        >
          <Avatar uri={post.author.avatar_url} name={post.author.username} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.text, { fontWeight: '700' }]}>
            {post.author.avatar_config?.displayName || post.author.username}
          </Text>
          <Label muted>
            @{post.author.username} · {new Date(post.created_at).toLocaleDateString('pt-BR')}
          </Label>
        </View>
        {post.language && <Label muted>{post.language}</Label>}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir publicação"
        disabled={detail}
        onPress={() => router.push(('/post/' + post.id) as never)}
      >
        <RichText body={expanded ? post.body : post.body.slice(0, 600)} />
      </Pressable>
      {post.body.length > 600 && !expanded && (
        <Button secondary label="Ler mais" onPress={() => setExpanded(true)} />
      )}
      {post.image_url && (
        <Image
          source={{
            uri: post.image_url.startsWith('/') ? config.apiUrl + post.image_url : post.image_url,
          }}
          style={{ width: '100%', height: 220, borderRadius: 12 }}
          resizeMode="contain"
          accessibilityLabel="Imagem da publicação"
        />
      )}
      {post.code_snippet && <CodeBlock code={post.code_snippet} />}
      <View style={styles.between}>
        <View style={styles.row}>
          <IconButton
            label={vote ? 'Remover voto' : 'Votar'}
            onPress={() => !m.isPending && m.mutate({ action: 'vote' })}
            icon={<IconArrowUp color={vote ? c.primary : c.muted} />}
          />
          <Label muted>
            {(post.score ?? 0) + (vote ? 1 : 0) - (post.votes?.[0]?.value === 1 ? 1 : 0)}
          </Label>
        </View>
        <IconButton
          label={'Respostas: ' + (post._count?.answers ?? post.answers?.length ?? 0)}
          onPress={() => router.push(('/post/' + post.id) as never)}
          icon={<IconMessageCircle color={c.muted} />}
        />
        <IconButton
          label={saved ? 'Remover dos salvos' : 'Salvar'}
          onPress={() => !m.isPending && m.mutate({ action: 'bookmark' })}
          icon={<IconBookmark color={saved ? c.primary : c.muted} />}
        />
        <IconButton
          label="Compartilhar"
          onPress={() => Share.share({ message: config.apiUrl + '/post/' + post.id })}
          icon={<IconShare color={c.muted} />}
        />
      </View>
      {m.error && <Label>{errorMessage(m.error)}</Label>}
    </View>
  );
}
