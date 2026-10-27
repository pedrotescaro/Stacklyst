import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { LanguageLogo } from '~/components/LanguageLogo';
import { Avatar, Button, Heading } from '~/components/ui';
import {
  IconBolt,
  IconBrandGithub,
  IconCalendar,
  IconFlame,
  IconSchool,
  IconTarget,
  IconTrophy,
} from '~/components/icons';
import { Person } from '~/lib/types';
import { useTheme } from '~/theme';
import { readableColor, type PublicProfileAchievement } from '../../lib/profile-customization';
import { ProfileExtras, ProfileFlag, ProfileTitle } from './ProfileIdentity';
import { ProfileBanner } from './ProfileBanner';
import {
  languageMetadata,
  profileBannerColor,
  profileLevel,
  profileName,
  trailProgress,
} from './profile-model';

export interface ProfileTrail {
  language: string;
  xp: number;
  level: number;
}
export interface ProfileStats {
  answers_count: number;
  accepted_count: number;
  accuracy: number;
}

export function ProfileStatsSummary({ user, stats }: { user: Person; stats: ProfileStats }) {
  const { colors: c } = useTheme();
  const { width } = useWindowDimensions();
  const items = [
    {
      label: 'Dias de ofensiva',
      value: String(user.streak_days ?? 0),
      icon: IconFlame,
      color: c.warning,
    },
    {
      label: 'Total de XP',
      value: (user.total_xp ?? 0).toLocaleString('pt-BR'),
      icon: IconBolt,
      color: c.warning,
    },
    {
      label: 'Nível global',
      value: 'Nível ' + profileLevel(user.total_xp),
      icon: IconTrophy,
      color: c.success,
    },
    { label: 'Precisão', value: stats.accuracy + '%', icon: IconTarget, color: c.primary },
  ];
  return (
    <View style={{ gap: 12 }}>
      <Heading>Estatísticas</Heading>
      <Text style={{ color: c.muted, fontSize: 13, lineHeight: 20 }}>
        Um resumo verificável da prática e do domínio técnico deste perfil.
      </Text>
      <View style={s.wrap}>
        {items.map(({ label, value, icon: Icon, color }) => (
          <View
            key={label}
            style={[
              s.stat,
              {
                width: width >= 700 ? '23.5%' : '48%',
                borderColor: c.border,
                backgroundColor: c.surface,
              },
            ]}
          >
            <Icon size={29} color={color} strokeWidth={2} />
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>{value}</Text>
              <Text style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}>{label}</Text>
            </View>
          </View>
        ))}
      </View>
      {[
        { label: 'Respostas enviadas', value: stats.answers_count },
        { label: 'Respostas aceitas', value: stats.accepted_count },
      ].map((item) => (
        <View
          key={item.label}
          style={[s.answerStat, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          <Text style={{ flex: 1, color: c.muted, fontSize: 13 }}>{item.label}</Text>
          <Text style={{ color: c.text, fontSize: 19, fontWeight: '800' }}>
            {item.value.toLocaleString('pt-BR')}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ProfileTrails({
  trails,
  compact = false,
}: {
  trails: ProfileTrail[];
  compact?: boolean;
}) {
  const { colors: c } = useTheme();
  const started = trails.filter((trail) => trail.xp > 0);
  const displayed = compact ? started.slice(0, 3) : started;
  return (
    <View style={{ gap: 12 }}>
      <View style={s.between}>
        <View style={{ flex: 1 }}>
          <Heading>Trilhas de aprendizagem</Heading>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver trilhas"
          onPress={() => router.push('/learn')}
          style={s.textAction}
        >
          <Text style={{ color: c.primary, fontSize: 13, fontWeight: '800' }}>Ver trilhas</Text>
        </Pressable>
      </View>
      {displayed.map((trail) => {
        const metadata = languageMetadata[trail.language.toUpperCase()];
        const percent = trailProgress(trail);
        return (
          <View
            key={trail.language}
            style={[s.trail, { borderColor: c.border, backgroundColor: c.surface }]}
          >
            <LanguageLogo language={trail.language} size={38} />
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <View style={s.between}>
                <Text style={{ flex: 1, color: c.text, fontSize: 15, fontWeight: '800' }}>
                  {metadata?.label ?? trail.language}
                </Text>
                <Text style={{ color: c.muted, fontSize: 13 }}>Nível {trail.level}</Text>
              </View>
              <View
                style={{
                  height: 6,
                  backgroundColor: c.elevated,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: 6,
                    width: `${percent}%`,
                    backgroundColor: metadata?.color ?? c.primary,
                  }}
                />
              </View>
              <View style={s.between}>
                <Text style={{ color: c.muted, fontSize: 12 }}>
                  {trail.xp.toLocaleString('pt-BR')} XP
                </Text>
                <Text style={{ color: c.text, fontSize: 12, fontWeight: '700' }}>{percent}%</Text>
              </View>
            </View>
          </View>
        );
      })}
      {!displayed.length && (
        <Text style={{ paddingVertical: 20, color: c.muted, fontSize: 14, lineHeight: 22 }}>
          Comece uma trilha para exibir seu progresso aqui.
        </Text>
      )}
    </View>
  );
}

export function ProfileHero({
  user,
  stats,
  trails,
  followers,
  following,
  owner,
  isFollowing,
  followPending,
  followDisabled,
  onFollow,
  onMessage,
  onChallenge,
  onShowFollowers,
  onShowFollowing,
  feedback,
  achievements = [],
}: {
  user: Person;
  stats: ProfileStats;
  trails: ProfileTrail[];
  followers: number;
  following: number;
  owner: boolean;
  isFollowing: boolean;
  followPending: boolean;
  followDisabled: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onChallenge: () => void;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  feedback?: string;
  achievements?: PublicProfileAchievement[];
}) {
  const { colors: c } = useTheme();
  const { width } = useWindowDimensions();
  const [linkError, setLinkError] = useState('');
  const avatarSize = width >= 600 ? 190 : 158;
  const banner = profileBannerColor(user.username, user.avatar_config);
  const level = profileLevel(user.total_xp);
  const badgeColor =
    level >= 30
      ? '#ff4b4b'
      : level >= 20
        ? '#ffc800'
        : level >= 10
          ? '#ce82ff'
          : level >= 5
            ? '#58cc02'
            : '#1cb0f6';
  const joinedDate = user.created_at ? new Date(user.created_at) : null;
  const joined =
    joinedDate && !Number.isNaN(joinedDate.getTime())
      ? joinedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : null;
  const github =
    user.github_username && /^[a-zA-Z0-9_-]+$/.test(user.github_username)
      ? user.github_username
      : null;
  const started = trails.filter((trail) => trail.xp > 0).slice(0, 6);
  const preferences = user.customization?.preferences;
  const publicAchievements = achievements.length
    ? achievements
    : (user.customization?.achievements ?? []);
  const equippedTitle =
    publicAchievements.find((item) => item.id === preferences?.equippedTitleId) ||
    user.avatar_config?.profileStyle?.title;
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24, gap: 24 }}>
      <ProfileBanner
        banner={preferences?.banner}
        legacyImage={user.banner_url}
        fallbackColor={banner}
        height={width >= 600 ? 270 : 222}
      >
        <Avatar
          uri={user.avatar_url}
          name={user.username}
          size={avatarSize}
          frameId={preferences?.frameId}
          profileStyle={user.avatar_config?.profileStyle}
        />
      </ProfileBanner>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 6 }}>
          <View style={[s.wrap, { justifyContent: 'flex-start', alignItems: 'center', gap: 10 }]}>
            <Text
              accessibilityRole="header"
              style={{
                color: readableColor(preferences?.nameStyle.color, c.background, c.text),
                fontSize: 27,
                lineHeight: 34,
                fontWeight: preferences ? (preferences.nameStyle.bold ? '800' : '500') : '900',
                fontStyle: preferences?.nameStyle.italic ? 'italic' : 'normal',
                textDecorationLine: preferences?.nameStyle.underline ? 'underline' : 'none',
                flexShrink: 1,
              }}
            >
              {profileName(user)}
            </Text>
            <View
              accessibilityLabel={'Nível ' + level}
              style={{
                backgroundColor: badgeColor,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 7,
              }}
            >
              <Text style={{ color: '#12202c', fontSize: 11, fontWeight: '900' }}>Lvl {level}</Text>
            </View>
          </View>
          {(preferences?.flag || equippedTitle) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              {preferences?.flag && <ProfileFlag code={preferences.flag} />}{' '}
              {equippedTitle && <ProfileTitle achievement={equippedTitle} />}
            </View>
          )}
          <Text style={{ color: c.muted, fontSize: 15, fontWeight: '600' }}>@{user.username}</Text>
          {joined && (
            <View style={[s.inline, { marginTop: 3 }]}>
              <IconCalendar size={17} color={c.primary} />
              <Text style={{ flexShrink: 1, color: c.muted, fontSize: 13 }}>
                Por aqui desde {joined}
              </Text>
            </View>
          )}
        </View>
        <View style={[s.wrap, { justifyContent: 'flex-start', gap: 8 }]}>
          {owner ? (
            <>
              <Button
                secondary
                label="Editar perfil"
                onPress={() => router.push('/edit-profile')}
              />
              <Button
                secondary
                label="Personalizar perfil"
                onPress={() => router.push('/personalize' as never)}
              />
              <Button
                secondary
                label="Minhas conquistas"
                onPress={() => router.push('/achievements' as never)}
              />
            </>
          ) : (
            <>
              <Button
                secondary={isFollowing}
                busy={followPending}
                disabled={followDisabled}
                label={isFollowing ? 'Seguindo' : 'Seguir'}
                onPress={onFollow}
              />
              <Button secondary label="Mensagem" onPress={onMessage} />
              <Button secondary label="Desafiar" onPress={onChallenge} />
            </>
          )}
        </View>
        {!!feedback && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ color: c.danger, fontSize: 14, lineHeight: 21 }}
          >
            {feedback}
          </Text>
        )}
        <Text style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>
          {user.bio || 'Aprendendo, praticando e compartilhando código com a comunidade Stacklyst.'}
        </Text>
        <View style={[s.wrap, { columnGap: 16, rowGap: 0 }]}>
          {github && (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={'Abrir GitHub de ' + github}
              onPress={() => {
                setLinkError('');
                void Linking.openURL('https://github.com/' + github).catch(() =>
                  setLinkError('Não foi possível abrir o GitHub. Tente novamente.')
                );
              }}
              style={[s.inline, s.textAction]}
            >
              <IconBrandGithub size={18} color={c.primary} />
              <Text style={{ color: c.text, fontSize: 14, fontWeight: '600' }}>@{github}</Text>
            </Pressable>
          )}
          {user.institution && (
            <View style={[s.inline, { minHeight: 48, flexShrink: 1 }]}>
              <IconSchool size={18} color={c.primary} />
              <Text style={{ flexShrink: 1, color: c.muted, fontSize: 14 }}>
                {user.institution}
              </Text>
            </View>
          )}
          {user.pronouns && (
            <Text style={{ alignSelf: 'center', color: c.muted, fontSize: 14 }}>
              {user.pronouns}
            </Text>
          )}
        </View>
        {!!linkError && (
          <Text accessibilityLiveRegion="polite" style={{ color: c.danger }}>
            {linkError}
          </Text>
        )}
        <ProfileExtras preferences={preferences} achievements={publicAchievements} />
        <View style={[s.inline, { columnGap: 20, flexWrap: 'wrap' }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={following + ' seguindo'}
            onPress={onShowFollowing}
            style={s.textAction}
          >
            <Text style={{ color: c.muted, fontSize: 14 }}>
              <Text style={{ color: c.text, fontWeight: '800' }}>{following}</Text> seguindo
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={followers + ' seguidores'}
            onPress={onShowFollowers}
            style={s.textAction}
          >
            <Text style={{ color: c.muted, fontSize: 14 }}>
              <Text style={{ color: c.text, fontWeight: '800' }}>{followers}</Text> seguidores
            </Text>
          </Pressable>
        </View>
        {!!started.length && (
          <View
            accessibilityLabel="Linguagens das trilhas iniciadas"
            style={[s.wrap, { justifyContent: 'flex-start', gap: 10 }]}
          >
            {started.map((trail) => (
              <View
                key={trail.language}
                accessibilityLabel={
                  (languageMetadata[trail.language.toUpperCase()]?.label ?? trail.language) +
                  ', nível ' +
                  trail.level
                }
                style={{
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.surface,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 12,
                }}
              >
                <LanguageLogo language={trail.language} size={28} />
              </View>
            ))}
          </View>
        )}
      </View>
      <ProfileStatsSummary user={user} stats={stats} />
      <ProfileTrails trails={trails} compact />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  banner: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 26,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: '#00000033',
  },
  portrait: {
    overflow: 'hidden',
    backgroundColor: '#00000026',
    borderWidth: 6,
    borderColor: '#ffffff40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  answerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 2,
    borderRadius: 18,
  },
  trail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 20,
    padding: 16,
  },
  textAction: { minHeight: 48, justifyContent: 'center' },
});
