import { ReactNode, useState } from 'react';
import { View, Text, Pressable, Share, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useRecyclingState } from '@shopify/flash-list';
import { IconArrowUp, IconMessageCircle, IconBookmark, IconShare } from '~/components/icons';
import { Post } from '../../lib/types';
import { send, errorMessage } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { config } from '../../lib/config';
import { Avatar } from '../../components/ui';
import { RichText, CodeBlock } from '../../components/content';
import { useTheme } from '../../theme';

type FeedPost = Post & { upvotes?: number };
type MutationResult = { upvotes?: number; bookmarked?: boolean };

function timeLabel(date: string) {
  const created = new Date(date);
  const minutes = Math.max(0, Math.floor((Date.now() - created.getTime()) / 60000));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return minutes + ' min';
  if (minutes < 1440) return Math.floor(minutes / 60) + ' h';
  return created.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function PostAction({
  label,
  icon,
  count,
  onPress,
  active = false,
  busy = false,
}: {
  label: string;
  icon: ReactNode;
  count?: number;
  onPress: () => void;
  active?: boolean;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 48,
        minHeight: 48,
        gap: 5,
        borderRadius: 24,
        backgroundColor: pressed ? colors.elevated : 'transparent',
        opacity: busy ? 0.55 : 1,
      })}
    >
      {icon}
      {count !== undefined && (
        <Text style={{ color: active ? colors.primary : colors.muted, fontSize: 13 }}>{count}</Text>
      )}
    </Pressable>
  );
}

export function PostCard({ post, detail = false }: { post: FeedPost; detail?: boolean }) {
  // A recycled list cell must not carry a pending mutation into a different post.
  return <PostContent key={post.id} post={post} detail={detail} />;
}

function PostContent({ post, detail }: { post: FeedPost; detail: boolean }) {
  const { colors: c } = useTheme();
  const serverSaved = !!post.bookmarks?.length;
  const serverVote = post.votes?.[0]?.value ?? 0;
  const serverScore = post.upvotes ?? post.score ?? 0;
  const [expanded, setExpanded] = useState(detail);
  const [saved, setSaved] = useRecyclingState(serverSaved, [serverSaved]);
  const [vote, setVote] = useRecyclingState(serverVote, [serverVote]);
  const [score, setScore] = useRecyclingState(serverScore, [serverScore]);
  const [shareError, setShareError] = useState('');
  const m = useMutation({
    mutationFn: ({ action, value }: { action: 'bookmark' | 'vote'; value?: number }) =>
      send<MutationResult>(
        '/api/posts/' + post.id + '/' + action,
        action === 'vote' ? { value } : {}
      ),
    onMutate: ({ action, value = 0 }) => {
      const previous = { saved, vote, score };
      if (action === 'bookmark') setSaved(!saved);
      else {
        setVote(value);
        setScore(score + value - vote);
      }
      return previous;
    },
    onError: (_e, _v, previous) => {
      if (previous) {
        setSaved(previous.saved);
        setVote(previous.vote);
        setScore(previous.score);
      }
    },
    onSuccess: (data, { action }) => {
      if (action === 'vote' && typeof data.upvotes === 'number') setScore(data.upvotes);
      if (action === 'bookmark' && typeof data.bookmarked === 'boolean') setSaved(data.bookmarked);
      void queryClient.invalidateQueries({ queryKey: ['list'] });
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
  });
  const open = () => router.push(('/post/' + post.id) as never);
  const openProfile = () => router.push(('/profile/' + post.author.username) as never);
  const answers = post._count?.answers ?? post.answers?.length ?? 0;
  const showTitle = !!post.title && !post.body.trimStart().startsWith(post.title.trim());
  const share = async () => {
    setShareError('');
    try {
      await Share.share({ message: config.apiUrl + '/post/' + post.id });
    } catch {
      setShareError('Não foi possível compartilhar. Tente novamente.');
    }
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingHorizontal: 16,
        paddingTop: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: c.border,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Abrir perfil de ' + post.author.username}
        onPress={openProfile}
        style={({ pressed }) => ({ minHeight: 48, minWidth: 48, opacity: pressed ? 0.65 : 1 })}
      >
        <Avatar uri={post.author.avatar_url} name={post.author.username} size={44} />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={'Abrir perfil de ' + post.author.username}
          onPress={openProfile}
          style={({ pressed }) => ({
            minHeight: 48,
            justifyContent: 'center',
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text
            numberOfLines={1}
            style={{ fontSize: 15, lineHeight: 21, color: c.text, fontWeight: '700' }}
          >
            {post.author.avatar_config?.displayName || post.author.username}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>
            @{post.author.username} · {timeLabel(post.created_at)}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole={detail ? undefined : 'button'}
          accessibilityLabel={detail ? undefined : 'Abrir publicação'}
          disabled={detail}
          onPress={open}
          style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        >
          {showTitle && (
            <Text
              style={{
                fontSize: 17,
                lineHeight: 24,
                fontWeight: '700',
                color: c.text,
                marginTop: 4,
              }}
            >
              {post.title}
            </Text>
          )}
          <RichText body={expanded ? post.body : post.body.slice(0, 600)} inset={90} />
        </Pressable>
        {post.body.length > 600 && !expanded && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setExpanded(true)}
            style={({ pressed }) => ({
              minHeight: 48,
              justifyContent: 'center',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Text style={{ color: c.primary, fontSize: 15, fontWeight: '600' }}>Mostrar mais</Text>
          </Pressable>
        )}
        {post.language && (
          <Text style={{ fontSize: 13, color: c.primary, marginBottom: 8, marginTop: 4 }}>
            {post.language}
          </Text>
        )}
        {post.image_url && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir publicação com imagem"
            onPress={open}
          >
            <Image
              source={{
                uri: post.image_url.startsWith('/')
                  ? config.apiUrl + post.image_url
                  : post.image_url,
              }}
              style={{
                width: '100%',
                height: 196,
                borderRadius: 14,
                backgroundColor: c.surface,
                marginVertical: 8,
              }}
              resizeMode="contain"
              accessibilityLabel="Imagem da publicação"
            />
          </Pressable>
        )}
        {post.code_snippet && <CodeBlock code={post.code_snippet} />}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginLeft: -8,
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <PostAction
            label={'Respostas: ' + answers}
            count={answers}
            onPress={open}
            icon={<IconMessageCircle size={20} strokeWidth={1.8} color={c.muted} />}
          />
          <PostAction
            label={(vote === 1 ? 'Remover voto. ' : 'Votar. ') + score + ' votos'}
            count={score}
            active={vote === 1}
            busy={m.isPending}
            onPress={() => m.mutate({ action: 'vote', value: vote === 1 ? 0 : 1 })}
            icon={
              <IconArrowUp size={20} strokeWidth={1.8} color={vote === 1 ? c.primary : c.muted} />
            }
          />
          <PostAction
            label={saved ? 'Remover dos salvos' : 'Salvar publicação'}
            active={saved}
            busy={m.isPending}
            onPress={() => m.mutate({ action: 'bookmark' })}
            icon={
              <IconBookmark
                size={20}
                strokeWidth={1.8}
                color={saved ? c.primary : c.muted}
                fill={saved ? c.primary : 'none'}
              />
            }
          />
          <PostAction
            label="Compartilhar publicação"
            onPress={share}
            icon={<IconShare size={20} strokeWidth={1.8} color={c.muted} />}
          />
        </View>
        {(m.error || shareError) && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: c.danger, fontSize: 14, lineHeight: 21, paddingBottom: 12 }}
          >
            {m.error ? errorMessage(m.error) : shareError}
          </Text>
        )}
      </View>
    </View>
  );
}
