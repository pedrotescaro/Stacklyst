import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Screen,
  AsyncState,
  Avatar,
  Button,
  Choice,
  Heading,
  IconButton,
  Label,
} from '../../components/ui';
import { ActionMenu } from '../../components/ActionMenu';
import { IconTrophy, IconX } from '../../components/icons';
import { RichText } from '../../components/content';
import { PostCard, timeLabel } from '../feed/PostCard';
import { ThreadAnswer, useSavedReplies } from '../feed/ThreadAnswer';
import { api, errorMessage, send } from '../../lib/api';
import { queryClient } from '../../lib/query';
import { useMe, useSession } from '../../lib/session';
import { useReducedMotion } from '../../lib/motion';
import { Answer, Page, Person, Post } from '../../lib/types';
import { useTheme } from '../../theme';
import {
  ProfileHero,
  ProfileStatsSummary,
  ProfileTrails,
  type ProfileStats,
  type ProfileTrail,
} from './ProfileHero';
import { profileName } from './profile-model';

interface ProfileData {
  user: Person;
  posts: Post[] | Page<Post>;
  stats: ProfileStats;
  trails?: ProfileTrail[];
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  nextCursor?: string;
}
interface ProfileReply extends Answer {
  post_id: string;
  post: Post;
  parent?: Answer | null;
}
type Tab = 'posts' | 'replies' | 'likes' | 'stats' | 'trails' | 'badges';
const tabs: { value: Tab; label: string }[] = [
  { value: 'posts', label: 'Postagens' },
  { value: 'replies', label: 'Respostas' },
  { value: 'likes', label: 'Curtidas' },
  { value: 'stats', label: 'Estatísticas' },
  { value: 'trails', label: 'Trilhas' },
  { value: 'badges', label: 'Conquistas' },
];
const uniqueRows = <T extends { id: string }>(rows: T[]) => [
  ...new Map(rows.map((row) => [row.id, row])).values(),
];
const absoluteFill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

function PeopleSheet({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}) {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const q = useQuery({
    queryKey: ['profile-people', userId, type],
    queryFn: ({ signal }) => api<Person[]>('/api/users/' + userId + '/' + type, { signal }),
  });
  return (
    <Modal
      transparent
      animationType={reducedMotion ? 'none' : 'slide'}
      visible
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar lista de pessoas"
          style={absoluteFill}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={{
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            maxHeight: '75%',
            paddingBottom: Math.max(20, insets.bottom + 12),
            backgroundColor: c.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <View style={[s.between, { padding: 16 }]}>
            <Heading>{type === 'followers' ? 'Seguidores' : 'Seguindo'}</Heading>
            <IconButton
              label="Fechar lista de pessoas"
              onPress={onClose}
              icon={<IconX size={22} color={c.text} />}
            />
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
            <AsyncState query={q}>
              {q.data?.map((person) => (
                <Pressable
                  key={person.id}
                  accessibilityRole="button"
                  accessibilityLabel={'Abrir perfil de ' + person.username}
                  onPress={() => {
                    onClose();
                    router.push(('/profile/' + encodeURIComponent(person.username)) as never);
                  }}
                  style={({ pressed }) => [
                    s.between,
                    {
                      minHeight: 76,
                      gap: 12,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderColor: c.border,
                      opacity: pressed ? 0.65 : 1,
                    },
                  ]}
                >
                  <Avatar name={person.username} uri={person.avatar_url} size={44} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ color: c.text, fontSize: 16, fontWeight: '700' }}>
                      {profileName(person)}
                    </Text>
                    <Text style={{ color: c.muted, fontSize: 14 }}>@{person.username}</Text>
                  </View>
                </Pressable>
              ))}
              {q.data?.length === 0 && (
                <Text style={{ color: c.muted, fontSize: 15, paddingVertical: 24 }}>
                  {type === 'followers'
                    ? 'Este perfil ainda não tem seguidores.'
                    : 'Este perfil ainda não segue ninguém.'}
                </Text>
              )}
            </AsyncState>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Profile({ username, own = false }: { username: string; own?: boolean }) {
  const { colors: c } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const me = useMe();
  const { isPreview, session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [peopleType, setPeopleType] = useState<'followers' | 'following' | null>(null);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeLanguage, setChallengeLanguage] = useState('TS');
  const [challengeNotice, setChallengeNotice] = useState('');
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
  const isOwner = own || user?.id === me.data?.id;
  const canParticipate = !!session && !isPreview;
  const posts = uniqueRows(
    q.data?.pages.flatMap((page) => (Array.isArray(page.posts) ? page.posts : page.posts.items)) ??
      []
  );
  const timeline = useInfiniteQuery({
    queryKey: ['profile', username, activeTab],
    initialPageParam: '',
    queryFn: ({ pageParam, signal }) =>
      api<Page<Post | ProfileReply>>(
        activeTab === 'replies'
          ? '/api/profile/' +
              encodeURIComponent(username) +
              '/replies?limit=10&cursor=' +
              encodeURIComponent(pageParam)
          : '/api/posts?likedBy=' +
              encodeURIComponent(username) +
              '&useCursor=true&limit=10&cursor=' +
              encodeURIComponent(pageParam),
        { signal }
      ),
    getNextPageParam: (page) => page.nextCursor || undefined,
    enabled: !!username && (activeTab === 'replies' || activeTab === 'likes'),
  });
  const timelineRows = uniqueRows(timeline.data?.pages.flatMap((page) => page.items) ?? []);
  const saved = useSavedReplies(me.data?.id, canParticipate && activeTab === 'replies');
  const follow = useMutation({
    mutationFn: () => send<{ following: boolean }>('/api/users/' + user!.id + '/follow'),
    onSuccess: (result) => {
      queryClient.setQueryData<typeof q.data>(
        ['profile', username],
        (current) =>
          current && {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              isFollowing: result.following,
              followers: Math.max(
                0,
                (page.followers ?? 0) +
                  (result.following === !!page.isFollowing ? 0 : result.following ? 1 : -1)
              ),
            })),
          }
      );
      void queryClient.invalidateQueries({ queryKey: ['profile', username] });
      void queryClient.invalidateQueries({ queryKey: ['profile-people'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
  const challenge = useMutation({
    mutationFn: () =>
      send<{ message?: string }>('/api/duels/request', {
        receiver_id: user!.id,
        language: challengeLanguage,
      }),
    onSuccess: (result) => {
      setChallengeNotice(result.message || 'Convite para duelo enviado.');
      void queryClient.invalidateQueries({ queryKey: ['duels'] });
    },
  });
  const refresh = () => {
    void q.refetch();
    if (activeTab === 'likes' || activeTab === 'replies') void timeline.refetch();
  };
  const menuItems = [
    { label: 'Itens salvos', onPress: () => router.push('/bookmarks') },
    { label: 'Ranking', onPress: () => router.push('/ranking') },
    { label: 'Minhas candidaturas', onPress: () => router.push('/applications') },
    { label: 'Configurações', onPress: () => router.push('/settings') },
    {
      label:
        me.data?.role === 'EVALUATOR' || me.data?.role === 'ADMIN'
          ? 'Área de avaliação'
          : 'Tornar-se avaliador',
      onPress: () => router.push('/evaluator'),
    },
    ...(['ADMIN', 'RECRUITER'].includes(me.data?.role ?? '')
      ? [{ label: 'Gerenciar empresas e vagas', onPress: () => router.push('/recruiter') }]
      : []),
    ...(me.data?.role === 'ADMIN'
      ? [{ label: 'Administração', onPress: () => router.push('/admin') }]
      : []),
  ];
  return (
    <Screen
      title={own ? 'Perfil' : '@' + username}
      back={!own}
      scroll={false}
      actions={isOwner ? <ActionMenu label="Opções da conta" items={menuItems} /> : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
          paddingBottom: Math.max(32, insets.bottom + 16),
        }}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching && !q.isFetchingNextPage}
            onRefresh={refresh}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
      >
        <AsyncState query={q}>
          {user && data && (
            <>
              <ProfileHero
                user={user}
                stats={data.stats}
                trails={data.trails ?? []}
                followers={data.followers ?? 0}
                following={data.following ?? 0}
                owner={isOwner}
                isFollowing={!!data.isFollowing}
                followPending={follow.isPending}
                followDisabled={!canParticipate}
                onFollow={() => follow.mutate()}
                onMessage={() =>
                  router.push(
                    ('/conversation/' +
                      user.id +
                      '?username=' +
                      encodeURIComponent(user.username)) as never
                  )
                }
                onChallenge={() => {
                  setChallengeNotice('');
                  challenge.reset();
                  setChallengeOpen(true);
                }}
                onShowFollowers={() => setPeopleType('followers')}
                onShowFollowing={() => setPeopleType('following')}
                feedback={follow.error ? errorMessage(follow.error) : undefined}
              />
              <View style={[s.tabs, { borderColor: c.border, backgroundColor: c.surface }]}>
                {tabs.map((tab) => (
                  <Pressable
                    key={tab.value}
                    accessibilityRole="tab"
                    accessibilityLabel={tab.label}
                    accessibilityState={{ selected: activeTab === tab.value }}
                    onPress={() => setActiveTab(tab.value)}
                    style={({ pressed }) => ({
                      width: '31.5%',
                      minHeight: 48,
                      paddingHorizontal: 4,
                      paddingVertical: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 12,
                      backgroundColor:
                        activeTab === tab.value ? c.primary : pressed ? c.elevated : 'transparent',
                    })}
                  >
                    <Text
                      style={{
                        color: activeTab === tab.value ? c.onPrimary : c.muted,
                        fontSize: 12,
                        fontWeight: '800',
                        textAlign: 'center',
                      }}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {activeTab === 'posts' && (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {!posts.length && <Empty label="Nenhuma publicação encontrada." />}
                  {q.hasNextPage && (
                    <View style={s.section}>
                      <Button
                        secondary
                        label="Carregar mais publicações"
                        busy={q.isFetchingNextPage}
                        onPress={() => void q.fetchNextPage()}
                      />
                    </View>
                  )}
                </>
              )}
              {(activeTab === 'replies' || activeTab === 'likes') && (
                <AsyncState query={timeline}>
                  {timelineRows.map((row) =>
                    activeTab === 'likes' ? (
                      <PostCard key={row.id} post={row as Post} />
                    ) : (
                      <ProfileReplyRow
                        key={row.id}
                        reply={row as ProfileReply}
                        savedIds={saved.ids}
                        saving={saved.save.isPending}
                        disabled={!canParticipate}
                        onSave={(id) => saved.save.mutate(id)}
                      />
                    )
                  )}
                  {!timelineRows.length && (
                    <Empty
                      label={
                        activeTab === 'replies'
                          ? 'Nenhuma resposta encontrada.'
                          : 'Nenhuma curtida encontrada.'
                      }
                    />
                  )}
                  {saved.save.error && (
                    <View style={s.section}>
                      <Label>{errorMessage(saved.save.error)}</Label>
                    </View>
                  )}
                  {timeline.hasNextPage && (
                    <View style={s.section}>
                      <Button
                        secondary
                        label={
                          activeTab === 'replies'
                            ? 'Carregar mais respostas'
                            : 'Carregar mais curtidas'
                        }
                        busy={timeline.isFetchingNextPage}
                        onPress={() => void timeline.fetchNextPage()}
                      />
                    </View>
                  )}
                </AsyncState>
              )}
              {activeTab === 'stats' && (
                <View style={s.section}>
                  <ProfileStatsSummary user={user} stats={data.stats} />
                </View>
              )}
              {activeTab === 'trails' && (
                <View style={s.section}>
                  <ProfileTrails trails={data.trails ?? []} />
                </View>
              )}
              {activeTab === 'badges' && (
                <View style={[s.section, { gap: 16 }]}>
                  <Heading>Conquistas</Heading>
                  {user.badges?.length ? (
                    user.badges.map((badge, i) => (
                      <View
                        key={badge.slug ?? i}
                        style={[s.badge, { backgroundColor: c.surface, borderColor: c.border }]}
                      >
                        <IconTrophy size={32} color={c.warning} />
                        <View style={{ flex: 1, gap: 5 }}>
                          <Text style={{ color: c.text, fontWeight: '800', fontSize: 16 }}>
                            {badge.label ?? badge.badge?.label}
                          </Text>
                          {badge.description && (
                            <Text style={{ color: c.muted, lineHeight: 20, fontSize: 13 }}>
                              {badge.description}
                            </Text>
                          )}
                          {badge.earned_at && (
                            <Text style={{ color: c.muted, fontSize: 12 }}>
                              Conquistada em {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Empty label="As conquistas aparecem conforme você progride." />
                  )}
                </View>
              )}
            </>
          )}
        </AsyncState>
      </ScrollView>
      {user && peopleType && (
        <PeopleSheet
          key={user.id + peopleType}
          userId={user.id}
          type={peopleType}
          onClose={() => setPeopleType(null)}
        />
      )}
      <Modal
        transparent
        visible={challengeOpen}
        animationType={reducedMotion ? 'none' : 'slide'}
        onRequestClose={() => {
          if (!challenge.isPending) setChallengeOpen(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar convite para duelo"
            disabled={challenge.isPending}
            onPress={() => setChallengeOpen(false)}
            style={absoluteFill}
          />
          <View
            accessibilityViewIsModal
            style={{
              maxWidth: 760,
              alignSelf: 'center',
              width: '100%',
              maxHeight: '90%',
              padding: 24,
              paddingBottom: Math.max(24, insets.bottom + 16),
              gap: 20,
              backgroundColor: c.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            <ScrollView contentContainerStyle={{ gap: 20 }} keyboardShouldPersistTaps="handled">
              <View style={s.between}>
                <Heading>Desafiar @{user?.username}</Heading>
                <IconButton
                  label="Fechar convite para duelo"
                  disabled={challenge.isPending}
                  onPress={() => setChallengeOpen(false)}
                  icon={<IconX size={22} color={c.text} />}
                />
              </View>
              <Label muted>Escolha a linguagem do duelo.</Label>
              <Choice
                options={[
                  { value: 'TS', label: 'TypeScript' },
                  { value: 'JS', label: 'JavaScript' },
                  { value: 'PYTHON', label: 'Python' },
                ]}
                value={challengeLanguage}
                onChange={(value) => {
                  setChallengeLanguage(value);
                  challenge.reset();
                  setChallengeNotice('');
                }}
              />
              {(challenge.error || challengeNotice) && (
                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    color: challenge.error ? c.danger : c.success,
                    fontSize: 14,
                    lineHeight: 21,
                  }}
                >
                  {challenge.error ? errorMessage(challenge.error) : challengeNotice}
                </Text>
              )}
              <Button
                label={challenge.isSuccess ? 'Convite enviado' : 'Enviar convite'}
                busy={challenge.isPending}
                disabled={!canParticipate || challenge.isSuccess}
                onPress={() => challenge.mutate()}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Empty({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        padding: 32,
        color: colors.muted,
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 22,
      }}
    >
      {label}
    </Text>
  );
}

function ProfileReplyRow({
  reply,
  savedIds,
  saving,
  disabled,
  onSave,
}: {
  reply: ProfileReply;
  savedIds: string[];
  saving: boolean;
  disabled: boolean;
  onSave: (id: string) => void;
}) {
  const { colors: c } = useTheme();
  const parent = reply.parent ?? reply.post;
  const postId = reply.post_id ?? reply.post?.id;
  if (!parent || !postId) return null;
  const open = () => router.push(('/post/' + postId) as never);
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: c.border,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir publicação original"
        onPress={open}
        style={{ flexDirection: 'row', gap: 10 }}
      >
        <View style={{ width: 40, alignItems: 'center' }}>
          <Avatar size={38} uri={parent.author.avatar_url} name={parent.author.username} />
          <View
            style={{ width: 1, flex: 1, minHeight: 26, backgroundColor: c.border, marginTop: 6 }}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0, paddingBottom: 16 }}>
          <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>
            {profileName(parent.author)}{' '}
            <Text style={{ color: c.muted, fontWeight: '400', fontSize: 12 }}>
              @{parent.author.username} · {timeLabel(parent.created_at)}
            </Text>
          </Text>
          <RichText body={parent.body.slice(0, 350)} inset={100} />
        </View>
      </Pressable>
      <ThreadAnswer
        answer={reply}
        postId={postId}
        isPostOwner={false}
        savedIds={savedIds}
        saving={saving}
        disabled={disabled}
        onReply={open}
        onToggleSaved={onSave}
      />
    </View>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  tabs: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 6,
    borderWidth: 2,
    borderRadius: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  section: { padding: 20 },
  badge: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    padding: 18,
    borderWidth: 2,
    borderRadius: 20,
  },
});
