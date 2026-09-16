import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { View, Text, Linking } from 'react-native';
import {
  Screen,
  AsyncState,
  Avatar,
  Heading,
  Label,
  Button,
  RowLink,
  styles,
} from '../../components/ui';
import { Action } from '../../components/remote';
import { PostCard } from '../feed/PostCard';
import { api } from '../../lib/api';
import { useMe } from '../../lib/session';
import { Person, Post } from '../../lib/types';
interface ProfileData {
  user: Person;
  posts: Post[] | { items: Post[]; nextCursor: string | null };
  stats: { answers_count: number; accepted_count: number; accuracy: number };
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  nextCursor?: string;
}
export function Profile({ username, own = false }: { username: string; own?: boolean }) {
  const me = useMe();
  const q = useInfiniteQuery({
    queryKey: ['profile', username],
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api<ProfileData>(
        '/api/profile/' + encodeURIComponent(username) + '?cursor=' + encodeURIComponent(pageParam),
        { signal }
      ),
    getNextPageParam: (page) =>
      Array.isArray(page.posts) ? page.nextCursor || undefined : page.posts.nextCursor || undefined,
    enabled: !!username,
  });
  const data = q.data?.pages[0];
  const user = data?.user;
  const posts = [
    ...new Map(
      q.data?.pages
        .flatMap((page) => (Array.isArray(page.posts) ? page.posts : page.posts.items))
        .map((post) => [post.id, post])
    ).values(),
  ];
  return (
    <Screen title={own ? 'Perfil' : '@' + username} back={!own}>
      <AsyncState query={q}>
        {user && (
          <>
            <View style={[styles.row, { paddingVertical: 16 }]}>
              <Avatar size={76} name={username} uri={user.avatar_url} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{user.avatar_config?.displayName || username}</Text>
                <Label muted>@{username}</Label>
              </View>
            </View>
            {user.bio && <Label>{user.bio}</Label>}
            <Label>
              {user.total_xp ?? 0} XP · {user.streak_days ?? 0} dias de ofensiva
            </Label>
            <Label muted>
              {data?.followers ?? 0} seguidores · {data?.following ?? 0} seguindo
            </Label>
            {own ? (
              <>
                <Button
                  secondary
                  label="Editar perfil"
                  onPress={() => router.push('/edit-profile')}
                />
                <RowLink title="Itens salvos" onPress={() => router.push('/bookmarks')} />
                <RowLink title="Ranking" onPress={() => router.push('/ranking')} />
                <RowLink title="Minhas candidaturas" onPress={() => router.push('/applications')} />
                <RowLink title="Configurações" onPress={() => router.push('/settings')} />
                <RowLink
                  title={
                    me.data?.role === 'EVALUATOR' || me.data?.role === 'ADMIN'
                      ? 'Área de avaliação'
                      : 'Tornar-se avaliador'
                  }
                  onPress={() => router.push('/evaluator')}
                />
                {['ADMIN', 'RECRUITER'].includes(me.data?.role ?? '') && (
                  <RowLink
                    title="Gerenciar empresas e vagas"
                    onPress={() => router.push('/recruiter')}
                  />
                )}{' '}
                {me.data?.role === 'ADMIN' && (
                  <RowLink title="Administração" onPress={() => router.push('/admin')} />
                )}
              </>
            ) : (
              user.id !== me.data?.id && (
                <>
                  <Action
                    label={data?.isFollowing ? 'Deixar de seguir' : 'Seguir'}
                    path={'/api/users/' + user.id + '/follow'}
                  />
                  <Button
                    secondary
                    label="Enviar mensagem"
                    onPress={() => router.push(('/conversation/' + user.id) as never)}
                  />
                  <Action
                    secondary
                    label="Convidar para duelo (TS)"
                    path="/api/duels/request"
                    body={{ receiver_id: user.id, language: 'TS' }}
                  />
                </>
              )
            )}
            <Label muted>
              {data?.stats.accuracy ?? 0}% de acerto · {data?.stats.accepted_count ?? 0} respostas
              aceitas
            </Label>
            {user.github_username && /^[a-zA-Z0-9_-]+$/.test(user.github_username) && (
              <Button
                secondary
                label={'GitHub: ' + user.github_username}
                onPress={() => Linking.openURL('https://github.com/' + user.github_username)}
              />
            )}
            <Heading>Conquistas</Heading>
            {user.badges?.length ? (
              user.badges.map((b, i) => <Label key={i}>{b.label ?? b.badge?.label}</Label>)
            ) : (
              <Label muted>As conquistas aparecem conforme você progride.</Label>
            )}
            <Heading>Publicações</Heading>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
            {!posts.length && <Label muted>As publicações deste perfil aparecerão aqui.</Label>}
            {q.hasNextPage && (
              <Button
                secondary
                label="Carregar mais publicações"
                busy={q.isFetchingNextPage}
                onPress={() => q.fetchNextPage()}
              />
            )}
          </>
        )}
      </AsyncState>
    </Screen>
  );
}
